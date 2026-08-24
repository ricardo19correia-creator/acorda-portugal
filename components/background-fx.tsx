'use client'

import React from 'react'
import { AppBackground, AppBackgroundVariant, GLOBAL_OFFICIAL_BACKGROUND } from '@/components/AppBackground'

export type BackgroundVariant =
  | AppBackgroundVariant
  | 'homepage'
  | 'explore'

export interface BackgroundFxProps {
  variant?: BackgroundVariant | string
  customImage?: string
  contrastIntensity?: 'subtle' | 'normal' | 'strong'
  showParticles?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Componente BackgroundFx:
 * Renders the single global official background across all screens
 * or the active arena customImage during in-game matches.
 */
export function BackgroundFx({
  variant = 'home',
  customImage,
  contrastIntensity = 'normal',
  showParticles = true,
  className,
  children,
}: BackgroundFxProps) {
  return (
    <AppBackground
      variant={variant as AppBackgroundVariant}
      customImage={customImage}
      contrastIntensity={contrastIntensity}
      showParticles={showParticles}
      className={className}
    >
      {children}
    </AppBackground>
  )
}

export { AppBackground, GLOBAL_OFFICIAL_BACKGROUND }
export const GlobalAppBackground = AppBackground


