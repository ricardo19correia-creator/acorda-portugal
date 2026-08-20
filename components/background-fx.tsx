'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type BackgroundVariant =
  | 'default'
  | 'homepage'
  | 'multiplayer'
  | 'quiz'
  | 'results'
  | 'ranking'
  | 'explore'
  | 'shop'

interface BackgroundFxProps {
  variant?: BackgroundVariant
  className?: string
}

/**
 * Transparent ambient floating particles and rotating 3D rings,
 * allowing the global body cyberpunk background to shine through.
 */
export function BackgroundFx({ variant = 'default', className }: BackgroundFxProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 3),
        delay: `${(i % 8) * 1.5}s`,
        duration: `${16 + ((i * 5) % 12)}s`,
        type:
          variant === 'multiplayer'
            ? i % 2 === 0
              ? 'purple'
              : 'green'
            : variant === 'results'
              ? i % 2 === 0
                ? 'gold'
                : 'green'
              : i % 3 === 0
                ? 'gold'
                : i % 3 === 1
                  ? 'green'
                  : 'blue',
      })),
    [variant],
  )

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-transparent', className)}
    >
      {/* 1. Subtle Floating 3D Rings */}
      <div className="hidden lg:block absolute -top-40 left-1/2 -translate-x-1/2 w-[55rem] h-[55rem] rounded-full border border-emerald-500/[0.08] animate-spin-slow pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="hidden lg:block absolute -top-44 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full border border-dashed border-cyan-500/[0.06] animate-spin-reverse pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* 2. Floating Luminous Stardust Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            'animate-drift absolute bottom-0 rounded-full pointer-events-none',
            p.type === 'gold'
              ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
              : p.type === 'purple'
                ? 'bg-purple-300 shadow-[0_0_8px_#a855f7]'
                : p.type === 'blue'
                  ? 'bg-blue-300 shadow-[0_0_8px_#3b82f6]'
                  : 'bg-emerald-300 shadow-[0_0_8px_#10b981]',
          )}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.65,
          }}
        />
      ))}
    </div>
  )
}
