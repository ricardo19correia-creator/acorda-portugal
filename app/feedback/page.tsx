'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageSquarePlus,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LogIn,
  HelpCircle,
  Info,
  ShieldCheck,
  User,
  History,
  Smartphone,
  Check,
} from 'lucide-react'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { BackgroundFx } from '@/components/background-fx'
import { GlobalBackButton } from '@/components/navigation/GlobalBackButton'
import { UserAvatar } from '@/components/user-avatar'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import {
  type FeedbackType,
  type FeedbackLocation,
  type FeedbackItem,
  FEEDBACK_TYPES,
  FEEDBACK_STATUSES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_LOCATIONS,
  APP_FEEDBACK_VERSION,
} from '@/types/feedback'
import { cn } from '@/lib/utils'

const COOLDOWN_SECONDS = 60
const STORAGE_KEY_COOLDOWN = 'ap_feedback_last_submit'

function sanitizeInput(text: string): string {
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export default function FeedbackPage() {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()

  // Tab: 'form' | 'my-feedbacks'
  const [activeTab, setActiveTab] = useState<'form' | 'my-feedbacks'>('form')

  // Form State
  const [type, setType] = useState<FeedbackType>('erro')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState<FeedbackLocation>('Jogar')
  const [reproductionSteps, setReproductionSteps] = useState('')

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Anti-Spam Cooldown Timer
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  // User's own feedbacks state
  const [myFeedbacks, setMyFeedbacks] = useState<FeedbackItem[]>([])
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true)
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null)

  // Detect Platform
  const detectPlatform = useCallback((): string => {
    if (typeof window === 'undefined') return 'web'
    const isCapacitor = Boolean(
      ((window as any).Capacitor &&
        typeof (window as any).Capacitor.isNativePlatform === 'function' &&
        (window as any).Capacitor.isNativePlatform()) ||
        (window as any).Capacitor?.platform === 'android' ||
        navigator.userAgent.includes('Capacitor')
    )
    if (isCapacitor) return 'android'
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return 'ios'
    if (/Android/i.test(navigator.userAgent)) return 'android-browser'
    return 'web'
  }, [])

  // Check cooldown on mount and interval
  useEffect(() => {
    const checkCooldown = () => {
      try {
        const lastSubmit = localStorage.getItem(STORAGE_KEY_COOLDOWN)
        if (lastSubmit) {
          const elapsed = Math.floor((Date.now() - Number(lastSubmit)) / 1000)
          if (elapsed < COOLDOWN_SECONDS) {
            setCooldownRemaining(COOLDOWN_SECONDS - elapsed)
            return
          }
        }
        setCooldownRemaining(0)
      } catch {
        setCooldownRemaining(0)
      }
    }

    checkCooldown()
    const timer = setInterval(checkCooldown, 1000)
    return () => clearInterval(timer)
  }, [])

  // Realtime listener for User's Feedbacks
  useEffect(() => {
    if (!user?.uid) {
      setMyFeedbacks([])
      setLoadingFeedbacks(false)
      return
    }

    setLoadingFeedbacks(true)
    const q = query(
      collection(db, 'feedback'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: FeedbackItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
        setMyFeedbacks(items)
        setLoadingFeedbacks(false)
      },
      (err) => {
        console.warn('[FEEDBACK] Erro ao carregar feedbacks do utilizador:', err)
        setLoadingFeedbacks(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid])

  // Form Validation
  const isFormValid = useMemo(() => {
    const cleanTitle = sanitizeInput(title)
    const cleanDesc = sanitizeInput(description)
    return cleanTitle.length >= 4 && cleanTitle.length <= 100 && cleanDesc.length >= 15 && cleanDesc.length <= 2000
  }, [title, description])

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setErrorMessage('Precisas de iniciar sessão para enviar feedback.')
      return
    }

    if (cooldownRemaining > 0) {
      setErrorMessage(`Aguarda mais ${cooldownRemaining}s antes de enviar outro feedback.`)
      return
    }

    if (!isFormValid) {
      setErrorMessage('Por favor, preenche o título (mín. 4 letras) e descrição (mín. 15 letras).')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const sanitizedTitle = sanitizeInput(title)
      const sanitizedDescription = sanitizeInput(description)
      const sanitizedSteps = sanitizeInput(reproductionSteps)

      const feedbackData = {
        userId: user.uid,
        userDisplayName: user.displayName || profile?.displayName || 'Jogador Anónimo',
        userEmail: user.email || '',
        userPhotoURL: profile?.photoURL || user.photoURL || '',
        type,
        title: sanitizedTitle,
        description: sanitizedDescription,
        location: location || 'Outro',
        reproductionSteps: type === 'erro' ? sanitizedSteps : '',
        status: 'NEW',
        priority: 'MEDIUM',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        appVersion: APP_FEEDBACK_VERSION,
        platform: detectPlatform(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }

      await addDoc(collection(db, 'feedback'), feedbackData)

      // Record cooldown in localStorage
      try {
        localStorage.setItem(STORAGE_KEY_COOLDOWN, Date.now().toString())
        setCooldownRemaining(COOLDOWN_SECONDS)
      } catch {}

      // Reset form
      setTitle('')
      setDescription('')
      setReproductionSteps('')
      setSubmitSuccess(true)
    } catch (err: any) {
      console.error('[FEEDBACK SUBMIT ERROR]', err)
      setErrorMessage(
        err?.message || 'Ocorreu um erro ao submeter o feedback. Por favor, tenta novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedTypeConfig = FEEDBACK_TYPES.find((t) => t.id === type) || FEEDBACK_TYPES[0]

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-emerald-500 selection:text-black">
      <BackgroundFx variant="default" />

      {/* Cabeçalho Oficial */}
      <SiteHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-3 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto w-full">
        {/* Glow de fundo */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 sm:w-[540px] h-64 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-64 left-1/2 -translate-x-1/2 w-64 sm:w-72 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Barra Superior de Controlo / Voltar */}
        <div className="w-full flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <GlobalBackButton showAlways={true} fallbackUrl="/" variant="header" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Desafio Nacional
            </span>
          </div>

          {/* Badge Beta Público */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-mono text-[11px]">BETA PÚBLICO</span>
          </div>
        </div>

        {/* Cartão de Cabeçalho Oficial */}
        <div className="w-full rounded-3xl border border-white/15 bg-slate-950/75 backdrop-blur-xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-center space-y-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <MessageSquarePlus className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white leading-tight">
              AJUDA A MELHORAR O DESAFIO NACIONAL
            </h1>
            <p className="font-display text-sm sm:text-base font-bold text-emerald-400">
              O teu feedback ajuda a construir o futuro do jogo.
            </p>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-medium">
            O Desafio Nacional está em Beta público e em desenvolvimento contínuo. Encontraste um erro?
            Tens uma ideia? Há alguma coisa que gostarias de ver no jogo? Envia-nos o teu feedback.
            As tuas sugestões ajudam-nos a corrigir problemas, melhorar funcionalidades e criar novas
            experiências para todos os jogadores.
          </p>

          {/* Aviso Beta Informativo */}
          <div className="mt-4 p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-left flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-bold">Nota Beta:</strong> Algumas funcionalidades
              podem ainda sofrer alterações ou apresentar erros. Acompanhamos diariamente os relatos
              para afinar o ritmo competitivo e a estabilidade de cada partida.
            </p>
          </div>
        </div>

        {/* Alternador de Secções: Enviar Feedback vs Os Meus Feedbacks */}
        <div className="w-full flex rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 backdrop-blur-md mb-6 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
              activeTab === 'form'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-feedbacks')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative',
              activeTab === 'my-feedbacks'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <History className="w-3.5 h-3.5" />
            <span>Os Meus Feedbacks</span>
            {myFeedbacks.length > 0 && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black',
                  activeTab === 'my-feedbacks'
                    ? 'bg-slate-950 text-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                )}
              >
                {myFeedbacks.length}
              </span>
            )}
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: FORMULÁRIO */}
        {activeTab === 'form' && (
          <div className="w-full">
            {!authResolved ? (
              <div className="w-full rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  A verificar sessão...
                </span>
              </div>
            ) : !user ? (
              /* Bloqueio Elegante de Autenticação */
              <div className="w-full rounded-3xl border border-amber-500/30 bg-slate-950/85 backdrop-blur-xl p-8 sm:p-12 text-center space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                  <LogIn className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Acesso Autenticado
                  </span>
                  <h2 className="font-display text-2xl font-black uppercase text-white">
                    Inicia sessão para enviar feedback.
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Para garantir a qualidade dos relatórios e permitir-te acompanhar o progresso das
                    tuas sugestões, precisas de ter sessão iniciada.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/entrar?redirect=/feedback"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>INICIAR SESSÃO</span>
                  </Link>
                </div>
              </div>
            ) : submitSuccess ? (
              /* Ecrã de Sucesso */
              <div className="w-full rounded-3xl border border-emerald-500/30 bg-slate-950/85 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                    Obrigado pelo teu feedback!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    A tua mensagem foi registada com sucesso e associada à tua conta. A equipa de
                    desenvolvimento irá analisar as informações.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false)
                      setActiveTab('my-feedbacks')
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                  >
                    Ver os Meus Feedbacks
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-display font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    Enviar Outro Feedback
                  </button>
                </div>
              </div>
            ) : (
              /* Formulário Principal */
              <form
                onSubmit={handleSubmit}
                className="w-full rounded-3xl border border-white/15 bg-slate-950/85 backdrop-blur-xl p-5 sm:p-8 shadow-2xl space-y-6"
              >
                {/* 1. Tipo de Feedback (Interactive Grid) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                    Tipo de Feedback *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {FEEDBACK_TYPES.map((t) => {
                      const isSelected = type === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id)}
                          className={cn(
                            'flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer',
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/25'
                          )}
                        >
                          <span className="text-xl shrink-0 mt-0.5">{t.emoji}</span>
                          <div className="min-w-0">
                            <span
                              className={cn(
                                'block font-display text-xs font-black uppercase tracking-wide',
                                isSelected ? 'text-emerald-300' : 'text-slate-200'
                              )}
                            >
                              {t.label}
                            </span>
                            <span className="block text-[11px] text-slate-400 leading-snug mt-0.5">
                              {t.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Título */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="feedback-title"
                      className="text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Título do Feedback *
                    </label>
                    <span
                      className={cn(
                        'text-[10px] font-mono',
                        title.length > 100 ? 'text-rose-400 font-bold' : 'text-slate-500'
                      )}
                    >
                      {title.length}/100
                    </span>
                  </div>
                  <input
                    id="feedback-title"
                    type="text"
                    required
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex.: O cronómetro não parou quando respondi"
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>

                {/* 3. Descrição */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="feedback-desc"
                      className="text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Descrição Detalhada *
                    </label>
                    <span
                      className={cn(
                        'text-[10px] font-mono',
                        description.length < 15
                          ? 'text-amber-400'
                          : description.length > 2000
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-500'
                      )}
                    >
                      {description.length}/2000 (mín. 15)
                    </span>
                  </div>
                  <textarea
                    id="feedback-desc"
                    required
                    rows={4}
                    maxLength={2000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explica-nos o que aconteceu ou o que gostarias de melhorar..."
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/90 p-4 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* 4. Onde aconteceu? (Localização) */}
                <div>
                  <label
                    htmlFor="feedback-location"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Onde aconteceu? (Opcional)
                  </label>
                  <select
                    id="feedback-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as FeedbackLocation)}
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                  >
                    {FEEDBACK_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-slate-900 text-white">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Passos para Reproduzir (Destacado para Erros) */}
                {type === 'erro' && (
                  <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-rose-300 font-display text-xs font-bold uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Como podemos reproduzir o problema? (Opcional)</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={reproductionSteps}
                      onChange={(e) => setReproductionSteps(e.target.value)}
                      placeholder="Entrei numa partida, respondi à pergunta e..."
                      className="w-full rounded-xl border border-white/15 bg-slate-900/90 p-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Info do Utilizador Conectado (Automático) */}
                <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      avatarUrl={profile?.photoURL || user.photoURL || DEFAULT_AVATAR.image}
                      size="sm"
                    />
                    <div>
                      <span className="block font-bold text-white">
                        {user.displayName || profile?.displayName || 'Jogador'}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {user.email || 'Conta Vinculada'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 block">
                      v{APP_FEEDBACK_VERSION}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      {detectPlatform()}
                    </span>
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Botão de Submissão com Cooldown */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid || cooldownRemaining > 0}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A ENVIAR FEEDBACK...</span>
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>AGUARDA {cooldownRemaining}S PARA NOVO ENVIO</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>ENVIAR FEEDBACK</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* CONTEÚDO DA ABA 2: OS MEUS FEEDBACKS */}
        {activeTab === 'my-feedbacks' && (
          <div className="w-full space-y-4">
            {!user ? (
              <div className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-8 text-center space-y-3">
                <User className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-display text-lg font-black uppercase text-white">
                  Sessão Necessária
                </h3>
                <p className="text-xs text-slate-400">
                  Inicia sessão para consultares os teus feedbacks submetidos.
                </p>
                <Link
                  href="/entrar?redirect=/feedback"
                  className="inline-block px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider mt-2"
                >
                  Iniciar Sessão
                </Link>
              </div>
            ) : loadingFeedbacks ? (
              <div className="w-full rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  A carregar os teus feedbacks...
                </span>
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-10 text-center space-y-3">
                <MessageSquarePlus className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="font-display text-base font-black uppercase text-white">
                  Ainda não enviaste nenhum feedback
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Encontraste alguma anomalia ou tens uma sugestão para o jogo? Envia a tua ideia no
                  formulário.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Escrever Novo Feedback
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Submetido: <span className="text-emerald-400">{myFeedbacks.length}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Sincronização em tempo real
                  </span>
                </div>

                {myFeedbacks.map((item) => {
                  const typeCfg = FEEDBACK_TYPES.find((t) => t.id === item.type) || FEEDBACK_TYPES[0]
                  const statusCfg = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.NEW
                  const isExpanded = expandedFeedbackId === item.id

                  const dateFormatted = item.createdAt?.toDate
                    ? item.createdAt.toDate().toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recente'

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-md overflow-hidden transition-all hover:border-white/20"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFeedbackId(isExpanded ? null : item.id)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border',
                                typeCfg.badgeClass
                              )}
                            >
                              <span>{typeCfg.emoji}</span>
                              <span>{typeCfg.label}</span>
                            </span>

                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                                statusCfg.badgeClass
                              )}
                            >
                              <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dotClass)} />
                              <span>{statusCfg.label}</span>
                            </span>

                            {item.location && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {item.location}
                              </span>
                            )}
                          </div>

                          <h4 className="font-display font-black text-sm text-white truncate">
                            {item.title}
                          </h4>

                          <p className="text-slate-400 text-xs line-clamp-1">
                            {item.description}
                          </p>

                          <span className="block text-[10px] text-slate-500 font-mono">
                            {dateFormatted}
                          </span>
                        </div>

                        <div className="pt-1 text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3.5 text-xs text-slate-300">
                          <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Descrição Completa:
                            </span>
                            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-white/5">
                              {item.description}
                            </p>
                          </div>

                          {item.reproductionSteps && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Passos para Reproduzir:
                              </span>
                              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-white/5">
                                {item.reproductionSteps}
                              </p>
                            </div>
                          )}

                          {/* Resposta / Nota Administrativa */}
                          {item.adminNotes && (
                            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                💬 Nota da Equipa de Desenvolvimento:
                              </span>
                              <p className="text-emerald-200 leading-relaxed">
                                {item.adminNotes}
                              </p>
                            </div>
                          )}

                          {item.resolvedAt && (
                            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium">
                              <Check className="w-4 h-4 text-emerald-400" />
                              <span>
                                Resolvido{' '}
                                {item.resolvedBy ? `por ${item.resolvedBy}` : 'pela administração'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
