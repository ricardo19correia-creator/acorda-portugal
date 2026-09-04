'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { MapHUDHeader } from './MapHUDHeader'
import { MapControlsCluster } from './MapControlsCluster'
import { MapSearchBar } from './MapSearchBar'
import { DistrictDetailsPanel } from './DistrictDetailsPanel'
import { ArenaDetailsModal } from './ArenaDetailsModal'
import { PortugalVectorFallback } from './PortugalVectorFallback'
import {
  PORTUGAL_DISTRICTS_GEOJSON,
  REGION_CAMERA_PRESETS,
  getTerritoryByName,
} from '@/lib/portugal-geojson'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type {
  MapDisplayMode,
  MapRegion,
  MapEngineState,
  MapArenaPOI,
  MapSearchResult,
} from './types'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// Fallback Satellite Style (Esri High-Res World Imagery)
const FALLBACK_SATELLITE_STYLE: mapboxgl.Style = {
  version: 8,
  sources: {
    'esri-satellite-source': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite-source',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

// Tactical Vector Fallback Style (Carto Dark)
const TACTICAL_DARK_STYLE: mapboxgl.Style = {
  version: 8,
  sources: {
    'carto-dark-source': {
      type: 'raster',
      tiles: [
        'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark-source',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export function PortugalMapComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  // 1. Lifecycle flag: exclusively render and boot Mapbox on the client
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Read URL parameters if present
  const queryDistrict = searchParams?.get('district') || searchParams?.get('distrito')
  const queryRegion = searchParams?.get('region') || searchParams?.get('regiao')

  const initialDistrict = useMemo(() => {
    if (queryDistrict) return queryDistrict
    if (profile?.district) return profile.district
    return 'Lisboa'
  }, [queryDistrict, profile?.district])

  const initialRegion = useMemo<MapRegion>(() => {
    if (queryRegion === 'acores' || queryRegion === 'açores') return 'acores'
    if (queryRegion === 'madeira') return 'madeira'
    return 'continente'
  }, [queryRegion])

  // UI and Map States
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
  const [isMapReady, setIsMapReady] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)

  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)

  const [engineState, setEngineState] = useState<MapEngineState>({
    isReady: false,
    is3DSupported: true,
    isUsingFallbackImagery: false,
    isTerrainActive: true,
    activeMode: 'satellite',
    activeRegion: 'continente',
  })

  // Essential Refs for Mapbox Canvas Stability
  const rootRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const isInitializingRef = useRef<boolean>(false)

  // Real-time Rankings Subscription for National War Map
  useEffect(() => {
    if (!mounted) return
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        const allList = [...data]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userWins = profile.wins ?? 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasCurrentUser = allList.some((p) => p.uid === user.uid)

          if (!hasCurrentUser) {
            allList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || DEFAULT_AVATAR.image,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              title: userTitle,
              equippedTitle: userTitle,
              equippedFrame: (profile as any)?.equippedFrame,
              wins1v1: userWins,
              losses1v1: 0,
              gamesPlayed: userWins,
              accuracyRate: 85,
              rating: 1000 + userWins * 25,
              division: 'Bronze',
              streak: 0,
              weeklyMovement: 0,
            })
          }
        }
        setNationalPlayers(allList)
      },
      300
    )
    return () => unsub()
  }, [mounted, user?.uid, user?.displayName, user?.photoURL, profile])

  // Server-Authoritative District War calculation using real player data
  const districtWarTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  const activeTerritory = useMemo(() => {
    return (
      districtWarTerritories.find(
        (t) => t.name.toLowerCase() === selectedDistrict.toLowerCase()
      ) || null
    )
  }, [districtWarTerritories, selectedDistrict])

  // Handle District Selection with Smooth Camera Fly-To
  const handleSelectDistrict = useCallback(
    (name: string) => {
      setSelectedDistrict(name)
      setIsDistrictPanelOpen(true)

      const meta = getTerritoryByName(name)
      if (meta && mapRef.current) {
        mapRef.current.flyTo({
          center: meta.center,
          zoom: meta.zoom,
          pitch: is3DPitch ? meta.pitch : 0,
          bearing: meta.bearing,
          duration: 1800,
          essential: true,
        })
      }
    },
    [is3DPitch]
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
        if (mapRef.current) {
          mapRef.current.flyTo({
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

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSelectPlayer = (p: any) => {
    if (!p) return
    setSelectedPlayer({
      id: p.uid || p.id,
      username: p.displayName || p.name || 'Jogador',
      avatarUrl: p.photoURL || undefined,
      equippedFrame: p.equippedFrame,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos || 1,
      virtualMoney: (p.xp || 0) * 2,
      isVip: Boolean(p.isFounder),
      title: p.title || 'Guardião Distrital',
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsTotal: p.gamesPlayed || 10,
        accuracyRate: p.accuracyRate || 85,
      },
      badges: [{ icon: '🇵🇹', name: p.district || 'Portugal' }],
    })
  }

  // Camera Controls Handlers
  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 })
  }

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 })
  }

  const handleResetPortugal = () => {
    setActiveRegion('continente')
    const preset = REGION_CAMERA_PRESETS.continente
    mapRef.current?.flyTo({
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

  // =========================================================================
  // 2. MAPBOX INITIALIZATION & STRICT LIFECYCLE (NO PREMATURE DESTRUCTION)
  // =========================================================================
  useEffect(() => {
    if (!mounted || !containerRef.current) return
    // Strict Mode duplicate prevention: do not recreate if map already exists
    if (mapRef.current || isInitializingRef.current) return
    isInitializingRef.current = true

    // 2.1 WebGL Compatibility Verification
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (!gl) {
        setIsWebGLSupported(false)
        setEngineState((prev) => ({
          ...prev,
          isReady: true,
          is3DSupported: false,
        }))
        isInitializingRef.current = false
        return
      }
    } catch {
      setIsWebGLSupported(false)
      isInitializingRef.current = false
      return
    }

    // 2.2 Token Resolution
    const rawToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || ''
    const hasValidToken = rawToken.length > 20

    if (hasValidToken) {
      mapboxgl.accessToken = rawToken
      setUsingFallback(false)
    } else {
      mapboxgl.accessToken = ''
      setUsingFallback(true)
    }

    const isMobile = window.innerWidth < 640
    const preset = REGION_CAMERA_PRESETS[activeRegion] || REGION_CAMERA_PRESETS.continente
    const initialCenter = preset.center
    const initialZoom = isMobile ? 5.3 : 6.3
    const initialPitch = is3DPitch ? 38 : 0

    let initialStyle: mapboxgl.Style | string
    if (!hasValidToken) {
      initialStyle = activeMode === 'tactical' ? TACTICAL_DARK_STYLE : FALLBACK_SATELLITE_STYLE
    } else {
      if (activeMode === 'satellite' || activeMode === 'terrain') {
        initialStyle = 'mapbox://styles/mapbox/satellite-streets-v12'
      } else if (activeMode === 'night' || activeMode === 'tactical') {
        initialStyle = 'mapbox://styles/mapbox/dark-v11'
      } else {
        initialStyle = 'mapbox://styles/mapbox/satellite-streets-v12'
      }
    }

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: initialStyle,
        center: initialCenter,
        zoom: initialZoom,
        pitch: initialPitch,
        bearing: preset.bearing,
        antialias: true,
        maxPitch: 80,
      })

      mapRef.current = map

      // Handle map errors gracefully
      map.on('error', (e) => {
        const msg = e.error?.message || ''
        if (msg.includes('401') || msg.includes('token') || msg.includes('Unauthorized')) {
          console.warn('[PortugalMapbox] Token error, switching to open high-res fallback imagery.')
          setUsingFallback(true)
          setEngineState((prev) => ({
            ...prev,
            isReady: true,
            is3DSupported: true,
            isUsingFallbackImagery: true,
            isTerrainActive: true,
            activeMode,
            activeRegion,
          }))
        }
      })

      // Listener map.on('load', () => map.resize())
      map.on('load', () => {
        map.resize()
        setIsMapReady(true)

        // 1. ADD REAL 3D TERRAIN ELEVATION (DEM)
        try {
          if (hasValidToken) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            })
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
          } else {
            // Open AWS Terrarium DEM elevation tiles (no token required)
            map.addSource('terrarium-dem', {
              type: 'raster-dem',
              tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
              encoding: 'terrarium',
              tileSize: 256,
              maxzoom: 15,
            })
            map.setTerrain({ source: 'terrarium-dem', exaggeration: 1.5 })
          }
        } catch (err) {
          console.warn('[PortugalMapbox] DEM Terrain layer initialization notice:', err)
        }

        // 2. ATMOSPHERIC HORIZON FOG
        try {
          map.setFog({
            range: [0.8, 12],
            color: 'rgb(8, 14, 26)',
            'high-color': 'rgb(24, 68, 168)',
            'horizon-blend': 0.03,
            'space-color': 'rgb(2, 6, 14)',
            'star-intensity': activeMode === 'night' ? 0.8 : 0.4,
          })
        } catch (err) {
          console.warn('[PortugalMapbox] Atmospheric fog setup notice:', err)
        }

        // 3. GEOJSON DISTRICT BOUNDARIES
        try {
          if (!map.getSource('portugal-districts')) {
            map.addSource('portugal-districts', {
              type: 'geojson',
              data: PORTUGAL_DISTRICTS_GEOJSON,
            })

            // District Fill Layer
            map.addLayer({
              id: 'districts-fill',
              type: 'fill',
              source: 'portugal-districts',
              paint: {
                'fill-color': 'rgba(6, 182, 212, 0.08)',
                'fill-opacity': 0.6,
              },
            })

            // District Borders Line
            map.addLayer({
              id: 'districts-line',
              type: 'line',
              source: 'portugal-districts',
              paint: {
                'line-color': 'rgba(6, 182, 212, 0.6)',
                'line-width': 1.5,
              },
            })

            // District Hover Highlight
            map.addLayer({
              id: 'districts-hover-line',
              type: 'line',
              source: 'portugal-districts',
              paint: {
                'line-color': '#10b981',
                'line-width': 3,
              },
              filter: ['==', 'name', ''],
            })
          }
        } catch (err) {
          console.warn('[PortugalMapbox] GeoJSON layer setup notice:', err)
        }

        // Interactive District Clicking
        map.on('click', 'districts-fill', (e) => {
          if (e.features && e.features[0]) {
            const name = e.features[0].properties?.name
            if (name) {
              handleSelectDistrict(name)
            }
          }
        })

        // Hover Effect
        map.on('mousemove', 'districts-fill', (e) => {
          if (e.features && e.features[0]) {
            map.getCanvas().style.cursor = 'pointer'
            const name = e.features[0].properties?.name
            if (name && map.getLayer('districts-hover-line')) {
              map.setFilter('districts-hover-line', ['==', 'name', name])
            }
          }
        })

        map.on('mouseleave', 'districts-fill', () => {
          map.getCanvas().style.cursor = ''
          if (map.getLayer('districts-hover-line')) {
            map.setFilter('districts-hover-line', ['==', 'name', ''])
          }
        })

        setEngineState({
          isReady: true,
          is3DSupported: true,
          isUsingFallbackImagery: !hasValidToken,
          isTerrainActive: true,
          activeMode,
          activeRegion,
        })
      })

      // Redimensionamento WebGL com setTimeout 500ms garantindo que não colapsa a 0px
      const resizeTimeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize()
        }
      }, 500)

      const handleWindowResize = () => {
        mapRef.current?.resize()
      }
      window.addEventListener('resize', handleWindowResize)

      isInitializingRef.current = false

      return () => {
        clearTimeout(resizeTimeout)
        window.removeEventListener('resize', handleWindowResize)
        // Cleanup seguro apenas na desmontagem genuína do componente
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []

        if (mapRef.current) {
          try {
            mapRef.current.remove()
          } catch (e) {
            console.warn('[PortugalMapbox] Unmount cleanup notice:', e)
          }
          mapRef.current = null
        }
      }
    } catch (err) {
      console.warn('[PortugalMapbox] Critical init error, switching to vector fallback:', err)
      setIsWebGLSupported(false)
      setEngineState({
        isReady: true,
        is3DSupported: false,
        isUsingFallbackImagery: false,
        isTerrainActive: false,
        activeMode,
        activeRegion,
        errorMessage: 'WebGL indisponível neste navegador.',
      })
      isInitializingRef.current = false
    }
  }, [mounted])

  // =========================================================================
  // 3. REACTIVE CAMERA, MODE & MARKER SYNC (SEM REINICIAR MAPBOX)
  // =========================================================================

  // Handle Mode Switching without recreating Mapbox instance
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    const rawToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || ''
    const hasValidToken = rawToken.length > 20

    let targetStyle: mapboxgl.Style | string
    if (!hasValidToken) {
      targetStyle = activeMode === 'tactical' ? TACTICAL_DARK_STYLE : FALLBACK_SATELLITE_STYLE
    } else {
      if (activeMode === 'satellite' || activeMode === 'terrain') {
        targetStyle = 'mapbox://styles/mapbox/satellite-streets-v12'
      } else if (activeMode === 'night' || activeMode === 'tactical') {
        targetStyle = 'mapbox://styles/mapbox/dark-v11'
      } else {
        targetStyle = 'mapbox://styles/mapbox/satellite-streets-v12'
      }
    }

    map.setStyle(targetStyle)
    map.once('style.load', () => {
      map.resize()
      // Re-apply terrain if supported
      try {
        if (hasValidToken && (activeMode === 'satellite' || activeMode === 'terrain')) {
          if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            })
          }
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })
        } else if (!hasValidToken && (activeMode === 'satellite' || activeMode === 'terrain')) {
          if (!map.getSource('terrarium-dem')) {
            map.addSource('terrarium-dem', {
              type: 'raster-dem',
              tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
              encoding: 'terrarium',
              tileSize: 256,
              maxzoom: 15,
            })
          }
          map.setTerrain({ source: 'terrarium-dem', exaggeration: 1.5 })
        }
      } catch (e) {
        console.warn('[PortugalMapbox] Terrain reapply notice:', e)
      }

      setEngineState((prev) => ({
        ...prev,
        activeMode,
      }))
    })
  }, [activeMode, isMapReady])

  // Handle 3D Pitch Toggle
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    map.easeTo({
      pitch: is3DPitch ? 45 : 0,
      duration: 800,
      essential: true,
    })
  }, [is3DPitch, isMapReady])

  // Handle Region Switching
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    const preset = REGION_CAMERA_PRESETS[activeRegion]
    if (preset) {
      map.flyTo({
        center: preset.center,
        zoom: preset.zoom,
        pitch: is3DPitch ? preset.pitch : 0,
        bearing: preset.bearing,
        duration: 1800,
        essential: true,
      })
    }
    setEngineState((prev) => ({ ...prev, activeRegion }))
  }, [activeRegion, is3DPitch, isMapReady])

  // Sync Arena Markers on Map
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!showArenas) return

    // Render interactive DOM markers for official arenas
    for (const arena of OFFICIAL_MAP_ARENAS) {
      const el = document.createElement('div')
      el.className = 'group cursor-pointer'

      const badgeColor =
        arena.rarity === 'VIP'
          ? 'bg-amber-500 text-slate-950 ring-amber-400'
          : arena.rarity === 'Lendária'
          ? 'bg-purple-600 text-white ring-purple-400'
          : arena.rarity === 'Épica'
          ? 'bg-indigo-600 text-white ring-indigo-400'
          : 'bg-emerald-600 text-white ring-emerald-400'

      el.innerHTML = `
        <div class="relative flex flex-col items-center select-none transform transition-transform duration-200 group-hover:scale-125 group-hover:z-50">
          <div class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg ring-1 ${badgeColor} backdrop-blur-sm whitespace-nowrap mb-1">
            ${arena.name}
          </div>
          <div class="w-7 h-7 rounded-full bg-slate-900/90 border-2 border-white/80 shadow-2xl flex items-center justify-center text-sm">
            ${arena.icon}
          </div>
          <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-0.5 animate-ping"></div>
        </div>
      `

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleSelectArena(arena)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(arena.coordinates)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [showArenas, isMapReady, handleSelectArena])

  // If not mounted yet on the client, render stable loading shell
  if (!mounted) {
    return (
      <div
        className="relative w-full h-[100dvh] min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
        suppressHydrationWarning
      >
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span
          className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400"
          suppressHydrationWarning
        >
          A CARREGAR MAPA NACIONAL // PORTUGAL 2150
        </span>
        <span
          className="text-[10px] font-mono text-emerald-400/90 mt-2 uppercase tracking-widest"
          suppressHydrationWarning
        >
          BUILD-ID: MAP2150-REAL-001
        </span>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative w-full h-[100dvh] min-h-screen bg-slate-950 overflow-hidden flex flex-col select-none',
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
        onStartGame={handleStartGame}
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
          <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-950">
            {/* Explicit container with absolute inset-0 w-full h-full min-h-screen overflow-hidden as mandated */}
            <div
              ref={containerRef}
              className="absolute inset-0 w-full h-full min-h-screen overflow-hidden"
            />
          </div>
        ) : (
          <PortugalVectorFallback
            territories={districtWarTerritories}
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
        onSelectPlayer={handleSelectPlayer}
        onStartGame={handleStartGame}
      />

      {/* 6. ARENA DETAILS MODAL (Interactive POI Card) */}
      <ArenaDetailsModal
        arena={selectedArena}
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
        onStartGame={handleStartGame}
      />

      {/* 7. PLAYER PROFILE MODAL */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Production Verification Proof Marker */}
      <div
        suppressHydrationWarning
        className="absolute bottom-2 left-2 z-20 pointer-events-none opacity-80 font-mono text-[9px] text-emerald-400/80 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-sm"
      >
        PORTUGAL MAP 2150 BUILD PROOF // BUILD-ID: MAP2150-REAL-001
      </div>
    </div>
  )
}

export default PortugalMapComponent
