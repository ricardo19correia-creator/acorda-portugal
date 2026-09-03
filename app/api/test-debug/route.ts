import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const info: any = {
    step: 'start',
  }
  try {
    info.step = 'importing_firebase_admin'
    const admin = await import('@/lib/firebase-admin')
    info.hasAdminCredentials = admin.hasAdminCredentials()
    info.step = 'testing_rankings_import'
    const rankings = await import('@/lib/rankings')
    info.districtsCount = rankings.ALL_DISTRICTS_LIST.length
    info.step = 'testing_seasons_import'
    const seasons = await import('@/lib/seasons')
    info.seasonName = seasons.ACTIVE_SEASON_01.name
    info.step = 'testing_district_war_import'
    const war = await import('@/lib/district-war')
    info.metadataCount = Object.keys(war.DISTRICT_METADATA).length

    if (info.hasAdminCredentials) {
      info.step = 'getting_firestore'
      const db = admin.getAdminFirestore()
      info.step = 'querying_firestore'
      const snap = await db.collection('publicProfiles').limit(1).get()
      info.firestoreDocCount = snap.size
    }

    return NextResponse.json({
      ok: true,
      info,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        step: info.step,
        error: err?.message || String(err),
        stack: err?.stack || null,
      },
      { status: 200 } // Retornar 200 para capturar o erro em JSON
    )
  }
}
