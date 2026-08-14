'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'

type AuthState = {
  user: User | null
  authResolved: boolean
  redirectAuthError: unknown | null
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
  retryProfile: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const FIRESTORE_TIMEOUT_MS = 10_000

function withFirestoreTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${operation} excedeu o tempo limite.`))
    }, FIRESTORE_TIMEOUT_MS)

    promise.then(
      (value) => {
        clearTimeout(timeoutId)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timeoutId)
        reject(error)
      },
    )
  })
}

function createDefaultUserProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Jogador',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    district: 'Vila Real',
    level: 1,
    xp: 0,
    euros: 100,
    streak: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestStreak: 0,
    unlockedAchievements: [],
    badges: [],
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
 * The single Firebase Auth subscription for the application. Components read
 * this state instead of creating their own listeners, so they always agree on
 * whether a session has been restored.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [redirectAuthError, setRedirectAuthError] = useState<unknown | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetry, setProfileRetry] = useState(0)

  const retryProfile = useCallback(() => setProfileRetry((current) => current + 1), [])

  // A redirect result must be consumed once for the whole app. Keeping this in
  // the global AuthProvider avoids multiple ProfilePanel instances racing to
  // consume the same Google redirect response.
  useEffect(() => {
    let isMounted = true

    void getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.info('Firebase Auth: login Google por redirect concluído.', {
            providerId: result.providerId,
            userId: result.user.uid,
          })
        }
      })
      .catch((error: unknown) => {
        const firebaseError = error as { code?: unknown; message?: unknown }
        console.error('Erro Firebase Auth (google-redirect):', {
          code: firebaseError.code,
          message: firebaseError.message,
          error,
        })
        if (isMounted) setRedirectAuthError(error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthResolved(true)
      },
      (error) => {
        console.error('Erro ao verificar a autenticação:', error)
        setUser(null)
        setAuthResolved(true)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!authResolved) {
      return
    }

    let cancelled = false

    if (!user) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      return
    }

    const loadProfile = async () => {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(true)

      try {
        const userRef = doc(db, 'users', user.uid)
        const snapshot = await withFirestoreTimeout(getDoc(userRef), 'A leitura do perfil')
        let nextProfile: UserProfile

        if (snapshot.exists()) {
          // Merge older documents with the current schema so every consumer
          // receives a complete UserProfile.
          nextProfile = { ...createDefaultUserProfile(user), ...snapshot.data(), uid: user.uid } as UserProfile
        } else {
          nextProfile = createDefaultUserProfile(user)
          await withFirestoreTimeout(setDoc(userRef, nextProfile), 'A criação do perfil')
        }

        if (!cancelled) {
          setProfile(nextProfile)
        }
      } catch (error) {
        console.error('Erro Firestore ao sincronizar o perfil:', { userId: user.uid, error })
        if (!cancelled) {
          setProfileError(profileErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [authResolved, user, profileRetry])

  return <AuthContext.Provider value={{ user, authResolved, redirectAuthError, profile, profileLoading, profileError, retryProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const state = useContext(AuthContext)

  if (!state) {
    throw new Error('useAuth tem de ser utilizado dentro de AuthProvider.')
  }

  return state
}
