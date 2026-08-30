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
  Clock,
  Coins,
  Lock,
} from 'lucide-react'
import { collection, doc, runTransaction, serverTimestamp, updateDoc, increment, setDoc, arrayUnion } from 'firebase/firestore'
import type { UserProfile } from '@/components/player-card'
import { PlayerAvatar } from '@/components/player-avatar'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { useEconomy } from '@/context/economy-context'
import { usePresence } from '@/components/presence-provider'
import { useGameTheme } from '@/context/game-theme-context'
import { useConsumablePowerUp } from '@/lib/economy'
import {
  getUniqueMatchQuestions,
  saveAnsweredQuestions,
  loadQuestionsPool,
  selectBalancedMatchQuestions,
  getRecentQuestionIds,
  cleanQuestionPrompt,
} from '@/src/lib/questionEngine'
import type { Question } from '@/src/types/quiz'
import { silentFetchWithRetry, silentAsyncRetry } from '@/lib/network-resilience'
import { calculateMatchCoinReward, calculateLevelUpCoinReward, getDifficultyMultiplier } from '@/src/data/economy'
import { calculate5050Eliminated, generateQuestionClue, simulatePublicVote } from '@/lib/powerup-helpers'
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

function formatEngineQuestion(q: Question, index: number, total: number): GameQuestion {
  const rawOptions = q.options || []
  const correctText = rawOptions[q.correctAnswer] || rawOptions[0] || ''
  const shuffled = shuffle(
    rawOptions.map((opt, i) => ({
      key: (['A', 'B', 'C', 'D'][i] || 'A') as OptionKey,
      text: opt,
    }))
  )
  const reindexed = shuffled.map((opt, i) => ({
    key: (['A', 'B', 'C', 'D'][i] || 'A') as OptionKey,
    text: opt.text,
  }))
  const newCorrectKey = reindexed.find((opt) => opt.text === correctText)?.key ?? 'A'
  return {
    id: q.id,
    index: index + 1,
    total,
    question: cleanQuestionPrompt(q.question),
    category: q.category,
    subcategory: q.subcategory,
    district: q.district,
    city: q.city,
    difficulty: q.difficulty,
    options: reindexed,
    correct: newCorrectKey,
    explanation: q.explanation || `Resposta correta: ${correctText}`,
    points: q.difficulty >= 4 ? 300 : q.difficulty === 3 ? 200 : 100,
    image: q.image,
  }
}

function createGameQuestions(
  categorySlug: string,
  subcategorySlug?: string | null,
  difficultyParam?: string | null,
  districtParam?: string | null,
  cityParam?: string | null,
): GameQuestion[] {
  const diff = difficultyParam ? Number(difficultyParam) || 2 : 2
  const rawPool = loadQuestionsPool(
    categorySlug,
    diff,
    subcategorySlug || undefined,
    districtParam || undefined,
    cityParam || undefined
  )
  const catLower = (categorySlug || '').toLowerCase().trim()
  const isNational =
    !catLower ||
    catLower === 'desafio-nacional' ||
    catLower === 'desafio nacional' ||
    catLower === 'nacional' ||
    catLower === 'quick' ||
    catLower === 'todos' ||
    catLower === 'jogar-tudo'

  const recentSet = new Set(getRecentQuestionIds())
  const selected = selectBalancedMatchQuestions(rawPool, QUESTIONS_PER_GAME, recentSet, isNational)
  return selected.map((q, i) => formatEngineQuestion(q, i, selected.length))
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
  if (typeof window !== 'undefined' && window.location.pathname.includes('/criadores')) {
    return null
  }

  const router = useRouter()
  const category = useMemo(
    () => resolveCategoryInfo(categorySlug, subcategorySlug, districtParam, cityParam),
    [categorySlug, subcategorySlug, districtParam, cityParam]
  )

  const diffLevel = useMemo(() => {
    const d = Number(difficultyParam)
    if (!isNaN(d) && d >= 1 && d <= 5) return d
    const str = String(difficultyParam || '').toLowerCase()
    if (str.includes('facil') || str.includes('fácil') || str === '1') return 1
    if (str.includes('medio') || str.includes('médio') || str === '3') return 3
    if (str.includes('dificil') || str.includes('difícil') || str === '4') return 4
    if (str.includes('mestre') || str === '5') return 5
    return 2
  }, [difficultyParam])

  const { user, profile, authResolved } = useAuth()
  const { addCoins } = useEconomy()
  const { setActivity } = usePresence()
  const { playSound, setCurrentStreak, streakEffectId } = useGameTheme()

  // Bloqueio Absoluto: Jogadores não autenticados não podem aceder ao Quiz
  useEffect(() => {
    if (authResolved && !user && !auth?.currentUser) {
      const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/jogar'
      router.replace(`/entrar?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [authResolved, user, router])

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

  // Power-Ups Stock State (Zero por defeito se não comprados)
  const [stock5050, setStock5050] = useState<number>(0)
  const [stockFreeze, setStockFreeze] = useState<number>(0)
  const [stockPublicVote, setStockPublicVote] = useState<number>(0)
  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([])
  const [publicVoteResults, setPublicVoteResults] = useState<number[] | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Provocações / Reações no Tabuleiro
  const [reactionModalOpen, setReactionModalOpen] = useState(false)
  const [reactionCooldown, setReactionCooldown] = useState(0)
  const [activeReaction, setActiveReaction] = useState<{ icon: string; text: string; timestamp: number } | null>(null)

  // Sincronizar estado e carregar perguntas estritamente anti-repetição (com recuperação de sessão)
  useEffect(() => {
    let isCancelled = false

    // 1. Tentar recuperar sessão ativa de jogo em caso de oscilação ou soft-reload
    if (typeof window !== 'undefined' && gameId) {
      try {
        const savedSession = sessionStorage.getItem(`ap_quiz_state_${gameId}`)
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          if (parsed && Array.isArray(parsed.quizQuestions) && parsed.quizQuestions.length > 0) {
            console.log('[QuizScreen] Sessão de jogo recuperada com sucesso da cache local:', gameId)
            setQuizQuestions(parsed.quizQuestions)
            setStep(parsed.step ?? 0)
            setSelected(parsed.selected ?? null)
            setSeconds(parsed.seconds ?? 60)
            setScore(parsed.score ?? 0)
            setCorrectCount(parsed.correctCount ?? 0)
            setStreak(parsed.streak ?? 0)
            setBestStreak(parsed.bestStreak ?? 0)
            setPhase(parsed.phase ?? 'answering')
            return
          }
        }
      } catch (e) {
        console.warn('[QuizScreen] Aviso ao ler cache de sessão:', e)
      }
    }

    getUniqueMatchQuestions(
      user?.uid || '',
      categorySlug,
      diffLevel,
      QUESTIONS_PER_GAME,
      subcategorySlug || undefined,
      districtParam || undefined,
      cityParam || undefined
    )
      .then((uniqueQuestions) => {
        if (isCancelled) return
        const formatted = uniqueQuestions.map((q, i) => formatEngineQuestion(q, i, uniqueQuestions.length))
        setQuizQuestions(formatted)
        setStep(0)
        setSelected(null)
        setEliminatedOptions([])
        setPublicVoteResults(null)
        setIsFrozen(false)
        setFreezeTimeLeft(0)
        setSeconds(60)
        setScore(0)
        setCorrectCount(0)
        setStreak(0)
        setBestStreak(0)
        setPhase('answering')
      })
      .catch((err) => {
        console.error('[QuizScreen] Erro ao carregar perguntas anti-repetição:', err)
        if (!isCancelled) {
          const fallback = createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
          setQuizQuestions(fallback)
          setStep(0)
          setSelected(null)
          setEliminatedOptions([])
          setPublicVoteResults(null)
          setIsFrozen(false)
          setFreezeTimeLeft(0)
          setSeconds(60)
          setScore(0)
          setCorrectCount(0)
          setStreak(0)
          setBestStreak(0)
          setPhase('answering')
        }
      })

    return () => {
      isCancelled = true
    }
  }, [gameId, categorySlug, subcategorySlug, diffLevel, difficultyParam, districtParam, cityParam, user?.uid])

  // Persistir estado da sessão ativa de jogo a cada passo / pontuação
  useEffect(() => {
    if (typeof window === 'undefined' || !gameId || quizQuestions.length === 0) return
    if (phase === 'finished') {
      try {
        sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
      } catch {}
      return
    }

    try {
      const sessionPayload = {
        gameId,
        step,
        score,
        correctCount,
        streak,
        bestStreak,
        seconds,
        phase,
        selected,
        quizQuestions,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(`ap_quiz_state_${gameId}`, JSON.stringify(sessionPayload))
    } catch {}
  }, [gameId, step, score, correctCount, streak, bestStreak, seconds, phase, selected, quizQuestions])

  // Prevenção de fecho acidental no meio de uma partida
  useEffect(() => {
    if (phase === 'finished') return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [phase])

  const handleAbandonSolo = useCallback(() => {
    router.push('/jogar')
  }, [router])

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
        let h5050 = 0
        let fTime = 0
        let pVote = 0

        const savedConsumables = localStorage.getItem('user_consumables')
        if (savedConsumables) {
          const parsed = JSON.parse(savedConsumables)
          if (typeof parsed.help5050 === 'number') h5050 = parsed.help5050
          if (typeof parsed.freezeTime === 'number') fTime = parsed.freezeTime
          if (typeof parsed.publicVote === 'number') pVote = parsed.publicVote
        }

        const savedH = localStorage.getItem('user_help5050')
        if (savedH !== null) h5050 = Number(savedH) || 0

        const savedF = localStorage.getItem('user_freezeTime')
        if (savedF !== null) fTime = Number(savedF) || 0
        
        const savedP = localStorage.getItem('user_publicVote')
        if (savedP !== null) pVote = Number(savedP) || 0

        if (profile?.consumables) {
          if (typeof profile.consumables.help5050 === 'number') h5050 = profile.consumables.help5050
          if (typeof profile.consumables.freezeTime === 'number') fTime = profile.consumables.freezeTime
          if (typeof (profile.consumables as any).publicVote === 'number') pVote = (profile.consumables as any).publicVote
        } else if ((profile as any)?.inventory?.utilities) {
          const utils = (profile as any).inventory.utilities
          if (typeof utils.fiftyFifty === 'number') h5050 = utils.fiftyFifty
          if (typeof utils.freezeTime === 'number') fTime = utils.freezeTime
          if (typeof utils.publicVote === 'number') pVote = utils.publicVote
        }

        setStock5050(h5050)
        setStockFreeze(fTime)
        setStockPublicVote(pVote)
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

  const total = quizQuestions?.length || 0
  const q = (quizQuestions && quizQuestions.length > step ? quizQuestions[step] : quizQuestions?.[0]) || null

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
    if (stock5050 <= 0 || eliminatedOptions.length > 0 || phase !== 'answering' || !q || !q?.options) return

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

  // 3. Power-Up: Pergunta ao Público (Votação Simulada)
  const handleUsePublicVote = async () => {
    if (stockPublicVote <= 0 || publicVoteResults !== null || phase !== 'answering' || !q || !q?.options) return

    const correctIdx = q.options.findIndex((opt) => opt.key === q.correct)
    const results = simulatePublicVote(correctIdx >= 0 ? correctIdx : 0)
    setPublicVoteResults(results)

    const newStock = Math.max(0, stockPublicVote - 1)
    setStockPublicVote(newStock)

    try {
      localStorage.setItem('user_publicVote', String(newStock))
      const saved = localStorage.getItem('user_consumables')
      const parsed = saved ? JSON.parse(saved) : {}
      localStorage.setItem('user_consumables', JSON.stringify({ ...parsed, publicVote: newStock }))

      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          'consumables.publicVote': increment(-1),
          'inventory.HELP_005': increment(-1),
          'inventory.consumable_public_vote': increment(-1),
        })
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.error('Erro ao debitar Pergunta ao Público:', e)
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
    setPublicVoteResults(null)
    setIsFrozen(false)
    setFreezeTimeLeft(0)
    setSeconds(60)
    setPhase('answering')
  }

  const restart = () => {
    try {
      sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
    } catch {}
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
    const catSlug = categorySlug || 'geral'

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

      // 2. Chamar primeiro o endpoint Server-Side Seguro (/api/quiz/complete) com Silent Retry
      let serverCompleted = false
      try {
        const token = await user.getIdToken()
        if (token) {
          const apiRes = await silentFetchWithRetry('/api/quiz/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              gameId: gid,
              categorySlug: catSlug,
              answers: quizQuestions.map((q, idx) => ({
                questionId: q.id,
                selectedOption: 'A', // placeholder se respondida
                isCorrect: idx < finalResult.correct,
              })),
            }),
          })
          const apiData = await apiRes.json()
          if (apiData.success && apiData.data) {
            serverCompleted = true
            const d = apiData.data
            setUserProfile((prev) =>
              prev
                ? {
                    ...prev,
                    level: d.newLevel,
                    xp: d.newTotalXp,
                    euros: d.newTotalCoins,
                    coins: d.newTotalCoins,
                  }
                : prev
            )
            return
          }
        }
      } catch (apiErr) {
        console.warn('[QUIZ] Fallback para transação de segurança local:', apiErr)
      }

      if (serverCompleted) return

      // 3. Fallback de transação local caso a API falhe (com silentAsyncRetry)
      const outcome = await silentAsyncRetry(() =>
        runTransaction(db, async (transaction) => {
          const userSnap = await transaction.get(userRef)
          if (!userSnap.exists()) {
            return { awarded: false } as GameCompletionOutcome
          }

          const currentProfile = userSnap.data() as UserProfile
          const nextTotalXp = (currentProfile.xp || 0) + finalResult.xp
          const levelInfo = calculateLevelProgress(nextTotalXp)
          const newLevel = levelInfo.currentLevel.level

          // Recompensa por subida de nível (€25 por nível)
          const currentLevelVal = currentProfile.level || 1
          const levelUpCoins = newLevel > currentLevelVal ? calculateLevelUpCoinReward(currentLevelVal, newLevel) : 0
          const totalEarnedCoins = finalResult.euros + levelUpCoins
          const nextEuros = (currentProfile.euros || 0) + totalEarnedCoins

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

        const answeredIds = quizQuestions.map((q) => String(q.id)).filter(Boolean)
        if (answeredIds.length > 0) {
          void saveAnsweredQuestions(user.uid, answeredIds)
        }

        const updatePayload: Record<string, any> = {
          xp: nextTotalXp,
          euros: nextEuros,
          coins: nextEuros,
          level: newLevel,
          gamesPlayed: nextGamesPlayed,
          questionsAnswered: nextQuestionsAnswered,
          correctAnswers: nextCorrectAnswers,
          incorrectAnswers: nextIncorrectAnswers,
          totalQuestions: nextTotalQuestions,
          bestStreak: nextBestStreak,
          categoryStats: nextCategoryStats,
          lastPlayedAt: serverTimestamp(),
        }

        if (answeredIds.length > 0) {
          updatePayload.answeredQuestionIds = arrayUnion(...answeredIds)
        }

        transaction.update(userRef, updatePayload)

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
      }))

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
                coins: outcome.newEuros,
              }
            : currentProfile
        )
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
    }
  }, [user, category, profile, addCoins, quizQuestions])

  const result: QuizResult = useMemo(() => {
    const earnedCoins = calculateMatchCoinReward({
      correctCount,
      totalQuestions: total,
      bestStreak,
      difficulty: diffLevel,
    })

    const multiplier = getDifficultyMultiplier(diffLevel)
    const baseMatchXp = correctCount * 50 + Math.round(score / 10)
    const totalXp = Math.round(baseMatchXp * multiplier)

    return {
      score,
      correct: correctCount,
      total,
      xp: totalXp,
      euros: earnedCoins,
      bestStreak,
    }
  }, [score, correctCount, total, bestStreak, diffLevel])

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
      <div className="min-h-screen w-full overflow-y-auto px-3 sm:px-4 py-6 sm:py-8 pb-24">
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

  // Barreira Visual Imediata: Não renderizar perguntas a jogadores não autenticados
  if (authResolved && !user && !auth?.currentUser) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="rounded-3xl border border-amber-500/40 bg-slate-900/95 p-8 max-w-md backdrop-blur-xl shadow-2xl text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            Login Obrigatório
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Para responder a perguntas e pontuar em qualquer modo de jogo, precisas de ter sessão iniciada.
          </p>
          <Link
            href={`/entrar?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/jogar')}`}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
          >
            Entrar com a Minha Conta
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between gap-3 sm:gap-4 p-2.5 sm:p-4 pb-8 sm:pb-6 max-w-lg mx-auto select-none animate-rise">
      {/* ========================================================= */}
      {/* 1. CABEÇALHO SOLO (TOPO COMPACTO SHRINK-0)                 */}
      {/* ========================================================= */}
      <div className="w-full shrink-0">
        <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl shadow-md">
          {/* Lado Esquerdo: Botão Desistir/Sair + Avatar + Nome/Nível */}
          <div className="flex items-center gap-2 min-w-0">
            <GameExitControl
              mode="solo"
              onConfirmExit={handleAbandonSolo}
            />
            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
              <PlayerAvatar profile={profile ?? undefined} displayName={user?.displayName || profile?.displayName || 'Tu'} isCurrentUser={true} size="sm" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-xs font-bold text-white truncate block leading-none">
                {user?.displayName || profile?.displayName || 'Jogador'}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5 block font-medium">
                Nível {profile?.level || 1}
              </span>
            </div>
          </div>

          {/* Centro: Progresso da Ronda */}
          <div className="flex items-center px-1.5 shrink-0">
            <span className="badge-hud text-gold border-gold/50 bg-gold/20 py-0.5 px-2 text-[10px] font-black rounded-lg">
              Q{step + 1}/{total}
            </span>
          </div>

          {/* Lado Direito: Pontuação Atual + Tempo */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 font-display text-xs font-bold text-cyan-400">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>{score} pts</span>
            </div>
            <span className={cn(
              'font-mono text-[10px] font-bold mt-0.5 leading-none',
              seconds <= WARNING_TIME_THRESHOLD ? 'text-flag-red animate-pulse' : 'text-slate-400'
            )}>
              {seconds}s
            </span>
          </div>
        </div>

        {/* Barra de Tempo Compacta */}
        <div className="flex items-center gap-1 mt-1.5 w-full px-0.5">
          <div className={cn(
            'h-1.5 w-full rounded-full bg-slate-800 overflow-hidden border transition-colors duration-300 flex-1',
            seconds <= WARNING_TIME_THRESHOLD ? 'border-flag-red/60' : 'border-slate-700/40'
          )}>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000 ease-linear shadow-sm',
                seconds > 15
                  ? 'bg-primary shadow-[0_0_10px_rgba(0,255,162,0.4)]'
                  : seconds > WARNING_TIME_THRESHOLD
                    ? 'bg-gold shadow-[0_0_10px_rgba(255,200,0,0.4)]'
                    : 'bg-flag-red shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse'
              )}
              style={{ width: `${(seconds / MAX_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ZONA CENTRAL: CARD DA PERGUNTA (MY-AUTO, H-AUTO)        */}
      {/* ========================================================= */}
      <div className="my-auto py-2 w-full flex flex-col items-center justify-center relative">
        {/* Feedback visual instantâneo overlay */}
        {phase === 'revealed' && (
          <div
            className={cn(
              'mb-2 px-3 py-1.5 rounded-xl font-display text-xs sm:text-sm font-black tracking-wide shadow-lg transition-all duration-300 animate-pop z-20 flex items-center gap-1.5 shrink-0 max-w-full text-center',
              selected === q.correct
                ? 'bg-primary/30 border border-primary text-primary text-glow-primary'
                : selected === null
                  ? 'bg-gold/30 border border-gold text-gold text-glow-gold'
                  : 'bg-flag-red/30 border border-flag-red text-flag-red text-glow-red'
            )}
          >
            {selected === q.correct ? (
              <>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="break-words">Resposta Correta! (+{q.points} pts)</span>
              </>
            ) : selected === null ? (
              <>
                <Clock className="h-4 w-4 shrink-0" />
                <span className="break-words">Tempo Esgotado!</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="break-words">Resposta Incorreta</span>
              </>
            )}
          </div>
        )}

        {/* Card da Pergunta: focado exclusivamente no texto da pergunta */}
        <div className="w-full min-h-[100px] h-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl relative">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-center leading-relaxed text-white break-words hyphens-auto w-full">
            {q.question}
          </h1>

          {/* Explicação resumida quando revelada */}
          {phase === 'revealed' && q.explanation && (
            <p className="mt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-2.5 break-words leading-relaxed w-full">
              {q.explanation}
            </p>
          )}

          {/* HUD Diagnóstico de Runtime (Auditável em Tempo Real) */}
          <div className="mt-3 w-full flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 bg-black/40 text-[10px] font-mono text-slate-400 select-all">
            <span className="text-emerald-400 font-bold">ID: {q.id}</span>
            <span className="text-white/20">•</span>
            <span>Fonte: <strong className="text-slate-200">QuestionRegistry</strong></span>
            <span className="text-white/20">•</span>
            <span>Cat: <strong className="text-cyan-300">{q.category}</strong></span>
            {q.subcategory && (
              <>
                <span className="text-white/20">•</span>
                <span>Sub: <strong className="text-amber-300">{q.subcategory}</strong></span>
              </>
            )}
            <span className="text-white/20">•</span>
            <span>Sessão: <strong className="text-purple-300">NVL {diffLevel}</strong></span>
            <span className="text-white/20">•</span>
            <span>Torneio: <strong className="text-slate-300">{gameId ? gameId.slice(0, 8) : 'SOLO'}</strong></span>
            <span className="text-white/20">•</span>
            <span>Dif: <strong className="text-rose-300">{q.difficulty}/5</strong></span>
          </div>
        </div>

        {/* Freeze Banner no Solo */}
        {isFrozen && (
          <div className="mt-2 rounded-xl border border-blue-400/60 bg-blue-500/20 px-3 py-1.5 text-xs text-blue-100 flex items-center justify-center gap-1.5 backdrop-blur-xl animate-pulse shadow-sm shrink-0 w-full">
            <Snowflake className="h-3.5 w-3.5 text-blue-300 animate-spin" />
            <span className="font-bold">Tempo Congelado ({freezeTimeLeft}s)</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. FUNDO: PODERES + GRELHA DE RESPOSTAS RESPONSIVA        */}
      {/* ========================================================= */}
      <div className="w-full flex flex-col gap-2 shrink-0">
        {/* Barra de Ajudas OU Botão Próxima Pergunta */}
        {phase === 'revealed' ? (
          <div className="flex justify-center my-1 shrink-0">
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-emerald-400 px-6 py-2.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-primary/25 hover:brightness-110 cursor-pointer active:scale-95 transition-all"
            >
              <span>{step + 1 >= total ? 'Ver Resultados' : 'Próxima Pergunta'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-3 my-1 shrink-0">
            <QuizPowerUpsBar
              stock5050={stock5050}
              stockFreeze={stockFreeze}
              stockPublicVote={stockPublicVote}
              used5050={eliminatedOptions.length > 0}
              usedPublicVote={publicVoteResults !== null}
              isFrozen={isFrozen}
              freezeTimeLeft={freezeTimeLeft}
              onUse5050={handleUse5050}
              onUseFreeze={handleUseFreeze}
              onUsePublicVote={handleUsePublicVote}
            />
          </div>
        )}

        {/* Grelha de Respostas 100% Adaptativa (1 coluna em mobile, 2 colunas em tablets/desktops) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full">
          {q.options.map((option, idx) => {
            const isEliminated = eliminatedOptions.includes(option.key)
            const state = stateFor(option.key)
            const optionKey = (['A', 'B', 'C', 'D'][idx] || option.key) as OptionKey

            if (isEliminated) {
              return (
                <div
                  key={option.key}
                  className="min-h-[3.75rem] h-auto w-full p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center gap-2.5 sm:gap-3 text-left opacity-35 select-none cursor-not-allowed shadow-inner"
                >
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 line-through">
                    {optionKey}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 leading-snug line-through break-words hyphens-auto flex-1 min-w-0">
                    {option.text}
                  </span>
                </div>
              )
            }

            let buttonStyles = 'bg-slate-900/90 border border-slate-700/80 active:border-cyan-400 hover:border-slate-500 shadow-lg'

            if (phase === 'revealed') {
              if (state === 'correct') {
                buttonStyles = 'bg-emerald-950/95 border-2 border-emerald-400 text-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/30'
              } else if (state === 'wrong') {
                buttonStyles = 'bg-rose-950/95 border-2 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/30'
              } else {
                buttonStyles = 'bg-slate-900/80 border border-slate-800/80 opacity-35 text-slate-500'
              }
            }

            return (
              <button
                key={option.key}
                disabled={phase !== 'answering'}
                onClick={() => reveal(option.key)}
                className={cn(
                  'min-h-[3.75rem] h-auto w-full p-2.5 sm:p-3 rounded-xl flex items-center gap-2.5 sm:gap-3 text-left transition-all select-none cursor-pointer active:scale-98 relative',
                  buttonStyles
                )}
              >
                <span
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-extrabold text-xs sm:text-sm flex items-center justify-center shrink-0 border transition-colors',
                    phase === 'revealed' && state === 'correct'
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : phase === 'revealed' && state === 'wrong'
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30'
                  )}
                >
                  {optionKey}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white leading-snug break-words hyphens-auto flex-1 min-w-0">
                  {option.text}
                </span>

                {/* Exibe a percentagem se a votação do público foi usada */}
                {publicVoteResults && publicVoteResults[idx] !== undefined && (
                  <div className="ml-auto px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400/60 text-purple-300 font-mono font-black text-xs shadow-sm flex items-center gap-1 shrink-0 animate-pop">
                    <span className="text-[10px]">👥</span>
                    <span>{publicVoteResults[idx]}%</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
