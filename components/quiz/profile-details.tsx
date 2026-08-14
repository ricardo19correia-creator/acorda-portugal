'use client'

import { Coins, Flame, Sparkles, User as UserIcon, BarChart3, Percent, Trophy } from 'lucide-react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/components/player-card'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  tone: 'primary' | 'gold' | 'red'
}) {
  const tones = {
    primary: 'text-primary',
    gold: 'text-gold',
    red: 'text-flag-red',
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-4">
        <div className={cn('grid h-12 w-12 place-items-center rounded-xl bg-white/5', tones[tone])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-3xl font-black text-foreground">{value}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

export function ProfileDetails({ user, profile }: { user: User; profile: UserProfile }) {
  const xpForCurrentLevel = (profile.level - 1) * 500
  const xpForNextLevel = profile.level * 500
  const xpInCurrentLevel = profile.xp - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const xpProgress = (xpInCurrentLevel / xpNeededForLevel) * 100

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        {profile.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.photoURL} alt={profile.displayName} className="h-24 w-24 rounded-full ring-2 ring-primary/50" />
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary/35 to-accent/20 font-display text-4xl font-black text-primary ring-1 ring-primary/40">
            {profile.displayName?.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <SectionHeading align="left" title={profile.displayName} description={profile.email} />
        </div>
      </div>

      <div className="mt-12">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Progresso</h3>
        <div className="rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-primary">Nível {profile.level}</span>
            <span className="text-muted-foreground">
              {profile.xp.toLocaleString('pt-PT')} / {xpForNextLevel.toLocaleString('pt-PT')} XP
            </span>
          </div>
          <div className="relative mt-2 h-4 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="shimmer relative h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Faltam <span className="font-bold text-foreground">{(xpForNextLevel - profile.xp).toLocaleString('pt-PT')} XP</span> para o Nível {profile.level + 1}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Estatísticas</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Sparkles} label="Total XP" value={profile.xp.toLocaleString('pt-PT')} tone="primary" />
          <StatCard icon={Coins} label="Euros" value={`€${profile.euros.toLocaleString('pt-PT')}`} tone="gold" />
          <StatCard icon={Flame} label="Streak Atual" value={profile.streak} tone="red" />

          {/* Placeholder stats */}
          <StatCard icon={BarChart3} label="Partidas Jogadas" value="0" tone="primary" />
          <StatCard icon={Trophy} label="Vitórias" value="0" tone="gold" />
          <StatCard icon={Percent} label="Taxa de Acerto" value="0%" tone="primary" />
        </div>
      </div>
    </section>
  )
}