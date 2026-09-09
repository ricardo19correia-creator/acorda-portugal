'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Constante legada mantida sem fallback de imagem estática.
 */
export const GLOBAL_OFFICIAL_BACKGROUND = ''

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
 * Todas as páginas da aplicação usam o GlobalBackgroundVideo (vídeo contínuo no layout).
 * Partidas ativas de jogo com arena específica sobrepõem o cenário através de customImage.
 */
export function GlobalAppBackground({
  customImage,
  className,
  children,
}: GlobalAppBackgroundProps) {
  // Se estiver em jogo com arena específica sobrepõe com a arte da arena
  if (customImage) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none',
          className
        )}
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url('${customImage}')`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: 1,
            filter: 'none',
            WebkitFilter: 'none',
          }}
        />
        {/* Overlay subtil para a arena de jogo */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        {children}
      </div>
    )
  }

  // Se não há arena personalizada, o GlobalBackgroundVideo no RootLayout é a fonte de verdade.
  if (children) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-0 z-[5] overflow-hidden select-none',
          className
        )}
      >
        {children}
      </div>
    )
  }

  return null
}
