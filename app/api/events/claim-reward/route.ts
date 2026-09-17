import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  sortEventParticipants,
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
    const requestedEventId = body.eventId

    const db = getAdminFirestore()

    let eventDoc: any = null
    if (requestedEventId && typeof requestedEventId === 'string') {
      const snap = await db.collection('events').doc(requestedEventId).get()
      if (snap.exists) eventDoc = snap
    }

    if (!eventDoc) {
      // Procurar eventos terminados na coleção
      const endedEventsSnap = await db.collection('events').where('status', '==', 'ended').limit(1).get()
      if (!endedEventsSnap.empty) {
        eventDoc = endedEventsSnap.docs[0]
      }
    }

    if (!eventDoc || !eventDoc.exists) {
      return NextResponse.json(
        { error: 'Nenhum evento com recompensas disponível no momento.' },
        { status: 404 }
      )
    }

    const eventData = eventDoc.data() as OfficialEventConfig
    const eventId = eventDoc.id

    // Verificar se o evento já terminou
    const now = Date.now()
    const endMs = eventData.endDate ? new Date(eventData.endDate).getTime() : 0
    if (endMs && now < endMs) {
      return NextResponse.json(
        { error: 'O evento ainda não terminou. As recompensas só ficam disponíveis após o término da competição.' },
        { status: 400 }
      )
    }

    const eventDocRef = db.collection('events').doc(eventId)
    const claimRef = eventDocRef.collection('rewards_claimed').doc(userId)
    const userRef = db.collection('users').doc(userId)

    const existingClaim = await claimRef.get()
    if (existingClaim.exists) {
      const cData = existingClaim.data() || {}
      return NextResponse.json(
        {
          error: `A sua recompensa (${cData.amount} Acordas) já foi atribuída anteriormente.`,
          alreadyClaimed: true,
          claimData: cData,
        },
        { status: 400 }
      )
    }

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
        { error: 'Não participou no evento.' },
        { status: 400 }
      )
    }

    const position = userRankIndex + 1
    const matchedReward = (eventData.rewards || []).find((r) => r.position === position)

    if (!matchedReward) {
      return NextResponse.json(
        {
          error: `A sua posição final foi #${position}. Não há recompensa para esta posição.`,
          position,
        },
        { status: 400 }
      )
    }

    const rewardAmount = matchedReward.acordas

    await db.runTransaction(async (transaction: any) => {
      const doubleCheckSnap = await transaction.get(claimRef)
      if (doubleCheckSnap.exists) {
        throw new Error('Recompensa já resgatada por este utilizador.')
      }

      const uSnap = await transaction.get(userRef)
      if (!uSnap.exists) {
        throw new Error('Registo de utilizador não encontrado.')
      }

      transaction.update(userRef, {
        coins: FieldValue.increment(rewardAmount),
        euros: FieldValue.increment(rewardAmount),
        [`event_rewards.${eventId}`]: {
          position,
          amount: rewardAmount,
          claimedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      })

      const txRef = userRef.collection('transactions').doc()
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'event_reward',
        amount: rewardAmount,
        reason: `Recompensa de Evento: ${matchedReward.title} no ${eventData.title || 'Evento Oficial'}`,
        createdAt: FieldValue.serverTimestamp(),
      })

      transaction.set(claimRef, {
        userId,
        position,
        amount: rewardAmount,
        claimedAt: FieldValue.serverTimestamp(),
      })
    })

    return NextResponse.json({
      success: true,
      position,
      rewardAmount,
      medal: matchedReward.medal,
      message: `Parabéns! ${rewardAmount.toLocaleString('pt-PT')} Acordas creditadas com sucesso na tua conta.`,
    })
  } catch (error: any) {
    console.error('[API EVENT CLAIM REWARD ERROR]', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao resgatar recompensa do evento.' },
      { status: 500 }
    )
  }
}
