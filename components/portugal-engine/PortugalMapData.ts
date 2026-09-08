'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import {
  calculateDistrictWarTerritories,
  type DistrictWarTerritory,
} from '@/lib/district-war'
import {
  PORTUGAL_TERRITORIES,
  type PortugalTerritory,
  getTerritoryById,
  getTerritoryByName,
} from '@/lib/portugal-territories'
import { PORTUGAL_CITIES, type PortugalCity } from '@/lib/portugal-cities-data'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { MapArenaPOI } from '@/components/portugal-map/types'

export interface PortugalMapDataState {
  // Geometria Canónica
  territories: PortugalTerritory[]
  mainlandTerritories: PortugalTerritory[]
  islandTerritories: PortugalTerritory[]
  cities: PortugalCity[]
  arenas: MapArenaPOI[]

  // Dados em Tempo Real (Zero Fake Data)
  activeHumanPlayers: {
    humanOnline: number
    players: RankingPlayer[]
  }
  districtOnlineCounts: Record<string, number>
  nationalPlayers: RankingPlayer[]
  districtWarList: DistrictWarTerritory[]
  territoryMap: Map<string, DistrictWarTerritory>
  loading: boolean
}

/**
 * Hook centralizado que alimenta o motor com dados reais do Firestore
 * TTL estrito de 75s para presenças humanas online.
 */
export function usePortugalMapData(): PortugalMapDataState {
  const [loading, setLoading] = useState(true)

  // 1. Presença Humana Real Online (TTL = 75s)
  const [activeHumanPlayers, setActiveHumanPlayers] = useState<{
    humanOnline: number
    players: RankingPlayer[]
  }>({ humanOnline: 0, players: [] })

  useEffect(() => {
    const now = Date.now()
    const presenceThreshold = now - 75000 // 75s TTL

    const presenceQuery = query(
      collection(db, 'publicPresence'),
      where('lastSeen', '>=', presenceThreshold),
      limit(500)
    )

    const unsubscribe = onSnapshot(
      presenceQuery,
      (snapshot) => {
        const rawDocs = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        const realActive = filterActiveRealPlayers(rawDocs)
        setActiveHumanPlayers({
          humanOnline: realActive.humanOnline || 0,
          players: (realActive.players || []) as unknown as RankingPlayer[],
        })
      },
      (err) => {
        console.warn('[PortugalMapData] Firestore presence listener:', err)
      }
    )

    return () => unsubscribe()
  }, [])

  // 2. Mapeamento de Jogadores Online por Distrito
  const districtOnlineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const list = Array.isArray(activeHumanPlayers?.players) ? activeHumanPlayers.players : []
    list.forEach((p) => {
      const dist = (p.district || '').toLowerCase().trim()
      if (dist) {
        counts[dist] = (counts[dist] || 0) + 1
      }
    })
    return counts
  }, [activeHumanPlayers])

  // 3. Subscrição a Rankings Nacionais
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])

  useEffect(() => {
    const unsubscribe = subscribeRankings('all', 'xp', (players) => {
      setNationalPlayers(players || [])
      setLoading(false)
    }, 250)

    return () => unsubscribe()
  }, [])

  // 4. Guerra dos Distritos Territorial Real
  const districtWarList = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // 5. Lookup Rápido
  const territoryMap = useMemo(() => {
    const map = new Map<string, DistrictWarTerritory>()
    districtWarList.forEach((t) => {
      map.set(t.id.toLowerCase(), t)
      map.set(t.name.toLowerCase(), t)
    })
    return map
  }, [districtWarList])

  const mainlandTerritories = useMemo(
    () => PORTUGAL_TERRITORIES.filter((t) => t.type === 'mainland'),
    []
  )

  const islandTerritories = useMemo(
    () => PORTUGAL_TERRITORIES.filter((t) => t.type === 'island'),
    []
  )

  return {
    territories: PORTUGAL_TERRITORIES,
    mainlandTerritories,
    islandTerritories,
    cities: PORTUGAL_CITIES,
    arenas: OFFICIAL_MAP_ARENAS,
    activeHumanPlayers,
    districtOnlineCounts,
    nationalPlayers,
    districtWarList,
    territoryMap,
    loading,
  }
}
