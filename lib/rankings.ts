import { collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { calculateLevelProgress } from '@/lib/progression'
import { getAvatarImage } from '@/lib/avatars'

export interface RankingPlayer {
  uid: string
  displayName: string
  photoURL?: string
  district: string
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
 * Normaliza os dados do documento para o formato RankingPlayer
 */
export function mapDocToRankingPlayer(id: string, data: any): RankingPlayer {
  const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? data.xp : 0
  const level = typeof data.level === 'number' ? data.level : calculateLevelProgress(xp).currentLevel.level
  const rawName = (data.displayName || data.name || data.username || data.email?.split('@')[0] || '').trim()
  const displayName = rawName || 'Jogador'
  const district = data.district || 'Portugal'
  const photoURL = getAvatarImage(data.photoURL || data.avatar || data.avatarId || (data.equipped?.avatar) || null)
  const title = data.equippedTitle || data.title || data.equipped?.title || 'Jogador Nacional'
  const equippedFrame = data.equippedFrame || data.equipped?.frameId || data.frameId || undefined
  const wins1v1 = typeof data.wins1v1 === 'number' ? data.wins1v1 : typeof data.wins === 'number' ? data.wins : typeof data.duelWins === 'number' ? data.duelWins : 0
  const gamesPlayed = typeof data.gamesPlayed === 'number' ? data.gamesPlayed : (data.stats?.duelsTotal || 0)
  const accuracyRate = typeof data.accuracyRate === 'number' ? data.accuracyRate : (data.stats?.accuracyRate || 0)

  return {
    uid: id,
    displayName,
    photoURL,
    district,
    xp,
    level,
    title,
    equippedTitle: title,
    equippedFrame,
    isFounder: Boolean(data.isFounder),
    wins1v1,
    gamesPlayed,
    accuracyRate,
  }
}

/**
 * Obter Top Geral ou por Distrito (Consulta One-Shot)
 */
export async function fetchRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  queryLimit: number = 50
): Promise<RankingPlayer[]> {
  try {
    const sortField = mode === 'duelos' ? 'wins1v1' : 'xp'
    const usersRef = collection(db, 'users')

    let q
    if (districtFilter === 'all') {
      q = query(usersRef, orderBy(sortField, 'desc'), limit(queryLimit))
    } else {
      q = query(
        usersRef,
        where('district', '==', districtFilter),
        orderBy(sortField, 'desc'),
        limit(queryLimit)
      )
    }

    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      return snapshot.docs.map((doc, idx) => ({
        ...mapDocToRankingPlayer(doc.id, doc.data()),
        pos: idx + 1,
      }))
    }

    // Fallback para publicProfiles caso a coleção users ainda não tenha o índice composto criado
    const pubRef = collection(db, 'publicProfiles')
    let pubQuery
    if (districtFilter === 'all') {
      pubQuery = query(pubRef, orderBy(sortField, 'desc'), limit(queryLimit))
    } else {
      pubQuery = query(pubRef, where('district', '==', districtFilter), limit(queryLimit))
    }

    const pubSnap = await getDocs(pubQuery)
    const list = pubSnap.docs.map((d) => mapDocToRankingPlayer(d.id, d.data()))
    list.sort((a, b) => {
      const valA = mode === 'duelos' ? (a.wins1v1 || 0) : a.xp
      const valB = mode === 'duelos' ? (b.wins1v1 || 0) : b.xp
      return valB - valA
    })
    return list.slice(0, queryLimit).map((p, idx) => ({ ...p, pos: idx + 1 }))
  } catch (error) {
    console.warn('[RANKINGS] Erro ao carregar rankings do Firestore:', error)
    return []
  }
}

/**
 * Subscrição em Tempo Real aos Rankings do Firestore
 */
export function subscribeRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  callback: (players: RankingPlayer[]) => void,
  queryLimit: number = 50
): () => void {
  try {
    const pubRef = collection(db, 'publicProfiles')
    const q = query(pubRef, limit(200))

    return onSnapshot(q, (snapshot) => {
      const players: RankingPlayer[] = []
      snapshot.forEach((doc) => {
        const player = mapDocToRankingPlayer(doc.id, doc.data())
        if (districtFilter === 'all' || player.district.toLowerCase() === districtFilter.toLowerCase()) {
          players.push(player)
        }
      })

      // Ordenar pelo modo selecionado (xp ou vitórias em duelos 1v1)
      players.sort((a, b) => {
        const valA = mode === 'duelos' ? (a.wins1v1 || 0) : a.xp
        const valB = mode === 'duelos' ? (b.wins1v1 || 0) : b.xp
        return valB - valA
      })

      const ranked = players.slice(0, queryLimit).map((p, idx) => ({
        ...p,
        pos: idx + 1,
      }))

      callback(ranked)
    }, (err) => {
      console.warn('[RANKINGS] Listener snapshot error:', err)
    })
  } catch (e) {
    console.warn('[RANKINGS] Erro ao iniciar subscrição:', e)
    return () => {}
  }
}
