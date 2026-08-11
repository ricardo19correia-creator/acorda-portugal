import type { Metadata } from 'next'
import { BackgroundFx } from '@/components/background-fx'
import { QuizScreen } from '@/components/quiz/quiz-screen'
import { GoogleLogin } from '@/components/auth/google'

export const metadata: Metadata = {
  title: 'A jogar — Acorda Portugal',
  description:
    'Responde às perguntas antes que o tempo acabe e conquista o topo de Portugal.',
}

export default function JogarPage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <header className="relative z-20 flex justify-end px-4 py-4 sm:px-6">
        <GoogleLogin />
      </header>

      <main className="relative">
        <QuizScreen />
      </main>
    </div>
  )
}