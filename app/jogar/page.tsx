'use client'

import { useSearchParams } from 'next/navigation'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { Categories } from '@/components/categories'
import { BackgroundFx } from '@/components/background-fx'

export default function PlayPage() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('cat')

  return (
    <div className="relative min-h-screen">
      <BackgroundFx />
      <main className="relative">
        {categorySlug ? <QuizScreen categorySlug={categorySlug} /> : <Categories />}
      </main>
    </div>
  )
}