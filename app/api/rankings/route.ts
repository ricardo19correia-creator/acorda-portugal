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
export const revalidate = 0

function generateRequestId(): string {
  return `req_rank_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * GET /api/rankings — API Server-Authoritative de Classificações, Duelos e Guerra dos Distritos
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()

  try {
    const { searchParams } = new URL(req.url)

    const mode = (searchParams.get('mode') || 'nacional').toLowerCase()
    const districtParam = searchParams.get('district') || 'all'
    const timeframe = (searchParams.get('timeframe') || 'all').toLowerCase()
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const limitParam = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50))
    const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)

    let rawPlayers: RankingPlayer[] = []

    if (hasAdminCredentials()) {
      try {
        const db = getAdminFirestore()
        const pubSnap = await db.collection('publicProfiles').limit(300).get()

        if (pubSnap && !pubSnap.empty) {
          pubSnap.docs.forEach((d) => {
            const p = mapDocToRankingPlayer(d.id, d.data())
            rawPlayers.push(p)
          })
        }
      } catch (dbErr) {
        console.warn('[RANKINGS_API_DB_FETCH_WARN]', dbErr)
      }
    }

    // Filtragem de Distrito
    let filteredPlayers = [...rawPlayers]
    if (districtParam !== 'all') {
      filteredPlayers = filteredPlayers.filter(
        (p) => (p.district || p.region || '').toLowerCase() === districtParam.toLowerCase()
      )
    }

    // Filtro de Pesquisa
    if (search.length > 0) {
      filteredPlayers = filteredPlayers.filter(
        (p) =>
          (p.displayName && p.displayName.toLowerCase().includes(search)) ||
          (p.title && p.title.toLowerCase().includes(search)) ||
          (p.district && p.district.toLowerCase().includes(search))
      )
    }

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

    // Ordenação Canónica
    if (mode === 'duelos') {
      filteredPlayers.sort((a, b) => {
        const winsA = typeof a.wins1v1 === 'number' ? a.wins1v1 : 0
        const winsB = typeof b.wins1v1 === 'number' ? b.wins1v1 : 0
        if (winsB !== winsA) return winsB - winsA

        const ratA = typeof a.rating === 'number' ? a.rating : 0
        const ratB = typeof b.rating === 'number' ? b.rating : 0
        if (ratB !== ratA) return ratB - ratA

        const accA = typeof a.accuracyRate === 'number' ? a.accuracyRate : 0
        const accB = typeof b.accuracyRate === 'number' ? b.accuracyRate : 0
        return accB - accA
      })
    } else {
      // Nacional / Distrital (Ordenado por XP Total)
      filteredPlayers.sort((a, b) => {
        const xpA = typeof a.xp === 'number' ? a.xp : 0
        const xpB = typeof b.xp === 'number' ? b.xp : 0
        if (xpB !== xpA) return xpB - xpA

        const accA = typeof a.accuracyRate === 'number' ? a.accuracyRate : 0
        const accB = typeof b.accuracyRate === 'number' ? b.accuracyRate : 0
        if (accB !== accA) return accB - accA

        const winsA = typeof a.wins1v1 === 'number' ? a.wins1v1 : 0
        const winsB = typeof b.wins1v1 === 'number' ? b.wins1v1 : 0
        return winsB - winsA
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

    // Agregação distrital
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
