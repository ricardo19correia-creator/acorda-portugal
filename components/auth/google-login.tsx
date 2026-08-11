'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

export function GoogleLogin() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Erro no login Google:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erro ao terminar sessão:', error)
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Utilizador'}
            className="h-10 w-10 rounded-full"
          />
        )}

        <div className="flex flex-col">
          <span className="font-bold text-white">
            {user.displayName ?? 'Jogador'}
          </span>

          <button
            onClick={logout}
            className="text-left text-sm text-white/60 hover:text-white"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={login}
      disabled={loading}
      className="flex w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-bold text-black shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
    >
      <span className="text-xl font-bold">G</span>
      {loading ? 'A entrar...' : 'Entrar com Google'}
    </button>
  )
}