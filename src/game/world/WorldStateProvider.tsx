'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { DISTRICTS_LIST, getDistrict, type DistrictItem } from '@/src/data/districts'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import {
  type WorldMapMode,
  type WorldSector,
  type WorldLayersConfig,
  DEFAULT_WORLD_LAYERS,
} from './WorldState'

interface WorldStateContextValue {
  districts: DistrictItem[]
  selectedDistrict: DistrictItem | null
  hoveredDistrict: DistrictItem | null
  selectedArena: MapArenaPOI | null
  activeSector: WorldSector
  activeMode: WorldMapMode
  layers: WorldLayersConfig
  isReady: boolean
  selectDistrict: (district: DistrictItem | string | null) => void
  hoverDistrict: (district: DistrictItem | null) => void
  selectArena: (arena: MapArenaPOI | null) => void
  setSector: (sector: WorldSector) => void
  setMode: (mode: WorldMapMode) => void
  toggleLayer: (layerKey: keyof WorldLayersConfig) => void
}

const WorldStateContext = createContext<WorldStateContextValue | null>(null)

export function WorldStateProvider({
  children,
  initialMode = 'world',
  initialDistrict,
  initialSector = 'continente',
}: {
  children: React.ReactNode
  initialMode?: WorldMapMode
  initialDistrict?: string
  initialSector?: WorldSector
}) {
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [activeMode, setActiveMode] = useState<WorldMapMode>(initialMode)
  const [activeSector, setActiveSector] = useState<WorldSector>(initialSector)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(() => {
    return initialDistrict ? getDistrict(initialDistrict) || null : null
  })
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictItem | null>(null)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [layers, setLayers] = useState<WorldLayersConfig>(DEFAULT_WORLD_LAYERS)
  const [isReady, setIsReady] = useState(false)

  // Real-time authoritative Firebase ranking subscription
  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (players) => {
        setNationalPlayers(players)
        setIsReady(true)
      },
      150
    )
    return () => unsub()
  }, [])

  // Calculate district war stats from real players
  const warTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // Merge real metrics into DISTRICTS_LIST
  const liveDistricts = useMemo(() => {
    return DISTRICTS_LIST.map((district) => {
      const match = warTerritories.find(
        (t) =>
          t.name.toLowerCase() === district.name.toLowerCase() ||
          t.name.toLowerCase() === district.canonicalName.toLowerCase() ||
          t.id.toLowerCase() === district.id.toLowerCase()
      )

      if (match) {
        return {
          ...district,
          ranking: match.pos,
          score: match.power,
          players: match.activePlayers,
          status: match.power > 5000 ? ('contested' as const) : ('active' as const),
        }
      }
      return district
    })
  }, [warTerritories])

  const selectDistrict = useCallback((query: DistrictItem | string | null) => {
    if (!query) {
      setSelectedDistrict(null)
      return
    }
    const item = typeof query === 'string' ? getDistrict(query) : query
    setSelectedDistrict(item || null)
    setSelectedArena(null) // Deselect arena when selecting district
  }, [])

  const selectArena = useCallback((arena: MapArenaPOI | null) => {
    setSelectedArena(arena)
    if (arena) {
      setSelectedDistrict(null) // Deselect district when selecting arena
    }
  }, [])

  const toggleLayer = useCallback((layerKey: keyof WorldLayersConfig) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }))
  }, [])

  const currentSelectedDistrict = useMemo(() => {
    if (!selectedDistrict) return null
    const live = liveDistricts.find(
      (d) =>
        d.id.toLowerCase() === selectedDistrict.id.toLowerCase() ||
        d.slug.toLowerCase() === selectedDistrict.slug.toLowerCase() ||
        d.name.toLowerCase() === selectedDistrict.name.toLowerCase()
    )
    return live || selectedDistrict
  }, [selectedDistrict, liveDistricts])

  const value = useMemo(
    () => ({
      districts: liveDistricts,
      selectedDistrict: currentSelectedDistrict,
      hoveredDistrict,
      selectedArena,
      activeSector,
      activeMode,
      layers,
      isReady,
      selectDistrict,
      hoverDistrict: setHoveredDistrict,
      selectArena,
      setSector: setActiveSector,
      setMode: setActiveMode,
      toggleLayer,
    }),
    [
      liveDistricts,
      currentSelectedDistrict,
      hoveredDistrict,
      selectedArena,
      activeSector,
      activeMode,
      layers,
      isReady,
      selectDistrict,
      selectArena,
      toggleLayer,
    ]
  )

  return (
    <WorldStateContext.Provider value={value}>
      {children}
    </WorldStateContext.Provider>
  )
}

export function useWorldState() {
  const ctx = useContext(WorldStateContext)
  if (!ctx) {
    throw new Error('useWorldState must be used within a WorldStateProvider')
  }
  return ctx
}
