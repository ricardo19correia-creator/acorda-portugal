'use client'

import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { PlayerCard } from './player-card'
import { cn } from '@/lib/utils'

type AuthMode = 'guest' | 'signin' | 'signup'

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

function mapAuthError(error: any, action: 'signin' | 'signup' | 'reset') {
  const code = error?.code ?? error?.message ?? ''

  if (action === 'signup') {
    if (code.includes('auth/email-already-in-use')) {
      return 'Este email já tem uma conta.'
    }
    if (code.includes('auth/invalid-email')) {
      return 'O email não é válido.'
    }
    if (code.includes('auth/weak-password')) {
      return 'A palavra-passe deve ter pelo menos 6 caracteres.'
    }
  }

  if (action === 'signin') {
    if (code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
      return 'Email ou palavra-passe incorretos.'
    }
    if (code.includes('auth/invalid-email')) {
      return 'O email não é válido.'
    }
  }

  if (action === 'reset') {
    if (code.includes('auth/user-not-found')) {
      return 'Se o email existir, enviaremos um link para repor a palavra-passe.'
    }
    if (code.includes('auth/invalid-email')) {
      return 'O email não é válido.'
    }
  }

  return 'Não foi possível concluir a ação. Tenta novamente.'
}

export function ProfilePanel({ className }: { className?: string }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [authResolved, setAuthResolved] = useState(false)
  const [mode, setMode] = useState<AuthMode>('guest')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
    let first = true
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (first) {
        setAuthResolved(true)
        first = false
      }
    })

    return () => unsubscribe()
  }, [])

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
    setError(null)
    setMessage(null)
  }

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const name = form.name.trim()
    const email = form.email.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    if (!name) {
      setError('O nome é obrigatório.')
      return
    }

    if (!email) {
      setError('O email é obrigatório.')
      return
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }

    try {
      setLoading(true)
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (credential.user) {
        await updateProfile(credential.user, { displayName: name })
      }
      setMode('guest')
      setMessage('Conta criada com sucesso. Bem-vindo!')
    } catch (err: any) {
      setError(mapAuthError(err, 'signup'))
    } finally {
      setLoading(false)
    }
  }

  const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const email = form.email.trim()
    const password = form.password

    if (!email) {
      setError('O email é obrigatório.')
      return
    }

    if (!password) {
      setError('A palavra-passe é obrigatória.')
      return
    }

    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      setMode('guest')
      setMessage('Sessão iniciada com sucesso.')
    } catch (err: any) {
      setError(mapAuthError(err, 'signin'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError(null)
    setMessage(null)

    const email = form.email.trim()
    if (!email) {
      setError('Introduz o email para receber o link de recuperação.')
      return
    }

    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, email)
      setMessage('Se esse email existir, enviámos um link para repor a palavra-passe.')
    } catch (err: any) {
      setError(mapAuthError(err, 'reset'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('Erro ao terminar sessão:', err)
    }
  }

  const isAuthenticated = authResolved && user

  if (isAuthenticated) {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <PlayerCard />
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
          {user?.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? 'Utilizador'} className="h-10 w-10 rounded-full" />
          )}

          <div className="flex flex-col">
            <span className="font-bold text-white">{user?.displayName ?? 'Jogador'}</span>
            <div className="flex gap-3 items-center">
              <button onClick={handleLogout} className="text-left text-sm text-white/60 hover:text-white">
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          JOGADOR CONVIDADO
        </p>
        <h3 className="mt-2 text-2xl font-display font-bold text-foreground">O teu progresso está guardado neste dispositivo.</h3>
        <p className="mt-2 text-sm text-muted-foreground">Continua a jogar como convidado. Quando quiseres, cria a tua conta ou entra na tua conta existente.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-5 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">CRIA A TUA CONTA</p>
            <h4 className="mt-2 text-lg font-bold text-foreground">Guarda o teu progresso, conquistas, nível e estatísticas.</h4>
          </div>

          {mode === 'guest' && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setMode('signup')
                  resetForm()
                }}
                className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,255,170,0.08)] hover:scale-[1.02]"
              >
                CRIAR CONTA
              </button>
              <button
                onClick={() => {
                  setMode('signin')
                  resetForm()
                }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                JÁ TENHO CONTA
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <form className="space-y-4" onSubmit={handleCreateAccount}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Nome</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Nome completo"
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="email@exemplo.com"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Palavra-passe</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Mínimo 6 caracteres"
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span>Confirmar palavra-passe</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Reescreve a palavra-passe"
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,255,170,0.08)] hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? 'A criar conta...' : 'Criar conta'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    resetForm()
                  }}
                  className="text-sm text-muted-foreground underline"
                >
                  Já tenho conta
                </button>
              </div>
            </form>
          )}

          {mode === 'signin' && (
            <form className="space-y-4" onSubmit={handleSignin}>
              <label className="space-y-2 text-sm text-muted-foreground">
                <span>Email</span>
                <input
                  type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="email@exemplo.com"
                  />
              </label>
              <label className="space-y-2 text-sm text-muted-foreground">
                <span>Palavra-passe</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Palavra-passe"
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,255,170,0.08)] hover:scale-[1.02] disabled:opacity-60"
                >
                  {loading ? 'A entrar...' : 'Entrar'}
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-muted-foreground underline"
                >
                  Esqueci-me da palavra-passe
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  resetForm()
                }}
                className="text-sm text-muted-foreground underline"
              >
                Criar conta
              </button>
            </form>
          )}

          {(error || message) && (
            <div className={cn(
              'mt-3 rounded-md px-3 py-2 text-sm',
              error ? 'bg-red-900/40 text-red-200' : 'bg-emerald-900/25 text-emerald-200',
            )}
          >
            {error ?? message}
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
