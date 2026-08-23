'use client'

import React from 'react'
import { AppBackground, AppBackgroundVariant } from '@/components/AppBackground'

export type BackgroundVariant =
  | AppBackgroundVariant
  | 'homepage'
  | 'explore'

interface BackgroundFxProps {
  variant?: BackgroundVariant
  customImage?: string
  contrastIntensity?: 'subtle' | 'normal' | 'strong'
  showParticles?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Enhanced BackgroundFx component:
 * Renders the official Acorda Portugal 24-background system
 * with contrast safe-zones and ambient particle effects.
 */
export function BackgroundFx({
  variant = 'default',
  customImage,
  contrastIntensity = 'normal',
  showParticles = true,
  className,
  children,
}: BackgroundFxProps) {
  // Mapeamento de variantes legadas para o sistema de 24 fundos oficiais
  let mappedVariant: AppBackgroundVariant = 'home'

  if (variant === 'homepage' || variant === 'default') {
    mappedVariant = 'home'
  } else if (variant === 'explore') {
    mappedVariant = 'about'
  } else {
    mappedVariant = variant as AppBackgroundVariant
  }

  return (
    <AppBackground
      variant={mappedVariant}
      customImage={customImage}
      contrastIntensity={contrastIntensity}
      showParticles={showParticles}
      className={className}
    >
      {children}
    </AppBackground>
  )
}

