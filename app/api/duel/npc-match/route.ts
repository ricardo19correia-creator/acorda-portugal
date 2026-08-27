import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { getCompatibleNpcForDuel } from '@/lib/npc-system/npc-catalog'
import { simulateNpcDuelPerformance } from '@/lib/npc-system/npc-duel-engine'

export const dynamic = 'force-dynamic'

const QUESTION_TIME_MS = 60_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { roomId, userId, level = 1, rating = 1000 } = body

    console.log(`[API /api/duel/npc-match] Pedido recebido para roomId=${roomId}, userId=${userId}`)

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const duelRef = db.collection('duels').doc(roomId)
    const duelDoc = await duelRef.get()

    if (!duelDoc.exists) {
      console.warn(`[API /api/duel/npc-match] Sala ${roomId} não existe no Firestore.`)
      return NextResponse.json({ error: 'Sala de duelo não encontrada.' }, { status: 404 })
    }

    const duel = duelDoc.data()
    if (!duel) {
      return NextResponse.json({ error: 'Dados da sala inválidos.' }, { status: 404 })
    }

    // Se já foi emparelhado anteriormente
    if (duel.status === 'matched' || duel.status === 'playing') {
      const opp = duel.playerB || duel.player2
      return NextResponse.json({
        success: true,
        matchId: roomId,
        opponent: opp || {
          uid: 'npc_opponent',
          displayName: 'Adversário',
          photoURL: null,
          district: 'Portugal',
          level: 1,
        },
      })
    }

    if (duel.status !== 'waiting') {
      return NextResponse.json({ error: 'A sala não está em espera de adversário.' }, { status: 409 })
    }

    // Selecionar NPC compatível com o jogador humano
    const npc = getCompatibleNpcForDuel(level, rating)
    const questionsCount = duel.questions?.length || 10
    const npcSimulation = simulateNpcDuelPerformance(npc, questionsCount)

    const now = Date.now()
    const startedAt = now + 3500
    const firstDeadline = startedAt + QUESTION_TIME_MS

    const opponentData = {
      uid: npc.npcId,
      playerType: 'npc' as const,
      isNpc: true,
      displayName: npc.displayName,
      username: npc.username,
      photoURL: npc.avatar,
      avatarUrl: npc.avatar,
      avatar: npc.avatar,
      district: npc.district,
      level: npc.level,
      score: 0,
      correctCount: 0,
      currentQuestionIndex: 0,
      questionStartedAt: startedAt,
      questionDeadline: firstDeadline,
      answers: [],
      finished: false,
      finishedAt: null,
      ready: true,
      lastHeartbeat: now,
      simulation: {
        totalScore: npcSimulation.totalScore,
        correctCount: npcSimulation.correctCount,
        totalTimeSeconds: npcSimulation.totalTimeSeconds,
        questionResults: npcSimulation.questionResults,
      },
    }

    // Atualizar atomicamente a sala de duelo
    const hostUid = duel.playerA?.uid || userId
    const updatePayload: Record<string, any> = {
      status: 'matched',
      playerB: opponentData,
      player2: opponentData,
      playerUids: [hostUid, npc.npcId],
      startedAt,
      'playerA.questionStartedAt': startedAt,
      'playerA.questionDeadline': firstDeadline,
      matchedAt: now,
      updatedAt: now,
    }

    await duelRef.update(updatePayload)
    console.log(`[API /api/duel/npc-match] Sala ${roomId} emparelhada com sucesso com NPC: ${npc.displayName}`)

    return NextResponse.json({
      success: true,
      matchId: roomId,
      opponent: {
        uid: npc.npcId,
        displayName: npc.displayName,
        photoURL: npc.avatar,
        avatarUrl: npc.avatar,
        avatar: npc.avatar,
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
