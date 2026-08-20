import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between overflow-x-hidden">
      <BackgroundFx />

      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-center">
          <Hero />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}