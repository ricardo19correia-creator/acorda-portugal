import React from 'react'
import Image from 'next/image'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { FAQSection } from '@/components/faq-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col justify-between">
      {/* 1. IMAGEM DE FUNDO TOTALMENTE FIXA ATRÁS DE TODO O SITE */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Fundo Oficial Acorda Portugal"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="fixed inset-0 -z-20 w-full h-full object-cover object-center pointer-events-none select-none"
      />

      {/* 2. CAMADA DE ESCURECIMENTO SUAVE PARA MÁXIMA LEGIBILIDADE E CONTRASTE */}
      <div className="fixed inset-0 -z-10 bg-black/50 pointer-events-none" />

      {/* 3. EFEITOS AMBIENTAIS SUBTIS */}
      <BackgroundFx variant="homepage" />

      {/* 4. CONTEÚDO DO SITE ENCAPSULADO COM Z-10 */}
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