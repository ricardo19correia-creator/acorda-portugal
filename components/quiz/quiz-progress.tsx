import { cn } from '@/lib/utils'

export function QuizProgress({
  index,
  total,
  seconds,
  maxSeconds = 20,
}: {
  index: number
  total: number
  seconds: number
  maxSeconds?: number
}) {
  const pct = Math.min(100, Math.round((index / total) * 100))
  const timePct = Math.max(0, Math.min(100, (seconds / maxSeconds) * 100))
  const danger = seconds <= 5

  return (
    <div className="flex items-center gap-4">
      {/* question progress */}
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Pergunta</span>
          <span className="font-display text-sm text-foreground">
            {String(index).padStart(2, '0')}{' '}
            <span className="text-muted-foreground">/ {total}</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* timer */}
      <div
        className={cn(
          'relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border font-display transition-colors',
          danger
            ? 'border-flag-red/50 bg-flag-red/15 text-flag-red'
            : 'border-primary/40 bg-primary/10 text-primary',
        )}
      >
        {danger && (
          <span className="absolute inset-0 rounded-2xl border border-flag-red/50 animate-pulse-ring" />
        )}
        <span className="text-xl font-black tabular-nums">
          {String(Math.max(0, Math.floor(seconds))).padStart(2, '0')}
        </span>
        <span className="sr-only">segundos restantes</span>
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-1 left-1/2 h-1 -translate-x-1/2 rounded-full transition-all duration-500',
            danger ? 'bg-flag-red' : 'bg-primary',
          )}
          style={{ width: `${Math.max(6, timePct * 0.5)}px` }}
        />
      </div>
    </div>
  )
}
