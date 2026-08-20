'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getRedirectResult, onIdTokenChanged, browserPopupRedirectResolver, type IdTokenResult, type User } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'

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
const FIRESTORE_TIMEOUT_MS = 10_000
const AUTH_RESOLUTION_TIMEOUT_MS = 12_000

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
    incorrectAnswers: 0,
    totalQuestions: 0,
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

function getProfileAuthDiagnostic(user: User, tokenResult?: IdTokenResult, hasIdToken?: boolean) {
  const currentUser = auth.currentUser

  return {
    useAuthUserUid: user.uid,
    authCurrentUserUid: currentUser?.uid ?? null,
    authCurrentUserEmail: currentUser?.email ?? null,
    authCurrentUserEmailVerified: currentUser?.emailVerified ?? null,
    authCurrentUserIsAnonymous: currentUser?.isAnonymous ?? null,
    authCurrentUserProviderData: currentUser?.providerData.map((provider) => ({
      providerId: provider.providerId,
      uid: provider.uid,
      email: provider.email,
      displayName: provider.displayName,
    })) ?? [],
    firebaseProjectId: auth.app.options.projectId ?? null,
    firebaseAuthDomain: auth.app.options.authDomain ?? null,
    firestoreProjectId: db.app.options.projectId ?? null,
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    profileDocumentPath: `users/${user.uid}`,
    authCurrentUserMatchesUseAuthUid: currentUser?.uid === user.uid,
    authCurrentUserIsUseAuthUser: currentUser === user,
    idTokenAvailable: hasIdToken ?? false,
  }
}

/**
 * The single Firebase Authentication subscription for the application.
 * Manages real user identity and Firestore profile synchronization.
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

  // Firebase Auth resolution
  useEffect(() => {
    let isMounted = true
    let redirectCheckComplete = false
    let authListenerFired = false
    let pendingUser: User | null = null

    const finalizeResolution = () => {
      if (!isMounted) return

      const finalUser = auth.currentUser || pendingUser
      setUser(finalUser)
      setAuthInitializationError(null)
      setAuthResolved(true)
    }

    const resolutionTimeout = window.setTimeout(() => {
      if (!isMounted) return
      console.warn('[AUTH DIAGNOSTIC] Timeout de resolução de autenticação atingido.')
      finalizeResolution()
    }, AUTH_RESOLUTION_TIMEOUT_MS)

    // 1. Process redirect result from OAuth flow
    getRedirectResult(auth, browserPopupRedirectResolver)
      .then((result) => {
        redirectCheckComplete = true
        if (result?.user) {
          pendingUser = result.user
          if (isMounted) {
            setUser(result.user)
          }
        }
        if (authListenerFired) {
          window.clearTimeout(resolutionTimeout)
          finalizeResolution()
        }
      })
      .catch((error) => {
        redirectCheckComplete = true
        console.error('[AUTH DIAGNOSTIC] Erro em getRedirectResult:', error)
        if (authListenerFired) {
          window.clearTimeout(resolutionTimeout)
          finalizeResolution()
        }
      })

    // 2. Subscribe to auth / token changes
    let unsubscribe: (() => void) | undefined
    try {
      unsubscribe = onIdTokenChanged(
        auth,
        (currentUser) => {
          authListenerFired = true
          pendingUser = currentUser

          if (currentUser) {
            window.clearTimeout(resolutionTimeout)
            finalizeResolution()
          } else if (redirectCheckComplete) {
            window.clearTimeout(resolutionTimeout)
            finalizeResolution()
          }
        },
        (error) => {
          authListenerFired = true
          console.error('[AUTH DIAGNOSTIC] Erro em onIdTokenChanged:', error)
          window.clearTimeout(resolutionTimeout)
          if (isMounted) {
            const firebaseError = error as { code?: unknown; message?: unknown }
            const detail = typeof firebaseError.code === 'string'
              ? firebaseError.code
              : typeof firebaseError.message === 'string'
                ? firebaseError.message
                : 'erro desconhecido'
            setAuthInitializationError(`Não foi possível verificar a sessão no Firebase Authentication. [Firebase: ${detail}]`)
            setUser(null)
            setAuthResolved(true)
          }
        },
      )
    } catch (error) {
      console.error('[AUTH DIAGNOSTIC] Falha ao registar listener:', error)
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

  // Cloud Profile Synchronization (com onSnapshot em tempo real)
  useEffect(() => {
    if (!authResolved) {
      return
    }

    let isMounted = true
    let unsubSnapshot: Unsubscribe | null = null

    if (!user) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      return
    }

    const initializeAndSubscribeProfile = async () => {
      setProfileError(null)
      setProfileLoading(true)

      let authDiagnostic = getProfileAuthDiagnostic(user)

      try {
        const currentAuthUser = auth.currentUser
        if (!currentAuthUser) {
          throw new Error('Firebase Auth inconsistency: useAuth() returned a user but auth.currentUser is null.')
        }

        const idToken = await currentAuthUser.getIdToken()
        const tokenResult = await currentAuthUser.getIdTokenResult()
        authDiagnostic = getProfileAuthDiagnostic(user, tokenResult, Boolean(idToken))

        if (!idToken) {
          throw new Error('Firebase Auth returned an empty ID token for the current user.')
        }

        const userRef = doc(db, 'users', currentAuthUser.uid)
        const snapshot = await withFirestoreTimeout(getDoc(userRef), 'A leitura do perfil')
        let initialProfile: UserProfile

        if (snapshot.exists()) {
          const cloudData = snapshot.data() as UserProfile
          initialProfile = {
            ...createDefaultUserProfile(user),
            ...cloudData,
            uid: user.uid,
          }
        } else {
          initialProfile = createDefaultUserProfile(user)
          await withFirestoreTimeout(setDoc(userRef, initialProfile), 'A criação do perfil')
        }

        // Sincronizar perfil público para ranking nacional
        try {
          const publicProfileRef = doc(db, 'publicProfiles', currentAuthUser.uid)
          await setDoc(
            publicProfileRef,
            {
              uid: currentAuthUser.uid,
              displayName: initialProfile.displayName || 'Jogador',
              photoURL: initialProfile.photoURL || null,
              district: initialProfile.district || 'Portugal',
              level: initialProfile.level || 1,
              xp: initialProfile.xp || 0,
            },
            { merge: true },
          )
        } catch (syncErr) {
          console.warn('[AUTH DIAGNOSTIC] Aviso ao sincronizar perfil público:', syncErr)
        }

        if (isMounted) {
          setProfile(initialProfile)
          setProfileLoading(false)
        }

        // Subscrição em TEMPO REAL para refletir compras, cosméticos e saldo instantaneamente
        unsubSnapshot = onSnapshot(
          userRef,
          (docSnap) => {
            if (!isMounted) return
            if (docSnap.exists()) {
              const liveData = docSnap.data() as UserProfile
              setProfile((prev) => ({
                ...(prev || createDefaultUserProfile(user)),
                ...liveData,
                uid: user.uid,
              }))
            }
          },
          (err) => {
            console.warn('[AUTH DIAGNOSTIC] Erro no listener do perfil:', err)
          },
        )
      } catch (error) {
        console.error('[AUTH DIAGNOSTIC] Erro Firestore ao sincronizar perfil:', {
          diagnostic: authDiagnostic,
          error,
        })
        if (isMounted) {
          setProfileError(profileErrorMessage(error))
          setProfileLoading(false)
        }
      }
    }

    void initializeAndSubscribeProfile()

    return () => {
      isMounted = false
      if (unsubSnapshot) {
        unsubSnapshot()
      }
    }
  }, [authResolved, user, profileRetry])

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
