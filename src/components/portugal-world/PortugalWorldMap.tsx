'use client'

import React from 'react'
import { PortugalMapEngine } from '@/components/portugal-engine/PortugalMapEngine'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import type { MapViewMode } from '@/components/portugal-engine/PortugalMapLayers'

export interface PortugalWorldMapProps {
  mode?: 'world' | 'ranking' | 'arena' | 'district' | 'event' | string
  district?: string
  sector?: string
  showHUD?: boolean
  className?: string
  onSelectDistrict?: (district: any) => void
  onSelectArena?: (arena: MapArenaPOI) => void
}

/**
 * PortugalWorldMap Unificado
 * Encaminha todas as chamadas globais diretamente para o PortugalMapEngine canónico.
 */
export function PortugalWorldMap({
  mode = 'mapa',
  district,
  showHUD = true,
  className,
  onSelectDistrict,
  onSelectArena,
}: PortugalWorldMapProps) {
  const mappedMode: MapViewMode =
    mode === 'ranking' ? 'ranking' : mode === 'arena' ? 'arena' : 'mapa'

  return (
    <PortugalMapEngine
      mode={mappedMode}
      initialDistrict={district}
      showHUD={showHUD}
      className={className}
      onSelectDistrict={(t) => {
        if (onSelectDistrict) {
          onSelectDistrict(t ? { name: t.name, slug: t.id, id: t.id } : null)
        }
      }}
      onSelectArena={onSelectArena}
    />
  )
}

export default PortugalWorldMap
