import { Crown } from 'lucide-react'
import { LEVELS } from '@/lib/game-data'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

export function Progression() {
  return (
    <section id="progressao" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="A tua jornada"
        title="Sobe de nível"
        description="De Curioso a Mestre de Portugal. Cada nível desbloqueia novos desafios e distinção no ranking."
      />

      <div className="relative mt-12">
        {/* progress spine */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-accent to-gold md:left-1/2 md:-translate-x-1/2" />

        <ol className="space-y-5">
          {LEVELS.map((lvl, i) => (
            <li
              key={lvl.level}
              className={cn(
                'relative flex items-center gap-4 pl-12 md:w-1/2 md:pl-0',
                i % 2 === 0
                  ? 'md:mr-auto md:justify-end md:pr-12 md:text-right'
                  : 'md:ml-auto md:justify-start md:pl-12',
              )}
            >
              {/* node */}
              <span
                className={cn(
                  'absolute left-4 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-xs font-black text-primary-foreground ring-4 ring-background md:left-1/2',
                )}
              >
                {lvl.level}
              </span>
              <div className="flex-1 rounded-2xl border border-white/10 bg-card/60 px-5 py-4 backdrop-blur md:flex-none">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-primary">
                  Nível {lvl.level}
                </p>
                <p className="font-display text-lg font-bold text-foreground">{lvl.title}</p>
                <p className="text-xs text-muted-foreground">{lvl.xp} XP</p>
              </div>
            </li>
          ))}

          {/* final master tier */}
          <li className="relative flex items-center justify-center pl-12 md:pl-0">
            <span className="absolute left-4 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-gold ring-4 ring-background md:left-1/2">
              <Crown className="h-4 w-4 text-gold-foreground" />
            </span>
            <div className="sheen relative mx-auto overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/20 via-gold/5 to-gold/20 px-8 py-5 text-center backdrop-blur">
              <Crown className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-1 font-display text-xl font-black uppercase tracking-tight text-gold-gradient">
                Mestre de Portugal
              </p>
              <p className="text-xs text-muted-foreground">O topo absoluto do país</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  )
}
