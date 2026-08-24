'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { collection, doc, runTransaction, serverTimestamp, updateDoc, increment, setDoc } from 'firebase/firestore'
import type { UserProfile } from '@/components/player-card'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { useEconomy } from '@/context/economy-context'
import { usePresence } from '@/components/presence-provider'
import { useGameTheme } from '@/context/game-theme-context'
import { useConsumablePowerUp } from '@/lib/economy'
import { calculate5050Eliminated, generateQuestionClue } from '@/lib/powerup-helpers'
import { QuizPowerUpsBar } from '@/components/quiz/quiz-powerups-bar'
import { GameExitControl } from '@/components/game-exit-modal'
import { DuelEmoteBubble, DuelEmotePicker, DuelEmoteFloatingBar } from '@/components/duel-emote-system'
import { playEmoteSound } from '@/lib/sound-engine'
import { type EmoteItem } from '@/src/data/emotes'

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
import modoMalucoQuestionsRaw from '@/data/perguntas_modo_maluco_5000.json'
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
const QUESTIONS_PER_GAME = 10

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

const MODO_MALUCO_5000_QUESTIONS: QuizQuestion[] = (modoMalucoQuestionsRaw as any[]).map((q, i) => {
  const correctOptionText = q.correct
  const correctIdx = q.options.indexOf(correctOptionText)
  const correctKey = (['A', 'B', 'C', 'D'][correctIdx >= 0 && correctIdx < 4 ? correctIdx : 0]) as OptionKey
  const points = q.difficulty === 3 ? 300 : q.difficulty === 2 ? 200 : 100

  return {
    category: 'modo-maluco',
    subcategory: q.subcategory,
    id: q.id || `mm_${i + 1}`,
    index: i + 1,
    total: modoMalucoQuestionsRaw.length,
    question: q.question,
    options: q.options.map((text: string, optIdx: number) => ({
      key: (['A', 'B', 'C', 'D'][optIdx] as OptionKey),
      text,
    })),
    correct: correctKey,
    explanation: q.explanation || `Resposta correta: ${q.correct}`,
    points,
  }
})

type GameCompletionOutcome =
  | { awarded: false }
  | { awarded: true; newLevel: number; newTotalXp: number; newEuros: number }

function shuffle<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
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
    if (subcategorySlug && subcategorySlug !== 'all' && subcategorySlug !== 'todas' && subcategorySlug !== 'todos') {
      const subNorm = subcategorySlug.toLowerCase().trim()
      const filteredSub = MODO_MALUCO_5000_QUESTIONS.filter((q) => {
        const qSub = (q.subcategory || '').toLowerCase().trim()
        return qSub === subNorm || qSub.includes(subNorm) || subNorm.includes(qSub)
      })
      questionPool = filteredSub.length > 0 ? filteredSub : MODO_MALUCO_5000_QUESTIONS
    } else {
      questionPool = MODO_MALUCO_5000_QUESTIONS
    }
  } else {
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
      const normalizedCat = normalizeCategorySlug(categorySlug || '')
      const catMatches = ALL_QUIZ_QUESTIONS.filter((q) => {
        const qCatNorm = normalizeCategorySlug(q.category || '')
        const matchCat = qCatNorm === normalizedCat || (q.category && categorySlug && q.category.toLowerCase().includes(categorySlug.toLowerCase()))
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

  let selected = shuffle(questionPool)
  if (selected.length < QUESTIONS_PER_GAME) {
    const needed = QUESTIONS_PER_GAME - selected.length
    const existingIds = new Set(selected.map((q) => String(q.id)))
    const remaining = shuffle(ALL_QUIZ_QUESTIONS).filter((q) => !existingIds.has(String(q.id)))
    selected = [...selected, ...remaining.slice(0, needed)]
  }

  selected = selected.slice(0, QUESTIONS_PER_GAME)

  return selected.map((question, index) => {
    const rawOptions = Array.isArray(question.options) ? question.options : []
    const normalizedOptions = rawOptions.map((opt: any, optIdx: number) => {
      if (typeof opt === 'string') {
        return { key: (['A', 'B', 'C', 'D'][optIdx] || 'A') as OptionKey, text: opt }
      }
      return {
        key: (opt.key || ['A', 'B', 'C', 'D'][optIdx] || 'A') as OptionKey,
        text: opt.text || '',
      }
    })

    const correctOption = normalizedOptions.find(
      (option) => option.key === question.correct || option.text === question.correct,
    ) || normalizedOptions[0]

    const shuffledOptions = shuffle(normalizedOptions)

    const options = shuffledOptions.map((option, optionIndex) => ({
      key: ['A', 'B', 'C', 'D'][optionIndex] as OptionKey,
      text: option.text,
    }))

    const newCorrectKey =
      options.find(
        (option) => option.text === correctOption?.text,
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
  const category = useMemo(
    () => resolveCategoryInfo(categorySlug, subcategorySlug, districtParam, cityParam),
    [categorySlug, subcategorySlug, districtParam, cityParam]
  )

  const { user, profile } = useAuth()
  const { addCoins } = useEconomy()
  const { setActivity } = usePresence()
  const { playSound, setCurrentStreak, streakEffectId } = useGameTheme()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [previousLevel, setPreviousLevel] = useState<number | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<GameQuestion[]>(() =>
    createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
  )

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<OptionKey | null>(null)
  const [seconds, setSeconds] = useState(60)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  // Power-Ups Stock State
  const [stock5050, setStock5050] = useState<number>(5)
  const [stockFreeze, setStockFreeze] = useState<number>(3)
  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([])
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Provocações / Reações no Tabuleiro
  const [reactionModalOpen, setReactionModalOpen] = useState(false)
  const [reactionCooldown, setReactionCooldown] = useState(0)
  const [activeReaction, setActiveReaction] = useState<{ icon: string; text: string; timestamp: number } | null>(null)

  // Sincronizar estado completo quando inicia uma nova partida ou muda de categoria
  useEffect(() => {
    const questions = createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
    setQuizQuestions(questions)
    setStep(0)
    setSelected(null)
    setEliminatedOptions([])
    setIsFrozen(false)
    setFreezeTimeLeft(0)
    setSeconds(60)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setPhase('answering')
  }, [gameId, categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam])

  // Cooldown de reações
  useEffect(() => {
    if (reactionCooldown <= 0) return
    const timer = setInterval(() => {
      setReactionCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [reactionCooldown])

  // Real-time power-ups stock synchronization
  useEffect(() => {
    const syncStock = () => {
      try {
        let h5050 = 5
        let fTime = 3

        const savedConsumables = localStorage.getItem('user_consumables')
        if (savedConsumables) {
          const parsed = JSON.parse(savedConsumables)
          if (typeof parsed.help5050 === 'number') h5050 = parsed.help5050
          if (typeof parsed.freezeTime === 'number') fTime = parsed.freezeTime
        }

        const savedH = localStorage.getItem('user_help5050')
        if (savedH !== null) h5050 = Number(savedH) || 0

        const savedF = localStorage.getItem('user_freezeTime')
        if (savedF !== null) fTime = Number(savedF) || 0

        if (profile?.consumables) {
          if (typeof profile.consumables.help5050 === 'number') h5050 = profile.consumables.help5050
          if (typeof profile.consumables.freezeTime === 'number') fTime = profile.consumables.freezeTime
        } else if ((profile as any)?.inventory) {
          const inv = (profile as any).inventory
          if (typeof inv.consumable_50_50 === 'number') h5050 = inv.consumable_50_50
          if (typeof inv.consumable_congelar_tempo === 'number') fTime = inv.consumable_congelar_tempo
        }

        setStock5050(h5050)
        setStockFreeze(fTime)
      } catch (err) {
        console.error('Erro ao sincronizar stock:', err)
      }
    }

    syncStock()
    window.addEventListener('consumables_updated', syncStock)
    window.addEventListener('inventory_updated', syncStock)
    window.addEventListener('storage', syncStock)

    return () => {
      window.removeEventListener('consumables_updated', syncStock)
      window.removeEventListener('inventory_updated', syncStock)
      window.removeEventListener('storage', syncStock)
    }
  }, [profile])

  // Mark activity as 'playing' during quiz lifetime
  useEffect(() => {
    setActivity('playing', gameId)
    return () => {
      setActivity('browsing', null)
    }
  }, [gameId, setActivity])

  const total = quizQuestions.length
  const q = quizQuestions[step] || quizQuestions[0]

  const handleTriggerReaction = (emote: EmoteItem) => {
    if (reactionCooldown > 0) return
    setReactionCooldown(3)
    setReactionModalOpen(false)

    playEmoteSound(emote.label)

    const now = Date.now()
    setActiveReaction({
      icon: emote.emoji,
      text: emote.label,
      timestamp: now,
    })
    setTimeout(() => {
      setActiveReaction(null)
    }, 2500)

    try {
      const eventPayload = {
        event: 'taunt',
        type: 'PLAYER_REACTION',
        senderId: user?.uid || profile?.uid || 'player',
        taunt: { icon: emote.emoji, text: emote.label },
        timestamp: now,
      }
      window.dispatchEvent(new CustomEvent('PLAYER_REACTION', { detail: eventPayload }))
    } catch {}
  }

  // 1. Power-Up: 50/50
  const handleUse5050 = async () => {
    if (stock5050 <= 0 || eliminatedOptions.length > 0 || phase !== 'answering' || !q) return

    const eliminated = calculate5050Eliminated(q.options, q.correct)
    setEliminatedOptions(eliminated)

    const newStock = Math.max(0, stock5050 - 1)
    setStock5050(newStock)

    try {
      localStorage.setItem('user_help5050', String(newStock))
      const saved = localStorage.getItem('user_consumables')
      const parsed = saved ? JSON.parse(saved) : {}
      localStorage.setItem('user_consumables', JSON.stringify({ ...parsed, help5050: newStock }))

      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          'consumables.help5050': increment(-1),
          'inventory.consumable_50_50': increment(-1),
        })
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.error('Erro ao debitar 50/50:', e)
    }
  }

  // 2. Power-Up: Freeze Time
  const handleUseFreeze = async () => {
    if (stockFreeze <= 0 || isFrozen || phase !== 'answering') return

    setIsFrozen(true)
    setFreezeTimeLeft(15)

    const newStock = Math.max(0, stockFreeze - 1)
    setStockFreeze(newStock)

    try {
      localStorage.setItem('user_freezeTime', String(newStock))
      const saved = localStorage.getItem('user_consumables')
      const parsed = saved ? JSON.parse(saved) : {}
      localStorage.setItem('user_consumables', JSON.stringify({ ...parsed, freezeTime: newStock }))

      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          'consumables.freezeTime': increment(-1),
          'inventory.consumable_congelar_tempo': increment(-1),
        })
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.error('Erro ao debitar Congelar Tempo:', e)
    }
  }

  // Freeze Countdown loop
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

        setScore((currentScore) => currentScore + q.points + timeBonus)
        setCorrectCount((current) => current + 1)
        setStreak(nextStreak)
        setCurrentStreak(nextStreak)

        setBestStreak((best) => Math.max(best, nextStreak))

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

  // Main Question Countdown Timer
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

  const handleGameEnd = useCallback(async (gid: string, finalResult: QuizResult) => {
    if (!user) return

    const userRef = doc(db, "users", user.uid)
    const publicProfileRef = doc(db, "publicProfiles", user.uid)
    const catSlug = category?.slug || 'geral'

    try {
      // 1. Gravar documento persistente da partida na coleção 'games'
      try {
        const gameDocRef = doc(db, 'games', gid)
        await setDoc(
          gameDocRef,
          {
            id: gid,
            userId: user.uid,
            userDisplayName: user.displayName || profile?.displayName || 'Jogador',
            category: catSlug,
            categoryName: category?.name || 'Portugal',
            score: finalResult.score,
            correctAnswers: finalResult.correct,
            totalQuestions: finalResult.total,
            xpEarned: finalResult.xp,
            eurosEarned: finalResult.euros,
            bestStreak: finalResult.bestStreak,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch (gameSaveErr) {
        console.warn('[QUIZ] Aviso ao gravar registo na coleção games:', gameSaveErr)
      }

      // 2. Atualizar utilizador e perfil público via transação
      const outcome = await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef)
        if (!userSnap.exists()) {
          return { awarded: false } as GameCompletionOutcome
        }

        const currentProfile = userSnap.data() as UserProfile
        const nextTotalXp = (currentProfile.xp || 0) + finalResult.xp
        const nextEuros = (currentProfile.euros || 0) + finalResult.euros
        const nextQuestionsAnswered = (currentProfile.questionsAnswered || 0) + finalResult.total
        const nextCorrectAnswers = (currentProfile.correctAnswers || 0) + finalResult.correct
        const nextIncorrectAnswers = (currentProfile.incorrectAnswers || 0) + (finalResult.total - finalResult.correct)
        const nextTotalQuestions = (currentProfile.totalQuestions || 0) + finalResult.total
        const nextBestStreak = Math.max(currentProfile.bestStreak || 0, finalResult.bestStreak)
        const nextGamesPlayed = (currentProfile.gamesPlayed || 0) + 1

        const existingCategoryStats = (currentProfile as any).categoryStats || {}
        const currentCat = existingCategoryStats[catSlug] || { totalQuestions: 0, correctAnswers: 0, gamesPlayed: 0, score: 0 }
        const nextCategoryStats = {
          ...existingCategoryStats,
          [catSlug]: {
            totalQuestions: (currentCat.totalQuestions || 0) + finalResult.total,
            correctAnswers: (currentCat.correctAnswers || 0) + finalResult.correct,
            gamesPlayed: (currentCat.gamesPlayed || 0) + 1,
            score: (currentCat.score || 0) + finalResult.score,
          }
        }

        const levelInfo = calculateLevelProgress(nextTotalXp)
        const newLevel = levelInfo.currentLevel.level

        transaction.update(userRef, {
          xp: nextTotalXp,
          euros: nextEuros,
          level: newLevel,
          gamesPlayed: nextGamesPlayed,
          questionsAnswered: nextQuestionsAnswered,
          correctAnswers: nextCorrectAnswers,
          incorrectAnswers: nextIncorrectAnswers,
          totalQuestions: nextTotalQuestions,
          bestStreak: nextBestStreak,
          categoryStats: nextCategoryStats,
          lastPlayedAt: serverTimestamp(),
        })

        transaction.set(
          publicProfileRef,
          {
            uid: user.uid,
            displayName: currentProfile.displayName || user.displayName || "Jogador",
            photoURL: currentProfile.photoURL || user.photoURL || null,
            district: currentProfile.district || "Portugal",
            level: newLevel,
            xp: nextTotalXp,
          },
          { merge: true }
        )

        return {
          awarded: true,
          newLevel,
          newTotalXp: nextTotalXp,
          newEuros: nextEuros,
        } as GameCompletionOutcome
      })

      if (outcome.awarded) {
        if (finalResult.euros > 0) {
          void addCoins(finalResult.euros, `Quiz: ${category?.name || 'Portugal'}`)
        }
        setUserProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                level: outcome.newLevel,
                xp: outcome.newTotalXp,
                euros: outcome.newEuros,
              }
            : currentProfile
        )
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
    }
  }, [user, category, profile, addCoins])

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

  if (!q) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="mt-4 font-display text-lg font-bold text-foreground">
          A preparar o teu desafio...
        </p>
        <p className="text-xs text-muted-foreground">A carregar perguntas de {category?.name || 'Portugal'}.</p>
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
          className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-card/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-muted-foreground transition hover:border-white/25 hover:bg-card hover:text-white backdrop-blur-xl shadow-sm cursor-pointer"
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
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider',
            category.special
              ? 'border-flag-red/50 bg-flag-red/20 text-flag-red shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'border-white/10 bg-card/60 text-muted-foreground',
          )}
        >
          <span>{category.emoji}</span>
          <span>{category.name}</span>
          {category.subtitle && (
            <span className="text-[0.68rem] text-primary/80 font-normal">
              • {category.subtitle}
            </span>
          )}
        </span>
      </div>

      {/* 3. PROGRESS BAR & COUNTDOWN TIMER */}
      <div className="mt-6">
        <QuizProgress
          index={step + 1}
          total={total}
          seconds={seconds}
          maxSeconds={MAX_SECONDS}
        />
      </div>

      {/* 4. QUESTION CARD */}
      <div
        className={cn(
          'mt-6 rounded-4xl border p-6 sm:p-10 backdrop-blur-2xl shadow-2xl transition-all relative overflow-hidden',
          category.special
            ? 'border-flag-red/30 bg-gradient-to-br from-flag-red/10 via-card/90 to-card/90'
            : 'border-white/12 bg-card/85',
        )}
      >
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Pergunta {step + 1} de {total}</span>
          <span className="text-primary font-black">+{q.points} Pontos</span>
        </div>

        <h2 className="mt-4 font-display text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-snug">
          {q.question}
        </h2>

        {/* 5. 4 RESPOSTAS */}
        <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
          {q.options.map((option) => {
            const isEliminated = eliminatedOptions.includes(option.key)
            if (isEliminated) {
              return (
                <div
                  key={option.key}
                  className="flex items-center gap-3.5 rounded-2xl border-2 border-slate-800/60 bg-slate-950/80 p-4 opacity-30 select-none cursor-not-allowed"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900 font-mono text-xs font-black text-slate-500 line-through">
                    {option.key}
                  </span>
                  <span className="text-sm line-through text-slate-500 flex-1">{option.text}</span>
                  <span className="text-[0.62rem] font-bold text-slate-500 uppercase">50/50</span>
                </div>
              )
            }

            return (
              <AnswerOption
                key={option.key}
                optionKey={option.key}
                text={option.text}
                state={stateFor(option.key)}
                disabled={phase !== 'answering'}
                onSelect={() => reveal(option.key)}
              />
            )
          })}
        </div>

        {/* 6. EXPLICAÇÃO E FEEDBACK */}
        {phase === 'revealed' && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs sm:text-sm animate-rise">
            <div className="flex items-center gap-2 font-bold mb-1">
              {selected === q.correct ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Resposta Correta!
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Resposta Incorreta
                </span>
              )}
            </div>
            <p className="text-slate-300">{q.explanation}</p>
          </div>
        )}

        {/* 7. BOTÃO PRÓXIMA PERGUNTA */}
        {phase === 'revealed' && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-7 py-3.5 font-display text-sm font-black uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 cursor-pointer active:scale-95 transition-all"
            >
              <span>{step + 1 >= total ? 'Ver Resultados' : 'Próxima'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 8. BARRA DE POWER-UPS */}
      <div className="mt-6">
        <QuizPowerUpsBar
          stock5050={stock5050}
          stockFreeze={stockFreeze}
          used5050={eliminatedOptions.length > 0}
          isFrozen={isFrozen}
          freezeTimeLeft={freezeTimeLeft}
          onUse5050={handleUse5050}
          onUseFreeze={handleUseFreeze}
        />
      </div>
    </div>
  )
}
