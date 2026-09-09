'use client'

import React from 'react'
import { PortugalMap } from '@/components/portugal-map/PortugalMap'

export interface PortugalWorldMapProps {
  mode?: string
  district?: string
  sector?: string
  showHUD?: boolean
  className?: string
  onSelectDistrict?: (district: any) => void
  onSelectArena?: (arena: any) => void
}

/**
 * PortugalWorldMap Unificado
 * Encaminha todas as chamadas globais diretamente para o PortugalMap oficial de alta performance.
 */
export function PortugalWorldMap({
  district,
  showHUD = true,
  className,
  onSelectDistrict,
}: PortugalWorldMapProps) {
  return (
    <PortugalMap
      initialDistrict={district}
      showHUD={showHUD}
      className={className}
      onSelectDistrict={(t) => {
        if (onSelectDistrict) {
          onSelectDistrict(t ? { name: t.name, slug: t.slug, id: t.id } : null)
        }
      }}
    />
  )
}

export default PortugalWorldMap
