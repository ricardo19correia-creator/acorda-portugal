'use client'

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

import questionData from '@/lib/data/questions.json'
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

type Phase = 'answering' | 'revealed' | 'finished'

export function QuizScreen() {
  /*
   * Escolhe perguntas aleatórias para cada partida.
   * Se existirem 20 ou mais, joga 20.
   * Se existirem menos de 20, joga todas.
   */
  const quizQuestions = useMemo(() => {
    const shuffled = [...questionData].sort(
      () => Math.random() - 0.5,
    )

    const selected = shuffled.slice(
      0,
      Math.min(20, questionData.length),
    )

    return selected.map((q, index) => ({
      category: q.category,
      index: index + 1,
      total: selected.length,
      question: q.question,
      options: q.options.map((text, i) => ({
        key: ['A', 'B', 'C', 'D'][i] as
          | 'A'
          | 'B'
          | 'C'
          | 'D',
        text,
      })),
      correct: ['A', 'B', 'C', 'D'][q.correctAnswer] as
        | 'A'
        | 'B'
        | 'C'
        | 'D',
      explanation: q.explanation,
      points: q.points,
    }))
  }, [])

  const total = quizQuestions.length

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<
    'A' | 'B' | 'C' | 'D' | null
  >(null)

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
          (s) => s + q.points + timeBonus,
        )

        setCorrectCount((c) => c + 1)

        setStreak(nextStreak)

        setBestStreak(
          (b) => Math.max(b, nextStreak),
        )
      } else {
        setStreak(0)
      }

      setPhase('revealed')
    },
    [phase, q, seconds, streak],
  )

  /*
   * Temporizador
   */
  useEffect(() => {
    if (phase !== 'answering') return

    if (seconds <= 0) {
      reveal(null)
      return
    }

    const timer = setTimeout(() => {
      setSeconds((s) => s - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [phase, seconds, reveal])

  /*
   * Próxima pergunta
   */
  const next = () => {
    if (step + 1 >= total) {
      setPhase('finished')
      return
    }

    setStep((s) => s + 1)
    setSelected(null)
    setSeconds(MAX_SECONDS)
    setPhase('answering')
  }

  /*
   * Reiniciar
   */
  const restart = () => {
    setStep(0)
    setSelected(null)
    setSeconds(MAX_SECONDS)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setPhase('answering')
  }

  /*
   * Resultado
   */
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

  /*
   * Sem perguntas
   */
  if (!q) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">
            Não existem perguntas.
          </h1>

          <p className="mt-3 text-muted-foreground">
            Verifica o ficheiro questions.json.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  /*
   * Resultado final
   */
  if (phase === 'finished') {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <ResultScreen
            result={result}
            onRestart={restart}
          />
        </div>
      </div>
    )
  }

  /*
   * Estado das respostas
   */
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

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-6 sm:px-6">

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

      {/* CATEGORY */}
      <div className="mt-6 text-center">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          {q.category}
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