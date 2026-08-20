import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { PortugalHeroMap } from '@/components/portugal-hero-map'
import { DistrictRanking } from '@/components/district-ranking'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft, Play, MapPin, Flag } from 'lucide-react'

export default function PortugalPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <BackgroundFx variant="explore" />

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
                  <span className="badge-hud text-primary border-primary/40 bg-primary/15 shadow-md shadow-primary/20 flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5" />
                    18 Distritos + 2 Regiões Autónomas
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-primary">
                  Portugal Territorial
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                  Explora o mapa interativo, apoia o teu distrito e compete pelo título de Rei do Distrito.
                </p>
              </div>

              <Link
                href="/jogar?cat=o-meu-distrito"
                className="button-game-primary inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Conquistar Distrito</span>
              </Link>
            </div>

            {/* Interactive Map Showcase */}
            <div className="card-game mt-8 overflow-hidden rounded-4xl p-6 sm:p-10 shadow-2xl holo-pedestal border border-white/15">
              <div className="mx-auto max-w-xl">
                <PortugalHeroMap />
              </div>
            </div>
          </div>

          {/* District Territorial Ranking Section */}
          <DistrictRanking />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
