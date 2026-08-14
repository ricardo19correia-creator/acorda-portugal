'use client'

import type { UserProfile } from '@/lib/game-data'
import { DISTRICTS } from '@/lib/game-data'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Zap } from 'lucide-react'

export function PlayerDistrict({ profile }: { profile: UserProfile }) {
  const districtData = DISTRICTS.find(d => d.name === profile.district)

  return (
    <div className="rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <MapPin className="h-6 w-6 text-accent" />
        <h3 className="font-display text-xl font-bold">O Meu Distrito</h3>
      </div>
      <h4 className="mt-2 text-2xl font-bold">{profile.district}</h4>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Jogadores</span>
          <span className="font-semibold">{districtData?.players ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground"><Zap className="h-4 w-4" /> XP Total</span>
          <span className="font-semibold">{districtData?.xp ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">🏆 Ranking Distrital</span>
          <span className="font-semibold text-primary">#7</span>
        </div>
      </div>

      <Button className="mt-6 w-full" variant="outline">
        Ver Ranking do Distrito
      </Button>
    </div>
  )
}