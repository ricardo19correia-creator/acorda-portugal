import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { FieldValue } from 'firebase-admin/firestore'
import {
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  getEventStatus,
  getEventStatusLabel,
  sortEventParticipants,
  type OfficialEventConfig,
  type EventParticipant,
} from '@/lib/events-service'
import { QuestionRegistry } from '@/lib/question-system/registry'
import { PORTO_LISBOA_QUESTIONS } from '@/lib/data/porto-lisboa-questions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId') || OFFICIAL_PORTO_LISBOA_ID
    const mode = searchParams.get('mode') || 'details' // 'details' | 'questions' | 'ranking'

    const db = getAdminFirestore()
    const eventsRef = db.collection('events')

    // 1. Carregar todos os eventos oficiais
    const eventsSnap = await eventsRef.get().catch(() => null)
    const eventsList: OfficialEventConfig[] = []

    if (eventsSnap && !eventsSnap.empty) {
      eventsSnap.forEach((docSnap) => {
        const d = docSnap.data() || {}
        eventsList.push({
          id: docSnap.id,
          name: d.name || d.title || 'Evento',
          title: d.title || d.name || 'Evento',
          subtitle: d.subtitle || '',
          tag: d.tag || '',
          type: d.type || 'Evento Especial',
          theme: d.theme || '',
          description: d.description || '',
          startDate: d.startDate || d.startAt || '',
          endDate: d.endDate || d.endAt || '',
          startAt: d.startAt || d.startDate || '',
          endAt: d.endAt || d.endDate || '',
          timezone: d.timezone || 'Europe/Lisbon',
          published: Boolean(d.published ?? true),
          active: Boolean(d.active ?? true),
          enabled: Boolean(d.enabled ?? true),
          rewards: d.rewards || [],
          rules: d.rules || { maxDailyMatches: 10, pointDivisor: 10, maxEventPointsPerMatch: 100 },
          scoring: d.scoring || { pointDivisor: 10, maxEventPointsPerMatch: 100 },
          dailyMatchLimit: Number(d.dailyMatchLimit || d.rules?.maxDailyMatches || 10),
          rewardsDistributed: Boolean(d.rewardsDistributed),
        })
      })
    }

    // Se a base de dados ainda não tiver os canónicos, acrescentar
    if (!eventsList.some((e) => e.id === OFFICIAL_PORTO_LISBOA_ID)) {
      eventsList.unshift(OFFICIAL_EVENT_CONFIG_PORTO_LISBOA)
    }
    if (!eventsList.some((e) => e.id === OFFICIAL_PORTUGAL_EM_JOGO_ID)) {
      eventsList.push(OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO)
    }

    // 2. Obter detalhes do evento selecionado
    const targetDocRef = eventsRef.doc(eventId)
    const targetSnap = await targetDocRef.get().catch(() => null)

    const baseEvent =
      eventId === OFFICIAL_PORTUGAL_EM_JOGO_ID
        ? OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO
        : OFFICIAL_EVENT_CONFIG_PORTO_LISBOA

    const currentEvent: OfficialEventConfig = targetSnap?.exists
      ? { ...baseEvent, ...(targetSnap.data() as OfficialEventConfig) }
      : baseEvent

    // 3. Contagem de participantes e estatísticas
    const participantsSnap = await targetDocRef
      .collection('participants')
      .orderBy('eventPoints', 'desc')
      .limit(100)
      .get()
      .catch(() => null)

    const rawParticipants: EventParticipant[] = []
    if (participantsSnap && !participantsSnap.empty) {
      participantsSnap.forEach((docSnap) => {
        const d = docSnap.data() || {}
        rawParticipants.push({
          userId: docSnap.id,
          displayName: d.displayName || 'Jogador',
          photoURL: d.photoURL || null,
          avatar: d.avatar || d.photoURL || null,
          district: d.district || d.distrito || 'Portugal',
          distrito: d.distrito || d.district || 'Portugal',
          eventPoints: Number(d.eventPoints ?? d.points ?? 0),
          points: Number(d.eventPoints ?? d.points ?? 0),
          countedMatches: Number(d.countedMatches ?? d.totalMatches ?? 0),
          totalMatches: Number(d.totalMatches ?? d.countedMatches ?? 0),
          correctAnswers: Number(d.correctAnswers || 0),
          incorrectAnswers: Number(d.incorrectAnswers || 0),
          questionsAnswered: Number(d.questionsAnswered || 0),
          bestScore: Number(d.bestScore || 0),
          totalScore: Number(d.totalScore || 0),
          lastPlayedDate: d.lastPlayedDate,
          lastPlayedAt: d.lastPlayedAt,
          updatedAt: d.updatedAt,
        })
      })
    }

    const sortedRanking = sortEventParticipants(rawParticipants)

    // 4. Se o modo for 'questions' ou detalhado, devolver a pool de perguntas do evento
    let eventQuestions: any[] = []
    if (eventId === OFFICIAL_PORTO_LISBOA_ID) {
      eventQuestions = PORTO_LISBOA_QUESTIONS.map((q) => ({
        ...q,
        active: q.active !== false,
      }))
    }

    return NextResponse.json({
      success: true,
      events: eventsList,
      currentEvent,
      status: getEventStatus(currentEvent),
      statusLabel: getEventStatusLabel(getEventStatus(currentEvent)),
      participantsCount: rawParticipants.length,
      ranking: sortedRanking.slice(0, 50),
      questionsCount: eventQuestions.length,
      questions: mode === 'questions' ? eventQuestions : eventQuestions.slice(0, 20),
    })
  } catch (error: any) {
    console.error('[API ADMIN EVENTS GET ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao carregar dados administrativos de eventos.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, eventId, config } = body

    if (!action || !eventId) {
      return NextResponse.json(
        { error: 'Parâmetros "action" e "eventId" são obrigatórios.' },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()
    const eventDocRef = db.collection('events').doc(eventId)

    if (action === 'update_config') {
      const payload: Record<string, any> = {
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (config.name) payload.name = String(config.name)
      if (config.title) payload.title = String(config.title)
      if (config.subtitle !== undefined) payload.subtitle = String(config.subtitle)
      if (config.description !== undefined) payload.description = String(config.description)
      if (config.startDate) payload.startDate = String(config.startDate)
      if (config.endDate) payload.endDate = String(config.endDate)
      if (config.startAt) payload.startAt = String(config.startAt)
      if (config.endAt) payload.endAt = String(config.endAt)
      if (config.published !== undefined) payload.published = Boolean(config.published)
      if (config.active !== undefined) payload.active = Boolean(config.active)
      if (config.enabled !== undefined) payload.enabled = Boolean(config.enabled)
      if (config.dailyMatchLimit !== undefined) {
        payload.dailyMatchLimit = Number(config.dailyMatchLimit)
        payload['rules.maxDailyMatches'] = Number(config.dailyMatchLimit)
      }
      if (Array.isArray(config.rewards)) payload.rewards = config.rewards

      await eventDocRef.set(payload, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'EVENT_CONFIG_UPDATED',
        entity: 'EVENT',
        entityId: eventId,
        details: `Atualizou configurações do evento ${eventId}`,
        newValue: payload,
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Configurações do evento "${eventId}" atualizadas com sucesso.`,
      })
    }

    if (action === 'seed_event') {
      const baseConfig =
        eventId === OFFICIAL_PORTO_LISBOA_ID
          ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
          : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

      await eventDocRef.set(
        {
          ...baseConfig,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'EVENT_SEEDED',
        entity: 'EVENT',
        entityId: eventId,
        details: `Efetuou o auto-seed do evento ${eventId} no Firestore`,
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Evento "${eventId}" sincronizado e registado com sucesso no Firestore.`,
      })
    }

    return NextResponse.json({ error: `Ação "${action}" desconhecida.` }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN EVENTS POST ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar alteração administrativa do evento.' },
      { status: 500 }
    )
  }
}
