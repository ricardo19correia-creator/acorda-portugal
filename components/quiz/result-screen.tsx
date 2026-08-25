'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Sparkles, Coins, RotateCcw, MapPin, Crown, ArrowLeft, Award, CheckCircle2 } from 'lucide-react'
import { LevelUpModal } from '@/components/game/LevelUpModal'
import { cn } from '@/lib/utils'

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
}: {
  result: QuizResult
  gameId: string
  onReplay?: () => void
  onGameEnd?: (gameId: string, result: QuizResult) => Promise<void>
  levelUpInfo?: LevelUpInfo
}) {
  const accuracy = Math.round((result.correct / result.total) * 100)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    // Save progress when the result screen is shown
    void onGameEnd?.(gameId, result)

    if (levelUpInfo) {
      const timer = setTimeout(() => setShowLevelUp(true), 500)
      return () => clearTimeout(timer)
    }
  }, [gameId, result, onGameEnd, levelUpInfo])

  return (
    <div className="animate-rise mx-auto max-w-lg px-2 sm:px-0">
      {showLevelUp && levelUpInfo && (
        <LevelUpModal from={levelUpInfo.from} to={levelUpInfo.to} onClose={() => setShowLevelUp(false)} />
      )}

      <div className="relative overflow-hidden rounded-4xl border border-white/15 bg-card/90 p-6 sm:p-8 text-center backdrop-blur-2xl shadow-2xl">
        {/* Subtle Portuguese Azulejo & Calçada decoration */}
        <div className="pattern-azulejo pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
        
        {/* Ambient Corner Glows */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-gold to-flag-red" />

        {/* Hero Crown / Medal Badge */}
        <div className="relative mx-auto grid h-20 w-20 sm:h-24 sm:w-24 place-items-center rounded-3xl bg-gradient-to-br from-gold/30 via-gold/10 to-transparent text-gold ring-2 ring-gold/40 shadow-[0_0_30px_rgba(255,200,0,0.25)] animate-pop">
          <Crown className="h-10 w-10 sm:h-12 sm:w-12 drop-shadow-[0_0_12px_rgba(255,200,0,0.5)]" />
        </div>

        <div className="relative mt-5">
          <span className="inline-block rounded-full bg-white/5 px-3.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.28em] text-primary border border-primary/25">
            Partida Concluída
          </span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            {accuracy >= 80 ? 'Excelente Desempenho!' : accuracy >= 50 ? 'Bom Trabalho!' : 'Continua a Tentar!'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            O teu conhecimento de Portugal foi testado.
          </p>
        </div>

        {/* Score Display */}
        <div className="relative mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-md">
          <p className="font-display text-5xl sm:text-6xl font-black tabular-nums text-gold-gradient drop-shadow-sm">
            {result.score.toLocaleString('pt-PT')}
          </p>
          <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Pontos Conquistados
          </p>
        </div>

        {/* Accuracy & Corrects HUD */}
        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">Certas</span>
            </div>
            <p className="font-display text-xl sm:text-2xl font-black text-foreground">
              {result.correct} <span className="text-xs text-muted-foreground">/ {result.total}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
              <Award className="h-4 w-4" />
              <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">Precisão</span>
            </div>
            <p className="font-display text-xl sm:text-2xl font-black text-primary">
              {accuracy}%
            </p>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="relative mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          <Reward icon={Sparkles} tone="primary" value={`+${result.xp}`} label="XP Ganho" />
          <Reward icon={Coins} tone="gold" value={`+€${result.euros}`} label="Euros" />
          <Reward icon={Flame} tone="red" value={`${result.bestStreak}x`} label="Sequência" />
        </div>

        {/* Actions */}
        <div className="relative mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] py-4 px-6 font-display text-base font-black uppercase tracking-wider text-primary-foreground shadow-[0_12px_40px_-5px_rgba(0,255,162,0.4)] transition-all duration-300 hover:scale-[1.01] hover:bg-[position:100%_0] active:scale-[0.99] cursor-pointer"
          >
            <RotateCcw className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-45" />
            <span>Jogar Novamente</span>
          </button>

          {/* Banner de Celebração de Conquistas */}
          <Link
            href="/perfil?tab=conquistas"
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-primary/15 to-amber-500/20 border border-amber-500/40 text-left hover:scale-[1.01] transition-all shadow-lg group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🏆</span>
              <div>
                <p className="text-xs sm:text-sm font-black text-amber-300">
                  Conquista Concluída!
                </p>
                <p className="text-[11px] text-slate-300">
                  Vai ao teu Perfil para reclamar as tuas recompensas.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 shadow-md group-hover:bg-amber-400">
              Reclamar →
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/#ranking"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-xs sm:text-sm font-bold text-foreground transition-all hover:bg-white/10 hover:border-white/20"
            >
              <Trophy className="h-4 w-4 text-gold" />
              <span>Ver Ranking</span>
            </Link>

            <Link
              href="/jogar"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-4 text-xs sm:text-sm font-bold text-foreground transition-all hover:bg-white/10 hover:border-white/20"
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
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: 'primary' | 'gold' | 'red'
  value: string
  label: string
}) {
  const tones = {
    primary: 'text-primary border-primary/20 bg-primary/10',
    gold: 'text-gold border-gold/20 bg-gold/10',
    red: 'text-flag-red border-flag-red/20 bg-flag-red/10',
  }
  return (
    <div className={cn('rounded-2xl border p-3 text-center backdrop-blur-sm', tones[tone])}>
      <Icon className="mx-auto h-5 w-5 drop-shadow-sm" />
      <p className="mt-1.5 font-display text-base sm:text-lg font-black text-foreground">{value}</p>
      <p className="text-[0.58rem] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}
