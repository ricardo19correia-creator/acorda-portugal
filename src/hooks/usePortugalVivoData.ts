'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { DISTRICTS_LIST, type DistrictItem } from '@/src/data/districts'
import { CANONICAL_CITIES, type NexusEvent } from '@/lib/portugal-map-nexus-data'
import { PORTUGAL_CONCELHOS_COORDS } from '@/src/data/concelhos-coords'

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
  centerMid: [number, number]
  leaderName: string
  gapPower: number
  player1Name?: string
  player2Name?: string
}

export interface LivePulseMessage {
  id: string
  icon: string
  text: string
  color: string
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

export interface ResolvedPlayerPin {
  userId: string
  displayName: string
  photoURL?: string | null
  avatar?: string | null
  district: string
  city?: string
  lat: number
  lng: number
  coords: [number, number] // [lng, lat]
  accuracy?: number | null
  locationSource: 'gps' | 'concelho' | 'ip'
  activity: 'playing' | 'duel' | 'browsing'
  lastSeen: number
  expiresAt?: number
  online: boolean
  level: number
  xp?: number
  title?: string
  equippedFrame?: string
  isCurrentUser: boolean
}

export interface PortugalVivoDataState {
  districts: PortugalVivoDistrict[]
  districtMap: Map<string, PortugalVivoDistrict>
  confrontations: ActiveConfrontation[]
  activeEvents: NexusEvent[]
  nationalLeader: PortugalVivoDistrict | null
  onlineCount: number
  activeDistrictsCount: number
  onlinePlayers: ResolvedPlayerPin[]
  currentUserPin: ResolvedPlayerPin | null
  livePulseMessages: LivePulseMessage[]
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

// Dispersão determinística suave para que múltiplos jogadores no mesmo centroide não se sobreponham
function getDeterministicOffset(str: string): [number, number] {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const angle = Math.abs(hash % 360) * (Math.PI / 180)
  // Desvio entre ~500m e ~1.6km (0.005 a 0.015 graus)
  const dist = 0.006 + (Math.abs(hash >> 8) % 100) / 9000
  return [Math.cos(angle) * dist, Math.sin(angle) * dist]
}

export function usePortugalVivoData(overrideUserId?: string | null): PortugalVivoDataState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [rawPresenceDocs, setRawPresenceDocs] = useState<any[]>([])
  const [activeDuels, setActiveDuels] = useState<any[]>([])
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

  // 2. Subscrição a Duelos Reais em Andamento (Disputas Reais — ZERO fake data)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    try {
      const duelsCol = collection(db, 'duels')
      const q = query(duelsCol, where('status', '==', 'playing'), limit(15))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((snap) => {
            docs.push({ id: snap.id, ...snap.data() })
          })
          setActiveDuels(docs)
        },
        (err) => {
          console.debug('[usePortugalVivoData] Duelos em direto (não-crítico):', err?.message)
        }
      )
    } catch {}

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // 3. Tique periódico para expirar heartbeats com TTL de 75s
  useEffect(() => {
    const timer = setInterval(() => {
      setPresenceTick(Date.now())
    }, 15_000)
    return () => clearInterval(timer)
  }, [])

  // 4. Subscrição aos Rankings Oficiais da Nação
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

  // 5. Filtragem estrita de Humanos Reais sem duplicação e dentro do TTL
  const currentUid = overrideUserId !== undefined ? (overrideUserId || undefined) : auth.currentUser?.uid
  const activeHumanState = useMemo(() => {
    return filterActiveRealPlayers(rawPresenceDocs, currentUid, presenceTick)
  }, [rawPresenceDocs, currentUid, presenceTick])

  // 6. Contagem real por distrito a partir de utilizadores ativos
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

  // 7. Mapeamento de Todos os Concelhos e Cidades Canónicas para Coordenadas Rápidas
  const cityCoordsLookup = useMemo(() => {
    const map = new Map<string, [number, number]>()
    for (const [key, item] of Object.entries(PORTUGAL_CONCELHOS_COORDS)) {
      map.set(key, item.coordinates)
      map.set(normalizeKey(item.name), item.coordinates)
    }
    for (const city of CANONICAL_CITIES) {
      map.set(normalizeKey(city.name), city.coordinates)
    }
    return map
  }, [])

  // 8. Cálculo Territorial Autorizado (XP, Vitórias, Jogos e Poder)
  const warTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  // 9. Agregação e Mapeamento dos 29 Distritos e Ilhas de Portugal
  const { districts, districtMap, nationalLeader } = useMemo(() => {
    const warLookup = new Map<string, DistrictWarTerritory>()
    for (const war of warTerritories) {
      warLookup.set(normalizeKey(war.name), war)
      warLookup.set(normalizeKey(war.id), war)
    }

    const nationalPowerSum = warTerritories.reduce((acc, w) => acc + (w.power || 0), 0)

    const list: PortugalVivoDistrict[] = DISTRICTS_LIST.map((geo) => {
      const normName = normalizeKey(geo.name)
      const normCanon = normalizeKey(geo.canonicalName)
      const normId = normalizeKey(geo.id)

      const war = warLookup.get(normName) || warLookup.get(normCanon) || warLookup.get(normId)

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
        inDisputeWith: null,
        activeEvent: null,
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

  // 10. Resolução Geográfica de Jogadores Online (GPS real ou centroide com dispersão suave)
  const { onlinePlayers, currentUserPin } = useMemo(() => {
    let currentPin: ResolvedPlayerPin | null = null

    const resolved: ResolvedPlayerPin[] = activeHumanState.players.map((p) => {
      const isCurrent = Boolean(currentUid && p.userId === currentUid)
      let coords: [number, number]
      let locSource: 'gps' | 'concelho' | 'ip' = p.locationSource || 'concelho'

      // 1.º Prioridade: GPS Real válido (nunca aplicar desvio a GPS real)
      if (p.locationSource === 'gps' && p.coords && Array.isArray(p.coords) && p.coords.length === 2) {
        coords = [p.coords[0], p.coords[1]]
        locSource = 'gps'
      } else if (typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng)) {
        coords = [p.lng, p.lat]
        locSource = p.locationSource || 'gps'
      } else if (p.coords && Array.isArray(p.coords) && p.coords.length === 2) {
        coords = [p.coords[0], p.coords[1]]
        locSource = p.locationSource || 'gps'
      } else {
        // 2.º Prioridade: Concelho Canónico
        let baseCoords: [number, number] | null = null
        const concelhoCandidate = p.city || (p as any).concelho
        if (concelhoCandidate) {
          baseCoords = cityCoordsLookup.get(normalizeKey(concelhoCandidate)) || null
          if (baseCoords) locSource = 'concelho'
        }
        // 3.º Prioridade: Distrito / IP Fallback
        if (!baseCoords) {
          const d = districtMap.get(normalizeKey(p.district))
          baseCoords = d ? d.center : [-8.2245, 39.3999] // Centroide nacional
          locSource = 'ip'
        }

        // Apenas aplicar pequena dispersão determinística para evitar sobreposição total em centroides idênticos
        const offset = getDeterministicOffset(p.userId)
        coords = [baseCoords[0] + offset[0], baseCoords[1] + offset[1]]
      }

      const pin: ResolvedPlayerPin = {
        userId: p.userId,
        displayName: p.displayName,
        photoURL: p.photoURL || p.avatar || null,
        avatar: p.avatar || p.photoURL || null,
        district: p.district || 'Portugal',
        city: p.city,
        lat: coords[1],
        lng: coords[0],
        coords,
        accuracy: p.accuracy ?? (locSource === 'gps' ? 15 : null),
        locationSource: locSource,
        activity: p.activity,
        lastSeen: p.lastSeen,
        expiresAt: p.expiresAt,
        online: true,
        level: p.level || 1,
        xp: p.xp,
        title: p.title,
        equippedFrame: p.equippedFrame,
        isCurrentUser: isCurrent,
      }

      if (isCurrent) {
        currentPin = pin
      }

      return pin
    })

    return { onlinePlayers: resolved, currentUserPin: currentPin }
  }, [activeHumanState.players, currentUid, cityCoordsLookup, districtMap])

  // 11. Deteção Real de Confrontos Territoriais (Apenas Duelos em Direto — ZERO fake data)
  const confrontations = useMemo<ActiveConfrontation[]>(() => {
    if (activeDuels.length === 0) return []

    const disputes: ActiveConfrontation[] = []
    for (const duel of activeDuels) {
      const p1 = duel.player1 || duel.players?.[0]
      const p2 = duel.player2 || duel.players?.[1]
      if (!p1 || !p2) continue

      const dName1 = p1.district || 'Portugal'
      const dName2 = p2.district || 'Portugal'
      const distA = districtMap.get(normalizeKey(dName1))
      const distB = districtMap.get(normalizeKey(dName2))

      if (distA && distB && distA.id !== distB.id) {
        const centerMid: [number, number] = [
          (distA.center[0] + distB.center[0]) / 2,
          (distA.center[1] + distB.center[1]) / 2,
        ]
        disputes.push({
          id: `duel_${duel.id}`,
          districtA: distA.name,
          districtB: distB.name,
          slugA: distA.slug,
          slugB: distB.slug,
          powerA: distA.power,
          powerB: distB.power,
          powerFormattedA: distA.powerFormatted,
          powerFormattedB: distB.powerFormatted,
          onlineA: distA.onlineNow,
          onlineB: distB.onlineNow,
          centerA: distA.center,
          centerB: distB.center,
          centerMid,
          leaderName: distA.power >= distB.power ? distA.name : distB.name,
          gapPower: Math.abs(distA.power - distB.power),
          player1Name: p1.displayName || 'Jogador 1',
          player2Name: p2.displayName || 'Jogador 2',
        })
      }
    }
    return disputes
  }, [activeDuels, districtMap])

  // 12. Métricas Nacionais Agregadas Estritamente Reais (ZERO MOCK DATA)
  const onlineCount = activeHumanState.humanOnline

  // Regra Master: Apenas distritos que possuem pelo menos 1 jogador real online agora!
  const activeDistrictsCount = districts.filter((d) => d.onlineNow > 0).length

  // Eventos reais ativos (ZERO FAKE DATA)
  const activeEvents = useMemo<NexusEvent[]>(() => {
    return []
  }, [])

  // 13. Feed Contextual em Tempo Real "O Que Está a Acontecer" (ZERO FAKE DATA)
  const livePulseMessages = useMemo<LivePulseMessage[]>(() => {
    const msgs: LivePulseMessage[] = []

    if (onlineCount === 0) {
      msgs.push({
        id: 'quiet',
        icon: '🇵🇹',
        text: 'Portugal tranquilo — entra e sê o primeiro a marcar presença!',
        color: 'text-slate-400',
      })
      return msgs
    }

    // 1. Mensagem de presença geral
    msgs.push({
      id: 'presence',
      icon: '🟢',
      text:
        onlineCount === 1
          ? '1 jogador ativo a explorar Portugal agora'
          : `${onlineCount} jogadores online em atividade pelo país`,
      color: 'text-emerald-400',
    })

    // 2. Hotspots distritais (distrito com maior número de jogadores online > 1)
    const sortedByOnline = [...districts].sort((a, b) => b.onlineNow - a.onlineNow)
    if (sortedByOnline[0] && sortedByOnline[0].onlineNow >= 2) {
      const top = sortedByOnline[0]
      msgs.push({
        id: `hotspot_${top.id}`,
        icon: '🔥',
        text: `${top.name} está em alta com ${top.onlineNow} jogadores online`,
        color: 'text-amber-400',
      })
    }

    // 3. Disputas em direto
    if (confrontations.length > 0) {
      const disp = confrontations[0]
      msgs.push({
        id: `duel_${disp.id}`,
        icon: '⚔️',
        text: `Duelo em direto: ${disp.districtA} vs ${disp.districtB}`,
        color: 'text-amber-300',
      })
    }

    // 4. Eventos especiais ativos
    if (activeEvents.length > 0) {
      const ev = activeEvents[0]
      msgs.push({
        id: `evt_${ev.id}`,
        icon: '⚡',
        text: `Evento ativo: ${ev.title} em ${ev.district}`,
        color: 'text-rose-400',
      })
    }

    // 5. Liderança nacional
    if (nationalLeader && nationalLeader.power > 0) {
      msgs.push({
        id: `leader_${nationalLeader.id}`,
        icon: '👑',
        text: `${nationalLeader.name} comanda o ranking nacional (#1)`,
        color: 'text-amber-400',
      })
    }

    return msgs
  }, [onlineCount, districts, confrontations, activeEvents, nationalLeader])

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
    onlinePlayers,
    currentUserPin,
    livePulseMessages,
    loading,
    error,
    lastUpdated,
    refetch,
  }
}
