import { collection, query, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { getAvatarImage } from '@/lib/avatars'

export interface RankingPlayer {
  uid: string
  displayName: string
  photoURL?: string
  district: string
  region?: string
  xp: number
  level: number
  title: string
  equippedTitle?: string
  equippedFrame?: string
  isFounder?: boolean
  wins1v1?: number
  gamesPlayed?: number
  accuracyRate?: number
  pos?: number
  playerType?: 'human'
  isNpc?: false
  virtualMoney?: number
}

export interface DistrictAggregateStat {
  name: string
  pos: number
  players: number
  xp: number
  humanPlayers: number
  botPlayers: number
  humanXp: number
  botXp: number
}

export const ALL_DISTRICTS_LIST = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

/**
 * Normaliza os dados de qualquer documento de jogador humano (publicProfiles) para RankingPlayer
 */
export function mapDocToRankingPlayer(id: string, data: any): RankingPlayer {
  const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? Math.max(0, data.xp) : 0
  // FONTE CANÓNICA ÚNICA: O nível é SEMPRE calculado matematicamente a partir do XP Total
  const levelInfo = calculateLevelProgress(xp)
  const level = levelInfo.currentLevel.level
  const rawName = (data.displayName || data.name || data.username || data.email?.split('@')[0] || '').trim()
  const displayName = rawName || 'Jogador'
  const district = (data.district || data.region || 'Portugal').trim()
  const photoURL = getAvatarImage(data.photoURL || data.avatar || data.avatarId || (data.equipped?.avatar) || null)
  const title = data.equippedTitle || data.title || data.equipped?.title || levelInfo.currentLevel.title || 'Jogador Nacional'
  const equippedFrame = data.equippedFrame || data.equipped?.frameId || data.frameId || undefined
  const wins1v1 = typeof data.wins1v1 === 'number' ? data.wins1v1 : typeof data.wins === 'number' ? data.wins : typeof data.duelWins === 'number' ? data.duelWins : 0
  const gamesPlayed = typeof data.gamesPlayed === 'number' ? data.gamesPlayed : (data.stats?.duelsTotal || (wins1v1 + (data.losses || 0)))
  const accuracyRate = typeof data.accuracyRate === 'number' ? data.accuracyRate : (data.stats?.accuracyRate || 0)
  const virtualMoney = typeof data.virtualMoney === 'number' ? data.virtualMoney : typeof data.coins === 'number' ? data.coins : 100

  return {
    uid: id,
    displayName,
    photoURL,
    district,
    region: district,
    xp,
    level,
    title,
    equippedTitle: title,
    equippedFrame,
    isFounder: Boolean(data.isFounder),
    wins1v1,
    gamesPlayed,
    accuracyRate,
    playerType: 'human',
    isNpc: false,
    virtualMoney,
  }
}

/**
 * Calcula a agregação distrital de XP e Jogadores Humanos Ativos
 */
export function computeDistrictStats(players: RankingPlayer[]): Map<string, DistrictAggregateStat> {
  const tempMap = new Map<string, {
    players: number
    xp: number
    humanPlayers: number
    botPlayers: number
    humanXp: number
    botXp: number
  }>()

  for (const d of ALL_DISTRICTS_LIST) {
    tempMap.set(d, {
      players: 0,
      xp: 0,
      humanPlayers: 0,
      botPlayers: 0,
      humanXp: 0,
      botXp: 0,
    })
  }

  players.forEach((p) => {
    const rawDist = (p.district || p.region || '').trim()
    const matched = ALL_DISTRICTS_LIST.find((d) => d.toLowerCase() === rawDist.toLowerCase())
    if (matched) {
      const cur = tempMap.get(matched)!
      const pXp = typeof p.xp === 'number' && !isNaN(p.xp) ? p.xp : 0
      tempMap.set(matched, {
        players: cur.players + 1,
        xp: cur.xp + pXp,
        humanPlayers: cur.humanPlayers + 1,
        botPlayers: 0,
        humanXp: cur.humanXp + pXp,
        botXp: 0,
      })
    }
  })

  const sortedList = Array.from(tempMap.entries()).map(([name, s]) => ({
    name,
    ...s,
  }))

  sortedList.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp
    if (b.players !== a.players) return b.players - a.players
    return a.name.localeCompare(b.name, 'pt-PT')
  })

  const finalMap = new Map<string, DistrictAggregateStat>()
  sortedList.forEach((item, index) => {
    finalMap.set(item.name, {
      ...item,
      pos: item.xp > 0 ? index + 1 : 0,
    })
  })

  return finalMap
}

/**
 * Obter Top Geral ou por Distrito exclusivamente com Jogadores Humanos Reais (publicProfiles)
 */
export async function fetchRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  queryLimit: number = 50
): Promise<RankingPlayer[]> {
  const humanList: RankingPlayer[] = []

  try {
    const pubRef = collection(db, 'publicProfiles')
    const pubSnap = await getDocs(query(pubRef, limit(200)))
    pubSnap.docs.forEach((d) => {
      humanList.push(mapDocToRankingPlayer(d.id, d.data()))
    })
  } catch (error) {
    console.warn('[RANKINGS] Erro ao carregar publicProfiles do Firestore:', error)
  }

  let list = [...humanList]

  if (districtFilter !== 'all') {
    list = list.filter((p) => (p.district || p.region || '').toLowerCase() === districtFilter.toLowerCase())
  }

  list.sort((a, b) => {
    const valA = mode === 'duelos' ? (a.wins1v1 || 0) : a.xp
    const valB = mode === 'duelos' ? (b.wins1v1 || 0) : b.xp
    return valB - valA
  })

  return list.slice(0, queryLimit).map((p, idx) => ({ ...p, pos: idx + 1 }))
}

/**
 * Subscrição em Tempo Real aos Rankings exclusivamente com Jogadores Humanos Reais (publicProfiles)
 */
export function subscribeRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  callback: (players: RankingPlayer[]) => void,
  queryLimit: number = 50
): () => void {
  let currentHumans: RankingPlayer[] = []

  const emitRankings = () => {
    let list = [...currentHumans]

    if (districtFilter !== 'all') {
      list = list.filter((p) => (p.district || p.region || '').toLowerCase() === districtFilter.toLowerCase())
    }

    list.sort((a, b) => {
      const valA = mode === 'duelos' ? (a.wins1v1 || 0) : a.xp
      const valB = mode === 'duelos' ? (b.wins1v1 || 0) : b.xp
      return valB - valA
    })

    const ranked = list.slice(0, queryLimit).map((p, idx) => ({
      ...p,
      pos: idx + 1,
    }))

    callback(ranked)
  }

  // Emissão imediata inicial
  emitRankings()

  let unsubPub: (() => void) | undefined

  try {
    const pubRef = collection(db, 'publicProfiles')
    unsubPub = onSnapshot(
      query(pubRef, limit(200)),
      (snapshot) => {
        currentHumans = []
        snapshot.docs.forEach((doc) => {
          currentHumans.push(mapDocToRankingPlayer(doc.id, doc.data()))
        })
        emitRankings()
      },
      (err) => {
        console.warn('[RANKINGS] publicProfiles listener notice:', err)
      }
    )
  } catch (e) {
    console.warn('[RANKINGS] Erro no listener de publicProfiles:', e)
  }

  return () => {
    if (unsubPub) unsubPub()
  }
}

