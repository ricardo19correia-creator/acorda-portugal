'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import {
  ArrowLeft,
  User as UserIcon,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { BrandLogo } from '@/components/brand-logo'
import { BackgroundFx } from '@/components/background-fx'
import GoogleAuthButton from '@/components/google-auth-button'
import { handleGoogleLogin, performGoogleSignIn, useCheckRedirectLogin, getPostLoginRedirectTarget, setPostLoginRedirectTarget } from '@/lib/auth'
import { cn } from '@/lib/utils'

const DISTRICTS_LIST = [
  'Vila Real',
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Viseu',
  'Açores',
  'Madeira',
]

function mapAuthError(error: any): string {
  const code = error?.code || ''
  const message = error?.message || ''

  if (code === 'auth/invalid-email') return 'O formato do email não é válido.'
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Email ou palavra-passe incorretos.'
  }
  if (code === 'auth/email-already-in-use') return 'Já existe uma conta com este endereço de email.'
  if (code === 'auth/weak-password') return 'A palavra-passe deve ter pelo menos 6 caracteres.'
  if (code === 'auth/operation-not-allowed') {
    return 'O método de registo com Email/Palavra-passe está desativado no Firebase Authentication Console.'
  }
  if (code === 'auth/popup-closed-by-user') return 'A janela de autenticação Google foi cancelada.'
  if (code === 'auth/network-request-failed') return 'Erro de ligação. Verifica a tua internet.'
  if (code === 'auth/too-many-requests') return 'Demasiadas tentativas de login. Tenta novamente mais tarde.'
  if (code === 'auth/argument-error') return 'Dados de autenticação inválidos ou incompletos.'

  return message || 'Ocorreu um erro ao processar a autenticação.'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function EntrarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/jogar'

  // Hook que verifica retorno do redirecionamento do Google
  useCheckRedirectLogin(redirectTarget)

  const { user, authResolved } = useAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')

  // Form fields
  const [name, setName] = useState('')
  const [district, setDistrict] = useState('Vila Real')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect if already logged in (resolvendo qualquer target guardado de redirect móvel)
  useEffect(() => {
    if (authResolved && user) {
      const destination = getPostLoginRedirectTarget(redirectTarget)
      router.push(destination)
    }
  }, [user, authResolved, redirectTarget, router])

  // Google Login via signInWithRedirect (WebView / APK / Mobile / Browser)
  const onGoogleLoginClick = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      await handleGoogleLogin(redirectTarget)
    } catch (err: any) {
      setError(mapAuthError(err))
      setGoogleLoading(false)
    }
  }


  // Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const cleanEmail = typeof email === 'string' ? email.trim() : ''
    const cleanPassword = typeof password === 'string' ? password : ''

    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, preenche todos os campos.')
      return
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Por favor, introduz um endereço de email válido.')
      return
    }

    if (!auth) {
      setError('Serviço de autenticação temporariamente indisponível.')
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
      const destination = getPostLoginRedirectTarget(redirectTarget)
      router.push(destination)
    } catch (err: any) {
      setError(mapAuthError(err))
      setLoading(false)
    }
  }

  // Create Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const cleanName = typeof name === 'string' ? name.trim() : ''
    const cleanEmail = typeof email === 'string' ? email.trim() : ''
    const cleanPassword = typeof password === 'string' ? password : ''
    const cleanConfirmPassword = typeof confirmPassword === 'string' ? confirmPassword : ''
    const cleanDistrict = typeof district === 'string' && district.trim() ? district.trim() : 'Vila Real'

    if (!cleanName) {
      setError('Por favor, escolhe um nome ou nickname.')
      return
    }
    if (!cleanEmail || !cleanPassword) {
      setError('Por favor, preenche o email e a palavra-passe.')
      return
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Por favor, introduz um endereço de email válido.')
      return
    }
    if (cleanPassword.length < 6) {
      setError('A palavra-passe deve conter pelo menos 6 caracteres.')
      return
    }
    if (cleanPassword !== cleanConfirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }

    if (!auth) {
      setError('Serviço de autenticação temporariamente indisponível.')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword)
      const newUser = userCredential.user

      if (newUser) {
        // Update auth profile
        await updateProfile(newUser, {
          displayName: cleanName,
        })

        // Create initial Firestore profile
        const userRef = doc(db, 'users', newUser.uid)
        await setDoc(userRef, {
          uid: newUser.uid,
          displayName: cleanName,
          email: newUser.email || cleanEmail,
          district: cleanDistrict,
          photoURL: null,
          level: 1,
          xp: 0,
          euros: 100,
          streak: 0,
          gamesPlayed: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          totalQuestions: 0,
          bestStreak: 0,
          inventory: {},
          equipped: {},
          createdAt: new Date().toISOString(),
        }, { merge: true })

        // Sincronizar perfil público
        try {
          const publicProfileRef = doc(db, 'publicProfiles', newUser.uid)
          await setDoc(publicProfileRef, {
            uid: newUser.uid,
            displayName: cleanName,
            district: cleanDistrict,
            level: 1,
            xp: 0,
          }, { merge: true })
        } catch {}
      }

      const destination = getPostLoginRedirectTarget(redirectTarget)
      router.push(destination)
    } catch (err: any) {
      setError(mapAuthError(err))
      setLoading(false)
    }
  }

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const cleanEmail = typeof email === 'string' ? email.trim() : ''

    if (!cleanEmail) {
      setError('Insere o teu email para recuperar a palavra-passe.')
      return
    }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Por favor, introduz um endereço de email válido.')
      return
    }

    if (!auth) {
      setError('Serviço de autenticação temporariamente indisponível.')
      return
    }

    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, cleanEmail)
      setSuccessMessage('Email de recuperação enviado com sucesso! Verifica a tua caixa de correio.')
      setLoading(false)
    } catch (err: any) {
      setError(mapAuthError(err))
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
      <BackgroundFx variant="auth" />

      {/* Top Header Link */}
      <div className="relative z-20 mx-auto w-full max-w-md flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </Link>
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-20 mx-auto w-full max-w-md my-8">
        <div className="card-game overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Top Title & Subtitle */}
          <div className="text-center">
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground text-glow-primary">
              {mode === 'login' && 'Entrar no Jogo'}
              {mode === 'register' && 'Criar Nova Conta'}
              {mode === 'reset' && 'Recuperar Palavra-passe'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
              {mode === 'login' && 'Guarda o teu progresso, compete no ranking e desbloqueia títulos.'}
              {mode === 'register' && 'Junta-te a milhares de jogadores e representa o teu distrito.'}
              {mode === 'reset' && 'Insere o teu email para redefinir o acesso à tua conta.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Login vs Register) */}
          {mode !== 'reset' && (
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.04] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={cn(
                  'rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer',
                  mode === 'login'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={cn(
                  'rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer',
                  mode === 'register'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Alert Error Box */}
          {error && (
            <div className="mt-4 rounded-2xl border border-flag-red/40 bg-flag-red/10 p-3.5 text-xs font-bold text-flag-red flex items-start gap-2.5 animate-rise">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert Success Box */}
          {successMessage && (
            <div className="mt-4 rounded-2xl border border-primary/40 bg-primary/10 p-3.5 text-xs font-bold text-primary flex items-start gap-2.5 animate-rise">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google OAuth GIS One Tap CTA (In-App WebView & Browser) */}
          {mode !== 'reset' && (
            <div className="mt-5">
              <GoogleAuthButton 
                redirectTarget={redirectTarget} 
                onError={(err) => setError(err)} 
              />

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-card px-3 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                  ou com email
                </span>
              </div>
            </div>
          )}

          {/* 2. Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu.email@exemplo.pt"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset')
                      setError(null)
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Esqueceste-te?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
              >
                {loading ? 'A entrar...' : 'Entrar no Jogo'}
              </button>
            </form>
          )}

          {/* 3. Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Nome / Nickname
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Viriato_PT"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Distrito / Região
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DISTRICTS_LIST.map((dist) => (
                      <option key={dist} value={dist} className="bg-card text-foreground">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu.email@exemplo.pt"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Palavra-passe (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Confirmar Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
              >
                {loading ? 'A criar conta...' : 'Criar Conta & Começar'}
              </button>
            </form>
          )}

          {/* 4. Password Reset Form */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email da Conta
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teu.email@exemplo.pt"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 transition cursor-pointer"
              >
                {loading ? 'A enviar...' : 'Enviar Email de Recuperação'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground pt-2"
              >
                ← Voltar ao ecrã de login
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-20 text-center text-xs text-muted-foreground pb-4">
        © 2026 Acorda Portugal • Jogo de Perguntas Nacional
      </div>
    </div>
  )
}

export default function EntrarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarPageContent />
    </Suspense>
  )
}
