'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type {
  MapDisplayMode,
  MapRegion,
  MapEngineState,
  MapArenaPOI,
  MapSearchResult,
  PortugalGameMapProps,
} from './types'
import { MapHUDHeader } from './MapHUDHeader'
import { MapControlsCluster } from './MapControlsCluster'
import { MapSearchBar } from './MapSearchBar'
import { DistrictDetailsPanel } from './DistrictDetailsPanel'
import { ArenaDetailsModal } from './ArenaDetailsModal'
import { PortugalVectorFallback } from './PortugalVectorFallback'
import { getTerritoryByName, REGION_CAMERA_PRESETS } from '@/lib/portugal-geojson'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import with SSR disabled for WebGL engine
const PortugalMapboxEngineDynamic = dynamic(
  () =>
    import('./PortugalMapboxEngine').then((mod) => mod.PortugalMapboxEngine),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
        suppressHydrationWarning
      >
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span
          className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400"
          suppressHydrationWarning
        >
          PORTUGAL 2150 // A CARREGAR MOTOR 3D
        </span>
        <span
          className="text-[11px] text-slate-400 mt-1 font-mono"
          suppressHydrationWarning
        >
          A sincronizar relevo e dados nacionais...
        </span>
      </div>
    ),
  }
)

export function PortugalGameMap({
  initialDistrict = 'Lisboa',
  initialRegion = 'continente',
  territories = [],
  onSelectDistrict,
  onSelectPlayer,
  onStartGame,
}: PortugalGameMapProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const [activeMode, setActiveMode] = useState<MapDisplayMode>('satellite')
  const [activeRegion, setActiveRegion] = useState<MapRegion>(initialRegion)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [isDistrictPanelOpen, setIsDistrictPanelOpen] = useState(false)
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false)
  const [is3DPitch, setIs3DPitch] = useState(true)
  const [showArenas, setShowArenas] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWebGLSupported, setIsWebGLSupported] = useState(true)

  const [engineState, setEngineState] = useState<MapEngineState>({
    isReady: false,
    is3DSupported: true,
    isUsingFallbackImagery: false,
    isTerrainActive: true,
    activeMode: 'satellite',
    activeRegion: 'continente',
  })

  // Detect WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setIsWebGLSupported(false)
        setEngineState((prev) => ({
          ...prev,
          isReady: true,
          is3DSupported: false,
        }))
      }
    } catch {
      setIsWebGLSupported(false)
    }
  }, [])

  // Sync active territory data
  const activeTerritory = useMemo(() => {
    return (
      territories.find(
        (t) => t.name.toLowerCase() === selectedDistrict.toLowerCase()
      ) || null
    )
  }, [territories, selectedDistrict])

  // Handle District Selection with Smooth Camera Fly-To
  const handleSelectDistrict = useCallback(
    (name: string) => {
      setSelectedDistrict(name)
      setIsDistrictPanelOpen(true)
      if (onSelectDistrict) onSelectDistrict(name)

      const meta = getTerritoryByName(name)
      if (meta && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo({
          center: meta.center,
          zoom: meta.zoom,
          pitch: is3DPitch ? meta.pitch : 0,
          bearing: meta.bearing,
          duration: 1800,
          essential: true,
        })
      }
    },
    [is3DPitch, onSelectDistrict]
  )

  // Handle Arena Selection
  const handleSelectArena = useCallback((arena: MapArenaPOI) => {
    setSelectedArena(arena)
    setIsArenaModalOpen(true)
    setIsDistrictPanelOpen(false)
  }, [])

  // Handle Search Result Selection
  const handleSelectSearchResult = useCallback(
    (result: MapSearchResult) => {
      if (result.type === 'district') {
        handleSelectDistrict(result.title)
      } else if (result.type === 'arena') {
        handleSelectArena(result.metadata)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: result.coordinates,
            zoom: result.zoom || 12.5,
            pitch: is3DPitch ? result.pitch || 50 : 0,
            duration: 1800,
            essential: true,
          })
        }
      }
    },
    [handleSelectDistrict, handleSelectArena, is3DPitch]
  )

  // Camera Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 })
  }

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 })
  }

  const handleResetPortugal = () => {
    setActiveRegion('continente')
    const preset = REGION_CAMERA_PRESETS.continente
    mapInstanceRef.current?.flyTo({
      center: preset.center,
      zoom: typeof window !== 'undefined' && window.innerWidth < 640 ? 5.3 : 6.3,
      pitch: is3DPitch ? 38 : 0,
      bearing: preset.bearing,
      duration: 1800,
      essential: true,
    })
    setIsDistrictPanelOpen(false)
  }

  const handleToggleFullscreen = () => {
    if (!rootRef.current) return
    if (!document.fullscreenElement) {
      rootRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative w-full h-full min-h-screen bg-slate-950 overflow-hidden flex flex-col select-none',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* 1. TOP HUD HEADER (Modes, Regions, Title, Brand) */}
      <MapHUDHeader
        engineState={engineState}
        activeMode={activeMode}
        activeRegion={activeRegion}
        onSelectMode={(mode) => setActiveMode(mode)}
        onSelectRegion={(region) => setActiveRegion(region)}
        onStartGame={onStartGame}
        selectedDistrict={selectedDistrict}
      />

      {/* 2. SEARCH BAR (Top-left on desktop, below header) */}
      <div className="absolute top-24 left-3 sm:left-6 z-30 pointer-events-auto">
        <MapSearchBar onSelectResult={handleSelectSearchResult} />
      </div>

      {/* 3. CAMERA CONTROLS CLUSTER (Right side) */}
      <MapControlsCluster
        is3D={is3DPitch}
        isFullscreen={isFullscreen}
        showArenas={showArenas}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetPortugal={handleResetPortugal}
        onToggle3D={() => setIs3DPitch(!is3DPitch)}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleArenas={() => setShowArenas(!showArenas)}
      />

      {/* 4. MAIN MAP CANVAS (Edge-to-Edge) */}
      <main className="relative flex-1 w-full h-full inset-0 z-0">
        {isWebGLSupported ? (
          <PortugalMapboxEngineDynamic
            activeMode={activeMode}
            activeRegion={activeRegion}
            selectedDistrict={selectedDistrict}
            territories={territories}
            showArenas={showArenas}
            is3DPitch={is3DPitch}
            onSelectDistrict={handleSelectDistrict}
            onSelectArena={handleSelectArena}
            onEngineStateChange={setEngineState}
            mapInstanceRef={mapInstanceRef}
          />
        ) : (
          <PortugalVectorFallback
            territories={territories}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrict}
          />
        )}
      </main>

      {/* 5. DISTRICT DETAILS PANEL (Side drawer / Bottom sheet) */}
      <DistrictDetailsPanel
        territory={activeTerritory}
        districtName={selectedDistrict}
        isOpen={isDistrictPanelOpen}
        onClose={() => setIsDistrictPanelOpen(false)}
        onSelectPlayer={onSelectPlayer}
        onStartGame={onStartGame}
      />

      {/* 6. ARENA DETAILS MODAL (Interactive POI Card) */}
      <ArenaDetailsModal
        arena={selectedArena}
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
        onStartGame={onStartGame}
      />

      {/* Production Verification Proof Marker */}
      <div
        suppressHydrationWarning
        className="absolute bottom-2 left-2 z-20 pointer-events-none opacity-80 font-mono text-[9px] text-emerald-400/80 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-sm"
      >
        PORTUGAL MAP 2150 BUILD PROOF // BUILD-ID: MAP2150-V2
      </div>
    </div>
  )
}
