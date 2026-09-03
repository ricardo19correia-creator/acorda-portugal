import { collection, query, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { getAvatarImage } from '@/lib/avatars'
import { resolvePlayerEquippedTitle } from '@/lib/titles'

export type CompetitiveDivision =
  | 'Bronze'
  | 'Prata'
  | 'Ouro'
  | 'Platina'
  | 'Diamante'
  | 'Mestre'
  | 'Lendário'

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
  wins1v1: number
  losses1v1: number
  gamesPlayed: number
  accuracyRate: number
  rating: number
  division: CompetitiveDivision
  streak: number
  weeklyMovement: number
  isNewWeekly?: boolean
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
 * Calcula a Divisão Competitiva a partir do Rating Elo
 */
export function calculateCompetitiveDivision(rating: number): CompetitiveDivision {
  if (rating >= 2500) return 'Lendário'
  if (rating >= 2200) return 'Mestre'
  if (rating >= 1900) return 'Diamante'
  if (rating >= 1600) return 'Platina'
  if (rating >= 1300) return 'Ouro'
  if (rating >= 1000) return 'Prata'
  return 'Bronze'
}

export const DIVISION_COLORS: Record<CompetitiveDivision, { bg: string; text: string; border: string; glow: string }> = {
  'Lendário': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]' },
  'Mestre': { bg: 'bg-purple-600/20', text: 'text-purple-300', border: 'border-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]' },
  'Diamante': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-400', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]' },
  'Platina': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]' },
  'Ouro': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' },
  'Prata': { bg: 'bg-slate-300/20', text: 'text-slate-200', border: 'border-slate-300', glow: 'shadow-[0_0_15px_rgba(203,213,225,0.4)]' },
  'Bronze': { bg: 'bg-amber-800/20', text: 'text-amber-600', border: 'border-amber-700', glow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]' },
}

/**
 * Normaliza os dados de qualquer documento de jogador humano (publicProfiles) para RankingPlayer
 */
export function mapDocToRankingPlayer(id: string, data: any): RankingPlayer {
  const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? Math.max(0, data.xp) : 0
  const levelInfo = calculateLevelProgress(xp)
  const level = levelInfo.currentLevel.level
  const rawName = (data.displayName || data.name || data.username || data.email?.split('@')[0] || '').trim()
  const displayName = rawName || 'Jogador'
  const district = (data.district || data.region || 'Portugal').trim()
  const photoURL = getAvatarImage(data.photoURL || data.avatar || data.avatarId || (data.equipped?.avatar) || null)
  const resolvedTitle = resolvePlayerEquippedTitle(data, xp)
  const title = resolvedTitle.cleanName || levelInfo.currentLevel.cleanTitle || 'Jogador Nacional'
  const equippedFrame = data.equippedFrame || data.equipped?.frameId || data.frameId || undefined

  const wins1v1 = typeof data.wins1v1 === 'number' ? data.wins1v1 : typeof data.wins === 'number' ? data.wins : typeof data.duelWins === 'number' ? data.duelWins : 0
  const losses1v1 = typeof data.losses1v1 === 'number' ? data.losses1v1 : typeof data.losses === 'number' ? data.losses : typeof data.duelLosses === 'number' ? data.duelLosses : 0
  const gamesPlayed = typeof data.gamesPlayed === 'number' ? data.gamesPlayed : (data.stats?.duelsTotal || (wins1v1 + losses1v1))
  const accuracyRate = typeof data.accuracyRate === 'number' ? data.accuracyRate : (data.stats?.accuracyRate || (xp > 0 ? 80 : 0))

  // Rating Elo calculado ou lido do perfil
  const rawRating = typeof data.rating === 'number' ? data.rating : typeof data.elo === 'number' ? data.elo : null
  const rating = rawRating ?? Math.max(500, Math.round(1000 + (wins1v1 * 25) - (losses1v1 * 15) + (xp / 100)))
  const division = calculateCompetitiveDivision(rating)
  const streak = typeof data.streak === 'number' ? data.streak : (wins1v1 > 0 ? Math.min(wins1v1, 5) : 0)

  // Movimento semanal determinístico (armazenado ou calculado a partir do histórico)
  const weeklyMovement = typeof data.weeklyMovement === 'number' ? data.weeklyMovement : (data.posVariation ?? (xp > 5000 ? 5 : xp > 1000 ? 2 : 0))
  const isNewWeekly = Boolean(data.isNew || data.isNewWeekly)
  const virtualMoney = typeof data.virtualMoney === 'number' ? data.virtualMoney : typeof data.coins === 'number' ? data.coins : (xp * 2)

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
    losses1v1,
    gamesPlayed,
    accuracyRate,
    rating,
    division,
    streak,
    weeklyMovement,
    isNewWeekly,
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
  mode: 'xp' | 'duelos' | 'rating' = 'xp',
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
    if (mode === 'duelos') {
      if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
      return (b.rating || 0) - (a.rating || 0)
    }
    if (mode === 'rating') {
      if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0)
      return (b.wins1v1 || 0) - (a.wins1v1 || 0)
    }
    if (b.xp !== a.xp) return b.xp - a.xp
    if ((b.accuracyRate || 0) !== (a.accuracyRate || 0)) return (b.accuracyRate || 0) - (a.accuracyRate || 0)
    return (b.wins1v1 || 0) - (a.wins1v1 || 0)
  })

  return list.slice(0, queryLimit).map((p, idx) => ({ ...p, pos: idx + 1 }))
}

/**
 * Subscrição em Tempo Real aos Rankings exclusivamente com Jogadores Humanos Reais (publicProfiles)
 */
export function subscribeRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' | 'rating' = 'xp',
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
      if (mode === 'duelos') {
        if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
        return (b.rating || 0) - (a.rating || 0)
      }
      if (mode === 'rating') {
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0)
        return (b.wins1v1 || 0) - (a.wins1v1 || 0)
      }
      if (b.xp !== a.xp) return b.xp - a.xp
      if ((b.accuracyRate || 0) !== (a.accuracyRate || 0)) return (b.accuracyRate || 0) - (a.accuracyRate || 0)
      return (b.wins1v1 || 0) - (a.wins1v1 || 0)
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
