'use client'

import React, { Suspense, useEffect, useState, Component, type ErrorInfo, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { GameHub } from '@/components/game-hub'
import { QuizScreen } from '@/components/quiz/quiz-screen'

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
    console.error('[QuizErrorBoundary caught error]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/jogar'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <div className="rounded-3xl border border-red-500/30 bg-slate-900/95 p-8 max-w-md backdrop-blur-xl shadow-2xl text-white">
            <h2 className="font-display text-xl font-bold">
              Ocorreu uma pequena falha na partida
            </h2>
            <p className="mt-2 text-xs text-slate-300">
              O teu progresso está seguro. Clica abaixo para regressar à Central de Jogo.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-display text-xs font-black uppercase text-slate-950 shadow-lg hover:brightness-110 cursor-pointer"
            >
              Voltar à Central de Jogo
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

  // Se passou distrito ou cidade sem cat explícito, ativa o modo correspondente
  const categorySlug =
    rawCategorySlug ||
    (district ? 'o-meu-distrito' : null) ||
    (city ? 'desafio-cidade' : null) ||
    (gameIdFromUrl ? 'desafio-nacional' : null)

  const [generatedGameId] = useState(() => crypto.randomUUID())
  const gameId = gameIdFromUrl ?? generatedGameId

  useEffect(() => {
    if (!categorySlug || gameIdFromUrl) return

    let nextUrl = `/jogar?cat=${encodeURIComponent(categorySlug)}&game=${generatedGameId}`
    if (subcategorySlug) nextUrl += `&subcat=${encodeURIComponent(subcategorySlug)}`
    if (difficulty) nextUrl += `&diff=${encodeURIComponent(difficulty)}`
    if (district) nextUrl += `&dist=${encodeURIComponent(district)}`
    if (city) nextUrl += `&city=${encodeURIComponent(city)}`

    router.replace(nextUrl)
  }, [categorySlug, subcategorySlug, difficulty, district, city, gameIdFromUrl, generatedGameId, router])

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
