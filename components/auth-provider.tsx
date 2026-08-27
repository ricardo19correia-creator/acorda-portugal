'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { performLogout } from '@/lib/auth-helpers'
import type { UserProfile } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import {
  getAvatarById,
  getAvatarImage,
  normalizeAvatarId,
  DEFAULT_AVATAR,
  REAL_AVATARS,
} from '@/lib/avatars'

import {
  registerUserSession,
  getLocalSessionId,
  setLocalSessionId,
  clearLocalSession,
} from '@/lib/session-manager'
import { SessionConflictModal } from '@/components/session-conflict-modal'
import { VALID_DISTRICTS } from '@/data/districts'
import { ECONOMY_CONFIG } from '@/src/data/economy'
import { ensureBotsInitializedClientSide } from '@/lib/bot-network/client-bot-sync'

export type AuthState = {
  user: User | null
  authResolved: boolean
  authInitializationError: string | null
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
  needsDistrictSelection: boolean
  setNeedsDistrictSelection: (needs: boolean) => void
  retryProfile: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [authInitializationError, setAuthInitializationError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetry, setProfileRetry] = useState(0)
  const [needsDistrictSelection, setNeedsDistrictSelection] = useState(false)
  const [selectedDistrictInput, setSelectedDistrictInput] = useState('')
  const [isSubmittingDistrict, setIsSubmittingDistrict] = useState(false)
  const [isSessionConflictOpen, setIsSessionConflictOpen] = useState(false)

  const retryProfile = useCallback(() => setProfileRetry((current) => current + 1), [])

  const logout = useCallback(async (redirectUrl = '/') => {
    try {
      clearLocalSession()
      await performLogout(redirectUrl)
    } catch (err) {
      console.error('[AUTH] Erro ao terminar sessão:', err)
      window.location.href = redirectUrl
    }
  }, [])

  useEffect(() => {
    ensureBotsInitializedClientSide().catch(() => {})
  }, [])

  // BLINDAGEM DO LISTENER DE AUTENTICAÇÃO E FIRESTORE
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentAuthUser) => {
      setUser(currentAuthUser)
      setAuthResolved(true)

      if (currentAuthUser) {
        setProfileLoading(true)
        const userDocRef = doc(db, 'users', currentAuthUser.uid)

        // 1. Ouvir atualizações em tempo real sem sobrescrever dados
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()

              // Verificação de Sessão Única Ativa (Single Active Session)
              const remoteSessionId = data.currentSessionId
              const localSessionId = getLocalSessionId()

              if (!remoteSessionId) {
                // Primeira sessão ou migração: registar sessão atual
                void registerUserSession(currentAuthUser)
              } else if (!localSessionId) {
                // Sessão local ainda não gravada (ex: refresh ou login direto): adotar a sessão remota
                setLocalSessionId(remoteSessionId)
              } else if (remoteSessionId !== localSessionId) {
                // Conflito de sessão detetado: outro dispositivo/navegador iniciou sessão
                console.warn('[SESSION CONFLICT] Sessão sobreposta por outro login:', {
                  remote: remoteSessionId,
                  local: localSessionId,
                })
                clearLocalSession()
                setIsSessionConflictOpen(true)
                try {
                  await auth.signOut()
                } catch (e) {}
                setProfile(null)
                setProfileLoading(false)
                return
              }
              const coinsVal = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : (typeof data.acordaCoins === 'number' ? data.acordaCoins : 100)
              const xpVal = typeof data.xp === 'number' ? data.xp : 0
              const levelVal = typeof data.level === 'number' ? data.level : calculateLevelProgress(xpVal).currentLevel.level
              const nameVal = data.name || data.displayName || data.username || currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Jogador'
              
              // Verificação estrita de validade do distrito nos 20 distritos oficiais
              const rawDistrict = typeof data.district === 'string' ? data.district.trim() : ''
              const isValidDistrict = VALID_DISTRICTS.includes(rawDistrict as any)
              const districtVal = isValidDistrict ? rawDistrict : ''
              const districtLockedVal = Boolean(data.districtLocked && isValidDistrict)
              const needsDistrict = !districtVal || !isValidDistrict || !districtLockedVal
              setNeedsDistrictSelection(needsDistrict)

              const titleVal = data.title || data.equippedTitle || (data.equipped as any)?.title || 'Noviço da Nação'
              
              // Resolução canónica e migração transparente dos 5 avatares reais
              const rawAvatarCandidate = data.avatarId || data.equippedAvatar || data.avatar || data.photoURL || currentAuthUser.photoURL
              const resolvedAvatar = getAvatarById(rawAvatarCandidate)
              const avatarVal = resolvedAvatar.image
              const avatarIdVal = resolvedAvatar.id

              const loadedProfile: UserProfile = {
                uid: currentAuthUser.uid,
                email: currentAuthUser.email || data.email || '',
                displayName: nameVal,
                username: data.username || nameVal,
                district: districtVal,
                districtLocked: districtLockedVal,
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

              if (typeof window !== 'undefined') {
                localStorage.setItem('user_coins', String(coinsVal))
                localStorage.setItem('user_euros', String(coinsVal))
                localStorage.setItem('user_display_name', nameVal)
                if (districtVal) {
                  localStorage.setItem('user_district', districtVal)
                } else {
                  localStorage.removeItem('user_district')
                }
                localStorage.setItem('user_equipped_avatar', avatarVal)
                localStorage.setItem('user_equipped_avatar_id', avatarIdVal)
                localStorage.setItem('equipped_avatar_id', avatarIdVal)
                localStorage.setItem('equipped_title', titleVal)
              }

              // Sincronizar perfil público para ranking nacional se tiver distrito definido
              if (districtVal) {
                try {
                  const publicProfileRef = doc(db, 'publicProfiles', currentAuthUser.uid)
                  await setDoc(
                    publicProfileRef,
                    {
                      uid: currentAuthUser.uid,
                      displayName: nameVal,
                      photoURL: avatarVal,
                      avatarId: avatarIdVal,
                      district: districtVal,
                      level: levelVal,
                      xp: xpVal,
                      equippedTitle: titleVal,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true },
                  )
                } catch (syncErr) {
                  console.warn('[AUTH] Aviso ao sincronizar publicProfiles:', syncErr)
                }
              }
            } else {
              // 2. Criar apenas se o documento REALMENTE não existir, USANDO MERGE
              const fallbackName = currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Jogador'
              const fallbackAvatar = DEFAULT_AVATAR.image
              const fallbackAvatarId = DEFAULT_AVATAR.id

              const defaultProfileData = {
                uid: currentAuthUser.uid,
                displayName: fallbackName,
                name: fallbackName,
                email: currentAuthUser.email || '',
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
                  utilities: {
                    fiftyFifty: 0,
                    freezeTime: 0,
                    publicVote: 0,
                  },
                },
                equipped: {
                  avatar: fallbackAvatar,
                  avatarId: fallbackAvatarId,
                  title: 'Noviço da Nação',
                  arena: 'arena_1',
                  frameId: 'default',
                },
                consumables: {
                  help5050: 0,
                  freezeTime: 0,
                  publicVote: 0,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }

              try {
                await setDoc(userDocRef, defaultProfileData, { merge: true })
              } catch (createErr) {
                console.warn('[AUTH] Erro ao criar documento inicial com merge:', createErr)
              }

              if (typeof window !== 'undefined') {
                localStorage.setItem('user_coins', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
                localStorage.setItem('user_euros', String(ECONOMY_CONFIG.INITIAL_BONUS_COINS))
                localStorage.setItem('user_display_name', fallbackName)
                localStorage.removeItem('user_district')
                localStorage.setItem('user_equipped_avatar', fallbackAvatar)
                localStorage.setItem('user_equipped_avatar_id', fallbackAvatarId)
                localStorage.setItem('equipped_avatar_id', fallbackAvatarId)
                localStorage.setItem('equipped_title', 'Noviço da Nação')
              }

              setProfile({
                uid: currentAuthUser.uid,
                displayName: fallbackName,
                email: currentAuthUser.email || '',
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
                  utilities: {
                    fiftyFifty: 0,
                    freezeTime: 0,
                    publicVote: 0,
                  },
                },
                equipped: {
                  avatar: fallbackAvatar,
                  title: 'Noviço da Nação',
                  arena: 'arena_1',
                },
                consumables: {
                  help5050: 0,
                  freezeTime: 0,
                  publicVote: 0,
                },
              })
              setProfileLoading(false)
              setNeedsDistrictSelection(true)
            }
          },
          (error) => {
            console.error('Erro no listener de dados do utilizador:', error)
            setProfileError('Não foi possível carregar o teu perfil.')
            setProfileLoading(false)
          },
        )
      } else {
        if (unsubscribeSnapshot) unsubscribeSnapshot()
        setProfile(null)
        setProfileLoading(false)
        setProfileError(null)
        setNeedsDistrictSelection(false)
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [profileRetry])

  const handleSessionConflictConfirm = useCallback(() => {
    setIsSessionConflictOpen(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/entrar'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        authResolved,
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

      {/* BLOQUEIO GLOBAL NO APP WRAPPER: MODAL DE SELEÇÃO OBRIGATÓRIA DE DISTRITO */}
      {needsDistrictSelection && user && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              📍
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider font-display">
                Escolhe o teu Distrito
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Para representar a tua região no Ranking Nacional, seleciona a tua origem. Esta escolha é{' '}
                <strong className="text-amber-400">única e definitiva</strong>.
              </p>
            </div>

            <select
              id="select-district-input"
              value={selectedDistrictInput}
              onChange={(e) => setSelectedDistrictInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl py-3.5 px-4 text-white text-sm outline-none cursor-pointer"
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

            <button
              type="button"
              disabled={!selectedDistrictInput || isSubmittingDistrict}
              onClick={async () => {
                const select = document.getElementById('select-district-input') as HTMLSelectElement
                const val = select?.value || selectedDistrictInput
                if (!val || !VALID_DISTRICTS.includes(val as any)) {
                  alert('Por favor seleciona um distrito!')
                  return
                }

                setIsSubmittingDistrict(true)
                try {
                  // Atualiza no Firestore
                  await setDoc(
                    doc(db, 'users', user.uid),
                    {
                      district: val,
                      districtLocked: true,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  )

                  await setDoc(
                    doc(db, 'publicProfiles', user.uid),
                    {
                      district: val,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  )

                  if (typeof window !== 'undefined') {
                    localStorage.setItem('user_district', val)
                  }

                  // Atualiza estado local
                  setNeedsDistrictSelection(false)
                  setProfile((prev) => (prev ? { ...prev, district: val, districtLocked: true } : null))
                } catch (e) {
                  console.error('[AUTH] Erro ao gravar distrito:', e)
                  alert('Erro ao guardar distrito. Tenta novamente.')
                } finally {
                  setIsSubmittingDistrict(false)
                }
              }}
              className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingDistrict ? 'A registar...' : 'Confirmar Distrito e Jogar →'}
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

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
