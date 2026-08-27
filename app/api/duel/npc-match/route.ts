import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { db as clientDb } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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
      return NextResponse.json({ error: 'Parâmetros inválidos (roomId e userId são obrigatórios).' }, { status: 400 })
    }

    let duelDocData: any = null
    let updateFn: ((data: Record<string, any>) => Promise<any>) | null = null

    // 1. Tentar Firestore Admin
    try {
      const adminDb = getAdminFirestore()
      const duelRef = adminDb.collection('duels').doc(roomId)
      const snap = await duelRef.get()
      if (snap.exists) {
        duelDocData = snap.data()
        updateFn = (payload) => duelRef.update(payload)
      }
    } catch (adminErr) {
      console.warn('[API /api/duel/npc-match] Admin Firestore indisponível, a usar SDK Client Firestore:', adminErr)
    }

    // 2. Fallback robusto para Client Firestore SDK
    if (!duelDocData) {
      try {
        const clientDocRef = doc(clientDb, 'duels', roomId)
        const snap = await getDoc(clientDocRef)
        if (snap.exists()) {
          duelDocData = snap.data()
          updateFn = (payload) => updateDoc(clientDocRef, payload)
        }
      } catch (clientErr) {
        console.error('[API /api/duel/npc-match] Erro ao ler sala no Firestore Client SDK:', clientErr)
      }
    }

    if (!duelDocData || !updateFn) {
      console.warn(`[API /api/duel/npc-match] Sala ${roomId} não encontrada em nenhum provider.`)
      return NextResponse.json({ error: 'Sala de duelo não encontrada.' }, { status: 404 })
    }

    const duel = duelDocData

    // Se já foi emparelhado anteriormente
    if (duel.status === 'matched' || duel.status === 'playing') {
      const opp = duel.playerB || duel.player2
      return NextResponse.json({
        success: true,
        matchId: roomId,
        opponent: opp || {
          uid: 'npc_opponent',
          displayName: 'Adversário',
          photoURL: '/images/avatars/camoes-2050.jpg',
          district: 'Lisboa',
          level: 1,
          xp: 2500,
          elo: 1000,
          playerType: 'npc',
          isNpc: true,
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
      xp: npc.xp,
      elo: npc.rating,
      rating: npc.rating,
      accuracy: npc.accuracyRange[0],
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

    await updateFn(updatePayload)
    console.log(`[API /api/duel/npc-match] Sala ${roomId} emparelhada com sucesso com NPC: ${npc.displayName} (Nv.${npc.level}, ${npc.xp} XP, ${npc.district})`)

    return NextResponse.json({
      success: true,
      matchId: roomId,
      opponent: {
        uid: npc.npcId,
        id: npc.npcId,
        displayName: npc.displayName,
        name: npc.displayName,
        username: npc.username,
        photoURL: npc.avatar,
        avatarUrl: npc.avatar,
        avatar: npc.avatar,
        district: npc.district,
        level: npc.level,
        xp: npc.xp,
        elo: npc.rating,
        rating: npc.rating,
        accuracy: npc.accuracyRange[0],
        playerType: 'npc',
        isNpc: true,
      },
    })
  } catch (error: any) {
    console.error('[/api/duel/npc-match ERROR]:', error)
    return NextResponse.json({ error: error?.message || 'Erro ao emparelhar com adversário.' }, { status: 500 })
  }
}
