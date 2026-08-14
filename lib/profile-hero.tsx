'use client'

import type { UserProfile } from '@/lib/game-data'
import { LEVELS } from '@/lib/game-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, MapPin, Shield } from 'lucide-react'

function getLevelInfo(xp: number) {
  const currentLevelInfo = LEVELS.slice()
    .reverse()
    .find((level) => xp >= parseInt(level.xp.replace('.', ''), 10))
  if (!currentLevelInfo) return { currentLevel: LEVELS[0], nextLevel: LEVELS[1], progress: 0, xpForNextLevel: parseInt(LEVELS[1].xp.replace('.', ''), 10) }

  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevelInfo.level)
  const nextLevel = LEVELS[currentLevelIndex + 1]

  if (!nextLevel) {
    return { currentLevel: currentLevelInfo, nextLevel: null, progress: 100, xpForNextLevel: 0 }
  }

  const xpForCurrentLevel = parseInt(currentLevelInfo.xp.replace('.', ''), 10)
  const xpForNextLevel = parseInt(nextLevel.xp.replace('.', ''), 10)
  const xpInCurrentLevel = xp - xpForCurrentLevel
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel
  const progress = (xpInCurrentLevel / xpNeededForNext) * 100

  return { currentLevel: currentLevelInfo, nextLevel, progress, xpForNextLevel: xpForNextLevel - xp }
}

export function ProfileHero({ profile }: { profile: UserProfile }) {
  const { currentLevel, nextLevel, progress, xpForNextLevel } = getLevelInfo(profile.xp)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-md sm:p-8">
       <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Avatar className="h-24 w-24 border-4 border-primary/50 shadow-lg">
          <AvatarImage src={profile.photoURL} alt={profile.displayName} />
          <AvatarFallback className="bg-background text-2xl font-bold">
            {profile.displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-3xl font-bold font-display">{profile.displayName}</h1>
            {profile.badges?.map(badge => <Badge key={badge}>{badge}</Badge>)}
          </div>
          {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          
          <div className="mt-4 space-y-3">
            <div className="font-semibold">
              <span className="text-primary">Nível {currentLevel.level}</span> - {currentLevel.title}
            </div>
            <Progress value={progress} className="h-3 w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{profile.xp.toLocaleString('pt-PT')} / {nextLevel ? parseInt(nextLevel.xp.replace('.', '')).toLocaleString('pt-PT') : profile.xp.toLocaleString('pt-PT')} XP</span>
              {nextLevel && <span>{xpForNextLevel.toLocaleString('pt-PT')} XP para o Nível {nextLevel.level}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
        <div className="rounded-lg bg-white/5 p-3">
          <MapPin className="mx-auto h-5 w-5 text-accent" />
          <p className="mt-1 text-sm font-semibold">{profile.district}</p>
          <p className="text-xs text-muted-foreground">Distrito</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3">
          <Crown className="mx-auto h-5 w-5 text-gold" />
          <p className="mt-1 text-sm font-semibold">#184</p>
          <p className="text-xs text-muted-foreground">Ranking Nacional</p>
        </div>
        <div className="rounded-lg bg-white/5 p-3 col-span-2 sm:col-span-1">
          <Shield className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1 text-sm font-semibold">#7</p>
          <p className="text-xs text-muted-foreground">Ranking Distrital</p>
        </div>
      </div>
    </div>
  )
}