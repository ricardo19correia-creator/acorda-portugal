'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Sparkles, Coins, RotateCcw, MapPin, Crown, ArrowLeft, Award, CheckCircle2 } from 'lucide-react'
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
        <LevelUpAnimation from={levelUpInfo.from} to={levelUpInfo.to} onAnimationEnd={() => setShowLevelUp(false)} />
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

function LevelUpAnimation({ from, to, onAnimationEnd }: { from: number, to: number, onAnimationEnd: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 5000)
    return () => clearTimeout(timer)
  }, [onAnimationEnd])

  return (
    <div
      onClick={onAnimationEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-level-up-pop relative w-full max-w-sm overflow-hidden rounded-4xl border border-gold/50 bg-gradient-to-b from-card via-slate-900 to-background p-6 sm:p-8 text-center shadow-2xl shadow-gold/25 cursor-default"
      >
        <div className="sheen absolute inset-0 pointer-events-none" />
        <div className="animate-level-up-glow absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-gold/30 to-transparent pointer-events-none" />

        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(255,200,0,0.35)] animate-bounce">
          <Trophy className="h-9 w-9 text-gold drop-shadow-[0_0_15px_var(--gold)]" />
        </div>

        <span className="relative inline-block text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
          EVOLUÇÃO NACIONAL
        </span>

        <h2 className="relative mt-1 font-display text-2xl font-black uppercase tracking-widest text-gold-gradient">
          Subida de Nível!
        </h2>

        <p className="relative mt-2 text-xs font-medium text-slate-300">
          Parabéns! Alcançaste uma nova patente de conhecimento.
        </p>

        <div className="relative my-5 flex items-center justify-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center shadow-inner">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Anterior</span>
            <span className="font-display text-3xl font-black text-slate-300">Nível {from}</span>
          </div>

          <span className="text-2xl text-gold font-bold animate-pulse">→</span>

          <div className="rounded-2xl border border-amber-500/50 bg-amber-500/15 px-4 py-2 text-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <span className="text-[10px] font-black uppercase text-amber-300 block">Novo</span>
            <span className="font-display text-3xl font-black text-amber-400">Nível {to}</span>
          </div>
        </div>

        {/* Botão de Destaque CONTINUAR */}
        <div className="flex flex-col items-center gap-3 mt-6 w-full relative z-10">
          <button
            type="button"
            onClick={onAnimationEnd}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer hover:shadow-amber-500/50"
          >
            Continuar →
          </button>
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
