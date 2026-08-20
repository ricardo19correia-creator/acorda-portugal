'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { GameHub } from '@/components/game-hub'
import { QuizScreen } from '@/components/quiz/quiz-screen'

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorySlug = searchParams.get('cat')
  const subcategorySlug = searchParams.get('subcat')
  const difficulty = searchParams.get('diff')
  const district = searchParams.get('dist')
  const city = searchParams.get('city')
  const gameIdFromUrl = searchParams.get('game')
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
    <main className="relative">
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
    </main>
  )
}

export function QuizPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <Suspense fallback={null}>
        <QuizPageContent />
      </Suspense>
    </div>
  )
}
