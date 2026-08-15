import { ChevronRight, Crown, MapPin } from 'lucide-react'
import { NATIONAL_TOP, type Player } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const PODIUM_ORDER = [1, 0, 2] // silver, gold, bronze visual order

export function Ranking() {
  const top3 = NATIONAL_TOP.slice(0, 3)
  const rest = NATIONAL_TOP.slice(3, 10)

  return (
    <section id="ranking" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="A tabela nacional"
        title="Top de Portugal"
        description="Os melhores do país, atualizados a cada partida. Sobe, ultrapassa e reclama a coroa."
      />

      {/* Podium */}
      <div className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-6">
        {PODIUM_ORDER.map((idx) => (
          <PodiumSpot key={idx} player={top3[idx]} />
        ))}
      </div>

      {/* Positions 4–10 */}
      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur">
        <ul className="divide-y divide-white/5">
          {rest.map((row) => (
            <li
              key={row.pos}
              className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.03] sm:px-5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-sm font-black text-muted-foreground">
                {row.pos}
              </span>
              <Avatar name={row.name} className="h-10 w-10 shrink-0 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{row.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {row.district} · Nível {row.level}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-base font-bold text-foreground">{row.xp}</p>
                <p className="text-[0.62rem] uppercase tracking-wider text-muted-foreground">XP</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-primary/30 bg-primary/10 py-4 font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Ver ranking completo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

function PodiumSpot({ player }: { player: Player }) {
  const styles = {
    1: {
      pedestal: 'h-32 sm:h-40 bg-gradient-to-b from-gold/30 to-gold/5 border-gold/40',
      ring: 'ring-gold/60 shadow-[0_0_40px_-6px_var(--gold)]',
      badge: 'bg-gold text-gold-foreground',
      medal: 'text-gold',
    },
    2: {
      pedestal: 'h-24 sm:h-32 bg-gradient-to-b from-white/15 to-white/[0.03] border-white/25',
      ring: 'ring-white/40',
      badge: 'bg-white/85 text-background',
      medal: 'text-white/80',
    },
    3: {
      pedestal: 'h-20 sm:h-28 bg-gradient-to-b from-flag-red/25 to-flag-red/5 border-flag-red/35',
      ring: 'ring-flag-red/50',
      badge: 'bg-flag-red text-flag-red-foreground',
      medal: 'text-flag-red',
    },
  }[player.pos as 1 | 2 | 3]

  return (
    <div className="animate-rise flex flex-col items-center">
      {player.pos === 1 && <Crown className="mb-1 h-7 w-7 fill-gold text-gold drop-shadow-[0_0_10px_var(--gold)]" />}
      <Avatar
        name={player.name}
        className={cn('h-14 w-14 text-lg ring-2 sm:h-16 sm:w-16', styles.ring)}
      />
      <p className="mt-2 max-w-full truncate text-center text-sm font-bold text-foreground">
        {player.name}
      </p>
      <p className="text-[0.68rem] text-muted-foreground">{player.district}</p>
      <div
        className={cn(
          'mt-3 flex w-full flex-col items-center justify-end rounded-t-2xl border border-b-0 pb-3 pt-4',
          styles.pedestal,
        )}
      >
        <span className={cn('grid h-9 w-9 place-items-center rounded-full font-display text-lg font-black', styles.badge)}>
          {player.pos}
        </span>
        <span className="mt-2 font-display text-sm font-bold text-foreground sm:text-base">
          {player.xp}
        </span>
        <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">XP</span>
      </div>
    </div>
  )
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/15 font-display font-bold text-primary',
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
