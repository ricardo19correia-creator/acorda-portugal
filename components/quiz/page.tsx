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
    console.warn('[QuizErrorBoundary] Erro contornado automaticamente:', error, errorInfo)
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_game_session')
        localStorage.removeItem('active_session_id')
        sessionStorage.removeItem('active_game_session')
        sessionStorage.removeItem('active_session_id')
        sessionStorage.removeItem('ap_error_auto_retried')
      }
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <QuizScreen
          key={safeRandomUUID()}
          categorySlug={this.props.categorySlug || 'desafio-nacional'}
          gameId={safeRandomUUID()}
          isFresh={true}
        />
      )
    }
    return this.props.children
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, authResolved } = useAuth()

  // 1. Limpeza total de qualquer resíduo de sessão pendente ao montar
  useEffect(() => {
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
              key.includes('session') ||
              key.includes('challenge'))
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
              key.includes('session') ||
              key.includes('challenge'))
          ) {
            sessionStorage.removeItem(key)
          }
        }
      }
    } catch {}
  }, [])

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

  const normalizedRawCat =
    rawCategorySlug === 'o-meu-distrito' || rawCategorySlug === 'distrito'
      ? 'conquista-do-distrito'
      : rawCategorySlug

  // Entrada direta no jogo: se não houver categoria explícita, inicia logo 'desafio-nacional'
  const categorySlug =
    normalizedRawCat ||
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
          isFresh={true}
        />
      </div>
    </QuizErrorBoundary>
  )
}

export function QuizPage() {
  return (
    <div className="relative h-full w-full bg-transparent">
      <Suspense fallback={null}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
