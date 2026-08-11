'use client'

import { useState } from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

export function GoogleLogin() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(auth.currentUser)

  const login = async () => {
    try {
      setLoading(true)

      const result = await signInWithPopup(auth, googleProvider)
      setUser(result.user)
    } catch (error) {
      console.error('Erro no login Google:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Utilizador'}
            className="h-10 w-10 rounded-full"
          />
        )}

        <div className="flex flex-col">
          <span className="font-bold">
            {user.displayName ?? 'Jogador'}
          </span>

          <button
            onClick={logout}
            className="text-left text-sm text-muted-foreground hover:text-foreground"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={login}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 font-bold text-black shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
    >
      <span className="text-lg">G</span>

      {loading ? 'A entrar...' : 'Entrar com Google'}
    </button>
  )
}