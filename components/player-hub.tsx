import { SectionHeading } from '@/components/section-heading'
import { PlayerCard } from '@/components/player-card'
import { DailyMissions } from '@/components/daily-missions'
import { StreakCard } from '@/components/streak-card'
import dynamic from 'next/dynamic'

// ProfilePanel is a client component; import dynamically to avoid server-side issues
const ProfilePanel = dynamic(() => import('./profile-panel').then((m) => m.ProfilePanel), { ssr: false })

export function PlayerHub() {
  return (
    <section id="perfil" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="O teu quartel-general"
        title="O teu progresso"
        description="Acompanha o teu nível, mantém a sequência e completa as missões diárias."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          {/* ProfilePanel handles guest/authenticated views */}
          <ProfilePanel />
          <StreakCard />
        </div>
        <DailyMissions />
      </div>
    </section>
  )
}
