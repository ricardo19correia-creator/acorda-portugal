import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, hasAdminCredentials } from '@/lib/firebase-admin'
import {
  ALL_DISTRICTS_LIST,
  mapDocToRankingPlayer,
  computeDistrictStats,
  type RankingPlayer,
} from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { ACTIVE_SEASON_01, HISTORICAL_HALL_OF_FAME } from '@/lib/seasons'

export const dynamic = 'force-dynamic'

function generateRequestId(): string {
  return `req_rank_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * GET /api/rankings — API Server-Authoritative de Classificações, Duelos e Guerra dos Distritos
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  const { searchParams } = new URL(req.url)

  const mode = (searchParams.get('mode') || 'nacional').toLowerCase()
  const districtParam = searchParams.get('district') || 'all'
  const timeframe = (searchParams.get('timeframe') || 'all').toLowerCase()
  const search = (searchParams.get('search') || '').trim().toLowerCase()
  const limitParam = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

  try {
    let rawPlayers: RankingPlayer[] = []

    if (hasAdminCredentials()) {
      const db = getAdminFirestore()
      const pubSnap = await db.collection('publicProfiles').limit(300).get().catch(() => null)

      if (pubSnap && !pubSnap.empty) {
        pubSnap.docs.forEach((d) => {
          rawPlayers.push(mapDocToRankingPlayer(d.id, d.data()))
        })
      }
    }

    // Se a coleção estiver a ser populada, assegurar que a lista é processada com segurança
    let filteredPlayers = [...rawPlayers]

    // 1. Filtro de Distrito
    if (districtParam !== 'all') {
      filteredPlayers = filteredPlayers.filter(
        (p) => (p.district || p.region || '').toLowerCase() === districtParam.toLowerCase()
      )
    }

    // 2. Filtro de Pesquisa (sem expor campos confidenciais)
    if (search.length > 0) {
      filteredPlayers = filteredPlayers.filter((p) =>
        p.displayName.toLowerCase().includes(search) ||
        (p.title && p.title.toLowerCase().includes(search)) ||
        (p.district && p.district.toLowerCase().includes(search))
      )
    }

    // 3. Modos Específicos

    // Modo: Guerra dos Distritos
    if (mode === 'guerra' || mode === 'district-war') {
      const territories = calculateDistrictWarTerritories(rawPlayers)
      return NextResponse.json({
        ok: true,
        success: true,
        mode: 'guerra',
        totalTerritories: territories.length,
        territories,
        requestId,
        timestamp: new Date().toISOString(),
      })
    }

    // Modo: Temporada
    if (mode === 'temporada' || mode === 'season') {
      return NextResponse.json({
        ok: true,
        success: true,
        mode: 'temporada',
        season: ACTIVE_SEASON_01,
        timeRemaining: ACTIVE_SEASON_01.endDate,
        requestId,
        timestamp: new Date().toISOString(),
      })
    }

    // Modo: Hall of Fame
    if (mode === 'hall-of-fame' || mode === 'hof') {
      return NextResponse.json({
        ok: true,
        success: true,
        mode: 'hall-of-fame',
        hallOfFame: HISTORICAL_HALL_OF_FAME,
        requestId,
        timestamp: new Date().toISOString(),
      })
    }

    // Modo: Subidas da Semana
    if (mode === 'subidas' || mode === 'movers') {
      const movers = [...rawPlayers]
        .filter((p) => (p.weeklyMovement || 0) > 0 || p.isNewWeekly)
        .sort((a, b) => (b.weeklyMovement || 0) - (a.weeklyMovement || 0))
        .slice(0, 10)
        .map((p, idx) => ({
          pos: idx + 1,
          uid: p.uid,
          displayName: p.displayName,
          photoURL: p.photoURL,
          district: p.district,
          level: p.level,
          xp: p.xp,
          weeklyMovement: p.weeklyMovement || 1,
          isNewWeekly: p.isNewWeekly,
          equippedFrame: p.equippedFrame,
        }))

      return NextResponse.json({
        ok: true,
        success: true,
        mode: 'subidas',
        movers,
        requestId,
        timestamp: new Date().toISOString(),
      })
    }

    // Modos de Tabela: Nacional, Distrito, Duelos
    if (mode === 'duelos') {
      filteredPlayers.sort((a, b) => {
        if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0)
        return (b.accuracyRate || 0) - (a.accuracyRate || 0)
      })
    } else {
      // Nacional / Distrital (Ordenado por XP Total e Precisão)
      filteredPlayers.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp
        if ((b.accuracyRate || 0) !== (a.accuracyRate || 0)) return (b.accuracyRate || 0) - (a.accuracyRate || 0)
        return (b.wins1v1 || 0) - (a.wins1v1 || 0)
      })
    }

    // Atribuir posição global do ranking
    const rankedList = filteredPlayers.map((p, idx) => ({
      ...p,
      pos: idx + 1,
    }))

    // Paginação
    const startIndex = (pageParam - 1) * limitParam
    const pagedPlayers = rankedList.slice(startIndex, startIndex + limitParam)
    const totalPlayers = rankedList.length
    const totalPages = Math.max(1, Math.ceil(totalPlayers / limitParam))

    // Top 3 do ranking
    const top3 = rankedList.slice(0, 3)

    // Agregação de estatísticas distritais para o mapa tático
    const districtStats = computeDistrictStats(rawPlayers)
    const districtStatsArray = Array.from(districtStats.values())

    return NextResponse.json({
      ok: true,
      success: true,
      mode,
      district: districtParam,
      timeframe,
      pagination: {
        page: pageParam,
        limit: limitParam,
        totalPlayers,
        totalPages,
        hasNextPage: pageParam < totalPages,
        hasPrevPage: pageParam > 1,
      },
      top3,
      players: pagedPlayers,
      districtStats: districtStatsArray,
      season: {
        id: ACTIVE_SEASON_01.id,
        name: ACTIVE_SEASON_01.name,
        endDate: ACTIVE_SEASON_01.endDate,
      },
      requestId,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[API_RANKINGS_ERROR]', err)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: {
          code: 'RANKINGS_FETCH_FAILED',
          message: err?.message || 'Erro ao consultar classificações oficiais.',
        },
        requestId,
      },
      { status: 500 }
    )
  }
}
