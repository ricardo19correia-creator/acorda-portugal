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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
  Trophy,
} from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { BrandLogo } from '@/components/brand-logo'
import { BackgroundFx } from '@/components/background-fx'
import GoogleAuthButton from '@/components/google-auth-button'
import {
  useCheckRedirectLogin,
  getPostLoginRedirectTarget,
  sanitizeRedirectUrl,
  mapAuthErrorMessage,
  createNewUserDocument,
} from '@/lib/auth'
import { PORTUGAL_DISTRICTS } from '@/data/constants'
import { cn } from '@/lib/utils'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EntrarPageContent({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' | 'reset' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = sanitizeRedirectUrl(searchParams.get('redirect'), '/jogar')
  const { user, profile, authResolved } = useAuth()
  const initialMode =
    searchParams.get('mode') === 'register'
      ? 'register'
      : searchParams.get('mode') === 'reset'
      ? 'reset'
      : defaultMode
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode)

  // Form fields
  const [name, setName] = useState('')
  const [district, setDistrict] = useState<string>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Onboarding de Primeiro Acesso (caso falte distrito ou não esteja bloqueado)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingDistrict, setOnboardingDistrict] = useState<string>('')
  const [onboardingSaving, setOnboardingSaving] = useState(false)

  // Hook que processa retorno do redirecionamento do Google de forma resiliente
  useCheckRedirectLogin(redirectTarget, (err) => setError(err))

  // Verificar se o utilizador autenticado precisa de Onboarding de Distrito
  useEffect(() => {
    if (authResolved && user) {
      if (profile) {
        const needsDistrict =
          !profile.district ||
          profile.district === 'Portugal' ||
          !profile.districtLocked

        if (needsDistrict) {
          setShowOnboarding(true)
        } else {
          const destination = getPostLoginRedirectTarget(redirectTarget)
          router.push(destination)
        }
      }
    }
  }, [user, profile, authResolved, redirectTarget, router])

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
      const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
      if (userCred.user) {
        const { registerUserSession } = await import('@/lib/session-manager')
        await registerUserSession(userCred.user)
      }
      // O useEffect acima irá verificar se precisa de onboarding ou redirecionar
    } catch (err: any) {
      setError(mapAuthErrorMessage(err))
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
    const cleanDistrict = typeof district === 'string' ? district.trim() : ''

    if (!cleanName) {
      setError('Por favor, escolhe um nome ou nickname.')
      return
    }
    if (!cleanDistrict) {
      setError('Por favor, escolhe obrigatoriamente o teu Distrito de Origem.')
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
        // Update auth profile displayName
        await updateProfile(newUser, {
          displayName: cleanName,
        })

        // Criar documento padronizado com Avatar Oficial e Distrito Permanente
        await createNewUserDocument(newUser, cleanDistrict, cleanName)

        const { registerUserSession } = await import('@/lib/session-manager')
        await registerUserSession(newUser)
      }

      const destination = getPostLoginRedirectTarget(redirectTarget)
      router.push(destination)
    } catch (err: any) {
      setError(mapAuthErrorMessage(err))
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
      setSuccessMessage('Email de recuperação enviado com sucesso! Verifica a tua caixa de entrada.')
      setLoading(false)
    } catch (err: any) {
      setError(mapAuthErrorMessage(err))
      setLoading(false)
    }
  }

  // Guardar Onboarding de Distrito para Google Login
  const handleConfirmOnboardingDistrict = async () => {
    if (!user?.uid || !db) return
    if (!onboardingDistrict) {
      setError('Por favor escolhe obrigatoriamente o teu Distrito de Representação.')
      return
    }
    setOnboardingSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        district: onboardingDistrict,
        districtLocked: true,
        updatedAt: serverTimestamp(),
      })

      const publicRef = doc(db, 'publicProfiles', user.uid)
      await setDoc(
        publicRef,
        {
          district: onboardingDistrict,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )

      setShowOnboarding(false)
      const destination = getPostLoginRedirectTarget(redirectTarget)
      router.push(destination)
    } catch (err) {
      console.error('[ONBOARDING] Erro ao guardar distrito:', err)
      setError('Não foi possível guardar o distrito. Tenta novamente.')
      setOnboardingSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background">
      <BackgroundFx variant="home" />

      {/* MODAL DE ONBOARDING TERRITORIAL (PRIMEIRO LOGIN GOOGLE / SEM DISTRITO BLOQUEADO) */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

            <div className="text-center relative z-10">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                <MapPin className="h-7 w-7 text-emerald-400 animate-bounce" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                ONBOARDING DE JOGADOR
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-1 leading-snug">
                Bem-vindo ao Acorda Portugal! Escolhe o teu Distrito de Representação
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Seleciona a tua região de origem para representar o teu distrito nos{' '}
                <strong className="text-emerald-300">Rankings Territoriais Nacionais</strong>.
              </p>

              {/* Aviso Imutável */}
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-left text-xs text-emerald-300">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  📍 O teu distrito de representação fica associado ao teu perfil para os Rankings Territoriais.
                </span>
              </div>

              {/* Seletor de Distrito */}
              <div className="mt-5 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                  Distrito / Ilhas:
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <select
                    required
                    value={onboardingDistrict}
                    onChange={(e) => setOnboardingDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-500/40 bg-slate-900 pl-10 pr-4 py-3 text-sm font-bold text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-500">
                      Seleciona o teu distrito...
                    </option>
                    {PORTUGAL_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={onboardingSaving || !onboardingDistrict}
                onClick={handleConfirmOnboardingDistrict}
                className="w-full mt-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                {onboardingSaving ? 'A registar distrito...' : 'Confirmar e Entrar no Jogo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header com Navegação */}
      <div className="relative z-20 mx-auto max-w-7xl w-full px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-foreground backdrop-blur-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Início
        </Link>
      </div>

      {/* Cartão Central de Autenticação */}
      <div className="relative z-20 mx-auto w-full max-w-md px-4 py-8 sm:px-0">
        <div className="rounded-3xl border border-primary/20 bg-card/85 p-6 sm:p-8 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          {/* Logo & Título */}
          <div className="text-center">
            <div className="inline-block transform transition hover:scale-105">
              <BrandLogo />
            </div>

            <h1 className="mt-4 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
              {mode === 'login' && 'Entrar na Conta'}
              {mode === 'register' && 'Criar Nova Conta'}
              {mode === 'reset' && 'Recuperar Palavra-passe'}
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              {mode === 'login' && 'Entra com a tua conta para competir nos Rankings e Duelos 1v1.'}
              {mode === 'register' && 'Regista-te e ganha logo 50 moedas e o teu avatar oficial de entrada.'}
              {mode === 'reset' && 'Insere o teu email para redefinir a palavra-passe da tua conta.'}
            </p>
          </div>

          {/* Abas Alternadoras (Login vs Criar Conta) */}
          {mode !== 'reset' && (
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={cn(
                  'rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                  mode === 'login'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Iniciar Sessão
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={cn(
                  'rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                  mode === 'register'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Botão Oficial de Login com Google */}
          {mode !== 'reset' && (
            <div className="mt-6">
              <GoogleAuthButton
                text={mode === 'register' ? 'Criar Conta com Google' : 'Continuar com Google'}
                onError={(err) => setError(err)}
              />

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative bg-card px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                  Ou com Email
                </span>
              </div>
            </div>
          )}

          {/* Mensagens de Alerta / Erro */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-flag-red/30 bg-flag-red/10 p-3.5 text-xs font-medium text-flag-red animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 p-3.5 text-xs font-medium text-primary animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário de Login */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
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
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-2xl bg-primary py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'A autenticar...' : 'Entrar no Jogo'}
              </button>
            </form>
          )}

          {/* Formulário de Criação de Conta */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Nome de Jogador (Nickname)
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

              {/* Seleção de Distrito Obrigatória e Permanente */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Distrito de Origem / Representação *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                  <select
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-500/40 bg-card pl-10 pr-4 py-2.5 text-sm font-bold text-foreground focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="" disabled className="bg-card text-muted-foreground">
                      Seleciona obrigatoriamente o teu distrito...
                    </option>
                    {PORTUGAL_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist} className="bg-card text-foreground">
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Aviso em destaque */}
                <div className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-start gap-2 text-[11px] text-emerald-300">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    📍 O teu distrito de representação fica associado ao teu perfil para os Rankings Territoriais.
                  </span>
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
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'A criar conta...' : 'Criar Conta & Começar'}
              </button>
            </form>
          )}

          {/* Recuperação de Palavra-passe */}
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
                className="w-full rounded-2xl bg-primary py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 transition cursor-pointer disabled:opacity-50"
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
                className="w-full text-center text-xs font-bold text-muted-foreground hover:text-foreground pt-2 cursor-pointer"
              >
                ← Voltar ao ecrã de login
              </button>
            </form>
          )}

          {/* Termos & Privacidade */}
          <div className="pt-4 border-t border-white/5 text-center text-[11px] text-muted-foreground/80 leading-relaxed">
            Ao continuar, concordas com os nossos{' '}
            <Link href="/termos" className="text-primary hover:underline font-semibold">
              Termos
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" className="text-cyan-400 hover:underline font-semibold">
              Política de Privacidade
            </Link>
            .
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-20 text-center text-xs text-muted-foreground pb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>© 2026 Acorda Portugal • Jogo de Perguntas Nacional</span>
        <span className="hidden sm:inline">•</span>
        <div className="flex items-center gap-3">
          <Link href="/termos" className="hover:text-foreground transition-colors">
            Termos
          </Link>
          <span>•</span>
          <Link href="/privacidade" className="hover:text-cyan-300 text-cyan-400/80 transition-colors">
            Privacidade
          </Link>
        </div>
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
