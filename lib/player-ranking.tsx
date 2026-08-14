'use client'

import type { UserProfile } from '@/lib/game-data'
import { ArrowUp, Crown, Shield } from 'lucide-react'

export function PlayerRanking({ profile }: { profile: UserProfile }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-md">
      <h3 className="font-display text-xl font-bold">Minha Posição</h3>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-gold" />
            <div>
              <p className="font-semibold">Ranking Nacional</p>
              <p className="text-xs text-muted-foreground">Em breve</p>
            </div>
          </div>
          <p className="text-xl font-bold text-gold">#184</p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">Ranking Distrital</p>
              <p className="flex items-center gap-1 text-xs text-accent"><ArrowUp className="h-3 w-3" /> 12 posições</p>
            </div>
          </div>
          <p className="text-xl font-bold text-primary">#7</p>
        </div>
      </div>
    </div>
  )
}