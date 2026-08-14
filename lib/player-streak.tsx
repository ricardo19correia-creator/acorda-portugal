'use client'

import type { UserProfile } from '@/lib/game-data'
import { WEEK_DAYS } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'

export function PlayerStreak({ profile }: { profile: UserProfile }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-red-500" />
        <h3 className="font-display text-xl font-bold">Streak de Jogo</h3>
      </div>
      <p className="mt-2 text-3xl font-bold">
        {profile.streak} <span className="text-base font-normal text-muted-foreground">dias consecutivos</span>
      </p>
      <p className="mt-1 text-sm text-accent">Continua assim para ganhares mais recompensas!</p>

      <div className="mt-4 flex justify-between gap-1">
        {WEEK_DAYS.map((day, index) => (
          <div
            key={day.label}
            className={cn(
              'flex h-12 w-full flex-col items-center justify-center rounded-lg border text-xs font-bold',
              index < profile.streak
                ? 'border-red-500/50 bg-red-500/20 text-white'
                : 'border-white/10 bg-white/5 text-muted-foreground'
            )}
          >
            <span>{day.label}</span>
            {index < profile.streak && <Flame className="mt-1 h-3 w-3 text-red-400" />}
          </div>
        ))}
      </div>
    </div>
  )
}