'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BackgroundFx } from '@/components/background-fx'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { Categories } from '@/components/categories'

function JogarContent() {
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

export default function JogarPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <Suspense fallback={null}>
        <JogarContent />
      </Suspense>
    </div>
  )
}