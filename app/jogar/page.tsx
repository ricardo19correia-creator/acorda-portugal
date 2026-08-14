'use client'

import { useSearchParams } from 'next/navigation'
import { BackgroundFx } from '@/components/background-fx'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { Categories } from '@/components/categories'

export default function JogarPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('cat')

  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <main className="relative">
        {category ? (
          <QuizScreen category={category} />
        ) : (
          <Categories />
        )}
      </main>
    </div>
  )
}