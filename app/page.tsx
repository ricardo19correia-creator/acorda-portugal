'use client'

import React from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-foreground flex flex-col justify-between">
      {/* 1. FUNDO HERO NATIVO 100% NÍTIDO E SEM OVERLAYS OU FILTROS */}
      <div 
        className="fixed inset-0 z-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: "url('/images/afonso-henriques-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* 2. CONTEÚDO DO SITE ENCAPSULADO EM RELATIVE Z-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />
        <main className="flex-1 flex flex-col justify-center gap-8 py-4 bg-transparent">
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