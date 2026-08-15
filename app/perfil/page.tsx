import { BackgroundFx } from '@/components/background-fx'
import { PlayerProfile } from '@/components/player-profile'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PerfilPage() {
  return (
    <main className="relative min-h-screen">
      <BackgroundFx />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-card/60 px-4 py-2 font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao menu
          </Link>
        </div>
        <PlayerProfile />
      </div>
    </main>
  )
}
