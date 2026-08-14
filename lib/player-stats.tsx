'use client'

import type { UserProfile } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { BarChart, CheckCircle, Flame, Percent, Target, Trophy, XCircle, Zap, Coins } from 'lucide-react'
import React from 'react'

type Stat = {
  icon: React.ElementType
  label: string
  value: string | number
  tone: 'primary' | 'gold' | 'red' | 'accent' | 'default'
}

const TONE_CLASSES = {
  primary: 'text-primary',
  gold: 'text-gold',
  red: 'text-flag-red',
  accent: 'text-accent',
  default: 'text-foreground'
}

export function PlayerStats({ profile }: { profile: UserProfile }) {
  const accuracy = profile.questionsAnswered ? ((profile.correctAnswers ?? 0) / profile.questionsAnswered) * 100 : 0

  const stats: Stat[] = [
    { icon: Target, label: 'Partidas Jogadas', value: profile.gamesPlayed ?? '—', tone: 'primary' },
    { icon: Trophy, label: 'Vitórias', value: profile.wins ?? '—', tone: 'gold' },
    { icon: XCircle, label: 'Derrotas', value: profile.losses ?? '—', tone: 'red' },
    { icon: BarChart, label: 'Perguntas Respondidas', value: profile.questionsAnswered ?? '—', tone: 'default' },
    { icon: CheckCircle, label: 'Respostas Certas', value: profile.correctAnswers ?? '—', tone: 'accent' },
    { icon: Percent, label: 'Precisão', value: profile.questionsAnswered ? `${accuracy.toFixed(1)}%` : '—', tone: 'accent' },
    { icon: Flame, label: 'Maior Streak', value: profile.bestStreak ?? '—', tone: 'red' },
    { icon: Zap, label: 'Total XP Ganho', value: profile.xp.toLocaleString('pt-PT'), tone: 'primary' },
    { icon: Coins, label: 'Moedas Ganhos', value: profile.euros.toLocaleString('pt-PT'), tone: 'gold' },
  ]

  return (
    <section>
      <SectionHeading
        title="As Minhas Estatísticas"
        description="O teu percurso no Acorda Portugal em números."
      />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  )
}

function StatCard({ icon: Icon, label, value, tone }: Stat) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-card/80">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04]">
          <Icon className={`h-6 w-6 ${TONE_CLASSES[tone]}`} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground sm:text-xl">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}