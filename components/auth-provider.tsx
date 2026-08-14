'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type AuthState = {
  user: User | null
  authResolved: boolean
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

  return <AuthContext.Provider value={{ user, authResolved }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const state = useContext(AuthContext)

  if (!state) {
    throw new Error('useAuth tem de ser utilizado dentro de AuthProvider.')
  }

  return state
}
