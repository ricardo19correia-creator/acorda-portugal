import { Target, Flame, Brain, CheckCircle2 } from 'lucide-react'
import { MISSIONS, type Mission } from '@/lib/game-data'
import { cn } from '@/lib/utils'

const ICONS = { target: Target, flame: Flame, brain: Brain }

export function DailyMissions({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Missões de hoje</h3>
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide text-primary">
          Renova em 8h
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {MISSIONS.map((m) => (
          <MissionRow key={m.title} mission={m} />
        ))}
      </ul>
    </div>
  )
}

function MissionRow({ mission }: { mission: Mission }) {
  const Icon = ICONS[mission.icon]
  const pct = Math.round((mission.progress / mission.total) * 100)
  const complete = mission.progress >= mission.total

  return (
    <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            mission.gold ? 'bg-gold/15 text-gold' : 'bg-primary/15 text-primary',
          )}
        >
          {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{mission.title}</p>
          <p className="text-xs text-muted-foreground">
            {mission.progress} / {mission.total}
          </p>
        </div>
        <span
          className={cn(
            'rounded-lg px-2.5 py-1 text-xs font-black',
            mission.gold ? 'bg-gold/15 text-gold' : 'bg-primary/15 text-primary',
          )}
        >
          {mission.reward}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full',
            mission.gold ? 'bg-gradient-to-r from-gold to-gold/70' : 'bg-gradient-to-r from-primary to-accent',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  )
}
