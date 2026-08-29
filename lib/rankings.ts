import { collection, query, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { getAvatarImage } from '@/lib/avatars'
import { NPC_CATALOG } from '@/lib/npc-system/npc-catalog'

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
  playerType?: 'human' | 'npc'
  isNpc?: boolean
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
 * Normaliza os dados de qualquer documento (publicProfiles ou botPlayers) para RankingPlayer
 */
export function mapDocToRankingPlayer(id: string, data: any, defaultType: 'human' | 'npc' = 'human'): RankingPlayer {
  const isBot = Boolean(data.isNpc || data.playerType === 'npc' || defaultType === 'npc')
  const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? data.xp : 0
  const level = typeof data.level === 'number' ? data.level : calculateLevelProgress(xp).currentLevel.level
  const rawName = (data.displayName || data.name || data.username || data.email?.split('@')[0] || '').trim()
  const displayName = rawName || (isBot ? 'NPC Lusitano' : 'Jogador')
  const district = (data.district || data.region || 'Portugal').trim()
  const photoURL = getAvatarImage(data.photoURL || data.avatar || data.avatarId || (data.equipped?.avatar) || null)
  const title = data.equippedTitle || data.title || data.equipped?.title || (isBot ? `Competidor de ${district}` : 'Jogador Nacional')
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
    playerType: isBot ? 'npc' : 'human',
    isNpc: isBot,
    virtualMoney,
  }
}

/**
 * Retorna a lista canónica de NPCs/Bots formatada para o Ranking com XP e Níveis Oficiais
 */
export function getNpcRankingPlayers(): RankingPlayer[] {
  return NPC_CATALOG.map((npc) => ({
    uid: npc.npcId,
    displayName: npc.displayName,
    photoURL: npc.avatar,
    district: npc.district,
    region: npc.district,
    xp: npc.xp,
    level: npc.level,
    title: npc.title || `Competidor de ${npc.district}`,
    equippedTitle: npc.title || `Competidor de ${npc.district}`,
    equippedFrame: npc.equippedFrame,
    isFounder: false,
    wins1v1: npc.wins,
    gamesPlayed: npc.wins + npc.losses,
    accuracyRate: Math.round(((npc.accuracyRange[0] + npc.accuracyRange[1]) / 2) * 100),
    playerType: 'npc',
    isNpc: true,
    virtualMoney: npc.virtualMoney,
  }))
}

/**
 * Calcula a agregação distrital de XP e Jogadores Ativos:
 * XP_Distrito = SUM(publicProfiles.xp) + SUM(botPlayers.xp)
 * Jogadores_Distrito = COUNT(humanos) + COUNT(bots)
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
      const isBot = Boolean(p.isNpc || p.playerType === 'npc')
      tempMap.set(matched, {
        players: cur.players + 1,
        xp: cur.xp + pXp,
        humanPlayers: cur.humanPlayers + (isBot ? 0 : 1),
        botPlayers: cur.botPlayers + (isBot ? 1 : 0),
        humanXp: cur.humanXp + (isBot ? 0 : pXp),
        botXp: cur.botXp + (isBot ? pXp : 0),
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
 * Obter Top Geral ou por Distrito combinando Jogadores Reais (publicProfiles) e Bots (botPlayers / NPC_CATALOG)
 */
export async function fetchRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  queryLimit: number = 50,
  includeNpcs: boolean = true
): Promise<RankingPlayer[]> {
  const humanList: RankingPlayer[] = []
  const firestoreBotsList: RankingPlayer[] = []

  try {
    const pubRef = collection(db, 'publicProfiles')
    const pubSnap = await getDocs(query(pubRef, limit(200)))
    pubSnap.docs.forEach((d) => {
      humanList.push(mapDocToRankingPlayer(d.id, d.data(), 'human'))
    })
  } catch (error) {
    console.warn('[RANKINGS] Erro ao carregar publicProfiles do Firestore:', error)
  }

  if (includeNpcs) {
    try {
      const botsRef = collection(db, 'botPlayers')
      const botsSnap = await getDocs(query(botsRef, limit(200)))
      botsSnap.docs.forEach((d) => {
        firestoreBotsList.push(mapDocToRankingPlayer(d.id, d.data(), 'npc'))
      })
    } catch (error) {
      console.warn('[RANKINGS] Erro ao carregar botPlayers do Firestore:', error)
    }
  }

  let list: RankingPlayer[] = []

  if (includeNpcs) {
    const fallbackNpcs = getNpcRankingPlayers()
    const mergedMap = new Map<string, RankingPlayer>()

    // 1. Fallback base de catálogo
    fallbackNpcs.forEach((npc) => mergedMap.set(npc.uid, npc))
    // 2. Documentos da coleção botPlayers do Firestore
    firestoreBotsList.forEach((bot) => mergedMap.set(bot.uid, bot))
    // 3. Jogadores humanos reais sobrepõem-se com prioridade máxima
    humanList.forEach((human) => mergedMap.set(human.uid, human))

    list = Array.from(mergedMap.values())
  } else {
    list = [...humanList]
  }

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
 * Subscrição em Tempo Real aos Rankings combinando publicProfiles e botPlayers com agregação nos 20 distritos
 */
export function subscribeRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  callback: (players: RankingPlayer[]) => void,
  queryLimit: number = 50,
  includeNpcs: boolean = true
): () => void {
  const fallbackNpcs = includeNpcs ? getNpcRankingPlayers() : []
  let currentHumans: RankingPlayer[] = []
  let currentBots: RankingPlayer[] = []

  const emitRankings = () => {
    let list: RankingPlayer[] = []

    if (includeNpcs) {
      const mergedMap = new Map<string, RankingPlayer>()
      // 1. Catálogo base
      fallbackNpcs.forEach((npc) => mergedMap.set(npc.uid, npc))
      // 2. Coleção botPlayers
      currentBots.forEach((bot) => mergedMap.set(bot.uid, bot))
      // 3. Perfis reais publicProfiles
      currentHumans.forEach((human) => mergedMap.set(human.uid, human))

      list = Array.from(mergedMap.values())
    } else {
      list = [...currentHumans]
    }

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
  let unsubBots: (() => void) | undefined

  try {
    // 1. Escutar publicProfiles
    const pubRef = collection(db, 'publicProfiles')
    unsubPub = onSnapshot(
      query(pubRef, limit(200)),
      (snapshot) => {
        currentHumans = []
        snapshot.docs.forEach((doc) => {
          currentHumans.push(mapDocToRankingPlayer(doc.id, doc.data(), 'human'))
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

  if (includeNpcs) {
    try {
      // 2. Escutar botPlayers
      const botsRef = collection(db, 'botPlayers')
      unsubBots = onSnapshot(
        query(botsRef, limit(200)),
        (snapshot) => {
          currentBots = []
          snapshot.docs.forEach((doc) => {
            currentBots.push(mapDocToRankingPlayer(doc.id, doc.data(), 'npc'))
          })
          emitRankings()
        },
        (err) => {
          console.warn('[RANKINGS] botPlayers listener notice:', err)
        }
      )
    } catch (e) {
      console.warn('[RANKINGS] Erro no listener de botPlayers:', e)
    }
  }

  return () => {
    if (unsubPub) unsubPub()
    if (unsubBots) unsubBots()
  }
}

