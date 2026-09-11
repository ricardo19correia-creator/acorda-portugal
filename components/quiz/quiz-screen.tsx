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
import { setGlobalArenaMatchActive } from '@/lib/game-active-state'
import { logGameFlow } from '@/lib/game-session'
import { useAuth } from '@/components/auth-provider'
import { auth } from '@/lib/firebase'
import { AuthWallView } from '@/components/auth-wall-modal'
import { useEconomy } from '@/context/economy-context'
import { useGameTheme } from '@/context/game-theme-context'
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
import { QuizPowerUpsBar } from '@/components/quiz/quiz-powerups-bar'
import { AidPreviewModal } from '@/components/quiz/aid-preview-modal'
import { CANONICAL_AIDS } from '@/lib/aid-service'
import { useGameAids } from '@/hooks/use-game-aids'
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
  if (districtParam || categorySlug === 'conquista-do-distrito' || categorySlug === 'o-meu-distrito' || categorySlug === 'distrito') {
    const distName = districtParam || 'Portugal'
    const distInfo = getDistrictTerritory(distName)
    return {
      name: `Conquista de ${distName}`,
      subtitle: distInfo?.titleBadge || 'Classificação & Poder Territorial',
      emoji: '📍',
      special: false,
    }
  }
  if (cityParam || categorySlug === 'desafio-cidade' || categorySlug === 'cidade') {
    const cityName = cityParam || 'Concelho'
    return {
      name: `Meu Distrito`,
      subtitle: `Desafio do Concelho de ${cityName}`,
      emoji: '🏙️',
      special: false,
    }
  }
  if (categorySlug === 'desafio-nacional' || categorySlug === 'nacional' || categorySlug === 'quick') {
    return { name: 'Desafio Nacional', subtitle: 'Conhecimento Geral de Portugal', emoji: '🇵🇹', special: false }
  }
  if (categorySlug === 'modo-aleatorio' || categorySlug === 'aleatorio') {
    return { name: 'Modo Aleatório', subtitle: 'Roleta de Conhecimento Imprevisível', emoji: '🎲', special: true }
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
  isFresh = false,
}: {
  categorySlug: string
  subcategorySlug?: string | null
  difficultyParam?: string | null
  districtParam?: string | null
  cityParam?: string | null
  gameId: string
  arenaParam?: string | null
  isFresh?: boolean
}) {
  const router = useRouter()

  // Sinalizar partida ativa para desligar imediatamente o vídeo global e dar 100% de foco à arena
  useEffect(() => {
    setGlobalArenaMatchActive(true)
    return () => {
      setGlobalArenaMatchActive(false)
    }
  }, [])
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

  // 1. GESTÃO ESTRITA DE AUTENTICAÇÃO
  const effectiveUserId = user?.uid || ''
  const effectiveDisplayName = user?.displayName || profile?.displayName || 'Explorador'

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [previousLevel, setPreviousLevel] = useState<number | null>(null)

  // Perguntas iniciais seguras
  const [quizQuestions, setQuizQuestions] = useState<GameQuestion[]>(() =>
    createGameQuestions(categorySlug, subcategorySlug, difficultyParam, districtParam, cityParam)
  )

  const [equippedArenaId, setEquippedArenaId] = useState<string | null>(null)
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(true)

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

  // Registo de fluxo autoritativo: criação de partida e seleção de arena
  useEffect(() => {
    logGameFlow('MATCH_CREATE', {
      gameId,
      categorySlug,
      categoryName: category?.name,
      difficulty: diffLevel,
      equippedArenaId,
    })
    if (activeArena) {
      logGameFlow('ARENA_SELECT', {
        categorySlug,
        arenaId: activeArena.id,
        arenaName: activeArena.name,
        isFallback: arenaResolution.isFallback,
        isExplicit: arenaResolution.isExplicit,
      })
    }
  }, [gameId, categorySlug, category?.name, diffLevel, equippedArenaId, activeArena, arenaResolution.isFallback, arenaResolution.isExplicit])

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
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(!isFresh)
  const [isRecovering, setIsRecovering] = useState<boolean>(false)
  const [showLoadingFallback, setShowLoadingFallback] = useState<boolean>(false)
  const [fallbackCountdown, setFallbackCountdown] = useState<number>(4)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Aliases canónicos para controlo de carregamento
  const isLoading = isLoadingMatch || isRecovering
  const setIsLoading = setIsLoadingMatch
  const setRecovering = setIsRecovering

  const cleanOldSessionStorage = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('active_game_session')
        localStorage.removeItem('active_session_id')
        sessionStorage.removeItem('active_game_session')
        sessionStorage.removeItem('active_session_id')
        sessionStorage.removeItem('ap_error_auto_retried')
        if (gameId) {
          sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
          localStorage.removeItem(`ap_quiz_state_${gameId}`)
        }
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('session') ||
              key.includes('challenge'))
          ) {
            localStorage.removeItem(key)
          }
        }
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i)
          if (
            key &&
            (key.startsWith('ap_quiz_state_') ||
              key.startsWith('quiz_') ||
              key.includes('session') ||
              key.includes('challenge'))
          ) {
            sessionStorage.removeItem(key)
          }
        }
      }
    } catch (cleanErr) {
      console.warn('[QuizScreen] Erro na limpeza segura de storage:', cleanErr)
    }
  }, [gameId])

  const recordedAnswersRef = React.useRef<MatchAnswerPayload[]>([])

  // BLINDAGEM DO BANCO DE PERGUNTAS (DECLARAÇÃO ESTÁVEL PARA EXECUÇÃO SEGURA DOS HOOKS)
  const questions = quizQuestions && quizQuestions.length > 0 ? quizQuestions : EMERGENCY_FALLBACK_QUESTIONS
  const currentIndex = Math.min(Math.max(0, step), Math.max(0, (questions?.length || 1) - 1))
  const rawQ = questions[currentIndex] || questions[0] || EMERGENCY_FALLBACK_QUESTIONS[0]

  // Normalização estrita da pergunta ativa para impedir qualquer runtime crash ou loading infinito
  const currentQuestion = useMemo(() => {
    const prompt = rawQ?.question || rawQ?.pergunta || 'Pergunta sobre Portugal'
    const opts =
      Array.isArray(rawQ?.options) && rawQ.options.length >= 2
        ? rawQ.options
        : Array.isArray(rawQ?.opcoes)
        ? rawQ.opcoes.map((o: any, idx: number) => ({
            key: (['A', 'B', 'C', 'D'][idx] || 'A') as OptionKey,
            text: typeof o === 'string' ? o : o?.text || String(o || ''),
          }))
        : [
            { key: 'A' as OptionKey, text: 'Opção A' },
            { key: 'B' as OptionKey, text: 'Opção B' },
            { key: 'C' as OptionKey, text: 'Opção C' },
            { key: 'D' as OptionKey, text: 'Opção D' },
          ]

    const opcoesList: [string, string, string, string] =
      Array.isArray(rawQ?.opcoes) && rawQ.opcoes.length >= 2
        ? (rawQ.opcoes as [string, string, string, string])
        : (opts.map((o: any) => o.text || String(o)) as [string, string, string, string])

    return {
      ...rawQ,
      question: prompt,
      pergunta: prompt,
      options: opts,
      opcoes: opcoesList,
      correct: rawQ?.correct || 'A',
      explanation: rawQ?.explanation || rawQ?.explicacao || '',
      explicacao: rawQ?.explicacao || rawQ?.explanation || '',
    }
  }, [rawQ])
  const q = currentQuestion
  const total = questions?.length || 10

  // Power-Ups Canónicos Unificados (SSOT: idêntico ao 1v1 Multiplayer)
  const {
    stocks: aidStocks,
    isHelpProcessing,
    eliminatedOptions,
    publicVoteResults,
    isFrozen,
    freezeTimeLeft,
    selectedPreviewAid,
    aidToast,
    requestPreview: handleRequestAidPreview,
    cancelPreview: handleCancelAidPreview,
    confirmUseAid: handleConfirmUseAid,
    executeUseAid,
    resetQuestionAids,
    setIsFrozen,
  } = useGameAids({
    gameMode: 'solo',
    currentQuestion: q
      ? {
          id: q.id,
          question: q.question || q.pergunta,
          options: q.options,
          correct: q.correct || (['A', 'B', 'C', 'D'][q.correctAnswer ?? 0] ?? 'A'),
          explanation: q.explanation || q.explicacao,
          category: q.category,
        }
      : null,
    disabled: phase !== 'answering',
    onFreezeApplied: (bonus) => {
      setSeconds((prev) => Math.min(MAX_SECONDS + 15, prev + bonus))
    },
  })

  // Provocações / Reações no Tabuleiro
  const [reactionCooldown, setReactionCooldown] = useState(0)

  // 1. AÇÃO DEFINITIVA: INICIAR NOVO DESAFIO LIMPO IMEDIATAMENTE (OU POR TIMEOUT)
  const handleForceCleanStart = useCallback(() => {
    console.warn('[QuizScreen] Fallback acionado: cancelando fetches pendentes e iniciando desafio limpo imediatamente...')

    // A. Força o cancelamento imediato de qualquer fetch/listener pendente
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort()
      } catch {}
      abortControllerRef.current = null
    }

    // B. Define os estados de carregamento como inativos
    setIsLoading(false)
    setRecovering(false)
    setIsLoadingMatch(false)
    setIsRecovering(false)
    setShowLoadingFallback(false)

    // C. Limpa explicitamente do LocalStorage e SessionStorage as chaves da sessão antiga
    cleanOldSessionStorage()

    // D. Inicializa o estado com as perguntas base locais e força a transição direta para o Quiz
    const baseQuestions = createGameQuestions(
      categorySlug,
      subcategorySlug,
      difficultyParam,
      districtParam,
      cityParam
    )
    const safeQuestions = Array.isArray(baseQuestions) && baseQuestions.length > 0 ? baseQuestions : EMERGENCY_FALLBACK_QUESTIONS

    setQuizQuestions(safeQuestions)
    setStep(0)
    setSelected(null)
    setSeconds(60)
    setScore(0)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setPhase('answering')
    recordedAnswersRef.current = []
    resetQuestionAids()
  }, [
    categorySlug,
    subcategorySlug,
    difficultyParam,
    districtParam,
    cityParam,
    cleanOldSessionStorage,
    resetQuestionAids,
    setIsLoading,
    setRecovering,
  ])

  // Se for partida limpa (fresh=true), assegura que os loaders estão inativos desde o 1º instante
  useEffect(() => {
    if (isFresh) {
      cleanOldSessionStorage()
      setIsLoadingMatch(false)
      setIsRecovering(false)
      setShowLoadingFallback(false)
    }
  }, [isFresh, cleanOldSessionStorage])

  // Temporizador visual do fallback: após 1.5s exibe o botão "INICIAR NOVO DESAFIO AGORA"
  useEffect(() => {
    if (!isLoading) {
      setShowLoadingFallback(false)
      return
    }

    const timer = setTimeout(() => {
      setShowLoadingFallback(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isLoading])

  // Contagem decrescente do fallback: esgotado o tempo (4s adicionais), força a transição direta
  useEffect(() => {
    if (!isLoading || !showLoadingFallback) return

    const interval = setInterval(() => {
      setFallbackCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleForceCleanStart()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading, showLoadingFallback, handleForceCleanStart])

  // Sincronizar estado e carregar perguntas anti-repetição com AbortController e failsafe
  useEffect(() => {
    if (isFresh) {
      setIsLoadingMatch(false)
      setIsRecovering(false)
      return
    }

    let isCancelled = false
    let timeoutId: NodeJS.Timeout | null = null
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // 1. Tentar recuperar sessão ativa de jogo de sessionStorage
    if (typeof window !== 'undefined' && gameId) {
      try {
        const savedSession = sessionStorage.getItem(`ap_quiz_state_${gameId}`)
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          if (parsed && Array.isArray(parsed.quizQuestions) && parsed.quizQuestions.length > 0) {
            const isValid = parsed.quizQuestions.every(
              (item: any) =>
                item &&
                (item.question || item.pergunta) &&
                ((Array.isArray(item.options) && item.options.length >= 2) ||
                  (Array.isArray(item.opcoes) && item.opcoes.length >= 2))
            )

            if (isValid) {
              setQuizQuestions(parsed.quizQuestions)
              setStep(
                typeof parsed.step === 'number' ? Math.min(parsed.step, parsed.quizQuestions.length - 1) : 0
              )
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
              setIsLoadingMatch(false)
              setIsRecovering(false)
              return
            } else {
              console.warn(
                '[QuizScreen] Sessão em cache com perguntas corrompidas. A descartar e gerar novo desafio limpo...'
              )
              sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
            }
          }
        }
      } catch (e) {
        console.error('[QuizScreen] Erro ao recuperar sessão em cache:', e)
        try {
          sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
        } catch {}
      }
    }

    // 2. Failsafe Timeout no carregamento das perguntas da arena
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        console.error(
          '[FAILSAFE /jogar]: Timeout no carregamento de perguntas da arena. A ativar fallback de emergência...'
        )
        reject(new Error('TIMEOUT: Tempo limite de carregamento excedido'))
      }, 5000)
    })

    Promise.race([
      getUniqueMatchQuestions(
        effectiveUserId,
        categorySlug,
        diffLevel,
        QUESTIONS_PER_GAME,
        subcategorySlug || undefined,
        districtParam || undefined,
        cityParam || undefined
      ),
      timeoutPromise,
    ])
      .then((uniqueQuestions) => {
        if (isCancelled || abortController.signal.aborted) return
        if (Array.isArray(uniqueQuestions) && uniqueQuestions.length > 0) {
          const formatted = uniqueQuestions.map((item, i) =>
            formatEngineQuestion(item, i, uniqueQuestions.length)
          )
          recordedAnswersRef.current = []
          setQuizQuestions(formatted)
        } else {
          console.warn('[QuizScreen] Nenhuma pergunta retornada pelo motor. A ativar fallback base local.')
          const fallback = createGameQuestions(
            categorySlug,
            subcategorySlug,
            difficultyParam,
            districtParam,
            cityParam
          )
          recordedAnswersRef.current = []
          setQuizQuestions(fallback.length > 0 ? fallback : EMERGENCY_FALLBACK_QUESTIONS)
        }
        setStep(0)
        setSelected(null)
        resetQuestionAids()
        setSeconds(60)
        setScore(0)
        setCorrectCount(0)
        setStreak(0)
        setBestStreak(0)
        setPhase('answering')
      })
      .catch((err) => {
        if (abortController.signal.aborted) return
        console.error('[CRASH /jogar]: Erro ou timeout na recuperação/carregamento das perguntas do desafio:', err)
        if (!isCancelled) {
          cleanOldSessionStorage()
          const fallback = createGameQuestions(
            categorySlug,
            subcategorySlug,
            difficultyParam,
            districtParam,
            cityParam
          )
          recordedAnswersRef.current = []
          setQuizQuestions(fallback.length > 0 ? fallback : EMERGENCY_FALLBACK_QUESTIONS)
          setStep(0)
          setSelected(null)
          resetQuestionAids()
          setSeconds(60)
          setScore(0)
          setCorrectCount(0)
          setStreak(0)
          setBestStreak(0)
          setPhase('answering')
        }
      })
      .finally(() => {
        if (timeoutId) clearTimeout(timeoutId)
        if (!isCancelled && !abortController.signal.aborted) {
          setIsLoadingMatch(false)
          setIsRecovering(false)
        }
      })

    return () => {
      isCancelled = true
      abortController.abort()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [
    gameId,
    categorySlug,
    subcategorySlug,
    diffLevel,
    difficultyParam,
    districtParam,
    cityParam,
    effectiveUserId,
    isFresh,
    cleanOldSessionStorage,
    resetQuestionAids,
  ])

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

      // Apenas utilizadores autenticados podem processar partidas e receber recompensas
      if (!user?.uid) {
        return
      }

      // Utilizador Autenticado: Gravação na nuvem com tratamento de exceções
      setSavingReward(true)
      try {
        const answeredIds = quizQuestions.map((quest) => String(quest.id)).filter(Boolean)
        if (answeredIds.length > 0 && user?.uid) {
          void saveAnsweredQuestions(user.uid, answeredIds)
        }

        const isTerritoryMatch =
          categorySlug === 'conquista-do-distrito' ||
          categorySlug === 'o-meu-distrito' ||
          categorySlug === 'distrito' ||
          Boolean(districtParam)

        const isCityMatch =
          categorySlug === 'desafio-cidade' ||
          categorySlug === 'cidade' ||
          Boolean(cityParam)

        const isRandomMatch =
          categorySlug === 'modo-aleatorio' ||
          categorySlug === 'aleatorio'

        const matchType = isTerritoryMatch
          ? 'conquista_distrito'
          : isCityMatch
          ? 'desafio_cidade'
          : isRandomMatch
          ? 'modo_aleatorio'
          : 'solo_quiz'

        const outcome = await awardMatchReward({
          userId: user?.uid || effectiveUserId,
          matchId: gid,
          categorySlug: categorySlug || 'geral',
          categoryName: category?.name || 'Portugal',
          matchType,
          district: districtParam || undefined,
          city: cityParam || undefined,
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
    resetQuestionAids()
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
    resetQuestionAids()
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

  // Efeito de ciclo de vida da Arena
  useEffect(() => {
    if (activeArena) {
      logGameFlow('ARENA_LOAD', {
        arenaId: activeArena.id,
        arenaName: activeArena.name,
        assetPath: activeArena.assetPath,
      })
      logGameFlow('ARENA_READY', {
        arenaId: activeArena.id,
        arenaName: activeArena.name,
      })
    }
  }, [activeArena])

  const handleCompleteIntro = useCallback(() => {
    setShowCinematicIntro(false)
    if (activeArena && questions.length > 0) {
      logGameFlow('QUIZ_START', {
        gameId,
        categorySlug,
        arenaId: activeArena.id,
        totalQuestions: questions.length,
        firstQuestionPrompt: questions[0]?.question,
      })
    }
  }, [gameId, categorySlug, activeArena, questions])

  // SEÇÃO DE RENDERIZAÇÃO (TODOS OS HOOKS EXECUTADOS DE FORMA INCONDICIONAL)
  // 1. Se a sessão de autenticação estiver a carregar inicialmente sem utilizador, exibe espera neutra
  const isAuthInitializing = !authResolved || (Boolean(user) && profileLoading)
  if (isAuthInitializing && !user) {
    return <LoadingQuiz message="A sincronizar sessão de jogo..." submessage="A preparar perfil e progresso..." />
  }

  // 🔒 BLOQUEIO DEFINITIVO DE CONVIDADO / NÃO AUTENTICADO
  if (!user) {
    const currentTarget = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/jogar'
    return <AuthWallView targetUrl={currentTarget} />
  }

  // 2. Validação segura do banco de perguntas e estado de carregamento
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] sm:min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
        <LoadingQuiz
          message="A preparar perguntas do desafio..."
          submessage={
            showLoadingFallback
              ? `A preparar a arena e os desafios para ti (início limpo automático em ${fallbackCountdown}s)...`
              : 'A preparar a arena e os desafios para ti...'
          }
        />

        {showLoadingFallback && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fadeIn">
            <button
              type="button"
              onClick={handleForceCleanStart}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer hover:shadow-emerald-500/40"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Iniciar Novo Desafio Agora</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    console.warn('[QuizScreen] Perguntas vazias após carregamento. A forçar perguntas de emergência.')
    return (
      <div className="flex min-h-[60vh] sm:min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
        <LoadingQuiz message="A carregar desafio limpo..." submessage="A preparar perguntas de emergência..." />
        <div className="mt-6">
          <button
            type="button"
            onClick={handleForceCleanStart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer hover:shadow-emerald-500/40"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Iniciar Novo Desafio Agora</span>
          </button>
        </div>
      </div>
    )
  }

  // 3. Fim de jogo: Apresentar ecrã de resultados
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
  if ((arenaResolution as any)?.error || !activeArena) {
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
          playerTier={profile?.level ? `NÍVEL ${profile.level}` : 'NÍVEL 1'}
          onComplete={handleCompleteIntro}
          onSkip={handleCompleteIntro}
        />
      )}

      {/* Camada Master da Arena: Cenário Imersivo sem Partículas Distrativas */}
      {activeArena && (
        <ArenaRenderer
          arenaId={activeArena.id}
          streak={streak}
          className="fixed inset-0 pointer-events-none -z-40"
          showAtmosphere={false}
          showLighting={true}
          showBadge={false}
        />
      )}

      <div className="relative min-h-[100dvh] w-full flex flex-col justify-between p-2.5 sm:p-4 pb-8 sm:pb-6 safe-area-x max-w-lg landscape:max-w-5xl mx-auto select-none animate-rise">
        <div className="w-full flex-1 flex flex-col justify-between gap-3 sm:gap-4 landscape:grid landscape:grid-cols-2 landscape:gap-5 landscape:items-center my-auto">
          {/* COLUNA ESQUERDA (LANDSCAPE): CABEÇALHO + PERGUNTA */}
          <div className="w-full flex flex-col gap-2 sm:gap-3 justify-center">
            {/* ========================================================= */}
            {/* 1. CABEÇALHO SOLO COMPACTO                                */}
            {/* ========================================================= */}
            <div className="w-full shrink-0">
              <div className="w-full flex items-center justify-between px-3 py-1.5 sm:py-2 bg-slate-900/80 border border-slate-800 rounded-xl shadow-md">
                {/* Lado Esquerdo: Sair + Avatar + Jogador */}
                <div className="flex items-center gap-2 min-w-0">
                  <GameExitControl mode="solo" onConfirmExit={handleAbandonSolo} />
                  <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
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
                      {profile?.level ? `Nível ${profile.level}` : 'Nível 1'}
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
                      isFrozen
                        ? 'text-cyan-300 animate-pulse font-extrabold'
                        : seconds <= WARNING_TIME_THRESHOLD
                          ? 'text-flag-red animate-pulse'
                          : 'text-slate-400'
                    )}
                  >
                    {isFrozen ? `${seconds}s (❄️ ${freezeTimeLeft}s)` : `${seconds}s`}
                  </span>
                </div>
              </div>

              {/* Barra de Tempo Compacta */}
              <div className="flex items-center gap-1 mt-1.5 w-full px-0.5">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full bg-slate-800 overflow-hidden border transition-colors duration-300 flex-1',
                    isFrozen
                      ? 'border-cyan-400/60'
                      : seconds <= WARNING_TIME_THRESHOLD
                        ? 'border-flag-red/60'
                        : 'border-slate-700/40'
                  )}
                >
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000 ease-linear shadow-sm',
                      isFrozen
                        ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse'
                        : seconds > 15
                          ? 'bg-primary shadow-[0_0_10px_rgba(0,255,162,0.4)]'
                          : seconds > WARNING_TIME_THRESHOLD
                            ? 'bg-gold shadow-[0_0_10px_rgba(255,200,0,0.4)]'
                            : 'bg-flag-red shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse'
                    )}
                    style={{ width: `${Math.min(100, (seconds / MAX_SECONDS) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 2. ZONA CENTRAL: CARD DA PERGUNTA                         */}
            {/* ========================================================= */}
            <div className="py-1 w-full flex flex-col items-center justify-center relative">
              {/* Feedback visual rápido e discreto */}
              {phase === 'revealed' && (
                <div
                  className={cn(
                    'mb-2 px-3.5 py-1 rounded-full font-display text-xs font-black tracking-wider transition-all duration-200 z-20 flex items-center gap-1.5 shrink-0 max-w-full text-center shadow-md animate-pop select-none',
                    selected === q.correct
                      ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-emerald-500/30'
                      : selected === null
                        ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-amber-500/30'
                        : 'bg-rose-500 text-white border border-rose-400 shadow-rose-500/30'
                  )}
                >
                  {selected === q.correct ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[3] shrink-0" />
                      <span>CORRETO</span>
                      <span className="font-mono text-[11px] font-extrabold opacity-95">+{q.points} XP</span>
                    </>
                  ) : selected === null ? (
                    <>
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>TEMPO ESGOTADO</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 stroke-[3] shrink-0" />
                      <span>ERRADO</span>
                    </>
                  )}
                </div>
              )}

              {/* Card da Pergunta */}
              <div className="w-full min-h-[85px] sm:min-h-[100px] h-auto p-3 sm:p-6 md:p-8 landscape:p-3.5 flex flex-col justify-center items-center text-center bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl relative">
                <h1 className="text-sm sm:text-lg md:text-xl landscape:text-sm sm:landscape:text-base font-extrabold text-center leading-relaxed text-white break-words hyphens-auto w-full">
                  {q.question || q.pergunta}
                </h1>

                {/* Explicação contextual */}
                {phase === 'revealed' && (q.explanation || q.explicacao) && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 border-t border-white/10 pt-2 break-words leading-relaxed w-full">
                    {q.explanation || q.explicacao}
                  </p>
                )}

                {/* HUD Diagnóstico de Runtime */}
                <div className="mt-2.5 w-full flex flex-wrap items-center justify-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-xl border border-white/10 bg-black/40 text-[9px] sm:text-[10px] font-mono text-slate-400 select-all">
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
                <div className="mt-1.5 rounded-xl border border-blue-400/60 bg-blue-500/20 px-3 py-1 text-xs text-blue-100 flex items-center justify-center gap-1.5 backdrop-blur-xl animate-pulse shadow-sm shrink-0 w-full">
                  <Snowflake className="h-3.5 w-3.5 text-blue-300 animate-spin" />
                  <span className="font-bold">Tempo Congelado ({freezeTimeLeft}s)</span>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA (LANDSCAPE): PODERES + GRELHA DE RESPOSTAS */}
          <div className="w-full flex flex-col gap-2 justify-center shrink-0">
            {/* Toast / Feedback de Ajuda */}
            {aidToast && (
              <div className="flex justify-center mb-0.5 w-full animate-pop">
                <div className="px-3.5 py-1 rounded-xl bg-cyan-950/90 border border-cyan-400/80 text-cyan-200 text-xs font-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 backdrop-blur-md">
                  <span>{aidToast}</span>
                </div>
              </div>
            )}

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
                  stock5050={aidStocks.stock5050}
                  stockFreeze={aidStocks.stockFreeze}
                  stockPublicVote={aidStocks.stockPublicVote}
                  used5050={eliminatedOptions.length > 0}
                  usedPublicVote={publicVoteResults !== null}
                  isFrozen={isFrozen}
                  freezeTimeLeft={freezeTimeLeft}
                  isProcessing={isHelpProcessing}
                  disabled={phase !== 'answering'}
                  onUse5050={() => executeUseAid('5050')}
                  onUseFreeze={() => executeUseAid('freeze')}
                  onUsePublicVote={() => executeUseAid('publicVote')}
                />
              </div>
            )}

            {/* Grelha de Respostas Adaptativa (1 coluna mobile portrait, 2 colunas landscape/tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 landscape:grid-cols-2 gap-2 sm:gap-2.5 w-full">
              {q.options.map((option, idx) => {
                const isEliminated = eliminatedOptions.includes(option.key)
                const state = stateFor(option.key)
                const optionKey = (['A', 'B', 'C', 'D'][idx] || option.key) as OptionKey

                if (isEliminated) {
                  return (
                    <div
                      key={option.key}
                      className="min-h-[3rem] sm:min-h-[3.75rem] landscape:min-h-[2.85rem] h-auto w-full p-2 sm:p-3 landscape:p-2 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center gap-2 sm:gap-3 text-left opacity-35 select-none cursor-not-allowed shadow-inner"
                    >
                      <span className="w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-extrabold text-xs sm:text-sm landscape:text-xs flex items-center justify-center shrink-0 line-through">
                        {optionKey}
                      </span>
                      <span className="text-xs sm:text-sm landscape:text-xs font-semibold text-slate-500 leading-snug line-through break-words hyphens-auto flex-1 min-w-0">
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
                      'min-h-[3rem] sm:min-h-[3.75rem] landscape:min-h-[2.85rem] h-auto w-full p-2 sm:p-3 landscape:p-2 rounded-xl flex items-center gap-2 sm:gap-3 text-left transition-all select-none cursor-pointer active:scale-98 relative',
                      buttonStyles
                    )}
                  >
                    <span
                      className={cn(
                        'w-7 h-7 sm:w-8 sm:h-8 landscape:w-6 landscape:h-6 rounded-lg font-extrabold text-xs sm:text-sm landscape:text-xs flex items-center justify-center shrink-0 border transition-colors',
                        phase === 'revealed' && state === 'correct'
                          ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                          : phase === 'revealed' && state === 'wrong'
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30'
                      )}
                    >
                      {optionKey}
                    </span>
                    <span className="text-xs sm:text-sm landscape:text-xs font-semibold text-white leading-snug break-words hyphens-auto flex-1 min-w-0">
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
        </div>

        <QuestionReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          questionId={q?.id ? Number(q.id) || 0 : 0}
          questionText={q?.question || q?.pergunta || ''}
          categoryName={category?.name}
          user={user ?? null}
        />

        {/* Modal de Confirmação / Pré-visualização da Ajuda */}
        {selectedPreviewAid && (
          <AidPreviewModal
            aid={CANONICAL_AIDS[selectedPreviewAid]}
            stock={
              selectedPreviewAid === '5050'
                ? aidStocks.stock5050
                : selectedPreviewAid === 'publicVote'
                  ? aidStocks.stockPublicVote
                  : aidStocks.stockFreeze
            }
            isOpen={selectedPreviewAid !== null}
            isProcessing={isHelpProcessing}
            onConfirm={handleConfirmUseAid}
            onClose={handleCancelAidPreview}
          />
        )}
      </div>
    </>
  )
}
