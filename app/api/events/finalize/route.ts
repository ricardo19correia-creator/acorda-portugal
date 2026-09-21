import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { verifyAdminRequest } from '@/lib/admin-auth'
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

/**
 * Encerramento Oficial do Evento e Distribuição Idempotente de Recompensas
 * Regras:
 * - Só pode ser executado após término oficial (30/09/2026 às 23:59 Europe/Lisbon)
 * - 1.º Lugar: 10.000 Acordas
 * - 2.º Lugar: 7.500 Acordas
 * - 3.º Lugar: 5.000 Acordas
 * - Idempotência Absoluta: Reexecutar a função NUNCA duplica prémios.
 */
export async function POST(request: NextRequest) {
  try {
    // Verificação de autenticação administrativa ou header de automação interna
    const authResult = await verifyAdminRequest(request)
    const bypassSecret = request.headers.get('x-events-cron-secret')
    const expectedSecret = process.env.CRON_SECRET || process.env.ADMIN_CRON_SECRET

    if (!authResult.authorized && (!expectedSecret || bypassSecret !== expectedSecret)) {
      return NextResponse.json({ error: 'Não autorizado para encerrar evento.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const targetEventId = body.eventId || OFFICIAL_PORTUGAL_EM_JOGO_ID

    const baseEvent =
      targetEventId === OFFICIAL_PORTO_LISBOA_ID
        ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
        : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

    const db = getAdminFirestore()
    const eventDocRef = db.collection('events').doc(targetEventId)
    const eventSnap = await eventDocRef.get()

    let eventData: OfficialEventConfig = eventSnap.exists
      ? (eventSnap.data() as OfficialEventConfig)
      : baseEvent

    const now = Date.now()
    const endStr = eventData.endDate || eventData.endAt || baseEvent.endDate
    const endMs = new Date(endStr).getTime()

    // O evento só encerra se o tempo oficial já tiver passado (ou se forçadamente invocado por admin para testes)
    const force = Boolean(body.force)
    if (now < endMs && !force) {
      return NextResponse.json(
        {
          error: 'O evento ainda não terminou. Data oficial de fim: 30/09/2026 às 23:59 (Europe/Lisbon).',
          nowMs: now,
          endMs,
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
    const top3 = sortedRankings.slice(0, 3)

    const rewardsTable = eventData.rewards || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.rewards
    const results: any[] = []

    for (let i = 0; i < top3.length; i++) {
      const participant = top3[i]
      const placement = i + 1
      const rewardConfig = rewardsTable.find((r) => r.position === placement)
      if (!rewardConfig) continue

      const rewardAmount = rewardConfig.acordas
      let titleId: string | null = null
      let titleName: string | null = rewardConfig.title
      let badgeId: string | null = null
      let trophyId: string | null = null
      let trophyName: string | null = null
      let xpAmount = 0

      if (targetEventId === OFFICIAL_PORTO_LISBOA_ID) {
        if (placement === 1) {
          titleId = 'title_rei_da_rivalidade'
          titleName = 'REI DA RIVALIDADE'
          badgeId = 'badge_rei_da_rivalidade'
          trophyId = 'trophy_supremo_porto_lisboa_2026'
          trophyName = 'TROFÉU SUPREMO — PORTO × LISBOA 2026'
          xpAmount = 10000
        } else if (placement === 2) {
          titleId = 'title_senhor_da_rivalidade'
          titleName = 'SENHOR DA RIVALIDADE'
          badgeId = 'badge_senhor_da_rivalidade'
          trophyId = 'medalha_prata_porto_lisboa_2026'
          trophyName = 'MEDALHA DE PRATA — PORTO × LISBOA 2026'
          xpAmount = 6000
        } else if (placement === 3) {
          titleId = 'title_guerreiro_da_rivalidade'
          titleName = 'GUERREIRO DA RIVALIDADE'
          badgeId = 'badge_guerreiro_da_rivalidade'
          trophyId = 'medalha_bronze_porto_lisboa_2026'
          trophyName = 'MEDALHA DE BRONZE — PORTO × LISBOA 2026'
          xpAmount = 4000
        }
      }

      const historicalConquest = {
        eventId: targetEventId,
        eventName: targetEventId === OFFICIAL_PORTO_LISBOA_ID ? 'PORTO × LISBOA 2026' : eventData.name,
        eventYear: 2026,
        placement,
        team: participant.team || 'porto',
        rewardName: trophyName || (rewardConfig as any)?.trophyName || rewardConfig.title,
        title: titleName,
        acordas: rewardAmount,
        conqueredAt: new Date().toISOString(),
      }

      const awardRef = eventDocRef.collection('rewards_awarded').doc(participant.userId)
      const userRef = db.collection('users').doc(participant.userId)

      const awardResult = await db.runTransaction(async (transaction: any) => {
        const checkAward = await transaction.get(awardRef)
        if (checkAward.exists && checkAward.data()?.status === 'awarded') {
          return {
            userId: participant.userId,
            placement,
            rewardAmount,
            alreadyAwarded: true,
            status: 'skipped_already_awarded',
          }
        }

        const uSnap = await transaction.get(userRef)
        if (uSnap.exists) {
          const userUpdate: any = {
            coins: FieldValue.increment(rewardAmount),
            euros: FieldValue.increment(rewardAmount),
            [`event_rewards.${targetEventId}`]: {
              position: placement,
              amount: rewardAmount,
              xp: xpAmount,
              title: titleName,
              badge: badgeId,
              trophy: trophyId,
              trophyName,
              team: participant.team || null,
              claimedAt: FieldValue.serverTimestamp(),
              status: 'awarded',
            },
            [`events.${targetEventId}`]: {
              completed: true,
              position: placement,
              badge: badgeId,
              title: titleName,
              trophy: trophyId,
              trophyName,
              team: participant.team || null,
              claimedAt: FieldValue.serverTimestamp(),
            },
            historical_conquests: FieldValue.arrayUnion(historicalConquest),
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
            userId: participant.userId,
            type: 'event_reward',
            amount: rewardAmount,
            xp: xpAmount,
            title: titleName,
            badge: badgeId,
            trophy: trophyId,
            reason: `Recompensa Oficial de Evento: ${titleName || rewardConfig.title} no ${eventData.name || 'PORTO × LISBOA 2026'}`,
            eventId: targetEventId,
            placement,
            createdAt: FieldValue.serverTimestamp(),
          })
        }

        const awardData = {
          eventId: targetEventId,
          userId: participant.userId,
          placement,
          reward: rewardAmount,
          xp: xpAmount,
          title: titleName,
          badge: badgeId,
          trophy: trophyId,
          trophyName,
          awardedAt: FieldValue.serverTimestamp(),
          status: 'awarded',
        }

        transaction.set(awardRef, awardData)
        return {
          userId: participant.userId,
          placement,
          rewardAmount,
          alreadyAwarded: false,
          status: 'awarded_success',
        }
      })

      results.push(awardResult)
    }

    // Congelar evento e marcar como terminado
    await eventDocRef.set(
      {
        active: false,
        status: 'ended',
        rewardsDistributed: true,
        finalizedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      totalParticipants: sortedRankings.length,
      top3Awarded: results,
      message: 'Evento encerrado e recompensas distribuídas com sucesso com idempotência total.',
    })
  } catch (error: any) {
    console.error('[API /api/events/finalize ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao finalizar evento.' },
      { status: 500 }
    )
  }
}
