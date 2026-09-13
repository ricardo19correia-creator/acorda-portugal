'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { DISTRICTS_LIST, type DistrictItem } from '@/src/data/districts'
import { CANONICAL_EVENTS, type NexusEvent } from '@/lib/portugal-map-nexus-data'

export interface ActiveConfrontation {
  id: string
  districtA: string
  districtB: string
  slugA: string
  slugB: string
  powerA: number
  powerB: number
  powerFormattedA: string
  powerFormattedB: string
  onlineA: number
  onlineB: number
  centerA: [number, number]
  centerB: [number, number]
  leaderName: string
  gapPower: number
}

export interface PortugalVivoDistrict extends DistrictItem {
  onlineNow: number
  activePlayers: number
  totalXp: number
  totalDuelWins: number
  totalGames: number
  power: number
  powerFormatted: string
  pos: number
  dominancePercentage: number
  isLeader: boolean
  inDisputeWith: string | null
  activeEvent: NexusEvent | null
  king: DistrictWarTerritory['king'] | null
  topContributors: DistrictWarTerritory['topContributors']
}

export interface PortugalVivoDataState {
  districts: PortugalVivoDistrict[]
  districtMap: Map<string, PortugalVivoDistrict>
  confrontations: ActiveConfrontation[]
  activeEvents: NexusEvent[]
  nationalLeader: PortugalVivoDistrict | null
  onlineCount: number
  activeDistrictsCount: number
  loading: boolean
  error: string | null
  lastUpdated: number
  refetch: () => void
}

function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim()
}

export function usePortugalVivoData(): PortugalVivoDataState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [rawPresenceDocs, setRawPresenceDocs] = useState<any[]>([])
  const [presenceTick, setPresenceTick] = useState(() => Date.now())
  const [lastUpdated, setLastUpdated] = useState(() => Date.now())

  // 1. Subscrição em Tempo Real aos Utilizadores Autênticos Ativos (Firestore publicPresence)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(300))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((snap) => {
            const data = snap.data()
            if (data && (data.userId || snap.id)) {
              docs.push({ id: snap.id, ...data })
            }
          })
          setRawPresenceDocs(docs)
          setLastUpdated(Date.now())
        },
        (err) => {
          console.warn('[usePortugalVivoData] Aviso de presença no Firestore:', err?.message)
        }
      )
    } catch (err: any) {
      console.warn('[usePortugalVivoData] Falha ao ligar presença:', err?.message)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // 2. Tique periódico para expirar heartbeats com TTL de 75s
  useEffect(() => {
    const timer = setInterval(() => {
      setPresenceTick(Date.now())
    }, 15_000)
    return () => clearInterval(timer)
  }, [])

  // 3. Subscrição aos Rankings Oficiais da Nação
  useEffect(() => {
    let isSubscribed = true
    try {
      const unsub = subscribeRankings(
        'all',
        'xp',
        (players) => {
          if (!isSubscribed) return
          setNationalPlayers(players || [])
          setLoading(false)
          setError(null)
          setLastUpdated(Date.now())
        },
        250
      )
      return () => {
        isSubscribed = false
        unsub()
      }
    } catch (err: any) {
      console.error('[usePortugalVivoData] Erro ao subscrever classificações:', err)
      queueMicrotask(() => {
        if (isSubscribed) {
          setError('Não foi possível sincronizar as classificações territoriais.')
          setLoading(false)
        }
      })
    }
  }, [])

  // 4. Filtragem estrita de Humanos Reais sem duplicação e dentro do TTL
  const activeHumanState = useMemo(() => {
    return filterActiveRealPlayers(rawPresenceDocs, undefined, presenceTick)
  }, [rawPresenceDocs, presenceTick])

  // 5. Contagem real por distrito a partir de utilizadores ativos
  const districtOnlineMap = useMemo(() => {
    const counts = new Map<string, number>()
    for (const player of activeHumanState.players) {
      const raw = player.district || ''
      if (!raw) continue
      const norm = normalizeKey(raw)
      counts.set(norm, (counts.get(norm) || 0) + 1)
    }
    return counts
  }, [activeHumanState])

  // 6. Cálculo Territorial Autorizado (XP, Vitórias, Jogos e Poder)
  const warTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // 7. Agregação e Mapeamento dos 29 Distritos e Ilhas de Portugal
  const { districts, districtMap, nationalLeader } = useMemo(() => {
    const warLookup = new Map<string, DistrictWarTerritory>()
    for (const war of warTerritories) {
      warLookup.set(normalizeKey(war.name), war)
      warLookup.set(normalizeKey(war.id), war)
    }

    const eventLookup = new Map<string, NexusEvent>()
    for (const ev of CANONICAL_EVENTS) {
      if (ev.status === 'active') {
        eventLookup.set(normalizeKey(ev.district), ev)
      }
    }

    const nationalPowerSum = warTerritories.reduce((acc, w) => acc + (w.power || 0), 0)

    const list: PortugalVivoDistrict[] = DISTRICTS_LIST.map((geo) => {
      const normName = normalizeKey(geo.name)
      const normCanon = normalizeKey(geo.canonicalName)
      const normId = normalizeKey(geo.id)

      const war = warLookup.get(normName) || warLookup.get(normCanon) || warLookup.get(normId)
      const ev = eventLookup.get(normName) || eventLookup.get(normCanon) || null

      const online =
        districtOnlineMap.get(normName) ||
        districtOnlineMap.get(normCanon) ||
        districtOnlineMap.get(normId) ||
        0

      const power = war?.power || 0
      const pos = war?.pos || 20
      const dominance = nationalPowerSum > 0 && power > 0
        ? Math.max(1, Math.round((power / nationalPowerSum) * 100))
        : 0

      const powerFormatted =
        power >= 1000 ? `${(power / 1000).toFixed(1)}K` : `${power}`

      return {
        ...geo,
        onlineNow: online,
        activePlayers: war?.activePlayers || 0,
        totalXp: war?.totalXp || 0,
        totalDuelWins: war?.totalDuelWins || 0,
        totalGames: war?.totalGames || 0,
        power,
        powerFormatted,
        pos,
        dominancePercentage: dominance,
        isLeader: pos === 1 && power > 0,
        inDisputeWith: null, // Preenchido no passo de confrontos
        activeEvent: ev,
        king: war?.king || null,
        topContributors: war?.topContributors || [],
      }
    })

    // Ordenar por ranking territorial oficial
    list.sort((a, b) => a.pos - b.pos)

    const map = new Map<string, PortugalVivoDistrict>()
    for (const item of list) {
      map.set(item.id.toLowerCase(), item)
      map.set(normalizeKey(item.name), item)
      map.set(normalizeKey(item.canonicalName), item)
      map.set(item.slug.toLowerCase(), item)
    }

    const leader = list.find((d) => d.isLeader) || (list[0] && list[0].power > 0 ? list[0] : null)

    return {
      districts: list,
      districtMap: map,
      nationalLeader: leader,
    }
  }, [warTerritories, districtOnlineMap])

  // 8. Deteção Real de Confrontos Territoriais (Disputas Reais Ativas)
  const confrontations = useMemo<ActiveConfrontation[]>(() => {
    const activeContenders = districts.filter((d) => d.power > 0)
    if (activeContenders.length < 2) return []

    const disputes: ActiveConfrontation[] = []
    const processedPairs = new Set<string>()

    for (let i = 0; i < Math.min(activeContenders.length - 1, 6); i++) {
      const a = activeContenders[i]
      const b = activeContenders[i + 1]

      if (!a || !b) continue
      const pairKey = [a.id, b.id].sort().join('-')
      if (processedPairs.has(pairKey)) continue

      const higher = Math.max(a.power, b.power)
      const lower = Math.min(a.power, b.power)
      const diffRatio = higher > 0 ? (higher - lower) / higher : 1

      if (diffRatio <= 0.25) {
        processedPairs.add(pairKey)
        const gap = higher - lower
        const leaderName = a.power >= b.power ? a.name : b.name

        a.inDisputeWith = b.name
        b.inDisputeWith = a.name

        disputes.push({
          id: `dispute_${a.id}_${b.id}`,
          districtA: a.name,
          districtB: b.name,
          slugA: a.slug,
          slugB: b.slug,
          powerA: a.power,
          powerB: b.power,
          powerFormattedA: a.powerFormatted,
          powerFormattedB: b.powerFormatted,
          onlineA: a.onlineNow,
          onlineB: b.onlineNow,
          centerA: a.center,
          centerB: b.center,
          leaderName,
          gapPower: gap,
        })
      }
    }

    return disputes
  }, [districts])

  // 9. Métricas Nacionais Agregadas
  const onlineCount = activeHumanState.humanOnline
  const activeDistrictsCount = districts.filter((d) => d.onlineNow > 0 || d.power > 0).length

  const activeEvents = useMemo(() => {
    return CANONICAL_EVENTS.filter((e) => e.status === 'active')
  }, [])

  const refetch = useCallback(() => {
    setLoading(true)
    setPresenceTick(Date.now())
  }, [])

  return {
    districts,
    districtMap,
    confrontations,
    activeEvents,
    nationalLeader,
    onlineCount,
    activeDistrictsCount,
    loading,
    error,
    lastUpdated,
    refetch,
  }
}
