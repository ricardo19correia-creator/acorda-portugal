import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { getCompatibleNpcForDuel } from '@/lib/npc-system/npc-catalog'
import { simulateNpcDuelPerformance } from '@/lib/npc-system/npc-duel-engine'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { roomId, userId, level = 1, rating = 1000 } = body

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const duelRef = db.collection('duels').doc(roomId)
    const duelDoc = await duelRef.get()

    if (!duelDoc.exists) {
      return NextResponse.json({ error: 'Sala de duelo não encontrada.' }, { status: 404 })
    }

    const duel = duelDoc.data()
    if (!duel || duel.status !== 'waiting') {
      return NextResponse.json({ error: 'A sala já foi emparelhada ou cancelada.' }, { status: 409 })
    }

    // Selecionar NPC compatível com o jogador humano
    const npc = getCompatibleNpcForDuel(level, rating)
    const npcSimulation = simulateNpcDuelPerformance(npc, 10)

    const now = Date.now()

    const opponentData = {
      uid: npc.npcId,
      playerType: 'npc' as const,
      isNpc: true,
      displayName: npc.displayName,
      username: npc.username,
      photoURL: npc.avatar,
      district: npc.district,
      level: npc.level,
      score: 0,
      currentQuestionIndex: 0,
      answers: [],
      ready: true,
      lastHeartbeat: now,
      simulation: {
        totalScore: npcSimulation.totalScore,
        correctCount: npcSimulation.correctCount,
        totalTimeSeconds: npcSimulation.totalTimeSeconds,
        questionResults: npcSimulation.questionResults,
      },
    }

    // Atualizar a sala para estado 'matched'
    await duelRef.update({
      status: 'matched',
      player2: opponentData,
      matchedAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      success: true,
      opponent: {
        uid: npc.npcId,
        displayName: npc.displayName,
        photoURL: npc.avatar,
        district: npc.district,
        level: npc.level,
        playerType: 'npc',
        isNpc: true,
      },
    })
  } catch (error: any) {
    console.error('[/api/duel/npc-match ERROR]:', error)
    return NextResponse.json({ error: 'Erro ao emparelhar com adversário.' }, { status: 500 })
  }
}
