'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { performLogout } from '@/lib/auth-helpers'
import type { UserProfile } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import {
  getAvatarById,
  DEFAULT_AVATAR,
} from '@/lib/avatars'

import {
  registerUserSession,
  getLocalSessionId,
  setLocalSessionId,
  clearLocalSession,
} from '@/lib/session-manager'
import { SessionConflictModal } from '@/components/session-conflict-modal'
import {
  VALID_DISTRICTS,
  getDistrictCities,
  isValidDistrict,
  isValidCityForDistrict,
  getDefaultCityForDistrict,
  normalizeDistrict,
} from '@/data/districts'
import { ECONOMY_CONFIG } from '@/src/data/economy'

export type AuthLifecycleState =
  | 'AUTH_INITIALIZING'
  | 'AUTHENTICATED'
  | 'AUTH_UNAUTHENTICATED'
  | 'NETWORK_TEMPORARY_ERROR'
  | 'AUTH_ERROR_REAL'
  | 'FIRESTORE_TEMPORARY_ERROR'
  | 'SESSION_EXPIRED_REAL'

export type AuthState = {
  user: User | null
  authResolved: boolean
  authStatus: AuthLifecycleState
  authInitializationError: string | null
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
  needsDistrictSelection: boolean
  setNeedsDistrictSelection: (needs: boolean) => void
  retryProfile: () => void
}

const AuthContext = createContext<AuthState | null>(null)

/**
 * Função auxiliar para hidratar um perfil inicial a partir da cache local
 * para evitar qualquer ecrã em branco enquanto o Firestore responde.
 */
function getCachedInitialProfile(uid: string, fallbackName: string, fallbackEmail: string): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const savedCoins = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
    const savedName = localStorage.getItem('user_display_name') || fallbackName
    const savedDistrict = localStorage.getItem('user_district') || ''
    const savedCity = localStorage.getItem('user_city') || ''
    const savedAvatarId = localStorage.getItem('user_equipped_avatar_id') || localStorage.getItem('equipped_avatar_id') || DEFAULT_AVATAR.id
    const savedTitle = localStorage.getItem('equipped_title') || 'Noviço da Nação'

    const coinsVal = savedCoins && !isNaN(Number(savedCoins)) ? Number(savedCoins) : ECONOMY_CONFIG.INITIAL_BONUS_COINS
    const resolvedAvatar = getAvatarById(savedAvatarId)

    return {
      uid,
      email: fallbackEmail,
      displayName: savedName,
      username: savedName,
      district: savedDistrict,
      districtLocked: Boolean(savedDistrict),
      city: savedCity,
      cityLocked: Boolean(savedCity),
      representedDistrict: savedDistrict,
      representedCity: savedCity,
      equippedTitle: savedTitle,
      level: 1,
      xp: 0,
      coins: coinsVal,
      euros: coinsVal,
      photoURL: resolvedAvatar.image,
      streak: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalQuestions: 0,
      bestStreak: 0,
      unlockedAchievements: [],
      badges: ['novico'],
      inventory: {
        avatars: [resolvedAvatar.id],
        arenas: ['arena_1'],
        titles: ['tit_novico'],
        taunts: ['pack_basico'],
        frames: ['default'],
        utilities: { fiftyFifty: 0, freezeTime: 0, publicVote: 0 },
      },
      equipped: {
        avatar: resolvedAvatar.image,
        avatarId: resolvedAvatar.id,
        title: savedTitle,
        arena: 'arena_1',
      },
      consumables: { help5050: 0, freezeTime: 0, publicVote: 0 },
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthLifecycleState>('AUTH_INITIALIZING')
  const [authInitializationError, setAuthInitializationError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [needsDistrictSelection, setNeedsDistrictSelection] = useState(false)
  const [selectedDistrictInput, setSelectedDistrictInput] = useState('')
  const [selectedCityInput, setSelectedCityInput] = useState('')
  const [isSubmittingDistrict, setIsSubmittingDistrict] = useState(false)
  const [isSessionConflictOpen, setIsSessionConflictOpen] = useState(false)

  // Referências para controlo de listeners e retries sem re-render excessivo
  const snapshotUnsubRef = useRef<(() => void) | null>(null)
  const firestoreRetryCountRef = useRef(0)
  const firestoreRetryTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentUidRef = useRef<string | null>(null)

  const retryProfile = useCallback(() => {
    if (firestoreRetryTimerRef.current) {
      clearTimeout(firestoreRetryTimerRef.current)
      firestoreRetryTimerRef.current = null
    }
    firestoreRetryCountRef.current = 0
    if (user?.uid) {
      subscribeToUserProfile(user)
    }
  }, [user])

  // 1. Resiliência de Rede Passiva
  useEffect(() => {
    const handleOnline = () => {
      console.log('[AUTH] Ligação de rede restaurada.')
      setAuthStatus((prev) => (prev === 'NETWORK_TEMPORARY_ERROR' ? (user ? 'AUTHENTICATED' : 'AUTH_UNAUTHENTICATED') : prev))
      if (user?.uid && !profile) {
        subscribeToUserProfile(user)
      }
    }

    const handleOffline = () => {
      console.warn('[AUTH] Ligação de rede offline detetada. Sessão e estado preservados.')
      setAuthStatus('NETWORK_TEMPORARY_ERROR')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user, profile])

  // 2. Função segura de subscrição ao perfil Firestore com Silent Retry
  const subscribeToUserProfile = useCallback((currentUser: User) => {
    // Limpar listener anterior se existir
    if (snapshotUnsubRef.current) {
      snapshotUnsubRef.current()
      snapshotUnsubRef.current = null
    }

    currentUidRef.current = currentUser.uid
    const userDocRef = doc(db, 'users', currentUser.uid)

    // Hidratação instantânea da cache se ainda não houver perfil
    setProfile((prev) => {
      if (prev && prev.uid === currentUser.uid) return prev
      return getCachedInitialProfile(
        currentUser.uid,
        currentUser.displayName || currentUser.email?.split('@')[0] || 'Jogador',
        currentUser.email || ''
      )
    })

    console.log('[AUTH] A iniciar listener Firestore de perfil para UID:', currentUser.uid)

    try {
      const unsub = onSnapshot(
        userDocRef,
        (docSnap) => {
          firestoreRetryCountRef.current = 0
          if (firestoreRetryTimerRef.current) {
            clearTimeout(firestoreRetryTimerRef.current)
            firestoreRetryTimerRef.current = null
          }

          if (docSnap.exists()) {
            const data = docSnap.data()

            // Sincronização segura de ID de sessão única
            const remoteSessionId = data.currentSessionId
            const localSessionId = getLocalSessionId()
            if (!remoteSessionId) {
              void registerUserSession(currentUser)
            } else if (!localSessionId || remoteSessionId !== localSessionId) {
              setLocalSessionId(remoteSessionId)
            }

            const coinsVal = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : (typeof data.acordaCoins === 'number' ? data.acordaCoins : 100)
            const xpVal = typeof data.xp === 'number' && !isNaN(data.xp) ? Math.max(0, data.xp) : 0
            const levelVal = calculateLevelProgress(xpVal).currentLevel.level
            const nameVal = data.name || data.displayName || data.username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Jogador'

            // Validação territorial
            const rawDistrict = typeof data.district === 'string' ? data.district.trim() : typeof data.representedDistrict === 'string' ? data.representedDistrict.trim() : ''
            const isValidDist = isValidDistrict(rawDistrict)
            const districtVal = isValidDist ? (normalizeDistrict(rawDistrict) || rawDistrict) : ''
            const rawCity = typeof data.city === 'string' ? data.city.trim() : typeof data.representedCity === 'string' ? data.representedCity.trim() : ''
            const cityVal = rawCity && isValidCityForDistrict(districtVal, rawCity) ? rawCity : (districtVal ? getDefaultCityForDistrict(districtVal) : '')
            const districtLockedVal = Boolean(data.districtLocked && districtVal)
            const cityLockedVal = Boolean(data.cityLocked && cityVal)
            const needsDistrict = !districtVal || !isValidDist || !districtLockedVal
            setNeedsDistrictSelection(needsDistrict)

            const titleVal = data.title || data.equippedTitle || (data.equipped as any)?.title || 'Noviço da Nação'

            // Resolução do avatar
            const rawAvatarCandidate = data.avatarId || data.equippedAvatar || data.avatar || data.photoURL || currentUser.photoURL
            const resolvedAvatar = getAvatarById(rawAvatarCandidate)
            const avatarVal = resolvedAvatar.image
            const avatarIdVal = resolvedAvatar.id

            const loadedProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || data.email || '',
              displayName: nameVal,
              username: data.username || nameVal,
              district: districtVal,
              districtLocked: districtLockedVal,
              city: cityVal,
              cityLocked: cityLockedVal,
              representedDistrict: districtVal,
              representedCity: cityVal,
              equippedTitle: titleVal,
              level: levelVal,
              xp: xpVal,
              coins: coinsVal,
              euros: coinsVal,
              photoURL: avatarVal,
              streak: typeof data.streak === 'number' ? data.streak : 0,
              gamesPlayed: typeof data.gamesPlayed === 'number' ? data.gamesPlayed : (data.stats?.totalDuels || 0),
              wins: typeof data.wins === 'number' ? data.wins : (data.stats?.duelsWon || 0),
              losses: typeof data.losses === 'number' ? data.losses : Math.max(0, (data.gamesPlayed || 0) - (data.wins || 0)),
              questionsAnswered: typeof data.questionsAnswered === 'number' ? data.questionsAnswered : (data.totalQuestions || 0),
              correctAnswers: typeof data.correctAnswers === 'number' ? data.correctAnswers : 0,
              incorrectAnswers: typeof data.incorrectAnswers === 'number' ? data.incorrectAnswers : 0,
              totalQuestions: typeof data.totalQuestions === 'number' ? data.totalQuestions : 0,
              bestStreak: typeof data.bestStreak === 'number' ? data.bestStreak : 0,
              unlockedAchievements: Array.isArray(data.unlockedAchievements) ? data.unlockedAchievements : [],
              badges: Array.isArray(data.badges) ? data.badges : ['novico'],
              inventory: {
                ...(data.inventory || {}),
                avatars: Array.isArray(data.inventory?.avatars) ? data.inventory.avatars : [DEFAULT_AVATAR.id],
                arenas: Array.isArray(data.inventory?.arenas) ? data.inventory.arenas : ['arena_1'],
                titles: Array.isArray(data.inventory?.titles) ? data.inventory.titles : ['tit_novico'],
                taunts: Array.isArray(data.inventory?.taunts) ? data.inventory.taunts : ['pack_basico'],
                frames: Array.isArray(data.inventory?.frames) ? data.inventory.frames : ['default'],
                utilities: {
                  fiftyFifty: data.inventory?.utilities?.fiftyFifty ?? data.consumables?.help5050 ?? 0,
                  freezeTime: data.inventory?.utilities?.freezeTime ?? data.consumables?.freezeTime ?? 0,
                  publicVote: data.inventory?.utilities?.publicVote ?? data.consumables?.publicVote ?? 0,
                },
              },
              equipped: {
                ...(data.equipped || {}),
                avatar: avatarVal,
                avatarId: avatarIdVal,
                title: titleVal,
                arena: (data.equipped as any)?.arena || 'arena_1',
              },
              consumables: {
                help5050: data.consumables?.help5050 ?? data.inventory?.utilities?.fiftyFifty ?? 0,
                freezeTime: data.consumables?.freezeTime ?? data.inventory?.utilities?.freezeTime ?? 0,
                publicVote: data.consumables?.publicVote ?? data.inventory?.utilities?.publicVote ?? 0,
              },
            }

            setProfile(loadedProfile)
            setProfileLoading(false)
            setProfileError(null)
            setAuthStatus('AUTHENTICATED')

            // Cache local para restauração imediata em futuros carregamentos
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('user_coins', String(coinsVal))
                localStorage.setItem('user_euros', String(coinsVal))
                localStorage.setItem('user_display_name', nameVal)
                if (districtVal) {
                  localStorage.setItem('user_district', districtVal)
                  localStorage.setItem('user_represented_district', districtVal)
                }
                if (cityVal) {
                  localStorage.setItem('user_city', cityVal)
                  localStorage.setItem('user_represented_city', cityVal)
                }
                localStorage.setItem('user_equipped_avatar', avatarVal)
                localStorage.setItem('user_equipped_avatar_id', avatarIdVal)
                localStorage.setItem('equipped_avatar_id', avatarIdVal)
                localStorage.setItem('equipped_title', titleVal)
              } catch (storageErr) {
                console.warn('[AUTH] Storage local restrito:', storageErr)
              }
            }

            // Sincronização em background do publicProfiles (segura e não bloqueante)
            if (districtVal) {
              const publicProfileRef = doc(db, 'publicProfiles', currentUser.uid)
              setDoc(
                publicProfileRef,
                {
                  uid: currentUser.uid,
                  displayName: nameVal,
                  photoURL: avatarVal,
                  avatarId: avatarIdVal,
                  district: districtVal,
                  city: cityVal,
                  representedDistrict: districtVal,
                  representedCity: cityVal,
                  level: levelVal,
                  xp: xpVal,
                  equippedTitle: titleVal,
                  updatedAt: serverTimestamp(),
                },
                { merge: true },
              ).catch((syncErr) => console.warn('[AUTH] Aviso não-fatal ao sincronizar publicProfiles:', syncErr))
            }
          } else {
            // Novo Utilizador — Criar documento com defaults e merge seguro
            const fallbackName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Jogador'
            const fallbackAvatar = DEFAULT_AVATAR.image
            const fallbackAvatarId = DEFAULT_AVATAR.id

            const defaultProfileData = {
              uid: currentUser.uid,
              displayName: fallbackName,
              name: fallbackName,
              email: currentUser.email || '',
              photoURL: fallbackAvatar,
              avatar: fallbackAvatar,
              avatarId: fallbackAvatarId,
              equippedAvatar: fallbackAvatarId,
              district: '',
              districtLocked: false,
              level: 1,
              xp: 0,
              coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
              euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
              title: 'Noviço da Nação',
              equippedTitle: 'Noviço da Nação',
              equippedFrame: 'default',
              unlockedFrames: ['default'],
              unlockedAvatars: [fallbackAvatarId],
              unlockedAchievements: [],
              claimedAchievements: {},
              badges: ['novico'],
              inventory: {
                avatars: [fallbackAvatarId],
                arenas: ['arena_1'],
                titles: ['tit_novico'],
                taunts: ['pack_basico'],
                frames: ['default'],
                utilities: { fiftyFifty: 0, freezeTime: 0, publicVote: 0 },
              },
              equipped: {
                avatar: fallbackAvatar,
                avatarId: fallbackAvatarId,
                title: 'Noviço da Nação',
                arena: 'arena_1',
                frameId: 'default',
              },
              consumables: { help5050: 0, freezeTime: 0, publicVote: 0 },
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }

            setDoc(userDocRef, defaultProfileData, { merge: true }).catch((createErr) =>
              console.warn('[AUTH] Aviso ao criar documento inicial:', createErr)
            )

            setProfile({
              uid: currentUser.uid,
              displayName: fallbackName,
              email: currentUser.email || '',
              photoURL: fallbackAvatar,
              district: '',
              districtLocked: false,
              level: 1,
              xp: 0,
              coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
              euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
              streak: 0,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
              correctAnswers: 0,
              incorrectAnswers: 0,
              totalQuestions: 0,
              bestStreak: 0,
              unlockedAchievements: [],
              badges: ['novico'],
              equippedTitle: 'Noviço da Nação',
              inventory: {
                avatars: [fallbackAvatarId],
                arenas: ['arena_1'],
                titles: ['tit_novico'],
                taunts: ['pack_basico'],
                frames: ['default'],
                utilities: { fiftyFifty: 0, freezeTime: 0, publicVote: 0 },
              },
              equipped: {
                avatar: fallbackAvatar,
                title: 'Noviço da Nação',
                arena: 'arena_1',
              },
              consumables: { help5050: 0, freezeTime: 0, publicVote: 0 },
            })
            setProfileLoading(false)
            setNeedsDistrictSelection(true)
            setAuthStatus('AUTHENTICATED')
          }
        },
        (error) => {
          console.warn('[AUTH] Oscilação transitória no Firestore para UID:', currentUser.uid, error)
          setAuthStatus('FIRESTORE_TEMPORARY_ERROR')

          // Silent retry com backoff exponencial (1s, 2s, 4s, 8s)
          if (firestoreRetryCountRef.current < 4) {
            firestoreRetryCountRef.current += 1
            const delay = Math.min(8000, 1000 * Math.pow(2, firestoreRetryCountRef.current - 1))
            console.log(`[AUTH] A agendar retry silencioso do Firestore (${firestoreRetryCountRef.current}/4) em ${delay}ms`)
            firestoreRetryTimerRef.current = setTimeout(() => {
              if (currentUidRef.current === currentUser.uid) {
                subscribeToUserProfile(currentUser)
              }
            }, delay)
          } else {
            // Após múltiplos retries sem sucesso, mantém perfil em memória e sinaliza erro amigável sem logout
            setProfileError('Ligação momentaneamente lenta. O teu jogo continuará sincronizado.')
            setProfileLoading(false)
          }
        }
      )

      snapshotUnsubRef.current = unsub
    } catch (listenerErr) {
      console.warn('[AUTH] Erro ao iniciar listener Firestore:', listenerErr)
      setProfileLoading(false)
    }
  }, [])

  // 3. Listener Principal de Autenticação Firebase (Single Source of Truth)
  useEffect(() => {
    console.log('[AUTH] A inicializar listener onAuthStateChanged do Firebase...')

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (currentAuthUser) => {
        console.log('[AUTH] onAuthStateChanged emitiu estado:', currentAuthUser ? `UID: ${currentAuthUser.uid}` : 'Não autenticado')

        setUser(currentAuthUser)

        if (currentAuthUser) {
          setAuthStatus('AUTHENTICATED')
          setAuthInitializationError(null)
          subscribeToUserProfile(currentAuthUser)
        } else {
          // Utilizador não autenticado
          if (snapshotUnsubRef.current) {
            snapshotUnsubRef.current()
            snapshotUnsubRef.current = null
          }
          currentUidRef.current = null
          setProfile(null)
          setProfileLoading(false)
          setProfileError(null)
          setNeedsDistrictSelection(false)
          setAuthStatus('AUTH_UNAUTHENTICATED')
        }
      },
      (authErr) => {
        console.error('[AUTH] Erro crítico no Firebase Auth:', authErr)
        setAuthInitializationError(authErr?.message || 'Erro de autenticação')
        setAuthStatus('AUTH_ERROR_REAL')
        setProfileLoading(false)
      }
    )

    return () => {
      unsubscribeAuth()
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current()
        snapshotUnsubRef.current = null
      }
      if (firestoreRetryTimerRef.current) {
        clearTimeout(firestoreRetryTimerRef.current)
      }
    }
  }, [subscribeToUserProfile])

  const handleSessionConflictConfirm = useCallback(() => {
    setIsSessionConflictOpen(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/entrar'
    }
  }, [])

  const pathname = usePathname()
  const isGameOrProfileRoute = Boolean(
    pathname?.startsWith('/jogar') ||
    pathname?.startsWith('/perfil') ||
    pathname?.startsWith('/jogo')
  )
  const authResolved = authStatus !== 'AUTH_INITIALIZING'

  return (
    <AuthContext.Provider
      value={{
        user,
        authResolved,
        authStatus,
        authInitializationError,
        profile,
        profileLoading,
        profileError,
        needsDistrictSelection,
        setNeedsDistrictSelection,
        retryProfile,
      }}
    >
      {children}

      {/* MODAL DE SELEÇÃO DE DISTRITO APENAS PARA UTILIZADORES AUTENTICADOS EM /jogar OU /perfil */}
      {needsDistrictSelection && user && isGameOrProfileRoute && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              📍
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider font-display">
                Escolhe o teu Território
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Para representar a tua região no Ranking Nacional e nos Desafios Locais, escolhe o teu distrito e cidade. Esta escolha é{' '}
                <strong className="text-amber-400">única e definitiva</strong>.
              </p>
            </div>

            {/* Seletor de Distrito */}
            <div className="text-left space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Distrito de Representação *
              </label>
              <select
                id="select-district-input"
                value={selectedDistrictInput}
                onChange={(e) => {
                  const newDist = e.target.value
                  setSelectedDistrictInput(newDist)
                  const cities = getDistrictCities(newDist)
                  setSelectedCityInput(cities[0] || newDist)
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-3 px-4 text-white text-sm outline-none cursor-pointer"
              >
                <option value="" disabled>
                  Seleciona o teu distrito ou arquipélago...
                </option>
                {VALID_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Cidade */}
            <div className="text-left space-y-1">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Cidade / Município de Representação *
              </label>
              <select
                id="select-city-input"
                value={selectedCityInput}
                disabled={!selectedDistrictInput}
                onChange={(e) => setSelectedCityInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 px-4 text-white text-sm outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {selectedDistrictInput ? 'Seleciona a tua cidade...' : 'Escolhe primeiro o distrito acima...'}
                </option>
                {selectedDistrictInput &&
                  getDistrictCities(selectedDistrictInput).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="button"
              disabled={!selectedDistrictInput || !selectedCityInput || isSubmittingDistrict}
              onClick={async () => {
                const dist = selectedDistrictInput.trim()
                const city = selectedCityInput.trim() || getDefaultCityForDistrict(dist)
                if (!dist || !isValidDistrict(dist)) {
                  alert('Por favor seleciona um distrito válido!')
                  return
                }
                if (!city || !isValidCityForDistrict(dist, city)) {
                  alert('Por favor seleciona uma cidade válida para o distrito escolhido!')
                  return
                }

                setIsSubmittingDistrict(true)
                try {
                  await setDoc(
                    doc(db, 'users', user.uid),
                    {
                      district: dist,
                      city: city,
                      representedDistrict: dist,
                      representedCity: city,
                      districtLocked: true,
                      cityLocked: true,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  )

                  await setDoc(
                    doc(db, 'publicProfiles', user.uid),
                    {
                      district: dist,
                      city: city,
                      representedDistrict: dist,
                      representedCity: city,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  )

                  if (typeof window !== 'undefined') {
                    localStorage.setItem('user_district', dist)
                    localStorage.setItem('user_represented_district', dist)
                    localStorage.setItem('user_city', city)
                    localStorage.setItem('user_represented_city', city)
                  }

                  setNeedsDistrictSelection(false)
                  setProfile((prev) =>
                    prev
                      ? {
                          ...prev,
                          district: dist,
                          city: city,
                          representedDistrict: dist,
                          representedCity: city,
                          districtLocked: true,
                          cityLocked: true,
                        }
                      : null
                  )
                } catch (e) {
                  console.error('[AUTH] Erro ao gravar território:', e)
                  alert('Erro ao guardar território. Tenta novamente.')
                } finally {
                  setIsSubmittingDistrict(false)
                }
              }}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingDistrict ? 'A registar...' : 'Confirmar Território e Jogar →'}
            </button>
          </div>
        </div>
      )}

      <SessionConflictModal
        isOpen={isSessionConflictOpen}
        onConfirm={handleSessionConflictConfirm}
      />
    </AuthContext.Provider>
  )
}

const fallbackAuthState: AuthState = {
  user: null,
  authResolved: false,
  authStatus: 'AUTH_INITIALIZING',
  authInitializationError: null,
  profile: null,
  profileLoading: true,
  profileError: null,
  needsDistrictSelection: false,
  setNeedsDistrictSelection: () => {},
  retryProfile: () => {},
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  return context || fallbackAuthState
}
