'use client'

import React, { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { FAQSection } from '@/components/faq-section'
import { SiteFooter } from '@/components/site-footer'
import SplashScreen from '@/components/SplashScreen'

export default function Page() {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem('hasSeenSplash')
      if (!hasSeen) {
        setShowSplash(true)
      }
    } catch {
      // In case sessionStorage is blocked or unavailable
    }
  }, [])

  const handleFinishSplash = () => {
    try {
      sessionStorage.setItem('hasSeenSplash', 'true')
    } catch {}
    setShowSplash(false)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between">
      {/* 0. INTRO VIDEO SPLASH SCREEN */}
      {showSplash && <SplashScreen onFinish={handleFinishSplash} />}

      {/* 1. FUNDO HERO-BG FIXO EM Z-0 */}
      <div 
        className="fixed inset-0 z-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/images/hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
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
          <FAQSection />
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}