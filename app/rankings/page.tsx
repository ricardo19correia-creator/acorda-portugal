'use client'

import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Ranking } from '@/components/ranking'
import { DistrictRanking } from '@/components/district-ranking'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, MapPin, Trophy, Crown } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

export default function RankingsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="ranking" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 bg-transparent">
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
                <h1
                  className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-gold"
                  style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)' }}
                >
                  Rankings &amp; Competição
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-slate-300 font-medium" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)' }}>
                  Acompanha os melhores jogadores de Portugal e a disputa territorial entre os 18 distritos e 2 regiões autónomas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleStartGame('/jogar')}
                className="button-game-gold inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jogar para Subir</span>
              </button>
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
