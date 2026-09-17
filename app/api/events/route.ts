import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  getEventStatus,
  getEventStatusLabel,
  getEventCountdown,
  type OfficialEventConfig,
} from '@/lib/events-service'

export const dynamic = 'force-dynamic'

export async function GET() {
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

    return NextResponse.json({
      success: true,
      event: eventData,
      status,
      statusLabel,
      serverTime: now.toISOString(),
      serverTimestampMs: now.getTime(),
      countdown,
      rewards: eventData.rewards,
      rules: eventData.rules,
    })
  } catch (error: any) {
    console.error('[API /api/events GET ERROR]:', error)

    // Fallback de alta disponibilidade com a configuração canónica oficial
    const now = new Date()
    const fallbackEvent = OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO
    const status = getEventStatus(fallbackEvent, now) || 'active'
    const statusLabel = getEventStatusLabel(status)
    const countdown = getEventCountdown(fallbackEvent, now)

    return NextResponse.json({
      success: true,
      event: fallbackEvent,
      status,
      statusLabel,
      serverTime: now.toISOString(),
      serverTimestampMs: now.getTime(),
      countdown,
      rewards: fallbackEvent.rewards,
      rules: fallbackEvent.rules,
      fallback: true,
    })
  }
}
