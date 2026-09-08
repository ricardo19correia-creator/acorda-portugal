'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { DISTRICTS_LIST, getDistrict, type DistrictItem } from '@/src/data/districts'
import type { MapArenaPOI } from '@/components/portugal-map/types'
import {
  type WorldMapMode,
  type WorldSector,
  type WorldLayersConfig,
  type ScreenPoint,
  DEFAULT_WORLD_LAYERS,
} from './WorldState'

interface WorldStateContextValue {
  districts: DistrictItem[]
  selectedDistrict: DistrictItem | null
  hoveredDistrict: DistrictItem | null
  hoverPos: ScreenPoint | null
  selectedArena: MapArenaPOI | null
  activeSector: WorldSector
  activeMode: WorldMapMode
  layers: WorldLayersConfig
  isReady: boolean
  nationalOnline: number
  continenteOnline: number
  acoresOnline: number
  madeiraOnline: number
  districtOnlineCounts: Record<string, number>
  selectDistrict: (district: DistrictItem | string | null) => void
  hoverDistrict: (district: DistrictItem | null) => void
  hoverDistrictWithPos: (district: DistrictItem | null, pos: ScreenPoint | null) => void
  selectArena: (arena: MapArenaPOI | null) => void
  setSector: (sector: WorldSector) => void
  setMode: (mode: WorldMapMode) => void
  toggleLayer: (layerKey: keyof WorldLayersConfig) => void
}

const WorldStateContext = createContext<WorldStateContextValue | null>(null)

// Canonical mapping of user district string to territory ID
function normalizeDistrictKey(rawDistrict?: string): string {
  if (!rawDistrict) return 'portugal'
  const raw = rawDistrict.trim().toLowerCase()

  const exact = getDistrict(raw)
  if (exact) return exact.id

  if (raw.includes('miguel')) return 'acores_sao_miguel'
  if (raw.includes('terceira')) return 'acores_terceira'
  if (raw.includes('maria')) return 'acores_santa_maria'
  if (raw.includes('pico')) return 'acores_pico'
  if (raw.includes('faial')) return 'acores_faial'
  if (raw.includes('jorge')) return 'acores_sao_jorge'
  if (raw.includes('graciosa')) return 'acores_graciosa'
  if (raw.includes('flores')) return 'acores_flores'
  if (raw.includes('corvo')) return 'acores_corvo'
  if (raw.includes('acores') || raw.includes('açores')) return 'acores_sao_miguel'
  if (raw.includes('santo')) return 'madeira_porto_santo'
  if (raw.includes('madeira')) return 'madeira_ilha'

  return raw
}

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
  const [rawPresenceDocs, setRawPresenceDocs] = useState<any[]>([])
  const [presenceTick, setPresenceTick] = useState(() => Date.now())
  const [activeMode, setActiveMode] = useState<WorldMapMode>(initialMode)
  const [activeSector, setActiveSector] = useState<WorldSector>(initialSector)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(() => {
    return initialDistrict ? getDistrict(initialDistrict) || null : null
  })
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictItem | null>(null)
  const [hoverPos, setHoverPos] = useState<ScreenPoint | null>(null)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [layers, setLayers] = useState<WorldLayersConfig>(DEFAULT_WORLD_LAYERS)
  const [isReady, setIsReady] = useState(false)

  // 1. Authoritative Firebase ranking subscription
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

  // 2. Real-time Pure Human Presence Subscription from Firestore
  // STRICT: Only real authenticated users who sent heartbeat within 75s TTL
  // NO BOTS, NO NPCS, NO SIMULATION.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(250))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((snap) => {
            const data = snap.data()
            if (data && data.userId) {
              docs.push(data)
            }
          })
          setRawPresenceDocs(docs)
        },
        (err) => {
          console.debug('[WorldStateProvider] Erro na subscrição de presença:', err)
        }
      )
    } catch (err) {
      console.debug('[WorldStateProvider] Falha ao iniciar presença:', err)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // 3. Periodic TTL expiration tick every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPresenceTick(Date.now())
    }, 15_000)
    return () => clearInterval(interval)
  }, [])

  // 4. Filter strictly real human players within 75s TTL
  const activeHumanState = useMemo(() => {
    return filterActiveRealPlayers(rawPresenceDocs, undefined, presenceTick)
  }, [rawPresenceDocs, presenceTick])

  // 5. Aggregate national and regional online human presence
  const { nationalOnline, continenteOnline, acoresOnline, madeiraOnline, districtOnlineCounts } =
    useMemo(() => {
      const counts: Record<string, number> = {}
      let cont = 0
      let ac = 0
      let mad = 0

      for (const p of activeHumanState.players) {
        const key = normalizeDistrictKey(p.district)
        counts[key] = (counts[key] || 0) + 1

        const territory = getDistrict(key)
        if (territory?.parentRegion === 'acores') {
          ac++
        } else if (territory?.parentRegion === 'madeira') {
          mad++
        } else {
          cont++
        }
      }

      return {
        nationalOnline: activeHumanState.humanOnline,
        continenteOnline: cont,
        acoresOnline: ac,
        madeiraOnline: mad,
        districtOnlineCounts: counts,
      }
    }, [activeHumanState])

  // 6. Calculate district war stats from real players
  const warTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // 7. Merge real metrics into DISTRICTS_LIST
  const liveDistricts = useMemo(() => {
    return DISTRICTS_LIST.map((district) => {
      const livePlayersCount =
        districtOnlineCounts[district.id] ||
        districtOnlineCounts[district.slug] ||
        districtOnlineCounts[district.name.toLowerCase()] ||
        0

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
          players: livePlayersCount,
          status: match.power > 5000 ? ('contested' as const) : ('active' as const),
        }
      }
      return {
        ...district,
        players: livePlayersCount,
      }
    })
  }, [warTerritories, districtOnlineCounts])

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

  const hoverDistrictWithPos = useCallback(
    (district: DistrictItem | null, pos: ScreenPoint | null) => {
      setHoveredDistrict(district)
      setHoverPos(pos)
    },
    []
  )

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
      hoverPos,
      selectedArena,
      activeSector,
      activeMode,
      layers,
      isReady,
      nationalOnline,
      continenteOnline,
      acoresOnline,
      madeiraOnline,
      districtOnlineCounts,
      selectDistrict,
      hoverDistrict: setHoveredDistrict,
      hoverDistrictWithPos,
      selectArena,
      setSector: setActiveSector,
      setMode: setActiveMode,
      toggleLayer,
    }),
    [
      liveDistricts,
      currentSelectedDistrict,
      hoveredDistrict,
      hoverPos,
      selectedArena,
      activeSector,
      activeMode,
      layers,
      isReady,
      nationalOnline,
      continenteOnline,
      acoresOnline,
      madeiraOnline,
      districtOnlineCounts,
      selectDistrict,
      hoverDistrictWithPos,
      selectArena,
      toggleLayer,
    ]
  )

  return <WorldStateContext.Provider value={value}>{children}</WorldStateContext.Provider>
}

export function useWorldState() {
  const ctx = useContext(WorldStateContext)
  if (!ctx) {
    throw new Error('useWorldState must be used within a WorldStateProvider')
  }
  return ctx
}
