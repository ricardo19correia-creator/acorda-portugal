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
  AlertTriangle,
} from 'lucide-react'
import { doc, updateDoc, arrayUnion, addDoc, collection, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { useEconomy } from '@/context/economy-context'
import { useGameTheme } from '@/context/game-theme-context'
import {
  type DuelDocument,
  type DuelPlayerData,
  type DuelRewardResult,
  type DuelAnswerStatus,
  type DuelEmoteEvent,
  subscribeToDuel,
  submitDuelAnswer,
  claimDuelRewards,
  cleanMatchmakingQueue,
  requestDuelRematch,
  respondDuelRematch,
  sendDuelTaunt,
  sendDuelEmote,
  surrenderDuel,
} from '@/lib/duel'
import { TAUNT_PACKS, type TauntPack } from '@/data/tauntPacks'
import { DuelEmoteBubble, DuelEmotePicker, DuelEmoteQuickDock, DuelEmoteFloatingBar } from '@/components/duel-emote-system'
import { ProvocationBubble } from '@/components/ProvocationBubble'
import { playEmoteSound } from '@/lib/sound-engine'
import { type EmoteItem } from '@/src/data/emotes'
import { DuelMatchmakingModal } from '@/components/duel-matchmaking-modal'
import { GameExitControl } from '@/components/game-exit-modal'
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
  onArenaLoaded,
}: {
  duelId: string
  onDuelChange?: (newDuelId: string) => void
  onArenaLoaded?: (arenaImage: string) => void
}) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { addCoins, deductCoins } = useEconomy()
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
  const [isSurrenderModalOpen, setIsSurrenderModalOpen] = useState(false)
  const [isSurrendering, setIsSurrendering] = useState(false)
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

  // Emotes & Quick Reactions System State (Bi-directional Network Synchronization)
  const [tauntModalOpen, setTauntModalOpen] = useState(false)
  const [tauntCooldown, setTauntCooldown] = useState(0)
  const [playerReaction, setPlayerReaction] = useState<{ message: string; timestamp: number } | null>(null)
  const [opponentReaction, setOpponentReaction] = useState<{ message: string; timestamp: number } | null>(null)
  const [activeEmote, setActiveEmote] = useState<{ senderId: string; emoji: string; label: string; text: string; timestamp: number } | null>(null)
  const lastProcessedEmoteId = useRef<string>('')
  const lastProcessedReactionDocId = useRef<string>('')
  const [unlockedTaunts, setUnlockedTaunts] = useState<string[]>(['pack_basico'])

  // Load user unlocked taunts and equipped emotes
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

  // Anti-spam 2-second cooldown timer
  useEffect(() => {
    if (tauntCooldown <= 0) return
    const timer = setInterval(() => {
      setTauntCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [tauntCooldown])

  // Real-time Bi-directional Emote & Reaction Synchronization (Creator <-> Guest via document)
  useEffect(() => {
    const rawReaction = duel?.lastEmote || (duel as any)?.lastReaction || (duel?.lastTaunt ? {
      id: `taunt_${duel.lastTaunt.timestamp}`,
      senderId: duel.lastTaunt.senderId,
      senderName: duel.lastTaunt.senderName,
      text: duel.lastTaunt.text,
      label: duel.lastTaunt.text,
      emoji: '💬',
      timestamp: duel.lastTaunt.timestamp,
    } : null)

    if (!rawReaction) return

    const reactionKey = (rawReaction as any).id || `${rawReaction.senderId}_${rawReaction.timestamp}`
    if (reactionKey === lastProcessedEmoteId.current) return
    lastProcessedEmoteId.current = reactionKey

    const myUid = currentPlayer.uid || user?.uid
    const isFromMe = rawReaction.senderId === myUid
    const displayMsg = rawReaction.text || (rawReaction.emoji ? `${rawReaction.emoji} ${rawReaction.label || ''}` : rawReaction.label) || 'Reação'

    const emoteObj = {
      senderId: rawReaction.senderId,
      emoji: rawReaction.emoji || '💬',
      label: rawReaction.label || rawReaction.text,
      text: rawReaction.text,
      timestamp: rawReaction.timestamp,
    }

    setActiveEmote(emoteObj)

    if (isFromMe) {
      setPlayerReaction({ message: displayMsg, timestamp: rawReaction.timestamp })
      const timer = setTimeout(() => {
        setPlayerReaction(null)
        setActiveEmote(null)
      }, 3500)
      return () => clearTimeout(timer)
    } else {
      playEmoteSound(rawReaction.label || rawReaction.text)
      setOpponentReaction({ message: displayMsg, timestamp: rawReaction.timestamp })
      const timer = setTimeout(() => {
        setOpponentReaction(null)
        setActiveEmote(null)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [duel?.lastEmote, (duel as any)?.lastReaction, duel?.lastTaunt, currentPlayer.uid, user?.uid])

  // Sub-coleção em tempo real Firestore (gameRooms/${duelId}/reactions e duels/${duelId}/reactions)
  useEffect(() => {
    if (!duelId) return
    let unsub1: (() => void) | undefined
    let unsub2: (() => void) | undefined

    try {
      const q1 = query(
        collection(db, `gameRooms/${duelId}/reactions`),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
      unsub1 = onSnapshot(q1, (snap) => {
        if (!snap.empty) {
          const docData = snap.docs[0].data()
          const docId = snap.docs[0].id
          if (docId === lastProcessedReactionDocId.current) return
          lastProcessedReactionDocId.current = docId

          const myUid = currentPlayer.uid || user?.uid
          const isFromMe = docData.senderId === myUid
          const msg = docData.message || 'Reação'

          if (isFromMe) {
            setPlayerReaction({ message: msg, timestamp: Date.now() })
            setTimeout(() => setPlayerReaction(null), 3500)
          } else {
            playEmoteSound(msg)
            setOpponentReaction({ message: msg, timestamp: Date.now() })
            setTimeout(() => setOpponentReaction(null), 3500)
          }
        }
      }, () => {})
    } catch {}

    try {
      const q2 = query(
        collection(db, `duels/${duelId}/reactions`),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
      unsub2 = onSnapshot(q2, (snap) => {
        if (!snap.empty) {
          const docData = snap.docs[0].data()
          const docId = snap.docs[0].id
          if (docId === lastProcessedReactionDocId.current) return
          lastProcessedReactionDocId.current = docId

          const myUid = currentPlayer.uid || user?.uid
          const isFromMe = docData.senderId === myUid
          const msg = docData.message || 'Reação'

          if (isFromMe) {
            setPlayerReaction({ message: msg, timestamp: Date.now() })
            setTimeout(() => setPlayerReaction(null), 3500)
          } else {
            playEmoteSound(msg)
            setOpponentReaction({ message: msg, timestamp: Date.now() })
            setTimeout(() => setOpponentReaction(null), 3500)
          }
        }
      }, () => {})
    } catch {}

    return () => {
      if (unsub1) unsub1()
      if (unsub2) unsub2()
    }
  }, [duelId, currentPlayer.uid, user?.uid])

  // Handle sending an Emote
  const handleSendEmote = async (emote: EmoteItem) => {
    if (tauntCooldown > 0 || !duelId) return
    setTauntCooldown(3)
    setTauntModalOpen(false)

    // Immediate local feedback & audio chime
    playEmoteSound(emote.label)
    const now = Date.now()
    const uniqueLocalId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local_${now}`
    lastProcessedEmoteId.current = uniqueLocalId

    const msg = emote.text || `${emote.emoji} ${emote.label}`
    setPlayerReaction({ message: msg, timestamp: now })
    setActiveEmote({
      senderId: currentPlayer.uid,
      emoji: emote.emoji,
      label: emote.label,
      text: emote.text,
      timestamp: now,
    })

    setTimeout(() => {
      setPlayerReaction(null)
      setActiveEmote(null)
    }, 3500)

    // 1. Direct Realtime Broadcast to Duel opponent on Firestore doc
    await sendDuelEmote(duelId, currentPlayer.uid, currentPlayer.displayName, emote.id, emote.text)

    // 2. Write to subcollection gameRooms/${duelId}/reactions for multi-layer redundancy
    try {
      addDoc(collection(db, `gameRooms/${duelId}/reactions`), {
        senderId: currentPlayer.uid,
        message: msg,
        timestamp: serverTimestamp(),
      }).catch(() => {})
    } catch {}

    // 3. Write to subcollection duels/${duelId}/reactions
    try {
      addDoc(collection(db, `duels/${duelId}/reactions`), {
        senderId: currentPlayer.uid,
        message: msg,
        timestamp: serverTimestamp(),
      }).catch(() => {})
    } catch {}

    // Optional API rate-limit validation in background
    try {
      fetch('/api/duel/emote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duelId,
          senderId: currentPlayer.uid,
          senderName: currentPlayer.displayName,
          emoteId: emote.id,
        }),
      }).catch(() => {})
    } catch {}
  }

  // Handle sending a taunt (legacy fallback)
  const handleSendTaunt = async (tauntText: string) => {
    if (tauntCooldown > 0 || !duelId) return
    setTauntCooldown(2)
    setTauntModalOpen(false)
    await sendDuelTaunt(duelId, currentPlayer.uid, currentPlayer.displayName, tauntText)
  }

  // Handle buying a taunt pack directly
  const handleBuyTauntPack = async (pack: TauntPack) => {
    const deductSuccess = await deductCoins(pack.price, `Compra: Pack ${pack.name}`)
    if (!deductSuccess) {
      alert(`Saldo de € Acorda insuficiente!`)
      return
    }

    const newUnlocked = Array.from(new Set([...unlockedTaunts, pack.id]))
    setUnlockedTaunts(newUnlocked)
    localStorage.setItem('user_inventory_taunts', JSON.stringify(newUnlocked))

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
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

      if (updatedDuel.arenaImage && onArenaLoaded) {
        onArenaLoaded(updatedDuel.arenaImage)
      }

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

  // Sair / Desistir da Partida 1v1 Definitivo
  const handleConfirmSurrender = async () => {
    if (isSurrendering) return
    setIsSurrendering(true)

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    if (duelId && currentPlayer.uid) {
      try {
        // 1. Notificar Firebase via surrenderDuel
        await surrenderDuel(duelId, currentPlayer.uid)

        // 2. Broadcast local e API
        const surrenderPayload = {
          event: 'player_surrendered',
          type: 'PLAYER_SURRENDERED',
          senderId: currentPlayer.uid,
          duelId,
          surrenderedBy: currentPlayer.uid,
          winnerUid: opponent?.uid,
        }
        window.dispatchEvent(new CustomEvent('player_surrendered', { detail: surrenderPayload }))

        fetch('/api/duel/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duelId, userId: currentPlayer.uid, uid: currentPlayer.uid }),
        }).catch(() => {})
      } catch (e) {
        console.error('Erro ao desistir:', e)
      }
    }

    setIsSurrenderModalOpen(false)
    router.push('/jogar')
  }

  // Prevenção de saída/fecho de janela acidental durante duelo ativo
  useEffect(() => {
    if (!duel || duel.status === 'finished') return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [duel?.status])

  const handleSurrenderAndExit = () => {
    setIsSurrenderModalOpen(true)
  }

  const handleCancelWaitingAndExit = async () => {
    if (duelId && currentPlayer.uid) {
      try {
        await cleanMatchmakingQueue(currentPlayer.uid)
      } catch (e) {}
    }
    router.push('/jogar')
  }

  // Claim rewards when finished
  useEffect(() => {
    if (duel?.status === 'finished' && currentPlayer.uid && !claimedReward) {
      claimDuelRewards(duel.id, currentPlayer.uid)
        .then((res) => {
          setClaimedReward(res)
          if (res?.euros && res.euros > 0) {
            void addCoins(res.euros, 'Vitória em Duelo 1v1')
          }
        })
        .catch((e) => console.error('Erro ao resgatar recompensas:', e))
    }
  }, [duel?.status, currentPlayer.uid, claimedReward, addCoins])

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
      <div className="h-[100dvh] w-full flex flex-col justify-between p-3 pb-6 max-w-lg mx-auto select-none animate-rise">
        {/* ========================================================= */}
        {/* 1. TOPO: VS HEADER + REAGIR + TEMPO (SHRINK-0)            */}
        {/* ========================================================= */}
        <div className="w-full shrink-0">
          <div className="card-game flex items-center justify-between gap-2 rounded-2xl py-1.5 px-3 shadow-lg border border-white/15 relative overflow-visible bg-slate-900/90">
            {/* 1v1 VFX OVERLAYS CLIPPED INSIDE INNER CONTAINER */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {/* 1v1 VFX OVERLAY: Raio Lusitano */}
              {feedback?.status === 'CORRECT' && (profile?.equipped?.sfx === 'sfx_raio_lusitano' || streakEffectId === 'sfx_raio_lusitano') && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-yellow-400/40 to-transparent animate-ping" />
              )}

              {/* 1v1 VFX OVERLAY: Cravos de Abril */}
              {feedback?.status === 'CORRECT' && (profile?.equipped?.sfx === 'sfx_cravos_abril' || streakEffectId === 'sfx_cravos_abril') && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span className="text-lg animate-bounce">🌺</span>
                  <span className="text-base animate-ping ml-2">🌸</span>
                </div>
              )}

              {/* 1v1 VFX OVERLAY: Chama Tripla Verde Néon */}
              {feedback?.status === 'CORRECT' && streakEffectId === 'streak_chama_tripla' && (
                <div className="pointer-events-none absolute inset-0 bg-emerald-500/20 shadow-[inset_0_0_30px_rgba(16,185,129,0.7)] animate-pulse" />
              )}

              {/* 1v1 VFX OVERLAY: Explosão de Moedas de Ouro */}
              {feedback?.status === 'CORRECT' && streakEffectId === 'streak_moedas_ouro' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-around overflow-hidden">
                  <span className="text-lg animate-bounce">🪙</span>
                  <span className="text-xl animate-ping">✨</span>
                </div>
              )}

              {/* 1v1 VFX OVERLAY: Espada de D. Afonso Henriques */}
              {feedback?.status === 'CORRECT' &&
                (streakEffectId === 'sfx_espada_conquistador' ||
                  streakEffectId === 'streak_espada_conquistador') && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-30 animate-pop">
                    <span className="text-2xl animate-bounce drop-shadow-[0_0_15px_rgba(234,179,8,0.95)]">
                      ⚔️
                    </span>
                  </div>
                )}
            </div>

            {/* Linha dos Jogadores VS */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 relative">
              {/* Botão Discreto de Desistência 1v1 */}
              <GameExitControl
                mode="1v1"
                onConfirmExit={handleConfirmSurrender}
              />
              <div className="relative shrink-0 w-9 h-9 flex items-center justify-center">
                <PlayerAvatar
                  profile={profile ?? undefined}
                  photoURL={me?.photoURL || (me as any)?.avatarUrl || (me as any)?.avatar}
                  displayName={me?.displayName || 'Tu'}
                  isCurrentUser={true}
                  size="sm"
                />
                {playerReaction && (
                  <ProvocationBubble
                    message={playerReaction.message}
                    sender="player"
                    onDismiss={() => setPlayerReaction(null)}
                  />
                )}
              </div>

              <div className="min-w-0">
                <span className="font-display text-xs font-black text-foreground truncate block leading-none">
                  {me?.displayName || 'Jogador'} <span className="text-primary text-[10px]">(Tu)</span>
                </span>
                <p className="font-display text-xs font-black text-primary text-glow-primary leading-none mt-1">
                  {me?.score || 0} <span className="text-[0.6rem] text-muted-foreground font-normal">pts</span>
                </p>
              </div>
            </div>

            {/* Center VS Indicator + Reagir Button */}
            <div className="flex flex-col items-center px-1.5 shrink-0 relative z-30">
              <div className="flex items-center gap-1">
                <span className="badge-hud text-flag-red border-flag-red/50 bg-flag-red/20 py-0.2 px-1.5 text-[9px] font-black">
                  VS
                </span>
                <span className="font-mono text-[10px] font-black text-gold">
                  Q{currentQIndex + 1}/10
                </span>
              </div>

              {/* Botão Mini Reagir Desbloqueado */}
              <div className="relative mt-1">
                <button
                  type="button"
                  disabled={tauntCooldown > 0}
                  onClick={(e) => {
                    e.stopPropagation()
                    setTauntModalOpen((prev) => !prev)
                  }}
                  className={cn(
                    'relative z-30 pointer-events-auto px-2.5 py-1 rounded-full border border-purple-500/50 bg-purple-500/20 text-purple-300 text-[10px] font-black transition flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm',
                    tauntCooldown > 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-purple-600/30 hover:border-purple-400'
                  )}
                >
                  <span>💬</span>
                  <span>{tauntCooldown > 0 ? `${tauntCooldown}s` : 'Reagir'}</span>
                </button>
              </div>
            </div>

            {/* Player Right (Opponent) */}
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right relative">
              <div className="min-w-0">
                <span className="font-display text-xs font-black text-foreground truncate block leading-none">
                  {opponent?.displayName || 'Adversário'}
                </span>
                <p className="font-display text-xs font-bold text-muted-foreground truncate leading-none mt-1">
                  P{Math.min(10, (opponent?.currentQuestionIndex || 0) + 1)}/10
                </p>
              </div>

              <div className="relative shrink-0 w-9 h-9 flex items-center justify-center">
                <PlayerAvatar
                  photoURL={opponent?.photoURL || (opponent as any)?.avatarUrl || (opponent as any)?.avatar}
                  displayName={opponent?.displayName || 'Adversário'}
                  isCurrentUser={false}
                  size="sm"
                />
                {opponentReaction && (
                  <ProvocationBubble
                    message={opponentReaction.message}
                    sender="opponent"
                    onDismiss={() => setOpponentReaction(null)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Barra de Tempo Compacta */}
          <div className="flex items-center gap-1.5 mt-1.5 w-full px-0.5">
            <div
              className={cn(
                'h-1.5 w-full rounded-full bg-slate-800 overflow-hidden border transition-colors duration-300 flex-1',
                isUrgent ? 'border-flag-red/60' : 'border-slate-700/40',
              )}
            >
              <div
                className={cn('h-full rounded-full transition-all duration-1000 ease-linear shadow-sm', timeColor)}
                style={{ width: `${timePercentage}%` }}
              />
            </div>
            <span className={cn('font-mono font-bold text-xs shrink-0 leading-none', isUrgent ? 'text-flag-red animate-pulse' : 'text-slate-300')}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTRO: CARD DA PERGUNTA (MY-AUTO, MIN-H-140, MAX-H-220)*/}
        {/* ========================================================= */}
        <div className="my-auto w-full flex flex-col items-center justify-center relative">
          {/* Feedback visual instantâneo overlay */}
          {feedback && (
            <div
              className={cn(
                'mb-2 px-3 py-1 rounded-xl font-display text-xs font-black tracking-wide shadow-lg transition-all duration-300 animate-pop z-20 flex items-center gap-1.5 shrink-0',
                feedback.status === 'CORRECT' && 'bg-primary/30 border border-primary text-primary text-glow-primary',
                feedback.status === 'WRONG' && 'bg-flag-red/30 border border-flag-red text-flag-red text-glow-red',
                feedback.status === 'TIMEOUT' && 'bg-gold/30 border border-gold text-gold text-glow-gold',
              )}
            >
              {feedback.status === 'CORRECT' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
              {feedback.status === 'WRONG' && <XCircle className="h-3.5 w-3.5 shrink-0" />}
              {feedback.status === 'TIMEOUT' && <Clock className="h-3.5 w-3.5 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Card com corpo e presença visual elegante */}
          <div className="w-full min-h-[140px] max-h-[220px] p-4 flex flex-col justify-center items-center text-center bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-xl shadow-black/40 backdrop-blur-md overflow-y-auto">
            <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider mb-1 shrink-0">
              {currentQuestion?.category || 'Portugal'} · Pergunta {currentQIndex + 1} de 10
            </span>
            <h1 className="text-sm sm:text-base font-bold text-center leading-snug text-white text-balance line-clamp-4">
              {currentQuestion?.question}
            </h1>
          </div>

          {/* Pista Histórica no Duelo */}
          {activeClue && (
            <div className="mt-1.5 rounded-xl border border-amber-500/50 bg-amber-500/15 px-3 py-1 text-xs text-amber-100 flex items-center gap-1.5 backdrop-blur-xl animate-rise shadow-sm shrink-0 w-full">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-medium truncate">{activeClue}</span>
            </div>
          )}

          {/* Freeze Banner no Duelo */}
          {isFrozen && (
            <div className="mt-1.5 rounded-xl border border-blue-400/60 bg-blue-500/20 px-3 py-1 text-xs text-blue-100 flex items-center justify-center gap-1.5 backdrop-blur-xl animate-pulse shadow-sm shrink-0 w-full">
              <Snowflake className="h-3.5 w-3.5 text-blue-300 animate-spin" />
              <span className="font-bold">Congelado ({freezeTimeLeft}s)</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. FUNDO: AJUDAS + GRELHA DE RESPOSTAS 2x2 (SHRINK-0)     */}
        {/* ========================================================= */}
        <div className="w-full flex flex-col gap-2 shrink-0">
          {/* Barra de Ajudas */}
          <div className="flex justify-center gap-3 mb-1">
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
          </div>

          {/* Grelha 2x2 com botões h-16 confortáveis */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {currentQuestion?.options.map((opt, idx) => {
              const isSelected = selectedOption === opt.key
              const isCorrectOption = opt.key === currentQuestion.correct
              const showFeedback = feedback !== null
              const isEliminated = eliminatedOptions.includes(opt.key)
              const optionKey = (['A', 'B', 'C', 'D'][idx] || opt.key) as 'A' | 'B' | 'C' | 'D'

              if (isEliminated) {
                return (
                  <div
                    key={opt.key}
                    className="h-16 w-full p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center gap-2 text-left opacity-35 select-none cursor-not-allowed shadow-inner"
                  >
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-extrabold text-xs flex items-center justify-center shrink-0 line-through">
                      {optionKey}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 leading-tight line-through line-clamp-2 flex-1">
                      {opt.text}
                    </span>
                  </div>
                )
              }

              let buttonStyles = 'bg-slate-900/90 border border-slate-700/80 active:border-cyan-400 hover:border-slate-500 shadow-lg'

              if (showFeedback) {
                if (isCorrectOption) {
                  buttonStyles = 'bg-emerald-950/95 border-2 border-emerald-400 text-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/30'
                } else if (isSelected && !isCorrectOption) {
                  buttonStyles = 'bg-rose-950/95 border-2 border-rose-500 text-white ring-2 ring-rose-500/40 shadow-lg shadow-rose-500/30'
                } else {
                  buttonStyles = 'bg-slate-900/80 border border-slate-800/80 opacity-35 text-slate-500'
                }
              } else if (isSelected) {
                buttonStyles = 'bg-purple-950/95 border-2 border-purple-400 ring-2 ring-purple-500/40 text-white'
              }

              return (
                <button
                  key={opt.key}
                  disabled={selectedOption !== null || isSubmitting}
                  onClick={() => handleSelectOption(opt.key)}
                  className={cn(
                    'h-16 w-full p-2.5 rounded-xl flex items-center gap-2 text-left transition-all select-none cursor-pointer active:scale-98',
                    buttonStyles,
                  )}
                >
                  <span
                    className={cn(
                      'w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border transition-colors',
                      showFeedback && isCorrectOption
                        ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                        : showFeedback && isSelected
                          ? 'bg-rose-600 border-rose-400 text-white'
                          : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/30',
                    )}
                  >
                    {optionKey}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white leading-tight line-clamp-2 flex-1">
                    {opt.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL / POPUP DE SELEÇÃO DE REAÇÕES (FIXED Z-50)           */}
        {/* ========================================================= */}
        {tauntModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 select-none"
            onClick={() => setTauntModalOpen(false)}
          >
            <div
              className="fixed z-50 inset-x-4 bottom-24 max-w-sm mx-auto bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-white animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header com título e botão fechar X */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">💬</span>
                  <h3 className="font-display text-xs font-black uppercase tracking-wider text-cyan-300">
                    Enviar Provocação
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTauntModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Provocações Rápidas */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'boa_sorte', emoji: '🍀', label: 'Boa Sorte!' },
                  { id: 'facil', emoji: '⚡', label: 'Essa era fácil!' },
                  { id: 'medo', emoji: '😱', label: 'Estás com medo?' },
                  { id: 'campeao', emoji: '🏆', label: 'O título é meu!' },
                  { id: 'foco', emoji: '🎯', label: 'Na mouche!' },
                  { id: 'adeus', emoji: '👋', label: 'Já foste!' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={tauntCooldown > 0}
                    onClick={() => {
                      handleSendEmote({
                        id: item.id,
                        emoji: item.emoji,
                        label: item.label,
                        text: `${item.emoji} ${item.label}`,
                        category: 'provocacao',
                        price: 0,
                        rarity: 'COMUM',
                      } as any)
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 active:scale-95 transition-all text-left cursor-pointer"
                  >
                    <span className="text-lg shrink-0">{item.emoji}</span>
                    <span className="text-xs font-bold text-slate-100 leading-tight truncate">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
    <div className="mx-auto w-full max-w-3xl min-h-screen overflow-y-auto px-3 sm:px-4 py-6 sm:py-10 pb-24 animate-rise">
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
          {duel.winnerReason === 'opponent_forfeit' || duel.winnerReason === 'surrender' || duel.abandonedBy
            ? isWinner
              ? 'O adversário desistiu da partida! Vitória concedida por abandono.'
              : 'Abandonaste a partida. Vitória concedida ao adversário.'
            : isWinner
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
                photoURL={duel.playerA?.photoURL || (duel.playerA as any)?.avatarUrl || (duel.playerA as any)?.avatar}
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
                photoURL={duel.playerB?.photoURL || (duel.playerB as any)?.avatarUrl || (duel.playerB as any)?.avatar}
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
      {/* MODAL / HUD DE EMOTES & REAÇÕES RÁPIDAS 1V1 */}
      {/* ========================================================= */}
      <DuelEmotePicker
        isOpen={tauntModalOpen}
        onClose={() => setTauntModalOpen(false)}
        onSendEmote={handleSendEmote}
        cooldown={tauntCooldown}
        equippedEmoteIds={(profile as any)?.equipped?.emotes}
      />
    </div>
  )
}
