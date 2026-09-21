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
} from 'lucide-react'
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
  sortEventParticipants,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_PORTO_LISBOA_SLUG,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  type OfficialEventConfig,
  type EventParticipant,
  type CountdownDetails,
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

  // 3. Subscrição em tempo real aos eventos publicados
  useEffect(() => {
    const unsubscribe = subscribePublishedEvents((events) => {
      if (events && events.length > 0) {
        const found =
          events.find((e) => e.id === OFFICIAL_PORTO_LISBOA_ID) ||
          OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
        setEventConfig(found)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 4. Subscrição em tempo real ao Ranking oficial
  useEffect(() => {
    setRankingLoading(true)
    const unsubscribe = subscribeEventRanking(OFFICIAL_PORTO_LISBOA_ID, (participants) => {
      setRanking(participants)
      setRankingLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 5. Subscrição em tempo real ao progresso individual do utilizador
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

  // Ranking unificado e posição autoritativa
  const effectiveRanking = useMemo(() => {
    if (!userProgress || !userProgress.userId) return ranking
    const exists = ranking.some((p) => p.userId === userProgress.userId)
    const hasPoints = (userProgress.eventPoints || 0) > 0 || (userProgress.points || 0) > 0
    const hasMatches =
      (userProgress.totalMatches || 0) > 0 || (userProgress.countedMatches || 0) > 0
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

  // Partidas do dia no fuso Europe/Lisbon
  const lisbonToday = useMemo(() => getLisbonDateString(nowDate), [nowDate])
  const dailyMatchesToday = useMemo(() => {
    return getDailyMatchesCount(userProgress, lisbonToday)
  }, [userProgress, lisbonToday])

  const maxDailyMatches = eventConfig.rules?.maxDailyMatches || 10
  const dailyLimitReached = dailyMatchesToday >= maxDailyMatches

  // Estatísticas calculadas do utilizador
  const userStats = useMemo(() => {
    const totalMatches = userProgress?.totalMatches || 0
    const eventPoints = userProgress?.eventPoints || 0
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

  // Início oficial da partida do Grande Duelo
  const handleStartMatch = useCallback(() => {
    if (!user) {
      router.push('/entrar?redirect=/eventos')
      return
    }
    const matchId = safeRandomUUID()
    router.push(
      `/jogar?cat=porto-vs-lisboa&gameType=event&event=${OFFICIAL_PORTO_LISBOA_ID}&eventId=${OFFICIAL_PORTO_LISBOA_ID}&eventSlug=${OFFICIAL_PORTO_LISBOA_SLUG}&game=${matchId}`
    )
  }, [user, router])

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
    <div className={cn(embedded ? "w-full space-y-6 sm:space-y-10" : "w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 overflow-x-hidden select-none")}>
      {/* ========================================================================= */}
      {/* 1. HERO OFICIAL: PORTO ⚔️ LISBOA — O GRANDE DUELO                         */}
      {/* ========================================================================= */}
      <section
        aria-label="Porto vs Lisboa O Grande Duelo"
        className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#060e22]/95 via-[#030712]/98 to-[#02040a] p-5 sm:p-10 shadow-[0_0_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
      >
        {/* Luzes Temáticas do Grande Duelo: Azul (Porto) à esquerda, Carmesim (Lisboa) à direita, Ouro ao centro */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header do Card com Badges e Estado */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-950/80 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 shadow-inner">
              <Swords className="h-4 w-4 text-amber-400" />
              <span className="text-amber-300">Grande Duelo Nacional</span>
            </div>

            {/* Badge de Estado Dinâmico */}
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

          {/* Título Principal & Apresentação */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30">
                🔵 Porto
              </span>
              <span className="text-amber-400 font-bold text-xs">⚔️ VS ⚔️</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30">
                🔴 Lisboa
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              PORTO <span className="text-amber-400 font-serif">⚔️</span> LISBOA
            </h1>

            <p className="font-display text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-400">
              O GRANDE DUELO
            </p>

            <p className="text-sm sm:text-base font-semibold text-slate-200 tracking-wide">
              &ldquo;Dois territórios. Dois gigantes. Um desafio.&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              O confronto de conhecimento mais aguardado de Portugal. Perguntas rigorosas e aprofundadas focadas exclusivamente em quatro universos: a história da Cidade do Porto, a história da Cidade de Lisboa, o historial e palmarés do FC Porto e a trajetória lendária do SL Benfica.
            </p>
          </div>

          {/* Os 4 Universos + Confrontos Diretos */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-3 text-left space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span>🔵</span>
                <span>Porto</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                História, arquitetura, pontes, Cerco e património.
              </p>
            </div>

            <div className="rounded-2xl border border-blue-400/30 bg-blue-950/40 p-3 text-left space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <span>🔵⚪</span>
                <span>FC Porto</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Viena, Sevilha, Gelsenkirchen, penta e recordes.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-3 text-left space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>🔴</span>
                <span>Lisboa</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Terramoto 1755, colinas, aqueduto e bairros.
              </p>
            </div>

            <div className="rounded-2xl border border-rose-400/30 bg-rose-950/40 p-3 text-left space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                <span>🔴⚪</span>
                <span>SL Benfica</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Bicampeões europeus, Eusébio, tetra e história.
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3 text-left space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>⚔️</span>
                <span>Confrontos</span>
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Clássicos, finais de Taça, decisões e duelos.
              </p>
            </div>
          </div>

          {/* Aviso Estrito de Dificuldade */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 px-4 py-2.5 text-xs text-slate-300">
            <Flame className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-400 uppercase tracking-wider font-black">
                Dificuldade Máxima:
              </strong>{' '}
              Apenas perguntas de nível <strong>HARD (1.0x)</strong>,{' '}
              <strong>VERY HARD (1.25x)</strong> e <strong>EXPERT (1.5x)</strong>. Proibidas perguntas fáceis.
            </span>
          </div>

          {/* Botão de Jogar Principal e Limite */}
          {dynamicStatus === 'active' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={handleStartMatch}
                disabled={dailyLimitReached}
                className={cn(
                  'w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl font-display text-sm sm:text-base font-black uppercase tracking-wider px-8 py-4 shadow-xl transition-all cursor-pointer',
                  dailyLimitReached
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-blue-600 via-amber-500 to-rose-600 hover:from-blue-500 hover:via-amber-400 hover:to-rose-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-95'
                )}
              >
                <Swords className="h-5 w-5" />
                <span>
                  {dailyLimitReached ? 'Limite Diário Atingido' : 'Jogar Agora — Entrar no Duelo'}
                </span>
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="text-xs text-slate-400 text-center sm:text-left">
                <span className="text-white font-bold">10 perguntas por partida</span> •{' '}
                <span className="text-amber-400 font-bold">
                  {dailyMatchesToday} / {maxDailyMatches} partidas hoje
                </span>
              </div>
            </div>
          )}

          {/* Contagem Decrescente Sincronizada */}
          {countdown && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      {dynamicStatus === 'upcoming'
                        ? 'O Duelo Começa Em'
                        : dynamicStatus === 'active'
                        ? 'Tempo Restante do Grande Duelo'
                        : 'Grande Duelo Concluído'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Vigência oficial de Lisboa (Europe/Lisbon)
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
      {/* 2. PAINEL DE ESTATÍSTICAS PESSOAIS DO JOGADOR NO DUELO                     */}
      {/* ========================================================================= */}
      <section
        aria-label="Estatísticas do Jogador no Evento"
        className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-black uppercase text-white">
                O Teu Desempenho no Grande Duelo
              </h2>
              <p className="text-xs text-slate-400">
                Estatísticas sincronizadas em tempo real com a tua conta
              </p>
            </div>
          </div>

          {userRankPosition !== null ? (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Classificação Atual: #{userRankPosition}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Ainda sem partidas neste evento
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Pontos no Duelo</p>
            <p className="font-display text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {userStats.eventPoints.toLocaleString('pt-PT')}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Partidas Realizadas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-white mt-1">
              {userStats.totalMatches}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Respostas Certas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {userStats.correctAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Respostas Erradas</p>
            <p className="font-display text-xl sm:text-2xl font-black text-rose-400 mt-1">
              {userStats.incorrectAnswers}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Taxa de Acerto</p>
            <p className="font-display text-xl sm:text-2xl font-black text-sky-400 mt-1">
              {userStats.accuracy}%
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Melhor Pontuação</p>
            <p className="font-display text-xl sm:text-2xl font-black text-amber-300 mt-1">
              {userStats.bestScore.toLocaleString('pt-PT')}
            </p>
          </div>
        </div>

        {/* Resgate de Recompensa se elegível */}
        {canClaimReward && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-black text-amber-400 uppercase">
                🎉 Parabéns! Terminaste no Pódio (#{userRankPosition})
              </p>
              <p className="text-xs text-slate-300">
                Podes resgatar agora a tua recompensa oficial em Acordas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClaimReward}
              disabled={claiming}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer shadow-lg"
            >
              {claiming ? 'A Resgatar...' : 'Resgatar Acordas'}
            </button>
          </div>
        )}

        {claimFeedback && (
          <div
            className={cn(
              'p-3 rounded-xl text-xs font-bold',
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
      {/* 3. RECOMPENSAS EXCLUSIVAS DO GRANDE DUELO                                  */}
      {/* ========================================================================= */}
      <section
        aria-label="Recompensas do Evento"
        className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4"
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-black uppercase text-white">
              Tabela de Recompensas Oficiais
            </h2>
            <p className="text-xs text-slate-400">
              Prémio em Acordas atribuído pelo servidor no termo do Grande Duelo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {eventConfig.rewards.map((rew) => (
            <div
              key={rew.position}
              className={cn(
                'rounded-2xl border p-4 text-center space-y-2 relative overflow-hidden',
                rew.position === 1 &&
                  'border-amber-400/50 bg-gradient-to-b from-amber-500/15 to-slate-950/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
                rew.position === 2 &&
                  'border-slate-400/40 bg-gradient-to-b from-slate-400/10 to-slate-950/80',
                rew.position === 3 &&
                  'border-amber-700/40 bg-gradient-to-b from-amber-800/10 to-slate-950/80',
                rew.position > 3 &&
                  'border-white/10 bg-slate-950/60'
              )}
            >
              <div className="text-3xl">{rew.medal}</div>
              <p className="font-display text-xs font-black uppercase text-white tracking-wide">
                {rew.title}
              </p>
              <p className="font-display text-lg font-black text-amber-400">
                {rew.acordas.toLocaleString('pt-PT')} Acordas
              </p>
              <span className="text-[10px] text-slate-400 block">{rew.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. RANKING EXCLUSIVO: 🏆 PORTO ⚔️ LISBOA                                  */}
      {/* ========================================================================= */}
      <section
        aria-label="Ranking Oficial Porto vs Lisboa"
        className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
                <span>🏆 RANKING OFICIAL — PORTO ⚔️ LISBOA</span>
              </h2>
              <p className="text-xs text-slate-400">
                Classificação em tempo real sincronizada via Firebase
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Top {effectiveRanking.length} participantes registados
          </div>
        </div>

        {rankingLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="h-8 w-8 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs">A sincronizar ranking em tempo real...</p>
          </div>
        ) : effectiveRanking.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 space-y-3">
            <Swords className="h-10 w-10 text-amber-400/50 mx-auto" />
            <h3 className="font-display font-black text-sm uppercase text-white">
              O Ranking está à tua espera!
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Sê o primeiro jogador a concluir uma partida de 10 perguntas do Grande Duelo para assumir o topo da classificação nacional.
            </p>
            <button
              type="button"
              onClick={handleStartMatch}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              <span>Jogar Primeira Partida</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 w-14 text-center">Pos.</th>
                  <th className="py-3 px-3">Jogador</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Distrito</th>
                  <th className="py-3 px-3 text-center">Partidas</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">Acertos</th>
                  <th className="py-3 px-3 text-center hidden md:table-cell">Melhor Jogo</th>
                  <th className="py-3 px-3 text-right">Pontos Duelo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {effectiveRanking.map((p, idx) => {
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
                        isCurrentUser && 'bg-amber-500/10 border-l-2 border-l-amber-400 font-bold',
                        isTop1 && 'bg-amber-500/5'
                      )}
                    >
                      {/* Posição com medalhas */}
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
                          <div className="truncate max-w-[140px] sm:max-w-[200px]">
                            <span className={cn('block truncate', isCurrentUser ? 'text-amber-300 font-black' : 'text-white')}>
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

                      {/* Distrito */}
                      <td className="py-3.5 px-3 hidden sm:table-cell text-slate-400 truncate max-w-[120px]">
                        {p.district || p.distrito || 'Portugal'}
                      </td>

                      {/* Partidas */}
                      <td className="py-3.5 px-3 text-center text-slate-300">
                        {p.countedMatches || p.totalMatches || 0}
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
                          {(p.eventPoints || p.points || 0).toLocaleString('pt-PT')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. REGRAS E PONTUAÇÃO DO GRANDE DUELO                                     */}
      {/* ========================================================================= */}
      <section
        aria-label="Regras do Grande Duelo"
        className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4"
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>Multiplicadores de Nível</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada pergunta difere pelo seu nível: <strong>HARD (1.0x)</strong>,{' '}
              <strong>VERY HARD (1.25x)</strong> e <strong>EXPERT (1.5x)</strong>. Respostas rápidas e sem erros aumentam exponencialmente a pontuação da partida.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>10 Perguntas Aleatórias</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cada partida sorteia dinamicamente 10 perguntas sem repetição, cruzando de forma equilibrada a Cidade do Porto, Cidade de Lisboa, FC Porto, SL Benfica e grandes confrontos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-1.5">
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
    </div>
  )
}
