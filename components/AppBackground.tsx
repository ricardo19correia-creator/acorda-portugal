'use client'

import React from 'react'
import { GlobalAppBackground, type GlobalAppBackgroundProps, GLOBAL_OFFICIAL_BACKGROUND } from '@/components/GlobalAppBackground'

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

export interface AppBackgroundProps extends GlobalAppBackgroundProps {
  variant?: AppBackgroundVariant | string
}

/**
 * Componente Global Oficial de Fundo do Acorda Portugal.
 * Todas as páginas usam a mesma imagem oficial do ecrã inicial por padrão (bg-loja.jpg).
 * Apenas partidas ativas de jogo sobrepõem o cenário com customImage da arena.
 */
export function AppBackground({
  customImage,
  className,
  children,
  ...props
}: AppBackgroundProps) {
  return (
    <GlobalAppBackground
      customImage={customImage}
      className={className}
      {...props}
    >
      {children}
    </GlobalAppBackground>
  )
}

export { GlobalAppBackground, GLOBAL_OFFICIAL_BACKGROUND }
