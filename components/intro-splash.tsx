'use client'

import { useState, useEffect } from 'react'
import { BrandLogo } from './brand-logo'
import { PortugalMapIntro } from './portugal-map-intro'
import { cn } from '@/lib/utils'

export function IntroSplash({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Sequence of animations
    timers.push(setTimeout(() => setPhase(1), 100)) // Map outline
    timers.push(setTimeout(() => setPhase(2), 1000)) // Logo
    timers.push(setTimeout(() => setPhase(3), 2000)) // Tagline
    timers.push(setTimeout(() => setPhase(4), 3200)) // Fade out
    timers.push(setTimeout(onFinish, 3800)) // Finish and unmount

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [onFinish])

  return (
    <div
      className={cn(
        'intro-splash fixed inset-0 z-[100] grid place-items-center bg-background transition-opacity duration-500',
        phase >= 4 ? 'opacity-0' : 'opacity-100',
      )}
    >
      <div className="relative flex w-full max-w-lg flex-col items-center px-4">
        {/* Map Animation */}
        <div
          className={cn(
            'mb-8 w-full max-w-xs transition-opacity duration-700',
            phase >= 1 ? 'opacity-100' : 'opacity-0',
          )}
        >
          <PortugalMapIntro startAnimation={phase >= 1} />
        </div>

        {/* Logo Animation */}
        <div
          className={cn(
            'intro-logo-container transition-all duration-500',
            phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          )}
        >
          <BrandLogo />
        </div>

        {/* Tagline Animation */}
        <p
          className={cn(
            'intro-tagline mt-6 font-display text-lg font-bold uppercase tracking-widest text-gold-gradient transition-opacity duration-500',
            phase >= 3 ? 'opacity-100' : 'opacity-0',
          )}
        >
          Portugal está à tua espera.
        </p>
      </div>

      {/* Reduced motion fallback */}
      <div className="prefers-reduced-motion-only absolute inset-0 flex flex-col items-center justify-center bg-background">
        <div className="w-full max-w-xs">
          <PortugalMapIntro startAnimation={true} />
        </div>
        <div className="mt-8">
          <BrandLogo />
        </div>
        <p className="mt-6 font-display text-lg font-bold uppercase tracking-widest text-gold-gradient">
          Portugal está à tua espera.
        </p>
      </div>
    </div>
  )
}