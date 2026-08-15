﻿'use client'

import { useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { PlayerCard, type UserProfile } from './player-card'
import { cn } from '@/lib/utils'
import {
  Coins,
  Flame,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  User as UserIcon,
  LogOut,
} from 'lucide-react'

type AuthMode = 'guest' | 'signin' | 'signup'

type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const FIRESTORE_TIMEOUT_MS = 10_000

type ProfileSyncFailure = {
  operation: 'getDoc' | 'setDoc'
  cause: unknown
}

function createDefaultUserProfile(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName ?? 'Jogador',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    level: 1,
    xp: 0,
    euros: 100,
    district: 'Vila Real',
    unlockedAchievements: [],
    streak: 0,
  }
}

function withTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(`${operation} excedeu o tempo limite.`))
    }, FIRESTORE_TIMEOUT_MS)

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId)
        resolve(value)
      },
      (reason) => {
        window.clearTimeout(timeoutId)
        reject(reason)
      },
    )
  })
}

function getFirestoreDiagnostic(error: unknown) {
  const firestoreError = error as { code?: unknown; message?: unknown }
  const code = typeof firestoreError?.code === 'string' ? firestoreError.code : ''
  const message = typeof firestoreError?.message === 'string' ? firestoreError.message : ''

  return {
    code,
    message,
    display: code || message || 'Erro Firestore sem código.',
  }
}

function isFirestoreUnavailable(error: unknown) {
  const { code } = getFirestoreDiagnostic(error)
  return code === 'unavailable'
}

function mapAuthError(error: unknown, action: 'signin' | 'signup' | 'reset') {
  const firebaseError = error as { code?: unknown; message?: unknown }
  const code = typeof firebaseError?.code === 'string' ? firebaseError.code : ''
  const message = typeof firebaseError?.message === 'string' ? firebaseError.message : ''
  const diagnostic = code || message || 'Erro Firebase sem código.'

  // Keep the Firebase diagnostic visible while the Auth configuration is being
  // validated. In particular, auth/unauthorized-domain and
  // auth/operation-not-allowed must not be hidden behind a generic message.
  console.error(`Erro Firebase Auth (${action}):`, {
    code: code || undefined,
    message: message || undefined,
    error,
  })

  const withDiagnostic = (userMessage: string) => `${userMessage} [Firebase: ${diagnostic}]`

  if (action === 'signup') {
    if (code.includes('auth/email-already-in-use')) {
      return withDiagnostic('Este email já tem uma conta.')
    }
    if (code.includes('auth/invalid-email')) {
      return withDiagnostic('O email não é válido.')
    }
    if (code.includes('auth/weak-password')) {
      return withDiagnostic('A palavra-passe deve ter pelo menos 6 caracteres.')
    }
  }

  if (action === 'signin') {
    if (code.includes('auth/popup-blocked')) {
      return withDiagnostic('O navegador bloqueou a janela de autenticação. O login Google usa agora redirecionamento seguro.')
    }
    if (code.includes('auth/popup-closed-by-user')) {
      return withDiagnostic('A janela de autenticação foi fechada antes de terminar.')
    }
    if (code.includes('auth/cancelled-popup-request')) {
      return withDiagnostic('Foi cancelado um pedido de autenticação Google anterior.')
    }
    if (code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
      return withDiagnostic('Email ou palavra-passe incorretos.')
    }
    if (code.includes('auth/invalid-email')) {
      return withDiagnostic('O email não é válido.')
    }
    if (code.includes('auth/unauthorized-domain')) {
      return withDiagnostic('Este domínio não está autorizado no Firebase Authentication.')
    }
    if (code.includes('auth/operation-not-allowed')) {
      return withDiagnostic('O login com Google não está ativado no Firebase Authentication.')
    }
  }

  if (action === 'reset') {
    if (code.includes('auth/user-not-found')) {
      return withDiagnostic('Se o email existir, enviaremos um link para repor a palavra-passe.')
    }
    if (code.includes('auth/invalid-email')) {
      return withDiagnostic('O email não é válido.')
    }
  }

  return `Não foi possível concluir a ação. [Firebase: ${diagnostic}]`
}

export function ProfilePanel({ className, onAuthChange }: { className?: string; onAuthChange?: () => void }) {
  const { user, authResolved } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [mode, setMode] = useState<AuthMode>('guest')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetry, setProfileRetry] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '', confirmPassword: '' })
  const onAuthChangeRef = useRef(onAuthChange)
  const profileRequestRef = useRef(0)
  const previousUserRef = useRef<User | null | undefined>(undefined)

  useEffect(() => {
    onAuthChangeRef.current = onAuthChange
  }, [onAuthChange])

  const getOrCreateUserProfile = async (user: User): Promise<UserProfile> => {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await withTimeout(getDoc(userRef), 'A leitura do perfil').catch((cause) => {
      throw { operation: 'getDoc', cause } satisfies ProfileSyncFailure
    })

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }

    const newUserProfile = createDefaultUserProfile(user)
    try {
      await withTimeout(setDoc(userRef, newUserProfile), 'A criação do perfil')
    } catch (cause) {
      throw { operation: 'setDoc', cause } satisfies ProfileSyncFailure
    }

    return newUserProfile
  }

  useEffect(() => {
    if (!authResolved) return

    let isMounted = true
    const requestId = ++profileRequestRef.current
    setUserProfile(null)
    setProfileError(null)

    if (user) {
      if (previousUserRef.current === null) {
        onAuthChangeRef.current?.()
      }

      void getOrCreateUserProfile(user)
        .then((profile) => {
          if (isMounted && profileRequestRef.current === requestId) setUserProfile(profile)
        })
        .catch((failure: ProfileSyncFailure) => {
          const { code, message, display } = getFirestoreDiagnostic(failure.cause)
          console.error('Erro Firestore ao sincronizar o perfil:', {
            operation: failure.operation,
            code: code || undefined,
            message: message || undefined,
            userId: user.uid,
            error: failure.cause,
          })

          if (isMounted && profileRequestRef.current === requestId) {
            if (isFirestoreUnavailable(failure.cause)) {
              setUserProfile(createDefaultUserProfile(user))
              setProfileError(`O Firestore está temporariamente indisponível. Estamos a mostrar os teus dados locais temporariamente. [Firebase: ${display}]`)
              return
            }

            setProfileError(`Não foi possível sincronizar o perfil no Firestore. [Firebase: ${display}]`)
          }
        })
    }

    previousUserRef.current = user
    return () => {
      isMounted = false
      profileRequestRef.current += 1
    }
  }, [authResolved, user, profileRetry])

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

  const handleGoogleSignIn = async () => {
    setError(null)
    setMessage(null)
    setLoading(true)

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onIdTokenChanged listener in AuthProvider will handle the user state.
      // We can navigate to the profile page upon successful sign-in.
      window.location.href = '/perfil'; // Using window.location to ensure a full page reload which helps AuthProvider to pick up the new state.
    } catch (err: any) {
      setError(mapAuthError(err, 'signin'))
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
    if (userProfile) {
      return (
        <div className={cn('flex flex-col gap-6', className)}>
          {profileError && (
            <div className="rounded-md bg-red-900/40 px-3 py-2 text-sm text-red-200">
              {profileError}
            </div>
          )}
          <PlayerCard user={user} profile={userProfile} />
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Terminar sessão
          </button>
        </div>
      )
    }

    if (profileError) {
      return (
        <div className="rounded-3xl border border-red-500/30 bg-card/60 p-6 backdrop-blur">
          <p className="text-sm text-red-200">{profileError}</p>
          <button
            onClick={() => setProfileRetry((current) => current + 1)}
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur">A carregar perfil...</div>
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
            <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            >
              <GoogleIcon />
              Continuar com Google
            </button>
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
            </>
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

          {(error || message || profileError) && (
            <div className={cn(
              'mt-3 rounded-md px-3 py-2 text-sm',
              error || profileError ? 'bg-red-900/40 text-red-200' : 'bg-emerald-900/25 text-emerald-200',
            )}
          >
            {error ?? profileError ?? message}
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

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 24.4C48 22.8 47.9 21.2 47.6 19.7H24.5V28.5H37.8C37.2 31.4 35.9 33.8 33.9 35.3V41.3H41.8C45.8 37.3 48 31.4 48 24.4Z" fill="#4285F4" />
      <path d="M24.5 48C31.2 48 36.8 45.7 39.7 42.2L32.8 36.8C30.6 38.2 27.8 39.1 24.5 39.1C18.2 39.1 12.9 35.1 11.1 29.5H3.1V35.1C6.1 42.8 14.6 48 24.5 48Z" fill="#34A853" />
      <path d="M11.1 29.5C10.6 28.1 10.3 26.6 10.3 25C10.3 23.4 10.6 21.9 11.1 20.5V14.9H3.1C1.1 18.8 0 23.3 0 28C0 32.7 1.1 37.2 3.1 41.1L11.1 35.5V29.5Z" fill="#FBBC05" />
      <path d="M24.5 10.2C28.1 10.2 31.4 11.5 33.9 13.8L40.5 7.2C36.8 3.9 31.2 1.5 24.5 1.5C14.6 1.5 6.1 6.7 3.1 14.4L11.1 20C12.9 14.4 18.2 10.2 24.5 10.2Z" fill="#EA4335" />
    </svg>
  )
}
