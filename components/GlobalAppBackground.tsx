'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

/**
 * IMAGEM OFICIAL DO BACKGROUND GLOBAL DO ACORDA PORTUGAL (bg-loja)
 * Única fonte de verdade para todas as páginas da aplicação fora de jogo.
 */
export const GLOBAL_OFFICIAL_BACKGROUND = '/images/bg-loja.jpg'

export interface GlobalAppBackgroundProps {
  /** Permite sobrepor uma imagem de arena quando o jogador está em partida ativa (gameplay) */
  customImage?: string
  /** Intensidade do escurecimento para legibilidade da UI ('subtle' | 'normal' | 'strong') */
  contrastIntensity?: 'subtle' | 'normal' | 'strong'
  showParticles?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Componente Global Oficial de Fundo do Acorda Portugal.
 * Todas as páginas da aplicação (Home, Login, Registo, Perfil, Loja, Ranking, Definições, etc.)
 * usam a mesma imagem oficial do ecrã inicial.
 * Apenas partidas ativas de jogo sobrepõem com a imagem da arena equipada.
 */
export function GlobalAppBackground({
  customImage,
  contrastIntensity = 'normal',
  showParticles = true,
  className,
  children,
}: GlobalAppBackgroundProps) {
  // Se estiver em jogo com arena específica usa customImage, senão usa SEMPRE a imagem global oficial
  const bgImage = customImage || GLOBAL_OFFICIAL_BACKGROUND
  const isCustomArena = Boolean(customImage)

  // Partículas subtis ambientais
  const particles = useMemo(() => {
    if (!showParticles) return []

    const particleCount = 14
    return Array.from({ length: particleCount }).map((_, i) => {
      const colorType = i % 3 === 0 ? 'emerald' : i % 3 === 1 ? 'gold' : 'cyan'
      return {
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 3) % 3),
        delay: `${(i % 5) * 1.5}s`,
        duration: `${12 + ((i * 5) % 8)}s`,
        colorType,
      }
    })
  }, [showParticles])

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
                  : p.colorType === 'cyan'
                  ? 'bg-cyan-300 shadow-[0_0_8px_#06b6d4]'
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
