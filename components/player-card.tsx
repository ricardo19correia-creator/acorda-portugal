import { Coins, Flame, Sparkles, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Game-style player HUD. Visual only (no auth yet) — shows avatar, level badge,
 * XP progress bar, streak and virtual euros, styled like an in-game status panel.
 */
export function PlayerCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-5 backdrop-blur-md',
        className,
      )}
    >
      {/* corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-gold/10 blur-2xl" />

      <div className="relative flex items-center gap-4">
        {/* avatar + level badge */}
        <div className="relative shrink-0">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/35 to-accent/20 font-display text-2xl font-black text-primary ring-1 ring-primary/40">
            R
          </div>
          <span className="absolute -bottom-2 left-1/2 grid h-6 -translate-x-1/2 place-items-center rounded-full bg-gold px-2 text-[0.6rem] font-black uppercase tracking-wide text-gold-foreground ring-2 ring-card">
            Nível 1
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Jogador
          </p>
          <p className="truncate font-display text-2xl font-bold text-foreground">RIKY</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-flag-red/15 px-2 py-1 text-xs font-bold text-flag-red">
              <Flame className="h-3.5 w-3.5 fill-current" />
              Streak 0
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-gold/15 px-2 py-1 text-xs font-bold text-gold">
              <Coins className="h-3.5 w-3.5" />
              €0
            </span>
          </div>
        </div>

        <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" />
      </div>

      {/* XP progress */}
      <div className="relative mt-5">
        <div className="mb-1.5 flex items-center justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            XP
          </span>
          <span>0 / 1.000</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="shimmer relative h-full w-[3%] rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <p className="mt-2 text-[0.7rem] text-muted-foreground">
          Faltam <span className="font-semibold text-foreground">1.000 XP</span> para o Nível 2
        </p>
      </div>
    </div>
  )
}
