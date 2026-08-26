import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { PlayerCard, type UserProfile } from './player-card'
import { ECONOMY_CONFIG } from '@/src/data/economy'
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

type AuthMode = 'signin' | 'signup'

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
    euros: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
    coins: ECONOMY_CONFIG.INITIAL_BONUS_COINS,
    district: '',
    gamesPlayed: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    totalQuestions: 0,
    bestStreak: 0,
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
    if (code.includes('auth/account-exists-with-different-credential')) {
      return withDiagnostic('Já existe uma conta associada a este email com outro método de acesso.')
    }
    if (code.includes('auth/invalid-credential')) {
      return withDiagnostic('Credenciais inválidas ou expiradas. Tenta novamente.')
    }
    if (code.includes('auth/network-request-failed')) {
      return withDiagnostic('Erro de ligação de rede. Verifica a tua ligação à Internet.')
    }
    if (code.includes('auth/user-disabled')) {
      return withDiagnostic('Esta conta de utilizador foi desativada.')
    }
    if (code.includes('auth/operation-not-supported-in-this-environment')) {
      return withDiagnostic('Este ambiente de navegação não suporta esta operação.')
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

  if (code.includes('auth/argument-error')) {
    return withDiagnostic('Dados de autenticação inválidos ou incompletos.')
  }

  return `Não foi possível concluir a ação. [Firebase: ${diagnostic}]`
}

export function ProfilePanel({
  className,
  onAuthChange,
  isModal,
}: {
  className?: string
  onAuthChange?: () => void
  isModal?: boolean
}) {
  const router = useRouter()
  const { user, authResolved, profile } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [mode, setMode] = useState<AuthMode>('signin')
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
              setProfileError(`O Firestore está temporariamente indisponível. [Firebase: ${display}]`)
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    const name = typeof form.name === 'string' ? form.name.trim() : ''
    const email = typeof form.email === 'string' ? form.email.trim() : ''
    const password = typeof form.password === 'string' ? form.password : ''
    const confirmPassword = typeof form.confirmPassword === 'string' ? form.confirmPassword : ''

    if (!name) {
      setError('O nome é obrigatório.')
      return
    }

    if (!email) {
      setError('O email é obrigatório.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('O email introduzido não tem um formato válido.')
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

    if (!auth) {
      setError('Serviço de autenticação indisponível.')
      return
    }

    try {
      setLoading(true)
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (credential?.user) {
        await updateProfile(credential.user, { displayName: name })
      }
      setMessage('Conta criada com sucesso. Bem-vindo!')
      onAuthChangeRef.current?.()
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

    try {
      const { performGoogleSignIn } = await import('@/lib/auth-helpers')
      await performGoogleSignIn('/perfil')
      onAuthChangeRef.current?.()
      if (window.location.pathname === '/') {
        window.location.href = '/perfil'
      }
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

    const email = typeof form.email === 'string' ? form.email.trim() : ''
    const password = typeof form.password === 'string' ? form.password : ''

    if (!email) {
      setError('O email é obrigatório.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('O email introduzido não tem um formato válido.')
      return
    }

    if (!password) {
      setError('A palavra-passe é obrigatória.')
      return
    }

    if (!auth) {
      setError('Serviço de autenticação indisponível.')
      return
    }

    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      setMessage('Sessão iniciada com sucesso.')
      onAuthChangeRef.current?.()
    } catch (err: any) {
      setError(mapAuthError(err, 'signin'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setError(null)
    setMessage(null)

    const email = typeof form.email === 'string' ? form.email.trim() : ''
    if (!email) {
      setError('Introduz o email para receber o link de recuperação.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setError('O email introduzido não tem um formato válido.')
      return
    }

    if (!auth) {
      setError('Serviço de autenticação indisponível.')
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
      if (auth) {
        await signOut(auth)
      }
      onAuthChangeRef.current?.()
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
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
            className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur text-center text-sm text-muted-foreground">A carregar perfil...</div>
  }

  return (
    <div className={cn('flex flex-col w-full text-left', className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-primary ring-2 ring-primary/40 shadow-lg mb-3">
          <UserIcon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-2xl font-black text-foreground">
          {mode === 'signup' ? 'Criar Conta' : 'Entrar no Jogo'}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sincroniza o teu progresso na nuvem e representa o teu distrito no ranking nacional.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode('signin')
            setError(null)
          }}
          className={cn(
            'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer text-center',
            mode === 'signin'
              ? 'bg-primary text-primary-foreground shadow-md font-black'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup')
            setError(null)
          }}
          className={cn(
            'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer text-center',
            mode === 'signup'
              ? 'bg-primary text-primary-foreground shadow-md font-black'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Criar Conta
        </button>
      </div>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 py-3 px-4 text-sm font-bold text-foreground transition hover:bg-white/10 hover:border-white/25 active:scale-[0.99] disabled:opacity-60 cursor-pointer shadow-sm"
      >
        <GoogleIcon />
        <span>Continuar com Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-5 flex items-center justify-center">
        <div className="w-full border-t border-white/10" />
        <span className="absolute bg-card px-3 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
          ou com email
        </span>
      </div>

      {/* Sign In Form */}
      {mode === 'signin' && (
        <form className="space-y-4" onSubmit={handleSignin}>
          <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              placeholder="email@exemplo.com"
            />
          </label>

          <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Palavra-passe</span>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[0.7rem] text-primary hover:underline font-semibold cursor-pointer"
              >
                Esqueceste-te?
              </button>
            </div>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer mt-2"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      )}

      {/* Sign Up Form */}
      {mode === 'signup' && (
        <form className="space-y-3.5" onSubmit={handleCreateAccount}>
          <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
            <span>Nome Completo</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              placeholder="O teu nome"
            />
          </label>

          <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
            <span>Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              placeholder="email@exemplo.com"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
              <span>Palavra-passe</span>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                placeholder="Mín. 6 caracteres"
              />
            </label>
            <label className="block space-y-1.5 text-left text-xs font-bold text-muted-foreground">
              <span>Confirmar</span>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-background/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                placeholder="Repetir"
              />
            </label>
          </div>

        </form>
      )}

      {/* Notifications & Error feedback */}
      {(error || message || profileError) && (
        <div
          className={cn(
            'mt-4 rounded-xl px-4 py-3 text-xs font-bold text-left',
            error || profileError
              ? 'bg-red-950/60 text-red-200 border border-red-500/30'
              : 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/30',
          )}
        >
          {error ?? profileError ?? message}
        </div>
      )}

      {!authResolved && (
        <p className="mt-3 text-center text-xs text-muted-foreground animate-pulse">
          A verificar estado de autenticação...
        </p>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 24.4C48 22.8 47.9 21.2 47.6 19.7H24.5V28.5H37.8C37.2 31.4 35.9 33.8 33.9 35.3V41.3H41.8C45.8 37.3 48 31.4 48 24.4Z" fill="#4285F4" />
      <path d="M24.5 48C31.2 48 36.8 45.7 39.7 42.2L32.8 36.8C30.6 38.2 27.8 39.1 24.5 39.1C18.2 39.1 12.9 35.1 11.1 29.5H3.1V35.1C6.1 42.8 14.6 48 24.5 48Z" fill="#34A853" />
      <path d="M11.1 29.5C10.6 28.1 10.3 26.6 10.3 25C10.3 23.4 10.6 21.9 11.1 20.5V14.9H3.1C1.1 18.8 0 23.3 0 28C0 32.7 1.1 37.2 3.1 41.1L11.1 35.5V29.5Z" fill="#FBBC05" />
      <path d="M24.5 10.2C28.1 10.2 31.4 11.5 33.9 13.8L40.5 7.2C36.8 3.9 31.2 1.5 24.5 1.5C14.6 1.5 6.1 6.7 3.1 14.4L11.1 20C12.9 14.4 18.2 10.2 24.5 10.2Z" fill="#EA4335" />
    </svg>
  )
}
