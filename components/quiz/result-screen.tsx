'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Flame,
  Sparkles,
  Coins,
  RotateCcw,
  Crown,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react'
import { LevelUpModal } from '@/components/game/LevelUpModal'
import { cn } from '@/lib/utils'
import { calculateLevelProgress } from '@/lib/progression'
import type { MatchRewardOutcome } from '@/lib/xp-service'

export type QuizResult = {
  score: number
  correct: number
  total: number
  xp: number
  euros: number
  bestStreak: number
}

type LevelUpInfo = {
  from: number
  to: number
}

export function ResultScreen({
  result,
  gameId,
  onReplay,
  onGameEnd,
  levelUpInfo,
  rewardOutcome,
  savingReward,
  syncError,
}: {
  result: QuizResult
  gameId: string
  onReplay?: () => void
  onGameEnd?: (gameId: string, result: QuizResult) => Promise<void>
  levelUpInfo?: LevelUpInfo
  rewardOutcome?: MatchRewardOutcome | null
  savingReward?: boolean
  syncError?: string | null
}) {
  const accuracy = Math.round((result.correct / result.total) * 100)
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)

  // Estados animados para contagem suave de números
  const [displayedXp, setDisplayedXp] = useState<number>(() => {
    if (rewardOutcome) return rewardOutcome.oldXp
    if (typeof window !== 'undefined') {
      const s = Number(localStorage.getItem('user_xp') || 0)
      return s > 0 ? s : 0
    }
    return 0
  })

  const [displayedCoins, setDisplayedCoins] = useState<number>(() => {
    if (rewardOutcome) return rewardOutcome.oldCoins
    if (typeof window !== 'undefined') {
      const s = Number(localStorage.getItem('user_coins') || 0)
      return s > 0 ? s : 0
    }
    return 0
  })

  // Flag para disparar a animação apenas uma vez por transição confirmada
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!rewardOutcome) return
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    const startXp = rewardOutcome.oldXp
    const endXp = rewardOutcome.newTotalXp
    const startCoins = rewardOutcome.oldCoins
    const endCoins = rewardOutcome.newTotalCoins

    const duration = 1200 // 1.2 segundos
    const startTime = performance.now()

    const animateCounters = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      // Curva easeOutCubic para desaceleração satisfatória
      const ease = 1 - Math.pow(1 - progress, 3)

      const currentXpVal = Math.round(startXp + (endXp - startXp) * ease)
      const currentCoinsVal = Math.round(startCoins + (endCoins - startCoins) * ease)

      setDisplayedXp(currentXpVal)
      setDisplayedCoins(currentCoinsVal)

      if (progress < 1) {
        requestAnimationFrame(animateCounters)
      } else {
        setDisplayedXp(endXp)
        setDisplayedCoins(endCoins)
        if (rewardOutcome.leveledUp || levelUpInfo) {
          setTimeout(() => setShowLevelUpModal(true), 400)
        }
      }
    }

    const animId = requestAnimationFrame(animateCounters)
    return () => cancelAnimationFrame(animId)
  }, [rewardOutcome, levelUpInfo])

  // Progresso do nível calculado a partir do XP atualmente animado
  const currentProg = calculateLevelProgress(displayedXp)
  const isLeveledUp = Boolean(rewardOutcome?.leveledUp || (levelUpInfo && levelUpInfo.to > levelUpInfo.from))

  return (
    <div className="animate-rise mx-auto max-w-lg px-2 sm:px-0 select-none pb-8">
      {showLevelUpModal && (
        <LevelUpModal
          from={levelUpInfo?.from || rewardOutcome?.oldLevel || currentProg.currentLevel.level - 1}
          to={levelUpInfo?.to || rewardOutcome?.newLevel || currentProg.currentLevel.level}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}

      <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-card/90 p-5 sm:p-7 text-center backdrop-blur-2xl shadow-2xl">
        {/* Decoração sutil de azulejo */}
        <div className="pattern-azulejo pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

        {/* Ambient Corner Glows */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-gold to-flag-red" />

        {/* Hero Crown / Medal Badge */}
        <div className="relative mx-auto grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-3xl bg-gradient-to-br from-gold/30 via-gold/10 to-transparent text-gold ring-2 ring-gold/40 shadow-[0_0_30px_rgba(255,200,0,0.25)] animate-pop">
          <Crown className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_0_12px_rgba(255,200,0,0.5)]" />
        </div>

        <div className="relative mt-4">
          <span className="inline-block rounded-full bg-white/5 px-3.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.28em] text-primary border border-primary/25">
            Partida Concluída
          </span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            {accuracy >= 80 ? 'Excelente Desempenho!' : accuracy >= 50 ? 'Bom Trabalho!' : 'Continua a Tentar!'}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            O teu conhecimento de Portugal foi testado.
          </p>
        </div>

        {/* Pontuação Conquistada */}
        <div className="relative mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 backdrop-blur-md">
          <p className="font-display text-4xl sm:text-5xl font-black tabular-nums text-gold-gradient drop-shadow-sm">
            {result.score.toLocaleString('pt-PT')}
          </p>
          <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Pontos Conquistados
          </p>
        </div>

        {/* Precisão e Acertos */}
        <div className="relative mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">Certas</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-black text-foreground">
              {result.correct} <span className="text-xs text-muted-foreground">/ {result.total}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <Award className="h-3.5 w-3.5" />
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">Precisão</span>
            </div>
            <p className="font-display text-lg sm:text-xl font-black text-primary">
              {accuracy}%
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERÓI DA PROGRESSÃO: BARRA DE XP ANIMADA E NOVO TOTAL      */}
        {/* ========================================================= */}
        <div className="relative mt-4 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent p-4 sm:p-5 backdrop-blur-md text-left shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40 font-black text-base shadow-sm">
                ⭐
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-sm sm:text-base font-black text-white truncate">
                    Nível {currentProg.currentLevel.level} • {currentProg.currentLevel.cleanTitle}
                  </span>
                  {isLeveledUp && (
                    <span className="animate-pulse rounded-full bg-gold px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-sm border border-gold/40">
                      🆙 Subiste de Nível!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                  {currentProg.isMaxLevel
                    ? '👑 Nível Máximo de Prestígio Atingido!'
                    : `Faltam ${currentProg.xpRemaining.toLocaleString('pt-PT')} XP para o Nível ${currentProg.nextLevel?.level}`}
                </p>
              </div>
            </div>

            {/* Ganho de XP Destacado */}
            <div className="shrink-0 flex flex-col items-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 font-display text-xs sm:text-sm font-black text-primary border border-primary/40 shadow-[0_0_15px_rgba(0,255,162,0.3)] animate-pop">
                <Sparkles className="h-3.5 w-3.5" />
                +{rewardOutcome ? rewardOutcome.xpEarned : result.xp} XP
              </span>
            </div>
          </div>

          {/* Barra de Progresso Visual de XP */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300 mb-1">
              <span>{displayedXp.toLocaleString('pt-PT')} XP</span>
              <span>{(currentProg.nextLevelXp || currentProg.currentLevelXp).toLocaleString('pt-PT')} XP</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950/90 border border-white/10 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-primary to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(0,255,162,0.6)]"
                style={{ width: `${currentProg.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grelha de Recompensas Complementares (Euros, Sequência, Streak) */}
        <div className="relative mt-3 grid grid-cols-3 gap-2">
          <Reward
            icon={Sparkles}
            tone="primary"
            value={`+${rewardOutcome ? rewardOutcome.xpEarned : result.xp}`}
            label="XP Ganho"
          />
          <Reward
            icon={Coins}
            tone="gold"
            value={`+€${rewardOutcome ? rewardOutcome.coinsEarned : result.euros}`}
            label="Euros"
            sub={rewardOutcome ? `Saldo: €${displayedCoins.toLocaleString('pt-PT')}` : undefined}
          />
          <Reward
            icon={Flame}
            tone="red"
            value={rewardOutcome ? `${rewardOutcome.newStreak} Dias` : `${result.bestStreak}x`}
            label={rewardOutcome ? 'Sequência Diária' : 'Melhor Série'}
            sub={rewardOutcome && rewardOutcome.newStreak > rewardOutcome.oldStreak ? '🔥 +1 Hoje!' : undefined}
          />
        </div>

        {/* Status de Sincronização da Recompensa / Retry Seguro */}
        <div className="mt-3 text-center text-xs">
          {savingReward ? (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              A guardar o teu progresso com o servidor...
            </span>
          ) : syncError ? (
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
              <div className="flex items-center gap-1 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Não foi possível guardar o resultado na rede.</span>
              </div>
              {onGameEnd && (
                <button
                  type="button"
                  onClick={() => void onGameEnd(gameId, result)}
                  className="mt-1 inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1 text-[11px] font-black text-white hover:bg-rose-600 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Tentar Novamente Seguro
                </button>
              )}
            </div>
          ) : rewardOutcome ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              XP, Nível e Moedas Confirmados no Teu Perfil
            </span>
          ) : null}
        </div>

        {/* Missões Concluídas na Partida */}
        {rewardOutcome && rewardOutcome.completedMissions && rewardOutcome.completedMissions.length > 0 && (
          <div className="mt-3 space-y-1.5 text-left">
            {rewardOutcome.completedMissions.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-xs shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">🎯</span>
                  <div className="min-w-0">
                    <p className="font-black text-cyan-300 truncate">Missão Concluída!</p>
                    <p className="text-[11px] text-slate-300 truncate">{mission.title}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono font-bold text-cyan-200 text-xs bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {mission.reward}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Conquistas Desbloqueadas na Partida */}
        {rewardOutcome && rewardOutcome.unlockedAchievements && rewardOutcome.unlockedAchievements.length > 0 && (
          <div className="mt-3 space-y-1.5 text-left">
            {rewardOutcome.unlockedAchievements.map((ach) => (
              <Link
                key={ach.id}
                href="/perfil?tab=conquistas"
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-primary/15 to-amber-500/20 border border-amber-500/40 hover:scale-[1.01] transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl animate-bounce">{ach.icon || '🏆'}</span>
                  <div className="min-w-0">
                    <p className="font-black text-amber-300 text-xs sm:text-sm truncate">
                      Nova Conquista: {ach.title}
                    </p>
                    {ach.description && (
                      <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                        {ach.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm group-hover:bg-amber-400">
                  Reclamar →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="relative mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onReplay}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] py-3.5 px-6 font-display text-sm sm:text-base font-black uppercase tracking-wider text-primary-foreground shadow-[0_12px_40px_-5px_rgba(0,255,162,0.4)] transition-all duration-300 hover:scale-[1.01] hover:bg-[position:100%_0] active:scale-[0.99] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
            <span>Jogar Novamente</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href="/#ranking"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs font-bold text-foreground transition-all hover:bg-white/10 hover:border-white/20"
            >
              <Trophy className="h-4 w-4 text-gold" />
              <span>Ver Ranking</span>
            </Link>

            <Link
              href="/jogar"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-xs font-bold text-foreground transition-all hover:bg-white/10 hover:border-white/20"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span>Central de Jogo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reward({
  icon: Icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: 'primary' | 'gold' | 'red'
  value: string
  label: string
  sub?: string
}) {
  const tones = {
    primary: 'text-primary border-primary/20 bg-primary/10',
    gold: 'text-gold border-gold/20 bg-gold/10',
    red: 'text-flag-red border-flag-red/20 bg-flag-red/10',
  }
  return (
    <div className={cn('rounded-2xl border p-2.5 text-center backdrop-blur-sm', tones[tone])}>
      <Icon className="mx-auto h-4 w-4 drop-shadow-sm" />
      <p className="mt-1 font-display text-sm sm:text-base font-black text-foreground">{value}</p>
      <p className="text-[0.56rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[0.55rem] font-medium text-slate-300 truncate">{sub}</p>}
    </div>
  )
}
