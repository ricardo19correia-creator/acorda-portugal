'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Gamepad2,
  ChevronRight,
  Trophy,
  Clock,
  Medal,
  Award,
  Flame,
  Shield,
  AlertCircle,
  CheckCircle2,
  Star,
  Target,
  ArrowRight,
  Gift,
  HelpCircle,
  Swords,
  Layers,
  Crown,
  Zap,
  Radio,
  Compass,
} from 'lucide-react'
import { PlayerAvatar } from '@/components/player-avatar'
import { useAuth } from '@/components/auth-provider'
import { PortoLisboaTeamSelectModal } from './PortoLisboaTeamSelectModal'
import {
  subscribeEventRanking,
  subscribeUserEventProgress,
  subscribeOfficialEvent,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  getDailyMatchesCount,
  getLisbonDateString,
  sortEventParticipants,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_PORTO_LISBOA_SLUG,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  type OfficialEventConfig,
  type EventParticipant,
  type CountdownDetails,
  type EventTeamId,
} from '@/lib/events-service'
import { cn, safeRandomUUID } from '@/lib/utils'

export function PortoLisboaEvent({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter()
  const { user, profile } = useAuth()

  // Configuração oficial do evento Porto vs Lisboa
  const [eventConfig, setEventConfig] = useState<OfficialEventConfig>(
    OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
  )
  const [ranking, setRanking] = useState<EventParticipant[]>([])
  const [userProgress, setUserProgress] = useState<EventParticipant | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingLoading, setRankingLoading] = useState(true)

  // Escolha de equipa e filtros de ranking
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false)
  const [rankingFilter, setRankingFilter] = useState<'all' | 'porto' | 'lisboa'>('all')

  // Relógio do servidor e compensação de tempo (skew)
  const [serverClockSkewMs, setServerClockSkewMs] = useState<number>(0)
  const [nowDate, setNowDate] = useState<Date>(() => new Date())

  // Estado de resgate de recompensas
  const [claiming, setClaiming] = useState(false)
  const [claimFeedback, setClaimFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 1. Sincronizar relógio e dados iniciais via API
  useEffect(() => {
    let isMounted = true

    const syncEventData = async () => {
      try {
        const headers: Record<string, string> = {}
        if (user) {
          try {
            const token = await user.getIdToken()
            if (token) headers['Authorization'] = `Bearer ${token}`
          } catch {}
        }

        const res = await fetch(`/api/events?eventId=${OFFICIAL_PORTO_LISBOA_ID}`, {
          cache: 'no-store',
          headers,
        })

        if (res.ok && isMounted) {
          const data = await res.json()
          if (data) {
            if (data.serverTimestampMs) {
              const clientNow = Date.now()
              const skew = data.serverTimestampMs - clientNow
              setServerClockSkewMs(skew)
              setNowDate(new Date(clientNow + skew))
            }
            if (data.event) {
              setEventConfig(data.event)
            }
            if (Array.isArray(data.ranking) && data.ranking.length > 0) {
              setRanking((prev) => (prev.length === 0 ? data.ranking : prev))
              setRankingLoading(false)
            }
            if (data.userProgress) {
              setUserProgress((prev) => prev || data.userProgress)
            }
          }
        }
      } catch (err) {
        console.warn('[PORTO_LISBOA] Aviso ao sincronizar dados do servidor:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void syncEventData()
    return () => {
      isMounted = false
    }
  }, [user])

  // 2. Ticker de 1 segundo sincronizado
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date(Date.now() + serverClockSkewMs))
    }, 1000)
    return () => clearInterval(timer)
  }, [serverClockSkewMs])

  // 3. Subscrição em tempo real ao Ranking oficial
  useEffect(() => {
    setRankingLoading(true)
    const unsubscribe = subscribeEventRanking(OFFICIAL_PORTO_LISBOA_ID, (participants) => {
      setRanking(participants)
      setRankingLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 4. Subscrição em tempo real ao progresso individual do utilizador
  useEffect(() => {
    if (!user?.uid) {
      setUserProgress(null)
      return
    }
    const unsubscribe = subscribeUserEventProgress(
      user.uid,
      OFFICIAL_PORTO_LISBOA_ID,
      (progress) => {
        if (progress) {
          setUserProgress(progress)
        }
      }
    )
    return () => unsubscribe()
  }, [user?.uid])

  // 5. Subscrição em tempo real e dedicada aos dados do evento oficial (equipa, pontos e jogadores)
  useEffect(() => {
    const unsubscribe = subscribeOfficialEvent(OFFICIAL_PORTO_LISBOA_ID, (updatedEvent) => {
      if (updatedEvent) {
        setEventConfig((prev) => ({
          ...prev,
          ...updatedEvent,
          teams: updatedEvent.teams || prev.teams || OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.teams,
        }))
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Estado e Contagem Decrescente
  const dynamicStatus = useMemo(() => {
    return getEventStatus(eventConfig, nowDate) || 'active'
  }, [eventConfig, nowDate])

  const dynamicStatusLabel = useMemo(() => {
    return getEventStatusLabel(dynamicStatus)
  }, [dynamicStatus])

  const countdown = useMemo(() => {
    return getEventCountdown(eventConfig, nowDate)
  }, [eventConfig, nowDate])

  // Identidade da Equipa do Utilizador e Estatísticas do Duelo
  const userTeam: EventTeamId | null = (userProgress?.team as EventTeamId) || null

  const portoTeamStats =
    eventConfig.teams?.porto || OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.teams!.porto
  const lisboaTeamStats =
    eventConfig.teams?.lisboa || OFFICIAL_EVENT_CONFIG_PORTO_LISBOA.teams!.lisboa

  const totalTeamPoints = (portoTeamStats.points || 0) + (lisboaTeamStats.points || 0)
  const portoPercentage =
    totalTeamPoints > 0
      ? Math.round(((portoTeamStats.points || 0) / totalTeamPoints) * 100)
      : 50
  const lisboaPercentage = 100 - portoPercentage

  const winningTeam: 'porto' | 'lisboa' | 'draw' =
    portoTeamStats.points > lisboaTeamStats.points
      ? 'porto'
      : lisboaTeamStats.points > portoTeamStats.points
      ? 'lisboa'
      : 'draw'

  // Ranking unificado e posição autoritativa
  const effectiveRanking = useMemo(() => {
    if (!userProgress || !userProgress.userId) return ranking
    const exists = ranking.some((p) => p.userId === userProgress.userId)
    const userPts =
      userProgress.totalPoints ?? userProgress.eventPoints ?? userProgress.points ?? 0
    const userMatches =
      userProgress.gamesPlayed ?? userProgress.totalMatches ?? userProgress.countedMatches ?? 0
    if (!exists && (userPts > 0 || userMatches > 0)) {
      return sortEventParticipants([...ranking, userProgress])
    }
    return ranking
  }, [ranking, userProgress])

  // Filtragem do ranking por equipa
  const portoParticipants = useMemo(() => {
    return effectiveRanking.filter((p) => p.team === 'porto')
  }, [effectiveRanking])

  const lisboaParticipants = useMemo(() => {
    return effectiveRanking.filter((p) => p.team === 'lisboa')
  }, [effectiveRanking])

  const filteredRanking = useMemo(() => {
    if (rankingFilter === 'porto') return portoParticipants
    if (rankingFilter === 'lisboa') return lisboaParticipants
    return effectiveRanking
  }, [rankingFilter, portoParticipants, lisboaParticipants, effectiveRanking])

  const portoLeader = portoParticipants[0] || null
  const lisboaLeader = lisboaParticipants[0] || null

  const userRankIndex = useMemo(() => {
    if (!user?.uid || effectiveRanking.length === 0) return -1
    return effectiveRanking.findIndex((p) => p.userId === user.uid)
  }, [user?.uid, effectiveRanking])

  const userRankPosition = useMemo(() => {
    if (userRankIndex >= 0) return userRankIndex + 1
    const userPts =
      userProgress?.totalPoints ?? userProgress?.eventPoints ?? userProgress?.points ?? 0
    const userMatches =
      userProgress?.gamesPlayed ?? userProgress?.totalMatches ?? userProgress?.countedMatches ?? 0
    if (userPts > 0 || userMatches > 0) {
      return effectiveRanking.length > 0 ? effectiveRanking.length + 1 : 1
    }
    return null
  }, [userRankIndex, userProgress, effectiveRanking.length])

  // Posição do jogador dentro da sua própria equipa
  const userTeamRankPosition = useMemo(() => {
    if (!user?.uid || !userTeam) return null
    const list = userTeam === 'porto' ? portoParticipants : lisboaParticipants
    const idx = list.findIndex((p) => p.userId === user.uid)
    return idx >= 0 ? idx + 1 : null
  }, [user?.uid, userTeam, portoParticipants, lisboaParticipants])

  // Partidas do dia no fuso Europe/Lisbon
  const lisbonToday = useMemo(() => getLisbonDateString(nowDate), [nowDate])
  const dailyMatchesToday = useMemo(() => {
    return getDailyMatchesCount(userProgress, lisbonToday)
  }, [userProgress, lisbonToday])

  const maxDailyMatches = eventConfig.rules?.maxDailyMatches || 10
  const dailyLimitReached = dailyMatchesToday >= maxDailyMatches

  // Estatísticas calculadas do utilizador
  const userStats = useMemo(() => {
    const totalMatches =
      userProgress?.gamesPlayed ?? userProgress?.totalMatches ?? 0
    const eventPoints =
      userProgress?.totalPoints ?? userProgress?.eventPoints ?? userProgress?.points ?? 0
    const correctAnswers = userProgress?.correctAnswers || 0
    const incorrectAnswers = userProgress?.incorrectAnswers || 0
    const totalAnswered =
      userProgress?.questionsAnswered || correctAnswers + incorrectAnswers
    const accuracy =
      totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    const bestScore = userProgress?.bestScore || 0

    return {
      totalMatches,
      eventPoints,
      correctAnswers,
      incorrectAnswers,
      totalAnswered,
      accuracy,
      bestScore,
    }
  }, [userProgress])

  // Início oficial da partida do Grande Duelo (com verificação de equipa)
  const handleStartMatch = useCallback(() => {
    if (!user) {
      router.push('/entrar?redirect=/eventos/porto-vs-lisboa')
      return
    }
    // Se o utilizador ainda não tiver escolhido equipa, abrir modal de escolha
    if (!userTeam) {
      setShowTeamSelectModal(true)
      return
    }
    const matchId = safeRandomUUID()
    const targetUrl = `/jogar?cat=porto-vs-lisboa&gameType=event&event=${OFFICIAL_PORTO_LISBOA_ID}&eventId=${OFFICIAL_PORTO_LISBOA_ID}&eventSlug=${OFFICIAL_PORTO_LISBOA_SLUG}&game=${matchId}`
    try {
      router.push(targetUrl)
    } catch (navErr) {
      console.warn('[NAV_FALLBACK] router.push falhou, fallback window.location:', navErr)
      if (typeof window !== 'undefined') {
        window.location.href = targetUrl
      }
    }
  }, [user, userTeam, router])

  // Callback acionado após confirmar escolha de equipa com sucesso no backend
  const handleTeamSelected = useCallback(
    (chosenTeam: EventTeamId) => {
      setShowTeamSelectModal(false)
      setUserProgress((prev) =>
        prev
          ? { ...prev, team: chosenTeam }
          : ({
              userId: user?.uid || '',
              displayName: user?.displayName || 'Jogador',
              team: chosenTeam,
              totalPoints: 0,
              eventPoints: 0,
              points: 0,
              gamesPlayed: 0,
              totalMatches: 0,
              countedMatches: 0,
            } as any)
      )
      // Entrar diretamente na primeira partida do Grande Duelo
      const matchId = safeRandomUUID()
      const targetUrl = `/jogar?cat=porto-vs-lisboa&gameType=event&event=${OFFICIAL_PORTO_LISBOA_ID}&eventId=${OFFICIAL_PORTO_LISBOA_ID}&eventSlug=${OFFICIAL_PORTO_LISBOA_SLUG}&game=${matchId}`
      try {
        router.push(targetUrl)
      } catch (navErr) {
        console.warn('[NAV_FALLBACK] router.push falhou, fallback window.location:', navErr)
        if (typeof window !== 'undefined') {
          window.location.href = targetUrl
        }
      }
    },
    [user, router]
  )

  // Reivindicação de Recompensa
  const canClaimReward =
    dynamicStatus === 'ended' &&
    ((userRankPosition !== null && userRankPosition <= 3) || (userStats.totalMatches >= 5)) &&
    Boolean(user?.uid)

  const handleClaimReward = async () => {
    if (!user || claiming) return
    setClaiming(true)
    setClaimFeedback(null)
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/events/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ eventId: OFFICIAL_PORTO_LISBOA_ID }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setClaimFeedback({
          type: 'success',
          text: data.message || 'Recompensa creditada com sucesso na tua conta!',
        })
      } else {
        setClaimFeedback({
          type: 'error',
          text: data.error || 'Erro ao resgatar recompensa.',
        })
      }
    } catch (err: any) {
      setClaimFeedback({
        type: 'error',
        text: err?.message || 'Erro de comunicação ao servidor.',
      })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div
      className={cn(
        embedded
          ? 'w-full space-y-8 sm:space-y-12'
          : 'w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12 select-none'
      )}
    >
      {/* ========================================================================= */}
      {/* 1. HERO CINEMATOGRÁFICO: O GRANDE DUELO (IDENTIDADE AZUL × VERMELHA)       */}
      {/* ========================================================================= */}
      <section
        aria-label="Porto × Lisboa — O Grande Duelo"
        className={cn(
          'relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#060e22]/98 via-[#040817]/98 to-[#02040b] backdrop-blur-2xl transition-all duration-500',
          userTeam === 'porto'
            ? 'border-2 border-blue-500/60 shadow-[0_0_60px_rgba(37,99,235,0.35)]'
            : userTeam === 'lisboa'
            ? 'border-2 border-rose-500/60 shadow-[0_0_60px_rgba(244,63,94,0.35)]'
            : 'border border-amber-500/40 shadow-[0_0_60px_rgba(0,0,0,0.9)]'
        )}
      >
        {/* Iluminação Dual: Azul Elétrico (Porto) à esquerda, Carmesim Profundo (Lisboa) à direita */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-rose-600/25 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Linha Néon Superior Chanfrada (Azul à esquerda, Dourado ao centro, Carmesim à direita) */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

        <div className="relative z-10 p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {/* Topo do Hero: Badges de Estado e Identidade Oficial */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/85 border border-amber-500/30 px-3.5 py-1.5 shadow-inner">
                <Swords className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                  Evento Especial Oficial
                </span>
              </div>

              {/* Identidade do Lado Escolhido pelo Jogador */}
              {userTeam === 'porto' ? (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600/25 border border-blue-400/60 px-3 py-1.5 text-xs font-black text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <span>🔵</span>
                  <span className="uppercase tracking-wider">A Defender a Equipa Porto</span>
                </div>
              ) : userTeam === 'lisboa' ? (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600/25 border border-rose-400/60 px-3 py-1.5 text-xs font-black text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  <span>🔴</span>
                  <span className="uppercase tracking-wider">A Defender a Equipa Lisboa</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 px-3 py-1.5 text-xs font-black text-amber-300">
                  <span>⚔️</span>
                  <span className="uppercase tracking-wider">Escolha do Lado Pendente</span>
                </div>
              )}
            </div>

            {/* Badge de Estado Dinâmico Autorizado */}
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-lg',
                dynamicStatus === 'active' &&
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
                dynamicStatus === 'upcoming' &&
                  'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]',
                dynamicStatus === 'ended' &&
                  'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {dynamicStatus === 'active' && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              )}
              {dynamicStatus === 'upcoming' && (
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              )}
              {dynamicStatus === 'ended' && (
                <Award className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>{dynamicStatusLabel}</span>
            </div>
          </div>

          {/* Cabeçalho do Título Principal com Presença de Marca */}
          <div className="text-center space-y-3 pt-1">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.35em] text-amber-400">
              DESAFIO NACIONAL DE CONHECIMENTO
            </p>

            {/* Título Monumental: PORTO × LISBOA */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-blue-400 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]">
                PORTO
              </span>

              {/* Lâminas Cruzadas / Símbolo × Central */}
              <span className="inline-flex items-center justify-center h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-display text-2xl sm:text-3xl font-black shadow-[0_0_20px_rgba(245,158,11,0.7)] rotate-3">
                ×
              </span>

              <span className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                LISBOA
              </span>
            </div>

            <h2 className="font-display text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-widest text-amber-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              O GRANDE DUELO
            </h2>

            <p className="text-sm sm:text-base font-bold text-slate-200 tracking-wider">
              &ldquo;Dois territórios. Dois gigantes. Um desafio.&rdquo;
            </p>
          </div>

          {/* Confronto Territorial e Métrica de Forças (Invicta × Capital) */}
          <div className="relative mx-auto max-w-3xl w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 sm:p-5 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
              {/* Lado Porto */}
              <div className="flex items-center justify-between sm:justify-start gap-3 p-3 sm:p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-400/40">
                    <span className="text-xl">🔵</span>
                  </div>
                  <div className="text-left">
                    <p className="font-display text-sm font-black uppercase text-blue-300">
                      Equipa Porto
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      A Invicta & Dragões
                    </p>
                  </div>
                </div>
                <div className="text-right sm:ml-auto">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Pontos</p>
                  <p className="font-display text-sm sm:text-base font-black text-blue-300">
                    {loading ? (
                      <span className="inline-block h-4 w-12 bg-slate-800 animate-pulse rounded" />
                    ) : (
                      (portoTeamStats.points || 0).toLocaleString('pt-PT')
                    )}
                  </p>
                </div>
              </div>

              {/* Lado Lisboa */}
              <div className="flex items-center justify-between sm:justify-start gap-3 p-3 sm:p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-600/20 text-rose-400 border border-rose-400/40">
                    <span className="text-xl">🔴</span>
                  </div>
                  <div className="text-left">
                    <p className="font-display text-sm font-black uppercase text-rose-300">
                      Equipa Lisboa
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      A Capital & Águias
                    </p>
                  </div>
                </div>
                <div className="text-right sm:ml-auto">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Pontos</p>
                  <p className="font-display text-sm sm:text-base font-black text-rose-300">
                    {loading ? (
                      <span className="inline-block h-4 w-12 bg-slate-800 animate-pulse rounded" />
                    ) : (
                      (lisboaTeamStats.points || 0).toLocaleString('pt-PT')
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Principal de Entrada no Duelo */}
          <div className="pt-2 flex flex-col items-center justify-center gap-3">
            {dynamicStatus === 'active' && (
              <button
                type="button"
                onClick={handleStartMatch}
                disabled={dailyLimitReached}
                className={cn(
                  'w-full sm:w-auto min-w-[280px] sm:min-w-[340px] inline-flex items-center justify-center gap-3 rounded-2xl font-display text-base sm:text-lg font-black uppercase tracking-wider px-8 py-4.5 shadow-2xl transition-all cursor-pointer select-none',
                  dailyLimitReached
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                    : userTeam === 'porto'
                    ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 hover:from-blue-600 hover:to-sky-400 text-white shadow-[0_0_35px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-95'
                    : userTeam === 'lisboa'
                    ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-500 hover:from-rose-600 hover:to-red-400 text-white shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:scale-[1.02] active:scale-95'
                    : 'bg-gradient-to-r from-blue-600 via-amber-500 to-rose-600 hover:from-blue-500 hover:via-amber-400 hover:to-rose-500 text-white shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-95'
                )}
              >
                <Swords className="h-5 w-5 text-amber-300" />
                <span>
                  {dailyLimitReached
                    ? 'Limite Diário Atingido'
                    : !userTeam
                    ? 'Escolhe o Teu Lado para Jogar'
                    : userTeam === 'porto'
                    ? 'Jogar pela Equipa Porto 🔵'
                    : 'Jogar pela Equipa Lisboa 🔴'}
                </span>
                <ChevronRight className="h-5 w-5 text-amber-300" />
              </button>
            )}

            {/* Contador de Participações e Info da Partida */}
            <div className="text-xs text-slate-300 text-center flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="text-white font-bold">10 Perguntas Difíceis</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">
                Partidas Hoje: {dailyMatchesToday} / {maxDailyMatches}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-300 font-bold">Pontos Reais da Partida</span>
            </div>
          </div>

          {/* Contagem Decrescente Sincronizada com o Servidor */}
          {countdown && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {dynamicStatus === 'upcoming'
                        ? 'O Grande Duelo Começa Em'
                        : dynamicStatus === 'active'
                        ? 'Tempo Restante da Competição'
                        : 'Grande Duelo Concluído'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Horário oficial de Portugal (Europe/Lisbon)
                    </p>
                  </div>
                </div>

                {dynamicStatus !== 'ended' ? (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 min-w-[56px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.days).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Dias</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 min-w-[56px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Horas</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 min-w-[56px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Min</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-1.5 min-w-[56px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-amber-400">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Seg</p>
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black uppercase text-slate-300 border border-white/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Classificação Final Consagrada
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1.5 ECRÃ DE VITÓRIA / CONSAGRAÇÃO OFICIAL (QUANDO O EVENTO TERMINA)       */}
      {/* ========================================================================= */}
      {dynamicStatus === 'ended' && (
        <section
          aria-label="Vencedor Oficial do Grande Duelo"
          className={cn(
            'relative overflow-hidden rounded-3xl p-6 sm:p-10 text-center space-y-6 border-2 shadow-2xl backdrop-blur-2xl',
            winningTeam === 'porto'
              ? 'border-blue-400/80 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 shadow-[0_0_60px_rgba(37,99,235,0.4)]'
              : winningTeam === 'lisboa'
              ? 'border-rose-400/80 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 shadow-[0_0_60px_rgba(244,63,94,0.4)]'
              : 'border-amber-400/80 bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950'
          )}
        >
          <div className="text-5xl sm:text-6xl animate-bounce">🏆</div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow">
              RESULTADO FINAL CONSAGRADO
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-wide">
              {winningTeam === 'porto'
                ? '🔵 A EQUIPA PORTO É A GRANDE CAMPEÃ!'
                : winningTeam === 'lisboa'
                ? '🔴 A EQUIPA LISBOA É A GRANDE CAMPEÃ!'
                : 'EMPATE HISTÓRICO ENTRE PORTO E LISBOA!'}
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-300 max-w-2xl mx-auto">
              {winningTeam === 'porto'
                ? `A Invicta e os Dragões triunfaram no Grande Duelo com um total de ${portoTeamStats.points.toLocaleString('pt-PT')} pontos contra ${lisboaTeamStats.points.toLocaleString('pt-PT')} pontos de Lisboa.`
                : winningTeam === 'lisboa'
                ? `A Capital e as Águias triunfaram no Grande Duelo com um total de ${lisboaTeamStats.points.toLocaleString('pt-PT')} pontos contra ${portoTeamStats.points.toLocaleString('pt-PT')} pontos do Porto.`
                : 'Porto e Lisboa terminaram rigorosamente empatados neste duelo memorável!'}
            </p>
          </div>

          {/* Destaque dos Líderes de Cada Equipa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto pt-4 text-left">
            {portoLeader && (
              <div className="p-4 rounded-2xl bg-blue-950/70 border border-blue-400/50 flex items-center gap-3">
                <PlayerAvatar
                  photoURL={portoLeader.photoURL || null}
                  name={portoLeader.displayName || 'Porto Leader'}
                  className="h-12 w-12 rounded-xl border border-blue-400"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-blue-300 tracking-wider">
                    👑 Campeão da Equipa Porto
                  </span>
                  <p className="font-display text-sm font-black text-white truncate">
                    {portoLeader.displayName || 'Jogador'}
                  </p>
                  <p className="text-xs font-mono text-blue-400 font-bold">
                    {(portoLeader.totalPoints ?? portoLeader.eventPoints ?? portoLeader.points ?? 0).toLocaleString('pt-PT')} pts
                  </p>
                </div>
              </div>
            )}

            {lisboaLeader && (
              <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-400/50 flex items-center gap-3">
                <PlayerAvatar
                  photoURL={lisboaLeader.photoURL || null}
                  name={lisboaLeader.displayName || 'Lisboa Leader'}
                  className="h-12 w-12 rounded-xl border border-rose-400"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                    👑 Campeão da Equipa Lisboa
                  </span>
                  <p className="font-display text-sm font-black text-white truncate">
                    {lisboaLeader.displayName || 'Jogador'}
                  </p>
                  <p className="text-xs font-mono text-rose-400 font-bold">
                    {(lisboaLeader.totalPoints ?? lisboaLeader.eventPoints ?? lisboaLeader.points ?? 0).toLocaleString('pt-PT')} pts
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. PLACAR EM TEMPO REAL: PORTO 🔵 × LISBOA 🔴 (PONTOS E JOGADORES REAIS)  */}
      {/* ========================================================================= */}
      <section
        aria-label="Placar Oficial Porto vs Lisboa"
        className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-amber-500/20 to-rose-500/20 text-amber-400 border border-amber-500/30">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                  PLACAR DO GRANDE DUELO
                </h2>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Em Direto
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pontos e jogadores sincronizados atomicamente com o servidor
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400">
              Total Acumulado:{' '}
              <strong className="text-amber-400 font-mono">
                {totalTeamPoints.toLocaleString('pt-PT')} pts
              </strong>
            </span>
          </div>
        </div>

        {/* Comparador Visual das Duas Equipas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
          {/* Card Equipa Porto */}
          <div
            className={cn(
              'relative rounded-2xl p-5 sm:p-6 transition-all duration-300 border space-y-4',
              userTeam === 'porto'
                ? 'bg-gradient-to-b from-blue-950/80 via-slate-900/90 to-slate-950 border-blue-400/80 shadow-[0_0_30px_rgba(37,99,235,0.3)] ring-1 ring-blue-400/40'
                : 'bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-950/80 border-blue-500/30 hover:border-blue-400/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
                <span>🔵 EQUIPA PORTO</span>
              </div>
              {winningTeam === 'porto' && (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  🔥 Em Vantagem
                </span>
              )}
              {userTeam === 'porto' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                  ⭐ O Teu Lado
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Porto + FC Porto
              </h3>
              <p className="text-xs text-slate-300">
                A Invicta e a mística dos Dragões. Glórias europeias e tradição inabalável.
              </p>
            </div>

            {/* Métricas Reais da Equipa Porto */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/80 border border-blue-500/20 p-3 text-left">
                <p className="text-[10px] font-bold uppercase text-slate-400">Pontos da Equipa</p>
                <p className="font-display text-2xl sm:text-3xl font-black text-blue-400 mt-0.5">
                  {loading ? (
                    <span className="inline-block h-7 w-20 bg-slate-800 animate-pulse rounded" />
                  ) : (
                    (portoTeamStats.points || 0).toLocaleString('pt-PT')
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 border border-blue-500/20 p-3 text-left">
                <p className="text-[10px] font-bold uppercase text-slate-400">Jogadores Alistados</p>
                <p className="font-display text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {loading ? (
                    <span className="inline-block h-7 w-12 bg-slate-800 animate-pulse rounded" />
                  ) : (
                    (portoTeamStats.playerCount || 0).toLocaleString('pt-PT')
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-white/10">
              <span className="text-slate-400">Partidas Disputadas:</span>
              <span className="text-white font-mono">
                {loading ? (
                  <span className="inline-block h-4 w-8 bg-slate-800 animate-pulse rounded" />
                ) : (
                  portoTeamStats.matchesPlayed || 0
                )}
              </span>
            </div>
          </div>

          {/* Card Equipa Lisboa */}
          <div
            className={cn(
              'relative rounded-2xl p-5 sm:p-6 transition-all duration-300 border space-y-4',
              userTeam === 'lisboa'
                ? 'bg-gradient-to-b from-rose-950/80 via-slate-900/90 to-slate-950 border-rose-400/80 shadow-[0_0_30px_rgba(244,63,94,0.3)] ring-1 ring-rose-400/40'
                : 'bg-gradient-to-b from-rose-950/40 via-slate-900/60 to-slate-950/80 border-rose-500/30 hover:border-rose-400/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
                <span>🔴 EQUIPA LISBOA</span>
              </div>
              {winningTeam === 'lisboa' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider shadow">
                  🔥 Em Vantagem
                </span>
              )}
              {userTeam === 'lisboa' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                  ⭐ O Teu Lado
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
                Lisboa + SL Benfica
              </h3>
              <p className="text-xs text-slate-300">
                A Capital das 7 colinas e a lenda das Águias. Conquistas eternas de Berna e Amesterdão.
              </p>
            </div>

            {/* Métricas Reais da Equipa Lisboa */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-900/80 border border-rose-500/20 p-3 text-left">
                <p className="text-[10px] font-bold uppercase text-slate-400">Pontos da Equipa</p>
                <p className="font-display text-2xl sm:text-3xl font-black text-rose-400 mt-0.5">
                  {loading ? (
                    <span className="inline-block h-7 w-20 bg-slate-800 animate-pulse rounded" />
                  ) : (
                    (lisboaTeamStats.points || 0).toLocaleString('pt-PT')
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 border border-rose-500/20 p-3 text-left">
                <p className="text-[10px] font-bold uppercase text-slate-400">Jogadores Alistados</p>
                <p className="font-display text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {loading ? (
                    <span className="inline-block h-7 w-12 bg-slate-800 animate-pulse rounded" />
                  ) : (
                    (lisboaTeamStats.playerCount || 0).toLocaleString('pt-PT')
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-white/10">
              <span className="text-slate-400">Partidas Disputadas:</span>
              <span className="text-white font-mono">
                {loading ? (
                  <span className="inline-block h-4 w-8 bg-slate-800 animate-pulse rounded" />
                ) : (
                  lisboaTeamStats.matchesPlayed || 0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Barra Dinâmica de Domínio: Porto vs Lisboa */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-black uppercase">
            <span className="text-blue-400 flex items-center gap-1.5">
              <span>🔵 PORTO</span>
              <span className="font-mono text-sm">{portoPercentage}%</span>
            </span>
            <span className="text-amber-400 font-display text-[11px] tracking-widest">
              DISPUTA DO DOMÍNIO
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              <span className="font-mono text-sm">{lisboaPercentage}%</span>
              <span>LISBOA 🔴</span>
            </span>
          </div>

          <div className="relative h-6 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-400 transition-all duration-700 flex items-center justify-start pl-3 text-[10px] sm:text-xs font-black text-white"
              style={{ width: `${portoPercentage}%` }}
            >
              {portoPercentage >= 15 && `${portoPercentage}%`}
            </div>
            <div
              className="h-full bg-gradient-to-l from-rose-700 via-rose-600 to-rose-400 transition-all duration-700 flex items-center justify-end pr-3 text-[10px] sm:text-xs font-black text-white"
              style={{ width: `${lisboaPercentage}%` }}
            >
              {lisboaPercentage >= 15 && `${lisboaPercentage}%`}
            </div>
          </div>
        </div>

        {/* Callout de Ação para o Utilizador */}
        {!userTeam ? (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-blue-950/60 via-amber-950/40 to-rose-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <p className="font-display text-sm font-black text-amber-300 uppercase">
                ⚔️ Ainda Não Escolheste o Teu Lado!
              </p>
              <p className="text-xs text-slate-300">
                A tua escolha é definitiva para este evento e os teus pontos somam para o total da tua equipa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTeamSelectModal(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer shadow-lg shrink-0"
            >
              Escolher Equipa Agora ⚔️
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'rounded-2xl p-4 flex items-center justify-between gap-3 text-left border',
              userTeam === 'porto'
                ? 'bg-blue-950/40 border-blue-500/30 text-blue-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{userTeam === 'porto' ? '🔵' : '🔴'}</span>
              <p className="text-xs">
                Estás a lutar pela <strong>Equipa {userTeam === 'porto' ? 'Porto' : 'Lisboa'}</strong>
                {userTeamRankPosition && (
                  <span className="ml-1 text-amber-300 font-bold">
                    (És o #{userTeamRankPosition} na tua equipa)
                  </span>
                )}. Cada partida tua soma diretamente para este placar nacional!
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. QUATRO UNIVERSOS: CARDS DISTINTOS COM GLASSMORPHISM E PROFUNDIDADE     */}
      {/* ========================================================================= */}
      <section aria-label="Quatro Universos de Conhecimento" className="space-y-4">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
            <Compass className="h-4 w-4 text-amber-400" />
            <span>Matérias Exclusivas do Evento</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            QUATRO UNIVERSOS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Todas as 10 perguntas de cada partida são sorteadas exclusivamente destes quatro domínios de conhecimento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Cidade do Porto */}
          <div className="group rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/50 via-slate-900/80 to-slate-950/90 p-5 space-y-3 transition-all duration-300 hover:border-blue-400/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                🔵 Universo 1
              </span>
              <span className="text-[10px] font-bold text-slate-400">História & Património</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-blue-300 transition-colors">
                Cidade do Porto
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                O heróico Cerco de 1832-33, a Serra do Pilar, Edgar Cardoso e a Ponte da Arrábida, Tribunal da Relação e arquitetura da Invicta.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-400 font-bold">
              <span>Perguntas Hard & Expert</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Cidade de Lisboa */}
          <div className="group rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-950/50 via-slate-900/80 to-slate-950/90 p-5 space-y-3 transition-all duration-300 hover:border-rose-400/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                🔴 Universo 2
              </span>
              <span className="text-[10px] font-bold text-slate-400">História & Cultura</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-rose-300 transition-colors">
                Cidade de Lisboa
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                O cataclismo de 1755, a Baixa de Manuel da Maia, o Aqueduto das Águas Livres, bairros medievais, colinas e símbolos da Capital.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-400 font-bold">
              <span>Perguntas Hard & Expert</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 3: FC Porto */}
          <div className="group rounded-3xl border border-blue-400/30 bg-gradient-to-b from-blue-950/50 via-slate-900/80 to-slate-950/90 p-5 space-y-3 transition-all duration-300 hover:border-blue-400/60 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-500/30">
                🔵⚪ Universo 3
              </span>
              <span className="text-[10px] font-bold text-slate-400">Palmarés Europeu</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-sky-300 transition-colors">
                FC Porto
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Madjer em Viena 1987, Mourinho em Gelsenkirchen 2004, o histórico penta, o Estádio das Antas e recordes do Dragão.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-400 font-bold">
              <span>Perguntas Hard & Expert</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Card 4: SL Benfica */}
          <div className="group rounded-3xl border border-rose-400/30 bg-gradient-to-b from-rose-950/50 via-slate-900/80 to-slate-950/90 p-5 space-y-3 transition-all duration-300 hover:border-rose-400/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-red-300 border border-rose-500/30">
                🔴⚪ Universo 4
              </span>
              <span className="text-[10px] font-bold text-slate-400">Tradição & Glória</span>
            </div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-red-300 transition-colors">
                SL Benfica
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Berna 1961 e Amesterdão 1962, a era dourada de Eusébio, o tetra campeonato, o mítico Estádio da Luz e finais históricas.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-400 font-bold">
              <span>Perguntas Hard & Expert</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. NÍVEL DE DESAFIO: MUITO DIFÍCIL («AQUI NÃO HÁ PERGUNTAS OFERECIDAS»)    */}
      {/* ========================================================================= */}
      <section
        aria-label="Nível de Desafio"
        className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-blue-950/60 via-slate-950/90 to-rose-950/60 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-3 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-white">
                  NÍVEL DE DESAFIO: MUITO DIFÍCIL
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                  SEM FACILIDADES
                </span>
              </div>
              <p className="text-xs text-amber-300 font-bold italic mt-0.5">
                &ldquo;Aqui não há perguntas oferecidas.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
              HARD 1.0x
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
              V. HARD 1.25x
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
              EXPERT 1.5x
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Concebido para especialistas que dominam verdadeiramente a história cívica e desportiva dos dois maiores polos do país. O sistema premia respostas consecutivas e rapidez de decisão com multiplicadores autoritativos.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* 5. VITRINE DE PRÉMIOS EXCLUSIVOS (RECOMPENSAS REAIS NO BACKEND)            */}
      {/* ========================================================================= */}
      <section
        aria-label="Recompensas Exclusivas do Grande Duelo"
        className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 text-left"
      >
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                PRÉMIOS EXCLUSIVOS
              </h2>
              <p className="text-xs text-slate-400">
                Recompensas que não podes comprar na Loja.
              </p>
            </div>
          </div>

          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
            Atribuição Direta no Perfil
          </span>
        </div>

        {/* Grelha de Prémios Oficiais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1.º Lugar: Campeão do Grande Duelo */}
          <div className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/20 via-slate-950/90 to-slate-950 p-5 text-center space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.25)]">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-bl-xl shadow">
              1.º LUGAR
            </div>
            <div className="text-4xl pt-2">🏆</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                TÍTULO MÍTICO
              </p>
              <h3 className="font-display text-base font-black uppercase text-white mt-0.5">
                CAMPEÃO DO GRANDE DUELO
              </h3>
            </div>
            <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3 space-y-1 text-xs">
              <p className="font-display text-lg font-black text-amber-400">
                15.000 Acordas
              </p>
              <p className="text-slate-300 font-bold">+ 5.000 XP</p>
              <p className="text-[10px] text-slate-400">Troféu + Badge + Título de Perfil</p>
            </div>
          </div>

          {/* 2.º Lugar: Vice-Campeão do Grande Duelo */}
          <div className="rounded-3xl border border-slate-300/40 bg-gradient-to-b from-slate-400/15 via-slate-950/90 to-slate-950 p-5 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-300 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-bl-xl">
              2.º LUGAR
            </div>
            <div className="text-4xl pt-2">🥈</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                TÍTULO LENDÁRIO
              </p>
              <h3 className="font-display text-base font-black uppercase text-white mt-0.5">
                VICE-CAMPEÃO DO GRANDE DUELO
              </h3>
            </div>
            <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3 space-y-1 text-xs">
              <p className="font-display text-lg font-black text-slate-200">
                10.000 Acordas
              </p>
              <p className="text-slate-300 font-bold">+ 3.000 XP</p>
              <p className="text-[10px] text-slate-400">Badge + Título de Perfil</p>
            </div>
          </div>

          {/* 3.º Lugar: Top 3 — Grande Duelo */}
          <div className="rounded-3xl border border-amber-700/40 bg-gradient-to-b from-amber-800/15 via-slate-950/90 to-slate-950 p-5 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-700 text-white font-black text-[9px] uppercase tracking-wider rounded-bl-xl">
              3.º LUGAR
            </div>
            <div className="text-4xl pt-2">🥉</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                TÍTULO ÉPICO
              </p>
              <h3 className="font-display text-base font-black uppercase text-white mt-0.5">
                TOP 3 — GRANDE DUELO
              </h3>
            </div>
            <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3 space-y-1 text-xs">
              <p className="font-display text-lg font-black text-amber-400">
                7.500 Acordas
              </p>
              <p className="text-slate-300 font-bold">+ 2.000 XP</p>
              <p className="text-[10px] text-slate-400">Badge + Título de Perfil</p>
            </div>
          </div>

          {/* Participação: Desafiante do Grande Duelo */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950 p-5 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-slate-300 font-black text-[9px] uppercase tracking-wider rounded-bl-xl">
              MÍN. 5 JOGOS
            </div>
            <div className="text-4xl pt-2">⚔️</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                TÍTULO RARO
              </p>
              <h3 className="font-display text-base font-black uppercase text-white mt-0.5">
                DESAFIANTE DO GRANDE DUELO
              </h3>
            </div>
            <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-3 space-y-1 text-xs">
              <p className="font-display text-lg font-black text-white">
                500 Acordas
              </p>
              <p className="text-slate-300 font-bold">+ 500 XP</p>
              <p className="text-[10px] text-slate-400">Badge + Título de Participação</p>
            </div>
          </div>
        </div>

        {/* Resgate Oficial de Recompensa se Elegível */}
        {canClaimReward && (
          <div className="p-4 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-black text-amber-400 uppercase">
                🎉 Recompensa Disponível para a Tua Conta!
              </p>
              <p className="text-xs text-slate-300">
                Cumpriste os requisitos oficiais do Grande Duelo. Resgata agora o teu título, badge e Acordas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={claiming}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer shadow-lg shrink-0"
            >
              {claiming ? 'A Resgatar...' : 'Resgatar Prémios Oficiais'}
            </button>
          </div>
        )}

        {claimFeedback && (
          <div
            className={cn(
              'p-3.5 rounded-xl text-xs font-bold text-center',
              claimFeedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            )}
          >
            {claimFeedback.text}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. PAINEL DE ESTATÍSTICAS PESSOAIS DO JOGADOR NO EVENTO                    */}
      {/* ========================================================================= */}
      <section
        aria-label="O Teu Desempenho no Grande Duelo"
        className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase text-white">
                O Teu Desempenho no Grande Duelo
              </h2>
              <p className="text-xs text-slate-400">
                Estatísticas autoritativas sincronizadas em tempo real
              </p>
            </div>
          </div>

          {userRankPosition !== null ? (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 self-start sm:self-auto">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Classificação: #{userRankPosition}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Ainda sem jogos registados</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Pontos no Duelo</p>
            <p className="font-display text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {userStats.eventPoints.toLocaleString('pt-PT')}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Partidas Jogadas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-white mt-1">
              {userStats.totalMatches}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Certas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {userStats.correctAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Erradas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-rose-400 mt-1">
              {userStats.incorrectAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Taxa de Acerto</p>
            <p className="font-display text-xl sm:text-2xl font-black text-sky-400 mt-1">
              {userStats.accuracy}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Melhor Jogo</p>
            <p className="font-display text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {userStats.bestScore.toLocaleString('pt-PT')}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RANKING DO GRANDE DUELO: PÓDIO + TABELA COM DADOS REAIS                */}
      {/* ========================================================================= */}
      <section
        aria-label="Ranking do Grande Duelo"
        className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                RANKING DO GRANDE DUELO
              </h2>
              <p className="text-xs text-slate-400">
                Classificação em tempo real sincronizada via Firebase
              </p>
            </div>
          </div>

          {/* Abas de Filtragem: Todos / Porto / Lisboa */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setRankingFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
                rankingFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 border border-white/10 hover:text-white'
              )}
            >
              Todos ({effectiveRanking.length})
            </button>
            <button
              type="button"
              onClick={() => setRankingFilter('porto')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5',
                rankingFilter === 'porto'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                  : 'bg-slate-900/80 text-blue-400 border border-blue-500/30 hover:text-blue-300'
              )}
            >
              <span>🔵 Equipa Porto</span>
              <span className="font-mono">({portoParticipants.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setRankingFilter('lisboa')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5',
                rankingFilter === 'lisboa'
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                  : 'bg-slate-900/80 text-rose-400 border border-rose-500/30 hover:text-rose-300'
              )}
            >
              <span>🔴 Equipa Lisboa</span>
              <span className="font-mono">({lisboaParticipants.length})</span>
            </button>
          </div>
        </div>

        {rankingLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs font-bold">A sincronizar ranking em tempo real...</p>
          </div>
        ) : filteredRanking.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 space-y-3">
            <Swords className="h-12 w-12 text-amber-400/50 mx-auto" />
            <h3 className="font-display font-black text-sm uppercase text-white">
              {rankingFilter === 'porto'
                ? 'Ainda sem jogadores na Equipa Porto'
                : rankingFilter === 'lisboa'
                ? 'Ainda sem jogadores na Equipa Lisboa'
                : 'O Ranking está à tua espera!'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {rankingFilter === 'porto'
                ? 'Sê o primeiro a defender as cores do Porto e do FC Porto nesta tabela de honra!'
                : rankingFilter === 'lisboa'
                ? 'Sê o primeiro a defender as cores de Lisboa e do SL Benfica nesta tabela de honra!'
                : 'Sê o primeiro jogador a concluir uma partida de 10 perguntas do Grande Duelo para assumir o topo da classificação nacional.'}
            </p>
            <button
              type="button"
              onClick={handleStartMatch}
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:scale-105 transition cursor-pointer shadow-lg"
            >
              <span>Jogar Primeira Partida</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pódio dos 3 Primeiros */}
            {filteredRanking.length >= 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* 2.º Lugar */}
                {filteredRanking[1] && (
                  <div className="order-2 sm:order-1 rounded-2xl border border-slate-400/40 bg-slate-950/80 p-4 text-center space-y-2">
                    <span className="text-2xl">🥈</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      2.º Lugar
                    </p>
                    <PlayerAvatar
                      photoURL={filteredRanking[1].photoURL || null}
                      name={filteredRanking[1].displayName || 'Jogador'}
                      className="h-10 w-10 mx-auto rounded-xl border border-slate-400/40"
                    />
                    <div className="truncate">
                      <p className="font-display text-xs font-black uppercase text-white truncate">
                        {filteredRanking[1].displayName || 'Jogador'}
                      </p>
                      {filteredRanking[1].team && (
                        <span className="text-[9px] font-bold text-slate-400">
                          {filteredRanking[1].team === 'porto' ? '🔵 Porto' : '🔴 Lisboa'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-slate-300 font-display">
                      {(filteredRanking[1].totalPoints ?? filteredRanking[1].eventPoints ?? filteredRanking[1].points ?? 0).toLocaleString('pt-PT')} pts
                    </p>
                  </div>
                )}

                {/* 1.º Lugar */}
                {filteredRanking[0] && (
                  <div className="order-1 sm:order-2 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/20 to-slate-950 p-5 text-center space-y-2 shadow-[0_0_25px_rgba(245,158,11,0.25)] sm:-translate-y-2">
                    <span className="text-3xl">🥇</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {rankingFilter === 'porto'
                        ? 'Líder Equipa Porto'
                        : rankingFilter === 'lisboa'
                        ? 'Líder Equipa Lisboa'
                        : 'Líder do Duelo'}
                    </p>
                    <PlayerAvatar
                      photoURL={filteredRanking[0].photoURL || null}
                      name={filteredRanking[0].displayName || 'Jogador'}
                      className="h-12 w-12 mx-auto rounded-xl border border-amber-400/60 shadow"
                    />
                    <div className="truncate">
                      <p className="font-display text-sm font-black uppercase text-white truncate">
                        {filteredRanking[0].displayName || 'Jogador'}
                      </p>
                      {filteredRanking[0].team && (
                        <span className="text-[10px] font-bold text-amber-300">
                          {filteredRanking[0].team === 'porto' ? '🔵 Equipa Porto' : '🔴 Equipa Lisboa'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-black text-amber-400 font-display">
                      {(filteredRanking[0].totalPoints ?? filteredRanking[0].eventPoints ?? filteredRanking[0].points ?? 0).toLocaleString('pt-PT')} pts
                    </p>
                  </div>
                )}

                {/* 3.º Lugar */}
                {filteredRanking[2] && (
                  <div className="order-3 rounded-2xl border border-amber-700/40 bg-slate-950/80 p-4 text-center space-y-2">
                    <span className="text-2xl">🥉</span>
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                      3.º Lugar
                    </p>
                    <PlayerAvatar
                      photoURL={filteredRanking[2].photoURL || null}
                      name={filteredRanking[2].displayName || 'Jogador'}
                      className="h-10 w-10 mx-auto rounded-xl border border-amber-700/40"
                    />
                    <div className="truncate">
                      <p className="font-display text-xs font-black uppercase text-white truncate">
                        {filteredRanking[2].displayName || 'Jogador'}
                      </p>
                      {filteredRanking[2].team && (
                        <span className="text-[9px] font-bold text-slate-400">
                          {filteredRanking[2].team === 'porto' ? '🔵 Porto' : '🔴 Lisboa'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-amber-500 font-display">
                      {(filteredRanking[2].totalPoints ?? filteredRanking[2].eventPoints ?? filteredRanking[2].points ?? 0).toLocaleString('pt-PT')} pts
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tabela Completa de Classificação */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3 w-14 text-center">Pos.</th>
                    <th className="py-3 px-3">Jogador</th>
                    <th className="py-3 px-3 text-center">Lado</th>
                    <th className="py-3 px-3 hidden sm:table-cell">Distrito</th>
                    <th className="py-3 px-3 text-center">Partidas</th>
                    <th className="py-3 px-3 text-center hidden md:table-cell">Acertos</th>
                    <th className="py-3 px-3 text-center hidden md:table-cell">Melhor Jogo</th>
                    <th className="py-3 px-3 text-right">Pontos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredRanking.map((p, idx) => {
                    const isCurrentUser = Boolean(user?.uid && p.userId === user.uid)
                    const pos = idx + 1
                    const isTop1 = pos === 1
                    const isTop2 = pos === 2
                    const isTop3 = pos === 3

                    return (
                      <tr
                        key={p.userId || idx}
                        className={cn(
                          'transition-colors hover:bg-white/[0.03]',
                          isCurrentUser &&
                            'bg-amber-500/10 border-l-2 border-l-amber-400 font-bold',
                          isTop1 && 'bg-amber-500/5'
                        )}
                      >
                        {/* Posição com Medalhas */}
                        <td className="py-3.5 px-3 text-center">
                          {isTop1 ? (
                            <span className="text-base" title="1.º Lugar">🥇</span>
                          ) : isTop2 ? (
                            <span className="text-base" title="2.º Lugar">🥈</span>
                          ) : isTop3 ? (
                            <span className="text-base" title="3.º Lugar">🥉</span>
                          ) : (
                            <span className="font-display font-black text-slate-400">
                              #{pos}
                            </span>
                          )}
                        </td>

                        {/* Jogador */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <PlayerAvatar
                              photoURL={p.photoURL || p.avatar || null}
                              name={p.displayName || 'Jogador'}
                              className="h-8 w-8 rounded-xl border border-white/10 shrink-0"
                            />
                            <div className="truncate max-w-[130px] sm:max-w-[200px]">
                              <span
                                className={cn(
                                  'block truncate',
                                  isCurrentUser ? 'text-amber-300 font-black' : 'text-white'
                                )}
                              >
                                {p.displayName || 'Jogador'}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">
                                  Tu
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Lado / Equipa */}
                        <td className="py-3.5 px-3 text-center">
                          {p.team === 'porto' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black">
                              🔵 Porto
                            </span>
                          ) : p.team === 'lisboa' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                              🔴 Lisboa
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">—</span>
                          )}
                        </td>

                        {/* Distrito */}
                        <td className="py-3.5 px-3 hidden sm:table-cell text-slate-400 truncate max-w-[120px]">
                          {p.district || p.distrito || 'Portugal'}
                        </td>

                        {/* Partidas */}
                        <td className="py-3.5 px-3 text-center text-slate-300">
                          {p.gamesPlayed ?? p.countedMatches ?? p.totalMatches ?? 0}
                        </td>

                        {/* Acertos */}
                        <td className="py-3.5 px-3 text-center hidden md:table-cell text-emerald-400 font-bold">
                          {p.correctAnswers || 0}
                        </td>

                        {/* Melhor Jogo */}
                        <td className="py-3.5 px-3 text-center hidden md:table-cell text-slate-300">
                          {(p.bestScore || 0).toLocaleString('pt-PT')}
                        </td>

                        {/* Pontos de Evento */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-display text-sm font-black text-amber-400">
                            {(p.totalPoints ?? p.eventPoints ?? p.points ?? 0).toLocaleString('pt-PT')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 8. REGRAS OFICIAIS DO GRANDE DUELO                                         */}
      {/* ========================================================================= */}
      <section
        aria-label="Regras do Grande Duelo"
        className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4 text-left"
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-black uppercase text-white">
              Regras e Sistema de Pontuação
            </h2>
            <p className="text-xs text-slate-400">
              Mecânicas autoritativas do evento e integridade de pontuação
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>Multiplicadores de Nível</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada pergunta difere pelo seu nível: <strong>HARD (1.0x)</strong>,{' '}
              <strong>VERY HARD (1.25x)</strong> e <strong>EXPERT (1.5x)</strong>. Respostas rápidas e sem erros aumentam exponencialmente a pontuação da partida.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>10 Perguntas Aleatórias</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada partida sorteia dinamicamente 10 perguntas sem repetição, cruzando de forma equilibrada a Cidade do Porto, Cidade de Lisboa, FC Porto e SL Benfica.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
              <Shield className="h-4 w-4" />
              <span>Limite de 10 Partidas / Dia</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para assegurar competitividade justa e impedir exploração contínua, cada jogador pode pontuar até um máximo de 10 partidas diárias (renovadas à meia-noite de Lisboa).
            </p>
          </div>
        </div>
      </section>

      {/* Modal Interativo de Escolha do Lado Oficial (Porto vs Lisboa) */}
      <PortoLisboaTeamSelectModal
        isOpen={showTeamSelectModal}
        onClose={() => setShowTeamSelectModal(false)}
        onSuccess={handleTeamSelected}
        onTeamSelected={handleTeamSelected}
        teams={eventConfig.teams}
        portoStats={portoTeamStats}
        lisboaStats={lisboaTeamStats}
      />
    </div>
  )
}
