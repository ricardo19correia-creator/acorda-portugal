import { MousePointerClick, Timer, Crown } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

const STEPS = [
  {
    n: '01',
    icon: MousePointerClick,
    title: 'ESCOLHE',
    text: 'Escolhe uma categoria entre dezenas de temas.',
  },
  {
    n: '02',
    icon: Timer,
    title: 'RESPONDE',
    text: 'Responde antes que o tempo acabe. Rápido e certeiro.',
  },
  {
    n: '03',
    icon: Crown,
    title: 'CONQUISTA',
    text: 'Ganha XP, sobe no ranking e representa o teu distrito.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-jogar" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Simples e viciante" title="Como funciona" />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
          >
            {/* giant number watermark */}
            <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-8xl font-black leading-none text-white/[0.05] transition-colors group-hover:text-primary/10">
              {step.n}
            </span>

            <div className="relative flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <span className="font-display text-sm font-black tracking-widest text-primary">
                {step.n}
              </span>
            </div>

            <h3 className="relative mt-5 font-display text-2xl font-black tracking-tight text-foreground">
              {step.title}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>

            {/* connector arrow (desktop) */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full border border-white/10 bg-background text-primary md:grid"
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
