import { ALL_DISTRICTS_LIST, type RankingPlayer } from './rankings'
import { PORTUGAL_GEO_DATA } from './portugal-geo-data'

export interface DistrictWarTerritory {
  id: string
  name: string
  type: 'mainland' | 'island'
  pos: number
  power: number
  powerFormatted: string
  dominancePercentage: number
  activePlayers: number
  totalXp: number
  totalDuelWins: number
  totalGames: number
  trend: 'up' | 'down' | 'stable' | 'new'
  trendDelta: number
  king: {
    uid: string
    displayName: string
    photoURL?: string
    level: number
    xp: number
    title: string
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
  accentColor: string
  tacticalTag: string
  motto: string
}

export const DISTRICT_METADATA: Record<string, { tag: string; motto: string; color: string }> = {
  'Porto': { tag: 'SETOR NORTE // INVITA', motto: 'A Invicta Cidade e Berço de Campeões', color: '#06b6d4' },
  'Lisboa': { tag: 'SETOR CAPITAL // TEJO', motto: 'A Capital Imperial das Sete Colinas', color: '#f59e0b' },
  'Braga': { tag: 'SETOR MINHO // PRIMAZ', motto: 'Coração dos Arcebispos e Juventude Heroica', color: '#10b981' },
  'Aveiro': { tag: 'SETOR RIA // VENEZA', motto: 'Mestres da Ria e da Tradição Salgada', color: '#a855f7' },
  'Coimbra': { tag: 'SETOR MONDEGO // SAPIÊNCIA', motto: 'Cidade dos Estudantes e Eterna Tradição', color: '#3b82f6' },
  'Faro': { tag: 'SETOR SUL // ALGARVE', motto: 'Sol do Sul e Vanguarda do Litoral', color: '#ef4444' },
  'Vila Real': { tag: 'SETOR DOURO // TRANSMONTANO', motto: 'Força Transmontana e Terra Nobre', color: '#eab308' },
  'Açores': { tag: 'SETOR ATLÂNTICO // 9 ILHAS', motto: 'Nove Ilhas, Uma Só Alma Conquistadora', color: '#14b8a6' },
  'Madeira': { tag: 'SETOR PÉROLA // OCEANO', motto: 'A Pérola do Atlântico e Fortaleza Insular', color: '#06b6d4' },
  'Viana do Castelo': { tag: 'SETOR ALTO MINHO // ALMA', motto: 'Amor de Viana e Tradição dos Navegadores', color: '#6366f1' },
  'Bragança': { tag: 'SETOR NORDESTE // MONTES', motto: 'Baluarte Transmontano Além-Montes', color: '#f97316' },
  'Viseu': { tag: 'SETOR BEIRA // VIRIATO', motto: 'Terra de Viriato e Coragem Lendária', color: '#84cc16' },
  'Guarda': { tag: 'SETOR ESTRELA // ALTITUDE', motto: 'A Cidade Mais Alta e Fiel da Nação', color: '#ec4899' },
  'Castelo Branco': { tag: 'SETOR BEIRA BAIXA // RAIA', motto: 'Fronteira Histórica e Honra Raiana', color: '#0ea5e9' },
  'Leiria': { tag: 'SETOR PINHAL // CASTELO', motto: 'Pinhal Real e Batalhas Vitoriosas', color: '#d946ef' },
  'Santarém': { tag: 'SETOR RIBATEJO // CAMPINA', motto: 'Coração Ribatejano e Alma Campina', color: '#2dd4bf' },
  'Portalegre': { tag: 'SETOR ALTO ALENTEJO // SERRA', motto: 'Castelos Imponentes de São Mamede', color: '#facc15' },
  'Évora': { tag: 'SETOR PLANÍCIE // TEMPLO', motto: 'Património Nobre do Alentejo Dourado', color: '#f43f5e' },
  'Setúbal': { tag: 'SETOR SADO // ARRÁBIDA', motto: 'Baía Azul e Encostas da Arrábida', color: '#0284c7' },
  'Beja': { tag: 'SETOR BAIXO ALENTEJO // PLANÍCIE', motto: 'Planície sem Fim e Força do Trigo', color: '#fb923c' },
}

/**
 * Fórmula Server-Authoritative de Poder Territorial na Guerra dos Distritos:
 * Poder = (XP_Total * 0.6) + (Vitórias_1v1 * 150) + (Jogos_Totais * 25)
 */
export function calculateDistrictWarTerritories(players: RankingPlayer[]): DistrictWarTerritory[] {
  const districtMap = new Map<string, {
    totalXp: number
    totalDuelWins: number
    totalGames: number
    players: RankingPlayer[]
  }>()

  // Inicializar todos os 20 territórios oficiais
  for (const districtName of ALL_DISTRICTS_LIST) {
    districtMap.set(districtName, {
      totalXp: 0,
      totalDuelWins: 0,
      totalGames: 0,
      players: [],
    })
  }

  // Agregar utilizadores reais por distrito
  for (const player of players) {
    const rawDist = (player.district || player.region || '').trim()
    const matched = ALL_DISTRICTS_LIST.find((d) => d.toLowerCase() === rawDist.toLowerCase())
    if (matched) {
      const entry = districtMap.get(matched)!
      const pXp = typeof player.xp === 'number' && !isNaN(player.xp) ? player.xp : 0
      const pWins = typeof player.wins1v1 === 'number' && !isNaN(player.wins1v1) ? player.wins1v1 : 0
      const pGames = typeof player.gamesPlayed === 'number' && !isNaN(player.gamesPlayed) ? player.gamesPlayed : (pWins + 3)

      entry.totalXp += pXp
      entry.totalDuelWins += pWins
      entry.totalGames += pGames
      entry.players.push(player)
    }
  }

  // Calcular Pontuação de Poder de cada Distrito
  let nationalTotalPower = 0
  const territoriesData: Array<{
    name: string
    type: 'mainland' | 'island'
    power: number
    totalXp: number
    totalDuelWins: number
    totalGames: number
    activePlayers: number
    king: DistrictWarTerritory['king']
    topContributors: DistrictWarTerritory['topContributors']
    meta: { tag: string; motto: string; color: string }
  }> = []

  for (const [name, data] of districtMap.entries()) {
    // Ordenar jogadores do distrito por XP decrescente
    data.players.sort((a, b) => (b.xp || 0) - (a.xp || 0))

    const isIsland = name === 'Açores' || name === 'Madeira'
    const calculatedPower = Math.round(
      data.totalXp * 0.6 + data.totalDuelWins * 150 + data.totalGames * 25
    )

    nationalTotalPower += calculatedPower

    const kingPlayer = data.players[0] || null
    const king = kingPlayer ? {
      uid: kingPlayer.uid,
      displayName: kingPlayer.displayName,
      photoURL: kingPlayer.photoURL,
      level: kingPlayer.level,
      xp: kingPlayer.xp,
      title: kingPlayer.title || `Rei de ${name}`,
      equippedFrame: kingPlayer.equippedFrame,
    } : null

    const top5 = data.players.slice(0, 5).map((p) => ({
      uid: p.uid,
      displayName: p.displayName,
      photoURL: p.photoURL,
      level: p.level,
      xp: p.xp,
      equippedFrame: p.equippedFrame,
      contributionPercentage: data.totalXp > 0 ? Math.round((p.xp / data.totalXp) * 100) : 0,
    }))

    const meta = DISTRICT_METADATA[name] || {
      tag: `SETOR // ${name.toUpperCase()}`,
      motto: `Território Conquistador de ${name}`,
      color: '#06b6d4',
    }

    territoriesData.push({
      name,
      type: isIsland ? 'island' : 'mainland',
      power: calculatedPower,
      totalXp: data.totalXp,
      totalDuelWins: data.totalDuelWins,
      totalGames: data.totalGames,
      activePlayers: data.players.length,
      king,
      topContributors: top5,
      meta,
    })
  }

  // Ordenar territórios por Poder Territorial decrescente
  territoriesData.sort((a, b) => {
    if (b.power !== a.power) return b.power - a.power
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp
    if (b.activePlayers !== a.activePlayers) return b.activePlayers - a.activePlayers
    return a.name.localeCompare(b.name, 'pt-PT')
  })

  // Atribuir Posição, % de Domínio Nacional e Variação
  return territoriesData.map((t, idx) => {
    const pos = t.power > 0 ? idx + 1 : idx + 1
    const dominance = nationalTotalPower > 0 && t.power > 0
      ? Math.max(1, Math.round((t.power / nationalTotalPower) * 100))
      : 0

    const powerK = t.power >= 1000
      ? `${(t.power / 1000).toFixed(1)}K`
      : `${t.power}`

    // Variação determinística calculada a partir de posições relativas
    let trend: 'up' | 'down' | 'stable' | 'new' = 'stable'
    let trendDelta = 0
    if (pos <= 3) {
      trend = 'up'
      trendDelta = pos === 1 ? 2 : 1
    } else if (pos > 15 && t.power > 0) {
      trend = 'down'
      trendDelta = -1
    } else if (t.power > 0) {
      trend = 'stable'
      trendDelta = 0
    } else {
      trend = 'new'
      trendDelta = 0
    }

    return {
      id: `territory_${t.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: t.name,
      type: t.type,
      pos,
      power: t.power,
      powerFormatted: powerK,
      dominancePercentage: dominance,
      activePlayers: t.activePlayers,
      totalXp: t.totalXp,
      totalDuelWins: t.totalDuelWins,
      totalGames: t.totalGames,
      trend,
      trendDelta,
      king: t.king,
      topContributors: t.topContributors,
      accentColor: t.meta.color,
      tacticalTag: t.meta.tag,
      motto: t.meta.motto,
    }
  })
}
