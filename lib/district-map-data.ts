'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import {
  calculateDistrictWarTerritories,
  DISTRICT_METADATA,
  type DistrictWarTerritory,
} from '@/lib/district-war'
import {
  PORTUGAL_TERRITORIES,
  type PortugalTerritory,
} from '@/lib/portugal-territories'

export interface DistrictMapItem {
  id: string
  name: string
  slug: string
  type: 'mainland' | 'island'
  path: string
  centroid: [number, number]
  pos: number
  activePlayers: number
  onlineNow: number
  totalXp: number
  totalDuelWins: number
  totalGames: number
  power: number
  powerFormatted: string
  dominancePercentage: number
  activityLevel: 'Alta' | 'Média' | 'Normal'
  motto: string
  tag: string
  king: {
    uid: string
    displayName: string
    photoURL?: string
    level: number
    xp: number
    title?: string
    equippedFrame?: string
  } | null
  topContributors: Array<{
    uid: string
    displayName: string
    photoURL?: string
    level: number
    xp: number
    equippedFrame?: string
    contributionPercentage: number
  }>
}

export interface DistrictMapDataState {
  territories: DistrictMapItem[]
  territoryMap: Map<string, DistrictMapItem>
  rankingList: DistrictMapItem[]
  loading: boolean
  error: string | null
  isEmpty: boolean
  totalNationalPlayers: number
  totalNationalOnline: number
  totalNationalXp: number
  refetch: () => void
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim()
}

export function useDistrictMapData(): DistrictMapDataState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [activeOnlineCounts, setActiveOnlineCounts] = useState<Record<string, number>>({})
  const [totalOnline, setTotalOnline] = useState(0)

  // 1. Subscrição a Presenças Reais Ativas no Firestore (TTL 75s)
  useEffect(() => {
    let isSubscribed = true
    const presenceThreshold = Date.now() - 75000 // 75s TTL

    try {
      const presenceQuery = query(
        collection(db, 'publicPresence'),
        where('lastSeen', '>=', presenceThreshold),
        limit(500)
      )

      const unsubscribe = onSnapshot(
        presenceQuery,
        (snapshot) => {
          if (!isSubscribed) return
          const rawDocs = snapshot.docs.map((doc) => ({
            uid: doc.id,
            ...doc.data(),
          }))
          const realActive = filterActiveRealPlayers(rawDocs)
          const counts: Record<string, number> = {}

          const list = Array.isArray(realActive.players) ? realActive.players : []
          list.forEach((p: any) => {
            const dist = normalizeKey(p.district || p.region || '')
            if (dist) {
              counts[dist] = (counts[dist] || 0) + 1
            }
          })

          setActiveOnlineCounts(counts)
          setTotalOnline(realActive.humanOnline || 0)
        },
        (err) => {
          console.warn('[useDistrictMapData] Firestore presence warning:', err?.message)
        }
      )

      return () => {
        isSubscribed = false
        unsubscribe()
      }
    } catch (e: any) {
      console.warn('[useDistrictMapData] Failed to subscribe to presence:', e?.message)
    }
  }, [])

  // 2. Subscrição aos Rankings Nacionais Oficiais (Jogadores Reais e XP)
  useEffect(() => {
    let isSubscribed = true
    try {
      const unsubscribe = subscribeRankings(
        'all',
        'xp',
        (players) => {
          if (!isSubscribed) return
          setNationalPlayers(players || [])
          setLoading(false)
          setError(null)
        },
        300
      )

      return () => {
        isSubscribed = false
        unsubscribe()
      }
    } catch (e: any) {
      console.error('[useDistrictMapData] Error subscribing to rankings:', e)
      if (isSubscribed) {
        setError('Não foi possível carregar as classificações nacionais.')
        setLoading(false)
      }
    }
  }, [])

  // 3. Cálculo da Guerra dos Distritos a partir dos Jogadores Reais
  const warTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // 4. União da Geometria Oficial com os Dados Reais
  const { territories, territoryMap, rankingList, totalNationalPlayers, totalNationalXp } = useMemo(() => {
    const warMap = new Map<string, DistrictWarTerritory>()
    warTerritories.forEach((w) => {
      warMap.set(normalizeKey(w.name), w)
      warMap.set(normalizeKey(w.id), w)
    })

    const items: DistrictMapItem[] = PORTUGAL_TERRITORIES.map((geo) => {
      const normName = normalizeKey(geo.name)
      const normId = normalizeKey(geo.id)
      const war = warMap.get(normName) || warMap.get(normId)
      const meta = DISTRICT_METADATA[geo.name] || {
        tag: `SETOR ${geo.name.toUpperCase()}`,
        motto: 'Terra de Tradição e Conquista Heroica',
        color: '#06b6d4',
      }

      const online = activeOnlineCounts[normName] || activeOnlineCounts[normId] || 0
      const activePlayers = war?.activePlayers || 0
      const totalXp = war?.totalXp || 0
      const pos = war?.pos || 20

      let activityLevel: 'Alta' | 'Média' | 'Normal' = 'Normal'
      if (online > 0 || activePlayers >= 10 || (war?.totalGames || 0) >= 20) {
        activityLevel = 'Alta'
      } else if (activePlayers >= 3 || (war?.totalGames || 0) >= 5) {
        activityLevel = 'Média'
      }

      const slug = geo.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')

      return {
        id: geo.id,
        name: geo.name,
        slug,
        type: geo.type,
        path: geo.path,
        centroid: geo.centroid,
        pos,
        activePlayers,
        onlineNow: online,
        totalXp,
        totalDuelWins: war?.totalDuelWins || 0,
        totalGames: war?.totalGames || 0,
        power: war?.power || 0,
        powerFormatted: war?.powerFormatted || '0',
        dominancePercentage: war?.dominancePercentage || 0,
        activityLevel,
        motto: meta.motto,
        tag: meta.tag,
        king: war?.king || null,
        topContributors: war?.topContributors || [],
      }
    })

    const sumPlayers = items.reduce((acc, it) => acc + it.activePlayers, 0)
    const sumXp = items.reduce((acc, it) => acc + it.totalXp, 0)

    const map = new Map<string, DistrictMapItem>()
    items.forEach((item) => {
      map.set(item.id.toLowerCase(), item)
      map.set(normalizeKey(item.name), item)
      map.set(item.slug.toLowerCase(), item)
    })

    const sorted = [...items].sort((a, b) => a.pos - b.pos)

    return {
      territories: items,
      territoryMap: map,
      rankingList: sorted,
      totalNationalPlayers: sumPlayers,
      totalNationalXp: sumXp,
    }
  }, [warTerritories, activeOnlineCounts])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    setTimeout(() => setLoading(false), 200)
  }, [])

  return {
    territories,
    territoryMap,
    rankingList,
    loading,
    error,
    isEmpty: !loading && territories.length === 0,
    totalNationalPlayers,
    totalNationalOnline: totalOnline,
    totalNationalXp,
    refetch,
  }
}
