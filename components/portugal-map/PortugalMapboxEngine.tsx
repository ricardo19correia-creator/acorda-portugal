'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type {
  MapDisplayMode,
  MapRegion,
  MapEngineState,
  MapArenaPOI,
} from './types'
import {
  PORTUGAL_DISTRICTS_GEOJSON,
  REGION_CAMERA_PRESETS,
  getTerritoryByName,
} from '@/lib/portugal-geojson'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { DistrictWarTerritory } from '@/lib/district-war'

interface PortugalMapboxEngineProps {
  activeMode: MapDisplayMode
  activeRegion: MapRegion
  selectedDistrict: string
  territories: DistrictWarTerritory[]
  showArenas: boolean
  is3DPitch: boolean
  onSelectDistrict: (districtName: string) => void
  onSelectArena: (arena: MapArenaPOI) => void
  onEngineStateChange: (state: MapEngineState) => void
  mapInstanceRef?: React.MutableRefObject<mapboxgl.Map | null>
}

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

export function PortugalMapboxEngine({
  activeMode,
  activeRegion,
  selectedDistrict,
  territories,
  showArenas,
  is3DPitch,
  onSelectDistrict,
  onSelectArena,
  onEngineStateChange,
  mapInstanceRef,
}: PortugalMapboxEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  const [isMapReady, setIsMapReady] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)

  // Determine appropriate initial camera based on screen width
  const getInitialCamera = useCallback(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const preset = REGION_CAMERA_PRESETS.continente
    return {
      center: preset.center,
      zoom: isMobile ? 5.3 : 6.3,
      pitch: is3DPitch ? 38 : 0,
      bearing: preset.bearing,
    }
  }, [is3DPitch])

  // Initialize Mapbox instance
  const initMap = useCallback(() => {
    if (!containerRef.current) return

    // Prevent duplicate initialization in React Strict Mode
    if (mapRef.current) return

    const rawToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() || ''
    const hasValidToken = rawToken.length > 20

    if (hasValidToken) {
      mapboxgl.accessToken = rawToken
      setUsingFallback(false)
    } else {
      mapboxgl.accessToken = ''
      setUsingFallback(true)
    }

    const initialCamera = getInitialCamera()

    // Determine style based on token availability and active mode
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
        center: initialCamera.center,
        zoom: initialCamera.zoom,
        pitch: initialCamera.pitch,
        bearing: initialCamera.bearing,
        antialias: true,
        maxPitch: 80,
      })

      mapRef.current = map
      if (mapInstanceRef) mapInstanceRef.current = map

      // Handle map errors gracefully
      map.on('error', (e) => {
        const msg = e.error?.message || ''
        if (msg.includes('401') || msg.includes('token') || msg.includes('Unauthorized')) {
          console.warn('Mapbox token error: transitioning to reliable open imagery fallback.')
          setUsingFallback(true)
          onEngineStateChange({
            isReady: true,
            is3DSupported: true,
            isUsingFallbackImagery: true,
            isTerrainActive: true,
            activeMode,
            activeRegion,
          })
        }
      })

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
          console.warn('DEM Terrain layer initialization notice:', err)
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
          console.warn('Atmospheric fog setup notice:', err)
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
                'fill-color': ['get', 'color'],
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.45,
                  0.18,
                ],
              },
            })

            // District Neon Outline Layer
            map.addLayer({
              id: 'districts-line',
              type: 'line',
              source: 'portugal-districts',
              paint: {
                'line-color': '#06b6d4',
                'line-width': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  3.2,
                  1.6,
                ],
                'line-opacity': 0.85,
              },
            })

            // Mouse interactions
            map.on('mousemove', 'districts-fill', (e) => {
              if (e.features && e.features.length > 0) {
                map.getCanvas().style.cursor = 'pointer'
              }
            })

            map.on('mouseleave', 'districts-fill', () => {
              map.getCanvas().style.cursor = ''
            })

            map.on('click', 'districts-fill', (e) => {
              if (e.features && e.features.length > 0) {
                const name = e.features[0].properties?.name
                if (name) {
                  onSelectDistrict(name)
                }
              }
            })
          }
        } catch (err) {
          console.warn('District GeoJSON setup notice:', err)
        }

        onEngineStateChange({
          isReady: true,
          is3DSupported: true,
          isUsingFallbackImagery: !hasValidToken,
          isTerrainActive: true,
          activeMode,
          activeRegion,
        })
      })
    } catch (err) {
      console.error('Fatal WebGL initialization error:', err)
      onEngineStateChange({
        isReady: true,
        is3DSupported: false,
        isUsingFallbackImagery: true,
        isTerrainActive: false,
        activeMode,
        activeRegion,
        errorMessage: 'WebGL indisponível neste navegador.',
      })
    }
  }, [getInitialCamera, activeMode, activeRegion, onSelectDistrict, onEngineStateChange, mapInstanceRef])

  useEffect(() => {
    initMap()

    const resizeTimer = setTimeout(() => {
      mapRef.current?.resize()
    }, 500)

    const handleWindowResize = () => {
      mapRef.current?.resize()
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleWindowResize)
      // Clear markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (e) {
          console.warn('Map unmount cleanup notice:', e)
        }
        mapRef.current = null
      }
    }
  }, [])

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
      el.setAttribute('aria-label', `Arena ${arena.name}`)

      const rarityBg =
        arena.rarity === 'VIP' || arena.rarity === 'Exclusiva'
          ? 'bg-amber-400 text-slate-950 border-amber-300'
          : arena.rarity === 'Lendária'
          ? 'bg-amber-500 text-slate-950 border-amber-300'
          : arena.rarity === 'Épica'
          ? 'bg-purple-500 text-white border-purple-300'
          : arena.rarity === 'Rara'
          ? 'bg-blue-500 text-white border-blue-300'
          : 'bg-slate-700 text-white border-slate-400'

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-400 opacity-40"></span>
          <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-2xl border ${rarityBg} font-mono text-[10px] font-black uppercase tracking-wider transition-transform transform group-hover:scale-115">
            <span>⚔️</span>
            <span class="max-w-[90px] truncate hidden md:inline">${arena.name}</span>
          </div>
        </div>
      `

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectArena(arena)
        map.flyTo({
          center: arena.coordinates,
          zoom: 12.5,
          pitch: 55,
          duration: 1800,
          essential: true,
        })
      })

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(arena.coordinates)
        .addTo(map)

      markersRef.current.push(marker)
    }
  }, [isMapReady, showArenas, onSelectArena])

  // Handle Mode Changes (satellite, terrain, tactical, night)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    try {
      if (activeMode === 'satellite') {
        if (map.getLayer('esri-satellite-layer')) {
          map.setLayoutProperty('esri-satellite-layer', 'visibility', 'visible')
        }
        if (map.getLayer('carto-dark-layer')) {
          map.setLayoutProperty('carto-dark-layer', 'visibility', 'none')
        }
        if (map.getLayer('districts-line')) {
          map.setPaintProperty('districts-line', 'line-color', '#10b981')
          map.setPaintProperty('districts-line', 'line-opacity', 0.8)
        }
      } else if (activeMode === 'terrain') {
        if (map.getLayer('districts-line')) {
          map.setPaintProperty('districts-line', 'line-color', '#f59e0b')
          map.setPaintProperty('districts-line', 'line-opacity', 0.9)
        }
      } else if (activeMode === 'tactical') {
        if (map.getLayer('esri-satellite-layer')) {
          map.setLayoutProperty('esri-satellite-layer', 'visibility', 'none')
        }
        if (map.getLayer('carto-dark-layer')) {
          map.setLayoutProperty('carto-dark-layer', 'visibility', 'visible')
        }
        if (map.getLayer('districts-line')) {
          map.setPaintProperty('districts-line', 'line-color', '#06b6d4')
          map.setPaintProperty('districts-line', 'line-opacity', 0.95)
        }
      } else if (activeMode === 'night') {
        if (map.getLayer('districts-line')) {
          map.setPaintProperty('districts-line', 'line-color', '#818cf8')
          map.setPaintProperty('districts-line', 'line-opacity', 0.75)
        }
      }
    } catch (err) {
      console.warn('Mode style update notice:', err)
    }
  }, [activeMode, isMapReady])

  // Handle 3D Pitch Toggle
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isMapReady) return

    map.easeTo({
      pitch: is3DPitch ? 45 : 0,
      duration: 1000,
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
        duration: 2000,
        essential: true,
      })
    }
  }, [activeRegion, is3DPitch, isMapReady])

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-950">
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full min-h-screen overflow-hidden"
      />
    </div>
  )
}
