'use client'

import React, { Suspense, useState, useEffect, useMemo, Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { QuizScreen } from '@/components/quiz/quiz-screen'
import { safeRandomUUID } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { AuthWallView } from '@/components/auth-wall-modal'

interface ErrorBoundaryProps {
  children: ReactNode
  categorySlug?: string | null
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class QuizErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[QuizErrorBoundary] Erro capturado no ecrã de quiz:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center text-white select-none">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 max-w-md shadow-2xl backdrop-blur-xl space-y-4">
            <h2 className="font-display text-xl font-bold uppercase text-amber-400">
              Desafio Nacional
            </h2>
            <p className="text-xs text-slate-300">
              Ocorreu uma oscilação momentânea na partida.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
            >
              Continuar Partida
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()
  const isFresh = searchParams.get('fresh') === 'true'

  // Limpeza apenas se explicitamente solicitado via fresh=true
  useEffect(() => {
    if (!isFresh) return
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_game_session')
        localStorage.removeItem('active_session_id')
        sessionStorage.removeItem('active_game_session')
        sessionStorage.removeItem('active_session_id')
        sessionStorage.removeItem('ap_error_auto_retried')
      }
    } catch {}
  }, [isFresh])

  // 2. Extrair parâmetros flexíveis com fallback direto para 'desafio-nacional'
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

  const eventId =
    searchParams.get('eventId') ||
    searchParams.get('event_id') ||
    searchParams.get('event') ||
    searchParams.get('evento')
  const eventSlug = searchParams.get('eventSlug') || searchParams.get('event_slug')

  const normalizedRawCat =
    rawCategorySlug === 'o-meu-distrito' || rawCategorySlug === 'distrito'
      ? 'conquista-do-distrito'
      : rawCategorySlug

  // Entrada direta no jogo: se for evento oficial, usa 'portugal-em-jogo'
  const categorySlug =
    normalizedRawCat ||
    (eventId ? 'portugal-em-jogo' : null) ||
    (district ? 'conquista-do-distrito' : null) ||
    (city ? 'desafio-cidade' : null) ||
    (gameIdFromUrl ? 'desafio-nacional' : null) ||
    'desafio-nacional'

  const [generatedGameId] = useState<string>(() => safeRandomUUID())
  const gameId = gameIdFromUrl || generatedGameId

  // 🔒 Bloqueio apenas se já resolveu auth e não há utilizador
  if (authResolved && !user) {
    const currentTarget = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/jogar?cat=${encodeURIComponent(categorySlug)}`
    return <AuthWallView targetUrl={currentTarget} />
  }

  return (
    <QuizErrorBoundary categorySlug={categorySlug}>
      <div className="relative h-full w-full bg-transparent overflow-hidden flex flex-col">
        <QuizScreen
          key={gameId}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
          difficultyParam={difficulty}
          districtParam={district}
          cityParam={city}
          gameId={gameId}
          arenaParam={rawArena}
          eventId={eventId}
          eventSlug={eventSlug}
          isFresh={true}
          userId={user?.uid}
          accountProfile={profile}
        />
      </div>
    </QuizErrorBoundary>
  )
}

export function QuizPage() {
  return (
    <div className="relative h-full w-full bg-transparent overflow-hidden">
      <Suspense fallback={null}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
