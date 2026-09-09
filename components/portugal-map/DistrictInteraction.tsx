'use client'

import React, { useState, useCallback, useEffect } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'

export interface DistrictInteractionState {
  selectedDistrict: DistrictMapItem | null
  hoveredDistrict: DistrictMapItem | null
  mousePosition: { x: number; y: number }
  selectDistrict: (district: DistrictMapItem | null) => void
  hoverDistrict: (district: DistrictMapItem | null, event?: React.MouseEvent) => void
  clearSelection: () => void
}

export function useDistrictInteraction(
  territories: DistrictMapItem[],
  initialDistrictSlug?: string
): DistrictInteractionState {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictMapItem | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictMapItem | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Inicializar distrito se fornecido por query param ou prop
  useEffect(() => {
    if (initialDistrictSlug && territories.length > 0) {
      const target = territories.find(
        (t) =>
          t.slug.toLowerCase() === initialDistrictSlug.toLowerCase() ||
          t.id.toLowerCase() === initialDistrictSlug.toLowerCase() ||
          t.name.toLowerCase() === initialDistrictSlug.toLowerCase()
      )
      if (target) {
        setSelectedDistrict(target)
      }
    }
  }, [initialDistrictSlug, territories])

  const selectDistrict = useCallback((district: DistrictMapItem | null) => {
    setSelectedDistrict((prev) => (prev?.id === district?.id ? null : district))
  }, [])

  const hoverDistrict = useCallback((district: DistrictMapItem | null, event?: React.MouseEvent) => {
    setHoveredDistrict(district)
    if (event) {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedDistrict(null)
    setHoveredDistrict(null)
  }, [])

  return {
    selectedDistrict,
    hoveredDistrict,
    mousePosition,
    selectDistrict,
    hoverDistrict,
    clearSelection,
  }
}
