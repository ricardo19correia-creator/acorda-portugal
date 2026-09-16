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
  Star,
  Crown,
  FastForward,
} from 'lucide-react'
import { QuestionReportModal } from '@/components/question-report-modal'
import type { UserProfile } from '@/components/player-card'
import { PlayerAvatar } from '@/components/player-avatar'
import { resolveArenaForGame, CANONICAL_ARENAS } from '@/src/data/arenaCatalog'
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
      name: `Meu Distrito: ${distName}`,
      subtitle: distInfo?.titleBadge || 'Classificação & Poder Territorial Distrital',
      emoji: '📍',
      special: false,
    }
  }
  if (cityParam || categorySlug === 'desafio-cidade' || categorySlug === 'cidade') {
    const cityName = cityParam || 'Local'
    return {
      name: `Desafio Local`,
      subtitle: `Conhecimento Local de ${cityName}`,
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
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(false)

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
      return { arena: CANONICAL_ARENAS[0], isExplicit: false, isFallback: true }
    }
  }, [arenaParam, categorySlug, equippedArenaId])

  const activeArena = arenaResolution?.arena || CANONICAL_ARENAS[0]

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
  const [isLoadingMatch, setIsLoadingMatch] = useState<boolean>(false)
  const [isRecovering, setIsRecovering] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Aliases canónicos para controlo de carregamento (desativados incondicionalmente para entrada direta)
  const isLoading = false
  const setIsLoading = useCallback((_: boolean) => {}, [])
  const setRecovering = useCallback((_: boolean) => {}, [])

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
    onFreezeApplied: () => {
      // Congela o cronómetro durante 15s sem somar segundos ao relógio
    },
  })

  // Provocações / Reações no Tabuleiro
  const [reactionCooldown, setReactionCooldown] = useState(0)

  // ENTRADA DIRETA NO JOGO: Limpeza total de sessões anteriores e garantia de jogo ativo imediato
  useEffect(() => {
    // 1. Limpeza total de storage para evitar qualquer sessão fantasma residual
    cleanOldSessionStorage()

    // 2. Garantir estados de controlo inativos
    setIsLoadingMatch(false)
    setIsRecovering(false)

    // 3. Forçar estado de jogo ativo com a pergunta 1
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
  }, [cleanOldSessionStorage, resetQuestionAids])

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

  // 1. DESISTÊNCIA / ABANDONAR PARTIDA: Limpeza completa e redirecionamento imediato para a página inicial ("/")
  const handleAbandonSolo = useCallback(() => {
    try {
      // 1. Sinalizar saída de partida para restaurar UI global
      setGlobalArenaMatchActive(false)

      // 2. Limpar referências de sessão e storage
      cleanOldSessionStorage()

      // 3. Forçar paragem de timers e estado
      setPhase('finished')
      setIsFrozen(false)
    } catch (e) {
      console.warn('[handleAbandonSolo] Erro ao limpar estado:', e)
    }

    // 4. Redirecionar imediatamente para a página inicial ("/")
    try {
      router.push('/')
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }, [cleanOldSessionStorage, router])

  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const isLockingInRef = useRef(false)

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
    [user?.uid, categorySlug, category?.name, diffLevel, quizQuestions, updateProfileLocally, rewardOutcome, effectiveUserId, districtParam, cityParam]
  )

  const advanceToNextOrFinish = useCallback(() => {
    isLockingInRef.current = false
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
  }, [step, total, gameId, result, processMatchCompletion, resetQuestionAids])

  const handleSkipQuestion = useCallback(() => {
    if (phase !== 'answering' || !q) return
    try {
      recordedAnswersRef.current.push({
        questionId: String(q.id),
        categoryId: getCanonicalCategory(q.category, q.subcategory, String(q.id), q.question),
        category: q.category,
        subcategory: q.subcategory,
        prompt: q.question,
        selectedOption: '',
        isCorrect: false,
        answeredAt: Date.now(),
      })
    } catch {}
    setStreak(0)
    setCurrentStreak(0)
    advanceToNextOrFinish()
  }, [phase, q, advanceToNextOrFinish, setCurrentStreak])

  const reveal = useCallback(
    (choice: OptionKey) => {
      if (phase !== 'answering' || !q || selected !== null || isLockingInRef.current) {
        return
      }

      // 4. QUANDO O JOGADOR SELECIONA UMA RESPOSTA:
      // Destacar imediatamente a opção selecionada (âmbar de lock-in de concurso)
      isLockingInRef.current = true
      setSelected(choice)
      setIsFrozen(false)

      // Breve suspensa profissional de concurso televisivo (350ms) antes de validar
      setTimeout(() => {
        const hit = choice === q.correct

        // Registo da resposta canónica para relatório final
        try {
          recordedAnswersRef.current.push({
            questionId: String(q.id),
            categoryId: getCanonicalCategory(q.category, q.subcategory, String(q.id), q.question),
            category: q.category,
            subcategory: q.subcategory,
            prompt: q.question,
            selectedOption: choice,
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
        isLockingInRef.current = false
      }, 350)
    },
    [phase, q, selected, seconds, streak, playSound, setCurrentStreak]
  )

  const next = useCallback(() => {
    advanceToNextOrFinish()
  }, [advanceToNextOrFinish])

  // 9. TRANSIÇÃO RÁPIDA ENTRE PERGUNTAS: Avanço automático suave após revelação
  useEffect(() => {
    if (phase !== 'revealed') return

    const timer = setTimeout(() => {
      advanceToNextOrFinish()
    }, 1200)

    return () => clearTimeout(timer)
  }, [phase, advanceToNextOrFinish])

  // 7. REGRA ABSOLUTA QUANDO O TEMPO TERMINA:
  // Considerar ERRADA / NÃO RESPONDIDA. NÃO revelar correta. NÃO pintar de verde. NÃO mostrar explicação.
  const handleTimeout = useCallback(() => {
    if (phase !== 'answering' || !q) {
      return
    }

    setIsFrozen(false)
    isLockingInRef.current = false

    try {
      recordedAnswersRef.current.push({
        questionId: String(q.id),
        categoryId: getCanonicalCategory(q.category, q.subcategory, String(q.id), q.question),
        category: q.category,
        subcategory: q.subcategory,
        prompt: q.question,
        selectedOption: '',
        isCorrect: false,
        answeredAt: Date.now(),
      })
    } catch {}

    setStreak(0)
    setCurrentStreak(0)
    playSound('wrong')

    // Avanço direto e imediato para a pergunta seguinte de acordo com a lógica existente
    advanceToNextOrFinish()
  }, [phase, q, playSound, setCurrentStreak, advanceToNextOrFinish, setIsFrozen])

  // Question Countdown Timer
  useEffect(() => {
    if (phase !== 'answering' || isFrozen || selected !== null) {
      return
    }

    if (seconds <= 0) {
      handleTimeout()
      return
    }

    const timer = setTimeout(() => {
      if (seconds <= 1) {
        handleTimeout()
        return
      }

      setSeconds((current) => current - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [phase, isFrozen, seconds, selected, handleTimeout])

  const restart = () => {
    try {
      sessionStorage.removeItem(`ap_quiz_state_${gameId}`)
    } catch {}
    recordedAnswersRef.current = []
    isLockingInRef.current = false
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
  // 1. Aguarda apenas brevemente a resolução do estado de autenticação sem utilizador
  if (!authResolved && !user) {
    return null
  }

  // 🔒 BLOQUEIO DEFINITIVO DE CONVIDADO / NÃO AUTENTICADO
  if (!user) {
    const currentTarget = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/jogar'
    return <AuthWallView targetUrl={currentTarget} />
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

  const safeXp = typeof profile?.xp === 'number' ? profile.xp : (typeof userProfile?.xp === 'number' ? userProfile.xp : 0)
  const levelInfo = calculateLevelProgress(safeXp)
  const playerLevel = profile?.level || userProfile?.level || levelInfo?.currentLevel?.level || 1
  const playerProgressPercent = Math.min(100, Math.max(10, Math.round(levelInfo?.progressPercentage || 0)))

  const qPrompt = q?.question || q?.pergunta || ''
  const isLongQuestion = qPrompt.length > 120
  const isMediumQuestion = qPrompt.length > 65

  return (
    <>
      {/* 0. INTRODUÇÃO CINEMATOGRÁFICA DA ARENA */}
      {showCinematicIntro && activeArena && (
        <ArenaCinematicIntro
          arena={activeArena}
          playerName={effectiveDisplayName}
          playerTier={`NÍVEL ${playerLevel}`}
          onComplete={handleCompleteIntro}
          onSkip={handleCompleteIntro}
        />
      )}

      {/* Cenário Cinematográfico da Partida: Sala do Trono Gótica com Vitrais e o Rei */}
      <div
        className="fixed inset-0 pointer-events-none -z-40 bg-cover bg-center bg-no-repeat transition-all duration-700 select-none"
        style={{ backgroundImage: "url('/images/match-throne-bg.jpg')" }}
      >
        {/* Vinheta e Atmosfera para Legibilidade Perfeita e Foco Absoluto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020614]/80 via-transparent to-[#020614]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)]" />
      </div>

      {/* Luzes Volumétricas de Grande Estúdio / Game Show e Vinheta Atmosférica */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        <div className="absolute -top-32 -left-24 w-[480px] h-[600px] bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.18)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute -top-32 -right-24 w-[480px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.18)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between px-2 sm:px-4 py-1 sm:py-2.5 safe-area-x max-w-md sm:max-w-lg md:max-w-xl mx-auto select-none overflow-hidden match-fullscreen-container">
        {/* ========================================================= */}
        {/* 1. BARRA SUPERIOR: LOGO | JOGADOR | PERGUNTA & PONTOS     */}
        {/* ========================================================= */}
        <header className="w-full flex items-center justify-between gap-1.5 sm:gap-2 py-0.5 sm:py-1 px-0.5 shrink-0">
          {/* Esquerda: Logo Acorda Portugal - Desafio Nacional */}
          <div className="flex items-center gap-1 shrink-0">
            <img
              src="/brand/logo.png"
              alt="Acorda Portugal — Desafio Nacional"
              className="h-7 sm:h-9 md:h-11 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] select-none"
            />
          </div>

          {/* Centro: Avatar com Coroa + Nome + Nível + Barra XP */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Avatar com Mini-Coroa Dourada e Anel Neon */}
            <div className="relative shrink-0 flex items-center justify-center">
              <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] z-10" />
              <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-300 shadow-[0_0_12px_rgba(34,211,238,0.7)] flex items-center justify-center overflow-hidden">
                <PlayerAvatar
                  profile={profile || userProfile}
                  src={profile?.avatar || (user as any)?.photoURL || '/images/avatars/avatar_01.png'}
                  size="sm"
                  showBadge={false}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Dados do Jogador */}
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-white truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight">
                {effectiveDisplayName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-300 font-mono leading-tight">
                Nível {playerLevel}
              </span>
              {/* Barra de Progresso / XP em Neon Azul */}
              <div className="w-14 sm:w-20 h-1 mt-0.5 rounded-full bg-slate-950/90 border border-blue-500/40 overflow-hidden p-[0.5px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.8)] transition-all duration-500"
                  style={{
                    width: `${playerProgressPercent}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Direita: Indicador Q 1/10 + Pontuação com Estrela */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Pílula Dourada: Q 1/10 */}
            <div className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#06122d]/95 border border-amber-400/90 shadow-[0_0_10px_rgba(245,158,11,0.35)] flex items-center gap-1">
              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] sm:text-[10px] flex items-center justify-center font-display leading-none">
                Q
              </div>
              <span className="font-mono text-[10px] sm:text-xs font-black text-white tracking-tight">
                {step + 1}/{total}
              </span>
            </div>

            {/* Pontos e Percentagem */}
            <div className="flex flex-col items-end leading-none">
              <div className="flex items-center gap-0.5 sm:gap-1 text-cyan-200 font-display text-[11px] sm:text-xs md:text-sm font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                <Star className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-amber-400 fill-amber-400" />
                <span>{score.toLocaleString('pt-PT')} pts</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300/80 font-bold mt-0.5">
                {Math.round(((step + 1) / total) * 100)}%
              </span>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. NÍVEL DA PARTIDA + PAINEL CENTRAL DA PERGUNTA          */}
        {/* ========================================================= */}
        <div className="w-full flex-1 min-h-0 flex flex-col justify-center items-center py-0.5 sm:py-1">
          {/* EMBLEMA CENTRAL METÁLICO: NÍVEL 2 */}
          <div
            className="relative z-10 px-3 sm:px-4 py-0.5 mb-[-8px] bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 p-[1.5px] shadow-[0_0_14px_rgba(245,158,11,0.4)] shrink-0"
            style={{
              clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
            }}
          >
            <div
              className="px-3 sm:px-5 py-0.5 bg-gradient-to-b from-[#0c1a3b] to-[#040817] flex items-center justify-center"
              style={{
                clipPath: 'polygon(14% 0%, 86% 0%, 100% 100%, 0% 100%)',
              }}
            >
              <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-widest text-amber-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                NÍVEL {diffLevel >= 4 ? 3 : diffLevel === 3 ? 2 : 2}
              </span>
            </div>
          </div>

          {/* GRANDE PAINEL CENTRAL CHANFRADO */}
          <div className="relative w-full p-[1.5px] sm:p-[2px] bg-gradient-to-b from-amber-400/90 via-blue-500/80 to-cyan-400/90 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_24px_rgba(30,58,138,0.4)]">
            <div className="relative w-full min-h-[56px] max-h-[125px] sm:min-h-[85px] sm:max-h-[175px] md:min-h-[110px] md:max-h-[220px] px-3 sm:px-6 py-2 sm:py-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#08183d]/98 via-[#040c24]/98 to-[#061333]/98 backdrop-blur-2xl rounded-xl sm:rounded-2xl overflow-y-auto">
              {/* Néon azul superior e inferior */}
              <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              <div className="absolute bottom-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

              {/* Imagem do Desafio Visual quando aplicável */}
              {q.image && (
                <div className="mb-1 max-h-20 sm:max-h-32 overflow-hidden rounded-lg border border-amber-400/40 shadow-md shrink-0">
                  <img src={q.image} alt="Desafio Visual" className="w-full h-full object-contain" />
                </div>
              )}

              {/* Foco Absoluto na Pergunta (Texto Branco Grande e Legível) */}
              <h1
                className={cn(
                  'font-black text-center text-white tracking-wide break-words hyphens-auto w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
                  isLongQuestion
                    ? 'text-xs sm:text-sm md:text-base leading-tight sm:leading-snug'
                    : isMediumQuestion
                      ? 'text-xs sm:text-base md:text-lg leading-snug sm:leading-normal'
                      : 'text-sm sm:text-lg md:text-xl leading-snug sm:leading-relaxed'
                )}
              >
                {qPrompt}
              </h1>
            </div>

            {/* Losango Dourado Heráldico Inferior */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-gradient-to-br from-amber-300 to-amber-500 rotate-45 border border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
          </div>

          {/* TEMPORIZADOR TV INTEGRADO */}
          <div className="w-full mt-1 sm:mt-1.5 px-0.5 flex flex-col gap-0.5 sm:gap-1 shrink-0">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 leading-none">
              <span className={cn(isFrozen && 'text-cyan-300 animate-pulse font-black')}>
                {isFrozen ? '❄️ Tempo Congelado (+15s)' : 'Temporizador'}
              </span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full border text-[9px] sm:text-[10px] font-black font-mono leading-none',
                  isFrozen
                    ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse'
                    : seconds <= WARNING_TIME_THRESHOLD
                      ? 'border-rose-500 bg-rose-950/90 text-rose-300 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                      : 'border-blue-500/40 bg-[#081530]/80 text-sky-300'
                )}
              >
                {seconds}s
              </span>
            </div>
            <div className="h-1 sm:h-1.5 w-full rounded-full bg-slate-950/80 overflow-hidden border border-blue-500/30 p-[1px]">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-linear',
                  isFrozen
                    ? 'bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse'
                    : seconds > 15
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                      : seconds > WARNING_TIME_THRESHOLD
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]'
                )}
                style={{ width: `${Math.min(100, (seconds / MAX_SECONDS) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BARRA HORIZONTAL DE POWER-UPS                          */}
        {/* ========================================================= */}
        <div className="w-full shrink-0">
          {phase === 'answering' && (
            <QuizPowerUpsBar
              stock5050={aidStocks.stock5050}
              stockFreeze={aidStocks.stockFreeze}
              stockPublicVote={aidStocks.stockPublicVote}
              used5050={eliminatedOptions.length > 0}
              usedPublicVote={publicVoteResults !== null}
              isFrozen={isFrozen}
              freezeTimeLeft={freezeTimeLeft}
              isProcessing={isHelpProcessing}
              disabled={phase !== 'answering' || selected !== null}
              onUse5050={() => executeUseAid('5050')}
              onUseFreeze={() => executeUseAid('freeze')}
              onUsePublicVote={() => executeUseAid('publicVote')}
            />
          )}
        </div>

        {/* ========================================================= */}
        {/* 4. AS QUATRO RESPOSTAS ALINHADAS VERTICALMENTE (A, B, C, D)*/}
        {/* ========================================================= */}
        <div className="w-full flex flex-col gap-0.5 sm:gap-1 shrink-0 my-0.5">
          {/* Toast de Feedback de Ajuda se ativo */}
          {aidToast && (
            <div className="flex justify-center mb-0.5 w-full animate-pop">
              <div className="px-3 py-0.5 rounded-xl bg-cyan-950/90 border border-cyan-400/80 text-cyan-200 text-[11px] font-black shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 backdrop-blur-md">
                <span>{aidToast}</span>
              </div>
            </div>
          )}

          {q.options.map((option, idx) => {
            const isEliminated = eliminatedOptions.includes(option.key)
            const state = stateFor(option.key)
            const optionKey = (['A', 'B', 'C', 'D'][idx] || option.key) as OptionKey

            return (
              <AnswerOption
                key={option.key}
                optionKey={optionKey}
                text={option.text}
                state={state}
                disabled={phase !== 'answering' || selected !== null}
                eliminated={isEliminated}
                isSelected={selected === option.key}
                publicVotePercent={publicVoteResults?.[idx]}
                onSelect={() => reveal(option.key)}
              />
            )
          })}
        </div>

        {/* ========================================================= */}
        {/* 5. RODAPÉ DE NAVEGAÇÃO: DESISTIR | BRASÃO REAL | PULAR / PRÓXIMA */}
        {/* ========================================================= */}
        <footer className="w-full flex items-center justify-between pt-0.5 pb-0.5 sm:pb-1.5 shrink-0">
          {/* Botão Desistir */}
          <button
            type="button"
            onClick={() => setIsExitModalOpen(true)}
            className="group relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-amber-400/60 bg-[#06112d]/95 hover:bg-[#0b1c47] text-slate-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-[0_0_12px_rgba(30,58,138,0.3)] hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] flex items-center gap-1 sm:gap-1.5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Desistir</span>
          </button>

          {/* Brasão Real Português Central */}
          <div className="flex items-center justify-center relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full p-[1.5px] bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.5)] flex items-center justify-center overflow-hidden">
              <img
                src="/images/portuguese-royal-crest.jpg"
                alt="Escudo de Portugal"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Botão Dinâmico: Pular Pergunta (answering) OU Próxima / Resultados (revealed) */}
          {phase === 'revealed' ? (
            <button
              type="button"
              onClick={next}
              className="group relative px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl border border-emerald-400/80 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-display text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-[0_0_16px_rgba(16,185,129,0.5)] hover:brightness-110 flex items-center gap-1 sm:gap-1.5 active:scale-95 cursor-pointer animate-pulse"
            >
              <span>{step + 1 >= total ? 'Ver Resultados' : 'Próxima'}</span>
              <ChevronRight className="h-3.5 w-3.5 stroke-[3] text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkipQuestion}
              disabled={phase !== 'answering'}
              className="group relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-amber-400/60 bg-[#06112d]/95 hover:bg-[#0b1c47] text-slate-200 hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-[0_0_12px_rgba(30,58,138,0.3)] hover:shadow-[0_0_16px_rgba(245,158,11,0.35)] flex items-center gap-1 sm:gap-1.5 active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <FastForward className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              <span>Pular Pergunta</span>
            </button>
          )}
        </footer>

        {/* MODAL DE CONFIRMAÇÃO DE DESISTÊNCIA */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-sm rounded-3xl border border-amber-400/50 bg-[#071433] p-6 text-center shadow-[0_0_30px_rgba(0,0,0,0.9)] space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-black uppercase text-white">
                Abandonar Partida?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Se desistires agora, a partida será encerrada e regressarás à Central de Jogos.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/10 text-xs font-bold text-white hover:bg-white/15 active:scale-95 transition cursor-pointer"
                >
                  Continuar
                </button>
                <button
                  type="button"
                  onClick={handleAbandonSolo}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 active:scale-95 transition cursor-pointer"
                >
                  Desistir
                </button>
              </div>
            </div>
          </div>
        )}

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
