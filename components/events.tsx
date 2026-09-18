'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Gamepad2,
  ChevronRight,
  Trophy,
  Sparkles,
  Clock,
  Medal,
  Award,
  Flame,
  Shield,
  User,
  AlertCircle,
  CheckCircle2,
  Star,
  Target,
  ArrowRight,
  Gift,
  HelpCircle,
} from 'lucide-react'
import { GlobalBackButton } from '@/components/navigation/GlobalBackButton'
import { PlayerAvatar } from '@/components/player-avatar'
import { useAuth } from '@/components/auth-provider'
import {
  subscribePublishedEvents,
  subscribeEventRanking,
  subscribeUserEventProgress,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  getDailyMatchesCount,
  getLisbonDateString,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  type OfficialEventConfig,
  type EventParticipant,
  type CountdownDetails,
} from '@/lib/events-service'
import { cn, safeRandomUUID } from '@/lib/utils'

export function Events() {
  const router = useRouter()
  const { user, profile } = useAuth()

  // Configuração oficial do evento
  const [eventConfig, setEventConfig] = useState<OfficialEventConfig>(
    OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO
  )
  const [ranking, setRanking] = useState<EventParticipant[]>([])
  const [userProgress, setUserProgress] = useState<EventParticipant | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingLoading, setRankingLoading] = useState(true)

  // Sincronização temporal de alta precisão com o servidor (relógio autoritativo)
  const [serverClockSkewMs, setServerClockSkewMs] = useState<number>(0)
  const [nowDate, setNowDate] = useState<Date>(() => new Date())

  // Estado de resgate de recompensa
  const [claiming, setClaiming] = useState(false)
  const [claimFeedback, setClaimFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 1. Obter hora oficial do servidor, dados do evento e ranking inicial via API sem cache
  useEffect(() => {
    let isMounted = true

    const syncServerTime = async () => {
      try {
        const headers: Record<string, string> = {}
        if (user) {
          try {
            const token = await user.getIdToken()
            if (token) headers['Authorization'] = `Bearer ${token}`
          } catch {}
        }

        const res = await fetch('/api/events', { cache: 'no-store', headers })
        if (res.ok) {
          const data = await res.json()
          if (data && isMounted) {
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
        console.warn('[EVENTS] Aviso ao sincronizar hora do servidor:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void syncServerTime()
    return () => {
      isMounted = false
    }
  }, [user])

  // 2. Relógio em tempo real sincronizado com a hora do servidor
  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date(Date.now() + serverClockSkewMs))
    }, 1000)
    return () => clearInterval(timer)
  }, [serverClockSkewMs])

  // 3. Subscrição em tempo real aos eventos publicados no Firestore
  useEffect(() => {
    const unsubscribe = subscribePublishedEvents((events) => {
      if (events && events.length > 0) {
        // Encontrar o evento Portugal em Jogo ou usar o primeiro
        const found =
          events.find((e) => e.id === OFFICIAL_PORTUGAL_EM_JOGO_ID) || events[0]
        setEventConfig(found)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 4. Subscrição em tempo real ao ranking de participantes reais
  const eventId = eventConfig.id || OFFICIAL_PORTUGAL_EM_JOGO_ID
  useEffect(() => {
    setRankingLoading(true)
    const unsubscribe = subscribeEventRanking(eventId, (participants) => {
      setRanking(participants)
      setRankingLoading(false)
    })
    return () => unsubscribe()
  }, [eventId])

  // 5. Subscrição em tempo real ao progresso do utilizador autenticado
  useEffect(() => {
    if (!user?.uid) {
      setUserProgress(null)
      return
    }
    const unsubscribe = subscribeUserEventProgress(user.uid, eventId, (progress) => {
      if (progress) {
        setUserProgress(progress)
      }
    })
    return () => unsubscribe()
  }, [user?.uid, eventId])

  // Cálculo dinâmico do estado e contagem decrescente com base no relógio do servidor
  const dynamicStatus = useMemo(() => {
    return getEventStatus(eventConfig, nowDate) || 'active'
  }, [eventConfig, nowDate])

  const dynamicStatusLabel = useMemo(() => {
    return getEventStatusLabel(dynamicStatus)
  }, [dynamicStatus])

  const countdown = useMemo(() => {
    return getEventCountdown(eventConfig, nowDate)
  }, [eventConfig, nowDate])

  // Ranking unificado e posição autoritativa real do jogador
  const effectiveRanking = useMemo(() => {
    if (!userProgress || !userProgress.userId) return ranking
    const exists = ranking.some((p) => p.userId === userProgress.userId)
    const hasPoints = (userProgress.eventPoints || 0) > 0 || (userProgress.points || 0) > 0
    const hasMatches = (userProgress.totalMatches || 0) > 0 || (userProgress.countedMatches || 0) > 0
    if (!exists && (hasPoints || hasMatches)) {
      return sortEventParticipants([...ranking, userProgress])
    }
    return ranking
  }, [ranking, userProgress])

  const userRankIndex = useMemo(() => {
    if (!user?.uid || effectiveRanking.length === 0) return -1
    return effectiveRanking.findIndex((p) => p.userId === user.uid)
  }, [user?.uid, effectiveRanking])

  const userRankPosition = useMemo(() => {
    if (userRankIndex >= 0) return userRankIndex + 1
    const userPts = userProgress?.eventPoints ?? userProgress?.points ?? 0
    const userMatches = userProgress?.totalMatches ?? userProgress?.countedMatches ?? 0
    if (userPts > 0 || userMatches > 0) {
      return effectiveRanking.length > 0 ? effectiveRanking.length + 1 : 1
    }
    return null
  }, [userRankIndex, userProgress, effectiveRanking.length])

  // Partidas do utilizador hoje no fuso Europe/Lisbon
  const lisbonToday = useMemo(() => getLisbonDateString(nowDate), [nowDate])
  const dailyMatchesToday = useMemo(() => {
    return getDailyMatchesCount(userProgress, lisbonToday)
  }, [userProgress, lisbonToday])

  const maxDailyMatches = eventConfig.rules?.maxDailyMatches || 10
  const dailyLimitReached = dailyMatchesToday >= maxDailyMatches

  // Início oficial de partida do evento com identificadores autoritativos
  const handleStartEventMatch = useCallback(() => {
    if (!user) {
      router.push('/entrar?redirect=/eventos')
      return
    }
    const matchId = safeRandomUUID()
    router.push(
      `/jogar?cat=portugal-em-jogo&gameType=event&event=${eventId}&eventId=${eventId}&eventSlug=primeiro-desafio-nacional-portugal-em-jogo&game=${matchId}`
    )
  }, [user, router, eventId])

  // Reivindicação de Recompensa
  const canClaimReward =
    dynamicStatus === 'ended' &&
    userRankPosition !== null &&
    userRankPosition <= 3 &&
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
        body: JSON.stringify({ eventId }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setClaimFeedback({
          type: 'success',
          text: data.message || 'Recompensa creditada com sucesso!',
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
        text: err?.message || 'Erro de conexão ao servidor.',
      })
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-10 overflow-x-hidden select-none">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR: NAVEGAÇÃO OFICIAL NO SITEHEADER + BADGE OFICIAL        */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-end gap-3">
        {/* GlobalBackButton registado para integridade formal da rota de eventos */}
        <GlobalBackButton label="Voltar" fallbackUrl="/" variant="header" className="hidden" />

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 border border-amber-500/30 px-3 sm:px-4 py-1.5 shadow-lg backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-300">
            Competição Oficial
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD PREMIUM HERÓICO: PRIMEIRO DESAFIO NACIONAL — PORTUGAL EM JOGO     */}
      {/* ========================================================================= */}
      <section
        aria-label="Primeiro Desafio Nacional"
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#0a1633]/90 via-[#050c1f]/95 to-[#020612]/98 p-5 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        {/* Luzes de fundo temáticas (Verde, Rubi e Ouro de Portugal) */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header do Card com Badge de Estado Dinâmico */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/80 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 shadow-inner">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>{eventConfig.type || 'Evento Especial'}</span>
            </div>

            {/* Badge Dinâmico de Estado */}
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

          {/* Título Oficial e Tema */}
          <div className="space-y-2 text-left">
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400">
              PRIMEIRO DESAFIO NACIONAL
            </p>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              PORTUGAL EM JOGO
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {eventConfig.description}
            </p>
          </div>

          {/* Botão Oficial Principal Jogar Agora */}
          {dynamicStatus === 'active' && (
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={handleStartEventMatch}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display text-sm sm:text-base font-black uppercase tracking-wider px-8 py-4 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(245,158,11,0.65)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Gamepad2 className="h-5 w-5 text-slate-950" />
                <span>Jogar Agora — Portugal em Jogo</span>
                <ChevronRight className="h-5 w-5 text-slate-950" />
              </button>
              <span className="text-xs text-slate-300">
                10 perguntas • 100 pontos máx. • 10 partidas diárias
              </span>
            </div>
          )}

          {/* Relógio de Contagem Decrescente Sincronizado */}
          {countdown && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {dynamicStatus === 'upcoming'
                        ? 'Início do Evento em'
                        : dynamicStatus === 'active'
                          ? 'Tempo Restante da Competição'
                          : 'Competição Oficial Concluída'}
                    </p>
                    <p className="text-xs text-slate-400">
                      16 Set 2026, 20:00 ➔ 30 Set 2026, 23:59 (Europe/Lisbon)
                    </p>
                  </div>
                </div>

                {/* Unidades da Contagem */}
                {dynamicStatus !== 'ended' ? (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 min-w-[54px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.days).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Dias</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 min-w-[54px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.hours).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Horas</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 min-w-[54px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-white">
                        {String(countdown.minutes).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Min</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5 min-w-[54px]">
                      <span className="font-display text-lg sm:text-2xl font-black text-amber-400">
                        {String(countdown.seconds).padStart(2, '0')}
                      </span>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Seg</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black uppercase text-slate-300 border border-white/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Classificação Final Congelada
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Como Participar (Regras Claras) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <Gamepad2 className="h-4 w-4" />
                <span>Partidas Normais</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sem modo separado: joga normalmente no jogo. Todas as partidas válidas contam automaticamente para o evento!
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
                <Target className="h-4 w-4" />
                <span>Conversão Real</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A tua pontuação na partida converte-se diretamente em Pontos de Evento (1.000 pts = 100 pontos, teto máx. 100 por jogo).
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
                <Flame className="h-4 w-4" />
                <span>10 Partidas / Dia</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Contam até 10 partidas válidas por dia (fuso de Lisboa). Continuas a jogar normalmente para XP e moedas após o limite!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ÁREA DO JOGADOR AUTENTICADO                                            */}
      {/* ========================================================================= */}
      <section
        aria-label="A tua participação no evento"
        className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 text-left"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                O Teu Desempenho
              </h2>
              <p className="text-xs text-slate-400">
                {user ? `Conta oficial: ${profile?.displayName || user.email?.split('@')[0] || 'Jogador'}` : 'Inicia sessão para guardar pontos e subir no ranking'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartEventMatch}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display text-xs font-black uppercase tracking-wider px-5 py-2.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Jogar Agora</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            {/* Grelha de Métricas Reais do Jogador */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Posição */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  A Tua Posição
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-white">
                    {userRankPosition ? `${userRankPosition}.º Lugar` : 'Sem Posição'}
                  </span>
                  {userRankPosition && userRankPosition <= 3 && (
                    <span className="text-sm">
                      {userRankPosition === 1 ? '🥇' : userRankPosition === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {userRankPosition
                    ? `Entre ${effectiveRanking.length} participantes reais`
                    : 'Ainda não entraste no ranking'}
                </p>
              </div>

              {/* Pontos de Evento */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Os Teus Pontos
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-black text-amber-400">
                    {(userProgress?.eventPoints ?? userProgress?.points ?? 0).toLocaleString('pt-PT')}
                  </span>
                  <span className="text-xs text-amber-300/80 font-bold uppercase">pts</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {userProgress && (userProgress.countedMatches || userProgress.totalMatches)
                    ? `${userProgress.countedMatches || userProgress.totalMatches} partidas contabilizadas`
                    : 'Joga uma partida normal para pontuar'}
                </p>
              </div>

              {/* Partidas Contabilizadas Hoje */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Partidas Hoje
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-display text-2xl sm:text-3xl font-black',
                      dailyLimitReached ? 'text-amber-400' : 'text-emerald-400'
                    )}
                  >
                    {dailyMatchesToday}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">/ {maxDailyMatches}</span>
                </div>
                {/* Barra de Progresso Diária */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/10">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      dailyLimitReached
                        ? 'bg-amber-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    )}
                    style={{
                      width: `${Math.min(100, (dailyMatchesToday / maxDailyMatches) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Aviso quando o limite diário de 10 foi atingido */}
            {dailyLimitReached && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200 leading-relaxed">
                  Atingiste o limite de <strong>10 partidas contabilizadas hoje</strong> no evento. Podes continuar a jogar à vontade: o teu XP, moedas e estatísticas normais continuam a contar a 100%! O limite do evento reinicia à meia-noite (fuso de Lisboa).
                </p>
              </div>
            )}

            {/* Reclamação de Prémio se o Evento Terminou e ficou no Top 3 */}
            {canClaimReward && (
              <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-sm uppercase">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span>Terminaste no Pódio Nacional!</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    A tua posição final foi #{userRankPosition}. Clica para receber o teu prémio oficial de Acordas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClaimReward}
                  disabled={claiming}
                  className="w-full sm:w-auto button-game-gold rounded-xl px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  {claiming ? 'A creditar...' : 'Resgatar Recompensa'}
                </button>
              </div>
            )}

            {claimFeedback && (
              <div
                className={cn(
                  'rounded-xl p-3 text-xs font-bold flex items-center gap-2',
                  claimFeedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                )}
              >
                {claimFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{claimFeedback.text}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-6 text-center space-y-3">
            <p className="text-sm text-slate-300">
              Ainda não tens sessão iniciada. Entra na tua conta para guardar o teu progresso, subir no ranking e ganhar prémios.
            </p>
            <Link
              href="/entrar"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 transition"
            >
              <User className="h-4 w-4 text-amber-400" />
              <span>Entrar / Criar Conta</span>
            </Link>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. RECOMPENSAS OFICIAIS DO EVENTO                                         */}
      {/* ========================================================================= */}
      <section
        aria-label="Recompensas Oficiais"
        className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 text-left"
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
              Prémios Oficiais
            </h2>
            <p className="text-xs text-slate-400">
              Recompensas virtuais atribuídas automaticamente aos 3 primeiros classificados no final do evento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1.º Lugar */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-slate-900/80 to-slate-950/90 p-5 text-center shadow-lg shadow-amber-500/10 space-y-2">
            <span className="text-3xl">🥇</span>
            <p className="text-xs font-black uppercase tracking-wider text-amber-300">1.º Lugar</p>
            <p className="font-display text-2xl sm:text-3xl font-black text-white">
              10.000 <span className="text-sm font-bold text-amber-400">Acordas</span>
            </p>
            <p className="text-[11px] text-slate-300">Grande Campeão Nacional</p>
          </div>

          {/* 2.º Lugar */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-300/40 bg-gradient-to-b from-slate-400/15 via-slate-900/80 to-slate-950/90 p-5 text-center shadow-lg space-y-2">
            <span className="text-3xl">🥈</span>
            <p className="text-xs font-black uppercase tracking-wider text-slate-300">2.º Lugar</p>
            <p className="font-display text-2xl sm:text-3xl font-black text-white">
              7.500 <span className="text-sm font-bold text-slate-300">Acordas</span>
            </p>
            <p className="text-[11px] text-slate-300">Vice-Campeão Nacional</p>
          </div>

          {/* 3.º Lugar */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-700/40 bg-gradient-to-b from-amber-700/15 via-slate-900/80 to-slate-950/90 p-5 text-center shadow-lg space-y-2">
            <span className="text-3xl">🥉</span>
            <p className="text-xs font-black uppercase tracking-wider text-amber-500">3.º Lugar</p>
            <p className="font-display text-2xl sm:text-3xl font-black text-white">
              5.000 <span className="text-sm font-bold text-amber-500">Acordas</span>
            </p>
            <p className="text-[11px] text-slate-300">Pódio de Honra Nacional</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center italic">
          * As Acordas são a moeda virtual oficial do jogo (não são euros). As recompensas são atribuídas diretamente na carteira de jogo pelo backend após 30/09/2026 às 23:59.
        </p>
      </section>

      {/* ========================================================================= */}
      {/* 5. RANKING REAL DO EVENTO (SEM BOTS, SEM DADOS FALSOS)                    */}
      {/* ========================================================================= */}
      <section
        aria-label="Ranking do Evento"
        className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 text-left"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <Medal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                RANKING — PORTUGAL EM JOGO
              </h2>
              <p className="text-xs text-slate-400">
                Classificação nacional oficial atualizada em tempo real (100% participantes reais)
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {effectiveRanking.length === 1 ? '1 participante' : `${effectiveRanking.length} participantes`}
          </span>
        </div>

        {rankingLoading && effectiveRanking.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs text-slate-400 font-medium">A carregar classificação oficial...</p>
          </div>
        ) : effectiveRanking.length === 0 ? (
          /* Estado Vazio 100% Real */
          <div className="py-12 text-center space-y-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Trophy className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-black uppercase text-white">
                Ainda não existem participantes.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Sê o primeiro a jogar uma partida normal do jogo para assumir a liderança e entrar no ranking oficial do Desafio Nacional!
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartEventMatch}
              className="inline-flex items-center gap-2 rounded-2xl button-game-gold px-6 py-3 font-display text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Jogar Primeira Partida</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Tabela de Classificação Real */
          <div className="space-y-2 overflow-hidden">
            {effectiveRanking.map((participant, index) => {
              const pos = participant.pos || index + 1
              const isTop1 = pos === 1
              const isTop2 = pos === 2
              const isTop3 = pos === 3
              const isCurrentUser = user?.uid === participant.userId

              return (
                <div
                  key={participant.userId}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border transition-all',
                    isCurrentUser
                      ? 'border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : isTop1
                        ? 'border-amber-400/40 bg-amber-950/20'
                        : isTop2
                          ? 'border-slate-300/30 bg-slate-900/60'
                          : isTop3
                            ? 'border-amber-700/30 bg-slate-900/40'
                            : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                  )}
                >
                  {/* Esquerda: Posição + Avatar + Nome + Distrito */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Badge de Posição */}
                    <div className="w-8 shrink-0 text-center font-display font-black text-sm sm:text-base">
                      {isTop1 ? (
                        <span className="text-xl">🥇</span>
                      ) : isTop2 ? (
                        <span className="text-xl">🥈</span>
                      ) : isTop3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-slate-400">#{pos}</span>
                      )}
                    </div>

                    {/* Avatar do Jogador */}
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden border border-white/15 bg-slate-900">
                        <PlayerAvatar
                          profile={{
                            avatar: participant.photoURL || participant.avatar || '/images/avatars/avatar_01.png',
                            displayName: participant.displayName,
                          }}
                          src={participant.photoURL || participant.avatar || '/images/avatars/avatar_01.png'}
                          size="sm"
                          showBadge={false}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Dados Públicos */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-display text-xs sm:text-sm font-black text-white truncate">
                          {participant.displayName || 'Jogador'}
                        </p>
                        {isCurrentUser && (
                          <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                            Tu
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                        {participant.district || participant.distrito || 'Portugal'} •{' '}
                        {participant.countedMatches || participant.totalMatches} partidas
                      </p>
                    </div>
                  </div>

                  {/* Direita: Pontos de Evento */}
                  <div className="shrink-0 text-right">
                    <span className="font-display text-base sm:text-xl font-black text-amber-400">
                      {(participant.eventPoints ?? participant.points ?? 0).toLocaleString('pt-PT')}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pontos</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default Events
