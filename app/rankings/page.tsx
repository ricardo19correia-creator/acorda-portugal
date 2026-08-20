import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Ranking } from '@/components/ranking'
import { DistrictRanking } from '@/components/district-ranking'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft, Play, MapPin, Trophy, Crown } from 'lucide-react'

export default function RankingsPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <BackgroundFx variant="ranking" />

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
                  <span className="badge-hud text-gold border-gold/40 bg-gold/15 shadow-md shadow-gold/20 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    Tabela de Liderança Nacional
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-gold">
                  Rankings &amp; Competição
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                  Acompanha os melhores jogadores de Portugal e a disputa territorial entre os 18 distritos e 2 regiões autónomas.
                </p>
              </div>

              <Link
                href="/jogar"
                className="button-game-gold inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jogar para Subir</span>
              </Link>
            </div>
          </div>

          {/* National Ranking Section */}
          <Ranking />

          {/* District Territorial Ranking Section */}
          <DistrictRanking />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
