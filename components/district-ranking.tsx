'use client'

import { useState } from 'react'
import { MapPin, Users, Sparkles, Medal } from 'lucide-react'
import { DISTRICTS } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { PortugalMap } from '@/components/portugal-map'
import { cn } from '@/lib/utils'

const MEDAL_TONE = ['text-gold', 'text-white/80', 'text-flag-red']

export function DistrictRanking() {
  const [selected, setSelected] = useState('Vila Real')
  const current = DISTRICTS.find((d) => d.name === selected) ?? DISTRICTS[DISTRICTS.length - 1]

  return (
    <section id="distritos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Orgulho local"
        title="Representa o teu distrito"
        description="Cada resposta certa soma pontos ao teu distrito. Juntos, subam ao topo do mapa."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Map + selected district detail */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur">
          <div className="relative mx-auto max-w-xs">
            <PortugalMap float={false} rings={false} />
            {/* selectable district pins over the map */}
            <button
              type="button"
              aria-label="Selecionar Vila Real"
              onClick={() => setSelected('Vila Real')}
              className={cn(
                'absolute right-[30%] top-[24%] grid h-7 w-7 place-items-center rounded-full border transition-all',
                selected === 'Vila Real'
                  ? 'border-gold bg-gold/20 text-gold shadow-[0_0_18px_-2px_var(--gold)]'
                  : 'border-white/20 bg-background/70 text-muted-foreground hover:border-primary/50',
              )}
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/[0.06] p-5 text-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Distrito selecionado
            </p>
            <p className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-foreground">
              {current.name}
            </p>
            <p className="mt-3 font-display text-5xl font-black text-gold-gradient">
              {current.pos}
              <span className="align-top text-xl">.º</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat icon={Users} value={current.players} label="Jogadores" />
              <Stat icon={Sparkles} value={current.xp} label="XP total" />
            </div>
          </div>
        </div>

        {/* District leaderboard */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
            <Medal className="h-5 w-5 text-gold" />
            <h3 className="font-display text-lg font-bold text-foreground">Ranking dos Distritos</h3>
          </div>
          <ul className="divide-y divide-white/5">
            {DISTRICTS.map((d, i) => {
              const active = d.name === selected
              return (
                <li key={d.name}>
                  <button
                    type="button"
                    onClick={() => setSelected(d.name)}
                    className={cn(
                      'flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors',
                      active ? 'bg-primary/10' : 'hover:bg-white/[0.03]',
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black',
                        i < 3 ? cn('bg-white/5', MEDAL_TONE[i]) : 'bg-white/5 text-muted-foreground',
                      )}
                    >
                      {d.pos}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{d.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {d.players} jogadores
                      </p>
                    </div>
                    <span className="font-display text-sm font-bold text-gold">{d.xp}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-3">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 font-display text-base font-bold text-foreground">{value}</p>
      <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}
