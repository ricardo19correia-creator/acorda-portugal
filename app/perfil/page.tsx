import { BackgroundFx } from '@/components/background-fx'
import { PlayerProfile } from '@/components/player-profile'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PerfilPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between">
      <BackgroundFx variant="results" />

      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao menu
            </Link>
          </div>
          <PlayerProfile />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
