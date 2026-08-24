'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { ArenaDynamicBackground } from '@/components/arena-dynamic-background'
import { GameHub } from '@/components/game-hub'
import { QuizScreen } from '@/components/quiz/quiz-screen'

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extrair parâmetros flexíveis (qualquer nome de parâmetro suportado)
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
    <div className="relative bg-transparent">
      {categorySlug ? (
        <QuizScreen
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
  )
}

export function QuizPage() {
  return (
    <div className="relative min-h-screen bg-transparent">
      <Suspense fallback={null}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
