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

        // 1. Ouvir atualizações em tempo real sem sobrescrever
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              const coinsVal = data.coins ?? data.euros ?? data.acordaCoins ?? 803845
              const xpVal = data.xp ?? 5980
              const levelVal = data.level ?? calculateLevelProgress(xpVal).currentLevel.level
              const nameVal = data.name || data.displayName || data.username || currentAuthUser.displayName || 'Riky Moreira'
              const districtVal = data.district || 'Vila Real'
              const titleVal = data.title || data.equippedTitle || (data.equipped as any)?.title || 'Membro Fundador'
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
                streak: data.streak ?? 7,
                gamesPlayed: data.gamesPlayed ?? 24,
                wins: data.wins ?? 18,
                losses: data.losses ?? 6,
                questionsAnswered: data.questionsAnswered ?? 180,
                correctAnswers: data.correctAnswers ?? 162,
                incorrectAnswers: data.incorrectAnswers ?? 18,
                totalQuestions: data.totalQuestions ?? 180,
                bestStreak: data.bestStreak ?? 12,
                unlockedAchievements: data.unlockedAchievements || ['first_win', 'streak_3', 'level_5'],
                badges: data.badges || ['founder', 'top_district'],
                inventory: data.inventory || {},
                equipped: data.equipped || {
                  avatar: avatarVal,
                  title: titleVal,
                  arena: 'arena_1',
                },
                consumables: data.consumables || { help5050: 5, freezeTime: 3 },
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
              const defaultProfileData = {
                uid: currentAuthUser.uid,
                displayName: currentAuthUser.displayName || 'Riky Moreira',
                name: currentAuthUser.displayName || 'Riky Moreira',
                email: currentAuthUser.email || '',
                photoURL: currentAuthUser.photoURL || '/images/avatars/guardiao-vulcanico.jpg',
                avatar: currentAuthUser.photoURL || '/images/avatars/guardiao-vulcanico.jpg',
                district: 'Vila Real',
                level: 6,
                xp: 5980,
                coins: 803845,
                euros: 803845,
                title: 'Membro Fundador',
                equippedTitle: 'Membro Fundador',
                streak: 7,
                gamesPlayed: 24,
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
                displayName: currentAuthUser.displayName || 'Riky Moreira',
                email: currentAuthUser.email || '',
                photoURL: currentAuthUser.photoURL || '/images/avatars/guardiao-vulcanico.jpg',
                district: 'Vila Real',
                level: 6,
                xp: 5980,
                coins: 803845,
                euros: 803845,
                streak: 7,
                gamesPlayed: 24,
                wins: 18,
                losses: 6,
                correctAnswers: 162,
                incorrectAnswers: 18,
                totalQuestions: 180,
                bestStreak: 12,
                unlockedAchievements: ['first_win', 'streak_3', 'level_5'],
                badges: ['founder', 'top_district'],
                equippedTitle: 'Membro Fundador',
                inventory: {},
                equipped: {
                  avatar: '/images/avatars/guardiao-vulcanico.jpg',
                  title: 'Membro Fundador',
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
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.')
  }
  return context
}
