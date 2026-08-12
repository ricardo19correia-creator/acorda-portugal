'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { PlayerCard } from './player-card'
import { cn } from '@/lib/utils'
import { Sparkles, Coins } from 'lucide-react'

export function ProfilePanel({ className }: { className?: string }) {
  // user: undefined => not yet resolved; null => resolved and no user; User => authenticated
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [authResolved, setAuthResolved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let first = true
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      // mark resolved on first callback
      if (first) {
        setAuthResolved(true)
        first = false
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    setError(null)
    try {
      setLoading(true)
      await signInWithPopup(auth, googleProvider)
    } catch (err: any) {
      // keep user state untouched (stay as guest)
      console.error('Erro no login Google:', err)
      // handle common user-cancelled popup exception gracefully
      const msg = err?.message ?? String(err)
      setError('Falha ao iniciar sessão. Podes tentar de novo. ' + msg)
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

  // Show authenticated view only when auth resolved and user exists
  if (authResolved && user) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <PlayerCard />
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? 'Utilizador'} className="h-10 w-10 rounded-full" />
          )}

          <div className="flex flex-col">
            <span className="font-bold text-white">{user.displayName ?? 'Jogador'}</span>
            <div className="flex gap-3 items-center">
              <button onClick={logout} className="text-left text-sm text-white/60 hover:text-white">
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // While auth is resolving (authResolved=false) or when resolved and user is null, show guest UX.
  // This guarantees the guest UI remains visible until the auth status is known and ensures it's shown for unauthenticated users.
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          JOGADOR CONVIDADO
        </p>
        <h3 className="mt-2 text-2xl font-display font-bold text-foreground">O teu progresso está guardado neste dispositivo.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Continua a jogar como convidado. Se quiseres sincronizar o teu progresso, entra com Google no teu perfil.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-5 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
        <div className="flex flex-col gap-3">
          <h4 className="text-lg font-bold text-foreground">GUARDA O TEU PROGRESSO</h4>
          <p className="text-sm text-muted-foreground">Entra com Google para sincronizar o teu progresso, conquistas, nível e estatísticas.</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={login}
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 font-semibold text-white shadow-[0_8px_24px_rgba(0,255,170,0.06)] hover:scale-[1.02] disabled:opacity-60"
            >
              <span className="font-bold">Continuar com Google</span>
            </button>
            <button
              onClick={() => {
                /* no-op: guest continue — this button keeps user in profile but does nothing */
              }}
              className="text-sm text-muted-foreground underline"
            >
              Talvez mais tarde
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {!authResolved && (
            <p className="mt-2 text-xs text-muted-foreground">A verificar estado de autenticação...</p>
          )}
        </div>
      </div>
    </div>
  )
}