import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between overflow-x-hidden">
      <BackgroundFx variant="homepage" />

      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-center gap-8">
          <Hero />
          <div id="simbolo">
            <GuzmaniaSection />
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}