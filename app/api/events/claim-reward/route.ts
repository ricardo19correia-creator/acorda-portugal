import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  sortEventParticipants,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
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
    const targetEventId = body.eventId || OFFICIAL_PORTO_LISBOA_ID

    const baseEvent =
      targetEventId === OFFICIAL_PORTO_LISBOA_ID
        ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
        : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

    const db = getAdminFirestore()
    const eventDocRef = db.collection('events').doc(targetEventId)
    const eventSnap = await eventDocRef.get().catch(() => null)

    let eventData: OfficialEventConfig = eventSnap?.exists
      ? (eventSnap.data() as OfficialEventConfig)
      : baseEvent

    // Verificar se o evento já terminou
    const now = Date.now()
    const endStr = eventData.endDate || eventData.endAt || baseEvent.endDate
    const endMs = new Date(endStr).getTime()

    if (now < endMs) {
      return NextResponse.json(
        {
          error:
            `O evento ainda está a decorrer! As recompensas ficam disponíveis imediatamente após o encerramento oficial (${endStr}).`,
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
    const userMatches = list[userRankIndex]?.countedMatches || list[userRankIndex]?.totalMatches || 0

    // Determinação de recompensa oficial (Top 3 ou Desafiante de Participação)
    let matchedReward = (eventData.rewards || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.rewards).find(
      (r) => r.position === position
    )

    // Se for o Grande Duelo e o utilizador tiver completado pelo menos 5 partidas, qualifica-se para prémio de participação
    if (!matchedReward && targetEventId === OFFICIAL_PORTO_LISBOA_ID && userMatches >= 5) {
      matchedReward = {
        position,
        title: 'Desafiante do Grande Duelo',
        acordas: 500,
        medal: '⚔️',
        label: '500 Acordas + Título + Badge',
      }
    }

    if (!matchedReward) {
      return NextResponse.json(
        {
          error: `A tua posição final foi #${position} (${userMatches} partidas). As recompensas do Grande Duelo são exclusivas para o Top 3 nacional ou desafiantes com pelo menos 5 partidas concluídas.`,
          position,
        },
        { status: 400 }
      )
    }

    const rewardAmount = matchedReward.acordas

    // Determinar Título, Badge, Troféu e XP exclusivos para o Grande Duelo
    let titleId: string | null = null
    let titleName: string | null = null
    let badgeId: string | null = null
    let trophyId: string | null = null
    let xpAmount = 0

    if (targetEventId === OFFICIAL_PORTO_LISBOA_ID) {
      if (position === 1) {
        titleId = 'title_campeao_grande_duelo'
        titleName = 'Campeão do Grande Duelo'
        badgeId = 'badge_campeao_grande_duelo'
        trophyId = 'trophy_campeao_grande_duelo'
        xpAmount = 5000
      } else if (position === 2) {
        titleId = 'title_vice_campeao_grande_duelo'
        titleName = 'Vice-Campeão do Grande Duelo'
        badgeId = 'badge_vice_campeao_grande_duelo'
        xpAmount = 3000
      } else if (position === 3) {
        titleId = 'title_top3_grande_duelo'
        titleName = 'Top 3 — Grande Duelo'
        badgeId = 'badge_top3_grande_duelo'
        xpAmount = 2000
      } else if (userMatches >= 5) {
        titleId = 'title_desafiante_grande_duelo'
        titleName = 'Desafiante do Grande Duelo'
        badgeId = 'badge_desafiante_grande_duelo'
        xpAmount = 500
      }
    }

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

      const userUpdate: any = {
        coins: FieldValue.increment(rewardAmount),
        euros: FieldValue.increment(rewardAmount),
        [`event_rewards.${targetEventId}`]: {
          position,
          amount: rewardAmount,
          xp: xpAmount,
          title: titleName,
          badge: badgeId,
          trophy: trophyId,
          claimedAt: FieldValue.serverTimestamp(),
          status: 'awarded',
        },
        [`events.${targetEventId}`]: {
          completed: true,
          position,
          badge: badgeId,
          title: titleName,
          trophy: trophyId,
          claimedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (xpAmount > 0) {
        userUpdate.xp = FieldValue.increment(xpAmount)
      }

      if (titleId) {
        userUpdate['inventory.titles'] = FieldValue.arrayUnion(titleId)
      }

      if (badgeId) {
        userUpdate.badges = FieldValue.arrayUnion(badgeId)
      }

      if (trophyId) {
        userUpdate.trophies = FieldValue.arrayUnion(trophyId)
      }

      transaction.update(userRef, userUpdate)

      const txRef = userRef.collection('transactions').doc()
      transaction.set(txRef, {
        id: txRef.id,
        userId,
        type: 'event_reward',
        amount: rewardAmount,
        xp: xpAmount,
        title: titleName,
        badge: badgeId,
        trophy: trophyId,
        reason: `Recompensa Oficial de Evento: ${matchedReward.title} no ${eventData.name || 'Grande Duelo: Porto × Lisboa'}`,
        eventId: targetEventId,
        placement: position,
        createdAt: FieldValue.serverTimestamp(),
      })

      const awardPayload = {
        eventId: targetEventId,
        userId,
        placement: position,
        reward: rewardAmount,
        xp: xpAmount,
        title: titleName,
        badge: badgeId,
        trophy: trophyId,
        awardedAt: FieldValue.serverTimestamp(),
        status: 'awarded',
      }

      transaction.set(awardRef, awardPayload)
      transaction.set(claimRef, awardPayload)
    })

    const titleMsg = titleName ? ` + Título «${titleName}»` : ''
    const xpMsg = xpAmount > 0 ? ` + ${xpAmount.toLocaleString('pt-PT')} XP` : ''

    return NextResponse.json({
      success: true,
      position,
      rewardAmount,
      xpAmount,
      title: titleName,
      badge: badgeId,
      trophy: trophyId,
      medal: matchedReward.medal,
      message: `Parabéns! ${rewardAmount.toLocaleString('pt-PT')} Acordas${titleMsg}${xpMsg} creditadas com sucesso no teu perfil e inventário.`,
    })
  } catch (error: any) {
    console.error('[API /api/events/claim-reward ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao resgatar recompensa do evento.' },
      { status: 500 }
    )
  }
}
