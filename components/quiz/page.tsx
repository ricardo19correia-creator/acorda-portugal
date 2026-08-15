'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { Categories } from '@/components/categories'
import { QuizScreen } from '@/components/quiz/quiz-screen'

function QuizPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categorySlug = searchParams.get('cat')
  const gameIdFromUrl = searchParams.get('game')
  const [generatedGameId] = useState(() => crypto.randomUUID())
  const gameId = gameIdFromUrl ?? generatedGameId

  useEffect(() => {
    if (!categorySlug || gameIdFromUrl) return

    router.replace(`/jogar?cat=${encodeURIComponent(categorySlug)}&game=${generatedGameId}`)
  }, [categorySlug, gameIdFromUrl, generatedGameId, router])

  return (
    <main className="relative">
      {categorySlug ? (
        <QuizScreen categorySlug={categorySlug} gameId={gameId} />
      ) : (
        <Categories />
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
