import React from 'react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { FAQSection } from '@/components/faq-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between">
      {/* 1. CAMADA DE IMAGEM ABSOLUTA FIXA */}
      <div className="fixed inset-0 -z-30 w-full h-full overflow-hidden pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.jpg"
          alt="Background Lisboa 2077"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. EFEITOS AMBIENTAIS SUBTIS */}
      <BackgroundFx variant="homepage" />

      {/* 3. CONTEÚDO DO SITE ENCAPSULADO COM Z-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-center gap-8 py-4">
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