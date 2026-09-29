'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Swords,
  Trophy,
  MapPin,
  Sparkles,
  Coins,
  Flame,
  Target,
  ShoppingBag,
  User as UserIcon,
  Award,
  Settings,
  LayoutGrid,
  Laugh,
  Eye,
  ArrowRight,
  ChevronRight,
  LogIn,
  CheckCircle2,
  Clock,
  Brain,
  Loader2,
  Zap,
  HelpCircle,
  Landmark,
  Shield,
  Radio,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useEconomy } from '@/context/economy-context'
import { calculateLevelProgress } from '@/lib/progression'
import { UserAvatar } from '@/components/UserAvatar'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { GlobalBackButton } from '@/components/navigation/GlobalBackButton'
import { safeRandomUUID, cn } from '@/lib/utils'
import {
  resolveDailyMissions,
  claimDailyMissionReward,
  getLisbonMidnightCountdown,
  type DailyMissionWithProgress,
} from '@/lib/daily-missions-service'
import { OFFICIAL_PORTO_LISBOA_ID } from '@/lib/events-service'

export interface JogarHubProps {
  onStartClassicMatch?: (gameId?: string) => void
}

export function JogarHub({ onStartClassicMatch }: JogarHubProps) {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()
  const { coins, formattedCoins } = useEconomy()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [claimingMissionId, setClaimingMissionId] = useState<string | null>(null)
  const [claimFeedback, setClaimFeedback] = useState<{ title: string; message: string } | null>(null)
  const [countdownText, setCountdownText] = useState<string>('')

  // 1. Contador em tempo real até à renovação da meia-noite em Lisboa
  useEffect(() => {
    const updateCountdown = () => {
      const cd = getLisbonMidnightCountdown()
      setCountdownText(cd.formatted)
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  // 2. Cálculo do nível, patente e progresso de XP do jogador
  const userXp = profile?.xp || 0
  const levelProgress = useMemo(() => calculateLevelProgress(userXp), [userXp])
  const streakDays = profile?.streak || 0
  const userDistrict = profile?.district || profile?.representedDistrict || ''

  // 3. Missões diárias reais calculadas a partir das partidas e ações do utilizador
  const dailyMissions: DailyMissionWithProgress[] = useMemo(() => {
    return resolveDailyMissions(profile)
  }, [profile])

  const completedCount = dailyMissions.filter((m) => m.isComplete).length
  const totalMissions = dailyMissions.length

  // Tratamento de navegação e bloqueio de visitante
  const handleAction = useCallback(
    (route: string, isMatchAction = false, actionId = 'action') => {
      if (!user) {
        setAuthWallTarget(route)
        setAuthWallOpen(true)
        return
      }

      setLoadingAction(actionId)

      if (isMatchAction && onStartClassicMatch && route.includes('desafio-nacional')) {
        const matchGameId = safeRandomUUID()
        onStartClassicMatch(matchGameId)
        return
      }

      if (isMatchAction && !route.includes('gameType=')) {
        const separator = route.includes('?') ? '&' : '?'
        router.push(`${route}${separator}gameType=normal`)
        return
      }

      router.push(route)
    },
    [user, onStartClassicMatch, router]
  )

  const handleStartClassic = useCallback(() => {
    const gameId = safeRandomUUID()
    const target = `/jogar?gameType=normal&cat=desafio-nacional&game=${gameId}`
    if (!user) {
      setAuthWallTarget(target)
      setAuthWallOpen(true)
      return
    }
    setLoadingAction('classic')
    if (onStartClassicMatch) {
      onStartClassicMatch(gameId)
    } else {
      router.push(target)
    }
  }, [user, onStartClassicMatch, router])

  // Reclamação atómica de recompensa de missão diária
  const handleClaimMission = async (missionId: string) => {
    if (!user) {
      setAuthWallTarget('/jogar')
      setAuthWallOpen(true)
      return
    }

    setClaimingMissionId(missionId)
    setClaimFeedback(null)

    try {
      const res = await claimDailyMissionReward(user.uid, missionId)
      setClaimFeedback({
        title: 'Recompensa Recebida!',
        message: res.message,
      })
      setTimeout(() => setClaimFeedback(null), 6000)
    } catch (err: any) {
      setClaimFeedback({
        title: 'Aviso',
        message: err?.message || 'Não foi possível reclamar a recompensa.',
      })
      setTimeout(() => setClaimFeedback(null), 5000)
    } finally {
      setClaimingMissionId(null)
    }
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-12 text-white select-none animate-fadeIn space-y-6 sm:space-y-8">
      {/* ========================================================================= */}
      {/* 0. NAVEGAÇÃO SUPERIOR & INDICADOR DE TRANSMISSÃO                          */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        <GlobalBackButton showAlways={true} fallbackUrl="/" />

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-mono shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold text-emerald-400">EM TRANSMISSÃO</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-300 font-semibold hidden sm:inline">ARENA OFICIAL</span>
            <span className="text-xs">🇵🇹</span>
          </div>

          <Link
            href="/beta"
            title="Versão de Competição Nacional"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-[10px] font-mono text-amber-300 hover:border-amber-400 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-bold">BETA</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CENTRO DE COMANDO DO JOGADOR (HERO DE IDENTIDADE E PROGRESSO)           */}
      {/* ========================================================================= */}
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-blue-950/40 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl transition-all">
        {/* Glows de iluminação de estúdio */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        {user && !profile ? (
          <div className="flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-14 h-14 rounded-full bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-800 rounded" />
                <div className="h-2 w-48 bg-slate-800/60 rounded" />
              </div>
            </div>
            <div className="h-10 w-24 bg-slate-800 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            {/* Bloco do Jogador: Avatar + Identidade + Nível + Barra de XP */}
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <Link
                href={user ? '/perfil' : '/entrar?redirect=/jogar'}
                className="relative shrink-0 group active:scale-95 transition-transform"
                title={user ? 'Ver Perfil Oficial' : 'Iniciar Sessão'}
              >
                <div className="relative">
                  <UserAvatar
                    profile={profile}
                    size="md"
                    className="w-13 h-13 sm:w-16 sm:h-16 shadow-xl ring-2 ring-emerald-500/40 group-hover:ring-emerald-400 transition-all"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-950/90 border border-emerald-500/40 text-[9px] font-mono font-black text-emerald-400 shadow">
                    NV.{levelProgress.currentLevel.level}
                  </span>
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                {/* Nome + Patente + Distrito */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-base sm:text-lg text-white truncate drop-shadow-sm">
                    {user ? (profile?.displayName || user.displayName || 'Jogador') : 'Jogador Convidado'}
                  </span>

                  {user && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Zap className="w-3 h-3 text-emerald-400" />
                      {levelProgress.currentLevel.cleanTitle}
                    </span>
                  )}

                  {user && userDistrict ? (
                    <Link
                      href="/meu-distrito"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                      title="O Teu Distrito Representado"
                    >
                      <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{userDistrict}</span>
                    </Link>
                  ) : user ? (
                    <Link
                      href="/meu-distrito"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10 hover:border-cyan-400/40 transition-colors"
                    >
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      <span>Escolher Distrito</span>
                    </Link>
                  ) : null}
                </div>

                {/* Barra de Progresso de XP Dinâmica e Rigorosa */}
                <div className="mt-2 space-y-1 max-w-md">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                    <span className="text-slate-400">Progresso de Nível</span>
                    <span className="text-emerald-400">
                      {levelProgress.isMaxLevel ? (
                        'NÍVEL MÁXIMO ALCANÇADO'
                      ) : (
                        `Faltam ${levelProgress.xpRemaining.toLocaleString('pt-PT')} XP para o Nível ${levelProgress.nextLevel?.level}`
                      )}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-950/80 overflow-hidden border border-white/10 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${Math.max(4, Math.min(100, levelProgress.progressPercentage))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{levelProgress.xpIntoLevel.toLocaleString('pt-PT')} XP</span>
                    <span>{levelProgress.xpNeededForLevel.toLocaleString('pt-PT')} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Métricas: Sequência + Saldo de Acordas / Iniciar Sessão */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
              {/* Indicador de Sequência (Streak) */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 shadow-sm"
                title={`${streakDays} ${streakDays === 1 ? 'dia consecutivo' : 'dias consecutivos'} de jogo`}
              >
                <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                </div>
                <div>
                  <div className="font-mono font-black text-sm leading-none text-rose-300">
                    {streakDays} {streakDays === 1 ? 'Dia' : 'Dias'}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-rose-400/80 mt-0.5">
                    Sequência
                  </div>
                </div>
              </div>

              {/* Saldo de Acordas */}
              <Link
                href="/loja"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition-all active:scale-95"
                title="Loja Oficial de Acordas"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-sm leading-none text-amber-300">
                    {user ? (formattedCoins || coins.toLocaleString('pt-PT')) : '0'}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-400/80 mt-0.5">
                    Acordas
                  </div>
                </div>
              </Link>

              {/* Botão de Iniciar Sessão para Convidados */}
              {!user && authResolved && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthWallTarget('/jogar')
                    setAuthWallOpen(true)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO PRINCIPAL — PALCO NACIONAL (ARENA DE COMPETIÇÃO TELEVISIVA)       */}
      {/* ========================================================================= */}
      <section
        aria-label="Arena Principal: Palco Nacional"
        className="relative overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-amber-400/50 bg-gradient-to-b from-slate-950/95 via-blue-950/80 to-slate-950/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.2)] hover:border-amber-400/80 transition-all duration-300"
      >
        {/* Cantoneiras Heráldicas Douradas de Estúdio */}
        <span className="pointer-events-none absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />

        {/* Holofotes de Estúdio Televisivo */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 via-cyan-500/15 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>CONCURSO NACIONAL • 10 PERGUNTAS</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              ARENA NACIONAL
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-sm">
              Entra no grande palco televisivo e responde às 10 perguntas cronometradas. Conquista XP, ganha Acordas e leva o teu distrito ao topo de Portugal!
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs font-mono text-slate-300">
              <span className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>60s por pergunta</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ranking Oficial</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              disabled={loadingAction === 'classic'}
              onClick={handleStartClassic}
              className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-display font-black text-base sm:text-xl uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_55px_rgba(245,158,11,0.9)] active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-75"
            >
              {loadingAction === 'classic' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                  <span>A INICIAR PALCO...</span>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                  </div>
                  <span>ENTRAR NO PALCO</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MISSÕES DIÁRIAS (TOTALMENTE FUNCIONAIS E DINÂMICAS)                    */}
      {/* ========================================================================= */}
      <section aria-label="Missões Diárias" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              MISSÕES DIÁRIAS
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {completedCount} de {totalMissions} Concluídas
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Renova em:</span>
            <span className="font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
              {countdownText || 'A calcular...'}
            </span>
          </div>
        </div>

        {/* Feedback de Recompensa Reclamada com Animação de Sucesso */}
        {claimFeedback && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-emerald-500/20 border border-emerald-400/50 backdrop-blur-xl shadow-lg animate-fadeIn flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <p className="font-display font-black text-sm uppercase text-white">{claimFeedback.title}</p>
                <p className="text-xs text-emerald-200 mt-0.5">{claimFeedback.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setClaimFeedback(null)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Grelha de 3 Missões Diárias com Progresso Real */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {dailyMissions.map((mission) => {
            const isClaiming = claimingMissionId === mission.id

            return (
              <div
                key={mission.id}
                className={cn(
                  'relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between',
                  mission.isClaimed
                    ? 'border-white/10 bg-slate-900/50 opacity-80'
                    : mission.isComplete
                    ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/15 to-slate-900/90 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                    : 'border-white/10 bg-slate-900/70 hover:border-emerald-500/40'
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                        mission.isClaimed
                          ? 'bg-slate-800 text-slate-400 border-white/5'
                          : mission.isComplete
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-black animate-pulse'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      )}
                    >
                      {mission.isClaimed ? 'Concluída' : mission.isComplete ? 'Pronta a Reclamar' : 'Em Progresso'}
                    </span>

                    <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      +{mission.xpReward} XP • +{mission.coinsReward} €
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-black text-base uppercase text-white tracking-tight">
                      {mission.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Progresso</span>
                    <span className="font-bold text-white">
                      {user ? `${mission.progress} / ${mission.target}` : 'Sessão necessária'}
                    </span>
                  </div>

                  {/* Barra de Progresso Real */}
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-white/10">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        mission.isClaimed
                          ? 'bg-slate-600'
                          : mission.isComplete
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      )}
                      style={{ width: `${user ? mission.percentage : 0}%` }}
                    />
                  </div>

                  {/* Botão de Ação / Reclamar Recompensa */}
                  {user && mission.isComplete && !mission.isClaimed ? (
                    <button
                      type="button"
                      disabled={isClaiming}
                      onClick={() => handleClaimMission(mission.id)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/30 cursor-pointer active:scale-95 transition-all"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>A Reclamar...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Reclamar Recompensa</span>
                        </>
                      )}
                    </button>
                  ) : mission.isClaimed ? (
                    <div className="w-full py-2 text-center text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recompensa Reclamada</span>
                    </div>
                  ) : !user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthWallTarget('/jogar')
                        setAuthWallOpen(true)
                      }}
                      className="w-full py-2 text-center text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl border border-amber-500/30 transition-colors"
                    >
                      Inicia sessão para registar
                    </button>
                  ) : (
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400">
                        {mission.percentage}% cumprido
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MODOS DE JOGO OFICIAIS                                                 */}
      {/* ========================================================================= */}
      <section aria-label="Modos de Jogo Oficiais" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              MODOS DE JOGO
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Arenas Principais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: 🎯 CLÁSSICO */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleStartClassic}
            onKeyDown={(e) => e.key === 'Enter' && handleStartClassic()}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-emerald-400/70 p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Principal • Solo
                </span>
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-display font-black text-xl uppercase text-white group-hover:text-emerald-300 transition-colors">
                CLÁSSICO
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A experiência central do Acorda Portugal. 10 perguntas cronometradas para pontuar na tabela nacional.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="font-mono text-[11px] text-slate-400">10 Perguntas • 60s</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-display uppercase tracking-wider">
                Entrar →
              </span>
            </div>
          </div>

          {/* Card 2: ⚔️ MULTIPLAYER (DUELO 1v1) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar/duelo', false, 'duelo')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar/duelo', false, 'duelo')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-amber-400/70 p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Competitivo • 1v1
                </span>
                <span className="text-2xl">⚔️</span>
              </div>
              <h3 className="font-display font-black text-xl uppercase text-white group-hover:text-amber-300 transition-colors">
                MULTIPLAYER
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Enfrenta outros jogadores em tempo real através do matchmaking nacional. Duelo de rapidez e precisão.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="font-mono text-[11px] text-slate-400">Matchmaking em Direto</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-display uppercase tracking-wider">
                Desafiar →
              </span>
            </div>
          </div>

          {/* Card 3: 🇵🇹 MEU DISTRITO */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/meu-distrito', false, 'distrito')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/meu-distrito', false, 'distrito')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-cyan-400/70 p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Territorial • 18 Distritos
                </span>
                <span className="text-2xl">🇵🇹</span>
              </div>
              <h3 className="font-display font-black text-xl uppercase text-white group-hover:text-cyan-300 transition-colors">
                MEU DISTRITO
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {userDistrict ? (
                  <>A representar com orgulho o distrito de <strong className="text-cyan-300">{userDistrict}</strong>. Conquista pontos para a liderança distrital.</>
                ) : (
                  'Escolhe o teu distrito oficial e conquista pontos vitais para a Guerra dos 18 Distritos.'
                )}
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="font-mono text-[11px] text-slate-400">
                {userDistrict ? userDistrict : 'Selecionar'}
              </span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform font-display uppercase tracking-wider">
                {userDistrict ? 'Defender →' : 'Escolher →'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EXPERIÊNCIAS ESPECIAIS (MODO MALUCO & DESAFIO VISUAL)                 */}
      {/* ========================================================================= */}
      <section aria-label="Experiências Especiais" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              EXPERIÊNCIAS ESPECIAIS
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Formatos Únicos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {/* MODO MALUCO */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar?cat=modo-maluco', true, 'maluco')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar?cat=modo-maluco', true, 'maluco')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/90 hover:border-rose-400/70 p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Laugh className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-base uppercase text-white group-hover:text-rose-300 transition-colors">
                    Modo Maluco
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Humor & Memes
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Humor absurdo, rasteiras culturais, memes portugueses e perguntas insólitas para quem não tem medo de errar.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-rose-400">
              <span className="font-mono text-[11px] text-slate-400">Perguntas Insólitas</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Jogar Agora →
              </span>
            </div>
          </div>

          {/* DESAFIO VISUAL */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar?cat=desafio-visual', true, 'visual')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar?cat=desafio-visual', true, 'visual')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-900/90 hover:border-blue-400/70 p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-base uppercase text-white group-hover:text-blue-300 transition-colors">
                    Desafio Visual
                  </span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Património & Fotos
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Monumentos históricos, brasões heráldicos, bandeiras, mapas e património fotográfico nacional de alta definição.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400">
              <span className="font-mono text-[11px] text-slate-400">Desafio por Imagens</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Jogar Agora →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GRANDE EVENTO OFICIAL ATIVO (PORTO ⚔️ LISBOA — O GRANDE DUELO)          */}
      {/* ========================================================================= */}
      <section aria-label="Grande Evento Ativo" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              GRANDE EVENTO EM CURSO
            </h2>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">Torneio Ativo</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-red-950/90 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-red-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <span>⚔️ O GRANDE DUELO DE PORTUGAL</span>
              </div>

              <h3 className="font-display font-black text-xl sm:text-3xl uppercase tracking-tight text-white">
                PORTO ⚔️ LISBOA
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Dois territórios. Dois gigantes. FC Porto vs SL Benfica. Responde a perguntas de alta dificuldade e disputa o prémio máximo.
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs font-mono text-amber-300">
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  🥇 1º Lugar: Troféu Supremo + 50.000 Acordas
                </span>
                <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/10 hidden sm:inline">
                  Até 10 partidas diárias
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center">
              <Link
                href="/eventos?event=porto-lisboa"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-400/30 active:scale-95 transition-all"
              >
                <span>Participar no Duelo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CATEGORIAS DE CONTEÚDO (EXPLORAÇÃO POR TEMA)                           */}
      {/* ========================================================================= */}
      <section aria-label="Categorias de Conteúdo" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              CATEGORIAS POR TEMA
            </h2>
          </div>
          <Link
            href="/categorias"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>Ver Todas as 18</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {[
            { slug: 'historia', name: 'História', icon: '🏛️', desc: 'Reis e eras' },
            { slug: 'futebol-portugues', name: 'Futebol', icon: '⚽', desc: 'Craques e dérbis' },
            { slug: 'gastronomia', name: 'Gastronomia', icon: '🍷', desc: 'Sabores e vinhos' },
            { slug: 'geografia-portuguesa', name: 'Geografia', icon: '🗺️', desc: 'Rios e serras' },
            { slug: 'atualidade', name: 'Atualidade', icon: '📰', desc: 'Portugal agora' },
            { slug: 'artes-e-literatura', name: 'Artes', icon: '🎭', desc: 'Cultura lusa' },
          ].map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => handleAction(`/jogar?cat=${cat.slug}`, true, cat.slug)}
              className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-400/50 backdrop-blur-xl transition-all text-left flex flex-col justify-between active:scale-95 cursor-pointer"
            >
              <div>
                <span className="text-xl sm:text-2xl mb-2 block group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="font-display font-black text-xs uppercase text-white block group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {cat.desc}
                </span>
              </div>
              <div className="mt-2 text-[10px] font-mono font-bold text-emerald-400/80 group-hover:text-emerald-300">
                Jogar →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CENTRAL DE ACESSOS RÁPIDOS (ATALHOS DA CONTA E COMUNIDADE)              */}
      {/* ========================================================================= */}
      <section aria-label="Acessos Rápidos da Central" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
            CENTRAL DO JOGADOR
          </h2>
          <span className="text-xs font-mono text-slate-400">Atalhos Oficiais</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Ranking */}
          <Link
            href="/rankings"
            className="group p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-400/50 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-amber-300 transition-colors">
                Ranking
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Tabela nacional
              </span>
            </div>
          </Link>

          {/* Loja */}
          <Link
            href="/loja"
            className="group p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-teal-400/50 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-teal-300 transition-colors">
                Loja
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Usa as tuas Acordas
              </span>
            </div>
          </Link>

          {/* Perfil */}
          <Link
            href={user ? '/perfil' : '/entrar?redirect=/perfil'}
            className="group p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-blue-400/50 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-blue-300 transition-colors">
                Perfil
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                O teu progresso
              </span>
            </div>
          </Link>

          {/* Conquistas */}
          <Link
            href="/conquistas"
            className="group p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-indigo-400/50 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-indigo-300 transition-colors">
                Conquistas
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Troféus & Medalhas
              </span>
            </div>
          </Link>

          {/* Definições */}
          <Link
            href="/definicoes"
            className="group p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-400/50 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95 col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-700/30 text-slate-300 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-slate-200 transition-colors">
                Definições
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Áudio & Preferências
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Modal de Bloqueio para Convidados */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}
