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
import { collection, doc, runTransaction, serverTimestamp, updateDoc, increment } from 'firebase/firestore'
import type { UserProfile } from '@/components/player-card'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
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

  // Garantir que a pool nunca está vazia
  if (!questionPool || questionPool.length === 0) {
    questionPool = ALL_QUIZ_QUESTIONS
  }

  // Se houver menos que 10 perguntas na pool temática, suplementar com perguntas gerais de Portugal
  let selected = shuffle(questionPool)
  if (selected.length < QUESTIONS_PER_GAME) {
    const needed = QUESTIONS_PER_GAME - selected.length
    const existingIds = new Set(selected.map((q) => String(q.id)))
    const remaining = shuffle(ALL_QUIZ_QUESTIONS).filter((q) => !existingIds.has(String(q.id)))
    selected = [...selected, ...remaining.slice(0, needed)]
  }

  selected = selected.slice(0, QUESTIONS_PER_GAME)

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

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<OptionKey | null>(null)

  // Power-Ups Stock State
  const [stock5050, setStock5050] = useState<number>(5)
  const [stockFreeze, setStockFreeze] = useState<number>(3)
  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([])
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Real-time stock synchronization
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

    const handleExitQuiz = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    router.push('/jogar')
  }

  // Provocações / Reações no Tabuleiro
  const [reactionModalOpen, setReactionModalOpen] = useState(false)
  const [reactionCooldown, setReactionCooldown] = useState(0)
  const [activeReaction, setActiveReaction] = useState<{ icon: string; text: string; timestamp: number } | null>(null)

  useEffect(() => {
    if (reactionCooldown <= 0) return
    const timer = setInterval(() => {
      setReactionCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [reactionCooldown])

  const handleTriggerReaction = (emote: EmoteItem) => {
    if (reactionCooldown > 0) return
    setReactionCooldown(3)
    setReactionModalOpen(false)

    // 1. Som de áudio instantâneo
    playEmoteSound(emote.label)

    // 2. Balão animado por cima do jogador (2.5s)
    const now = Date.now()
    setActiveReaction({
      icon: emote.emoji,
      text: emote.label,
      timestamp: now,
    })
    setTimeout(() => {
      setActiveReaction(null)
    }, 2500)

    // 3. Emissão em tempo real para a sala
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
    setEliminatedOptions([])
    setIsFrozen(false)
    setFreezeTimeLeft(0)
  }, [step])

  const wasCorrect = selected === q?.correct

  useEffect(() => {
    setUserProfile(profile)
    setPreviousLevel(profile?.level ?? null)
  }, [profile])

  // Handlers para os Power-Ups 50/50 e Congelar Tempo
  const handleUse5050 = async () => {
    if (phase !== 'answering' || eliminatedOptions.length > 0 || !q) return
    if (stock5050 <= 0) return

    // 1. Identifica a resposta correta e oculta/desativa instantaneamente 2 opções incorretas
    const toEliminate = calculate5050Eliminated(q.options, q.correct)
    setEliminatedOptions(toEliminate)

    // 2. Decrementa 1 unidade no estado, no Firestore e no localStorage
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

  const handleUseFreeze = async () => {
    if (phase !== 'answering' || seconds <= 0) return
    if (stockFreeze <= 0) return

    // 1. Acrescenta +15 segundos ao temporizador ativo da questão
    setSeconds((s) => s + 15)
    setIsFrozen(true)
    setFreezeTimeLeft(15)

    // 2. Decrementa 1 unidade no estado, no Firestore e no localStorage
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
      <div className="relative mt-6 overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-slate-700/80 bg-slate-900/95 p-6 sm:p-9 text-center backdrop-blur-md shadow-2xl">
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

      {/* 4.5. POWER-UPS BAR (50/50 e Congelar Tempo) */}
      <QuizPowerUpsBar
        stock5050={stock5050}
        stockFreeze={stockFreeze}
        disabled={phase !== 'answering'}
        used5050={eliminatedOptions.length > 0}
        isFrozen={isFrozen}
        freezeTimeLeft={freezeTimeLeft}
        onUse5050={handleUse5050}
        onUseFreeze={handleUseFreeze}
      />

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
          {/* Card de Feedback da Resposta com 100% de Contraste */}
          <div
            className={cn(
              'w-full max-w-xl mx-auto my-3 p-4 sm:p-5 rounded-2xl bg-slate-950/95 border shadow-2xl backdrop-blur-md transition-all',
              wasCorrect
                ? 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                : 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)]',
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-black shrink-0',
                  wasCorrect
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400',
                )}
              >
                {wasCorrect ? '✓' : '✕'}
              </span>
              <h4
                className={cn(
                  'text-sm sm:text-base font-black tracking-wide uppercase',
                  wasCorrect ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {wasCorrect
                  ? 'Resposta Correta!'
                  : selected
                    ? 'Resposta Incorreta!'
                    : 'Tempo Esgotado!'}
              </h4>
            </div>

            {q.explanation && (
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed flex items-start gap-2 pt-1 border-t border-slate-800">
                <span className="text-amber-400 mt-0.5 shrink-0">💡</span>
                <span>{q.explanation}</span>
              </p>
            )}
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

