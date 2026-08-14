'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
ArrowLeft,
Sparkles,
CheckCircle2,
XCircle,
ChevronRight,
Lightbulb,
} from 'lucide-react'

import {
  ALL_QUIZ_QUESTIONS,
  CATEGORIES,
MODO_MALUCO_QUESTIONS,
type QuizQuestion,
} from '@/lib/game-data'

import { QuizProgress } from '@/components/quiz/quiz-progress'
import {
AnswerOption,
type AnswerState,
} from '@/components/quiz/answer-option'
import {
ResultScreen,
type QuizResult,
} from '@/components/quiz/result-screen'
import { cn } from '@/lib/utils'

const MAX_SECONDS = 20
const QUESTIONS_PER_GAME = 20

type Phase = 'answering' | 'revealed' | 'finished'

type GameQuestion = QuizQuestion

function shuffle<T>(array: T[]): T[] {
const copy = [...array]

for (let i = copy.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1))
;[copy[i], copy[j]] = [copy[j], copy[i]]
}

return copy
}

function createGameQuestions(categorySlug: string): GameQuestion[] {
  const category = CATEGORIES.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug)
  let questionPool: QuizQuestion[] = []

  if (category) {
    questionPool =
      category.name === 'Modo Maluco'
        ? MODO_MALUCO_QUESTIONS
        : ALL_QUIZ_QUESTIONS.filter((q) => q.category === category.name)
  }

const selected = shuffle(questionPool).slice(
0,
    Math.min(QUESTIONS_PER_GAME, questionPool.length),
)

return selected.map((question, index) => {
const shuffledOptions = shuffle(question.options)

const correctOption = shuffledOptions.find(
  (option) => option.key === question.correct,
)

if (!correctOption) {
  return {
    ...question,
    index: index + 1,
    total: selected.length,
  }
}

const options = shuffledOptions.map((option, optionIndex) => ({
  key: ['A', 'B', 'C', 'D'][optionIndex] as
    | 'A'
    | 'B'
    | 'C'
    | 'D',
  text: option.text,
}))

const newCorrectKey = options.find(
  (option) => option.text === correctOption.text,
)?.key

return {
  ...question,
  index: index + 1,
  total: selected.length,
  options,
  correct: newCorrectKey ?? 'A',
}

})
}

export function QuizScreen({ categorySlug }: { categorySlug: string }) {
  const router = useRouter()
  const category = CATEGORIES.find(c => c.slug === categorySlug)

  const [quizQuestions, setQuizQuestions] = useState<GameQuestion[]>(
    () => createGameQuestions(categorySlug),
)

const total = quizQuestions.length

const [step, setStep] = useState(0)
const [phase, setPhase] = useState<Phase>('answering')
const [selected, setSelected] = useState<
'A' | 'B' | 'C' | 'D' | null

> (null)

const [seconds, setSeconds] = useState(MAX_SECONDS)
const [score, setScore] = useState(0)
const [correctCount, setCorrectCount] = useState(0)
const [streak, setStreak] = useState(0)
const [bestStreak, setBestStreak] = useState(0)

const q = quizQuestions[step]

const wasCorrect = selected === q?.correct

const reveal = useCallback(
(choice: 'A' | 'B' | 'C' | 'D' | null) => {
if (phase !== 'answering' || !q) return

  setSelected(choice)

  const hit = choice === q.correct

  if (hit) {
    const timeBonus = Math.round(
      (seconds / MAX_SECONDS) * 200,
    )

    const nextStreak = streak + 1

    setScore(
      (currentScore) =>
        currentScore + q.points + timeBonus,
    )

    setCorrectCount((current) => current + 1)
    setStreak(nextStreak)

    setBestStreak(
      (best) => Math.max(best, nextStreak),
    )
  } else {
    setStreak(0)
  }

  setPhase('revealed')
},
[phase, q, seconds, streak],

)

useEffect(() => {
  if (phase !== 'answering') return

  if (seconds <= 0) {
    return
  }

  const timer = setTimeout(() => {
    if (seconds <= 1) {
      reveal(null)
      return
    }

    setSeconds((current) => current - 1)
  }, 1000)

  return () => clearTimeout(timer)
}, [phase, seconds, reveal])

const next = () => {
if (step + 1 >= total) {
setPhase('finished')
return
}

setStep((current) => current + 1)
setSelected(null)
setSeconds(MAX_SECONDS)
setPhase('answering')

}

const restart = () => {
setQuizQuestions(createGameQuestions(categorySlug))
setStep(0)
setSelected(null)
setSeconds(MAX_SECONDS)
setScore(0)
setCorrectCount(0)
setStreak(0)
setBestStreak(0)
setPhase('answering')
}

const result: QuizResult = useMemo(
() => ({
score,
correct: correctCount,
total,
xp:
correctCount * 50 +
Math.round(score / 10),
euros: correctCount * 20,
bestStreak,
}),
[
score,
correctCount,
total,
bestStreak,
],
)

if (!q) {
return ( <div className="flex min-h-screen items-center justify-center px-6"> <div className="max-w-md text-center"> <h1 className="font-display text-2xl font-bold">
        Não existem perguntas para a categoria &quot;{category?.name || categorySlug}&quot;.
      </h1>

      <p className="mt-3 text-muted-foreground">
        Verifica o ficheiro lib/game-data.ts.
      </p>

      <Link
        href="/jogar"
        className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        Voltar ao início
      </Link>
    </div>
  </div>
)

}

if (phase === 'finished') {
return ( <div className="min-h-screen px-4 py-8"> <div className="mx-auto max-w-2xl"> <ResultScreen
         result={result}
         onRestart={restart}
       /> </div> </div>
)
}

const stateFor = (
key: 'A' | 'B' | 'C' | 'D',
): AnswerState => {
if (phase === 'answering') {
return 'idle'
}

if (key === q.correct) {
  return 'correct'
}

if (key === selected) {
  return 'wrong'
}

return 'muted'

}

return ( <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6 sm:px-6">

  {/* TOP BAR */}
  <div className="flex items-center justify-between gap-4">
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-4 py-2 font-bold transition hover:bg-white/10"
    >
      <ArrowLeft className="h-4 w-4" />
      Sair
    </Link>

    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2">
      <Sparkles className="h-4 w-4 text-gold" />

      <span className="font-bold">
        +{q.points} XP
      </span>
    </div>
  </div>

  {/* MODO MALUCO */}
  <div className="mt-6 text-center">
    <span className="rounded-full border border-flag-red/40 bg-flag-red/10 px-4 py-2 text-sm font-bold text-flag-red">
        🤪 {category?.name || categorySlug}
    </span>
  </div>

  {/* PROGRESS + TIMER */}
  <div className="mt-6">
    <QuizProgress
      index={step + 1}
      total={total}
      seconds={seconds}
      maxSeconds={MAX_SECONDS}
    />
  </div>

  {/* QUESTION */}
  <div className="mt-8 rounded-3xl border border-white/10 bg-card/60 p-6 text-center backdrop-blur sm:p-8">
    <h1 className="text-balance font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl">
      {q.question}
    </h1>
  </div>

  {/* ANSWERS */}
  <div className="mt-5 grid gap-3">
    {q.options.map((opt) => (
      <AnswerOption
        key={opt.key}
        optionKey={opt.key}
        text={opt.text}
        state={stateFor(opt.key)}
        disabled={phase !== 'answering'}
        onSelect={() => reveal(opt.key)}
      />
    ))}
  </div>

  {/* FEEDBACK */}
  {phase === 'revealed' && (
    <div className="animate-rise mt-5">

      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border p-4',
          wasCorrect
            ? 'border-primary/40 bg-primary/10'
            : 'border-flag-red/40 bg-flag-red/10',
        )}
      >

        {wasCorrect ? (
          <CheckCircle2 className="h-7 w-7 shrink-0 text-primary" />
        ) : (
          <XCircle className="h-7 w-7 shrink-0 text-flag-red" />
        )}

        <div>
          <p
            className={cn(
              'font-display text-lg font-black uppercase',
              wasCorrect
                ? 'text-primary'
                : 'text-flag-red',
            )}
          >
            {wasCorrect
              ? 'Correto!'
              : selected
                ? 'Errado!'
                : 'Tempo esgotado!'}
          </p>

          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />

            {q.explanation}
          </p>
        </div>
      </div>

      {/* NEXT */}
      <button
        type="button"
        onClick={next}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-4 font-display font-bold uppercase tracking-wide text-primary-foreground shadow-[0_12px_40px_-8px_var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[position:100%_0] focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        {step + 1 >= total
          ? 'Ver resultado'
          : 'Próxima pergunta'}

        <ChevronRight className="h-5 w-5" />
      </button>

    </div>
  )}
</div>

)
}
