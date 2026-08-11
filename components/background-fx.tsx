'use client'

import { useMemo } from 'react'

/**
 * Ambient background: layered Portuguese-green + gold glow, a faint tech grid
 * masked to the centre, and a scatter of slowly drifting particles.
 * Purely decorative, so it is hidden from assistive tech.
 */
export function BackgroundFx() {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 4),
        delay: `${(i % 9) * 1.7}s`,
        duration: `${14 + ((i * 5) % 12)}s`,
        gold: i % 4 === 0,
      })),
    [],
  )

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base vertical gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.17_0.03_158),oklch(0.13_0.018_160)_55%,oklch(0.15_0.02_25/_0.6))]" />
      {/* top radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.3_0.07_158_/_0.55),_transparent_60%)]" />
      {/* green glow, upper right */}
      <div className="animate-glow-pulse absolute -right-40 -top-32 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-3xl" />
      {/* gold glow, lower left */}
      <div
        className="animate-glow-pulse absolute -bottom-48 -left-28 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-3xl"
        style={{ animationDelay: '2s' }}
      />
      {/* red glow, mid left — subtle flag identity */}
      <div
        className="animate-glow-pulse absolute left-[-10rem] top-1/2 h-[24rem] w-[24rem] rounded-full bg-flag-red/10 blur-3xl"
        style={{ animationDelay: '3.4s' }}
      />
      {/* faint tech grid masked to centre */}
      <div className="grid-tech absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      {/* drifting particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={`animate-drift absolute bottom-0 rounded-full ${p.gold ? 'bg-gold/70' : 'bg-primary/70'}`}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}
