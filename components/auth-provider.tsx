'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type AuthState = {
  user: User | null
  authResolved: boolean
  redirectAuthError: unknown | null
}

const AuthContext = createContext<AuthState | null>(null)

/**
 * The single Firebase Auth subscription for the application. Components read
 * this state instead of creating their own listeners, so they always agree on
 * whether a session has been restored.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [redirectAuthError, setRedirectAuthError] = useState<unknown | null>(null)

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

  return <AuthContext.Provider value={{ user, authResolved, redirectAuthError }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const state = useContext(AuthContext)

  if (!state) {
    throw new Error('useAuth tem de ser utilizado dentro de AuthProvider.')
  }

  return state
}
