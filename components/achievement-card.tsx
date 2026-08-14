'use client'

import { Lock } from 'lucide-react'
import type { Achievement, Tone } from '@/lib/game-data'
import { cn } from '@/lib/utils'

const TONE_STYLES: Record<Tone, { icon: string; ring: string }> = {
  primary: {
    icon: 'text-primary',
    ring: 'group-hover:border-primary/50',
  },
  gold: {
    icon: 'text-gold',
    ring: 'group-hover:border-gold/50',
  },
  red: {
    icon: 'text-flag-red',
    ring: 'group-hover:border-flag-red/50',
  },
  accent: {
    icon: 'text-accent',
    ring: 'group-hover:border-accent/50',
  },
}

export function AchievementCard({ achievement, unlocked }: { achievement: Achievement; unlocked: boolean }) {
  const Icon = achievement.icon
  const s = TONE_STYLES[achievement.tone]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border p-6 text-center backdrop-blur transition-all duration-300',
        unlocked
          ? cn('border-white/10 bg-card/60 hover:-translate-y-1', s.ring)
          : 'border-white/5 bg-white/[0.02] opacity-60',
      )}
    >
      <div
        className={cn(
          'mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] transition-transform duration-300',
          unlocked ? 'group-hover:scale-110' : '',
        )}
      >
        {unlocked ? <Icon className={cn('h-8 w-8', s.icon)} /> : <Lock className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-foreground">{achievement.title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{achievement.text}</p>
    </div>
  )
}