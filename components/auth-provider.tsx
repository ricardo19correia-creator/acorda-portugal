'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { performLogout } from '@/lib/auth-helpers'
import type { UserProfile } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'

export type AuthState = {
  user: User | null
  authResolved: boolean
  authInitializationError: string | null
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
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

  const retryProfile = useCallback(() => setProfileRetry((current) => current + 1), [])

  const logout = useCallback(async (redirectUrl = '/') => {
    try {
      await performLogout(redirectUrl)
    } catch (err) {
      console.error('[AUTH] Erro ao terminar sessão:', err)
      window.location.href = redirectUrl
    }
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
              const coinsVal = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : (typeof data.acordaCoins === 'number' ? data.acordaCoins : 100)
              const xpVal = typeof data.xp === 'number' ? data.xp : 0
              const levelVal = typeof data.level === 'number' ? data.level : calculateLevelProgress(xpVal).currentLevel.level
              const nameVal = data.name || data.displayName || data.username || currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Jogador'
              const districtVal = data.district || 'Portugal'
              const titleVal = data.title || data.equippedTitle || (data.equipped as any)?.title || 'Noviço da Nação'
              const avatarVal = data.avatar || data.photoURL || currentAuthUser.photoURL || '/images/avatars/guardiao-vulcanico.jpg'

              const loadedProfile: UserProfile = {
                uid: currentAuthUser.uid,
                email: currentAuthUser.email || data.email || '',
                displayName: nameVal,
                username: data.username || nameVal,
                district: districtVal,
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
                inventory: data.inventory || {},
                equipped: data.equipped || {
                  avatar: avatarVal,
                  title: titleVal,
                  arena: 'arena_1',
                },
                consumables: data.consumables || {
                  help5050: data.inventory?.utilities?.fiftyFifty || 0,
                  freezeTime: data.inventory?.utilities?.freezeTime || 0,
                },
              }

              setProfile(loadedProfile)
              setProfileLoading(false)
              setProfileError(null)

              if (typeof window !== 'undefined') {
                localStorage.setItem('user_coins', String(coinsVal))
                localStorage.setItem('user_euros', String(coinsVal))
                localStorage.setItem('user_display_name', nameVal)
                localStorage.setItem('user_district', districtVal)
                localStorage.setItem('user_equipped_avatar', avatarVal)
                localStorage.setItem('equipped_title', titleVal)
              }

              // Sincronizar perfil público para ranking nacional
              try {
                const publicProfileRef = doc(db, 'publicProfiles', currentAuthUser.uid)
                await setDoc(
                  publicProfileRef,
                  {
                    uid: currentAuthUser.uid,
                    displayName: nameVal,
                    photoURL: avatarVal,
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
            } else {
              // 2. Criar apenas se o documento REALMENTE não existir, USANDO MERGE
              const fallbackName = currentAuthUser.displayName || currentAuthUser.email?.split('@')[0] || 'Jogador'
              const fallbackAvatar = currentAuthUser.photoURL || '/images/avatars/guardiao-vulcanico.jpg'

              const defaultProfileData = {
                uid: currentAuthUser.uid,
                displayName: fallbackName,
                name: fallbackName,
                email: currentAuthUser.email || '',
                photoURL: fallbackAvatar,
                avatar: fallbackAvatar,
                district: 'Portugal',
                level: 1,
                xp: 0,
                coins: 100,
                euros: 100,
                title: 'Noviço da Nação',
                equippedTitle: 'Noviço da Nação',
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
                inventory: {
                  avatars: ['guardiao-vulcanico'],
                  arenas: ['arena_1'],
                  titles: ['tit_novico'],
                  taunts: ['pack_basico'],
                },
                equipped: {
                  avatar: fallbackAvatar,
                  title: 'Noviço da Nação',
                  arena: 'arena_1',
                },
                consumables: { help5050: 3, freezeTime: 2 },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }

              try {
                await setDoc(userDocRef, defaultProfileData, { merge: true })
              } catch (createErr) {
                console.warn('[AUTH] Erro ao criar documento inicial com merge:', createErr)
              }

              setProfile({
                uid: currentAuthUser.uid,
                displayName: fallbackName,
                email: currentAuthUser.email || '',
                photoURL: fallbackAvatar,
                district: 'Portugal',
                level: 1,
                xp: 0,
                coins: 100,
                euros: 100,
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
                  avatars: ['guardiao-vulcanico'],
                  arenas: ['arena_1'],
                  titles: ['tit_novico'],
                  taunts: ['pack_basico'],
                },
                equipped: {
                  avatar: fallbackAvatar,
                  title: 'Noviço da Nação',
                  arena: 'arena_1',
                },
              })
              setProfileLoading(false)
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
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [profileRetry])

  return (
    <AuthContext.Provider
      value={{
        user,
        authResolved,
        authInitializationError,
        profile,
        profileLoading,
        profileError,
        retryProfile,
      }}
    >
      {children}
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
