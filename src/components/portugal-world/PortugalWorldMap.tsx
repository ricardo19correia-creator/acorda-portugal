'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PortugalWorldEngine } from '@/src/game/world/PortugalWorldEngine'
import {
  WorldStateProvider,
  useWorldState,
} from '@/src/game/world/WorldStateProvider'
import type {
  WorldMapMode,
  WorldSector,
  WorldLayersConfig,
} from '@/src/game/world/WorldState'
import type { DistrictItem } from '@/src/data/districts'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import { WorldHUD } from './WorldHUD'
import { DistrictContextCard } from './DistrictContextCard'
import { ArenaContextCard } from './ArenaContextCard'
import { WorldLoading } from './WorldLoading'
import { WorldFallback } from './WorldFallback'

export interface PortugalWorldMapProps {
  mode?: WorldMapMode
  district?: string
  sector?: WorldSector
  showHUD?: boolean
  className?: string
  onSelectDistrict?: (district: DistrictItem) => void
  onSelectArena?: (arena: MapArenaPOI) => void
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * Inner Map Engine Runner (Consumes WorldStateProvider)
 */
function PortugalWorldMapInner({
  mode = 'world',
  district,
  sector = 'continente',
  showHUD = true,
  className,
  onSelectDistrict: externalSelectDistrict,
  onSelectArena: externalSelectArena,
}: PortugalWorldMapProps) {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<PortugalWorldEngine | null>(null)

  const [hasWebGL, setHasWebGL] = useState(true)
  const [engineReady, setEngineReady] = useState(false)

  const {
    districts,
    selectedDistrict,
    selectedArena,
    activeSector,
    layers,
    selectDistrict,
    selectArena,
    hoverDistrict,
    setSector,
    toggleLayer,
  } = useWorldState()

  // 1. Initial WebGL check
  useEffect(() => {
    setHasWebGL(checkWebGLSupport())
  }, [])

  // 2. Initialize Engine once on mount
  useEffect(() => {
    if (!hasWebGL || !mapContainerRef.current) return
    if (engineRef.current) return

    const engine = new PortugalWorldEngine({
      container: mapContainerRef.current,
      mode,
      initialSector: sector,
      initialDistrict: district,
      layers,
      callbacks: {
        onSelectDistrict: (d) => {
          selectDistrict(d)
          if (d && externalSelectDistrict) {
            externalSelectDistrict(d)
          }
        },
        onHoverDistrict: (d) => {
          hoverDistrict(d)
        },
        onSelectArena: (a) => {
          selectArena(a)
          if (a && externalSelectArena) {
            externalSelectArena(a)
          }
        },
        onReady: () => {
          setEngineReady(true)
        },
      },
    })

    engineRef.current = engine

    const handleResize = () => {
      engine.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.destroy()
      engineRef.current = null
    }
  }, [hasWebGL])

  // 3. React to mode changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMode(mode)
    }
  }, [mode])

  // 4. React to external district focus
  useEffect(() => {
    if (district && engineRef.current) {
      engineRef.current.selectDistrict(district)
    }
  }, [district])

  // 5. React to layer toggles
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setLayers(layers)
    }
  }, [layers])

  // 6. Camera Controls Handlers
  const handleSelectSector = useCallback(
    (newSector: WorldSector) => {
      setSector(newSector)
      if (engineRef.current) {
        engineRef.current.camera.goToSector(newSector)
      }
    },
    [setSector]
  )

  const handleSelectDistrictItem = useCallback(
    (targetDistrict: DistrictItem) => {
      selectDistrict(targetDistrict)
      if (engineRef.current) {
        engineRef.current.selectDistrict(targetDistrict)
      }
      if (externalSelectDistrict) {
        externalSelectDistrict(targetDistrict)
      }
    },
    [selectDistrict, externalSelectDistrict]
  )

  const handleResetOverview = useCallback(() => {
    handleSelectSector('continente')
    selectDistrict(null)
    selectArena(null)
  }, [handleSelectSector, selectDistrict, selectArena])

  const handleZoomIn = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.camera.zoomIn()
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.camera.zoomOut()
    }
  }, [])

  const handlePlayDistrict = useCallback((d: DistrictItem) => {
    router.push(`/jogar?district=${encodeURIComponent(d.slug)}`)
  }, [router])

  if (!hasWebGL) {
    return <WorldFallback onRetry={() => setHasWebGL(checkWebGLSupport())} />
  }

  return (
    <div className={`relative w-full h-full overflow-hidden select-none isolate bg-slate-950 ${className || ''}`}>
      {/* 1. MapLibre WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* 2. Loading State */}
      {!engineReady && (
        <div className="absolute inset-0 z-10">
          <WorldLoading />
        </div>
      )}

      {/* 3. Game HUD */}
      {showHUD && engineReady && (
        <WorldHUD
          activeSector={activeSector}
          onSelectSector={handleSelectSector}
          onSelectDistrict={handleSelectDistrictItem}
          onReset={handleResetOverview}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          layers={layers}
          onToggleLayer={toggleLayer}
        />
      )}

      {/* 4. Compact Contextual District Card */}
      {selectedDistrict && (
        <DistrictContextCard
          district={selectedDistrict}
          onClose={() => selectDistrict(null)}
          onPlay={handlePlayDistrict}
        />
      )}

      {/* 5. Compact Contextual Arena Card */}
      {selectedArena && (
        <ArenaContextCard
          arena={selectedArena}
          onClose={() => selectArena(null)}
        />
      )}
    </div>
  )
}

/**
 * Self-contained Master Reusable PortugalWorldMap Component
 */
export function PortugalWorldMap(props: PortugalWorldMapProps) {
  return (
    <WorldStateProvider
      initialMode={props.mode}
      initialDistrict={props.district}
      initialSector={props.sector}
    >
      <PortugalWorldMapInner {...props} />
    </WorldStateProvider>
  )
}

export default PortugalWorldMap
