import { BackgroundFx } from '@/components/background-fx'
import { PlayerProfile } from '@/components/player-profile'

export default function PerfilPage() {
  return (
    <main className="relative min-h-screen">
      <BackgroundFx />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PlayerProfile />
      </div>
    </main>
  )
}
