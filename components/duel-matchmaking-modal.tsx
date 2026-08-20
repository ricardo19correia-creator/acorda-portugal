'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Swords,
  Users,
  Search,
  Check,
  AlertCircle,
  KeyRound,
  PlusCircle,
  Zap,
  Shield,
  Clock,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { PlayerAvatar } from '@/components/player-avatar'
import {
  type MatchmakingTicket,
  joinMatchmakingQueue,
  heartbeatMatchmaking,
  cancelMatchmakingQueue,
  subscribeToMatchmaking,
  tryFindOpponentMatch,
  createDuel,
  joinDuelByCode,
} from '@/lib/duel'
import { cn } from '@/lib/utils'

interface DuelMatchmakingModalProps {
  isOpen: boolean
  onClose: () => void
  onMatchStart?: (duelId: string) => void
}

export function DuelMatchmakingModal({ isOpen, onClose, onMatchStart }: DuelMatchmakingModalProps) {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()

  const isAuthenticated = authResolved && !!user?.uid
  const playerUid = user?.uid || ''
  const playerName = profile?.displayName || user?.displayName || 'Jogador'
  const playerPhoto = user?.photoURL || null
  const playerLevel = profile?.level || 1
  const playerDistrict = profile?.district || 'Portugal'

  const currentPlayer = useMemo(() => {
    return {
      uid: playerUid,
      displayName: playerName,
      photoURL: playerPhoto,
    }
  }, [playerUid, playerName, playerPhoto])

  // Active view: 'matchmaking' | 'custom_room'
  const [activeView, setActiveView] = useState<'matchmaking' | 'custom_room'>('matchmaking')

  // Matchmaking states: 'idle' | 'searching' | 'matched' | 'timeout'
  const [mmState, setMmState] = useState<'idle' | 'searching' | 'matched' | 'timeout'>('idle')
  const [searchTimeSeconds, setSearchTimeSeconds] = useState<number>(0)
  const [retryTrigger, setRetryTrigger] = useState<number>(0)
  const [matchedDuelId, setMatchedDuelId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [ticket, setTicket] = useState<MatchmakingTicket | null>(null)

  // Custom room states
  const [customTab, setCustomTab] = useState<'create' | 'join'>('create')
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null)
  const [createdDuelId, setCreatedDuelId] = useState<string | null>(null)
  const [codeInputValue, setCodeInputValue] = useState<string>('')
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)

  // Refs de sincronização e cleanup estrito
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const matchAttemptIdRef = useRef<string | null>(null)
  const matchedDuelIdRef = useRef<string | null>(null)

  const playerPropsRef = useRef({
    playerName,
    playerPhoto,
    playerLevel,
    playerDistrict,
  })
  playerPropsRef.current = {
    playerName,
    playerPhoto,
    playerLevel,
    playerDistrict,
  }

  // Handler seguro e atómico de Match Found
  const handleMatchFound = (
    duelId: string,
    opponentInfo?: { displayName: string; photoURL?: string | null; level: number; district?: string } | null,
    incomingTicket?: MatchmakingTicket,
  ) => {
    if (matchedDuelIdRef.current) return
    console.log('[MATCH ATOMIC FOUND - 100% REAL PVP] duelId:', duelId, 'Opponent:', opponentInfo?.displayName)
    matchedDuelIdRef.current = duelId
    setMatchedDuelId(duelId)
    setMmState('matched')

    // Limpar imediatamente todos os timers e polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current)
      searchTimerRef.current = null
    }

    if (incomingTicket) {
      setTicket(incomingTicket)
    } else if (opponentInfo) {
      const normalizedOpponent = {
        displayName: opponentInfo.displayName,
        photoURL: opponentInfo.photoURL ?? null,
        level: opponentInfo.level ?? 1,
        district: opponentInfo.district ?? 'Portugal',
      }
      setTicket((prev) =>
        prev
          ? { ...prev, status: 'matched', duelId, opponentInfo: normalizedOpponent }
          : {
              userId: playerUid,
              displayName: playerName,
              photoURL: playerPhoto,
              level: playerLevel,
              district: playerDistrict,
              status: 'matched',
              matchAttemptId: matchAttemptIdRef.current || '',
              joinedAt: Date.now(),
              lastHeartbeat: Date.now(),
              expiresAt: Date.now() + 60_000,
              duelId,
              opponentInfo: normalizedOpponent,
              matchedAt: Date.now(),
            },
      )
    }
  }

  // 1. Iniciar tentativa de Matchmaking fresca (100% Real PVP)
  useEffect(() => {
    if (!isOpen || activeView !== 'matchmaking' || !authResolved || !isAuthenticated || !playerUid) {
      return
    }

    const currentAttemptId = crypto.randomUUID()
    matchAttemptIdRef.current = currentAttemptId
    matchedDuelIdRef.current = null

    setMmState('searching')
    setMatchedDuelId(null)
    setCountdown(null)
    setTicket(null)
    setSearchTimeSeconds(0)

    const playerObj = {
      uid: playerUid,
      displayName: playerPropsRef.current.playerName,
      photoURL: playerPropsRef.current.playerPhoto,
    }
    const profileObj = {
      level: playerPropsRef.current.playerLevel,
      district: playerPropsRef.current.playerDistrict,
    }

    console.log('[MATCH QUEUE JOINED (100% REAL PVP)] UID:', playerUid, 'Name:', playerObj.displayName, 'Attempt:', currentAttemptId)

    // Iniciar pesquisa no backend atómico / RPC
    const checkMatchServer = async () => {
      if (matchedDuelIdRef.current) return
      try {
        const res = await fetch('/api/duel/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: playerUid,
            displayName: playerPropsRef.current.playerName,
            photoURL: playerPropsRef.current.playerPhoto,
            level: playerPropsRef.current.playerLevel,
            district: playerPropsRef.current.playerDistrict,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'matched' && data.match_id) {
            console.log('[MATCH ATOMIC SERVER RPC RESULT: MATCHED] duelId:', data.match_id)
            handleMatchFound(data.match_id, data.opponentInfo)
          }
        }
      } catch (err) {
        console.warn('[/api/duel/match poll error]:', err)
      }
    }

    // Primeira chamada imediata
    checkMatchServer()

    // Intervalo de 1.0s para polling atómico do backend
    pollIntervalRef.current = setInterval(checkMatchServer, 1000)

    const handleBeforeUnload = () => {
      if (playerUid && !matchedDuelIdRef.current) {
        fetch('/api/duel/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: playerUid }),
        }).catch(() => {})
        cancelMatchmakingQueue(playerUid).catch(() => {})
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Escutar eventos da fila em tempo real (onSnapshot como canal paralelo ultra-rápido)
    const unsubscribe = subscribeToMatchmaking(playerUid, currentAttemptId, (updatedTicket) => {
      if (!updatedTicket) return
      if (updatedTicket.status === 'matched' && updatedTicket.duelId && updatedTicket.opponentInfo) {
        console.log('[MATCH NOTIFIED VIA REALTIME SNAPSHOT] duelId:', updatedTicket.duelId)
        handleMatchFound(updatedTicket.duelId, updatedTicket.opponentInfo, updatedTicket)
      }
    })

    // Contador de segundos e timeout rigoroso de 30 segundos
    searchTimerRef.current = setInterval(() => {
      setSearchTimeSeconds((s) => {
        const next = s + 1

        if (next >= 30) {
          console.log('[MATCHMAKING 30S TIMEOUT REACHED]')
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          if (searchTimerRef.current) clearInterval(searchTimerRef.current)

          setMmState('timeout')
          if (playerUid && !matchedDuelIdRef.current) {
            fetch('/api/duel/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: playerUid }),
            }).catch(() => {})
            cancelMatchmakingQueue(playerUid).catch(() => {})
          }
        }

        return next
      })
    }, 1000)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (searchTimerRef.current) clearInterval(searchTimerRef.current)
      unsubscribe()
      if (playerUid && !matchedDuelIdRef.current) {
        fetch('/api/duel/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: playerUid }),
        }).catch(() => {})
        cancelMatchmakingQueue(playerUid).catch(() => {})
      }
    }
  }, [isOpen, activeView, authResolved, isAuthenticated, playerUid, retryTrigger])

  // 2. Transição e Contagem Regressiva Isolada e Segura (3 -> 2 -> 1 -> Início Automático)
  const navigatedRef = useRef(false)

  useEffect(() => {
    if (!matchedDuelId) {
      navigatedRef.current = false
      return
    }

    console.log('[MATCH EFFECT] INICIANDO CONTAGEM REGRESSIVA PARA DUEL:', matchedDuelId)
    setCountdown(3)

    try {
      router.prefetch?.(`/jogar/duelo?id=${matchedDuelId}`)
    } catch {}

    const triggerGameStart = () => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      console.log('[MATCH GAME START] DISPATCHING GAME START NOW FOR DUEL:', matchedDuelId)

      setCountdown(0)

      if (onMatchStart) {
        onMatchStart(matchedDuelId)
      }

      router.push(`/jogar/duelo?id=${matchedDuelId}`)
      onClose()

      // Fallback de segurança se o router demorar
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.search.includes(matchedDuelId)) {
          console.log('[MATCH RESILIENT FALLBACK] window.location.assign...')
          window.location.assign(`/jogar/duelo?id=${matchedDuelId}`)
        }
      }, 500)
    }

    let c = 3
    const interval = setInterval(() => {
      c -= 1
      console.log('[COUNTDOWN TICK]:', c)
      if (c > 0) {
        setCountdown(c)
      } else {
        clearInterval(interval)
        triggerGameStart()
      }
    }, 1000)

    // Deadlock safety fallback: 4.2 segundos no máximo
    const deadlockFallback = setTimeout(() => {
      console.log('[DEADLOCK SAFETY FALLBACK TRIGGERED] 4.2s timeout')
      clearInterval(interval)
      triggerGameStart()
    }, 4200)

    return () => {
      clearInterval(interval)
      clearTimeout(deadlockFallback)
    }
  }, [matchedDuelId, router, onMatchStart, onClose])

  // Cancelar e fechar modal
  const handleCancel = async () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current)
      searchTimerRef.current = null
    }

    if (playerUid && !matchedDuelId) {
      fetch('/api/duel/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: playerUid }),
      }).catch(() => {})
      await cancelMatchmakingQueue(playerUid).catch(() => {})
    }
    onClose()
  }

  // Criar sala personalizada
  const handleCreateCustom = async () => {
    setCustomLoading(true)
    setCustomError(null)
    try {
      const res = await createDuel(currentPlayer, profile ?? undefined)
      onClose()
      router.push(`/jogar/duelo?id=${res.duelId}`)
    } catch (err: any) {
      setCustomError(err?.message || 'Erro ao criar sala de duelo.')
    } finally {
      setCustomLoading(false)
    }
  }

  // Entrar em sala personalizada com código
  const handleJoinCustom = async () => {
    if (!codeInputValue.trim()) {
      setCustomError('Por favor introduz o código da sala.')
      return
    }

    setCustomLoading(true)
    setCustomError(null)
    try {
      const res = await joinDuelByCode(codeInputValue, currentPlayer, profile ?? undefined)
      onClose()
      router.push(`/jogar/duelo?id=${res.duelId}`)
    } catch (err: any) {
      setCustomError(err?.message || 'Erro ao entrar no duelo.')
    } finally {
      setCustomLoading(false)
    }
  }

  if (!isOpen) return null

  if (authResolved && (!user || !user.uid)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
        <div className="card-game-purple relative w-full max-w-md rounded-4xl p-6 sm:p-8 shadow-2xl animate-scale-in text-center overflow-hidden border border-purple-500/50">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/20 cursor-pointer transition shadow-md"
          >
            ✕
          </button>

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40 shadow-xl shadow-purple-500/20">
            <Swords className="h-8 w-8" />
          </div>

          <div className="badge-hud mt-4 text-purple-300 border-purple-500/50 bg-purple-500/20 shadow-md shadow-purple-500/20">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Multiplayer 1v1 Online</span>
          </div>

          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black uppercase text-foreground text-glow-purple tracking-tight">
            Conta Obrigatória
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            O modo <strong>Duelo 1v1 em Direto</strong> decorre em tempo real entre contas reais para validação de estatísticas, subida no ranking nacional e atribuição de vitórias.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/entrar?redirect=/jogar/duelo"
              className="button-game-purple w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-purple-500/30"
            >
              <span>Entrar / Criar Conta</span>
            </Link>

            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/20 hover:text-foreground transition cursor-pointer"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="card-game-purple relative w-full max-w-lg rounded-4xl p-6 sm:p-8 shadow-2xl animate-scale-in text-center overflow-hidden border border-purple-500/50">
        {/* Luminous Glow Ambient Effects */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-500/25 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Header Close */}
        <button
          onClick={handleCancel}
          className="absolute top-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-2.5 text-muted-foreground hover:text-foreground hover:bg-white/20 cursor-pointer transition shadow-md"
        >
          ✕
        </button>

        {activeView === 'matchmaking' ? (
          /* ========================================================================= */
          /* VIEW 1: MATCHMAKING AUTOMÁTICO (SEARCHING & MATCHED) */
          /* ========================================================================= */
          <div>
            {mmState === 'searching' && (
              <>
                <div className="badge-hud text-purple-300 border-purple-500/50 bg-purple-500/20 shadow-md shadow-purple-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-80" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                  </span>
                  <span>Radar de Matchmaking Ativo</span>
                </div>

                <h2 className="mt-3.5 font-display text-2xl sm:text-4xl font-black uppercase text-foreground text-glow-purple tracking-tight">
                  À Procura de Adversário...
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                  A rastrear jogador real com nível semelhante em Portugal.
                </p>

                {/* TU 🆚 ??? ARENA STAGE WITH RADAR SONAR */}
                <div className="mt-6 flex items-center justify-center gap-3 sm:gap-6 rounded-3xl border border-white/15 bg-black/60 p-5 sm:p-7 backdrop-blur-xl shadow-inner">
                  {/* Player A (Me) */}
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="relative grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl bg-primary/25 text-primary font-black text-xl sm:text-2xl ring-2 ring-primary shadow-xl shadow-primary/30">
                      {playerName ? playerName.charAt(0).toUpperCase() : 'TU'}
                      <div className="absolute -inset-1 rounded-2xl border border-primary/40 animate-pulse" />
                    </div>
                    <span className="mt-2.5 font-display text-xs sm:text-sm font-black text-foreground truncate max-w-[110px]">
                      {playerName || 'Tu'} (Tu)
                    </span>
                    <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-[0.65rem] font-black text-primary mt-1">
                      Nível {playerLevel}
                    </span>
                  </div>

                  {/* VS Indicator with Sonar Radar */}
                  <div className="relative flex flex-col items-center justify-center px-2">
                    <div className="relative grid h-14 w-14 place-items-center">
                      <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-ping opacity-75" />
                      <div className="absolute -inset-2 rounded-full border border-dashed border-purple-400/40 animate-spin-slow" />
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-purple-500/20 border border-purple-400/60 shadow-lg shadow-purple-500/30">
                        <span className="font-display text-xs font-black uppercase text-purple-200">
                          VS
                        </span>
                      </div>
                    </div>
                    <span className="mt-1.5 font-mono text-[0.7rem] text-gold font-bold">
                      {searchTimeSeconds}s
                    </span>
                  </div>

                  {/* Player B (Searching Placeholder) */}
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="relative grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 text-purple-400/70 font-black text-2xl sm:text-3xl animate-pulse">
                      ?
                    </div>
                    <span className="mt-2.5 font-display text-xs sm:text-sm font-bold text-muted-foreground">
                      A procurar...
                    </span>
                    <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[0.65rem] font-bold text-muted-foreground mt-1">
                      Nível ~{playerLevel}
                    </span>
                  </div>
                </div>

                {/* Match Details HUD */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
                  <span className="text-gold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> 10 Perguntas
                  </span>
                  <span className="text-white/20">•</span>
                  <span>60s por Ronda</span>
                  <span className="text-white/20">•</span>
                  <span className="text-emerald-400">+300 XP Vitória</span>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleCancel}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-foreground hover:bg-white/20 transition cursor-pointer shadow-md"
                  >
                    Cancelar Procura
                  </button>

                  <button
                    onClick={() => setActiveView('custom_room')}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition py-1 cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Ou desafiar um amigo por código</span>
                  </button>
                </div>
              </>
            )}

            {/* STATE: MATCHED & COUNTDOWN (3... 2... 1...) */}
            {mmState === 'matched' && (
              <div className="py-4 animate-rise">
                <div className="badge-hud text-emerald-300 border-emerald-500/50 bg-emerald-500/20 shadow-lg shadow-emerald-500/25">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Adversário Encontrado!</span>
                </div>

                <h2 className="mt-3.5 font-display text-3xl sm:text-5xl font-black uppercase text-foreground text-glow-gold tracking-tight">
                  ⚔️ Confronto Pronto!
                </h2>

                {/* Clashing Cards */}
                <div className="mt-6 flex items-center justify-center gap-3 sm:gap-6 rounded-3xl border border-emerald-500/50 bg-black/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
                  {/* Player A */}
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <PlayerAvatar profile={profile ?? undefined} displayName={playerName || 'Tu'} isCurrentUser={true} size="lg" />
                    <span className="mt-2.5 font-display text-xs sm:text-sm font-black text-foreground truncate max-w-[110px]">
                      {playerName || 'Tu'}
                    </span>
                    <span className="rounded-full bg-primary/20 border border-primary/40 px-2.5 py-0.5 text-[0.65rem] font-bold text-primary mt-1">
                      Nível {playerLevel}
                    </span>
                  </div>

                  {/* Countdown Big Counter */}
                  <div className="flex flex-col items-center justify-center px-2 min-w-[90px]">
                    {countdown !== null && countdown > 0 ? (
                      <>
                        <span className="font-display text-5xl sm:text-7xl font-black text-gold text-glow-gold animate-bounce">
                          {countdown}
                        </span>
                        <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground mt-1">
                          A começar...
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="h-10 w-10 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
                        <span className="text-[0.65rem] font-black uppercase tracking-wider text-gold mt-2 animate-pulse whitespace-nowrap">
                          A entrar...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Player B (Opponent) */}
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <PlayerAvatar displayName={ticket?.opponentInfo?.displayName || 'Adversário'} size="lg" />
                    <span className="mt-2.5 font-display text-xs sm:text-sm font-black text-foreground truncate max-w-[110px]">
                      {ticket?.opponentInfo?.displayName || 'Adversário'}
                    </span>
                    <span className="rounded-full bg-gold/20 border border-gold/40 px-2.5 py-0.5 text-[0.65rem] font-bold text-gold mt-1">
                      Nível {ticket?.opponentInfo?.level || 1}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STATE: TIMEOUT (30 SEGUNDOS SEM ADVERSÁRIO) */}
            {mmState === 'timeout' && (
              <div className="py-2 animate-rise">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40 shadow-xl shadow-amber-500/20">
                  <Clock className="h-8 w-8" />
                </div>

                <div className="badge-hud mt-4 text-amber-300 border-amber-500/50 bg-amber-500/20 shadow-md shadow-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Tempo de Espera Esgotado (30s)</span>
                </div>

                <h2 className="mt-3.5 font-display text-2xl sm:text-3xl font-black uppercase text-foreground text-glow-gold tracking-tight">
                  Nenhum Adversário Encontrado
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Nenhum adversário encontrado de momento. Faz refresh ou tenta novamente dentro de instantes!
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMmState('searching')
                      setRetryTrigger((prev) => prev + 1)
                    }}
                    className="button-game-purple w-full inline-flex items-center justify-center gap-2.5 rounded-2xl py-3.5 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-purple-500/30 hover:scale-102 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Tentar Novamente / Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      router.push('/jogar')
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 py-3 font-display text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/20 hover:text-foreground transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar à Central</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (

          /* ========================================================================= */
          /* VIEW 2: DESAFIAR UM AMIGO COM CÓDIGO (OPÇÃO SECUNDÁRIA) */
          /* ========================================================================= */
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-left">
                <Users className="h-5 w-5 text-purple-400" />
                <h4 className="font-display text-lg font-black text-foreground">
                  Desafiar um Amigo
                </h4>
              </div>
              <button
                onClick={() => setActiveView('matchmaking')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition"
              >
                ← Voltar ao Matchmaking
              </button>
            </div>

            {customError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-flag-red/40 bg-flag-red/10 p-3 text-xs text-flag-red font-bold text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{customError}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5">
              <button
                onClick={() => {
                  setCustomTab('create')
                  setCustomError(null)
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer',
                  customTab === 'create'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <PlusCircle className="h-4 w-4" />
                Criar Sala
              </button>
              <button
                onClick={() => {
                  setCustomTab('join')
                  setCustomError(null)
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer',
                  customTab === 'join'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <KeyRound className="h-4 w-4" />
                Entrar com Código
              </button>
            </div>

            {customTab === 'create' ? (
              <div className="mt-5 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Gera um código único de sala (ex: <strong className="text-gold font-bold">AP-7K42</strong>) para enviares ao teu amigo.
                </p>
                <button
                  onClick={handleCreateCustom}
                  disabled={customLoading}
                  className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-purple-600/30 hover:brightness-110 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {customLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <Swords className="h-4 w-4" />
                      <span>Gerar Código de Sala</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-5 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Introduz o código que o teu amigo te enviou:
                </p>
                <input
                  type="text"
                  value={codeInputValue}
                  onChange={(e) => setCodeInputValue(e.target.value.toUpperCase())}
                  placeholder="Ex: AP-7K42"
                  maxLength={10}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-center font-mono text-xl font-black uppercase tracking-widest text-gold placeholder:text-white/20 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleJoinCustom}
                  disabled={customLoading || !codeInputValue.trim()}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-purple-600/30 hover:brightness-110 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {customLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>Entrar no Duelo</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
