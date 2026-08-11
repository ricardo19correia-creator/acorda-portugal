import { Trophy, Flag, Flame, Brain } from 'lucide-react'

const FEATURES = [
  {
    icon: Trophy,
    tone: 'text-gold',
    ring: 'group-hover:border-gold/50',
    title: 'Ranking Nacional',
    text: 'Compete com jogadores de todo o país.',
  },
  {
    icon: Flag,
    tone: 'text-primary',
    ring: 'group-hover:border-primary/50',
    title: 'O Teu Distrito',
    text: 'Representa o teu distrito e sobe no ranking.',
  },
  {
    icon: Flame,
    tone: 'text-flag-red',
    ring: 'group-hover:border-flag-red/50',
    title: 'Desafios Diários',
    text: 'Mantém a tua sequência e ganha recompensas.',
  },
  {
    icon: Brain,
    tone: 'text-accent',
    ring: 'group-hover:border-accent/50',
    title: 'Milhares de Perguntas',
    text: 'Testa os teus conhecimentos em dezenas de categorias.',
  },
]

export function Features() {
  return (
    <section id="como-jogar" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Porque vais adorar" title="Desafia Portugal" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-card/90"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-opacity group-hover:opacity-100" />
            <div
              className={`grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors ${f.ring}`}
            >
              <f.icon className={`h-6 w-6 ${f.tone}`} />
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
    </div>
  )
}
