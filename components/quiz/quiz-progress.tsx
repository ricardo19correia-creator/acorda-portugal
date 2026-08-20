import {
  QUESTION_TIME_SECONDS,
  WARNING_TIME_THRESHOLD,
  calculateTimePercentage,
} from '@/config/quiz'
import { cn } from '@/lib/utils'

export function QuizProgress({
  index,
  total,
  seconds,
  maxSeconds = 60,
}: {
  index: number
  total: number
  seconds: number
  maxSeconds?: number
}) {
  const pct = Math.min(100, Math.round((index / total) * 100))
  const currentSeconds = Math.max(0, Math.min(60, seconds))
  const timePct = (currentSeconds / 60) * 100
  const danger = currentSeconds <= 10

  // SVG circular radius (r = 24)
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (currentSeconds / 60) * circumference

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-card/75 p-3.5 sm:p-4 backdrop-blur-xl shadow-lg">
      {/* Question progress */}
      <div className="min-w-0 flex-1 pl-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-muted-foreground">
              Progresso
            </span>
          </div>
          <div className="flex items-baseline gap-1 font-display font-black">
            <span className="text-base text-foreground sm:text-lg">
              {String(index).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground">/ {total}</span>
          </div>
        </div>

        {/* Multi-stop glowing Portuguese gradient progress bar */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-gold shadow-[0_0_12px_rgba(0,255,162,0.4)] transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Modern Circular Timer */}
      <div
        className={cn(
          'relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300',
          danger
            ? 'border-flag-red/60 bg-flag-red/15 text-flag-red shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            : 'border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,255,162,0.15)]',
        )}
      >
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 p-1" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r={radius}
            className="stroke-white/10"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r={radius}
            className={cn(
              'transition-all duration-1000 ease-linear',
              danger ? 'stroke-flag-red' : 'stroke-primary',
            )}
            strokeWidth="3.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {danger && (
          <span className="absolute inset-0 rounded-2xl border border-flag-red/60 animate-pulse-ring" />
        )}

        <div className="relative flex flex-col items-center justify-center leading-none">
          <span className="font-display text-lg font-black tabular-nums tracking-tight">
            {String(Math.max(0, Math.floor(seconds))).padStart(2, '0')}
          </span>
          <span className="text-[0.52rem] font-bold uppercase tracking-tighter opacity-70">
            seg
          </span>
        </div>
      </div>
    </div>
  )
}

