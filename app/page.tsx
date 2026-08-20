import React from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { FAQSection } from '@/components/faq-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between">
      {/* FUNDO HERO-BG */}
      <div 
        className="fixed inset-0 -z-20 w-full h-full pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/images/hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* CONTEÚDO DO SITE */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />
        <main className="flex-1 flex flex-col justify-center gap-8 py-4 bg-transparent">
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