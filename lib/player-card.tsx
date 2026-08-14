'use client'

import type { UserProfile } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Share2, Star, Trophy } from 'lucide-react'

export function PlayerCard({ profile, className }: { profile: UserProfile, className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10 backdrop-blur-lg transition-all duration-300 hover:shadow-primary/20", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(0,255,170,0.1),_transparent_40%)]" />
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cartão de Jogador</p>
        
        <Avatar className="mt-4 h-28 w-28 border-4 border-white/10">
          <AvatarImage src={profile.photoURL} alt={profile.displayName} />
          <AvatarFallback className="bg-background text-4xl font-bold">
            {profile.displayName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-2xl font-bold font-display">{profile.displayName}</h2>
        <p className="text-sm text-muted-foreground">{profile.district}</p>

        <div className="my-6 h-px w-full bg-white/10" />

        <div className="grid grid-cols-3 gap-4 w-full">
          <div>
            <p className="text-2xl font-bold text-primary">{profile.level}</p>
            <p className="text-xs text-muted-foreground">Nível</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gold">#184</p>
            <p className="text-xs text-muted-foreground">Ranking</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{profile.unlockedAchievements.length}</p>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </div>
        </div>

        <div className="mt-6 w-full space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-semibold">{profile.xp.toLocaleString('pt-PT')} XP</span>
            </div>
             <div className="flex items-center justify-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-gold" />
                <span className="font-semibold">{profile.euros.toLocaleString('pt-PT')} €</span>
            </div>
        </div>

        <Button className="mt-6 w-full gap-2" variant="outline">
          <Share2 className="h-4 w-4" />
          Partilhar Perfil
        </Button>
      </div>
    </div>
  )
}