'use client'

import React, { Suspense, useState, useEffect, useRef, useMemo, useCallback, Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { GameHub } from '@/components/game-hub'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { safeRandomUUID } from '@/lib/utils'
import { LoadingQuiz } from '@/components/quiz/loading-quiz'
import { useAuth } from '@/components/auth-provider'
import { AuthWallView } from '@/components/auth-wall-modal'

import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  categorySlug?: string | null
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 🔒 Componente de Recuperação Resiliente da Sessão do Desafio
 * - Força o cancelamento imediato de watchers pendentes
 * - Limpa explicitamente do LocalStorage/SessionStorage as chaves da sessão antiga ('active_game_session', etc.)
 * - Elimina o loop visual do loader, permitindo transição direta para novo desafio
 */
function QuizSessionRecoveryView({
  error,
  onReset,
  categorySlug,
}: {
  error: Error | null
  onReset: () => void
  categorySlug?: string | null
}) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const isTriggeredRef = useRef(false)

  // 1. Limpeza de emergência explícita no LocalStorage e SessionStorage
  useEffect(() => {
    try {
      console.error('[CRASH /jogar / RECUPERAÇÃO SESSÃO]: Erro capturado ao inicializar sessão:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_game_session')
        localStorage.removeItem('active_session_id')
        sessionStorage.removeItem('active_game_session')
        sessionStorage.removeItem('active_session_id')
        sessionStorage.removeItem('ap_error_auto_retried')
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('challenge') ||
              key.includes('session'))
          ) {
            localStorage.removeItem(key)
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('challenge') ||
              key.includes('session'))
          ) {
            sessionStorage.removeItem(key)
          }
        }
      }
    } catch (cleanupErr) {
      console.error('[CRASH /jogar]: Erro ao limpar referências corrompidas de sessão:', cleanupErr)
    }
  }, [error])

  const handleStartCleanChallenge = useCallback(() => {
    if (isTriggeredRef.current) return
    isTriggeredRef.current = true

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_game_session')
        localStorage.removeItem('active_session_id')
        sessionStorage.removeItem('active_game_session')
        sessionStorage.removeItem('active_session_id')
        sessionStorage.removeItem('ap_error_auto_retried')
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('challenge') ||
              key.includes('session'))
          ) {
            localStorage.removeItem(key)
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('challenge') ||
              key.includes('session'))
          ) {
            sessionStorage.removeItem(key)
          }
        }
      }
    } catch (cleanupErr) {
      console.error('[QuizSessionRecoveryView] Erro ao limpar storage:', cleanupErr)
    }

    onReset()

    const targetCat = categorySlug || 'desafio-nacional'
    const cleanUrl = `/jogar?cat=${encodeURIComponent(targetCat)}&fresh=true&t=${Date.now()}`
    try {
      router.replace(cleanUrl)
    } catch {
      if (typeof window !== 'undefined') {
        window.location.replace(cleanUrl)
      }
    }
  }, [categorySlug, onReset, router])

  // 2. Failsafe: Quando o timer esgotar, aciona a transição imediata para partida limpa
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleStartCleanChallenge()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [handleStartCleanChallenge])

  return (
    <div className="flex min-h-[60vh] sm:min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl backdrop-blur-md">
          <RefreshCw className="h-8 w-8 text-emerald-400" />
        </div>
      </div>

      <div className="mt-6 max-w-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span>🇵🇹</span>
          <span>Acorda Portugal</span>
        </div>
        <p className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
          Recuperação Resiliente de Desafio
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          A preparar novo desafio limpo em {countdown}s...
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleStartCleanChallenge}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer hover:shadow-emerald-500/40"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Iniciar Novo Desafio Agora</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      {process.env.NODE_ENV !== 'production' && error?.message && (
        <div className="mt-4 max-w-md p-2.5 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
          {error.message}
        </div>
      )}
    </div>
  )
}

export class QuizErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRASH /jogar / RECUPERAÇÃO SESSÃO]: Erro capturado pelo ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <QuizSessionRecoveryView
          error={this.state.error}
          onReset={this.handleReset}
          categorySlug={this.props.categorySlug}
        />
      )
    }
    return this.props.children
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, authResolved, profileLoading } = useAuth()

  const isFresh = searchParams.get('fresh') === 'true'

  // Extrair parâmetros flexíveis com fallbacks seguros
  const rawCategorySlug =
    searchParams.get('cat') ||
    searchParams.get('category') ||
    searchParams.get('categoria') ||
    searchParams.get('theme') ||
    searchParams.get('tema') ||
    searchParams.get('mode') ||
    searchParams.get('modo') ||
    searchParams.get('topic') ||
    searchParams.get('topico') ||
    searchParams.get('event') ||
    searchParams.get('evento')

  const subcategorySlug = searchParams.get('subcat') || searchParams.get('subcategoria')
  const difficulty = searchParams.get('diff') || searchParams.get('dificuldade')
  const district = searchParams.get('dist') || searchParams.get('distrito')
  const city = searchParams.get('city') || searchParams.get('cidade')
  const gameIdFromUrl = searchParams.get('game') || searchParams.get('gameId')
  const rawArena =
    searchParams.get('arena') ||
    searchParams.get('arenaId') ||
    searchParams.get('arena_id')

  // Se passou distrito ou cidade sem cat explícito, ativa o modo correspondente
  const normalizedRawCat =
    rawCategorySlug === 'o-meu-distrito' || rawCategorySlug === 'distrito'
      ? 'conquista-do-distrito'
      : rawCategorySlug

  const categorySlug =
    normalizedRawCat ||
    (district ? 'conquista-do-distrito' : null) ||
    (city ? 'desafio-cidade' : null) ||
    (gameIdFromUrl ? 'desafio-nacional' : null) ||
    (isFresh ? 'desafio-nacional' : null)

  // Gerar ID de partida seguro desde o primeiro instante para evitar renderização com gameId vazio
  const [generatedGameId] = useState<string>(() => (isFresh ? `fresh_${safeRandomUUID()}` : safeRandomUUID()))
  const gameId = isFresh ? generatedGameId : (gameIdFromUrl || generatedGameId || 'sessao-ativa')

  useEffect(() => {
    if (!categorySlug || (gameIdFromUrl && !isFresh)) return

    try {
      let nextUrl = `/jogar?cat=${encodeURIComponent(categorySlug)}&game=${gameId}`
      if (subcategorySlug) nextUrl += `&subcat=${encodeURIComponent(subcategorySlug)}`
      if (difficulty) nextUrl += `&diff=${encodeURIComponent(difficulty)}`
      if (district) nextUrl += `&dist=${encodeURIComponent(district)}`
      if (city) nextUrl += `&city=${encodeURIComponent(city)}`
      if (rawArena) nextUrl += `&arena=${encodeURIComponent(rawArena)}`
      if (isFresh) nextUrl += '&fresh=true'

      router.replace(nextUrl)
    } catch (e) {
      console.warn('[QuizPageContent] Erro na navegação de parâmetros:', e)
    }
  }, [categorySlug, subcategorySlug, difficulty, district, city, rawArena, gameIdFromUrl, gameId, isFresh, router])

  // Blindagem do Ciclo de Vida da Sessão Firebase com Failsafe de 6 segundos:
  const [authFailsafeTriggered, setAuthFailsafeTriggered] = useState(false)

  useEffect(() => {
    if (authResolved && !(user && profileLoading)) return

    const timer = setTimeout(() => {
      console.warn('[QuizPageContent] Timeout de segurança (6s) na sincronização Firebase Auth/Perfil. A forçar liberação do ecrã...')
      setAuthFailsafeTriggered(true)
    }, 6000)

    return () => clearTimeout(timer)
  }, [authResolved, user, profileLoading])

  if (!authFailsafeTriggered && (!authResolved || (user && profileLoading))) {
    return <LoadingQuiz message="A sincronizar sessão..." submessage="A preparar os dados de jogador..." />
  }

  // 🔒 BLOQUEIO DEFINITIVO DE CONVIDADO / NÃO AUTENTICADO
  if (categorySlug && !user) {
    const currentTarget = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/jogar?cat=${encodeURIComponent(categorySlug)}`
    return <AuthWallView targetUrl={currentTarget} />
  }

  return (
    <QuizErrorBoundary categorySlug={categorySlug}>
      <div className="relative bg-transparent">
        {categorySlug ? (
          <QuizScreen
            key={`${gameId}_${isFresh ? 'fresh' : 'normal'}`}
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
            difficultyParam={difficulty}
            districtParam={district}
            cityParam={city}
            gameId={gameId}
            arenaParam={rawArena}
            isFresh={isFresh}
          />
        ) : (
          <GameHub />
        )}
      </div>
    </QuizErrorBoundary>
  )
}

export function QuizPage() {
  return (
    <div className="relative h-full w-full bg-transparent">
      <Suspense fallback={<LoadingQuiz message="A carregar desafio..." />}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
