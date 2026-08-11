import { Star, Trophy, Flame, Zap } from 'lucide-react'
import { PlayButton } from '@/components/play-button'
import { PortugalMap } from '@/components/portugal-map'

const STATS = [
  { value: '+1.000', label: 'Perguntas' },
  { value: '18', label: 'Distritos' },
  { value: '2', label: 'Regiões Autónomas' },
  { value: '∞', label: 'Desafios' },
]

export function Hero() {
  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* ---------- Left: copy + CTAs ---------- */}
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <span
            className="animate-rise inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
            style={{ animationDelay: '40ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            O grande quiz nacional
          </span>

          <h1
            className="animate-rise mt-5 font-display text-6xl font-bold leading-[0.9] tracking-tight text-balance sm:text-7xl lg:text-8xl"
            style={{ animationDelay: '120ms' }}
          >
            <span className="block">ACORDA</span>
            <span className="text-brand-gradient block">PORTUGAL</span>
          </h1>
          <span
            className="animate-rise mt-3 block font-display text-lg font-semibold uppercase tracking-[0.34em] text-muted-foreground sm:text-2xl"
            style={{ animationDelay: '180ms' }}
          >
            Desafio Nacional
          </span>

          <p
            className="animate-rise mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: '240ms' }}
          >
            Testa o teu conhecimento. Representa o teu distrito. Conquista o topo de Portugal.
          </p>

          {/* Main CTA */}
          <div className="animate-rise mt-8 flex w-full flex-col items-center gap-3 sm:w-auto lg:items-start" style={{ animationDelay: '300ms' }}>
            <PlayButton className="w-full sm:w-auto" />
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Milhares de perguntas <span className="text-primary">•</span> Ranking Nacional{' '}
              <span className="text-primary">•</span> Desafios Diários
            </p>
          </div>

          {/* Mini stats */}
          <dl
            className="animate-rise mt-10 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4"
            style={{ animationDelay: '380ms' }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="glass rounded-2xl border border-white/10 px-3 py-4 text-center"
              >
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl font-black text-brand-gradient sm:text-3xl">
                  {s.value}
                </dd>
                <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------- Right: Portugal map visual ---------- */}
        <div className="order-1 lg:order-2">
          <PortugalMap priority className="mx-auto max-w-md lg:max-w-none">
            <FloatingChip
              className="left-2 top-6 sm:left-6"
              delay="0s"
              icon={<Star className="h-4 w-4 fill-current" />}
              tone="gold"
              label="+250 XP"
            />
            <FloatingChip
              className="right-0 top-20 sm:right-2"
              delay="1.4s"
              icon={<Trophy className="h-4 w-4" />}
              tone="primary"
              label="Top 1%"
            />
            <FloatingChip
              className="bottom-24 left-0"
              delay="2.6s"
              icon={<Flame className="h-4 w-4 fill-current" />}
              tone="red"
              label="Sequência 12"
            />
            <FloatingChip
              className="bottom-8 right-4 sm:right-10"
              delay="3.4s"
              icon={<Zap className="h-4 w-4 fill-current" />}
              tone="primary"
              label="Nível a subir"
            />
          </PortugalMap>
        </div>
      </div>
    </section>
  )
}

function FloatingChip({
  className,
  delay,
  icon,
  label,
  tone,
}: {
  className?: string
  delay: string
  icon: React.ReactNode
  label: string
  tone: 'gold' | 'primary' | 'red'
}) {
  const tones = {
    gold: 'text-gold border-gold/40 shadow-[0_0_24px_-6px_var(--gold)]',
    primary: 'text-primary border-primary/40 shadow-[0_0_24px_-6px_var(--primary)]',
    red: 'text-flag-red border-flag-red/40 shadow-[0_0_24px_-6px_var(--flag-red)]',
  }
  return (
    <div
      className={`animate-float absolute flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-bold backdrop-blur-md ${tones[tone]} ${className}`}
      style={{ animationDelay: delay, animationDuration: '6s' }}
    >
      {icon}
      <span className="text-foreground">{label}</span>
    </div>
  )
}
