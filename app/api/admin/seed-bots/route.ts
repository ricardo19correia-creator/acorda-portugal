import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { NPC_CATALOG, OFFICIAL_20_DISTRICTS } from '@/lib/npc-system/npc-catalog'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const db = getAdminFirestore()
    const batch = db.batch()

    const districtStats: Record<string, { count: number; totalXp: number }> = {}
    OFFICIAL_20_DISTRICTS.forEach((d) => {
      districtStats[d] = { count: 0, totalXp: 0 }
    })

    NPC_CATALOG.forEach((npc) => {
      const docRef = db.collection('botPlayers').doc(npc.npcId)
      
      const payload = {
        id: npc.npcId,
        uid: npc.npcId,
        npcId: npc.npcId,
        displayName: npc.displayName,
        name: npc.displayName,
        username: npc.username,
        avatar: npc.avatar,
        photoURL: npc.avatar,
        district: npc.district,
        region: npc.district,
        level: npc.level,
        xp: npc.xp,
        elo: npc.elo || npc.rating,
        rating: npc.rating,
        wins: npc.wins,
        wins1v1: npc.wins,
        losses: npc.losses,
        gamesPlayed: npc.wins + npc.losses,
        accuracyRate: npc.stats.accuracyRate,
        difficulty: npc.difficulty,
        personality: npc.personality,
        title: npc.title,
        equippedTitle: npc.title,
        equippedFrame: npc.equippedFrame || null,
        virtualMoney: npc.virtualMoney,
        isNpc: true,
        playerType: 'npc',
        updatedAt: new Date().toISOString(),
      }

      batch.set(docRef, payload, { merge: true })

      if (districtStats[npc.district]) {
        districtStats[npc.district].count += 1
        districtStats[npc.district].totalXp += npc.xp
      }
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `100 bots sincronizados com sucesso na coleção botPlayers do Firestore.`,
      totalBots: NPC_CATALOG.length,
      districtsCount: OFFICIAL_20_DISTRICTS.length,
      districtBreakdown: districtStats,
    })
  } catch (error: any) {
    console.error('[SEED BOTS API ERROR]:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao sincronizar bots no Firestore',
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
