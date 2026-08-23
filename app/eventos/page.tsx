import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Events } from '@/components/events'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft, Play, Flame, Calendar } from 'lucide-react'

export default function EventosPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col">
      <BackgroundFx variant="challenges" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1">
          {/* Header Banner */}
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Início
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge-hud text-flag-red border-flag-red/40 bg-flag-red/15 shadow-md shadow-flag-red/20 flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    Tempo Limitado
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-red">
                  Eventos &amp; Temporadas
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                  Desafios temáticos por tempo limitado com bónus de XP e recompensas exclusivas.
                </p>
              </div>

              <Link
                href="/jogar"
                className="button-game-gold inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jogar Eventos</span>
              </Link>
            </div>
          </div>

          {/* Events Grid Section */}
          <Events />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
