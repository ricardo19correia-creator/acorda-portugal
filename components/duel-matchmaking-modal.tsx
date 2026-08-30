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
import { signInAnonymously } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { PlayerAvatar } from '@/components/player-avatar'
import {
  type MatchmakingTicket,
  type DuelPlayerData,
  findOrCreateMatchmakingRoom,
  checkAndJoinWaitingRoom,
  subscribeToWaitingRoom,
  cancelWaitingRoom,
  sendRoomHeartbeat,
  createDuel,
  joinDuelByCode,
  resolveUserAvatar,
} from '@/lib/duel'
import { OFFICIAL_ARENAS, getArenaById, type Arena } from '@/data/shopArenas'
import { getArenaAssets, getArenaShopImage, getArenaDuelBackground } from '@/lib/arena-assets'
import { cn } from '@/lib/utils'

interface DuelMatchmakingModalProps {
  isOpen: boolean
  onClose: () => void
  onMatchStart?: (duelId: string) => void
}

export function DuelMatchmakingModal({ isOpen, onClose, onMatchStart }: DuelMatchmakingModalProps) {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()

  // Sessão Única por Separador/Browser para impedir colisões em testes locais ou convidados
  const [sessionGuestId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let saved = sessionStorage.getItem('guest_duel_session_id')
      if (!saved) {
        saved = `guest_${Math.random().toString(36).substring(2, 9)}`
        sessionStorage.setItem('guest_duel_session_id', saved)
      }
      return saved
    }
    return `guest_${Date.now()}`
  })

  const [playAsGuest, setPlayAsGuest] = useState(false)

  // Assegurar token autenticado anónimo para convidados no Firebase
  useEffect(() => {
    if (isOpen && authResolved && !auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        console.warn('[Matchmaking Auth] Anonymous login notice:', err)
      })
    }
  }, [isOpen, authResolved])

  const isAccountUser = authResolved && !!user?.uid
  const canEnterMatchmaking = isAccountUser || playAsGuest

  const playerUid = user?.uid || auth.currentUser?.uid || sessionGuestId
  const playerName = profile?.displayName || user?.displayName || (playAsGuest ? `Convidado #${sessionGuestId.slice(-4)}` : 'Jogador')
  const playerPhoto = resolveUserAvatar(user, profile)
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

  // Arena states
  const [selectedArenaId, setSelectedArenaId] = useState<string>('arena_1')
  const [showArenaPicker, setShowArenaPicker] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('equipped_arena') || 'arena_1'
      setSelectedArenaId(saved)
    }
  }, [isOpen])

  const selectedArena = useMemo(() => {
    return getArenaById(selectedArenaId) || OFFICIAL_ARENAS[0]
  }, [selectedArenaId])

  // Refs de sincronização e cleanup estrito
  const waitingRoomIdRef = useRef<string | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const roomUnsubscribeRef = useRef<(() => void) | null>(null)
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
    console.log('[Matchmaking] Room joined:', duelId, 'Adversário:', opponentInfo?.displayName)
    matchedDuelIdRef.current = duelId
    setMatchedDuelId(duelId)
    setMmState('matched')

    // Limpar imediatamente todos os timers e subscrições de busca
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current)
      searchTimerRef.current = null
    }
    if (roomUnsubscribeRef.current) {
      roomUnsubscribeRef.current()
      roomUnsubscribeRef.current = null
    }

    if (incomingTicket) {
      setTicket(incomingTicket)
    } else if (opponentInfo) {
      const oppPhoto =
        opponentInfo.photoURL ||
        (opponentInfo as any).avatarUrl ||
        (opponentInfo as any).avatar ||
        null
      const normalizedOpponent = {
        uid: (opponentInfo as any).uid || (opponentInfo as any).id || 'opponent_id',
        playerType: (opponentInfo as any).playerType || 'npc',
        isNpc: (opponentInfo as any).isNpc ?? true,
        displayName: opponentInfo.displayName,
        photoURL: oppPhoto,
        level: opponentInfo.level ?? 1,
        xp: (opponentInfo as any).xp ?? 25000,
        elo: (opponentInfo as any).elo ?? (opponentInfo as any).rating ?? 1000,
        district: opponentInfo.district ?? 'Lisboa',
      }
      setTicket({
        userId: playerUid,
        displayName: playerName,
        photoURL: playerPhoto,
        level: playerLevel,
        district: playerDistrict,
        status: 'matched',
        matchAttemptId: duelId,
        joinedAt: Date.now(),
        lastHeartbeat: Date.now(),
        expiresAt: Date.now() + 60_000,
        duelId,
        opponentInfo: normalizedOpponent,
        matchedAt: Date.now(),
      })
    }
  }

  // 1. Iniciar tentativa de Matchmaking fresca (Atomic 100% Real PVP)
  useEffect(() => {
    if (!isOpen || activeView !== 'matchmaking' || !authResolved || !canEnterMatchmaking || !playerUid) {
      return
    }

    matchedDuelIdRef.current = null
    waitingRoomIdRef.current = null

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

    console.log('[Matchmaking] A iniciar busca de partida para:', playerUid, `(${playerObj.displayName})`)

    let isSubscribed = true

    const startMatchFlow = async () => {
      if (!isSubscribed || matchedDuelIdRef.current) return
      try {
        const res = await findOrCreateMatchmakingRoom(playerObj, profileObj, {
          arenaId: selectedArena.id,
          arenaImage: selectedArena.duelBackground || selectedArena.imagePath || selectedArena.image,
          arenaName: selectedArena.name,
        })
        if (!isSubscribed || matchedDuelIdRef.current) {
          // Se já cancelado ou emparelhado, limpar se foi criada sala
          if (res.role === 'host' && !res.matched) {
            cancelWaitingRoom(res.roomId, playerUid).catch(() => {})
          }
          return
        }

        if (res.matched && res.opponent) {
          // Entrou como Convidado (Player 2)
          console.log('[Matchmaking] Room joined as Player 2:', res.roomId, 'Host:', res.opponent.displayName)
          handleMatchFound(res.roomId, res.opponent)
        } else if (res.role === 'host') {
          // Criou a sala como Host (Player 1), subscrever em tempo real via onSnapshot
          waitingRoomIdRef.current = res.roomId
          console.log('[Matchmaking] Room created as Player 1:', res.roomId, 'Aguardando adversário...')

          // Subscrever às atualizações da sala
          if (roomUnsubscribeRef.current) {
            roomUnsubscribeRef.current()
          }

          roomUnsubscribeRef.current = subscribeToWaitingRoom(
            res.roomId,
            (matchedDuel, opponent) => {
              if (!isSubscribed || matchedDuelIdRef.current) return
              console.log('[Matchmaking] Adversário entrou na sala:', opponent.displayName, 'Room:', res.roomId)
              handleMatchFound(res.roomId, opponent)
            },
            () => {
              // Sala cancelada ou removida
            },
          )

          // Enviar heartbeat e resolução de emparelhamento a cada 2.5 segundos
          heartbeatIntervalRef.current = setInterval(async () => {
            if (!isSubscribed || matchedDuelIdRef.current || !waitingRoomIdRef.current) return
            
            // 1. Manter heartbeat ativo
            sendRoomHeartbeat(waitingRoomIdRef.current).catch(() => {})

            // 2. Verificar se outro host criou sala em simultâneo (tie-breaker determinístico)
            try {
              const checkRes = await checkAndJoinWaitingRoom(playerObj, profileObj, waitingRoomIdRef.current)
              if (checkRes.matched && checkRes.opponent && checkRes.roomId) {
                console.log('[Matchmaking] Host resolvido em tempo real -> Sala:', checkRes.roomId, 'Adversário:', checkRes.opponent.displayName)
                waitingRoomIdRef.current = null
                handleMatchFound(checkRes.roomId, checkRes.opponent)
              }
            } catch (pollErr) {
              console.warn('[Matchmaking] Notice na verificação de sala:', pollErr)
            }
          }, 2500)
        }
      } catch (err) {
        console.error('[Matchmaking] Erro ao iniciar matchmaking:', err)
      }
    }

    startMatchFlow()

    // 2. POLLING HTTP FORÇADO A CADA 1.5 SEGUNDOS (Fallback à prova de falhas para Vercel Serverless / Mobile)
    pollIntervalRef.current = setInterval(async () => {
      if (!isSubscribed || matchedDuelIdRef.current) return
      try {
        const queryParams = new URLSearchParams({
          userId: playerUid,
          name: playerPropsRef.current.playerName,
          photo: playerPropsRef.current.playerPhoto || '',
          level: String(playerPropsRef.current.playerLevel),
          district: playerPropsRef.current.playerDistrict,
          arenaId: selectedArena.id,
          arenaImage: selectedArena.duelBackground || selectedArena.imagePath || selectedArena.image || '',
          arenaName: selectedArena.name,
        })
        const res = await fetch(`/api/matchmaking/status?${queryParams.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'matched' && data.match_id && !matchedDuelIdRef.current) {
            console.log('[Matchmaking Engine] Match detectado via Polling HTTP Fallback:', data.match_id, data.opponentInfo)
            handleMatchFound(data.match_id, data.opponentInfo || {
              displayName: 'Adversário',
              photoURL: null,
              level: 1,
              district: 'Portugal',
            })
          }
        }
      } catch (pollErr) {
        console.warn('[Matchmaking Polling Notice]:', pollErr)
      }
    }, 1500)

    const handleBeforeUnload = () => {
      if (waitingRoomIdRef.current && !matchedDuelIdRef.current) {
        cancelWaitingRoom(waitingRoomIdRef.current, playerUid).catch(() => {})
        fetch('/api/duel/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: playerUid, duelId: waitingRoomIdRef.current }),
        }).catch(() => {})
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Contador de segundos de busca por adversário humano real
    searchTimerRef.current = setInterval(() => {
      setSearchTimeSeconds((s) => {
        const next = s + 1

        if (next >= 30) {
          console.log('[Matchmaking] Tempo limite de 30 segundos atingido sem outros jogadores humanos na fila.')
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
          if (searchTimerRef.current) clearInterval(searchTimerRef.current)
          if (roomUnsubscribeRef.current) {
            roomUnsubscribeRef.current()
            roomUnsubscribeRef.current = null
          }

          setMmState('timeout')
          if (waitingRoomIdRef.current && !matchedDuelIdRef.current) {
            cancelWaitingRoom(waitingRoomIdRef.current, playerUid).catch(() => {})
            waitingRoomIdRef.current = null
          }
        }

        return next
      })
    }, 1000)

    return () => {
      isSubscribed = false
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      if (searchTimerRef.current) clearInterval(searchTimerRef.current)
      if (roomUnsubscribeRef.current) {
        roomUnsubscribeRef.current()
        roomUnsubscribeRef.current = null
      }
      if (waitingRoomIdRef.current && !matchedDuelIdRef.current) {
        cancelWaitingRoom(waitingRoomIdRef.current, playerUid).catch(() => {})
        waitingRoomIdRef.current = null
      }
    }
  }, [isOpen, activeView, authResolved, canEnterMatchmaking, playerUid, retryTrigger])

  // 2. Transição e Contagem Regressiva Isolada e Segura (3 -> 2 -> 1 -> Início Automático)
  const navigatedRef = useRef(false)

  useEffect(() => {
    if (!matchedDuelId) {
      navigatedRef.current = false
      return
    }

    console.log('[Matchmaking] Confronto pronto! A iniciar contagem regressiva para duelId:', matchedDuelId)
    setCountdown(3)

    try {
      router.prefetch?.(`/jogar/duelo?id=${matchedDuelId}`)
    } catch {}

    const triggerGameStart = () => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      console.log('[Matchmaking] Game starting:', matchedDuelId)

      setCountdown(0)

      if (onMatchStart) {
        onMatchStart(matchedDuelId)
      }

      router.push(`/jogar/duelo?id=${matchedDuelId}`)
      onClose()

      // Fallback de segurança se o router demorar
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.search.includes(matchedDuelId)) {
          console.log('[Matchmaking] Fallback de navegação window.location.assign...')
          window.location.assign(`/jogar/duelo?id=${matchedDuelId}`)
        }
      }, 500)
    }

    let c = 3
    const interval = setInterval(() => {
      c -= 1
      if (c > 0) {
        setCountdown(c)
      } else {
        clearInterval(interval)
        triggerGameStart()
      }
    }, 1000)

    // Deadlock safety fallback: 4.2 segundos no máximo
    const deadlockFallback = setTimeout(() => {
      console.log('[Matchmaking] Fallback de segurança de 4.2s acionado')
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
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current)
      searchTimerRef.current = null
    }
    if (roomUnsubscribeRef.current) {
      roomUnsubscribeRef.current()
      roomUnsubscribeRef.current = null
    }

    if (!matchedDuelId) {
      if (waitingRoomIdRef.current) {
        await cancelWaitingRoom(waitingRoomIdRef.current, playerUid).catch(() => {})
        waitingRoomIdRef.current = null
      }
      fetch('/api/duel/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: playerUid }),
      }).catch(() => {})
    }
    onClose()
  }

  // Criar sala personalizada
  const handleCreateCustom = async () => {
    setCustomLoading(true)
    setCustomError(null)
    try {
      const res = await createDuel(currentPlayer, profile ?? undefined, {
        arenaId: selectedArena.id,
        arenaImage: selectedArena.duelBackground || selectedArena.imagePath || selectedArena.image,
        arenaName: selectedArena.name,
      })
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

  if (authResolved && !canEnterMatchmaking && (!user || !user.uid)) {
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
            Login Obrigatório para 1v1
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Para disputar partidas multiplayer 1v1, acumular vitórias e subir na classificação nacional, precisas de iniciar sessão.
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

                {/* SELETOR DE ARENA COM PREVIEW DAS 10 IMAGENS */}
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-10 w-14 rounded-lg bg-cover bg-center border border-white/20 shadow-md shrink-0"
                        style={{
                          backgroundImage: `url('${selectedArena.shopImage || selectedArena.imagePath || selectedArena.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">Arena</span>
                          <span className={cn('rounded px-1.5 py-0.5 text-[0.6rem] font-black', selectedArena.badgeColor || 'text-emerald-400 bg-emerald-500/10')}>
                            {selectedArena.rarity}
                          </span>
                        </div>
                        <p className="font-display text-xs font-black text-foreground truncate">{selectedArena.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowArenaPicker(!showArenaPicker)}
                      className="rounded-xl border border-purple-500/40 bg-purple-500/20 px-2.5 py-1.5 text-[0.7rem] font-bold text-purple-300 hover:bg-purple-500/30 transition cursor-pointer shrink-0"
                    >
                      {showArenaPicker ? 'Fechar' : 'Mudar Arena'}
                    </button>
                  </div>

                  {/* Grelha de Seleção das 10 Arenas Oficiais */}
                  {showArenaPicker && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {OFFICIAL_ARENAS.map((arena) => {
                        const isSelected = arena.id === selectedArena.id
                        return (
                          <button
                            key={arena.id}
                            type="button"
                            onClick={() => {
                              setSelectedArenaId(arena.id)
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('equipped_arena', arena.id)
                                localStorage.setItem('equipped_arena_image', arena.gameBackground || arena.image || '')
                                window.dispatchEvent(new Event('arenaChanged'))
                              }
                              setShowArenaPicker(false)
                            }}
                            className={cn(
                              'group relative rounded-xl overflow-hidden border p-1 text-left transition flex flex-col items-center cursor-pointer',
                              isSelected
                                ? 'border-purple-400 ring-2 ring-purple-400/60 bg-purple-500/20'
                                : 'border-white/10 bg-black/40 hover:border-white/30'
                            )}
                          >
                            <div
                              className="h-12 w-full rounded-lg bg-cover bg-center border border-white/10 group-hover:scale-105 transition"
                              style={{
                                backgroundImage: `url('${arena.shopImage || arena.imagePath || arena.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                              }}
                            />
                            <span className="mt-1 font-display text-[0.65rem] font-black text-foreground truncate w-full text-center">
                              {arena.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Match Details HUD */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground font-bold">
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
                    <PlayerAvatar
                      profile={profile ?? undefined}
                      photoURL={playerPhoto}
                      displayName={playerName || 'Tu'}
                      isCurrentUser={true}
                      size="lg"
                    />
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
                    <PlayerAvatar
                      photoURL={ticket?.opponentInfo?.photoURL || (ticket?.opponentInfo as any)?.avatarUrl || (ticket?.opponentInfo as any)?.avatar}
                      displayName={ticket?.opponentInfo?.displayName || 'Adversário'}
                      isCurrentUser={false}
                      size="lg"
                    />
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

                {/* SELETOR DE ARENA PARA SALA PERSONALIZADA */}
                <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-md text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-10 w-14 rounded-lg bg-cover bg-center border border-white/20 shadow-md shrink-0"
                        style={{
                          backgroundImage: `url('${selectedArena.shopImage || selectedArena.imagePath || selectedArena.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      />
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider">Arena</span>
                          <span className={cn('rounded px-1.5 py-0.5 text-[0.6rem] font-black', selectedArena.badgeColor || 'text-emerald-400 bg-emerald-500/10')}>
                            {selectedArena.rarity}
                          </span>
                        </div>
                        <p className="font-display text-xs font-black text-foreground truncate">{selectedArena.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowArenaPicker(!showArenaPicker)}
                      className="rounded-xl border border-purple-500/40 bg-purple-500/20 px-2.5 py-1.5 text-[0.7rem] font-bold text-purple-300 hover:bg-purple-500/30 transition cursor-pointer shrink-0"
                    >
                      {showArenaPicker ? 'Fechar' : 'Mudar Arena'}
                    </button>
                  </div>

                  {/* Grelha de Seleção */}
                  {showArenaPicker && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                      {OFFICIAL_ARENAS.map((arena) => {
                        const isSelected = arena.id === selectedArena.id
                        return (
                          <button
                            key={arena.id}
                            type="button"
                            onClick={() => {
                              setSelectedArenaId(arena.id)
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('equipped_arena', arena.id)
                                localStorage.setItem('equipped_arena_image', arena.gameBackground || arena.image || '')
                                window.dispatchEvent(new Event('arenaChanged'))
                              }
                              setShowArenaPicker(false)
                            }}
                            className={cn(
                              'group relative rounded-xl overflow-hidden border p-1 text-left transition flex flex-col items-center cursor-pointer',
                              isSelected
                                ? 'border-purple-400 ring-2 ring-purple-400/60 bg-purple-500/20'
                                : 'border-white/10 bg-black/40 hover:border-white/30'
                            )}
                          >
                            <div
                              className="h-12 w-full rounded-lg bg-cover bg-center border border-white/10 group-hover:scale-105 transition"
                              style={{
                                backgroundImage: `url('${arena.shopImage || arena.imagePath || arena.image}')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                              }}
                            />
                            <span className="mt-1 font-display text-[0.65rem] font-black text-foreground truncate w-full text-center">
                              {arena.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

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
