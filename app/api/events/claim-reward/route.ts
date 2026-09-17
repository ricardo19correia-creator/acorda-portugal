import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  sortEventParticipants,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  type EventParticipant,
  type OfficialEventConfig,
} from '@/lib/events-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado. Token de sessão obrigatório.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const targetEventId = body.eventId || OFFICIAL_PORTUGAL_EM_JOGO_ID

    const db = getAdminFirestore()
    const eventDocRef = db.collection('events').doc(targetEventId)
    const eventSnap = await eventDocRef.get().catch(() => null)

    let eventData: OfficialEventConfig = eventSnap?.exists
      ? (eventSnap.data() as OfficialEventConfig)
      : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

    // Verificar se o evento já terminou
    const now = Date.now()
    const endStr = eventData.endDate || eventData.endAt || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.endDate
    const endMs = new Date(endStr).getTime()

    if (now < endMs) {
      return NextResponse.json(
        {
          error:
            'O evento ainda está a decorrer! As recompensas ficam disponíveis imediatamente após o encerramento oficial (30/09/2026 às 23:59).',
        },
        { status: 400 }
      )
    }

    const awardRef = eventDocRef.collection('rewards_awarded').doc(userId)
    const claimRef = eventDocRef.collection('rewards_claimed').doc(userId)
    const userRef = db.collection('users').doc(userId)

    const existingAward = await awardRef.get()
    const existingClaim = await claimRef.get()
    if (existingAward.exists || existingClaim.exists) {
      const cData = existingAward.exists ? existingAward.data() : existingClaim.data()
      return NextResponse.json(
        {
          error: `A tua recompensa (${Number(cData?.reward || cData?.amount || 0).toLocaleString('pt-PT')} Acordas) já foi atribuída anteriormente.`,
          alreadyClaimed: true,
          claimData: cData,
        },
        { status: 400 }
      )
    }

    // Obter todos os participantes reais
    const participantsSnap = await eventDocRef.collection('participants').get()
    const list: EventParticipant[] = []
    participantsSnap.forEach((d: any) => {
      const data = d.data() || {}
      list.push({
        userId: d.id,
        displayName: data.displayName || 'Jogador',
        photoURL: data.photoURL || null,
        district: data.district || 'Portugal',
        eventPoints: typeof data.eventPoints === 'number' ? data.eventPoints : 0,
        countedMatches: typeof data.countedMatches === 'number' ? data.countedMatches : 0,
        totalMatches: typeof data.totalMatches === 'number' ? data.totalMatches : 0,
        dailyMatches: data.dailyMatches || {},
        bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
      })
    })

    const sortedRankings = sortEventParticipants(list)
    const userRankIndex = sortedRankings.findIndex((p) => p.userId === userId)

    if (userRankIndex === -1) {
      return NextResponse.json(
        { error: 'Não participaste neste evento.' },
        { status: 400 }
      )
    }

    const position = userRankIndex + 1
    const matchedReward = (eventData.rewards || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.rewards).find(
      (r) => r.position === position
    )

    if (!matchedReward) {
      return NextResponse.json(
        {
          error: `A tua posição final foi #${position}. As recompensas oficiais são exclusivas para o Top 3 nacional.`,
          position,
        },
        { status: 400 }
      )
    }

    const rewardAmount = matchedReward.acordas

    await db.runTransaction(async (transaction: any) => {
      const checkA = await transaction.get(awardRef)
      const checkC = await transaction.get(claimRef)
      if (checkA.exists || checkC.exists) {
        throw new Error('Recompensa já atribuída a este participante.')
      }

      const uSnap = await transaction.get(userRef)
      if (!uSnap.exists) {
        throw new Error('Registo de utilizador não encontrado no sistema.')
      }

      transaction.update(userRef, {
        coins: FieldValue.increment(rewardAmount),
        euros: FieldValue.increment(rewardAmount),
        [`event_rewards.${targetEventId}`]: {
          position,
          amount: rewardAmount,
          claimedAt: FieldValue.serverTimestamp(),
          status: 'awarded',
        },
        updatedAt: FieldValue.serverTimestamp(),
      })

      const txRef = userRef.collection('transactions').doc()
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'event_reward',
        amount: rewardAmount,
        reason: `Recompensa Oficial de Evento: ${matchedReward.title} no ${eventData.name || 'Primeiro Desafio Nacional'}`,
        eventId: targetEventId,
        placement: position,
        createdAt: FieldValue.serverTimestamp(),
      })

      const awardPayload = {
        eventId: targetEventId,
        userId,
        placement: position,
        reward: rewardAmount,
        awardedAt: FieldValue.serverTimestamp(),
        status: 'awarded',
      }

      transaction.set(awardRef, awardPayload)
      transaction.set(claimRef, awardPayload)
    })

    return NextResponse.json({
      success: true,
      position,
      rewardAmount,
      medal: matchedReward.medal,
      message: `Parabéns! ${rewardAmount.toLocaleString('pt-PT')} Acordas virtuais creditadas com sucesso na tua conta.`,
    })
  } catch (error: any) {
    console.error('[API /api/events/claim-reward ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao resgatar recompensa do evento.' },
      { status: 500 }
    )
  }
}
