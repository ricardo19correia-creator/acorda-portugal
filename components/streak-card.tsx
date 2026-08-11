import { Flame, Check } from 'lucide-react'
import { WEEK_DAYS } from '@/lib/game-data'
import { cn } from '@/lib/utils'

export function StreakCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-flag-red/25 bg-gradient-to-br from-flag-red/15 via-card/70 to-card/70 p-6 backdrop-blur',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-flag-red/20 blur-2xl" />

      <div className="relative flex items-center gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-flag-red/15 text-flag-red">
          <span className="absolute h-12 w-12 rounded-full bg-flag-red/20 animate-pulse-ring" />
          <Flame className="relative h-8 w-8 fill-current" />
        </div>
        <div>
          <p className="font-display text-4xl font-black text-foreground">
            7 <span className="text-lg font-bold text-flag-red">dias</span>
          </p>
          <p className="text-sm font-medium text-muted-foreground">Sequência atual</p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-1.5">
        {WEEK_DAYS.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                'grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-colors',
                d.done
                  ? 'bg-flag-red text-flag-red-foreground shadow-[0_0_14px_-3px_var(--flag-red)]'
                  : 'bg-white/5 text-muted-foreground',
              )}
            >
              {d.done ? <Check className="h-4 w-4" /> : ''}
            </span>
            <span className="text-[0.6rem] font-semibold uppercase text-muted-foreground">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
