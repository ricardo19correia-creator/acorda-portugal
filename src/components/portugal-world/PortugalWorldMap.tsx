'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const PortugalVivoMap = dynamic(
  () => import('@/src/components/portugal-vivo/PortugalVivoMap').then((m) => m.PortugalVivoMap),
  { ssr: false }
)

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
 * Encaminha todas as chamadas globais diretamente para o PortugalVivoMap oficial MapLibre GL.
 */
export function PortugalWorldMap({
  district,
  className,
  onSelectDistrict,
}: PortugalWorldMapProps) {
  return (
    <PortugalVivoMap
      initialDistrict={district}
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
