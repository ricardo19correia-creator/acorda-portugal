'use client'

import React from 'react'
import type { SupremeArenaEffectType } from '@/lib/supreme-arenas'

export interface SupremeArenaAtmosphereProps {
  effectType?: SupremeArenaEffectType | string
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  burstTrigger?: 'correct' | 'wrong' | null
  className?: string
}

export function SupremeArenaAtmosphere({
  effectType = 'palacio_dourado',
  quality = 'ultra',
  burstTrigger = null,
  className = '',
}: SupremeArenaAtmosphereProps) {
  // Conforme Diretiva: ZERO efeitos visuais nas arenas. Imagens limpas e estáveis.
  return null
}

export default SupremeArenaAtmosphere
