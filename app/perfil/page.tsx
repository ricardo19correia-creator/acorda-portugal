import { BackgroundFx } from '@/components/background-fx'
import { ProfilePanel } from '@/components/profile-panel'

export default function PerfilPage() {
  return (
    <main className="relative min-h-screen">
      <BackgroundFx />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <ProfilePanel />
      </div>
    </main>
  )
}