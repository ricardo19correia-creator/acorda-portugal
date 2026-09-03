export interface SeasonReward {
  rankRange: string
  title: string
  badge: string
  coins: number
  exclusiveCosmetic: string
}

export interface SeasonData {
  id: string
  number: number
  name: string
  subtitle: string
  theme: string
  startDate: string
  endDate: string
  isActive: boolean
  totalPrizePoolCoins: number
  rewards: SeasonReward[]
}

export interface HallOfFameEntry {
  seasonId: string
  seasonName: string
  champion: {
    uid: string
    displayName: string
    photoURL?: string
    district: string
    finalXp: number
    title: string
    equippedFrame?: string
  }
  runnerUp: {
    uid: string
    displayName: string
    photoURL?: string
    district: string
    finalXp: number
  }
  thirdPlace: {
    uid: string
    displayName: string
    photoURL?: string
    district: string
    finalXp: number
  }
  winningDistrict: {
    name: string
    totalPower: number
    kingName: string
  }
  duelGrandMaster: {
    uid: string
    displayName: string
    rating: number
    district: string
  }
}

export const ACTIVE_SEASON_01: SeasonData = {
  id: 'season_01',
  number: 1,
  name: 'TEMPORADA 01',
  subtitle: 'CAMPEONATO NACIONAL DAS QUINAS',
  theme: 'A Ascensão dos Territórios',
  startDate: '2026-09-01T00:00:00Z',
  endDate: '2026-09-30T23:59:59Z', // Temporada de 30 dias com contador decrescente ativo
  isActive: true,
  totalPrizePoolCoins: 500000,
  rewards: [
    {
      rankRange: '🥇 1º Lugar Nacional',
      title: 'Campeão Supremo de Portugal',
      badge: '👑 LENDÁRIO',
      coins: 100000,
      exclusiveCosmetic: 'Moldura Mítica Sol Dourado & Título Exclusivo',
    },
    {
      rankRange: '🥈 2º e 🥉 3º Lugar',
      title: 'Vice-Campeão de Portugal',
      badge: '⭐ GRÃO-MESTRE',
      coins: 50000,
      exclusiveCosmetic: 'Moldura Lendária Coroa de Louros',
    },
    {
      rankRange: '🔥 Top 10 Nacional',
      title: 'Elite Nacional',
      badge: '💎 DIAMANTE',
      coins: 25000,
      exclusiveCosmetic: 'Moldura Épica Realeza Lusitana',
    },
    {
      rankRange: '🛡️ Top 100 Nacional',
      title: 'Guerreiro da Pátria',
      badge: '⚔️ PLATINA',
      coins: 10000,
      exclusiveCosmetic: 'Título Honorífico de Fundador de Época',
    },
    {
      rankRange: '👑 Rei de Cada Distrito',
      title: 'Soberano Territorial',
      badge: '📍 REI REGIONAL',
      coins: 15000,
      exclusiveCosmetic: 'Estandarte e Brasão Distrital Dourado',
    },
  ],
}

/**
 * Registos históricos do Hall of Fame (Arquivados com dados imutáveis de temporadas)
 */
export const HISTORICAL_HALL_OF_FAME: HallOfFameEntry[] = [
  {
    seasonId: 'season_00_beta',
    seasonName: 'TEMPORADA BETA: FUNDAÇÃO DA REPÚBLICA',
    champion: {
      uid: 'founder_001',
      displayName: 'Afonso Henriques',
      district: 'Guimarães',
      finalXp: 184500,
      title: 'O Conquistador Primaz',
      equippedFrame: 'frame_fogo_eterno',
    },
    runnerUp: {
      uid: 'founder_002',
      displayName: 'Nuno Álvares',
      district: 'Santarém',
      finalXp: 162300,
    },
    thirdPlace: {
      uid: 'founder_003',
      displayName: 'Infante Henrique',
      district: 'Porto',
      finalXp: 148900,
    },
    winningDistrict: {
      name: 'Braga',
      totalPower: 489000,
      kingName: 'Afonso Henriques',
    },
    duelGrandMaster: {
      uid: 'founder_001',
      displayName: 'Afonso Henriques',
      rating: 2450,
      district: 'Guimarães',
    },
  },
]

export function calculateTimeRemaining(endDateIso: string) {
  const target = new Date(endDateIso).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isFinished: diff === 0,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  }
}
