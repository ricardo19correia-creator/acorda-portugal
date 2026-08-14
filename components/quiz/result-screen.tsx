'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Sparkles, Coins, RotateCcw, MapPin, Crown } from 'lucide-react'
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
  onReplay,
  onGameEnd,
  levelUpInfo,
}: {
  result: QuizResult
  onReplay?: () => void
  onGameEnd?: (result: QuizResult) => void
  levelUpInfo?: LevelUpInfo
}) {
  const accuracy = Math.round((result.correct / result.total) * 100)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    // Save progress when the result screen is shown
    onGameEnd?.(result)

    if (levelUpInfo) {
      const timer = setTimeout(() => setShowLevelUp(true), 500)
      return () => clearTimeout(timer)
    }
  }, [result, onGameEnd])

  return (
    <div className="animate-rise mx-auto max-w-lg">
      {showLevelUp && levelUpInfo && (
        <LevelUpAnimation from={levelUpInfo.from} to={levelUpInfo.to} onAnimationEnd={() => setShowLevelUp(false)} />
      )}

      <div className="sheen relative overflow-hidden rounded-4xl border border-gold/25 bg-gradient-to-b from-gold/10 via-card/70 to-card/70 p-8 text-center backdrop-blur">
        {/* corner glows */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-gold/30 to-gold/5 text-gold ring-1 ring-gold/40">
          <Crown className="h-10 w-10" />
        </div>

        <p className="relative mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Fim de partida
        </p>
        <h1 className="relative mt-1 font-display text-4xl font-black uppercase tracking-tight text-brand-gradient sm:text-5xl">
          Parabéns!
        </h1>

        {/* score */}
        <p className="relative mt-6 font-display text-6xl font-black tabular-nums text-gold-gradient sm:text-7xl">
          {result.score.toLocaleString('pt-PT')}
        </p>
        <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Pontos
        </p>

        {/* accuracy */}
        <div className="relative mx-auto mt-6 flex max-w-xs items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
          <div>
            <p className="font-display text-2xl font-black text-foreground">
              {result.correct} <span className="text-base text-muted-foreground">/ {result.total}</span>
            </p>
            <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Certas</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="font-display text-2xl font-black text-primary">{accuracy}%</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Acerto</p>
          </div>
        </div>

        {/* rewards */}
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          <Reward icon={Sparkles} tone="primary" value={`+${result.xp}`} label="XP" />
          <Reward icon={Coins} tone="gold" value={`+€${result.euros}`} label="Euros" />
          <Reward icon={Flame} tone="red" value={`${result.bestStreak}`} label="Seguidas" />
        </div>

        {/* ranking */}
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <RankTile icon={Trophy} label="Nacional" value="#127" />
          <RankTile icon={MapPin} label="Vila Real" value="#8" />
        </div>

        {/* actions */}
        <div className="relative mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="sheen group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-4 font-display font-bold uppercase tracking-wide text-primary-foreground shadow-[0_12px_40px_-8px_var(--primary)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[position:100%_0] focus-visible:ring-4 focus-visible:ring-primary/40"
          >
            <RotateCcw className="h-5 w-5" />
            Jogar novamente
          </button>
          <Link
            href="/#ranking"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-white/10"
          >
            <Trophy className="h-5 w-5 text-gold" />
            Ver ranking
          </Link>
        </div>
      </div>
    </div>
  )
}

function LevelUpAnimation({ from, to, onAnimationEnd }: { from: number, to: number, onAnimationEnd: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 3500) // Animation duration + delay
    return () => clearTimeout(timer)
  }, [onAnimationEnd])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="animate-level-up-pop relative w-full max-w-sm overflow-hidden rounded-4xl border border-gold/50 bg-gradient-to-b from-card to-background p-8 text-center shadow-2xl shadow-gold/20">
        <div className="sheen absolute inset-0" />
        <div className="animate-level-up-glow absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-gold/30 to-transparent" />

        <Trophy className="relative mx-auto h-16 w-16 text-gold drop-shadow-[0_0_15px_var(--gold)]" />
        <h2 className="relative mt-4 font-display text-2xl font-black uppercase tracking-widest text-gold-gradient">
          Subida de Nível!
        </h2>
        <p className="relative mt-4 font-display text-6xl font-black text-foreground">
          {from}
          <span className="mx-4 text-4xl text-gold">→</span>
          {to}
        </p>
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
    primary: 'text-primary',
    gold: 'text-gold',
    red: 'text-flag-red',
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4">
      <Icon className={cn('mx-auto h-5 w-5', tones[tone])} />
      <p className="mt-2 font-display text-lg font-black text-foreground">{value}</p>
      <p className="text-[0.58rem] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}

function RankTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <div>
        <p className="font-display text-lg font-black text-foreground">{value}</p>
        <p className="text-[0.58rem] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
