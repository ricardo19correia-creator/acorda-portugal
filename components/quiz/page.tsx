'use client'

import React, { Suspense, useState, useEffect, useMemo, Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { QuizScreen } from '@/components/quiz/quiz-screen'
import { safeRandomUUID } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { AuthWallView } from '@/components/auth-wall-modal'
import { clearAllMatchStorage } from '@/lib/match-storage'
import { RefreshCw } from 'lucide-react'

export interface QuizPageProps {
  categorySlug?: string | null
  subcategorySlug?: string | null
  difficultyParam?: string | null
  districtParam?: string | null
  cityParam?: string | null
  gameId?: string | null
  arenaParam?: string | null
  isFresh?: boolean
}

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
    console.warn('[QuizErrorBoundary] Erro contornado automaticamente:', error, errorInfo)
    clearAllMatchStorage()
  }

  handleRestart = () => {
    clearAllMatchStorage()
    this.setState({ hasError: false })
    if (typeof window !== 'undefined') {
      window.location.href = `/jogar?fresh=true&reset=${Date.now()}`
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl my-auto">
          <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-sm">
            Ocorreu uma inconsistência no carregamento da partida. Clica abaixo para iniciar uma nova ronda limpa.
          </p>
          <button
            type="button"
            onClick={this.handleRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recarregar Partida</span>
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function QuizPageContent(props: QuizPageProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, authResolved } = useAuth()

  const isFresh =
    Boolean(props.isFresh) ||
    searchParams.get('fresh') === 'true' ||
    searchParams.has('reset')

  // 1. Limpeza total de qualquer resíduo de sessão pendente ao montar ou quando fresh=true
  useEffect(() => {
    if (isFresh) {
      clearAllMatchStorage()
    }
  }, [isFresh])

  // 2. Extrair parâmetros flexíveis com prioridade para props e fallback para searchParams
  const rawCategorySlug =
    props.categorySlug ||
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

  const subcategorySlug = props.subcategorySlug || searchParams.get('subcat') || searchParams.get('subcategoria') || null
  const difficulty = props.difficultyParam || searchParams.get('diff') || searchParams.get('dificuldade') || null
  const district = props.districtParam || searchParams.get('dist') || searchParams.get('distrito') || null
  const city = props.cityParam || searchParams.get('city') || searchParams.get('cidade') || null
  const gameIdFromUrl = searchParams.get('game') || searchParams.get('gameId') || null
  const rawArena =
    props.arenaParam ||
    searchParams.get('arena') ||
    searchParams.get('arenaId') ||
    searchParams.get('arena_id') ||
    null

  const cleanRawCat = typeof rawCategorySlug === 'string' ? rawCategorySlug.trim() : null
  const normalizedRawCat =
    cleanRawCat === 'o-meu-distrito' || cleanRawCat === 'distrito'
      ? 'conquista-do-distrito'
      : cleanRawCat

  // Entrada direta no jogo: se não houver categoria explícita, inicia logo 'desafio-nacional'
  const categorySlug =
    normalizedRawCat ||
    (district ? 'conquista-do-distrito' : null) ||
    (city ? 'desafio-cidade' : null) ||
    (gameIdFromUrl ? 'desafio-nacional' : null) ||
    'desafio-nacional'

  const [generatedGameId] = useState<string>(() => safeRandomUUID())
  const gameId = isFresh ? generatedGameId : (props.gameId || gameIdFromUrl || generatedGameId)

  // 🔒 Bloqueio apenas se já resolveu auth e não há utilizador
  if (authResolved && !user) {
    const currentTarget = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : `/jogar?cat=${encodeURIComponent(categorySlug)}`
    return <AuthWallView targetUrl={currentTarget} />
  }

  return (
    <QuizErrorBoundary categorySlug={categorySlug}>
      <div className="relative bg-transparent">
        <QuizScreen
          key={gameId}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
          difficultyParam={difficulty}
          districtParam={district}
          cityParam={city}
          gameId={gameId}
          arenaParam={rawArena}
          isFresh={isFresh}
        />
      </div>
    </QuizErrorBoundary>
  )
}

export function QuizPage(props?: QuizPageProps) {
  return (
    <div className="relative h-full w-full bg-transparent">
      <Suspense fallback={null}>
        <QuizPageContent {...props} />
      </Suspense>
    </div>
  )
}

