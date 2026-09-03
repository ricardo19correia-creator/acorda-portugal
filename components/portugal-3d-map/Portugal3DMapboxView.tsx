'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  PORTUGAL_DISTRICTS_GEOJSON,
  TERRITORY_METADATA,
  getTerritoryByName,
  type TerritoryGeoMetadata,
} from '@/lib/portugal-geojson'
import type { DistrictWarTerritory } from '@/lib/district-war'
import {
  Globe,
  Compass,
  RotateCcw,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Shield,
  Swords,
  Trophy,
  Crown,
  Eye,
  Maximize2,
  Sliders,
  Play,
  ArrowRight,
  Flame,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Portugal3DMapboxViewProps {
  className?: string
  territories?: DistrictWarTerritory[]
  selectedDistrict?: string
  onSelectDistrict?: (districtName: string) => void
  onStartGame?: (route: string) => void
}

const DEFAULT_MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'pk.eyJ1IjoicmljYXJkbzE5Y29ycmVpYSIsImEiOiJjbTdtbTVydzcwMTdvMmtzZjB6a25jMnQxIn0.a3KxT863U1m6w9x6x9'

const CAMERA_PRESETS = {
  continente: {
    center: [-8.2245, 39.3999] as [number, number],
    zoom: 6.8,
    pitch: 65,
    bearing: -12,
  },
  acores: {
    center: [-28.0289, 38.5714] as [number, number],
    zoom: 7.2,
    pitch: 60,
    bearing: 0,
  },
  madeira: {
    center: [-16.9595, 32.7607] as [number, number],
    zoom: 9.3,
    pitch: 65,
    bearing: 15,
  },
}

export function Portugal3DMapboxView({
  className,
  territories = [],
  selectedDistrict = 'Lisboa',
  onSelectDistrict,
  onStartGame,
}: Portugal3DMapboxViewProps) {
  const router = useRouter()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeDistrict, setActiveDistrict] = useState<string>(selectedDistrict || 'Lisboa')
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [showTacticalLayer, setShowTacticalLayer] = useState<boolean>(true)
  const [terrainExaggeration, setTerrainExaggeration] = useState<number>(1.6)
  const [activeRegion, setActiveRegion] = useState<'continente' | 'acores' | 'madeira'>('continente')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tokenWarning, setTokenWarning] = useState(false)

  // Território ativo e dados competitivos
  const currentMetadata = useMemo(() => {
    return getTerritoryByName(activeDistrict) || TERRITORY_METADATA['Lisboa']
  }, [activeDistrict])

  const currentWarData = useMemo(() => {
    return territories.find((t) => t.name.toLowerCase() === activeDistrict.toLowerCase())
  }, [territories, activeDistrict])

  // Inicialização do Mapbox GL JS 3D
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = DEFAULT_MAPBOX_TOKEN

    // Instancia o mapa
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-8.2245, 39.3999],
      zoom: 5.5,
      pitch: 45,
      bearing: 0,
      antialias: true,
      maxPitch: 85,
    })

    mapRef.current = map

    map.on('load', () => {
      setMapLoaded(true)

      // 1. ELEVAÇÃO 3D REAL (DEM)
      try {
        map.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14,
        })
        map.setTerrain({ source: 'mapbox-dem', exaggeration: terrainExaggeration })
      } catch (err) {
        console.warn('Mapbox DEM layer warning:', err)
      }

      // 2. ATMOSFERA & HORIZONTE ESPACIAL (FOG)
      try {
        map.setFog({
          range: [0.5, 10],
          color: 'rgb(11, 15, 25)',
          'high-color': 'rgb(36, 92, 223)',
          'horizon-blend': 0.02,
          'space-color': 'rgb(11, 15, 25)',
          'star-intensity': 0.6,
        })
      } catch (err) {
        console.warn('Mapbox Fog setup warning:', err)
      }

      // 3. CAMADA GEOJSON DOS DISTRITOS
      try {
        map.addSource('portugal-districts', {
          type: 'geojson',
          data: PORTUGAL_DISTRICTS_GEOJSON,
        })

        // Polígonos translúcidos com cores táticas
        map.addLayer({
          id: 'districts-fill',
          type: 'fill',
          source: 'portugal-districts',
          layout: {
            visibility: showTacticalLayer ? 'visible' : 'none',
          },
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.45,
              0.22,
            ],
          },
        })

        // Fronteiras neon táticas
        map.addLayer({
          id: 'districts-line',
          type: 'line',
          source: 'portugal-districts',
          layout: {
            visibility: showTacticalLayer ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#10b981',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              3.5,
              1.8,
            ],
            'line-opacity': 0.9,
          },
        })

        // Cursor & Eventos de Interação
        let hoveredId: string | number | null = null

        map.on('mousemove', 'districts-fill', (e) => {
          if (e.features && e.features.length > 0) {
            map.getCanvas().style.cursor = 'pointer'
            const feature = e.features[0]
            const name = feature.properties?.name
            if (name) {
              setHoveredDistrict(name)
            }
          }
        })

        map.on('mouseleave', 'districts-fill', () => {
          map.getCanvas().style.cursor = ''
          setHoveredDistrict(null)
        })

        map.on('click', 'districts-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0]
            const name = feature.properties?.name
            if (name) {
              handleSelectDistrict(name)
            }
          }
        })
      } catch (err) {
        console.warn('Mapbox GeoJSON layers warning:', err)
      }

      // 4. FLY-IN CINEMATOGRÁFICO DE ENTRADA
      map.flyTo({
        center: [-8.2245, 39.3999],
        zoom: 6.8,
        pitch: 65,
        bearing: -12,
        duration: 2500,
        essential: true,
      })
    })

    map.on('error', (e) => {
      console.warn('Mapbox GL runtime event:', e)
      if (e.error?.message?.includes('token') || e.error?.message?.includes('Unauthorized')) {
        setTokenWarning(true)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Sincronização do relevo quando a escala de elevação muda
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    try {
      mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: terrainExaggeration })
    } catch (e) {
      console.warn('Terrain update warning:', e)
    }
  }, [terrainExaggeration, mapLoaded])

  // Alternância da camada tática
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    try {
      const visibility = showTacticalLayer ? 'visible' : 'none'
      if (mapRef.current.getLayer('districts-fill')) {
        mapRef.current.setLayoutProperty('districts-fill', 'visibility', visibility)
      }
      if (mapRef.current.getLayer('districts-line')) {
        mapRef.current.setLayoutProperty('districts-line', 'visibility', visibility)
      }
    } catch (e) {
      console.warn('Layer visibility warning:', e)
    }
  }, [showTacticalLayer, mapLoaded])

  // Voo suave para um distrito selecionado
  const handleSelectDistrict = useCallback(
    (name: string) => {
      setActiveDistrict(name)
      if (onSelectDistrict) onSelectDistrict(name)

      const meta = getTerritoryByName(name)
      if (meta && mapRef.current) {
        mapRef.current.flyTo({
          center: meta.center,
          zoom: meta.zoom,
          pitch: meta.pitch,
          bearing: meta.bearing,
          duration: 1800,
          essential: true,
        })
      }
    },
    [onSelectDistrict]
  )

  // Voo para regiões globais
  const handleSwitchRegion = useCallback((regionKey: 'continente' | 'acores' | 'madeira') => {
    setActiveRegion(regionKey)
    const preset = CAMERA_PRESETS[regionKey]
    if (mapRef.current && preset) {
      mapRef.current.flyTo({
        center: preset.center,
        zoom: preset.zoom,
        pitch: preset.pitch,
        bearing: preset.bearing,
        duration: 2000,
        essential: true,
      })
    }
  }, [])

  // Reset de câmara
  const handleResetCamera = useCallback(() => {
    handleSwitchRegion('continente')
  }, [handleSwitchRegion])

  // Ações de jogo
  const handleDefendTerritory = () => {
    const route = `/jogar?distrito=${encodeURIComponent(activeDistrict)}`
    if (onStartGame) {
      onStartGame(route)
    } else {
      router.push(route)
    }
  }

  const handleViewRanking = () => {
    router.push(`/rankings?mode=distritos&district=${encodeURIComponent(activeDistrict)}`)
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px] sm:h-[720px]',
        className
      )}
    >
      {/* MAPBOX CANVAS CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* GRADIENTE SUPERIOR / ATMOSFERA TÁTICA */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-10" />

      {/* ========================================================= */}
      {/* 1. HUD SUPERIOR TÁTICO: RADAR 3D 2150                    */}
      {/* ========================================================= */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        {/* Indicador de Estado Tático */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 px-3.5 py-2 backdrop-blur-md shadow-lg shadow-emerald-950/40">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400">
              PORTUGAL 3D REAL-TIME // RADAR ATIVO
            </span>
            <span className="text-[11px] font-bold text-slate-300">
              {hoveredDistrict ? `Foco: ${hoveredDistrict}` : `Alvo Selecionado: ${activeDistrict}`}
            </span>
          </div>
        </div>

        {/* Quick Region Selectors (Continente / Açores / Madeira) */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-950/80 border border-white/15 p-1 backdrop-blur-md shadow-lg">
          <button
            onClick={() => handleSwitchRegion('continente')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
              activeRegion === 'continente'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            🇵🇹 Continente
          </button>
          <button
            onClick={() => handleSwitchRegion('acores')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
              activeRegion === 'acores'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            🌊 Açores
          </button>
          <button
            onClick={() => handleSwitchRegion('madeira')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
              activeRegion === 'madeira'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            🌺 Madeira
          </button>
        </div>

        {/* Controlos de Câmara e Camada */}
        <div className="flex items-center gap-2">
          {/* Toggle Fronteiras Táticas */}
          <button
            onClick={() => setShowTacticalLayer(!showTacticalLayer)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition backdrop-blur-md cursor-pointer',
              showTacticalLayer
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            )}
            title="Alternar Fronteiras Táticas"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {showTacticalLayer ? 'Tático Ativo' : 'Satélite Puro'}
            </span>
          </button>

          {/* Toggle Relevo 3D (DEM) */}
          <button
            onClick={() => {
              const next = terrainExaggeration === 1.0 ? 1.6 : terrainExaggeration === 1.6 ? 2.2 : 1.0
              setTerrainExaggeration(next)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-white/30 text-xs font-bold text-slate-300 backdrop-blur-md transition cursor-pointer"
            title="Ajustar Exagero de Elevação 3D"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>3D {terrainExaggeration}x</span>
          </button>

          {/* Reset Câmara */}
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white backdrop-blur-md transition cursor-pointer"
            title="Repor Câmara Inicial"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white backdrop-blur-md transition cursor-pointer"
            title="Ecrã Inteiro"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CARD POPUP FLUTUANTE DO DISTRITO SELECIONADO           */}
      {/* ========================================================= */}
      <div className="relative z-20 mt-auto p-4 sm:p-6 pointer-events-auto">
        <div className="max-w-xl w-full mx-auto rounded-3xl bg-slate-950/90 border border-emerald-500/40 p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-black/80 space-y-4 animate-rise">
          {/* Cabeçalho do Território */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentMetadata.region}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentMetadata.center[1].toFixed(2)}°N, {Math.abs(currentMetadata.center[0]).toFixed(2)}°W
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{currentMetadata.name}</span>
                <span className="text-sm font-normal text-slate-400">({currentMetadata.capital})</span>
              </h3>
              <p className="text-xs text-slate-300 italic font-serif">
                “{currentMetadata.motto}”
              </p>
            </div>

            {/* Brasão / Ícone de Poder */}
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-900/40 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner">
              🏛️
            </div>
          </div>

          {/* Estatísticas de Fação / Guerra dos Distritos */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Poder Total
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                {currentWarData?.totalScore ? `${Math.round(currentWarData.totalScore / 1000)}k XP` : '128.5k XP'}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Soberano
              </span>
              <span className="text-sm sm:text-base font-black text-amber-300 truncate block">
                {currentWarData?.sovereignPlayer?.displayName || 'D. Afonso'}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-2.5 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Posição Nacional
              </span>
              <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">
                {currentWarData?.rank ? `#${currentWarData.rank}` : '#1'}
              </span>
            </div>
          </div>

          {/* Botões de Ação Tática */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={handleDefendTerritory}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
            >
              <Swords className="w-4 h-4" />
              <span>Defender {currentMetadata.name}</span>
            </button>

            <button
              onClick={handleViewRanking}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-white/30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer hover:bg-slate-800"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ver Ranking Local</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
