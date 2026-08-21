'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Lightbulb,
  Flame,
  Snowflake,
} from 'lucide-react'
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import type { UserProfile } from '@/components/player-card'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { usePresence } from '@/components/presence-provider'
import { useGameTheme } from '@/context/game-theme-context'
import { useConsumablePowerUp } from '@/lib/economy'
import { calculate5050Eliminated, generateQuestionClue } from '@/lib/powerup-helpers'
import { QuizPowerUpsBar } from '@/components/quiz/quiz-powerups-bar'

import {
  ALL_QUIZ_QUESTIONS,
  CATEGORIES,
  MODO_MALUCO_QUESTIONS,
  type QuizQuestion,
  normalizeCategorySlug,
  getCategoryBySlug,
  getDistrictTerritory,
  filterQuizQuestions,
} from '@/lib/game-data'
import vilaRealQuestionsRaw from '@/data/perguntas_vila_real_500.json'
import { calculateLevelProgress } from '@/lib/progression'

import { QuizProgress } from '@/components/quiz/quiz-progress'
import {
  AnswerOption,
  type AnswerState,
} from '@/components/quiz/answer-option'
import {
  ResultScreen,
  type QuizResult,
} from '@/components/quiz/result-screen'
import {
  QUESTION_TIME_SECONDS,
  calculateTimeBonus,
  WARNING_TIME_THRESHOLD,
} from '@/config/quiz'
import { cn } from '@/lib/utils'

const MAX_SECONDS = QUESTION_TIME_SECONDS
const QUESTIONS_PER_GAME = 20

type Phase = 'answering' | 'revealed' | 'finished'

type GameQuestion = QuizQuestion & { image?: string }

type OptionKey = 'A' | 'B' | 'C' | 'D'

const VILA_REAL_QUESTIONS: QuizQuestion[] = (vilaRealQuestionsRaw as any[]).map((q, i) => {
  const correctOptionText = q.correct
  const correctIdx = q.options.indexOf(correctOptionText)
  const correctKey = (['A', 'B', 'C', 'D'][correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0]) as OptionKey
  const points = q.difficulty === 3 ? 300 : q.difficulty === 2 ? 200 : 100

  return {
    category: 'desafio-cidade',
    city: 'Vila Real',
    district: 'Vila Real',
    id: q.id || `vr_${i + 1}`,
    index: i + 1,
    total: vilaRealQuestionsRaw.length,
    question: q.question,
    options: q.options.map((text: string, optIdx: number) => ({
      key: (['A', 'B', 'C', 'D'][optIdx] as OptionKey),
      text,
    })),
    correct: correctKey,
    explanation: `Resposta correta: ${q.correct}`,
    points,
  }
})

type GameCompletionOutcome =
  | { awarded: false }
  | { awarded: true; newLevel: number; newTotalXp: number; newEuros: number }

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function resolveCategoryInfo(
  categorySlug: string,
  subcategorySlug?: string | null,
  districtParam?: string | null,
  cityParam?: string | null,
): { name: string; subtitle?: string; emoji: string; special?: boolean } {
  if (districtParam) {
    const distInfo = getDistrictTerritory(districtParam)
    return {
      name: `Distrito de ${districtParam}`,
      subtitle: distInfo?.titleBadge || 'Desafio Territorial',
      emoji: '📍',
      special: false,
    }
  }
  if (cityParam) {
    return {
      name: cityParam,
      subtitle: 'Desafio Municipal',
      emoji: '🏘️',
      special: false,
    }
  }
  if (categorySlug === 'desafio-nacional' || categorySlug === 'nacional' || categorySlug === 'quick') {
    return { name: 'Desafio Nacional', subtitle: 'Conhecimento Geral de Portugal', emoji: '🇵🇹', special: false }
  }
  if (categorySlug === 'o-meu-distrito' || categorySlug === 'distrito') {
    return { name: 'O Meu Distrito', subtitle: 'Conquista Territorial', emoji: '📍', special: false }
  }
  if (categorySlug === 'desafio-cidade' || categorySlug === 'cidade') {
    return { name: 'Desafio da Cidade', subtitle: 'Conhecimento Local', emoji: '🏘️', special: false }
  }
  if (categorySlug === 'modo-maluco' || categorySlug === 'perguntas-idiotas') {
    return { name: 'Modo Maluco', subtitle: 'Humor & Caos Insano', emoji: '🤪', special: true }
  }
  if (categorySlug === 'desafio-visual') {
    return { name: 'Desafio Visual', subtitle: 'Observação & Detalhe', emoji: '👁️', special: true }
  }

  const cat = getCategoryBySlug(categorySlug)
  if (cat) {
    let subTitle = cat.description
    if (subcategorySlug) {
      const sub = cat.subcategories.find((s) => s.id === subcategorySlug || s.name.toLowerCase() === subcategorySlug.toLowerCase())
      if (sub) {
        subTitle = sub.name
      }
    }
    return { name: cat.name, subtitle: subTitle, emoji: cat.emoji, special: cat.special }
  }

  const category = CATEGORIES.find((item) => item.slug === categorySlug)
  if (category) {
    return { name: category.name, emoji: '🇵🇹', special: category.special }
  }

  // Capitalize fallback slug
  const formatted = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { name: formatted, emoji: '🇵🇹', special: false }
}

function createGameQuestions(
  categorySlug: string,
  subcategorySlug?: string | null,
  difficultyParam?: string | null,
  districtParam?: string | null,
  cityParam?: string | null,
): GameQuestion[] {
  let questionPool: QuizQuestion[] = []

  if (
    categorySlug === 'desafio-cidade' &&
    (!cityParam || cityParam.toLowerCase().includes('vila real'))
  ) {
    questionPool = VILA_REAL_QUESTIONS
  } else if (categorySlug === 'modo-maluco' || categorySlug === 'perguntas-idiotas') {
    questionPool = MODO_MALUCO_QUESTIONS
  } else {
    // 1. Filtrar pelo sistema completo de categorias
    const filtered = filterQuizQuestions(ALL_QUIZ_QUESTIONS as any, {
      categorySlug: categorySlug !== 'desafio-nacional' && categorySlug !== 'nacional' && categorySlug !== 'quick' ? categorySlug : undefined,
      subcategorySlug: subcategorySlug || undefined,
      district: districtParam || undefined,
      city: cityParam || undefined,
      difficulty: difficultyParam || undefined,
    })

    if (filtered.length >= 1) {
      questionPool = filtered as unknown as QuizQuestion[]
    } else {
      // Fallback para categoria normalizada ou pool geral
      const normalizedCat = normalizeCategorySlug(categorySlug)
      const catMatches = ALL_QUIZ_QUESTIONS.filter((q) => {
        const qCatNorm = normalizeCategorySlug(q.category)
        const matchCat = qCatNorm === normalizedCat || q.category.toLowerCase().includes(categorySlug.toLowerCase())
        if (!matchCat) return false
        if (subcategorySlug && subcategorySlug !== 'all' && subcategorySlug !== 'todas' && subcategorySlug !== 'todos') {
          if (!q.subcategory) return false
          const subNorm = subcategorySlug.toLowerCase().trim()
          const qSubNorm = q.subcategory.toLowerCase().trim()
          return qSubNorm === subNorm || qSubNorm.includes(subNorm) || subNorm.includes(qSubNorm)
        }
        return true
      })
      questionPool = catMatches.length > 0 ? catMatches : ALL_QUIZ_QUESTIONS
    }
  }

  if (!questionPool || questionPool.length === 0) {
    questionPool = ALL_QUIZ_QUESTIONS
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
      key: ['A', 'B', 'C', 'D'][optionIndex] as OptionKey,
      text: option.text,
    }))

    const newCorrectKey =
      options.find(
        (option) => option.text === correctOption.text,
      )?.key ?? 'A'

    return {
      ...question,
      index: index + 1,
      total: selected.length,
      options,
      correct: newCorrectKey,
    }
  })
}

export function QuizScreen({
  categorySlug,
  subcategorySlug,
  difficultyParam,
  districtParam,
  cityParam,
  gameId,
}: {
  categorySlug: string
  subcategorySlug?: string | null
  difficultyParam?: string | null
  districtParam?: string | null
  cityParam?: string | null
  gameId: string
}) {
  const router = useRouter()
  const category = resolveCategoryInfo(categorySlug, subcategorySlug, districtParam, cityParam)

  const { user, profile, authResolved } = useAuth()
  const { setActivity } = usePresence()
  const { playSound, setCurrentStreak, streakEffectId } = useGameTheme()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [previousLevel, setPreviousLevel] = useState<number | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<GameQuestion[]>(
    () => createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam),
  )

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<OptionKey | null>(null)

  // Power-Ups State
  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([])
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Real-time local inventory representation
  const effectiveUid = user?.uid || profile?.uid || ''
  const rawInventory: Record<string, number> = (profile as any)?.inventory || {}
  const [inventory, setInventory] = useState<Record<string, number>>(rawInventory)

  useEffect(() => {
    const inv: Record<string, number> = (profile as any)?.inventory || {}
    setInventory(inv)
  }, [profile])

  // Mark activity as 'playing' during quiz lifetime
  useEffect(() => {
    setActivity('playing', gameId)
    return () => {
      setActivity('browsing', null)
    }
  }, [gameId, setActivity])

  const [seconds, setSeconds] = useState(60)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  const total = quizQuestions.length
  const q = quizQuestions[step]

  // Garantir que a cada nova pergunta o cronómetro começa estritamente nos 60s
  useEffect(() => {
    setSeconds(60)
  }, [step])

  const wasCorrect = selected === q?.correct

  useEffect(() => {
    setUserProfile(profile)
    setPreviousLevel(profile?.level ?? null)
  }, [profile])

  // Handlers para os 3 Power-Ups
  const handleUse5050 = async () => {
    if (phase !== 'answering' || eliminatedOptions.length > 0 || !q) return
    if ((inventory['consumable_50_50'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_50_50')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_50_50: res.remainingCount }))
      const toEliminate = calculate5050Eliminated(q.options, q.correct)
      setEliminatedOptions(toEliminate)
    }
  }

  const handleUseClue = async () => {
    if (phase !== 'answering' || activeClue !== null || !q) return
    if ((inventory['consumable_pista'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_pista')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_pista: res.remainingCount }))
      const clue = generateQuestionClue(q)
      setActiveClue(clue)
    }
  }

  const handleUseFreeze = async () => {
    if (phase !== 'answering' || isFrozen || seconds <= 0) return
    if ((inventory['consumable_congelar_tempo'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_congelar_tempo')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_congelar_tempo: res.remainingCount }))
      setIsFrozen(true)
      setFreezeTimeLeft(15)
    }
  }

  // Freeze Countdown loop (pausa durante 15s)
  useEffect(() => {
    if (!isFrozen || freezeTimeLeft <= 0 || phase !== 'answering') return

    const timer = setInterval(() => {
      setFreezeTimeLeft((current) => {
        if (current <= 1) {
          setIsFrozen(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFrozen, freezeTimeLeft, phase])

  const reveal = useCallback(
    (choice: OptionKey | null) => {
      if (phase !== 'answering' || !q) {
        return
      }

      setSelected(choice)
      setIsFrozen(false)

      const hit = choice === q.correct

      if (hit) {
        const timeBonus = calculateTimeBonus(seconds, MAX_SECONDS)

        const nextStreak = streak + 1

        setScore(
          (currentScore) =>
            currentScore + q.points + timeBonus,
        )

        setCorrectCount((current) => current + 1)
        setStreak(nextStreak)
        setCurrentStreak(nextStreak)

        setBestStreak((best) =>
          Math.max(best, nextStreak),
        )

        // Som de acerto ou último segundo
        if (seconds <= WARNING_TIME_THRESHOLD) {
          playSound('last_second_correct')
        } else {
          playSound('correct')
        }

        if (nextStreak > 1 && nextStreak % 3 === 0) {
          setTimeout(() => playSound('streak'), 400)
        }
      } else {
        setStreak(0)
        setCurrentStreak(0)
        playSound('wrong')
      }

      setPhase('revealed')
    },
    [phase, q, seconds, streak, playSound, setCurrentStreak],
  )

  // Main Question Countdown Timer (Pausado se isFrozen === true)
  useEffect(() => {
    if (phase !== 'answering' || isFrozen) {
      return
    }

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
  }, [phase, isFrozen, seconds, reveal])

  const next = () => {
    if (step + 1 >= total) {
      setPhase('finished')
      return
    }

    setStep((current) => current + 1)
    setSelected(null)
    setEliminatedOptions([])
    setActiveClue(null)
    setIsFrozen(false)
    setFreezeTimeLeft(0)
    setSeconds(60)
    setPhase('answering')
  }

  const restart = () => {
    const nextGameId = crypto.randomUUID()
    router.replace(`/jogar?cat=${encodeURIComponent(categorySlug)}&game=${nextGameId}`)
    setQuizQuestions(createGameQuestions(categorySlug))
    setStep(0)
    setSelected(null)
    setEliminatedOptions([])
    setActiveClue(null)
    setIsFrozen(false)
    setFreezeTimeLeft(0)
    setSeconds(60)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setPhase('answering')
  }

  useEffect(() => {
    if (profile) {
      setUserProfile(profile)
      if (previousLevel === null) {
        setPreviousLevel(profile.level)
      }
    }
  }, [profile, previousLevel])

  const handleGameEnd = useCallback(async (completedGameId: string, result: QuizResult) => {
    if (user && user.uid) {
      try {
        const userRef = doc(db, 'users', user.uid)
        const gameRef = doc(db, 'users', user.uid, 'completedGames', completedGameId)

        const outcome = await runTransaction<GameCompletionOutcome>(db, async (transaction) => {
          const completedGameSnapshot = await transaction.get(gameRef)

          if (completedGameSnapshot.exists()) {
            return { awarded: false }
          }

          const userSnapshot = await transaction.get(userRef)
          if (!userSnapshot.exists()) {
            throw new Error('O perfil do jogador não existe.')
          }

          const userData = userSnapshot.data()
          const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
          const currentEuros = typeof userData.euros === 'number' ? userData.euros : 0
          const newTotalXp = currentXp + result.xp
          const levelProgress = calculateLevelProgress(newTotalXp)
          const newLevel = levelProgress.currentLevel.level

          const publicProfileRef = doc(db, 'publicProfiles', user.uid)

          transaction.update(userRef, {
            xp: newTotalXp,
            euros: currentEuros + result.euros,
            level: newLevel,
          })
          transaction.set(publicProfileRef, {
            uid: user.uid,
            displayName: userData.displayName || 'Jogador',
            photoURL: userData.photoURL || null,
            district: userData.district || 'Portugal',
            xp: newTotalXp,
            level: newLevel,
            updatedAt: serverTimestamp(),
          }, { merge: true })
          transaction.set(gameRef, {
            gameId: completedGameId,
            xp: result.xp,
            euros: result.euros,
            level: newLevel,
            completedAt: serverTimestamp(),
          })

          // Registar no histórico oficial de transações da carteira (€ Acorda)
          const txRef = doc(collection(db, 'users', user.uid, 'transactions'))
          transaction.set(txRef, {
            id: txRef.id,
            userId: user.uid,
            type: 'earn',
            amount: result.euros,
            reason: `Partida concluída (${result.correct}/${result.total} certas)`,
            matchId: completedGameId,
            createdAt: serverTimestamp(),
          })

          return { awarded: true, newLevel, newTotalXp, newEuros: currentEuros + result.euros }
        })

        if (outcome.awarded) {
          setUserProfile((currentProfile) => currentProfile
            ? { ...currentProfile, level: outcome.newLevel, xp: outcome.newTotalXp, euros: outcome.newEuros }
            : currentProfile)
        }
      } catch (error) {
        console.error("Error updating user profile:", error)
      }
    }
  }, [user])

  const result: QuizResult = useMemo(
    () => ({
      score,
      correct: correctCount,
      total,
      xp: correctCount * 50 + Math.round(score / 10),
      euros: Math.max(50, correctCount * 15 + (correctCount === total && total > 0 ? 50 : 0)),
      bestStreak,
    }),
    [score, correctCount, total, bestStreak],
  )

  const levelUpInfo =
    previousLevel !== null && userProfile && userProfile.level > previousLevel
      ? { from: previousLevel, to: userProfile.level }
      : undefined

  if (!category || !q) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">
            Não existem perguntas para esta categoria.
          </h1>

          <p className="mt-3 text-muted-foreground">
            Verifica a categoria e o ficheiro lib/game-data.ts.
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
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <ResultScreen
            result={result}
            gameId={gameId}
            levelUpInfo={levelUpInfo}
            onGameEnd={handleGameEnd}
            onReplay={restart}
          />
        </div>
      </div>
    )
  }

  const stateFor = (key: OptionKey): AnswerState => {
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
    <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/jogar"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-card/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-muted-foreground transition hover:border-white/25 hover:bg-card hover:text-white backdrop-blur-xl shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Sair</span>
        </Link>

        {/* Dynamic HUD badges */}
        <div className="flex items-center gap-2">
          {streak > 1 && (
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-black animate-pop',
                streakEffectId === 'streak_chama_tripla' && streak >= 3
                  ? 'border-emerald-400/80 bg-emerald-500/25 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-pulse'
                  : streakEffectId === 'streak_moedas_ouro' && streak >= 3
                    ? 'border-gold/80 bg-gold/25 text-gold shadow-[0_0_25px_rgba(234,179,8,0.6)] animate-bounce'
                    : 'border-flag-red/40 bg-flag-red/15 text-flag-red shadow-[0_0_15px_rgba(244,63,94,0.25)]',
              )}
            >
              <Flame
                className={cn(
                  'h-4 w-4 fill-current',
                  streakEffectId === 'streak_chama_tripla' && streak >= 3 && 'text-emerald-400 animate-spin',
                )}
              />
              <span>{streak}x Seguidas</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-2xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs sm:text-sm font-black text-gold shadow-[0_0_15px_rgba(255,200,0,0.15)]">
            <Sparkles className="h-4 w-4" />
            <span>+{q.points} XP</span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY PILL */}
      <div className="mt-5 text-center flex flex-col items-center gap-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider backdrop-blur-xl shadow-sm',
            category.special
              ? 'border-flag-red/50 bg-flag-red/15 text-flag-red shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,255,162,0.15)]',
          )}
        >
          <span>{category.emoji || (category.special ? '🤪' : '🇵🇹')}</span>
          <span>{category.name}</span>
        </span>
        {category.subtitle && category.subtitle !== category.name && (
          <span className="text-[0.7rem] font-bold text-muted-foreground uppercase tracking-wider">
            {category.subtitle}
          </span>
        )}
      </div>

      {/* 3. PROGRESS + TIMER HUD */}
      <div className="mt-4">
        <QuizProgress
          index={step + 1}
          total={total}
          seconds={seconds}
          maxSeconds={MAX_SECONDS}
        />
      </div>

      {/* 4. QUESTION CARD */}
      <div className="relative mt-6 overflow-hidden rounded-3xl sm:rounded-4xl border border-white/15 bg-card/85 p-6 sm:p-9 text-center backdrop-blur-2xl shadow-2xl">
        {/* Subtle decorative corners */}
        <div className="pattern-azulejo pointer-events-none absolute -right-6 -top-6 h-28 w-28 opacity-25 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        <div className="pattern-azulejo pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 opacity-25 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="mb-3 inline-block rounded-full bg-white/5 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.25em] text-muted-foreground border border-white/5">
          Pergunta {String(step + 1).padStart(2, '0')}
        </div>

        {/* Visual Question Image if present */}
        {q.image && (
          <div className="mx-auto mb-4 max-w-sm sm:max-w-md overflow-hidden rounded-2xl border border-white/20 shadow-lg">
            <img
              src={q.image}
              alt="Desafio Visual"
              className="h-44 sm:h-56 w-full object-cover"
            />
          </div>
        )}

        <h1 className="relative text-balance font-display text-xl sm:text-2xl md:text-3xl font-black leading-snug sm:leading-tight text-foreground">
          {q.question}
        </h1>
      </div>

      {/* 4.5. POWER-UPS BAR (50/50, Pista, Congelar Tempo) */}
      <QuizPowerUpsBar
        inventory={inventory}
        disabled={phase !== 'answering'}
        used5050={eliminatedOptions.length > 0}
        usedClue={activeClue !== null}
        isFrozen={isFrozen}
        freezeTimeLeft={freezeTimeLeft}
        onUse5050={handleUse5050}
        onUseClue={handleUseClue}
        onUseFreeze={handleUseFreeze}
      />

      {/* Active Clue Box (Pista Histórica) */}
      {activeClue && (
        <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 sm:p-4 text-xs sm:text-sm text-amber-100 flex items-start gap-3 backdrop-blur-xl animate-rise shadow-lg shadow-amber-500/10">
          <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-black uppercase tracking-wider text-amber-300 block text-[0.68rem] mb-0.5">
              💡 Pista Histórica Contextual:
            </span>
            <span className="font-medium leading-relaxed">{activeClue}</span>
          </div>
        </div>
      )}

      {/* Active Freeze Banner */}
      {isFrozen && (
        <div className="mb-4 rounded-2xl border border-blue-400/50 bg-blue-500/15 p-3 text-xs sm:text-sm text-blue-100 flex items-center justify-center gap-2 backdrop-blur-xl animate-pulse shadow-lg shadow-blue-500/20">
          <Snowflake className="h-4 w-4 text-blue-300 animate-spin" />
          <span className="font-bold">
            ❄️ Cronómetro Congelado! Tens <strong>{freezeTimeLeft}s</strong> para pensar com calma sem perder tempo.
          </span>
        </div>
      )}

      {/* 5. ANSWERS LIST */}
      <div className="mt-2 grid gap-3 sm:gap-3.5">
        {q.options.map((option) => (
          <AnswerOption
            key={option.key}
            optionKey={option.key}
            text={option.text}
            state={stateFor(option.key)}
            disabled={phase !== 'answering' || eliminatedOptions.includes(option.key)}
            eliminated={eliminatedOptions.includes(option.key)}
            onSelect={() => reveal(option.key)}
          />
        ))}
      </div>

      {/* 6. FEEDBACK & NEXT QUESTION ACTION */}
      {phase === 'revealed' && (
        <div className="animate-rise mt-5 space-y-4">
          <div
            className={cn(
              'flex flex-col sm:flex-row items-start sm:items-center gap-3.5 rounded-3xl border p-4 sm:p-5 backdrop-blur-2xl shadow-xl',
              wasCorrect
                ? 'border-primary/50 bg-primary/15 shadow-[0_0_30px_rgba(0,255,162,0.15)]'
                : 'border-flag-red/50 bg-flag-red/15 shadow-[0_0_30px_rgba(244,63,94,0.15)]',
            )}
          >
            <div className="flex items-center gap-3">
              {wasCorrect ? (
                <CheckCircle2 className="h-8 w-8 shrink-0 text-primary drop-shadow-[0_0_10px_var(--primary)]" />
              ) : (
                <XCircle className="h-8 w-8 shrink-0 text-flag-red drop-shadow-[0_0_10px_var(--flag-red)]" />
              )}
              <div className="sm:hidden">
                <p
                  className={cn(
                    'font-display text-lg font-black uppercase tracking-wide',
                    wasCorrect ? 'text-primary' : 'text-flag-red',
                  )}
                >
                  {wasCorrect
                    ? 'Correto!'
                    : selected
                      ? 'Incorreto!'
                      : 'Tempo esgotado!'}
                </p>
              </div>
            </div>

            <div className="flex-1">
              <p
                className={cn(
                  'hidden sm:block font-display text-lg font-black uppercase tracking-wide',
                  wasCorrect ? 'text-primary' : 'text-flag-red',
                )}
              >
                {wasCorrect
                  ? 'Resposta Correta!'
                  : selected
                    ? 'Resposta Incorreta!'
                    : 'Tempo Esgotado!'}
              </p>

              {q.explanation && (
                <p className="mt-1 flex items-start gap-1.5 text-xs sm:text-sm text-foreground/90 font-medium leading-relaxed">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{q.explanation}</span>
                </p>
              )}
            </div>
          </div>

          {/* NEXT QUESTION BUTTON */}
          <button
            type="button"
            onClick={next}
            className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] py-4 px-6 font-display text-base font-black uppercase tracking-wider text-primary-foreground shadow-[0_12px_40px_-5px_rgba(0,255,162,0.4)] transition-all duration-300 hover:scale-[1.01] hover:bg-[position:100%_0] active:scale-[0.99] cursor-pointer"
          >
            <span>
              {step + 1 >= total ? 'Ver Resultado Final' : 'Próxima Pergunta'}
            </span>
            <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  )
}

