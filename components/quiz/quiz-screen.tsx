'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  Flag,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { QuestionReportModal } from '@/components/question-report-modal'
import type { UserProfile } from '@/components/player-card'
import { PlayerAvatar } from '@/components/player-avatar'
import { resolveArenaForGame } from '@/src/data/arenaCatalog'
import { ArenaRenderer } from '@/components/ArenaRenderer'
import { ArenaCinematicIntro } from '@/components/ArenaCinematicIntro'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { useEconomy } from '@/context/economy-context'
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
import { calculateMatchCoinReward, getDifficultyMultiplier } from '@/src/data/economy'
import { calculate5050Eliminated, simulatePublicVote } from '@/lib/powerup-helpers'
import { QuizPowerUpsBar } from '@/components/quiz/quiz-powerups-bar'
import { GameExitControl } from '@/components/game-exit-modal'
import { playEmoteSound } from '@/lib/sound-engine'
import { type EmoteItem } from '@/src/data/emotes'
import { safeRandomUUID } from '@/lib/utils'

import {
  CATEGORIES,
  type QuizQuestion,
  getCategoryBySlug,
  getDistrictTerritory,
} from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import { awardMatchReward, type MatchRewardOutcome } from '@/lib/xp-service'
import { getCanonicalCategory, type MatchAnswerPayload } from '@/lib/category-registry'

import {
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
import { LoadingQuiz } from '@/components/quiz/loading-quiz'
import { cn } from '@/lib/utils'

const MAX_SECONDS = QUESTION_TIME_SECONDS
const QUESTIONS_PER_GAME = 10

type Phase = 'answering' | 'revealed' | 'finished'

export type GameQuestion = QuizQuestion & {
  image?: string
  pergunta?: string
  opcoes?: [string, string, string, string] | string[]
  respostaCorreta?: number
  correctAnswer?: number
  explicacao?: string
}

type OptionKey = 'A' | 'B' | 'C' | 'D'

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

  const formatted = (categorySlug || 'Desafio').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return { name: formatted, emoji: '🇵🇹', special: false }
}

/**
 * Perguntas de emergência garantidas caso a base de dados falhe ou retorne vazio
 */
const EMERGENCY_FALLBACK_QUESTIONS: GameQuestion[] = [
  {
    id: 'emg_1',
    index: 1,
    total: 5,
    question: 'Qual é a capital oficial de Portugal?',
    pergunta: 'Qual é a capital oficial de Portugal?',
    category: 'portugal',
    difficulty: 1,
    options: [
      { key: 'A', text: 'Lisboa' },
      { key: 'B', text: 'Porto' },
      { key: 'C', text: 'Coimbra' },
      { key: 'D', text: 'Braga' },
    ],
    opcoes: ['Lisboa', 'Porto', 'Coimbra', 'Braga'],
    correct: 'A',
    correctAnswer: 0,
    respostaCorreta: 0,
    explanation: 'Lisboa é a capital e a maior cidade de Portugal.',
    explicacao: 'Lisboa é a capital e a maior cidade de Portugal.',
    points: 100,
  },
  {
    id: 'emg_2',
    index: 2,
    total: 5,
    question: 'Em que ano foi assinado o Tratado de Zamora, reconhecendo a independência de Portugal?',
    pergunta: 'Em que ano foi assinado o Tratado de Zamora, reconhecendo a independência de Portugal?',
    category: 'historia',
    difficulty: 2,
    options: [
      { key: 'A', text: '1128' },
      { key: 'B', text: '1143' },
      { key: 'C', text: '1249' },
      { key: 'D', text: '1385' },
    ],
    opcoes: ['1128', '1143', '1249', '1385'],
    correct: 'B',
    correctAnswer: 1,
    respostaCorreta: 1,
    explanation: 'O Tratado de Zamora foi assinado em 1143 por D. Afonso Henriques.',
    explicacao: 'O Tratado de Zamora foi assinado em 1143 por D. Afonso Henriques.',
    points: 100,
  },
  {
    id: 'emg_3',
    index: 3,
    total: 5,
    question: 'Qual é o ponto mais alto de Portugal Continental?',
    pergunta: 'Qual é o ponto mais alto de Portugal Continental?',
    category: 'geografia',
    difficulty: 1,
    options: [
      { key: 'A', text: 'Torre na Serra da Estrela' },
      { key: 'B', text: 'Pico da Nevosa' },
      { key: 'C', text: 'Monte do Fóia' },
      { key: 'D', text: 'Piquinho' },
    ],
    opcoes: ['Torre na Serra da Estrela', 'Pico da Nevosa', 'Monte do Fóia', 'Piquinho'],
    correct: 'A',
    correctAnswer: 0,
    respostaCorreta: 0,
    explanation: 'A Torre, na Serra da Estrela, tem 1993 metros de altitude.',
    explicacao: 'A Torre, na Serra da Estrela, tem 1993 metros de altitude.',
    points: 100,
  },
  {
    id: 'emg_4',
    index: 4,
    total: 5,
    question: 'Qual é a famosa iguaria doce tradicional de Belém, em Lisboa?',
    pergunta: 'Qual é a famosa iguaria doce tradicional de Belém, em Lisboa?',
    category: 'gastronomia',
    difficulty: 1,
    options: [
      { key: 'A', text: 'Pastel de Belém / Nata' },
      { key: 'B', text: 'Ovos Moles' },
      { key: 'C', text: 'Travesseiro de Sintra' },
      { key: 'D', text: 'Queijada de Sintra' },
    ],
    opcoes: ['Pastel de Belém / Nata', 'Ovos Moles', 'Travesseiro de Sintra', 'Queijada de Sintra'],
    correct: 'A',
    correctAnswer: 0,
    respostaCorreta: 0,
    explanation: 'Os Pastéis de Belém foram criados no início do século XIX no Mosteiro dos Jerónimos.',
    explicacao: 'Os Pastéis de Belém foram criados no início do século XIX no Mosteiro dos Jerónimos.',
    points: 100,
  },
  {
    id: 'emg_5',
    index: 5,
    total: 5,
    question: 'Quem escreveu a célebre epopeia nacional "Os Lusíadas"?',
    pergunta: 'Quem escreveu a célebre epopeia nacional "Os Lusíadas"?',
    category: 'cultura',
    difficulty: 1,
    options: [
      { key: 'A', text: 'Luís de Camões' },
      { key: 'B', text: 'Fernando Pessoa' },
      { key: 'C', text: 'Eça de Queirós' },
      { key: 'D', text: 'José Saramago' },
    ],
    opcoes: ['Luís de Camões', 'Fernando Pessoa', 'Eça de Queirós', 'José Saramago'],
    correct: 'A',
    correctAnswer: 0,
    respostaCorreta: 0,
    explanation: 'Luís de Camões publicou "Os Lusíadas" em 1572.',
    explicacao: 'Luís de Camões publicou "Os Lusíadas" em 1572.',
    points: 100,
  },
]

function formatEngineQuestion(q: any, index: number, total: number): GameQuestion {
  const rawPrompt = q?.question || q?.pergunta || 'Pergunta sobre Portugal'
  const cleanPrompt = cleanQuestionPrompt(rawPrompt)

  let rawOpts: string[] = []
  if (Array.isArray(q?.options)) {
    rawOpts = q.options.map((opt: any) => (typeof opt === 'string' ? opt : opt?.text || opt?.label || String(opt || '')))
  } else if (Array.isArray(q?.opcoes)) {
    rawOpts = q.opcoes.map((opt: any) => (typeof opt === 'string' ? opt : opt?.text || opt?.label || String(opt || '')))
  }

  if (rawOpts.length === 0) {
    rawOpts = ['Opção A', 'Opção B', 'Opção C', 'Opção D']
  }
  while (rawOpts.length < 4) {
    rawOpts.push(`Alternativa ${rawOpts.length + 1}`)
  }

  let correctIndex = 0
  if (typeof q?.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3) {
    correctIndex = q.correctAnswer
  } else if (typeof q?.respostaCorreta === 'number' && q.respostaCorreta >= 0 && q.respostaCorreta <= 3) {
    correctIndex = q.respostaCorreta
  } else if (typeof q?.correct === 'number' && q.correct >= 0 && q.correct <= 3) {
    correctIndex = q.correct
  } else if (typeof q?.correct === 'string') {
    const keyIdx = ['A', 'B', 'C', 'D'].indexOf(q.correct.toUpperCase())
    if (keyIdx >= 0) correctIndex = keyIdx
  }

  const correctText = rawOpts[correctIndex] || rawOpts[0]

  const shuffled = shuffle(
    rawOpts.map((text, i) => ({
      originalIndex: i,
      text,
    }))
  )
  const reindexed = shuffled.map((item, i) => ({
    key: (['A', 'B', 'C', 'D'][i] || 'A') as OptionKey,
    text: item.text,
  }))
  const newCorrectKey = reindexed.find((opt) => opt.text === correctText)?.key ?? 'A'
  const newCorrectIdx = ['A', 'B', 'C', 'D'].indexOf(newCorrectKey)
  const explanation = q?.explanation || q?.explicacao || `Resposta correta: ${correctText}`

  return {
    id: q?.id ? String(q.id) : `q_${index + 1}`,
    index: index + 1,
    total,
    question: cleanPrompt,
    pergunta: cleanPrompt,
    category: q?.category || q?.tema || 'geral',
    subcategory: q?.subcategory || q?.subtema,
    district: q?.district || q?.distrito,
    city: q?.city || q?.cidade,
    difficulty: Number(q?.difficulty || q?.dificuldadeNivel) || 2,
    options: reindexed,
    opcoes: reindexed.map((o) => o.text) as [string, string, string, string],
    correct: newCorrectKey,
    correctAnswer: newCorrectIdx,
    respostaCorreta: newCorrectIdx,
    explanation,
    explicacao: explanation,
    points: (Number(q?.difficulty) || 2) >= 4 ? 300 : (Number(q?.difficulty) || 2) === 3 ? 200 : 100,
    image: q?.image || q?.visual?.imageUrl,
  }
}

function createGameQuestions(
  categorySlug: string,
  subcategorySlug?: string | null,
  difficultyParam?: string | null,
  districtParam?: string | null,
  cityParam?: string | null,
): GameQuestion[] {
  try {
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

    let recentSet = new Set<string>()
    try {
      recentSet = new Set(getRecentQuestionIds())
    } catch {}

    const selected = selectBalancedMatchQuestions(rawPool, QUESTIONS_PER_GAME, recentSet, isNational)
    if (Array.isArray(selected) && selected.length > 0) {
      return selected.map((q, i) => formatEngineQuestion(q, i, selected.length))
    }
  } catch (err) {
    console.error('[CRASH /jogar]: Erro na geração de perguntas:', err)
  }
  return EMERGENCY_FALLBACK_QUESTIONS
}

export function QuizScreen({
  categorySlug,
  subcategorySlug,
  difficultyParam,
  districtParam,
  cityParam,
  gameId,
  arenaParam,
}: {
  categorySlug: string
  subcategorySlug?: string | null
  difficultyParam?: string | null
  districtParam?: string | null
  cityParam?: string | null
  gameId: string
  arenaParam?: string | null
}) {
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

  // Contextos globais protegidos
  const { user, profile, authResolved, profileLoading, updateProfileLocally } = useAuth()
  const { addCoins } = useEconomy()
  const { playSound, setCurrentStreak } = useGameTheme()

  // 1. GESTÃO SEGURA DE AUTENTICAÇÃO E CONVIDADO
  // Criação automática de fallback anónimo/temporário para convidados jogarem de imediato sem rebentar a app
  const [guestId, setGuestId] = useState<string>('anon_guest')
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        let storedGuest = localStorage.getItem('ap_guest_player_id')
        if (!storedGuest) {
          storedGuest = `anon_${safeRandomUUID().slice(0, 8)}`
          localStorage.setItem('ap_guest_player_id', storedGuest)
        }
        setGuestId(storedGuest)
      }
    } catch (err) {
      console.warn('[QuizScreen] Erro seguro ao ler guestId:', err)
    }
  }, [])

  const effectiveUserId = user?.uid || guestId
  const effectiveDisplayName = user?.displayName || profile?.displayName || 'Explorador Convidado'

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [previousLevel, setPreviousLevel] = useState<number | null>(null)

  // Perguntas iniciais seguras
  const [quizQuestions, setQuizQuestions] = useState<GameQuestion[]>(() =>
    createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
  )

  const [equippedArenaId, setEquippedArenaId] = useState<string | null>(null)
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(true)
  const [arenaBurstTrigger, setArenaBurstTrigger] = useState<'correct' | 'wrong' | null>(null)

  // Sincronização segura de arena equipada com try/catch dentro de useEffect
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('equipped_arena')
        if (saved && saved !== 'arena_palacio_nacional') {
          setEquippedArenaId(saved)
        } else if (saved === 'arena_palacio_nacional') {
          const explicitlyEquipped = localStorage.getItem('arena_explicitly_equipped') === 'true'
          if (explicitlyEquipped) {
            setEquippedArenaId(saved)
          }
        }
      }
    } catch (err) {
      console.warn('[QuizScreen] Erro ao ler arena do storage:', err)
    }
  }, [])

  // Resolução Autoritativa da Arena
  const arenaResolution = useMemo(() => {
    try {
      return resolveArenaForGame({
        arenaId: arenaParam,
        categorySlug,
        equippedArenaId,
      })
    } catch (err) {
      console.warn('[QuizScreen] Erro na resolução da arena:', err)
      return { arena: null, isExplicit: false, isFallback: true }
    }
  }, [arenaParam, categorySlug, equippedArenaId])

  const activeArena = arenaResolution.arena

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [selected, setSelected] = useState<OptionKey | null>(null)
  const [seconds, setSeconds] = useState(60)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [rewardOutcome, setRewardOutcome] = useState<MatchRewardOutcome | null>(null)
  const [savingReward, setSavingReward] = useState<boolean>(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const recordedAnswersRef = React.useRef<MatchAnswerPayload[]>([])

  // Power-Ups Stock State
  const [stock5050, setStock5050] = useState<number>(1)
  const [stockFreeze, setStockFreeze] = useState<number>(1)
  const [stockPublicVote, setStockPublicVote] = useState<number>(1)
  const [eliminatedOptions, setEliminatedOptions] = useState<OptionKey[]>([])
  const [publicVoteResults, setPublicVoteResults] = useState<number[] | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Provocações / Reações no Tabuleiro
  const [reactionCooldown, setReactionCooldown] = useState(0)

  // Sincronizar estado e carregar perguntas anti-repetição
  useEffect(() => {
    let isCancelled = false

    // 1. Tentar recuperar sessão ativa de jogo de sessionStorage dentro de try/catch
    if (typeof window !== 'undefined' && gameId) {
      try {
        const savedSession = sessionStorage.getItem(`ap_quiz_state_${gameId}`)
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          if (parsed && Array.isArray(parsed.quizQuestions) && parsed.quizQuestions.length > 0) {
            setQuizQuestions(parsed.quizQuestions)
            setStep(parsed.step ?? 0)
            setSelected(parsed.selected ?? null)
            setSeconds(parsed.seconds ?? 60)
            setScore(parsed.score ?? 0)
            setCorrectCount(parsed.correctCount ?? 0)
            setStreak(parsed.streak ?? 0)
            setBestStreak(parsed.bestStreak ?? 0)
            setPhase(parsed.phase ?? 'answering')
            if (Array.isArray(parsed.recordedAnswers)) {
              recordedAnswersRef.current = parsed.recordedAnswers
            }
            return
          }
        }
      } catch (e) {
        console.warn('[QuizScreen] Aviso ao ler cache de sessão:', e)
      }
    }

    getUniqueMatchQuestions(
      effectiveUserId,
      categorySlug,
      diffLevel,
      QUESTIONS_PER_GAME,
      subcategorySlug || undefined,
      districtParam || undefined,
      cityParam || undefined
    )
      .then((uniqueQuestions) => {
        if (isCancelled) return
        if (Array.isArray(uniqueQuestions) && uniqueQuestions.length > 0) {
          const formatted = uniqueQuestions.map((q, i) => formatEngineQuestion(q, i, uniqueQuestions.length))
          recordedAnswersRef.current = []
          setQuizQuestions(formatted)
        } else {
          const fallback = createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
          recordedAnswersRef.current = []
          setQuizQuestions(fallback.length > 0 ? fallback : EMERGENCY_FALLBACK_QUESTIONS)
        }
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
        console.error('[CRASH /jogar]: Erro ao carregar perguntas anti-repetição:', err)
        if (!isCancelled) {
          const fallback = createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
          recordedAnswersRef.current = []
          setQuizQuestions(fallback.length > 0 ? fallback : EMERGENCY_FALLBACK_QUESTIONS)
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
  }, [gameId, categorySlug, subcategorySlug, diffLevel, difficultyParam, districtParam, cityParam, effectiveUserId])

  // Persistir sessão ativa com try/catch
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
        recordedAnswers: recordedAnswersRef.current,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(`ap_quiz_state_${gameId}`, JSON.stringify(sessionPayload))
    } catch {}
  }, [gameId, step, score, correctCount, streak, bestStreak, phase, selected, quizQuestions])

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

  // Sincronização segura de power-ups stock
  useEffect(() => {
    const syncStock = () => {
      try {
        let h5050 = 1
        let fTime = 1
        let pVote = 1

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
        }

        setStock5050(h5050)
        setStockFreeze(fTime)
        setStockPublicVote(pVote)
      } catch (err) {
        console.warn('[QuizScreen] Aviso ao sincronizar stock:', err)
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

  // BLINDAGEM DO CICLO DE VIDA DA SESSÃO FIREBASE
  // Não inicia a montagem do tabuleiro nem renderiza HUD sem a sessão de autenticação resolvida
  if (!authResolved || (user && profileLoading)) {
    return <LoadingQuiz message="A sincronizar sessão de jogo..." submessage="A preparar perfil e progresso..." />
  }

  // BLINDAGEM DO BANCO DE PERGUNTAS (EXIGÊNCIA DE ROBUSTEZ)
  const questions = quizQuestions
  const currentIndex = step

  // 1. Validar existência e tamanho do array
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return <LoadingQuiz message="A preparar perguntas do desafio..." />
  }

  // 2. Nunca assumir que questions[currentIndex] existe. Usar encadeamento opcional e fallbacks seguros
  const currentQuestion = questions[currentIndex] || questions[0]
  if (!currentQuestion?.opcoes || !currentQuestion?.pergunta) {
    return <LoadingQuiz message="A carregar questão..." />
  }

  const q = currentQuestion
  const total = questions.length

  // Power-Ups Handlers protegidos
  const handleUse5050 = async () => {
    if (stock5050 <= 0 || eliminatedOptions.length > 0 || phase !== 'answering' || !q?.options) return

    const eliminated = calculate5050Eliminated(q.options, q.correct)
    setEliminatedOptions(eliminated)

    const newStock = Math.max(0, stock5050 - 1)
    setStock5050(newStock)

    try {
      localStorage.setItem('user_help5050', String(newStock))
      const saved = localStorage.getItem('user_consumables')
      const parsed = saved ? JSON.parse(saved) : {}
      localStorage.setItem('user_consumables', JSON.stringify({ ...parsed, help5050: newStock }))

      if (auth?.currentUser?.uid) {
        const res = await useConsumablePowerUp(auth.currentUser.uid, 'consumable_50_50')
        if (res.success) {
          setStock5050(res.remainingCount)
        }
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.warn('[QuizScreen] Aviso ao debitar 50/50:', e)
    }
  }

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

      if (auth?.currentUser?.uid) {
        const res = await useConsumablePowerUp(auth.currentUser.uid, 'consumable_congelar_tempo')
        if (res.success) {
          setStockFreeze(res.remainingCount)
        }
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.warn('[QuizScreen] Aviso ao debitar Congelar Tempo:', e)
    }
  }

  const handleUsePublicVote = async () => {
    if (stockPublicVote <= 0 || publicVoteResults !== null || phase !== 'answering' || !q?.options) return

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

      if (auth?.currentUser?.uid) {
        const res = await useConsumablePowerUp(auth.currentUser.uid, 'HELP_005')
        if (res.success) {
          setStockPublicVote(res.remainingCount)
        }
      }
      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
    } catch (e) {
      console.warn('[QuizScreen] Aviso ao debitar Pergunta ao Público:', e)
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

      // Registo da resposta canónica para relatório final
      try {
        recordedAnswersRef.current.push({
          questionId: String(q.id),
          categoryId: getCanonicalCategory(q.category, q.subcategory, String(q.id), q.question),
          category: q.category,
          subcategory: q.subcategory,
          prompt: q.question,
          selectedOption: choice || '',
          isCorrect: hit,
          answeredAt: Date.now(),
        })
      } catch {}

      if (hit) {
        setArenaBurstTrigger('correct')
        setTimeout(() => setArenaBurstTrigger(null), 1000)
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
        setArenaBurstTrigger('wrong')
        setTimeout(() => setArenaBurstTrigger(null), 1000)
        setStreak(0)
        setCurrentStreak(0)
        playSound('wrong')
      }

      setPhase('revealed')
    },
    [phase, q, seconds, streak, playSound, setCurrentStreak]
  )

  // Question Countdown Timer
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

  const processMatchCompletion = useCallback(
    async (gid: string, finalResult: QuizResult) => {
      if (rewardOutcome && !rewardOutcome.alreadyProcessed) return

      // Utilizador Convidado (sem conta autenticada): processamento local 100% seguro sem crash
      if (!user?.uid) {
        try {
          const savedXp = Number(localStorage.getItem('user_xp') || 0)
          const savedCoins = Number(localStorage.getItem('user_coins') || 50)
          const newTotalXp = savedXp + finalResult.xp
          const newTotalCoins = savedCoins + finalResult.euros
          const oldLevel = calculateLevelProgress(savedXp).currentLevel.level
          const newLevel = calculateLevelProgress(newTotalXp).currentLevel.level

          localStorage.setItem('user_xp', String(newTotalXp))
          localStorage.setItem('user_coins', String(newTotalCoins))
          localStorage.setItem('user_euros', String(newTotalCoins))
          localStorage.setItem('user_level', String(newLevel))

          const guestOutcome: MatchRewardOutcome = {
            alreadyProcessed: false,
            matchId: gid,
            xpEarned: finalResult.xp,
            coinsEarned: finalResult.euros,
            oldXp: savedXp,
            newTotalXp: newTotalXp,
            oldCoins: savedCoins,
            newTotalCoins: newTotalCoins,
            oldLevel: oldLevel,
            newLevel: newLevel,
            leveledUp: newLevel > oldLevel,
            levelTitle: calculateLevelProgress(newTotalXp).currentLevel.title,
            oldStreak: 0,
            newStreak: 1,
            unlockedAchievements: [],
            completedMissions: [],
          }
          setRewardOutcome(guestOutcome)
        } catch (e) {
          console.warn('[QuizScreen] Erro ao gravar progresso local de convidado:', e)
        }
        return
      }

      // Utilizador Autenticado: Gravação na nuvem com tratamento de exceções
      setSavingReward(true)
      try {
        const answeredIds = quizQuestions.map((quest) => String(quest.id)).filter(Boolean)
        if (answeredIds.length > 0 && user?.uid) {
          void saveAnsweredQuestions(user.uid, answeredIds)
        }

        const outcome = await awardMatchReward({
          userId: user?.uid || effectiveUserId,
          matchId: gid,
          categorySlug: categorySlug || 'geral',
          categoryName: category?.name || 'Portugal',
          matchType: 'solo_quiz',
          correctAnswers: finalResult.correct,
          totalQuestions: finalResult.total,
          score: finalResult.score,
          bestStreak: finalResult.bestStreak,
          difficultyMultiplier: getDifficultyMultiplier(diffLevel),
          answeredQuestionIds: answeredIds,
          answers: recordedAnswersRef.current,
        })

        setRewardOutcome(outcome)

        setUserProfile((currentProfile) =>
          currentProfile
            ? {
                ...currentProfile,
                level: outcome.newLevel,
                xp: outcome.newTotalXp,
                euros: outcome.newTotalCoins,
                coins: outcome.newTotalCoins,
                streak: outcome.newStreak,
                categoryStats: outcome.categoryStats
                  ? { ...(currentProfile.categoryStats || {}), ...outcome.categoryStats }
                  : currentProfile.categoryStats,
              }
            : currentProfile
        )

        if (updateProfileLocally) {
          updateProfileLocally({
            xp: outcome.newTotalXp,
            level: outcome.newLevel,
            coins: outcome.newTotalCoins,
            euros: outcome.newTotalCoins,
          })
        }
      } catch (err) {
        console.error('[CRASH /jogar]: Erro na atribuição de recompensa:', err)
      } finally {
        setSavingReward(false)
      }
    },
    [user?.uid, categorySlug, category?.name, diffLevel, quizQuestions, updateProfileLocally, rewardOutcome]
  )

  const next = () => {
    if (step + 1 >= total) {
      setPhase('finished')
      void processMatchCompletion(gameId, result)
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
    recordedAnswersRef.current = []
    const nextGameId = safeRandomUUID()
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
    setRewardOutcome(null)
    setSavingReward(false)
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

  const levelUpInfo =
    previousLevel !== null && userProfile && userProfile.level > previousLevel
      ? { from: previousLevel, to: userProfile.level }
      : undefined

  // SEÇÃO DE RENDERIZAÇÃO
  // 1. Se a sessão de autenticação estiver a carregar inicialmente, exibe espera neutra
  const isAuthInitializing = !authResolved || profileLoading
  if (isAuthInitializing && !user) {
    return <LoadingQuiz message="A verificar sessão de jogo..." />
  }

  // 2. Fim de jogo: Apresentar ecrã de resultados
  if (phase === 'finished') {
    return (
      <div className="min-h-screen w-full overflow-y-auto px-3 sm:px-4 py-6 sm:py-8 pb-24">
        <div className="mx-auto max-w-2xl">
          <ResultScreen
            result={result}
            gameId={gameId}
            onRestart={restart}
            categoryTitle={category?.name || 'Desafio Nacional'}
            difficultyLabel={diffLevel >= 4 ? 'DIFÍCIL' : diffLevel === 3 ? 'MÉDIO' : 'NORMAL'}
            rewardOutcome={rewardOutcome}
            savingReward={savingReward}
            levelUpInfo={levelUpInfo}
            answers={recordedAnswersRef.current}
            onExit={handleAbandonSolo}
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

  // Resolução da Arena
  if (arenaResolution.error || !activeArena) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <ArenaRenderer
          arenaId={arenaParam}
          categorySlug={categorySlug}
          equippedArenaId={equippedArenaId}
          className="max-w-xl shadow-2xl"
        />
      </div>
    )
  }

  return (
    <>
      {/* 0. INTRODUÇÃO CINEMATOGRÁFICA DA ARENA */}
      {showCinematicIntro && activeArena && (
        <ArenaCinematicIntro
          arena={activeArena}
          playerName={effectiveDisplayName}
          playerTier={profile?.level ? `NÍVEL ${profile.level}` : 'CONVIDADO'}
          onComplete={() => setShowCinematicIntro(false)}
          onSkip={() => setShowCinematicIntro(false)}
        />
      )}

      {/* Camada Master da Arena */}
      {activeArena && (
        <ArenaRenderer
          arenaId={activeArena.id}
          streak={streak}
          burstTrigger={arenaBurstTrigger}
          className="fixed inset-0 pointer-events-none -z-40"
          showAtmosphere={true}
          showLighting={true}
          showBadge={false}
        />
      )}

      <div className="relative min-h-[100dvh] w-full flex flex-col justify-between gap-3 sm:gap-4 p-2.5 sm:p-4 pb-8 sm:pb-6 max-w-lg mx-auto select-none animate-rise">
        {/* ========================================================= */}
        {/* 1. CABEÇALHO SOLO COMPACTO                                */}
        {/* ========================================================= */}
        <div className="w-full shrink-0">
          <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl shadow-md">
            {/* Lado Esquerdo: Sair + Avatar + Jogador */}
            <div className="flex items-center gap-2 min-w-0">
              <GameExitControl mode="solo" onConfirmExit={handleAbandonSolo} />
              <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                <PlayerAvatar
                  profile={profile ?? undefined}
                  displayName={effectiveDisplayName}
                  isCurrentUser={true}
                  size="sm"
                />
              </div>
              <div className="min-w-0">
                <span className="font-display text-xs font-bold text-white truncate block leading-none">
                  {effectiveDisplayName}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5 block font-medium">
                  {profile?.level ? `Nível ${profile.level}` : 'Convidado'}
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
              <span
                className={cn(
                  'font-mono text-[10px] font-bold mt-0.5 leading-none',
                  seconds <= WARNING_TIME_THRESHOLD ? 'text-flag-red animate-pulse' : 'text-slate-400'
                )}
              >
                {seconds}s
              </span>
            </div>
          </div>

          {/* Barra de Tempo Compacta */}
          <div className="flex items-center gap-1 mt-1.5 w-full px-0.5">
            <div
              className={cn(
                'h-1.5 w-full rounded-full bg-slate-800 overflow-hidden border transition-colors duration-300 flex-1',
                seconds <= WARNING_TIME_THRESHOLD ? 'border-flag-red/60' : 'border-slate-700/40'
              )}
            >
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
        {/* 2. ZONA CENTRAL: CARD DA PERGUNTA                         */}
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

          {/* Card da Pergunta */}
          <div className="w-full min-h-[100px] h-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center text-center bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl relative">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-center leading-relaxed text-white break-words hyphens-auto w-full">
              {q.question || q.pergunta}
            </h1>

            {/* Explicação contextual */}
            {phase === 'revealed' && (q.explanation || q.explicacao) && (
              <p className="mt-3 text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-2.5 break-words leading-relaxed w-full">
                {q.explanation || q.explicacao}
              </p>
            )}

            {/* HUD Diagnóstico de Runtime */}
            <div className="mt-3 w-full flex flex-wrap items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 bg-black/40 text-[10px] font-mono text-slate-400 select-all">
              <span className="text-emerald-400 font-bold">ID: {q.id}</span>
              <span className="text-white/20">•</span>
              <span>Cat: <strong className="text-cyan-300">{q.category}</strong></span>
              {q.subcategory && (
                <>
                  <span className="text-white/20">•</span>
                  <span>Sub: <strong className="text-amber-300">{q.subcategory}</strong></span>
                </>
              )}
              <span className="text-white/20">•</span>
              <span>NVL: <strong className="text-purple-300">{diffLevel}</strong></span>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition cursor-pointer font-bold px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                title="Reportar erro editorial nesta pergunta"
              >
                <Flag className="h-2.5 w-2.5 text-amber-400" />
                <span>Reportar</span>
              </button>
            </div>
          </div>

          {/* Banner de tempo congelado */}
          {isFrozen && (
            <div className="mt-2 rounded-xl border border-blue-400/60 bg-blue-500/20 px-3 py-1.5 text-xs text-blue-100 flex items-center justify-center gap-1.5 backdrop-blur-xl animate-pulse shadow-sm shrink-0 w-full">
              <Snowflake className="h-3.5 w-3.5 text-blue-300 animate-spin" />
              <span className="font-bold">Tempo Congelado ({freezeTimeLeft}s)</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. FUNDO: PODERES + GRELHA DE RESPOSTAS                   */}
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

          {/* Grelha de Respostas Adaptativa */}
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

              let buttonStyles =
                'bg-slate-900/90 border border-slate-700/80 active:border-cyan-400 hover:border-slate-500 shadow-lg'

              if (phase === 'revealed') {
                if (state === 'correct') {
                  buttonStyles =
                    'bg-emerald-950/95 border-2 border-emerald-400 text-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/30'
                } else if (state === 'wrong') {
                  buttonStyles =
                    'bg-rose-950/95 border-2 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/30'
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

        <QuestionReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          questionId={q?.id ? Number(q.id) || 0 : 0}
          questionText={q?.question || q?.pergunta || ''}
          categoryName={category?.name}
          user={user ?? null}
        />
      </div>
    </>
  )
}
