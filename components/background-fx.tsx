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
 * Modern Immersive Video Game Background Universe
 * Layered dynamic lighting, 3D rotating rings, subtle Portuguese azulejo/calçada tech grids,
 * floating stardust particles and energy auroras.
 */
export function BackgroundFx({ variant = 'default', className }: BackgroundFxProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 4),
        delay: `${(i % 8) * 1.8}s`,
        duration: `${16 + ((i * 5) % 14)}s`,
        type:
          variant === 'multiplayer'
            ? i % 3 === 0
              ? 'purple'
              : i % 3 === 1
                ? 'blue'
                : 'green'
            : variant === 'results'
              ? i % 2 === 0
                ? 'gold'
                : 'green'
              : variant === 'ranking'
                ? i % 3 === 0
                  ? 'gold'
                  : i % 3 === 1
                    ? 'purple'
                    : 'red'
                : i % 4 === 0
                  ? 'gold'
                  : i % 4 === 1
                    ? 'red'
                    : i % 4 === 2
                      ? 'green'
                      : 'blue',
      })),
    [variant],
  )

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none', className)}
    >
      {/* 1. BASE ATMOSPHERIC GRADIENT PER VARIANT */}
      {variant === 'multiplayer' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,_rgba(147,51,234,0.35),_transparent_70%),radial-gradient(ellipse_70%_50%_at_80%_90%,_rgba(59,130,246,0.25),_transparent_70%),linear-gradient(180deg,#0a0614_0%,#0e091d_40%,#090514_100%)]" />
      ) : variant === 'results' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,_rgba(234,179,8,0.35),_transparent_70%),radial-gradient(ellipse_80%_60%_at_20%_80%,_rgba(16,185,129,0.25),_transparent_70%),linear-gradient(180deg,#0d150f_0%,#09120c_50%,#070d09_100%)]" />
      ) : variant === 'ranking' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,_rgba(225,29,72,0.28),_transparent_70%),radial-gradient(ellipse_70%_50%_at_85%_85%,_rgba(234,179,8,0.25),_transparent_70%),linear-gradient(180deg,#120710_0%,#0d0813_50%,#08040a_100%)]" />
      ) : variant === 'quiz' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_rgba(16,185,129,0.2),_transparent_75%),linear-gradient(180deg,#060e0a_0%,#040a07_50%,#030705_100%)]" />
      ) : variant === 'explore' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,_rgba(37,99,235,0.3),_transparent_70%),radial-gradient(ellipse_70%_50%_at_20%_85%,_rgba(16,185,129,0.25),_transparent_70%),linear-gradient(180deg,#060e18_0%,#050b13_50%,#03070c_100%)]" />
      ) : variant === 'shop' ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,_rgba(6,182,212,0.3),_transparent_70%),radial-gradient(ellipse_70%_50%_at_80%_85%,_rgba(234,179,8,0.28),_transparent_70%),linear-gradient(180deg,#091216_0%,#060c10_50%,#04070a_100%)]" />
      ) : (
        /* Homepage & Default: Rich Portuguese National Video Game Cosmos */
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_-12%,_rgba(16,185,129,0.32),_transparent_70%),radial-gradient(ellipse_75%_55%_at_15%_65%,_rgba(239,68,68,0.2),_transparent_65%),radial-gradient(ellipse_75%_55%_at_85%_85%,_rgba(245,158,11,0.22),_transparent_65%),linear-gradient(180deg,#06140d_0%,#040d09_50%,#080406_100%)]" />
      )}

      {/* 2. SUBTLE PORTUGUESE CYBER PATTERNS */}
      <div className="pattern-azulejo-cyber absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]" />
      <div className="pattern-calcada absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_bottom,black_40%,transparent_90%)]" />
      <div className="grid-tech absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_90%)]" />

      {/* 2.1. DARK EDGE VIGNETTE & CONTRAST GRADIENT OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.1)_0%,_rgba(0,0,0,0.75)_100%)]" />

      {/* 3. ABSTRACT 3D ROTATING RINGS (Subtle, slow, futuristic) */}
      <div className="hidden lg:block absolute -top-40 left-1/2 -translate-x-1/2 w-[55rem] h-[55rem] rounded-full border border-emerald-500/[0.08] animate-spin-slow pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="hidden lg:block absolute -top-44 left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full border border-dashed border-cyan-500/[0.06] animate-spin-reverse pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* 4. VOLUMETRIC GLOWING LIGHT BLOBS (Floating & Breathing Néons) */}
      {variant === 'multiplayer' ? (
        <>
          <div className="animate-glow-pulse absolute -right-32 -top-20 h-[38rem] w-[38rem] rounded-full bg-purple-600/25 blur-3xl" />
          <div
            className="animate-glow-pulse absolute -left-28 top-1/3 h-[34rem] w-[34rem] rounded-full bg-blue-600/20 blur-3xl"
            style={{ animationDelay: '2.5s' }}
          />
          <div
            className="animate-glow-pulse absolute right-1/4 -bottom-24 h-[32rem] w-[32rem] rounded-full bg-emerald-500/18 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </>
      ) : variant === 'results' ? (
        <>
          <div className="animate-glow-pulse absolute -right-20 -top-20 h-[40rem] w-[40rem] rounded-full bg-amber-500/30 blur-3xl" />
          <div
            className="animate-glow-pulse absolute -left-24 top-1/4 h-[34rem] w-[34rem] rounded-full bg-emerald-500/25 blur-3xl"
            style={{ animationDelay: '2.5s' }}
          />
          <div
            className="animate-glow-pulse absolute left-1/3 -bottom-28 h-[36rem] w-[36rem] rounded-full bg-amber-400/20 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </>
      ) : variant === 'ranking' ? (
        <>
          <div className="animate-glow-pulse absolute -right-24 -top-20 h-[38rem] w-[38rem] rounded-full bg-rose-600/25 blur-3xl" />
          <div
            className="animate-glow-pulse absolute -left-24 top-1/3 h-[34rem] w-[34rem] rounded-full bg-purple-600/25 blur-3xl"
            style={{ animationDelay: '2.5s' }}
          />
          <div
            className="animate-glow-pulse absolute right-1/3 -bottom-28 h-[36rem] w-[36rem] rounded-full bg-amber-500/22 blur-3xl"
            style={{ animationDelay: '4s' }}
          />
        </>
      ) : variant === 'quiz' ? (
        <>
          <div className="animate-glow-pulse absolute -right-36 -top-24 h-[32rem] w-[32rem] rounded-full bg-emerald-500/15 blur-3xl" />
          <div
            className="animate-glow-pulse absolute -left-28 -bottom-24 h-[32rem] w-[32rem] rounded-full bg-blue-600/12 blur-3xl"
            style={{ animationDelay: '3s' }}
          />
        </>
      ) : (
        /* Default / Homepage: Cyberpunk Português (Verde Esmeralda, Ciano, Magenta) */
        <>
          <div className="animate-glow-pulse absolute -right-32 -top-20 h-[42rem] w-[42rem] rounded-full bg-emerald-500/26 blur-3xl" />
          <div
            className="animate-glow-pulse absolute -left-28 top-1/3 h-[36rem] w-[36rem] rounded-full bg-cyan-500/20 blur-3xl"
            style={{ animationDelay: '2.5s' }}
          />
          <div
            className="animate-glow-pulse absolute right-12 -bottom-28 h-[38rem] w-[38rem] rounded-full bg-fuchsia-600/18 blur-3xl"
            style={{ animationDelay: '4.2s' }}
          />
          <div
            className="hidden lg:block animate-glow-pulse absolute left-1/3 -top-32 h-[32rem] w-[32rem] rounded-full bg-emerald-400/15 blur-3xl"
            style={{ animationDelay: '1.8s' }}
          />
        </>
      )}

      {/* 5. FLOATING LUMINOUS STARDUST PARTICLES */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            'animate-drift absolute bottom-0 rounded-full',
            p.type === 'gold'
              ? 'bg-amber-300 shadow-[0_0_10px_#f59e0b]'
              : p.type === 'red'
                ? 'bg-rose-400 shadow-[0_0_10px_#ef4444]'
                : p.type === 'purple'
                  ? 'bg-purple-300 shadow-[0_0_10px_#a855f7]'
                  : p.type === 'blue'
                    ? 'bg-blue-300 shadow-[0_0_10px_#3b82f6]'
                    : 'bg-emerald-300 shadow-[0_0_10px_#10b981]',
          )}
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: 0.75,
          }}
        />
      ))}
    </div>
  )
}


