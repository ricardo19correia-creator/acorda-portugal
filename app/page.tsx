import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { FAQSection } from '@/components/faq-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col justify-between overflow-x-hidden">
      <BackgroundFx variant="homepage" />

      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main
          className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat flex-1 flex flex-col justify-center gap-8"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        >
          {/* Overlay escuro para manter o texto 100% legível e cinematográfico */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] -z-10" />

          {/* O teu conteúdo existente (Títulos, Botões, Mapa, Símbolo, FAQ) */}
          <Hero />
          <div id="simbolo">
            <GuzmaniaSection />
          </div>
          <FAQSection />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}