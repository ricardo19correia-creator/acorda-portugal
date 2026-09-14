'use client'

import React from 'react'
import type { ArenaEffect } from '@/data/shopArenas'

export interface ArenaEffectsLayerProps {
  effect?: ArenaEffect
  intensity?: 'low' | 'medium' | 'high'
  showContrastOverlay?: boolean
  className?: string
}

export function ArenaEffectsLayer({
  effect = 'none',
  intensity = 'medium',
  showContrastOverlay = false,
  className = '',
}: ArenaEffectsLayerProps) {
  // Conforme Diretiva: ZERO efeitos visuais nas arenas. Imagens limpas e estáveis.
  return null
}

export default ArenaEffectsLayer
