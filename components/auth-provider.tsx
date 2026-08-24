'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getRedirectResult, onIdTokenChanged, browserPopupRedirectResolver, type IdTokenResult, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, type Unsubscribe } from 'firebase/firestore'
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
const AUTH_RESOLUTION_TIMEOUT_MS = 12_000

function createDefaultUserProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Jogador',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '/images/avatars/guardiao-vulcanico.jpg',
    district: 'Vila Real',
    level: 1,
    xp: 0,
    euros: 0,
    coins: 0,
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
    badges: [],
    equipped: {
      avatar: '/images/avatars/guardiao-vulcanico.jpg',
      title: 'Membro Fundador',
      arena: 'arena_1',
    },
    equippedTitle: 'Membro Fundador',
  }
}

function profileErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: unknown; message?: unknown }
  const code = typeof firebaseError.code === 'string' ? firebaseError.code : ''
  const detail = code || (typeof firebaseError.message === 'string' ? firebaseError.message : 'erro desconhecido')

  if (code === 'permission-denied') {
    return `O Firestore recusou o acesso ao teu perfil (permission-denied). [Firebase: ${detail}]`
  }

  return `Não foi possível carregar o teu perfil no Firestore. [Firebase: ${detail}]`
}

/**
 * The single Firebase Authentication subscription for the application.
 * Manages real user identity and Firestore profile synchronization in real-time.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [authInitializationError, setAuthInitializationError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
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

  // 1. Firebase Auth state listener
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | undefined

    const resolutionTimeout = window.setTimeout(() => {
      if (!isMounted) return
      setAuthResolved((resolved) => {
        if (!resolved) {
          console.warn('[AUTH DIAGNOSTIC] Timeout ao aguardar autenticação inicial do Firebase.')
          return true
        }
        return resolved
      })
    }, AUTH_RESOLUTION_TIMEOUT_MS)

    try {
      // Process redirect login result if any
      getRedirectResult(auth, browserPopupRedirectResolver).catch((redirectError) => {
        console.warn('[AUTH DIAGNOSTIC] Aviso getRedirectResult:', redirectError)
      })

      unsubscribe = onIdTokenChanged(
        auth,
        (currentAuthUser) => {
          if (!isMounted) return
          window.clearTimeout(resolutionTimeout)
          setUser(currentAuthUser)
          setAuthInitializationError(null)
          setAuthResolved(true)
        },
        (error) => {
          if (!isMounted) return
          window.clearTimeout(resolutionTimeout)
          const detail = typeof error?.message === 'string' ? error.message : 'erro de autenticação'
          setAuthInitializationError(`Não foi possível verificar a sessão no Firebase Authentication. [${detail}]`)
          setUser(null)
          setAuthResolved(true)
        },
      )
    } catch (error) {
      window.clearTimeout(resolutionTimeout)
      if (isMounted) {
        setAuthInitializationError('Não foi possível iniciar Firebase Authentication.')
        setUser(null)
        setAuthResolved(true)
      }
    }

    return () => {
      isMounted = false
      window.clearTimeout(resolutionTimeout)
      unsubscribe?.()
    }
  }, [])

  // 2. SUBSCRIÇÃO EM TEMPO REAL CENTRAL (Firestore onSnapshot)
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError(null)
      return
    }

    setProfileLoading(true)
    let isMounted = true
    const userDocRef = doc(db, 'users', user.uid)

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (!isMounted) return

        if (docSnap.exists()) {
          const userData = docSnap.data()
          const liveBalance = userData.coins ?? userData.euros ?? userData.acordaCoins ?? 0
          const liveXp = userData.xp ?? 0
          const liveLevel = userData.level ?? calculateLevelProgress(liveXp).currentLevel.level

          const liveProfile: UserProfile = {
            uid: user.uid,
            displayName: userData.displayName || userData.username || userData.name || user.displayName || 'Jogador',
            email: user.email || userData.email || '',
            photoURL: userData.photoURL || userData.avatar || user.photoURL || '/images/avatars/guardiao-vulcanico.jpg',
            district: userData.district || 'Portugal',
            level: liveLevel,
            xp: liveXp,
            coins: liveBalance,
            euros: liveBalance,
            streak: userData.streak ?? 0,
            gamesPlayed: userData.gamesPlayed ?? 0,
            wins: userData.wins ?? 0,
            losses: userData.losses ?? 0,
            questionsAnswered: userData.questionsAnswered ?? 0,
            correctAnswers: userData.correctAnswers ?? 0,
            incorrectAnswers: userData.incorrectAnswers ?? 0,
            totalQuestions: userData.totalQuestions ?? 0,
            bestStreak: userData.bestStreak ?? 0,
            unlockedAchievements: userData.unlockedAchievements || [],
            badges: userData.badges || [],
            equipped: userData.equipped || {},
            equippedTitle: userData.equippedTitle || userData.title || (userData.equipped as any)?.title || 'Membro Fundador',
            inventory: userData.inventory || {},
          }

          setProfile(liveProfile)
          setProfileLoading(false)
          setProfileError(null)

          if (typeof window !== 'undefined') {
            localStorage.setItem('user_coins', String(liveBalance))
            localStorage.setItem('user_euros', String(liveBalance))
            localStorage.setItem('user_display_name', liveProfile.displayName)
            localStorage.setItem('user_district', liveProfile.district)
            if (liveProfile.photoURL) localStorage.setItem('user_equipped_avatar', liveProfile.photoURL)
            if (liveProfile.equippedTitle) localStorage.setItem('equipped_title', liveProfile.equippedTitle)
          }

          // Sincronizar publicProfiles para rankings nacionais
          try {
            const publicProfileRef = doc(db, 'publicProfiles', user.uid)
            await setDoc(
              publicProfileRef,
              {
                uid: user.uid,
                displayName: liveProfile.displayName,
                photoURL: liveProfile.photoURL || null,
                district: liveProfile.district,
                level: liveProfile.level,
                xp: liveProfile.xp,
                equippedTitle: liveProfile.equippedTitle,
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            )
          } catch (syncErr) {
            console.warn('[AUTH] Aviso ao sincronizar publicProfiles:', syncErr)
          }
        } else {
          // Documento não existe ainda -> cria perfil padrão no Firestore
          const defaultProf: UserProfile = {
            ...createDefaultUserProfile(user),
            uid: user.uid,
          }
          try {
            await setDoc(userDocRef, defaultProf, { merge: true })
          } catch (createErr) {
            console.warn('[AUTH] Erro ao criar documento inicial no Firestore:', createErr)
          }
          if (isMounted) {
            setProfile(defaultProf)
            setProfileLoading(false)
          }
        }
      },
      (error) => {
        console.error('Erro no listener de dados do utilizador:', error)
        if (isMounted) {
          setProfileError(profileErrorMessage(error))
          setProfileLoading(false)
        }
      },
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [user?.uid, profileRetry])

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
