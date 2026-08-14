'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { BackgroundFx } from '@/components/background-fx'
import { Categories } from '@/components/categories'
import { QuizScreen } from '@/components/quiz/quiz-screen'

function QuizPageContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('cat')

  return (
    <main className="relative">
      {categorySlug ? (
        <QuizScreen categorySlug={categorySlug} />
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
