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
  AlertTriangle,
  RefreshCw,
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

// Estilo de satélite livre de contingência (ArcGIS World Imagery + OpenStreetMap)
// Usado automaticamente se o token Mapbox for inválido ou responder com erro 401
const FALLBACK_RASTER_STYLE: mapboxgl.Style = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri &mdash; World Imagery',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
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

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const [hasAuthError, setHasAuthError] = useState<boolean>(false)
  const [usingFallbackStyle, setUsingFallbackStyle] = useState<boolean>(false)
  const [activeDistrict, setActiveDistrict] = useState<string>(selectedDistrict || 'Lisboa')
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [showTacticalLayer, setShowTacticalLayer] = useState<boolean>(true)
  const [terrainExaggeration, setTerrainExaggeration] = useState<number>(1.5)
  const [activeRegion, setActiveRegion] = useState<'continente' | 'acores' | 'madeira'>('continente')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Metadados do distrito ativo
  const currentMetadata = useMemo(() => {
    return getTerritoryByName(activeDistrict) || TERRITORY_METADATA['Lisboa']
  }, [activeDistrict])

  const currentWarData = useMemo(() => {
    return territories.find((t) => t.name.toLowerCase() === activeDistrict.toLowerCase())
  }, [territories, activeDistrict])

  // Inicialização do Mapbox
  const initMap = useCallback((useFallback = false) => {
    if (!mapContainerRef.current) return

    // Limpar instância anterior se existir
    if (mapRef.current) {
      try {
        mapRef.current.remove()
      } catch (e) {
        console.warn('Map cleanup notice:', e)
      }
      mapRef.current = null
    }

    setIsLoading(true)

    const rawToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || ''
    const isTokenMissing = !rawToken || rawToken.length < 15

    if (isTokenMissing || useFallback) {
      setUsingFallbackStyle(true)
      mapboxgl.accessToken = ''
    } else {
      mapboxgl.accessToken = rawToken
      setUsingFallbackStyle(false)
    }

    const initialStyle = isTokenMissing || useFallback
      ? FALLBACK_RASTER_STYLE
      : 'mapbox://styles/mapbox/satellite-streets-v12'

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: initialStyle,
        center: [-8.2245, 39.3999],
        zoom: 6.8,
        pitch: 65,
        bearing: -12,
        antialias: true,
        maxPitch: 85,
      })

      mapRef.current = map

      // 1. Tratamento de Erros de Autenticação / 401
      map.on('error', (e) => {
        console.error('Erro de runtime do Mapbox:', e)
        const errorMsg = e.error?.message || ''
        const errorStatus = (e.error as any)?.status

        if (
          errorStatus === 401 ||
          errorMsg.includes('401') ||
          errorMsg.includes('Unauthorized') ||
          errorMsg.includes('Forbidden') ||
          errorMsg.includes('token')
        ) {
          setHasAuthError(true)
          setIsLoading(false)
          // Se falhou com estilo Mapbox proprietário, alterna graciosamente para o satélite aberto
          if (!usingFallbackStyle && !useFallback) {
            console.warn('Token 401 detectado: a carregar satélite aberto de contingência...')
            setTimeout(() => initMap(true), 100)
          }
        }
      })

      // 2. Configuração no Load
      map.on('load', () => {
        setMapLoaded(true)
        setIsLoading(false)
        setHasAuthError(false)

        // ELEVAÇÃO 3D REAL (DEM)
        if (!useFallback && !isTokenMissing) {
          try {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            })
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
          } catch (err) {
            console.warn('Mapbox DEM layer warning:', err)
          }

          // ATMOSFERA & HORIZONTE ESPACIAL (FOG)
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
        }

        // CAMADA GEOJSON DOS 20 DISTRITOS
        try {
          if (!map.getSource('portugal-districts')) {
            map.addSource('portugal-districts', {
              type: 'geojson',
              data: PORTUGAL_DISTRICTS_GEOJSON,
            })

            // Camada de preenchimento tático
            map.addLayer({
              id: 'districts-fill',
              type: 'fill',
              source: 'portugal-districts',
              layout: {
                visibility: 'visible',
              },
              paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.48,
                  0.22,
                ],
              },
            })

            // Camada de contorno néon
            map.addLayer({
              id: 'districts-line',
              type: 'line',
              source: 'portugal-districts',
              layout: {
                visibility: 'visible',
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

            // Eventos de Mouse
            map.on('mousemove', 'districts-fill', (e) => {
              if (e.features && e.features.length > 0) {
                map.getCanvas().style.cursor = 'pointer'
                const name = e.features[0].properties?.name
                if (name) setHoveredDistrict(name)
              }
            })

            map.on('mouseleave', 'districts-fill', () => {
              map.getCanvas().style.cursor = ''
              setHoveredDistrict(null)
            })

            map.on('click', 'districts-fill', (e) => {
              if (e.features && e.features.length > 0) {
                const name = e.features[0].properties?.name
                if (name) handleSelectDistrict(name)
              }
            })
          }
        } catch (err) {
          console.warn('GeoJSON layers setup warning:', err)
        }
      })

      // 3. Desbloqueio seguro no evento 'idle'
      map.on('idle', () => {
        setIsLoading(false)
      })
    } catch (err) {
      console.error('Erro ao instanciar mapa Mapbox:', err)
      setIsLoading(false)
      if (!useFallback) {
        initMap(true)
      }
    }
  }, [usingFallbackStyle])

  useEffect(() => {
    initMap(false)

    // Timeout de segurança para nunca manter o loader preso
    const safetyTimer = setTimeout(() => {
      setIsLoading(false)
    }, 2800)

    return () => {
      clearTimeout(safetyTimer)
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (e) {
          console.warn('Cleanup warning:', e)
        }
        mapRef.current = null
      }
    }
  }, [initMap])

  // Atualização do Relevo 3D
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || usingFallbackStyle) return
    try {
      mapRef.current.setTerrain({ source: 'mapbox-dem', exaggeration: terrainExaggeration })
    } catch (e) {
      console.warn('Terrain update error:', e)
    }
  }, [terrainExaggeration, mapLoaded, usingFallbackStyle])

  // Visibilidade das Fronteiras Táticas
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
      console.warn('Layer visibility error:', e)
    }
  }, [showTacticalLayer, mapLoaded])

  // Voo suave para distrito
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

  // Voo suave para regiões
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

  const handleResetCamera = useCallback(() => {
    handleSwitchRegion('continente')
  }, [handleSwitchRegion])

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
      {/* MAPBOX CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* GRADIENTE SUPERIOR / ATMOSFERA */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent z-10" />

      {/* ========================================================= */}
      {/* LOADER ELEGANTE (REMOVIDO AUTOMATICAMENTE NO LOAD/IDLE)    */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-none">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Globe className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400">
            A CALIBRAR SATÉLITE // PORTUGAL 3D
          </span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">
            A carregar relevo da Serra da Estrela e Gerês...
          </span>
        </div>
      )}

      {/* ========================================================= */}
      {/* AVISO ELEGANTE DE TOKEN (SE MODO DE CONTINGÊNCIA ATIVO)   */}
      {/* ========================================================= */}
      {hasAuthError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 max-w-md w-full px-4 animate-rise">
          <div className="rounded-2xl bg-amber-950/90 border border-amber-500/50 p-3.5 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 text-amber-200 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                Satélite Aberto Ativo (Chave Mapbox padrão em contingência).
              </span>
            </div>
            <button
              onClick={() => initMap(false)}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Recarregar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HUD SUPERIOR TÁTICO: RADAR 3D                         */}
      {/* ========================================================= */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        {/* Indicador de Estado */}
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
              {hoveredDistrict ? `Foco: ${hoveredDistrict}` : `Alvo: ${activeDistrict}`}
            </span>
          </div>
        </div>

        {/* Quick Region Selectors */}
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

        {/* Controlos de Câmara & Camada */}
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
          {!usingFallbackStyle && (
            <button
              onClick={() => {
                const next = terrainExaggeration === 1.0 ? 1.5 : terrainExaggeration === 1.5 ? 2.2 : 1.0
                setTerrainExaggeration(next)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-white/30 text-xs font-bold text-slate-300 backdrop-blur-md transition cursor-pointer"
              title="Ajustar Exagero de Elevação 3D"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>3D {terrainExaggeration}x</span>
            </button>
          )}

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

            {/* Brasão / Ícone */}
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

          {/* Botões de Ação */}
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
