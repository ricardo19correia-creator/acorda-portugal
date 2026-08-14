'use client'

import type { UserProfile } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { Button } from '@/components/ui/button'
import { Lock, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALL_ACHIEVEMENTS = [
  { id: 'primeira-vitoria', title: 'Primeira Vitória', description: 'Ganha a tua primeira partida.', icon: Trophy },
  { id: 'imparavel', title: 'Imparável', description: 'Acerta 10 perguntas seguidas.', icon: Trophy },
  { id: 'conhecedor-portugal', title: 'Conhecedor de Portugal', description: 'Responde a 100 perguntas sobre Portugal.', icon: Trophy },
  { id: 'milionario', title: 'Milionário', description: 'Acumula 10.000€ virtuais.', icon: Trophy },
  { id: 'mestre-historia', title: 'Mestre de História', description: 'Completa a categoria de História.', icon: Trophy },
  { id: 'explorador-geografia', title: 'Explorador', description: 'Completa a categoria de Geografia.', icon: Trophy },
]

export function PlayerAchievements({ profile }: { profile: UserProfile }) {
  const unlockedCount = profile.unlockedAchievements.length
  const totalCount = ALL_ACHIEVEMENTS.length

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Conquistas"
          description="Os teus feitos mais notáveis no Acorda Portugal."
        />
        <Button variant="outline">Ver todas</Button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-muted-foreground">Progresso</p>
          <p className="font-bold">{unlockedCount} / {totalCount}</p>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-gold to-yellow-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_ACHIEVEMENTS.slice(0, 3).map(ach => {
          const isUnlocked = profile.unlockedAchievements.includes(ach.id)
          return (
            <AchievementCard
              key={ach.id}
              icon={isUnlocked ? ach.icon : Lock}
              title={ach.title}
              description={ach.description}
              unlocked={isUnlocked}
            />
          )
        })}
      </div>
    </section>
  )
}

type AchievementCardProps = {
  icon: React.ElementType
  title: string
  description: string
  unlocked: boolean
}

function AchievementCard({ icon: Icon, title, description, unlocked }: AchievementCardProps) {
  return (
    <div className={cn(
      "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
      unlocked
        ? "border-gold/30 bg-gold/[0.08] text-gold"
        : "border-white/10 bg-card/60 text-muted-foreground"
    )}>
      <Icon className={cn("h-8 w-8 shrink-0", unlocked ? "text-gold" : "text-muted-foreground")} />
      <div>
        <h4 className={cn("font-bold", unlocked ? "text-white" : "text-foreground")}>{title}</h4>
        <p className="text-xs">{description}</p>
      </div>
    </div>
  )
}