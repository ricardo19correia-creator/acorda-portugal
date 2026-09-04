'use client'

import React, { Suspense, useEffect, useState, Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { GameHub } from '@/components/game-hub'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { safeRandomUUID } from '@/lib/utils'

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

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: false, error: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[QUIZ_NON_FATAL_RECOVERED]', error, errorInfo)
  }

  render() {
    return this.props.children
  }
}

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extrair parâmetros flexíveis
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

    let nextUrl = `/jogar?cat=${encodeURIComponent(categorySlug)}&game=${generatedGameId}`
    if (subcategorySlug) nextUrl += `&subcat=${encodeURIComponent(subcategorySlug)}`
    if (difficulty) nextUrl += `&diff=${encodeURIComponent(difficulty)}`
    if (district) nextUrl += `&dist=${encodeURIComponent(district)}`
    if (city) nextUrl += `&city=${encodeURIComponent(city)}`
    if (rawArena) nextUrl += `&arena=${encodeURIComponent(rawArena)}`

    router.replace(nextUrl)
  }, [categorySlug, subcategorySlug, difficulty, district, city, rawArena, gameIdFromUrl, generatedGameId, router])

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
      <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
