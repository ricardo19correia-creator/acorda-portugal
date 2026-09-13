'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  PortugalSatelliteEngine,
  type MapSector,
  type MapLayersState,
  DEFAULT_MAP_LAYERS,
} from '@/src/game/world/PortugalSatelliteEngine'
import { usePortugalVivoData, type PortugalVivoDistrict } from '@/src/hooks/usePortugalVivoData'
import { PortugalAgoraHUD } from './PortugalAgoraHUD'
import { MapLayersWidget } from './MapLayersWidget'
import { DistrictActionPanel } from './DistrictActionPanel'
import { ZoomIn, ZoomOut, Compass, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PortugalVivoMapProps {
  initialDistrict?: string
  className?: string
  onSelectDistrict?: (district: PortugalVivoDistrict | null) => void
}

export function PortugalVivoMap({
  initialDistrict,
  className,
  onSelectDistrict: externalSelectDistrict,
}: PortugalVivoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<PortugalSatelliteEngine | null>(null)

  const [isEngineReady, setIsEngineReady] = useState(false)
  const [currentSector, setCurrentSector] = useState<MapSector>('continente')
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(() => initialDistrict || null)
  const [layersOpen, setLayersOpen] = useState(false)
  const [layersState, setLayersState] = useState<MapLayersState>(DEFAULT_MAP_LAYERS)
  const [isScanning, setIsScanning] = useState(false)

  // 1. Hook de Dados Reais da Nação em Tempo Real (Firestore)
  const data = usePortugalVivoData()

  // Distrito selecionado derivado diretamente dos dados reativos em tempo real
  const selectedDistrict = useMemo(() => {
    if (!selectedDistrictId) return null
    return data.districtMap.get(selectedDistrictId.toLowerCase()) || null
  }, [selectedDistrictId, data.districtMap])

  // 2. Inicialização do Motor MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (engineRef.current) return

    const engine = new PortugalSatelliteEngine({
      container: mapContainerRef.current,
      initialSector: 'continente',
      initialDistrictId: initialDistrict,
      layers: layersState,
      onSelectDistrict: (district) => {
        setSelectedDistrictId(district ? district.id : null)
        if (externalSelectDistrict) {
          externalSelectDistrict(district)
        }
      },
      onSectorChange: (sector) => {
        setCurrentSector(sector)
      },
      onReady: () => {
        setIsEngineReady(true)
      },
    })

    engineRef.current = engine

    const handleResize = () => {
      engine.resize()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      engine.destroy()
      engineRef.current = null
    }
  }, [initialDistrict, externalSelectDistrict]) // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Propagação de Dados Reais para o Motor
  useEffect(() => {
    if (engineRef.current && isEngineReady && data.districts.length > 0) {
      engineRef.current.updateData(data.districts, data.confrontations)
    }
  }, [data.districts, data.confrontations, isEngineReady])

  // 4. Seleção Geográfica de Arquipélago / Continente
  const handleSelectSector = useCallback((sector: MapSector) => {
    setCurrentSector(sector)
    setSelectedDistrictId(null)
    engineRef.current?.fitSector(sector)
  }, [])

  // 5. Controlo de Camadas
  const handleToggleLayer = useCallback((layerKey: keyof MapLayersState) => {
    setLayersState((prev) => {
      const next = !prev[layerKey]
      engineRef.current?.setLayerVisibility(layerKey, next)
      return { ...prev, [layerKey]: next }
    })
  }, [])

  // 6. Varredura Tática "Scan Territorial"
  const handleTriggerScan = useCallback(() => {
    if (isScanning || !engineRef.current) return
    setIsScanning(true)
    engineRef.current.triggerTerritorialScan(() => {
      setIsScanning(false)
    })
  }, [isScanning])

  // 7. Repor Visão Nacional
  const handleResetView = useCallback(() => {
    setSelectedDistrictId(null)
    engineRef.current?.clearSelection()
  }, [])

  // 8. Alternar Modo 3D Orbital
  const handleToggle3D = useCallback(() => {
    engineRef.current?.toggle3D()
  }, [])

  const handleZoomIn = useCallback(() => {
    engineRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    engineRef.current?.zoomOut()
  }, [])

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[100dvh] overflow-hidden bg-slate-950 select-none',
        className
      )}
    >
      {/* HUD Superior Oficial com Dados Reais */}
      <PortugalAgoraHUD
        onlineCount={data.onlineCount}
        activeDistrictsCount={data.activeDistrictsCount}
        confrontationsCount={data.confrontations.length}
        eventsCount={data.activeEvents.length}
        currentSector={currentSector}
        onSelectSector={handleSelectSector}
        onToggleLayers={() => setLayersOpen((prev) => !prev)}
        onToggle3D={handleToggle3D}
        onResetView={handleResetView}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
      />

      {/* Widget de Camadas */}
      {layersOpen && (
        <MapLayersWidget
          layers={layersState}
          onToggleLayer={handleToggleLayer}
          onClose={() => setLayersOpen(false)}
        />
      )}

      {/* Efeito Visual de Scan Territorial (Overlay transitório sutil) */}
      {isScanning && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-cyan-500/5 animate-pulse backdrop-contrast-125 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[matrix-scan-line_1.2s_ease-in-out_infinite] opacity-80" />
        </div>
      )}

      {/* Container Principal do Mapa MapLibre */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[100dvh] absolute inset-0 z-0 outline-none"
      />

      {/* Controlos Flutuantes de Zoom (Canto inferior direito) */}
      <div className="pointer-events-auto absolute bottom-5 right-4 z-30 hidden sm:flex flex-col gap-1.5 rounded-2xl bg-slate-950/80 p-1 border border-white/10 backdrop-blur-md shadow-2xl">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Aproximar mapa"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="h-px w-full bg-white/10" />
        <button
          type="button"
          onClick={handleZoomOut}
          title="Afastar mapa"
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Painel de Ação de Distrito Selecionado */}
      {selectedDistrict && (
        <DistrictActionPanel
          district={selectedDistrict}
          onClose={() => {
            setSelectedDistrictId(null)
            engineRef.current?.clearSelection()
          }}
        />
      )}

      {/* Ecrã de Carregamento Geográfico Leve e Premium */}
      {!isEngineReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none">
          <div className="relative flex h-16 w-16 items-center justify-center mb-4">
            <div className="absolute h-full w-full rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <span className="text-2xl">🇵🇹</span>
          </div>
          <h2 className="font-display text-sm font-black uppercase tracking-widest text-slate-200 mb-1">
            Portugal Vivo
          </h2>
          <p className="font-mono text-[11px] text-cyan-400 uppercase tracking-widest animate-pulse">
            A carregar território satélite...
          </p>
        </div>
      )}
    </div>
  )
}
export default PortugalVivoMap
