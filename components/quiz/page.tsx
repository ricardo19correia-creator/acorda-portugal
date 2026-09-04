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

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
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
    console.error('[CRASH /jogar]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <LoadingQuiz message="A recuperar sessão do desafio..." />
    }
    return this.props.children
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, authResolved, profileLoading } = useAuth()

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
  const categorySlug =
    rawCategorySlug ||
    (district ? 'o-meu-distrito' : null) ||
    (city ? 'desafio-cidade' : null) ||
    (gameIdFromUrl ? 'desafio-nacional' : null)

  const [generatedGameId] = useState(() => safeRandomUUID())
  const gameId = gameIdFromUrl ?? generatedGameId

  useEffect(() => {
    if (!categorySlug || gameIdFromUrl) return

    try {
      let nextUrl = `/jogar?cat=${encodeURIComponent(categorySlug)}&game=${generatedGameId}`
      if (subcategorySlug) nextUrl += `&subcat=${encodeURIComponent(subcategorySlug)}`
      if (difficulty) nextUrl += `&diff=${encodeURIComponent(difficulty)}`
      if (district) nextUrl += `&dist=${encodeURIComponent(district)}`
      if (city) nextUrl += `&city=${encodeURIComponent(city)}`
      if (rawArena) nextUrl += `&arena=${encodeURIComponent(rawArena)}`

      router.replace(nextUrl)
    } catch (e) {
      console.warn('[QuizPageContent] Erro na navegação de parâmetros:', e)
    }
  }, [categorySlug, subcategorySlug, difficulty, district, city, rawArena, gameIdFromUrl, generatedGameId, router])

  // Blindagem do Ciclo de Vida da Sessão Firebase:
  // Impede a montagem do motor de quiz e o acesso a user.uid enquanto a autenticação/perfil sincronizam
  if (!authResolved || (user && profileLoading)) {
    return <LoadingQuiz message="A sincronizar sessão..." submessage="A preparar os dados de jogador..." />
  }

  return (
    <QuizErrorBoundary>
      <div className="relative bg-transparent">
        {categorySlug ? (
          <QuizScreen
            key={gameId}
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
            difficultyParam={difficulty}
            districtParam={district}
            cityParam={city}
            gameId={gameId}
            arenaParam={rawArena}
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
