import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  canonicalizeEventId,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  sortEventParticipants,
  type OfficialEventConfig,
  type EventParticipant,
} from '@/lib/events-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawRequestedId = searchParams.get('eventId') || searchParams.get('id') || OFFICIAL_PORTO_LISBOA_ID
    const requestedEventId = canonicalizeEventId(rawRequestedId)

    const baseDefaultConfig =
      requestedEventId === OFFICIAL_PORTUGAL_EM_JOGO_ID
        ? OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO
        : OFFICIAL_EVENT_CONFIG_PORTO_LISBOA

    const db = getAdminFirestore()
    const eventRef = db.collection('events').doc(requestedEventId)
    const snap = await eventRef.get().catch(() => null)

    let eventData: OfficialEventConfig

    if (!snap || !snap.exists) {
      // Criação/Auto-seed idempotente do evento solicitado no Firestore
      eventData = {
        ...baseDefaultConfig,
      }

      await eventRef
        .set(
          {
            ...eventData,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
        .catch((err: any) => {
          console.warn('[API /api/events] Aviso ao persistir seed do evento:', err?.message || err)
        })
    } else {
      const d = snap.data() || {}
      eventData = {
        id: snap.id,
        name: d.name || d.title || baseDefaultConfig.name,
        title: d.title || d.name || baseDefaultConfig.title,
        subtitle: d.subtitle || baseDefaultConfig.subtitle,
        tag: d.tag || baseDefaultConfig.tag,
        type: d.type || baseDefaultConfig.type,
        theme: d.theme || baseDefaultConfig.theme,
        description: d.description || baseDefaultConfig.description,
        startDate: d.startDate || d.startAt || baseDefaultConfig.startDate,
        endDate: d.endDate || d.endAt || baseDefaultConfig.endDate,
        startAt: d.startAt || d.startDate || baseDefaultConfig.startAt,
        endAt: d.endAt || d.endDate || baseDefaultConfig.endAt,
        timezone: d.timezone || baseDefaultConfig.timezone,
        published: Boolean(d.published ?? true),
        active: Boolean(d.active ?? true),
        rewards:
          requestedEventId === OFFICIAL_PORTO_LISBOA_ID
            ? baseDefaultConfig.rewards
            : Array.isArray(d.rewards)
            ? d.rewards
            : baseDefaultConfig.rewards,
        teams: d.teams || (requestedEventId === OFFICIAL_PORTO_LISBOA_ID ? baseDefaultConfig.teams : undefined),
        status: d.status,
        closedAt: d.closedAt,
        finalSnapshot: d.finalSnapshot || d.closureSnapshot,
        rules: {
          maxDailyMatches: Number(d.rules?.maxDailyMatches || baseDefaultConfig.rules.maxDailyMatches),
          pointDivisor: Number(d.rules?.pointDivisor || baseDefaultConfig.rules.pointDivisor),
          maxEventPointsPerMatch: Number(
            d.rules?.maxEventPointsPerMatch || baseDefaultConfig.rules.maxEventPointsPerMatch || 100
          ),
        },
        scoring: {
          pointDivisor: Number(d.scoring?.pointDivisor || d.rules?.pointDivisor || baseDefaultConfig.rules.pointDivisor),
          maxEventPointsPerMatch: Number(
            d.scoring?.maxEventPointsPerMatch || d.rules?.maxEventPointsPerMatch || baseDefaultConfig.rules.maxEventPointsPerMatch || 100
          ),
        },
        dailyMatchLimit: Number(d.dailyMatchLimit || d.rules?.maxDailyMatches || baseDefaultConfig.rules.maxDailyMatches),
        rewardsDistributed: Boolean(d.rewardsDistributed),
      }

      if (
        requestedEventId === OFFICIAL_PORTO_LISBOA_ID &&
        (!Array.isArray(d.rewards) || d.rewards[0]?.acordas !== 50000)
      ) {
        eventRef.update({ rewards: baseDefaultConfig.rewards, updatedAt: FieldValue.serverTimestamp() }).catch(() => {})
      }
    }

    // Autoridade temporal única: data e hora do servidor
    const now = new Date()
    const status = getEventStatus(eventData, now) || 'active'
    const statusLabel = getEventStatusLabel(status)
    const countdown = getEventCountdown(eventData, now)

    // Verificar se existe snapshot congelado imutável
    const snapshotDocSnap = await eventRef.collection('closure_snapshot').doc('final').get().catch(() => null)
    const finalSnapshot = snapshotDocSnap?.exists
      ? snapshotDocSnap.data()
      : eventData.finalSnapshot || null

    // Obter ranking real diretamente do Firestore Admin
    const participantsRef = eventRef.collection('participants')
    const participantsSnap = await participantsRef
      .orderBy('eventPoints', 'desc')
      .limit(50)
      .get()
      .catch(() => null)

    const rawRanking: EventParticipant[] = []
    if (participantsSnap && !participantsSnap.empty) {
      participantsSnap.forEach((docSnap) => {
        const data = docSnap.data() || {}
        const ep =
          typeof data.totalPoints === 'number'
            ? data.totalPoints
            : typeof data.eventPoints === 'number'
            ? data.eventPoints
            : typeof data.points === 'number'
            ? data.points
            : 0
        const gp =
          typeof data.gamesPlayed === 'number'
            ? data.gamesPlayed
            : typeof data.totalMatches === 'number'
            ? data.totalMatches
            : typeof data.countedMatches === 'number'
            ? data.countedMatches
            : 0

        rawRanking.push({
          userId: docSnap.id,
          eventId: data.eventId || requestedEventId,
          displayName: data.displayName || 'Jogador',
          photoURL: data.photoURL || data.avatar || null,
          avatar: data.avatar || data.photoURL || null,
          district: data.district || data.distrito || 'Portugal',
          distrito: data.distrito || data.district || 'Portugal',
          team: data.team || null,
          teamSelectedAt: data.teamSelectedAt || null,
          totalPoints: ep,
          eventPoints: ep,
          points: ep,
          gamesPlayed: gp,
          countedMatches: gp,
          totalMatches: gp,
          matchesToday:
            typeof data.matchesToday === 'number'
              ? data.matchesToday
              : undefined,
          dailyMatches: data.dailyMatches || {},
          bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
          totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
          correctAnswers: typeof data.correctAnswers === 'number' ? data.correctAnswers : 0,
          incorrectAnswers: typeof data.incorrectAnswers === 'number' ? data.incorrectAnswers : 0,
          questionsAnswered:
            typeof data.questionsAnswered === 'number'
              ? data.questionsAnswered
              : typeof data.correctAnswers === 'number'
              ? data.correctAnswers + (data.incorrectAnswers || 0)
              : 0,
          lastPlayedDate: data.lastPlayedDate,
          lastPlayedAt: data.lastPlayedAt,
          updatedAt: data.updatedAt,
        })
      })
    }

    const ranking = sortEventParticipants(rawRanking)

    // Verificar se existe utilizador autenticado no pedido para devolver progresso pessoal
    let userProgress: EventParticipant | null = null
    let userRankPosition: number | null = null

    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1]
      try {
        const adminAuth = getAdminAuth()
        const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
        if (decoded?.uid) {
          const userDocSnap = await participantsRef.doc(decoded.uid).get().catch(() => null)
          if (userDocSnap && userDocSnap.exists) {
            const uData = userDocSnap.data() || {}
            const ep =
              typeof uData.totalPoints === 'number'
                ? uData.totalPoints
                : typeof uData.eventPoints === 'number'
                ? uData.eventPoints
                : typeof uData.points === 'number'
                ? uData.points
                : 0
            const gp =
              typeof uData.gamesPlayed === 'number'
                ? uData.gamesPlayed
                : typeof uData.totalMatches === 'number'
                ? uData.totalMatches
                : typeof uData.countedMatches === 'number'
                ? uData.countedMatches
                : 0

            userProgress = {
              userId: userDocSnap.id,
              eventId: uData.eventId || requestedEventId,
              displayName: uData.displayName || 'Jogador',
              photoURL: uData.photoURL || uData.avatar || null,
              avatar: uData.avatar || uData.photoURL || null,
              district: uData.district || uData.distrito || 'Portugal',
              distrito: uData.distrito || uData.district || 'Portugal',
              team: uData.team || null,
              teamSelectedAt: uData.teamSelectedAt || null,
              totalPoints: ep,
              eventPoints: ep,
              points: ep,
              gamesPlayed: gp,
              countedMatches: gp,
              totalMatches: gp,
              matchesToday:
                typeof uData.matchesToday === 'number'
                  ? uData.matchesToday
                  : undefined,
              dailyMatches: uData.dailyMatches || {},
              bestScore: typeof uData.bestScore === 'number' ? uData.bestScore : 0,
              totalScore: typeof uData.totalScore === 'number' ? uData.totalScore : 0,
              correctAnswers: typeof uData.correctAnswers === 'number' ? uData.correctAnswers : 0,
              incorrectAnswers: typeof uData.incorrectAnswers === 'number' ? uData.incorrectAnswers : 0,
              questionsAnswered:
                typeof uData.questionsAnswered === 'number'
                  ? uData.questionsAnswered
                  : typeof uData.correctAnswers === 'number'
                  ? uData.correctAnswers + (uData.incorrectAnswers || 0)
                  : 0,
              lastPlayedDate: uData.lastPlayedDate,
              lastPlayedAt: uData.lastPlayedAt,
              updatedAt: uData.updatedAt,
            }

            // Determinar posição do utilizador no ranking
            const foundIndex = ranking.findIndex((p) => p.userId === decoded.uid)
            if (foundIndex >= 0) {
              userRankPosition = foundIndex + 1
            } else if (ep > 0) {
              // Se tiver pontos mas não estiver nos top 50, calcular através de contagem
              const higherSnap = await participantsRef
                .where('eventPoints', '>', ep)
                .count()
                .get()
                .catch(() => null)
              userRankPosition = higherSnap ? higherSnap.data().count + 1 : ranking.length + 1
            }
          } else {
            // Se ainda não tiver documento de participante mas já tiver escolhido equipa no documento de utilizador
            const userProfileSnap = await db.collection('users').doc(decoded.uid).get().catch(() => null)
            if (userProfileSnap && userProfileSnap.exists) {
              const uProf = userProfileSnap.data() || {}
              const chosenTeam = uProf.events?.[requestedEventId]?.team || null
              if (chosenTeam) {
                userProgress = {
                  userId: decoded.uid,
                  displayName: uProf.displayName || uProf.username || 'Jogador',
                  photoURL: uProf.photoURL || uProf.avatar || null,
                  avatar: uProf.avatar || uProf.photoURL || null,
                  district: uProf.district || uProf.distrito || 'Portugal',
                  distrito: uProf.distrito || uProf.district || 'Portugal',
                  team: chosenTeam,
                  eventPoints: 0,
                  points: 0,
                  countedMatches: 0,
                  totalMatches: 0,
                  dailyMatches: {},
                  bestScore: 0,
                  totalScore: 0,
                  correctAnswers: 0,
                  incorrectAnswers: 0,
                  questionsAnswered: 0,
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('[API /api/events] Aviso ao ler progresso do utilizador:', err)
      }
    }

    const effectiveRanking =
      finalSnapshot && Array.isArray(finalSnapshot.rankingFinal) && finalSnapshot.rankingFinal.length > 0
        ? finalSnapshot.rankingFinal
        : ranking

    return NextResponse.json(
      {
        success: true,
        event: eventData,
        teams: finalSnapshot?.teamStats || eventData.teams,
        status,
        statusLabel,
        isEnded: status === 'ended',
        finalSnapshot,
        top3: finalSnapshot?.top3 || null,
        winningTeam: finalSnapshot?.winningTeam || null,
        serverTime: now.toISOString(),
        serverTimestampMs: now.getTime(),
        countdown,
        rewards: eventData.rewards,
        rules: eventData.rules,
        ranking: effectiveRanking,
        userProgress,
        userRankPosition,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error: any) {
    console.error('[API /api/events GET ERROR]:', error)

    // Fallback de alta disponibilidade com a configuração canónica oficial
    const now = new Date()
    const fallbackEvent = OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO
    const status = getEventStatus(fallbackEvent, now) || 'active'
    const statusLabel = getEventStatusLabel(status)
    const countdown = getEventCountdown(fallbackEvent, now)

    return NextResponse.json(
      {
        success: true,
        event: fallbackEvent,
        status,
        statusLabel,
        serverTime: now.toISOString(),
        serverTimestampMs: now.getTime(),
        countdown,
        rewards: fallbackEvent.rewards,
        rules: fallbackEvent.rules,
        ranking: [],
        userProgress: null,
        userRankPosition: null,
        fallback: true,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  }
}
