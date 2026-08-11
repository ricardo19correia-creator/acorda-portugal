import type { Metadata } from 'next'
import { BackgroundFx } from '@/components/background-fx'
import { QuizScreen } from '@/components/quiz/quiz-screen'

export const metadata: Metadata = {
  title: 'A jogar — Acorda Portugal',
  description: 'Responde às perguntas antes que o tempo acabe e conquista o topo de Portugal.',
}

export default function JogarPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />
      <main className="relative">
        <QuizScreen />
      </main>
    </div>
  )
}
