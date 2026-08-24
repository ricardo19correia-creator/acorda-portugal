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
  className,
  children,
}: GlobalAppBackgroundProps) {
  // Se estiver em jogo com arena específica usa customImage, senão usa SEMPRE a imagem global oficial
  const bgImage = customImage || GLOBAL_OFFICIAL_BACKGROUND

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-50 overflow-hidden select-none',
        className
      )}
    >
      {/* Imagem de Fundo Global Oficial 100% Pura, Natural e Nítida sem Overlays */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('${bgImage}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {children}
    </div>
  )
}
