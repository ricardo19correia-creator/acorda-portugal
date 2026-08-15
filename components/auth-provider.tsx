'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onIdTokenChanged, type IdTokenResult, type User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'

type AuthState = {
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

function withTimeout<T>(promise: Promise<T>, operation: string, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${operation} excedeu o tempo limite de ${timeoutMs / 1000} segundos.`))
    }, timeoutMs)

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
    origin: window.location.origin,
    profileDocumentPath: `users/${user.uid}`,
    authCurrentUserMatchesUseAuthUid: currentUser?.uid === user.uid,
    authCurrentUserIsUseAuthUser: currentUser === user,
    idTokenAvailable: hasIdToken ?? false,
    token: tokenResult
      ? {
          signInProvider: tokenResult.signInProvider,
          authTime: tokenResult.authTime,
          issuedAtTime: tokenResult.issuedAtTime,
          expirationTime: tokenResult.expirationTime,
          claims: {
            aud: tokenResult.claims.aud,
            iss: tokenResult.claims.iss,
            auth_time: tokenResult.claims.auth_time,
            exp: tokenResult.claims.exp,
            user_id: tokenResult.claims.user_id,
            email_verified: tokenResult.claims.email_verified,
            firebase: tokenResult.claims.firebase,
          },
        }
      : null,
  }
}

/**
 * The single Firebase Auth subscription for the application. Components read
 * this state instead of creating their own listeners, so they always agree on
 * whether a session has been restored.
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

  useEffect(() => {
    let isMounted = true
    let listenerDeliveredState = false

    console.info('Firebase Auth: a registar onIdTokenChanged.', {
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain,
      origin: window.location.origin,
    })

    const resolutionTimeout = window.setTimeout(() => {
      if (listenerDeliveredState || !isMounted) return

      const message = `Firebase Authentication não devolveu o estado da sessão em ${AUTH_RESOLUTION_TIMEOUT_MS / 1000} segundos.`
      console.error('Firebase Auth: timeout ao aguardar onIdTokenChanged.', {
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
        origin: window.location.origin,
      })
      setAuthInitializationError(message)
      // This is a guarded fallback, not an optimistic resolution: the UI
      // exposes the initialization failure and a later Firebase callback still
      // replaces this state with the actual session.
      setAuthResolved(true)
    }, AUTH_RESOLUTION_TIMEOUT_MS)

    const resolveAuthState = (currentUser: User | null) => {
      listenerDeliveredState = true
      window.clearTimeout(resolutionTimeout)
      if (!isMounted) return

      console.info('Firebase Auth: estado inicial resolvido.', {
        hasUser: Boolean(currentUser),
        userId: currentUser?.uid,
      })
      setAuthInitializationError(null)
      setUser(currentUser)
      setAuthResolved(true)
    }

    let unsubscribe: (() => void) | undefined
    try {
      // Unlike onAuthStateChanged, this listener also tracks ID-token changes.
      // The profile effect below then awaits getIdToken(), ensuring Firestore
      // never starts its first read from a merely restored (but unusable) session.
      unsubscribe = onIdTokenChanged(
        auth,
        (currentUser) => resolveAuthState(currentUser),
        (error) => {
          console.error('Erro ao verificar a autenticação:', error)
          listenerDeliveredState = true
          window.clearTimeout(resolutionTimeout)
          if (!isMounted) return

          const firebaseError = error as { code?: unknown; message?: unknown }
          const detail = typeof firebaseError.code === 'string'
            ? firebaseError.code
            : typeof firebaseError.message === 'string'
              ? firebaseError.message
              : 'erro desconhecido'
          setAuthInitializationError(`Não foi possível verificar a sessão no Firebase Authentication. [Firebase: ${detail}]`)
          setUser(null)
          setAuthResolved(true)
        },
      )
    } catch (error) {
      console.error('Firebase Auth: não foi possível registar onAuthStateChanged.', error)
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

      let authDiagnostic = getProfileAuthDiagnostic(user)

      try {
        // Use the exact Auth instance that owns the ID-token subscription
        // before issuing Firestore. This rejects stale/restored sessions
        // locally instead of sending an unauthenticated Firestore request.

        const currentAuthUser = auth.currentUser
        if (!currentAuthUser) {
          throw new Error('Firebase Auth inconsistency: useAuth() returned a user but auth.currentUser is null.')
        }

        if (currentAuthUser.uid !== user.uid) {
          throw new Error(`Firebase Auth inconsistency: useAuth() uid (${user.uid}) differs from auth.currentUser uid (${currentAuthUser.uid}).`)
        }

        const idToken = await currentAuthUser.getIdToken()
        const tokenResult = await currentAuthUser.getIdTokenResult()
        authDiagnostic = getProfileAuthDiagnostic(user, tokenResult, Boolean(idToken))
        console.info('Firebase profile diagnostic before getDoc:', authDiagnostic)

        if (!idToken) {
          throw new Error('Firebase Auth returned an empty ID token for the current user.')
        }

        if (auth.currentUser !== currentAuthUser) {
          throw new Error('Firebase Auth changed user while the ID token was being prepared; profile read was cancelled.')
        }

        // This getDoc uses users/{auth.currentUser.uid} before any profile
        // write, isolating the exact authenticated Firestore request.
        const userRef = doc(db, 'users', currentAuthUser.uid)
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
        const firebaseError = error as { name?: unknown; code?: unknown; message?: unknown; stack?: unknown }
        console.error('Erro Firestore ao sincronizar o perfil:', {
          diagnostic: authDiagnostic,
          error: {
            name: firebaseError.name,
            code: firebaseError.code,
            message: firebaseError.message,
            stack: firebaseError.stack,
          },
          rawError: error,
        })
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

  return <AuthContext.Provider value={{ user, authResolved, authInitializationError, profile, profileLoading, profileError, retryProfile }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const state = useContext(AuthContext)

  if (!state) {
    throw new Error('useAuth tem de ser utilizado dentro de AuthProvider.')
  }

  return state
}
