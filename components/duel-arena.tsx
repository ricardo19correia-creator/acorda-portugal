'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Swords,
  Trophy,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Clock,
  Sparkles,
  Flame,
  Crown,
  AlertCircle,
  Coins,
  ChevronRight,
  Shield,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  User as UserIcon,
  Award,
  Lightbulb,
  Snowflake,
  MessageSquare,
  Lock,
  X,
} from 'lucide-react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { useGameTheme } from '@/context/game-theme-context'
import {
  type DuelDocument,
  type DuelPlayerData,
  type DuelRewardResult,
  type DuelAnswerStatus,
  subscribeToDuel,
  submitDuelAnswer,
  claimDuelRewards,
  cleanMatchmakingQueue,
  requestDuelRematch,
  respondDuelRematch,
  sendDuelTaunt,
} from '@/lib/duel'
import { TAUNT_PACKS, type TauntPack } from '@/data/tauntPacks'
import { DuelMatchmakingModal } from '@/components/duel-matchmaking-modal'
import { PlayerAvatar } from '@/components/player-avatar'
import { useConsumablePowerUp, SHOP_CATALOG } from '@/lib/economy'
import { TITLE_SHOP_CATALOG } from '@/data/shopTitles'
import { getTitleBadgeStyle } from '@/lib/cosmetics'
import { calculate5050Eliminated, generateQuestionClue } from '@/lib/powerup-helpers'
import { QuizPowerUpsBar } from '@/components/quiz/quiz-powerups-bar'
import {
  QUESTION_TIME_SECONDS,
  WARNING_TIME_THRESHOLD,
  calculateTimePercentage,
} from '@/config/quiz'
import { cn } from '@/lib/utils'

const QUESTION_TIME_LIMIT = QUESTION_TIME_SECONDS

interface AnswerFeedback {
  status: DuelAnswerStatus
  message: string
  selectedKey: 'A' | 'B' | 'C' | 'D' | null
  correctKey: 'A' | 'B' | 'C' | 'D'
}

export function DuelArena({
  duelId,
  onDuelChange,
}: {
  duelId: string
  onDuelChange?: (newDuelId: string) => void
}) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { playSound, streakEffectId } = useGameTheme()

  const currentPlayer = useMemo(() => {
    return {
      uid: user?.uid || profile?.uid || 'anonymous',
      displayName: profile?.displayName || user?.displayName || 'Jogador',
      photoURL: user?.photoURL || null,
    }
  }, [user, profile])

  const [duel, setDuel] = useState<DuelDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [matchmakingModalOpen, setMatchmakingModalOpen] = useState(false)

  // Question answering & feedback state
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)

  // Power-Ups State (100% individual para este jogador no Duelo)
  const [eliminatedOptions, setEliminatedOptions] = useState<('A' | 'B' | 'C' | 'D')[]>([])
  const [activeClue, setActiveClue] = useState<string | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)
  const [freezeTimeLeft, setFreezeTimeLeft] = useState(0)

  // Live Inventory
  const effectiveUid = user?.uid || profile?.uid || ''
  const rawInventory: Record<string, number> = (profile as any)?.inventory || {}
  const [inventory, setInventory] = useState<Record<string, number>>(rawInventory)

  useEffect(() => {
    const inv: Record<string, number> = (profile as any)?.inventory || {}
    setInventory(inv)
  }, [profile])


  // Reward state
  const [claimedReward, setClaimedReward] = useState<DuelRewardResult | null>(null)

  // Rematch action state
  const [rematchLoading, setRematchLoading] = useState(false)

  // Taunt / Quick Reactions System State
  const [tauntModalOpen, setTauntModalOpen] = useState(false)
  const [tauntCooldown, setTauntCooldown] = useState(0)
  const [activeTaunt, setActiveTaunt] = useState<{ senderId: string; text: string; timestamp: number } | null>(null)
  const lastProcessedTauntTs = useRef<number>(0)
  const [unlockedTaunts, setUnlockedTaunts] = useState<string[]>(['pack_basico'])

  // Load user unlocked taunts
  useEffect(() => {
    try {
      const userTaunts: string[] = (profile as any)?.inventory?.taunts || []
      const localTaunts = localStorage.getItem('user_inventory_taunts')
      let parsedLocal: string[] = []
      if (localTaunts) {
        try {
          parsedLocal = JSON.parse(localTaunts)
        } catch (e) {}
      }
      const combined = Array.from(new Set(['pack_basico', ...userTaunts, ...parsedLocal]))
      setUnlockedTaunts(combined)
    } catch (e) {}
  }, [profile])

  // Anti-spam 4-second cooldown timer
  useEffect(() => {
    if (tauntCooldown <= 0) return
    const timer = setInterval(() => {
      setTauntCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [tauntCooldown])

  // Real-time speech bubble trigger & 2.5s auto-dismiss
  useEffect(() => {
    if (duel?.lastTaunt && duel.lastTaunt.timestamp > lastProcessedTauntTs.current) {
      lastProcessedTauntTs.current = duel.lastTaunt.timestamp
      setActiveTaunt(duel.lastTaunt)

      const timer = setTimeout(() => {
        setActiveTaunt(null)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [duel?.lastTaunt])

  // Handle sending a taunt
  const handleSendTaunt = async (tauntText: string) => {
    if (tauntCooldown > 0 || !duelId) return
    setTauntCooldown(4)
    setTauntModalOpen(false)
    await sendDuelTaunt(duelId, currentPlayer.uid, currentPlayer.displayName, tauntText)
  }

  // Handle buying a taunt pack directly
  const handleBuyTauntPack = async (pack: TauntPack) => {
    const savedEuros = Number(localStorage.getItem('user_euros') || '803845')
    if (savedEuros < pack.price) {
      alert(`Saldo insuficiente! Precisas de €${(pack.price - savedEuros).toLocaleString('pt-PT')} € Acorda.`)
      return
    }

    const newBalance = savedEuros - pack.price
    localStorage.setItem('user_euros', String(newBalance))

    const newUnlocked = Array.from(new Set([...unlockedTaunts, pack.id]))
    setUnlockedTaunts(newUnlocked)
    localStorage.setItem('user_inventory_taunts', JSON.stringify(newUnlocked))

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          euros: newBalance,
          'inventory.taunts': arrayUnion(pack.id),
        })
      } catch (e) {
        console.error(e)
      }
    }

    window.dispatchEvent(new Event('inventory_updated'))
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Limpar fila e subscrever ao documento do Duelo
  useEffect(() => {
    if (!duelId) return

    console.log('[DUEL PAGE LOAD] duelId:', duelId, 'AUTH UID:', currentPlayer.uid)

    if (currentPlayer.uid) {
      cleanMatchmakingQueue(currentPlayer.uid).catch(() => {})
    }

    setLoading(true)
    const unsubscribe = subscribeToDuel(duelId, (updatedDuel) => {
      setLoading(false)
      if (!updatedDuel) {
        console.warn('[DUEL NOT FOUND] duelId:', duelId)
        setErrorMsg('Duelo não encontrado ou expirou.')
        return
      }
      console.log(
        '[DUEL SYNC]',
        updatedDuel.id,
        'status:',
        updatedDuel.status,
        'playerA_Q:',
        updatedDuel.playerA?.currentQuestionIndex,
        'playerB_Q:',
        updatedDuel.playerB?.currentQuestionIndex,
      )
      setDuel(updatedDuel)

      // Se a revanche foi aceite, redirecionar ambos os jogadores para o novo duelo
      if (updatedDuel.rematch?.status === 'accepted' && updatedDuel.rematch.newDuelId) {
        if (updatedDuel.rematch.newDuelId !== duelId) {
          console.log('[REMATCH ACCEPTED] Redirecionando para novo duelId:', updatedDuel.rematch.newDuelId)
          if (onDuelChange) {
            onDuelChange(updatedDuel.rematch.newDuelId)
          } else {
            router.push(`/jogar/duelo?id=${updatedDuel.rematch.newDuelId}`)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [duelId, currentPlayer.uid, router, onDuelChange])

  // Identificar papel do jogador atual (Player A ou Player B)
  const me = useMemo<DuelPlayerData | null>(() => {
    if (!duel || !currentPlayer.uid) return null
    if (duel.playerA?.uid === currentPlayer.uid) return duel.playerA
    if (duel.playerB && duel.playerB.uid === currentPlayer.uid) return duel.playerB
    return null
  }, [duel, currentPlayer.uid])

  const opponent = useMemo<DuelPlayerData | null>(() => {
    if (!duel || !currentPlayer.uid) return null
    if (duel.playerA?.uid === currentPlayer.uid) return duel.playerB || null
    return duel.playerA || null
  }, [duel, currentPlayer.uid])

  // Índice da pergunta atual deste jogador
  const currentQIndex = me ? me.currentQuestionIndex : 0
  const currentQuestion = duel?.questions ? duel.questions[currentQIndex] : null
  const isFinishedForMe = me ? me.finished || currentQIndex >= (duel?.questions?.length || 10) : false

  const activeQuestionIndexRef = useRef<number>(-1)

  // 2. Transição local quando o jogador avança de pergunta
  useEffect(() => {
    if (isFinishedForMe) return

    if (activeQuestionIndexRef.current !== currentQIndex) {
      activeQuestionIndexRef.current = currentQIndex
      setSelectedOption(null)
      setFeedback(null)
      setIsSubmitting(false)
      setEliminatedOptions([])
      setActiveClue(null)
      setIsFrozen(false)
      setFreezeTimeLeft(0)
      setQuestionStartTime(Date.now())
      setTimeLeft(QUESTION_TIME_LIMIT)
    }
  }, [currentQIndex, isFinishedForMe])

  // Handlers dos Power-Ups no Duelo
  const handleUse5050 = async () => {
    if (feedback !== null || isSubmitting || eliminatedOptions.length > 0 || !currentQuestion) return
    if ((inventory['consumable_50_50'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_50_50')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_50_50: res.remainingCount }))
      const toEliminate = calculate5050Eliminated(currentQuestion.options, currentQuestion.correct)
      setEliminatedOptions(toEliminate)
    }
  }

  const handleUseClue = async () => {
    if (feedback !== null || isSubmitting || activeClue !== null || !currentQuestion) return
    if ((inventory['consumable_pista'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_pista')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_pista: res.remainingCount }))
      const clue = generateQuestionClue(currentQuestion)
      setActiveClue(clue)
    }
  }

  const handleUseFreeze = async () => {
    if (feedback !== null || isSubmitting || isFrozen || timeLeft <= 0 || !currentQuestion) return
    if ((inventory['consumable_congelar_tempo'] || 0) <= 0) return

    const res = await useConsumablePowerUp(effectiveUid, 'consumable_congelar_tempo')
    if (res.success) {
      setInventory((prev) => ({ ...prev, consumable_congelar_tempo: res.remainingCount }))
      setIsFrozen(true)
      setFreezeTimeLeft(15)
    }
  }

  // Freeze Countdown loop no Duelo (pausa por 15s)
  useEffect(() => {
    if (!isFrozen || freezeTimeLeft <= 0 || feedback !== null) return

    const interval = setInterval(() => {
      setFreezeTimeLeft((current) => {
        if (current <= 1) {
          setIsFrozen(false)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isFrozen, freezeTimeLeft, feedback])

  // 3. Temporizador de 60 Segundos 100% Individual (Pausado se isFrozen === true)
  useEffect(() => {
    const isPlaying = duel?.status === 'playing' || duel?.status === 'matched'
    if (!isPlaying || isFinishedForMe || !currentQuestion || feedback !== null || isFrozen) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const interval = setInterval(() => {
      if (feedback !== null || isFrozen) return

      setTimeLeft((prev) => {
        const next = Math.max(0, prev - 1)
        if (next <= 0) {
          clearInterval(interval)
          timerRef.current = null
          handleTimeOut()
        }
        return next
      })
    }, 1000)

    timerRef.current = interval

    return () => {
      clearInterval(interval)
      timerRef.current = null
    }
  }, [duel?.status, isFinishedForMe, currentQIndex, feedback, isFrozen])


  // Submissão automática por Timeout (60s esgotados)
  const handleTimeOut = async () => {
    if (isSubmitting || !currentPlayer.uid || !duel || !currentQuestion) return
    setIsSubmitting(true)

    playSound('wrong')

    setFeedback({
      status: 'TIMEOUT',
      message: '⏰ TEMPO ESGOTADO! Não respondeste a tempo.',
      selectedKey: null,
      correctKey: currentQuestion.correct,
    })

    try {
      await submitDuelAnswer(duel.id, currentPlayer.uid, currentQIndex, null, 60)
    } catch (e) {
      console.error('Erro ao submeter timeout:', e)
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
        setFeedback(null)
      }, 1500)
    }
  }

  // Answer selection handler
  const handleSelectOption = async (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (selectedOption !== null || isSubmitting || !currentPlayer.uid || !duel || !currentQuestion) return
    setSelectedOption(optionKey)
    setIsSubmitting(true)

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000))
    const isCorrect = optionKey === currentQuestion.correct

    if (isCorrect) {
      if (timeLeft <= WARNING_TIME_THRESHOLD) {
        playSound('last_second_correct')
      } else {
        playSound('correct')
      }
    } else {
      playSound('wrong')
    }

    setFeedback({
      status: isCorrect ? 'CORRECT' : 'WRONG',
      message: isCorrect
        ? '✅ CORRETO! +100 pts'
        : `❌ ERRADO! A resposta correta era a opção ${currentQuestion.correct}`,
      selectedKey: optionKey,
      correctKey: currentQuestion.correct,
    })

    try {
      await submitDuelAnswer(duel.id, currentPlayer.uid, currentQIndex, optionKey, timeSpent)
    } catch (e) {
      console.error('Erro ao submeter resposta:', e)
    } finally {
      const delayMs = isCorrect ? 1200 : 1800
      setTimeout(() => {
        setIsSubmitting(false)
        setFeedback(null)
      }, delayMs)
    }
  }

  // Rematch request handler (Player initiating)
  const handleRequestRematch = async () => {
    if (!duel || !currentPlayer.uid || !opponent || rematchLoading) return
    setRematchLoading(true)
    try {
      await requestDuelRematch(duel.id, currentPlayer, opponent.uid)
    } catch (err) {
      console.error('Erro ao pedir revanche:', err)
    } finally {
      setRematchLoading(false)
    }
  }

  // Rematch response handlers (Player responding)
  const handleAcceptRematch = async () => {
    if (!duel || !currentPlayer.uid || rematchLoading) return
    setRematchLoading(true)
    try {
      const res = await respondDuelRematch(duel.id, true, currentPlayer)
      if (res.newDuelId) {
        if (onDuelChange) {
          onDuelChange(res.newDuelId)
        } else {
          router.push(`/jogar/duelo?id=${res.newDuelId}`)
        }
      }
    } catch (err) {
      console.error('Erro ao aceitar revanche:', err)
    } finally {
      setRematchLoading(false)
    }
  }

  const handleDeclineRematch = async () => {
    if (!duel || !currentPlayer.uid || rematchLoading) return
    setRematchLoading(true)
    try {
      await respondDuelRematch(duel.id, false, currentPlayer)
    } catch (err) {
      console.error('Erro ao recusar revanche:', err)
    } finally {
      setRematchLoading(false)
    }
  }

  // Claim rewards when finished
  useEffect(() => {
    if (duel?.status === 'finished' && currentPlayer.uid && !claimedReward) {
      claimDuelRewards(duel.id, currentPlayer.uid)
        .then((res) => setClaimedReward(res))
        .catch((e) => console.error('Erro ao resgatar recompensas:', e))
    }
  }, [duel?.status, currentPlayer.uid, claimedReward])

  const copyCode = () => {
    if (!duel) return
    navigator.clipboard.writeText(duel.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLink = () => {
    if (!duel) return
    const url = `${window.location.origin}/jogar/duelo?id=${duel.id}`
    if (navigator.share) {
      navigator.share({
        title: 'Duelo 1v1 no Acorda Portugal',
        text: `Desafio-te para um duelo de conhecimento sobre Portugal! Código: ${duel.code}`,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // =========================================================
  // RENDER: LOADING OR ERROR
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="mt-4 font-display text-lg font-bold text-foreground">
          A ligar à arena de duelo...
        </p>
        <p className="text-xs text-muted-foreground">Sincronizando com o servidor.</p>
      </div>
    )
  }

  if (errorMsg || !duel) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-flag-red" />
        <h2 className="mt-4 font-display text-2xl font-black text-foreground">
          {errorMsg || 'Duelo indisponível'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          O código pode estar incorreto ou o duelo já terminou.
        </p>
        <Link
          href="/jogar"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à Central de Jogo
        </Link>
      </div>
    )
  }

  // =========================================================
  // RENDER 1: WAITING ROOM (Status: 'waiting')
  // =========================================================
  if (duel.status === 'waiting') {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-4xl border border-gold/40 bg-card/85 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl animate-pulse-glow" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-gold">
            <Swords className="h-4 w-4" />
            Sala de Duelo 1v1
          </div>

          <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase text-foreground">
            À Espera do Adversário
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Partilha o código abaixo com outro jogador (ou entra no teu telemóvel com outra conta).
          </p>

          {/* Big Duel Code Display */}
          <div className="mt-8 rounded-3xl border border-white/15 bg-black/40 p-6 backdrop-blur-md">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Código de Acesso ao Duelo
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-wider text-gold">
                {duel.code}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-black hover:brightness-110 shadow-lg shadow-gold/20 transition cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Código Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                onClick={shareLink}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 font-display text-xs font-black uppercase tracking-wider text-foreground hover:bg-white/20 transition cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-primary" />
                <span>Partilhar Link</span>
              </button>
            </div>
          </div>

          {/* Radar Animation */}
          <div className="mt-8 flex flex-col items-center">
            <div className="relative grid h-16 w-16 place-items-center">
              <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-60" />
              <div className="absolute inset-2 rounded-full border border-gold/40 animate-pulse" />
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <p className="mt-3 text-xs font-bold text-muted-foreground">
              A procurar ligação em tempo real...
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Link
              href="/jogar"
              className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar e Sair da Sala
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // RENDER 2: ARENA DE JOGO ATIVA (Status: 'playing' / 'matched')
  // =========================================================
  if (duel.status === 'playing' || duel.status === 'matched') {
    // Se o jogador atual já respondeu às 10 perguntas mas o adversário ainda está a jogar
    if (isFinishedForMe) {
      return (
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 animate-rise">
          <div className="rounded-4xl border border-primary/40 bg-card/85 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/40 animate-bounce">
              <Check className="h-8 w-8" />
            </div>

            <h2 className="mt-4 font-display text-3xl sm:text-4xl font-black uppercase text-foreground">
              🏁 Concluíste as 10 Perguntas!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A tua pontuação provisória: <strong className="text-gold font-black">{me?.score || 0} pts</strong> ({me?.correctCount || 0}/10 certas).
            </p>

            <div className="mt-8 rounded-3xl border border-white/15 bg-black/40 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Progresso de {opponent?.displayName || 'Adversário'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  Pergunta: {Math.min(10, (opponent?.currentQuestionIndex || 0) + 1)} / 10
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {opponent?.finished ? 'Concluído' : 'A Responder...'}
                </span>
              </div>
              {/* Barra de progresso do adversário */}
              <div className="mt-3 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, ((opponent?.currentQuestionIndex || 0) / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Clock className="h-4 w-4" />
              <span>A aguardar que o adversário submeta todas as respostas...</span>
            </div>
          </div>
        </div>
      )
    }

    // Ecrã ativo de resposta (Timer individual de 60s)
    const timePercentage = calculateTimePercentage(timeLeft, QUESTION_TIME_LIMIT)
    const isUrgent = timeLeft <= WARNING_TIME_THRESHOLD
    const timeColor =
      timeLeft > 30
        ? 'bg-primary shadow-[0_0_10px_rgba(0,255,162,0.4)]'
        : timeLeft > WARNING_TIME_THRESHOLD
          ? 'bg-gold shadow-[0_0_10px_rgba(255,200,0,0.4)]'
          : 'bg-flag-red shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-pulse'

    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:py-6 animate-rise">
        {/* ========================================================= */}
        {/* TOP CLASH HUD: PLAYER A vs PLAYER B */}
        {/* ========================================================= */}
        <div className="card-game flex items-center justify-between gap-2 rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* 1v1 VFX OVERLAY: Raio Lusitano */}
          {feedback?.status === 'CORRECT' && (profile?.equipped?.sfx === 'sfx_raio_lusitano' || streakEffectId === 'sfx_raio_lusitano') && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-yellow-400/40 to-transparent animate-ping" />
          )}

          {/* 1v1 VFX OVERLAY: Cravos de Abril */}
          {feedback?.status === 'CORRECT' && (profile?.equipped?.sfx === 'sfx_cravos_abril' || streakEffectId === 'sfx_cravos_abril') && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
              <span className="text-3xl animate-bounce">🌺</span>
              <span className="text-2xl animate-ping ml-4">🌸</span>
              <span className="text-3xl animate-bounce ml-4">🌺</span>
            </div>
          )}

          {/* 1v1 VFX OVERLAY: Chama Tripla Verde Néon */}
          {feedback?.status === 'CORRECT' && streakEffectId === 'streak_chama_tripla' && (
            <div className="pointer-events-none absolute inset-0 bg-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.7)] animate-pulse" />
          )}

          {/* 1v1 VFX OVERLAY: Explosão de Moedas de Ouro */}
          {feedback?.status === 'CORRECT' && streakEffectId === 'streak_moedas_ouro' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-around overflow-hidden">
              <span className="text-3xl animate-bounce">🪙</span>
              <span className="text-4xl animate-ping">✨</span>
              <span className="text-3xl animate-bounce">🪙</span>
            </div>
          )}

          {/* 1v1 VFX OVERLAY: Espada de D. Afonso Henriques */}
          {feedback?.status === 'CORRECT' &&
            (streakEffectId === 'sfx_espada_conquistador' ||
              streakEffectId === 'streak_espada_conquistador') && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-30 animate-pop">
                <span className="text-5xl sm:text-6xl animate-bounce drop-shadow-[0_0_25px_rgba(234,179,8,0.95)]">
                  ⚔️
                </span>
              </div>
            )}

          {/* Player Left (Me) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0 relative">
            <div className="relative shrink-0">
              <PlayerAvatar profile={profile ?? undefined} displayName={me?.displayName || 'Tu'} isCurrentUser={true} size="sm" />
              
              {/* Balão de Provocação (Jogador Atual) */}
              {activeTaunt && activeTaunt.senderId === me?.uid && (
                <div className="absolute -top-12 left-0 sm:-left-2 z-50 animate-bounce pointer-events-none">
                  <div className="relative rounded-2xl border-2 border-emerald-400 bg-slate-950/95 px-3 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(16,185,129,0.7)] whitespace-nowrap backdrop-blur-md">
                    {activeTaunt.text}
                    <div className="absolute -bottom-1.5 left-4 w-2.5 h-2.5 bg-slate-950 border-r-2 border-b-2 border-emerald-400 transform rotate-45" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-display text-xs sm:text-sm font-black text-foreground truncate">
                  {me?.displayName || 'Jogador'} <span className="text-primary">(Tu)</span>
                </span>
                {((profile as any)?.is_founder || (profile as any)?.isFounder) && (
                  <span className="rounded-full bg-amber-500/25 border border-amber-400/60 px-1.5 py-0.2 text-[0.55rem] font-black text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                    👑 Fundador
                  </span>
                )}
                {((profile?.equipped?.title || (typeof window !== 'undefined' && localStorage.getItem('equipped_title')))) && (
                  <span className={cn('rounded-full px-2 py-0.2 text-[0.55rem] font-bold shrink-0', getTitleBadgeStyle(profile?.equipped?.title || (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') : '')))}>
                    {(TITLE_SHOP_CATALOG.find(i => i.id === (profile?.equipped?.title || localStorage.getItem('equipped_title')) || i.name === (profile?.equipped?.title || localStorage.getItem('equipped_title')))?.name || SHOP_CATALOG.find(i => i.id === (profile?.equipped?.title || localStorage.getItem('equipped_title')))?.name || (profile?.equipped?.title || localStorage.getItem('equipped_title')))?.replace(/^Título:\s*«?/, '').replace(/»?$/, '')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <p className="font-display text-base sm:text-lg font-black text-primary text-glow-primary">
                  {me?.score || 0} <span className="text-[0.65rem] text-muted-foreground font-normal">pts</span>
                </p>

                {/* Botão de Provocação / Mensagens Rápidas */}
                <button
                  type="button"
                  disabled={tauntCooldown > 0}
                  onClick={() => setTauntModalOpen(true)}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition shadow-md cursor-pointer select-none',
                    tauntCooldown > 0
                      ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed'
                      : 'bg-purple-600/90 hover:bg-purple-500 text-white border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95'
                  )}
                >
                  {tauntCooldown > 0 ? (
                    <>
                      <span className="text-[10px] animate-spin">⏳</span>
                      <span>{tauntCooldown}s</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-3 w-3 text-purple-200" />
                      <span>💬 Provocar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Center VS Indicator */}
          <div className="flex flex-col items-center px-3">
            <span className="badge-hud text-flag-red border-flag-red/50 bg-flag-red/20 shadow-md shadow-flag-red/20">
              ⚔️ VS
            </span>
            <span className="mt-1 font-mono text-[0.7rem] font-black text-gold">
              Q{currentQIndex + 1} / 10
            </span>
          </div>

          {/* Player Right (Opponent) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3.5 flex-1 min-w-0 text-right relative">
            <div className="min-w-0">
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-display text-xs sm:text-sm font-black text-foreground truncate">
                  {opponent?.displayName || 'Adversário'}
                </span>
              </div>
              <p className="font-display text-xs sm:text-sm font-bold text-muted-foreground truncate">
                Pergunta {Math.min(10, (opponent?.currentQuestionIndex || 0) + 1)} / 10
              </p>
            </div>

            <div className="relative shrink-0">
              <PlayerAvatar displayName={opponent?.displayName || 'Adversário'} size="sm" />

              {/* Balão de Provocação (Adversário) */}
              {activeTaunt && activeTaunt.senderId === opponent?.uid && (
                <div className="absolute -top-12 right-0 sm:-right-2 z-50 animate-bounce pointer-events-none">
                  <div className="relative rounded-2xl border-2 border-purple-400 bg-slate-950/95 px-3 py-1.5 text-xs font-black text-white shadow-[0_0_15px_rgba(168,85,247,0.7)] whitespace-nowrap backdrop-blur-md">
                    {activeTaunt.text}
                    <div className="absolute -bottom-1.5 right-4 w-2.5 h-2.5 bg-slate-950 border-r-2 border-b-2 border-purple-400 transform rotate-45" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TIME BAR & QUESTION CARD (60s Individuais) */}
        {/* ========================================================= */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1.5 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Tempo de Resposta (60s)
            </span>
            <span
              className={cn(
                'font-mono font-black transition-all duration-300',
                isUrgent
                  ? 'text-flag-red text-sm animate-pulse'
                  : 'text-foreground',
              )}
            >
              ⏱️ {timeLeft}s
            </span>
          </div>
          <div
            className={cn(
              'h-3 w-full rounded-full bg-white/10 overflow-hidden shadow-inner p-0.5 border transition-colors duration-300',
              isUrgent ? 'border-flag-red/60 bg-flag-red/10' : 'border-white/10',
            )}
          >
            <div
              className={cn('h-full rounded-full transition-all duration-1000 ease-linear shadow-lg', timeColor)}
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </div>

        {/* Feedback visual instantâneo */}
        {feedback && (
          <div
            className={cn(
              'mt-4 flex items-center justify-center gap-2.5 rounded-2xl p-4 font-display text-sm font-black tracking-wide shadow-2xl transition-all duration-300 animate-pop',
              feedback.status === 'CORRECT' && 'bg-primary/25 border-2 border-primary text-primary ring-4 ring-primary/30 text-glow-primary',
              feedback.status === 'WRONG' && 'bg-flag-red/25 border-2 border-flag-red text-flag-red ring-4 ring-flag-red/30 text-glow-red',
              feedback.status === 'TIMEOUT' && 'bg-gold/25 border-2 border-gold text-gold ring-4 ring-gold/30 text-glow-gold',
            )}
          >
            {feedback.status === 'CORRECT' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
            {feedback.status === 'WRONG' && <XCircle className="h-5 w-5 shrink-0" />}
            {feedback.status === 'TIMEOUT' && <Clock className="h-5 w-5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Texto da Pergunta */}
        <div className="card-game mt-4 rounded-3xl p-6 sm:p-8 shadow-2xl text-center border border-white/15">
          <span className="badge-hud mb-3 text-muted-foreground border-white/15 bg-white/5">
            {currentQuestion?.category || 'Portugal'} · Pergunta {currentQIndex + 1} de 10
          </span>
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-foreground leading-snug text-balance">
            {currentQuestion?.question}
          </h1>
        </div>

        {/* Barra de Power-Ups 100% Individual (50/50, Pista, Congelar) */}
        <QuizPowerUpsBar
          inventory={inventory}
          disabled={feedback !== null || isSubmitting || timeLeft <= 0}
          used5050={eliminatedOptions.length > 0}
          usedClue={activeClue !== null}
          isFrozen={isFrozen}
          freezeTimeLeft={freezeTimeLeft}
          onUse5050={handleUse5050}
          onUseClue={handleUseClue}
          onUseFreeze={handleUseFreeze}
        />

        {/* Pista Histórica no Duelo */}
        {activeClue && (
          <div className="my-3 rounded-2xl border border-amber-500/50 bg-amber-500/15 p-4 text-xs sm:text-sm text-amber-100 flex items-start gap-3 backdrop-blur-xl animate-rise shadow-lg shadow-amber-500/20">
            <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase tracking-wider text-amber-300 block text-[0.7rem] mb-0.5">
                💡 Pista Histórica:
              </span>
              <span className="font-medium leading-relaxed">{activeClue}</span>
            </div>
          </div>
        )}

        {/* Freeze Banner no Duelo */}
        {isFrozen && (
          <div className="my-3 rounded-2xl border border-blue-400/60 bg-blue-500/20 p-3.5 text-xs sm:text-sm text-blue-100 flex items-center justify-center gap-2 backdrop-blur-xl animate-pulse shadow-lg shadow-blue-500/25">
            <Snowflake className="h-4 w-4 text-blue-300 animate-spin" />
            <span className="font-bold">
              ❄️ Tempo Congelado! O teu cronómetro está pausado por <strong>{freezeTimeLeft}s</strong>.
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4 BOTÕES DE RESPOSTA (Otimizados para Touch Mobile) */}
        {/* ========================================================= */}
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          {currentQuestion?.options.map((opt) => {
            const isSelected = selectedOption === opt.key
            const isCorrectOption = opt.key === currentQuestion.correct
            const showFeedback = feedback !== null
            const isEliminated = eliminatedOptions.includes(opt.key)

            if (isEliminated) {
              return (
                <div
                  key={opt.key}
                  className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left opacity-30 select-none cursor-not-allowed"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 font-mono text-xs font-black text-muted-foreground line-through">
                    {opt.key}
                  </span>
                  <span className="text-sm sm:text-base leading-snug line-through text-muted-foreground flex-1">
                    {opt.text}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.62rem] font-bold text-muted-foreground/60 uppercase">
                    50/50
                  </span>
                </div>
              )
            }

            let buttonStyles = 'card-game-interactive text-foreground'

            if (showFeedback) {
              if (isCorrectOption) {
                buttonStyles = 'border-2 border-primary bg-primary/30 text-primary ring-2 ring-primary shadow-xl shadow-primary/30 scale-[1.02]'
              } else if (isSelected && !isCorrectOption) {
                buttonStyles = 'border-2 border-flag-red bg-flag-red/30 text-flag-red ring-2 ring-flag-red/40 opacity-90'
              } else {
                buttonStyles = 'border-white/5 bg-white/[0.02] opacity-35'
              }
            } else if (isSelected) {
              buttonStyles = 'border-2 border-purple-500 bg-purple-500/25 ring-2 ring-purple-500/50 scale-[1.01] text-foreground'
            }

            return (
              <button
                key={opt.key}
                disabled={selectedOption !== null || isSubmitting}
                onClick={() => handleSelectOption(opt.key)}
                className={cn(
                  'group flex items-center gap-3.5 rounded-2xl border p-4 sm:p-5 text-left font-display font-bold transition-all duration-200 cursor-pointer shadow-md',
                  buttonStyles,
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-xl font-mono text-xs font-black transition',
                    showFeedback && isCorrectOption
                      ? 'bg-primary text-primary-foreground'
                      : showFeedback && isSelected
                        ? 'bg-flag-red text-white'
                        : 'bg-white/10 text-foreground group-hover:bg-primary group-hover:text-primary-foreground',
                  )}
                >
                  {opt.key}
                </span>
                <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // =========================================================
  // RENDER 3: FINISHED SCREEN & RESULTADO COMPLETO + REVANCHE
  // =========================================================
  const isWinner = duel.winnerUid === currentPlayer.uid
  const isDraw = duel.winnerUid === null
  const isLoser = !isWinner && !isDraw

  // Estatísticas detalhadas
  const myAnswers = me?.answers || []
  const correctCount = me?.correctCount || 0
  const wrongCount = myAnswers.filter((a) => a.status === 'WRONG' || (a.selectedOption !== null && !a.isCorrect)).length
  const timeoutCount = myAnswers.filter((a) => a.status === 'TIMEOUT' || a.selectedOption === null).length + Math.max(0, 10 - myAnswers.length)
  const accuracy = Math.round((correctCount / 10) * 100)
  const totalTimeSpent = myAnswers.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0)
  const avgTime = myAnswers.length > 0 ? (totalTimeSpent / myAnswers.length).toFixed(1) : '0.0'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 animate-rise">
      <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-card/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl text-center">
        {/* Glow ambient background */}
        <div
          className={cn(
            'pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl',
            isWinner ? 'bg-gold/20' : isDraw ? 'bg-primary/20' : 'bg-flag-red/15',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-3xl',
            isWinner ? 'bg-primary/20' : 'bg-white/5',
          )}
        />

        {/* 1. TOP OUTCOME BANNER */}
        <div className="badge-hud mb-3 border-white/20 bg-white/5 shadow-md">
          {isWinner ? (
            <span className="text-gold flex items-center gap-1.5 font-black">
              <Crown className="h-4 w-4 fill-current animate-pulse" /> Duelo 1v1 Concluído
            </span>
          ) : isDraw ? (
            <span className="text-primary flex items-center gap-1.5 font-black">
              <Shield className="h-4 w-4" /> Duelo 1v1 Concluído
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center gap-1.5 font-black">
              <Swords className="h-4 w-4" /> Duelo 1v1 Concluído
            </span>
          )}
        </div>

        <h1
          className={cn(
            'font-display text-4xl sm:text-7xl font-black uppercase tracking-tight text-balance',
            isWinner ? 'text-gold text-glow-gold' : isDraw ? 'text-primary text-glow-primary' : 'text-foreground',
          )}
        >
          {isWinner ? '🏆 VITÓRIA!' : isDraw ? '🤝 EMPATE!' : '💪 BOA PARTIDA!'}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto font-medium">
          {isWinner
            ? 'Dominaste o duelo com conhecimento e rapidez imbatível.'
            : isDraw
              ? 'Foi taco a taco até à última pergunta.'
              : 'Ficaste a um passo da vitória. Pede uma revanche!'}
        </p>

        {/* 2. HEAD TO HEAD VERSUS CARD */}
        <div className="card-game mt-8 grid grid-cols-2 gap-4 rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20">
          {/* Player A */}
          <div className="border-r border-white/10 pr-3 sm:pr-6 text-center">
            <div className="relative inline-block">
              <PlayerAvatar
                profile={duel.playerA?.uid === currentPlayer.uid ? (profile ?? undefined) : undefined}
                displayName={duel.playerA?.displayName || 'Jogador'}
                isCurrentUser={duel.playerA?.uid === currentPlayer.uid}
                size="xl"
              />
              {duel.winnerUid === duel.playerA?.uid && (
                <Crown className="absolute -top-3.5 -right-2.5 h-7 w-7 text-gold fill-current drop-shadow-lg animate-bounce" />
              )}
            </div>
            <p className="mt-3 font-display text-sm sm:text-base font-black text-foreground truncate">
              {duel.playerA?.displayName || 'Jogador'} {duel.playerA?.uid === currentPlayer.uid && '(Tu)'}
            </p>
            <p className="text-[0.68rem] text-muted-foreground font-bold">
              Nível {duel.playerA?.level || 1} · {duel.playerA?.district || 'Portugal'}
            </p>
            <p className="font-display text-3xl sm:text-5xl font-black text-primary text-glow-primary mt-2">
              {duel.playerA?.score || 0} <span className="text-xs text-muted-foreground font-normal">pts</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {duel.playerA?.correctCount || 0} / 10 certas
            </p>
          </div>

          {/* Player B */}
          <div className="pl-3 sm:pl-6 text-center">
            <div className="relative inline-block">
              <PlayerAvatar
                profile={duel.playerB?.uid === currentPlayer.uid ? (profile ?? undefined) : undefined}
                displayName={duel.playerB?.displayName || 'Adversário'}
                isCurrentUser={duel.playerB?.uid === currentPlayer.uid}
                size="xl"
              />
              {duel.winnerUid === duel.playerB?.uid && (
                <Crown className="absolute -top-3.5 -right-2.5 h-7 w-7 text-gold fill-current drop-shadow-lg animate-bounce" />
              )}
            </div>
            <p className="mt-3 font-display text-sm sm:text-base font-black text-foreground truncate">
              {duel.playerB?.displayName || 'Adversário'} {duel.playerB?.uid === currentPlayer.uid && '(Tu)'}
            </p>
            <p className="text-[0.68rem] text-muted-foreground font-bold">
              Nível {duel.playerB?.level || 1} · {duel.playerB?.district || 'Portugal'}
            </p>
            <p className="font-display text-3xl sm:text-5xl font-black text-gold text-glow-gold mt-2">
              {duel.playerB?.score || 0} <span className="text-xs text-muted-foreground font-normal">pts</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {duel.playerB?.correctCount || 0} / 10 certas
            </p>
          </div>
        </div>

        {/* 3. REVANCHE EM TEMPO REAL (Se solicitado) */}
        {duel.rematch?.status === 'pending' && duel.rematch.toUid === currentPlayer.uid && (
          <div className="card-game-gold mt-6 rounded-3xl p-5 sm:p-6 text-center shadow-2xl border-2 border-gold animate-pulse">
            <div className="flex items-center justify-center gap-2 text-gold font-display text-base sm:text-lg font-black uppercase tracking-wider">
              <Swords className="h-6 w-6 text-gold" />
              <span>⚔️ {duel.rematch.fromName} pediu uma Revanche!</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-foreground/90 font-medium">
              Aceitas disputar uma nova partida com 10 perguntas diferentes?
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleAcceptRematch}
                disabled={rematchLoading}
                className="button-game-gold inline-flex items-center gap-2 rounded-xl px-6 py-3 font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
              >
                <Check className="h-4 w-4" />
                <span>{rematchLoading ? 'A preparar nova arena...' : 'Aceitar Revanche'}</span>
              </button>
              <button
                onClick={handleDeclineRematch}
                disabled={rematchLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/20 transition cursor-pointer"
              >
                <XCircle className="h-4 w-4 text-flag-red" />
                <span>Recusar</span>
              </button>
            </div>
          </div>
        )}

        {duel.rematch?.status === 'pending' && duel.rematch.fromUid === currentPlayer.uid && (
          <div className="mt-6 rounded-3xl border border-gold/40 bg-gold/10 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gold font-display text-xs sm:text-sm font-black uppercase tracking-wider animate-pulse">
              <Clock className="h-4 w-4" />
              <span>A aguardar resposta de {opponent?.displayName || 'adversário'}...</span>
            </div>
          </div>
        )}

        {duel.rematch?.status === 'declined' && duel.rematch.fromUid === currentPlayer.uid && (
          <div className="mt-6 rounded-3xl border border-flag-red/30 bg-flag-red/10 p-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-flag-red">
              ⚠️ O adversário recusou a revanche. Podes procurar outro adversário abaixo!
            </p>
          </div>
        )}

        {/* 4. LEVEL UP CELEBRATION (Se aplicável) */}
        {claimedReward?.leveledUp && (
          <div className="card-game-gold mt-6 rounded-3xl p-5 text-center shadow-xl animate-pulse">
            <div className="flex items-center justify-center gap-2 text-gold font-display text-base sm:text-lg font-black uppercase tracking-wider">
              <Award className="h-6 w-6 fill-current" />
              <span>🎉 NOVO NÍVEL ALCANÇADO!</span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-foreground font-bold">
              Subiste de Nível {claimedReward.oldLevel} ➔ <span className="text-gold font-black">Nível {claimedReward.newLevel} ({claimedReward.levelTitle})</span>
            </p>
          </div>
        )}

        {/* 5. REWARDS CARD */}
        {claimedReward && (
          <div className="card-game-gold mt-6 rounded-3xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-gold mb-3 text-glow-gold">
              🎁 Recompensas de Partida
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30 shadow-md">
                  <Sparkles className="h-5 w-5 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase">Experiência</p>
                  <p className="font-display text-lg sm:text-xl font-black text-foreground">
                    +{claimedReward.xp} XP
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold ring-1 ring-gold/40 shadow-md">
                  <Coins className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase">€ Acorda Virtual</p>
                  <p className="font-display text-lg sm:text-xl font-black text-gold text-glow-gold">
                    +€{claimedReward.euros}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-foreground ring-1 ring-white/20 shadow-md">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-[0.65rem] font-bold text-muted-foreground uppercase">Novo Saldo</p>
                  <p className="font-display text-lg sm:text-xl font-black text-foreground">
                    €{claimedReward.newEuros.toLocaleString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. ESTATÍSTICAS DO DUELO */}
        <div className="card-game mt-6 rounded-3xl p-5 sm:p-6 text-left border border-white/15">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center sm:text-left">
            📊 Resumo do Duelo (As Tuas Estatísticas)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-xl font-black text-primary">{correctCount} / 10</p>
              <p className="text-[0.65rem] text-muted-foreground font-bold">Acertos</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-sm">
              <XCircle className="h-4 w-4 text-flag-red mx-auto mb-1" />
              <p className="font-display text-xl font-black text-flag-red">{wrongCount}</p>
              <p className="text-[0.65rem] text-muted-foreground font-bold">Erros</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-sm">
              <Clock className="h-4 w-4 text-gold mx-auto mb-1" />
              <p className="font-display text-xl font-black text-gold">{timeoutCount}</p>
              <p className="text-[0.65rem] text-muted-foreground font-bold">Tempo Esgotado</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <Target className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="font-display text-xl font-black text-emerald-400">{accuracy}%</p>
              <p className="text-[0.65rem] text-muted-foreground">Precisão</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
              <Clock className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <p className="font-display text-xl font-black text-cyan-400">{avgTime}s</p>
              <p className="text-[0.65rem] text-muted-foreground">Tempo Médio</p>
            </div>
          </div>
        </div>

        {/* 7. BOTÕES DE PÓS-PARTIDA (REVANCHE PRINCIPAL) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            disabled={rematchLoading || duel.rematch?.status === 'pending'}
            onClick={handleRequestRematch}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 font-display text-sm font-black uppercase tracking-wider text-black hover:scale-102 hover:brightness-110 shadow-lg shadow-gold/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Swords className="h-4 w-4" />
            <span>
              {duel.rematch?.status === 'pending'
                ? duel.rematch.fromUid === currentPlayer.uid
                  ? '⏳ A aguardar resposta...'
                  : '⚔️ Revanche Pendente'
                : '⚔️ Revanche'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMatchmakingModalOpen(true)}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-sm font-black uppercase tracking-wider text-primary-foreground hover:scale-102 hover:brightness-110 shadow-lg shadow-primary/30 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Outro Adversário</span>
          </button>

          <Link
            href="/jogar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 font-display text-sm font-bold uppercase tracking-wider text-foreground hover:bg-white/20 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Jogar</span>
          </Link>
        </div>
      </div>

      {/* Modal de Matchmaking para procurar outro adversário */}
      <DuelMatchmakingModal
        isOpen={matchmakingModalOpen}
        onClose={() => setMatchmakingModalOpen(false)}
        onMatchStart={(newMatchId) => {
          setMatchmakingModalOpen(false)
          if (onDuelChange) {
            onDuelChange(newMatchId)
          } else {
            router.push(`/jogar/duelo?id=${newMatchId}`)
          }
        }}
      />

      {/* ========================================================= */}
      {/* MODAL DE PROVOCAÇÕES & REAÇÕES RÁPIDAS 1V1 */}
      {/* ========================================================= */}
      {tauntModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-purple-500/30 bg-slate-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setTauntModalOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white">
                  Provocações de Quiz 1v1
                </h3>
                <p className="text-xs text-slate-400">
                  Envia mensagens psicológicas em tempo real (Cooldown: 4s)
                </p>
              </div>
            </div>

            {/* Packs & Taunts */}
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {TAUNT_PACKS.map((pack) => {
                const isUnlocked = pack.isFree || unlockedTaunts.includes(pack.id)

                return (
                  <div
                    key={pack.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 sm:p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{pack.icon}</span>
                        <span className="font-display text-xs sm:text-sm font-bold text-white">
                          {pack.name}
                        </span>
                      </div>

                      {!isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleBuyTauntPack(pack)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider uppercase transition flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <Lock className="w-3 h-3" />
                          <span>€{pack.price.toLocaleString('pt-PT')}</span>
                        </button>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${pack.badgeColor}`}>
                          {pack.isFree ? 'Grátis' : 'Desbloqueado'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2.5 leading-snug">
                      {pack.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pack.taunts.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          disabled={!isUnlocked || tauntCooldown > 0}
                          onClick={() => handleSendTaunt(t.text)}
                          className={cn(
                            'px-3 py-2 rounded-xl text-xs font-bold text-left transition border',
                            !isUnlocked
                              ? 'bg-slate-900/30 border-slate-800/50 text-slate-500 opacity-60 cursor-not-allowed'
                              : tauntCooldown > 0
                              ? 'bg-slate-900 border-slate-800 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-900/90 hover:bg-purple-500/20 text-slate-200 hover:text-white border-slate-800 hover:border-purple-500/50 hover:scale-102 cursor-pointer shadow-sm'
                          )}
                        >
                          {t.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
