import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
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
    const db = getAdminFirestore()
    const eventRef = db.collection('events').doc(OFFICIAL_PORTUGAL_EM_JOGO_ID)
    const snap = await eventRef.get().catch(() => null)

    let eventData: OfficialEventConfig

    if (!snap || !snap.exists) {
      // Criação/Auto-seed idempotente do primeiro evento oficial real no Firestore
      eventData = {
        ...OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
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
        name: d.name || d.title || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.name,
        title: d.title || d.name || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.title,
        subtitle: d.subtitle || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.subtitle,
        tag: d.tag || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.tag,
        type: d.type || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.type,
        theme: d.theme || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.theme,
        description: d.description || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.description,
        startDate: d.startDate || d.startAt || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.startDate,
        endDate: d.endDate || d.endAt || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.endDate,
        startAt: d.startAt || d.startDate || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.startAt,
        endAt: d.endAt || d.endDate || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.endAt,
        timezone: d.timezone || OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.timezone,
        published: Boolean(d.published ?? true),
        active: Boolean(d.active ?? true),
        enabled: Boolean(d.enabled ?? true),
        rewards: Array.isArray(d.rewards) ? d.rewards : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO.rewards,
        rules: {
          maxDailyMatches: Number(d.rules?.maxDailyMatches || 10),
          pointDivisor: Number(d.rules?.pointDivisor || 10),
          maxEventPointsPerMatch: Number(d.rules?.maxEventPointsPerMatch || 100),
        },
        scoring: {
          pointDivisor: Number(d.scoring?.pointDivisor || d.rules?.pointDivisor || 10),
          maxEventPointsPerMatch: Number(
            d.scoring?.maxEventPointsPerMatch || d.rules?.maxEventPointsPerMatch || 100
          ),
        },
        dailyMatchLimit: Number(d.dailyMatchLimit || d.rules?.maxDailyMatches || 10),
        rewardsDistributed: Boolean(d.rewardsDistributed),
      }
    }

    // Autoridade temporal única: data e hora do servidor
    const now = new Date()
    const status = getEventStatus(eventData, now) || 'active'
    const statusLabel = getEventStatusLabel(status)
    const countdown = getEventCountdown(eventData, now)

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
          typeof data.eventPoints === 'number'
            ? data.eventPoints
            : typeof data.points === 'number'
            ? data.points
            : 0
        const cm =
          typeof data.countedMatches === 'number'
            ? data.countedMatches
            : typeof data.totalMatches === 'number'
            ? data.totalMatches
            : 0
        const tm = typeof data.totalMatches === 'number' ? data.totalMatches : cm

        rawRanking.push({
          userId: docSnap.id,
          displayName: data.displayName || 'Jogador',
          photoURL: data.photoURL || data.avatar || null,
          avatar: data.avatar || data.photoURL || null,
          district: data.district || data.distrito || 'Portugal',
          distrito: data.distrito || data.district || 'Portugal',
          eventPoints: ep,
          points: ep,
          countedMatches: cm,
          totalMatches: tm,
          matchesToday:
            typeof data.matchesToday === 'number'
              ? data.matchesToday
              : undefined,
          dailyMatches: data.dailyMatches || {},
          bestScore: typeof data.bestScore === 'number' ? data.bestScore : 0,
          totalScore: typeof data.totalScore === 'number' ? data.totalScore : 0,
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
              typeof uData.eventPoints === 'number'
                ? uData.eventPoints
                : typeof uData.points === 'number'
                ? uData.points
                : 0
            const cm =
              typeof uData.countedMatches === 'number'
                ? uData.countedMatches
                : typeof uData.totalMatches === 'number'
                ? uData.totalMatches
                : 0
            const tm = typeof uData.totalMatches === 'number' ? uData.totalMatches : cm

            userProgress = {
              userId: userDocSnap.id,
              displayName: uData.displayName || 'Jogador',
              photoURL: uData.photoURL || uData.avatar || null,
              avatar: uData.avatar || uData.photoURL || null,
              district: uData.district || uData.distrito || 'Portugal',
              distrito: uData.distrito || uData.district || 'Portugal',
              eventPoints: ep,
              points: ep,
              countedMatches: cm,
              totalMatches: tm,
              matchesToday:
                typeof uData.matchesToday === 'number'
                  ? uData.matchesToday
                  : undefined,
              dailyMatches: uData.dailyMatches || {},
              bestScore: typeof uData.bestScore === 'number' ? uData.bestScore : 0,
              totalScore: typeof uData.totalScore === 'number' ? uData.totalScore : 0,
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
          }
        }
      } catch (err) {
        console.warn('[API /api/events] Aviso ao ler progresso do utilizador:', err)
      }
    }

    return NextResponse.json(
      {
        success: true,
        event: eventData,
        status,
        statusLabel,
        serverTime: now.toISOString(),
        serverTimestampMs: now.getTime(),
        countdown,
        rewards: eventData.rewards,
        rules: eventData.rules,
        ranking,
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
