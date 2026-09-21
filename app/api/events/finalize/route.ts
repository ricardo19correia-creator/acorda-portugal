import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { FieldValue } from 'firebase-admin/firestore'
import {
  sortEventParticipants,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  canonicalizeEventId,
  type EventParticipant,
  type OfficialEventConfig,
  type EventClosureSnapshot,
  type EventTop3Winner,
} from '@/lib/events-service'

export const dynamic = 'force-dynamic'

/**
 * 🏁 FLUXO COMPLETO DE ENCERRAMENTO OFICIAL — PORTO × LISBOA 2026
 *
 * Princípio Fundamental: O encerramento é uma operação exclusiva do backend.
 * 1. Validação de Autorização (Admin ou Segredo Interno de Cron)
 * 2. Validação Temporal de Fim do Evento (ou force administrativo explícito)
 * 3. Idempotência Total: Se já foi finalizado e distribuído com sucesso, devolve snapshot
 * 4. Cálculo Determinístico do Ranking Definitivo (server-side)
 * 5. Criação do Snapshot Final Imutável do Evento (closure_snapshot/final)
 * 6. Atribuição Segura e Atómica ao Top 3:
 *    - 1.º Lugar: 50.000 Acordas + REI DA RIVALIDADE + TROFÉU SUPREMO — PORTO × LISBOA 2026
 *    - 2.º Lugar: 30.000 Acordas + SENHOR DA RIVALIDADE + MEDALHA DE PRATA — PORTO × LISBOA 2026
 *    - 3.º Lugar: 20.000 Acordas + GUERREIRO DA RIVALIDADE + MEDALHA DE BRONZE — PORTO × LISBOA 2026
 * 7. Atualização do Perfil, Inventário de Títulos, Troféus 3D e Transações Económicas
 * 8. Recuperação de Erros (error_pending se falhar alguma atribuição) e Retry Seguro
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificação de autorização administrativa ou header de automação interna
    const authResult = await verifyAdminRequest(request)
    const bypassSecret = request.headers.get('x-events-cron-secret')
    const expectedSecret = process.env.CRON_SECRET || process.env.ADMIN_CRON_SECRET

    if (!authResult.authorized && (!expectedSecret || bypassSecret !== expectedSecret)) {
      return NextResponse.json(
        { error: 'Não autorizado para encerrar o evento.' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const targetEventId = canonicalizeEventId(body.eventId || OFFICIAL_PORTO_LISBOA_ID)

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

    // O evento só encerra se o tempo oficial já tiver passado (ou se forçadamente invocado por admin para testes/manutenção)
    const force = Boolean(body.force)
    const forceRetry = Boolean(body.forceRetry)

    if (now < endMs && !force) {
      return NextResponse.json(
        {
          error: `O evento ainda não terminou. Data oficial de fim: ${endStr} (Europe/Lisbon).`,
          nowMs: now,
          endMs,
        },
        { status: 400 }
      )
    }

    // 2. Verificar se já existe snapshot definitivo congelado (Idempotência Absoluta)
    const snapshotDocRef = eventDocRef.collection('closure_snapshot').doc('final')
    const existingSnapshotSnap = await snapshotDocRef.get().catch(() => null)

    let finalSnapshot: EventClosureSnapshot | null = null
    if (existingSnapshotSnap && existingSnapshotSnap.exists) {
      finalSnapshot = existingSnapshotSnap.data() as EventClosureSnapshot
      // Se já foi finalizado e todos os prémios foram distribuídos, devolver imediatamente sem recalcular
      if (finalSnapshot.rewardDistributionStatus === 'completed' && !forceRetry) {
        console.log(`[EVENT_CLOSE] Evento ${targetEventId} já encerrado e congelado anteriormente. Devolvendo snapshot imutável.`)
        return NextResponse.json({
          success: true,
          eventId: targetEventId,
          alreadyClosed: true,
          message: 'O evento já se encontra encerrado e os prémios distribuídos com total idempotência.',
          snapshot: finalSnapshot,
          top3: finalSnapshot.top3,
        })
      }
    }

    // 3. Fase de Congelamento: Marcar evento como 'processing' se ainda não estiver
    await eventDocRef.set(
      {
        status: 'processing',
        active: false,
        processingStartedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    // 4. Obter todos os participantes reais do Firestore (Server-Side SSOT)
    const participantsSnap = await eventDocRef.collection('participants').get()
    const list: EventParticipant[] = []
    participantsSnap.forEach((d: any) => {
      const data = d.data() || {}
      list.push({
        userId: d.id,
        displayName: data.displayName || 'Jogador',
        photoURL: data.photoURL || data.avatar || null,
        avatar: data.avatar || data.photoURL || null,
        district: data.district || data.distrito || 'Portugal',
        distrito: data.distrito || data.district || 'Portugal',
        team: data.team || null,
        eventPoints: typeof data.totalPoints === 'number'
          ? data.totalPoints
          : typeof data.eventPoints === 'number'
          ? data.eventPoints
          : typeof data.points === 'number'
          ? data.points
          : 0,
        countedMatches: typeof data.gamesPlayed === 'number'
          ? data.gamesPlayed
          : typeof data.countedMatches === 'number'
          ? data.countedMatches
          : typeof data.totalMatches === 'number'
          ? data.totalMatches
          : 0,
        totalMatches: typeof data.totalMatches === 'number'
          ? data.totalMatches
          : typeof data.gamesPlayed === 'number'
          ? data.gamesPlayed
          : 0,
        dailyMatches: data.dailyMatches || {},
        bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
        totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
        correctAnswers: typeof data.correctAnswers === 'number' ? data.correctAnswers : 0,
        incorrectAnswers: typeof data.incorrectAnswers === 'number' ? data.incorrectAnswers : 0,
        questionsAnswered: typeof data.questionsAnswered === 'number' ? data.questionsAnswered : 0,
      })
    })

    // Ordenação determinística com critérios canónicos de desempate
    const sortedRankings = sortEventParticipants(list)

    // Determinar equipa vencedora
    const portoPoints = Number(eventData.teams?.porto?.points || 0)
    const lisboaPoints = Number(eventData.teams?.lisboa?.points || 0)
    const winningTeam: 'porto' | 'lisboa' | 'draw' =
      portoPoints > lisboaPoints
        ? 'porto'
        : lisboaPoints > portoPoints
        ? 'lisboa'
        : 'draw'

    // Formatar Top 3 com títulos e troféus oficiais
    const top3Raw = sortedRankings.slice(0, 3)
    const top3Winners: EventTop3Winner[] = top3Raw.map((participant, idx) => {
      const placement = (idx + 1) as 1 | 2 | 3
      let rewardAcordas = 20000
      let title = 'GUERREIRO DA RIVALIDADE'
      let trophyName = 'MEDALHA DE BRONZE — PORTO × LISBOA 2026'

      if (placement === 1) {
        rewardAcordas = 50000
        title = 'REI DA RIVALIDADE'
        trophyName = 'TROFÉU SUPREMO — PORTO × LISBOA 2026'
      } else if (placement === 2) {
        rewardAcordas = 30000
        title = 'SENHOR DA RIVALIDADE'
        trophyName = 'MEDALHA DE PRATA — PORTO × LISBOA 2026'
      }

      const rewardId = `${targetEventId}:${participant.userId}:${placement === 1 ? '1st-place' : placement === 2 ? '2nd-place' : '3rd-place'}`

      return {
        placement,
        userId: participant.userId,
        displayName: participant.displayName,
        photoURL: participant.photoURL || null,
        avatar: participant.photoURL || null,
        team: participant.team || null,
        eventPoints: participant.eventPoints,
        totalScore: participant.totalScore || 0,
        countedMatches: participant.countedMatches || participant.totalMatches || 0,
        rewardAcordas,
        title,
        trophyName,
        rewardId,
        awardedAt: new Date().toISOString(),
      }
    })

    // 5. Criar Registo Imutável de Encerramento (Snapshot Final)
    if (!finalSnapshot || forceRetry) {
      finalSnapshot = {
        eventId: targetEventId,
        eventName: targetEventId === OFFICIAL_PORTO_LISBOA_ID ? 'PORTO ⚔️ LISBOA — O GRANDE DUELO' : eventData.name,
        eventVersion: '2026',
        startedAt: eventData.startDate || eventData.startAt || baseEvent.startDate,
        endedAt: eventData.endDate || eventData.endAt || baseEvent.endDate,
        closedAt: new Date().toISOString(),
        totalPlayers: sortedRankings.length,
        totalMatches: (eventData.teams?.porto?.matchesPlayed || 0) + (eventData.teams?.lisboa?.matchesPlayed || 0),
        winningTeam,
        teamStats: {
          porto: eventData.teams?.porto || baseEvent.teams!.porto,
          lisboa: eventData.teams?.lisboa || baseEvent.teams!.lisboa,
        },
        rankingFinal: sortedRankings.slice(0, 100),
        top3: top3Winners,
        status: 'frozen',
        rewardDistributionStatus: 'in_progress',
        closedBy: authResult.adminUser?.email || 'system_cron',
      }

      await snapshotDocRef.set(finalSnapshot, { merge: true })
      await eventDocRef.set(
        {
          finalSnapshot,
          closureSnapshot: finalSnapshot,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )
    }

    // 6. Atribuição Segura e Idempotente de Recompensas ao Top 3
    const results: any[] = []
    const errors: Array<{ userId: string; rewardId: string; error: string; timestamp: string }> = []

    for (let i = 0; i < top3Winners.length; i++) {
      const winner = top3Winners[i]
      const placement = winner.placement
      const rewardAmount = winner.rewardAcordas
      const rewardId = winner.rewardId
      const titleName = winner.title
      const trophyName = winner.trophyName

      let titleId: string = 'title_guerreiro_da_rivalidade'
      let badgeId: string = 'badge_guerreiro_da_rivalidade'
      let trophyId: string = 'medalha_bronze_porto_lisboa_2026'
      let xpAmount = 4000

      if (placement === 1) {
        titleId = 'title_rei_da_rivalidade'
        badgeId = 'badge_rei_da_rivalidade'
        trophyId = 'trophy_supremo_porto_lisboa_2026'
        xpAmount = 10000
      } else if (placement === 2) {
        titleId = 'title_senhor_da_rivalidade'
        badgeId = 'badge_senhor_da_rivalidade'
        trophyId = 'medalha_prata_porto_lisboa_2026'
        xpAmount = 6000
      }

      const historicalConquest = {
        eventId: targetEventId,
        eventName: targetEventId === OFFICIAL_PORTO_LISBOA_ID ? 'PORTO × LISBOA 2026' : eventData.name,
        eventYear: 2026,
        placement,
        team: winner.team || (placement === 1 ? 'porto' : 'lisboa'),
        rewardName: trophyName,
        title: titleName,
        acordas: rewardAmount,
        rewardId,
        conqueredAt: new Date().toISOString(),
      }

      const awardRef = eventDocRef.collection('rewards_awarded').doc(winner.userId)
      const userRef = db.collection('users').doc(winner.userId)
      const publicProfileRef = db.collection('publicProfiles').doc(winner.userId)

      try {
        const awardResult = await db.runTransaction(async (transaction: any) => {
          const checkAward = await transaction.get(awardRef)
          if (checkAward.exists && checkAward.data()?.status === 'awarded') {
            return {
              userId: winner.userId,
              placement,
              rewardAmount,
              rewardId,
              alreadyAwarded: true,
              status: 'skipped_already_awarded',
            }
          }

          const uSnap = await transaction.get(userRef)
          if (uSnap.exists) {
            const userUpdate: any = {
              coins: FieldValue.increment(rewardAmount),
              euros: FieldValue.increment(rewardAmount),
              acordas: FieldValue.increment(rewardAmount),
              moedas: FieldValue.increment(rewardAmount),
              [`event_rewards.${targetEventId}`]: {
                position: placement,
                placement,
                amount: rewardAmount,
                acordas: rewardAmount,
                xp: xpAmount,
                title: titleName,
                badge: badgeId,
                trophy: trophyId,
                trophyName,
                team: winner.team || null,
                rewardId,
                claimedAt: FieldValue.serverTimestamp(),
                status: 'awarded',
              },
              [`events.${targetEventId}`]: {
                completed: true,
                position: placement,
                placement,
                badge: badgeId,
                title: titleName,
                trophy: trophyId,
                trophyName,
                team: winner.team || null,
                rewardId,
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
              userUpdate.titles = FieldValue.arrayUnion(titleName)
            }

            if (badgeId) {
              userUpdate.badges = FieldValue.arrayUnion(badgeId)
            }

            if (trophyId) {
              userUpdate.trophies = FieldValue.arrayUnion({
                id: trophyId,
                name: trophyName,
                placement,
                eventId: targetEventId,
                rewardId,
                awardedAt: new Date().toISOString(),
              })
            }

            transaction.update(userRef, userUpdate)

            // Registar transação auditável na carteira do jogador
            const txRef = userRef.collection('transactions').doc()
            transaction.set(txRef, {
              id: txRef.id,
              userId: winner.userId,
              type: 'event_reward',
              amount: rewardAmount,
              xp: xpAmount,
              title: titleName,
              badge: badgeId,
              trophy: trophyId,
              rewardId,
              reason: `Prémio Oficial: ${placement}.º Lugar — ${titleName} (${trophyName}) no ${eventData.name || 'PORTO × LISBOA 2026'}`,
              eventId: targetEventId,
              placement,
              createdAt: FieldValue.serverTimestamp(),
            })

            // Atualizar perfil público
            transaction.set(
              publicProfileRef,
              {
                uid: winner.userId,
                updatedAt: FieldValue.serverTimestamp(),
              },
              { merge: true }
            )
          }

          const awardData = {
            eventId: targetEventId,
            userId: winner.userId,
            placement,
            reward: rewardAmount,
            rewardAcordas: rewardAmount,
            xp: xpAmount,
            title: titleName,
            badge: badgeId,
            trophy: trophyId,
            trophyName,
            rewardId,
            team: winner.team || null,
            awardedAt: FieldValue.serverTimestamp(),
            status: 'awarded',
          }

          transaction.set(awardRef, awardData)

          return {
            userId: winner.userId,
            placement,
            rewardAmount,
            rewardId,
            title: titleName,
            alreadyAwarded: false,
            status: 'awarded_success',
          }
        })

        results.push(awardResult)
      } catch (awardErr: any) {
        console.error(`[EVENT_CLOSE_ERROR] Falha ao premiar ${winner.userId}:`, awardErr)
        errors.push({
          userId: winner.userId,
          rewardId,
          error: awardErr?.message || String(awardErr),
          timestamp: new Date().toISOString(),
        })
      }
    }

    // 7. Avaliar Sucesso da Distribuição e Recuperação de Erros
    if (errors.length > 0) {
      console.warn(`[EVENT_CLOSE_WARN] ${errors.length} erros na atribuição de prémios. A marcar estado como error_pending.`)

      await snapshotDocRef.update({
        rewardDistributionStatus: 'error_pending',
        distributionErrors: errors,
      })

      await eventDocRef.set(
        {
          status: 'error_pending',
          active: false,
          rewardsDistributed: false,
          lastError: errors,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      return NextResponse.json(
        {
          success: false,
          error: 'Encerramento em estado pendente: ocorreram erros na distribuição de prémios.',
          errors,
          results,
          status: 'error_pending',
        },
        { status: 500 }
      )
    }

    // 8. Finalização com Êxito Total: Ranking Congelado e Evento Encerrado
    await snapshotDocRef.update({
      rewardDistributionStatus: 'completed',
      status: 'closed',
    })

    await eventDocRef.set(
      {
        active: false,
        status: 'ended',
        rewardsDistributed: true,
        closedAt: FieldValue.serverTimestamp(),
        finalizedAt: FieldValue.serverTimestamp(),
        finalSnapshot: {
          ...finalSnapshot,
          rewardDistributionStatus: 'completed',
          status: 'closed',
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    if (authResult.adminUser) {
      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'EVENT_CLOSED_OFFICIALLY',
        entity: 'EVENT',
        entityId: targetEventId,
        details: `Encerrou oficialmente o evento ${targetEventId}. Top 3 consagrado e 100.000 Acordas distribuídos.`,
        newValue: {
          totalParticipants: sortedRankings.length,
          top3: top3Winners,
          winningTeam,
        },
        status: 'SUCCESS',
      })
    }

    console.log(`[EVENT_CLOSE_SUCCESS] Evento ${targetEventId} encerrado definitivamente com sucesso.`)

    return NextResponse.json({
      success: true,
      eventId: targetEventId,
      status: 'ended',
      totalParticipants: sortedRankings.length,
      top3Awarded: results,
      snapshot: {
        ...finalSnapshot,
        rewardDistributionStatus: 'completed',
        status: 'closed',
      },
      message: 'Evento encerrado com sucesso. Ranking congelado, snapshot final gerado e prémios distribuídos sem duplicação.',
    })
  } catch (error: any) {
    console.error('[API /api/events/finalize ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao finalizar evento.' },
      { status: 500 }
    )
  }
}
