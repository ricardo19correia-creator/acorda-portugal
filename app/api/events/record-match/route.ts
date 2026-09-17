import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  calculateEventPoints,
  getLisbonDateString,
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
    const {
      matchId,
      score = 0,
      correctAnswers = 0,
      totalQuestions = 0,
      isAbandoned = false,
    } = body

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId inválido.' }, { status: 400 })
    }

    // Validação: partidas abandonadas ou inválidas não geram pontos de evento
    if (isAbandoned === true || totalQuestions < 3 || score < 0) {
      return NextResponse.json({
        success: false,
        message: 'Partida não elegível para pontos de evento.',
        eventPointsAdded: 0,
      })
    }

    const db = getAdminFirestore()

    // Consulta por evento ativo real na coleção Firestore
    const activeEventsSnap = await db
      .collection('events')
      .where('active', '==', true)
      .limit(1)
      .get()

    if (activeEventsSnap.empty) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum evento ativo no momento.',
        eventPointsAdded: 0,
      })
    }

    const activeEventDoc = activeEventsSnap.docs[0]
    const activeEvent = activeEventDoc.data() as OfficialEventConfig
    const eventId = activeEventDoc.id

    // Verificar se as datas do evento estão no período ativo
    const now = Date.now()
    const startMs = activeEvent.startDate ? new Date(activeEvent.startDate).getTime() : 0
    const endMs = activeEvent.endDate ? new Date(activeEvent.endDate).getTime() : 0

    if ((startMs && now < startMs) || (endMs && now > endMs)) {
      return NextResponse.json({
        success: false,
        message: 'O evento não está no período ativo.',
        eventPointsAdded: 0,
      })
    }

    const maxDailyMatches = activeEvent.rules?.maxDailyMatches || 10
    const pointDivisor = activeEvent.rules?.pointDivisor || 10
    const todayDateStr = getLisbonDateString()
    const potentialEventPoints = calculateEventPoints(score, pointDivisor)

    const eventDocRef = db.collection('events').doc(eventId)
    const matchRef = eventDocRef.collection('matches').doc(matchId)
    const participantRef = eventDocRef.collection('participants').doc(userId)
    const userRef = db.collection('users').doc(userId)

    const result = await db.runTransaction(async (transaction: any) => {
      const matchSnap = await transaction.get(matchRef)
      if (matchSnap.exists) {
        const mData = matchSnap.data() || {}
        return {
          alreadyProcessed: true,
          eventPointsAdded: mData.eventPoints || 0,
          dailyLimitReached: Boolean(mData.dailyCapReached),
          message: 'Partida já registada anteriormente.',
        }
      }

      const [pSnap, uSnap] = await Promise.all([
        transaction.get(participantRef),
        transaction.get(userRef),
      ])

      const pData = pSnap.exists ? pSnap.data() : {}
      const uData = uSnap.exists ? uSnap.data() : {}

      const dailyMatches = pData.dailyMatches || {}
      const todayCount = Number(dailyMatches[todayDateStr] || 0)

      if (todayCount >= maxDailyMatches) {
        transaction.set(matchRef, {
          id: matchId,
          userId,
          score,
          correctAnswers,
          totalQuestions,
          eventPoints: 0,
          date: todayDateStr,
          dailyCapReached: true,
          createdAt: FieldValue.serverTimestamp(),
        })

        return {
          alreadyProcessed: false,
          eventPointsAdded: 0,
          dailyLimitReached: true,
          message: `Limite diário de ${maxDailyMatches} partidas atingido hoje.`,
        }
      }

      const newDailyCount = todayCount + 1
      const currentEventPoints = Number(pData.eventPoints || 0)
      const newEventPoints = currentEventPoints + potentialEventPoints
      const totalMatches = Number(pData.totalMatches || 0) + 1
      const totalScore = Number(pData.totalScore || 0) + score
      const bestScore = Math.max(Number(pData.bestScore || 0), score)

      const displayName =
        pData.displayName ||
        uData.displayName ||
        uData.username ||
        uData.email?.split('@')[0] ||
        'Jogador'
      const photoURL = pData.photoURL ?? uData.photoURL ?? null
      const district = pData.district || uData.district || 'Portugal'

      transaction.set(
        matchRef,
        {
          id: matchId,
          userId,
          score,
          correctAnswers,
          totalQuestions,
          eventPoints: potentialEventPoints,
          date: todayDateStr,
          dailyCapReached: false,
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      transaction.set(
        participantRef,
        {
          userId,
          displayName,
          photoURL,
          district,
          eventPoints: newEventPoints,
          totalMatches,
          totalScore,
          bestScore,
          dailyMatches: {
            ...dailyMatches,
            [todayDateStr]: newDailyCount,
          },
          lastPlayedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      return {
        alreadyProcessed: false,
        eventPointsAdded: potentialEventPoints,
        newEventPoints,
        dailyMatchesToday: newDailyCount,
        dailyLimitReached: newDailyCount >= maxDailyMatches,
        message: `+${potentialEventPoints} Pontos de Evento creditados com sucesso!`,
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('[API /api/events/record-match] Erro ao processar:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao registar partida no evento.' },
      { status: 500 }
    )
  }
}
