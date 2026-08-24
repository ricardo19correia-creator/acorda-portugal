import Link from 'next/link'
import { Flag, Flame, Medal, Laugh, Clock, ChevronRight } from 'lucide-react'
import { EVENTS, type GameEvent, type Tone } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const ICONS = { flag: Flag, flame: Flame, medal: Medal, laugh: Laugh }

const TONE_STYLES: Record<Tone, { wash: string; icon: string; tag: string; ring: string }> = {
  primary: {
    wash: 'from-primary/25 via-card/70 to-card/70',
    icon: 'bg-primary/15 text-primary',
    tag: 'bg-primary/20 text-primary',
    ring: 'group-hover:border-primary/45',
  },
  gold: {
    wash: 'from-gold/25 via-card/70 to-card/70',
    icon: 'bg-gold/15 text-gold',
    tag: 'bg-gold/20 text-gold',
    ring: 'group-hover:border-gold/45',
  },
  red: {
    wash: 'from-flag-red/25 via-card/70 to-card/70',
    icon: 'bg-flag-red/15 text-flag-red',
    tag: 'bg-flag-red/20 text-flag-red',
    ring: 'group-hover:border-flag-red/45',
  },
  accent: {
    wash: 'from-accent/25 via-card/70 to-card/70',
    icon: 'bg-accent/15 text-accent',
    tag: 'bg-accent/20 text-accent',
    ring: 'group-hover:border-accent/45',
  },
}

function getEventSlug(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('nacional')) return 'desafio-nacional'
  if (t.includes('portugal')) return 'portugal'
  if (t.includes('desporto')) return 'futebol-portugues'
  if (t.includes('maluco')) return 'modo-maluco'
  return 'desafio-nacional'
}

export function Events() {
  return (
    <section id="eventos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Por tempo limitado"
        title="Eventos"
        description="Desafios especiais com recompensas dobradas. Participa antes que o tempo acabe."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EVENTS.map((event) => (
          <EventCard key={event.title} event={event} />
        ))}
      </div>
    </section>
  )
}

function EventCard({ event }: { event: GameEvent }) {
  const Icon = ICONS[event.icon]
  const s = TONE_STYLES[event.tone]
  const eventSlug = getEventSlug(event.title)

  return (
    <Link
      href={`/jogar?cat=${eventSlug}&event=${encodeURIComponent(event.title)}`}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1.5 cursor-pointer shadow-lg',
        s.wash,
        s.ring,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

      <div>
        <div className="relative flex items-center justify-between">
          <span
            className={cn(
              'grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-md',
              s.icon,
            )}
          >
            <Icon className="h-7 w-7" />
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-wide',
              s.tag,
            )}
          >
            {event.tag}
          </span>
        </div>

        <h3 className="relative mt-4 font-display text-lg font-bold uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="relative mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {event.timeLeft}
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <div>
          <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Recompensa</p>
          <p className="font-display text-sm font-bold text-gold">{event.reward}</p>
        </div>
        <span
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent group-hover:translate-x-1"
        >
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  )
}
