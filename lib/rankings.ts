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
 * Obter Top Geral ou por Distrito (Consulta One-Shot dos Utilizadores Reais)
 */
export async function fetchRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  queryLimit: number = 50
): Promise<RankingPlayer[]> {
  try {
    const pubRef = collection(db, 'publicProfiles')
    const pubSnap = await getDocs(query(pubRef, limit(200)))

    const list: RankingPlayer[] = []

    pubSnap.docs.forEach((d) => {
      const p = mapDocToRankingPlayer(d.id, d.data())
      if (districtFilter === 'all' || p.district.toLowerCase() === districtFilter.toLowerCase()) {
        list.push(p)
      }
    })

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
 * Subscrição em Tempo Real aos Rankings dos Jogadores Reais no Firestore
 */
export function subscribeRankings(
  districtFilter: string = 'all',
  mode: 'xp' | 'duelos' = 'xp',
  callback: (players: RankingPlayer[]) => void,
  queryLimit: number = 50
): () => void {
  try {
    const pubRef = collection(db, 'publicProfiles')

    const unsubPub = onSnapshot(
      query(pubRef, limit(200)),
      (snapshot) => {
        const list: RankingPlayer[] = []
        snapshot.docs.forEach((doc) => {
          const p = mapDocToRankingPlayer(doc.id, doc.data())
          if (districtFilter === 'all' || p.district.toLowerCase() === districtFilter.toLowerCase()) {
            list.push(p)
          }
        })

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
      },
      (err) => console.warn('[RANKINGS] pub listener notice:', err)
    )

    return () => {
      unsubPub()
    }
  } catch (e) {
    console.warn('[RANKINGS] Erro ao iniciar subscrição:', e)
    return () => {}
  }
}
