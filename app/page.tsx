import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { HowItWorks } from '@/components/how-it-works'
import { Categories } from '@/components/categories'
import { Events } from '@/components/events'
import { Ranking } from '@/components/ranking'
import { DistrictRanking } from '@/components/district-ranking'
import { Progression } from '@/components/progression'
import { Rewards } from '@/components/rewards'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <div className="relative z-20">
        <SiteHeader />

        <main>
          <Hero />
          <HowItWorks />
          <Categories />
          <Events />
          <Ranking />
          <DistrictRanking />
          <Progression />
          <Rewards />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}