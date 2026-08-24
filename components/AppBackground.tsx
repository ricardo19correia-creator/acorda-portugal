'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

export type AppBackgroundVariant =
  | 'splash'
  | 'auth'
  | 'home'
  | 'profile'
  | 'categories'
  | 'quiz'
  | 'results'
  | 'victory'
  | 'defeat'
  | 'multiplayer'
  | 'matchmaking'
  | 'duel'
  | 'duel-result'
  | 'ranking'
  | 'challenges'
  | 'achievements'
  | 'rewards'
  | 'shop'
  | 'powerups'
  | 'settings'
  | 'about'
  | 'support'
  | 'offline'
  | 'not-found'
  | 'default'

/**
 * IMAGEM OFICIAL DO BACKGROUND GLOBAL DO ACORDA PORTUGAL (bg-loja)
 * Única fonte de verdade para todas as páginas da aplicação fora de jogo.
 */
export const GLOBAL_OFFICIAL_BACKGROUND = '/images/bg-loja.jpg'

export interface AppBackgroundProps {
  variant?: AppBackgroundVariant | string
  /** Permite sobrepor uma imagem de arena quando o jogador está em partida ativa */
  customImage?: string
  /** Intensidade do escurecimento para legibilidade da UI ('subtle' | 'normal' | 'strong') */
  contrastIntensity?: 'subtle' | 'normal' | 'strong'
  showParticles?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Componente Global Oficial de Fundo do Acorda Portugal.
 * Todas as páginas usam a mesma imagem oficial do ecrã inicial por padrão.
 * Apenas partidas ativas de jogo sobrepõem o cenário com customImage da arena.
 */
export function AppBackground({
  variant = 'home',
  customImage,
  contrastIntensity = 'normal',
  showParticles = true,
  className,
  children,
}: AppBackgroundProps) {
  // Se estiver em jogo com arena específica usa customImage, senão usa SEMPRE a imagem global oficial
  const bgImage = customImage || GLOBAL_OFFICIAL_BACKGROUND
  const isCustomArena = Boolean(customImage)

  // Partículas subtis ambientais
  const particles = useMemo(() => {
    if (!showParticles) return []

    const particleCount = 14
    return Array.from({ length: particleCount }).map((_, i) => {
      let colorType = 'emerald'
      if (['victory', 'ranking', 'rewards', 'achievements'].includes(variant)) {
        colorType = i % 2 === 0 ? 'gold' : 'emerald'
      } else if (['multiplayer', 'duel', 'defeat'].includes(variant)) {
        colorType = i % 2 === 0 ? 'rose' : 'cyan'
      } else if (['about', 'shop', 'not-found'].includes(variant)) {
        colorType = i % 3 === 0 ? 'purple' : i % 3 === 1 ? 'emerald' : 'gold'
      }

      return {
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 3) % 3),
        delay: `${(i % 5) * 1.5}s`,
        duration: `${12 + ((i * 5) % 8)}s`,
        colorType,
      }
    })
  }, [variant, showParticles])

  // Máscara subtil e consistente para legibilidade do texto em todas as resoluções
  const overlayClass = isCustomArena
    ? contrastIntensity === 'strong'
      ? 'bg-slate-950/60'
      : contrastIntensity === 'subtle'
      ? 'bg-slate-950/20'
      : 'bg-slate-950/40'
    : contrastIntensity === 'strong'
    ? 'bg-slate-950/60'
    : contrastIntensity === 'subtle'
    ? 'bg-slate-950/30'
    : 'bg-slate-950/45'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-slate-950',
        className
      )}
    >
      {/* 1. Imagem de Fundo Global Oficial (100% Cobertura sem Deformações) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-700 will-change-transform scale-[1.01]"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 2. Máscara de Contraste Subtil e Uniforme para Legibilidade do Conteúdo */}
      <div className={cn('absolute inset-0 pointer-events-none transition-colors duration-500', overlayClass)} />

      {/* 3. Micropartículas Lançadas em Segundo Plano */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <span
              key={p.id}
              className={cn(
                'animate-drift absolute bottom-0 rounded-full pointer-events-none opacity-50',
                p.colorType === 'gold'
                  ? 'bg-amber-300 shadow-[0_0_8px_#f59e0b]'
                  : p.colorType === 'rose'
                  ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                  : p.colorType === 'cyan'
                  ? 'bg-cyan-300 shadow-[0_0_8px_#06b6d4]'
                  : p.colorType === 'purple'
                  ? 'bg-purple-300 shadow-[0_0_8px_#a855f7]'
                  : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
              )}
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
      )}

      {children}
    </div>
  )
}

export const GlobalAppBackground = AppBackground
