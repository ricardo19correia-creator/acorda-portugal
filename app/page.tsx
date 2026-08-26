'use client'

import React from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { MobileLaunchCountdown } from '@/components/mobile-launch-countdown'
import { SiteFooter } from '@/components/site-footer'
import { AppBackground } from '@/components/AppBackground'

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between">
      {/* 1. FUNDO GLOBAL OFICIAL DO ACORDA PORTUGAL */}
      <AppBackground />
      
      {/* 2. CONTEÚDO DO SITE ENCAPSULADO EM RELATIVE Z-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />
        <main className="flex-1 flex flex-col justify-center gap-8 py-4 bg-transparent">
          <Hero />
          <MobileLaunchCountdown />
          <div id="simbolo">
            <GuzmaniaSection />
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}