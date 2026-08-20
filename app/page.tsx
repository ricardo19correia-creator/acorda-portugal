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
      {/* 1. IMAGEM DE FUNDO NATIVA NEXT/IMAGE EM CAMADA FIXA HD (SEM ESTICAMENTO NEM ZOOM EXCESSIVO) */}
      <Image
        src="/images/hero-bg.jpg"
        alt="Fundo Biblioteca Sagrada de Portugal"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-center -z-20 pointer-events-none select-none"
      />

      {/* 2. SOBREPOSIÇÃO SUAVE DE CONTRASTE */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] -z-10 pointer-events-none" />

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