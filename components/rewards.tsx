import { Coins, Star, Trophy, Flame, Crown, Info } from 'lucide-react'
import { ACHIEVEMENTS, type Tone } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const ICONS = { coins: Coins, star: Star, trophy: Trophy, flame: Flame, crown: Crown }
const TONE: Record<Tone, string> = {
  primary: 'text-primary',
  gold: 'text-gold',
  red: 'text-flag-red',
  accent: 'text-accent',
}

export function Rewards() {
  return (
    <section id="recompensas" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Vale a pena jogar"
        title="Ganha recompensas"
        description="Cada partida enche a tua conta de XP, euros virtuais e conquistas."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICONS[a.icon]
          return (
            <div
              key={a.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] transition-transform duration-300 group-hover:scale-110">
                <Icon className={cn('h-7 w-7', TONE[a.tone])} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">{a.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{a.text}</p>
            </div>
          )
        })}
      </div>

      <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-gold/20 bg-gold/[0.06] px-5 py-3 text-center text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 text-gold" />
        Os <span className="font-semibold text-gold">euros virtuais</span> são uma moeda do jogo,
        sem valor monetário real. Servem para desbloquear extras dentro do Acorda Portugal.
      </p>
    </section>
  )
}
