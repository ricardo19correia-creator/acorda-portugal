import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { QuestionRegistry } from '@/lib/question-system/registry'
import type { Question } from '@/src/types/quiz'
import {
  OFFICIAL_PORTUGAL_EM_JOGO_ID,
  OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO,
  OFFICIAL_PORTO_LISBOA_ID,
  OFFICIAL_EVENT_CONFIG_PORTO_LISBOA,
  getLisbonDateString,
  type OfficialEventConfig,
} from '@/lib/events-service'
import { PORTO_LISBOA_QUESTIONS } from '@/lib/data/porto-lisboa-questions'

export const dynamic = 'force-dynamic'

/**
 * Categorias elegíveis para o evento "PORTUGAL EM JOGO":
 * História de Portugal, Geografia, Cultura, Tradições, Sociedade,
 * Atualidade, Desporto, Futebol Português, Curiosidades, Personalidades,
 * Património e Desafio Nacional.
 * EXCLUI terminantemente qualquer Modo Maluco / Perguntas Idiotas.
 */
const ELIGIBLE_THEME_SLUGS = new Set([
  'portugal',
  'historia',
  'geografia',
  'cultura',
  'personalidades',
  'desporto',
  'futebol-portugues',
  'atualidade',
  'portugal-politico',
  'empresas-portuguesas',
  'gastronomia',
  'ciencia-tecnologia',
  'cinema-tv',
  'musica',
  'desafio-nacional',
])

function isEligibleEventQuestion(q: Question): boolean {
  if (!q || !q.id || !q.question) return false
  const catLower = (q.category || '').toLowerCase().trim()
  const qIdLower = String(q.id).toLowerCase()

  // Bloqueio absoluto de modo maluco / perguntas idiotas
  if (
    catLower.includes('maluco') ||
    catLower.includes('idiota') ||
    qIdLower.startsWith('mm_')
  ) {
    return false
  }

  // Verifica se a categoria é elegível
  if (ELIGIBLE_THEME_SLUGS.has(catLower)) return true
  if (catLower === 'desafio nacional' || catLower === 'geral') return true

  // Se for uma pergunta do Desafio Nacional
  if (qIdLower.startsWith('dn_') || qIdLower.startsWith('q_dn_')) return true

  return true
}

/**
 * Algoritmo Fisher-Yates seguro
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Token de sessão obrigatório.' },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      )
    }

    const userId = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const {
      eventId: requestedEventId,
      eventSlug = 'primeiro-desafio-nacional-portugal-em-jogo',
      matchId,
      gameType,
    } = body

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId obrigatório.' }, { status: 400 })
    }

    if (!requestedEventId || typeof requestedEventId !== 'string') {
      return NextResponse.json(
        { error: 'eventId obrigatório para inicializar partida de evento.' },
        { status: 400 }
      )
    }

    if (gameType && gameType !== 'event') {
      return NextResponse.json(
        { error: 'Apenas partidas com gameType === "event" podem ser inicializadas no evento.' },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()
    const targetEventId = requestedEventId

    const isPortoLisboa =
      targetEventId === OFFICIAL_PORTO_LISBOA_ID ||
      eventSlug.includes('porto') ||
      eventSlug.includes('duelo')

    const baseEventConfig = isPortoLisboa
      ? OFFICIAL_EVENT_CONFIG_PORTO_LISBOA
      : OFFICIAL_EVENT_CONFIG_PORTUGAL_EM_JOGO

    // 1. Obter e validar o evento oficial no Firestore
    const eventDocRef = db.collection('events').doc(targetEventId)
    const eventSnap = await eventDocRef.get().catch(() => null)

    let eventConfig: OfficialEventConfig = baseEventConfig
    if (eventSnap && eventSnap.exists) {
      eventConfig = {
        ...baseEventConfig,
        ...(eventSnap.data() as OfficialEventConfig),
      }
    }

    // 2. Validação Temporal: Europe/Lisbon
    const nowMs = Date.now()
    const startStr = eventConfig.startDate || eventConfig.startAt || baseEventConfig.startDate
    const endStr = eventConfig.endDate || eventConfig.endAt || baseEventConfig.endDate
    const startMs = new Date(startStr).getTime()
    const endMs = new Date(endStr).getTime()

    if (nowMs < startMs) {
      return NextResponse.json(
        {
          error: `O evento ainda não iniciou. Início previsto: ${startStr}.`,
          status: 'upcoming',
        },
        { status: 403 }
      )
    }

    if (nowMs > endMs) {
      return NextResponse.json(
        {
          error: `O evento já terminou em ${endStr}. Não são aceites novas partidas.`,
          status: 'ended',
        },
        { status: 403 }
      )
    }

    // 2.1 Validação de Equipa Obrigatória para o Grande Duelo (Porto vs Lisboa)
    let userTeam: string | null = null
    if (isPortoLisboa) {
      const participantDoc = await eventDocRef.collection('participants').doc(userId).get().catch(() => null)
      if (participantDoc && participantDoc.exists) {
        userTeam = participantDoc.data()?.team || null
      }
      if (!userTeam) {
        const userDoc = await db.collection('users').doc(userId).get().catch(() => null)
        if (userDoc && userDoc.exists) {
          userTeam = userDoc.data()?.events?.[targetEventId]?.team || null
        }
      }

      if (!userTeam) {
        return NextResponse.json(
          {
            error: 'Precisas de escolher o teu lado (Porto 🔵 ou Lisboa 🔴) antes de entrar na primeira partida do Grande Duelo.',
            code: 'TEAM_REQUIRED',
            requireTeamSelection: true,
          },
          { status: 400 }
        )
      }
    }

    // 3. Verificar se a partida já existe na subcoleção matches do evento (idempotência de início)
    const matchDocRef = eventDocRef.collection('matches').doc(matchId)
    const existingMatchSnap = await matchDocRef.get().catch(() => null)

    const registry = QuestionRegistry.getInstance()

    if (existingMatchSnap && existingMatchSnap.exists) {
      const matchData = existingMatchSnap.data() || {}
      if (matchData.userId !== userId) {
        return NextResponse.json(
          { error: 'Esta partida não pertence à conta autenticada.' },
          { status: 403 }
        )
      }

      // Se já existia, recuperar as perguntas guardadas
      const savedQIds: string[] = Array.isArray(matchData.questionIds) ? matchData.questionIds : []
      const restoredQuestions: Question[] = []
      for (const qid of savedQIds) {
        const found = registry.getQuestionById(qid)
        if (found) restoredQuestions.push(found)
      }

      if (restoredQuestions.length >= 10) {
        return NextResponse.json({
          success: true,
          matchId,
          eventId: targetEventId,
          eventSlug,
          isResumed: true,
          questions: restoredQuestions,
        })
      }
    }

    // 4. Carregar Histórico Anti-Repetição Global do Jogador
    const answeredIdsSet = new Set<string>()

    try {
      // 4.1 Documento raiz do histórico do utilizador
      const historyRootRef = db.collection('userQuestionHistory').doc(userId)
      const [historyRootSnap, userSnap] = await Promise.all([
        historyRootRef.get().catch(() => null),
        db.collection('users').doc(userId).get().catch(() => null),
      ])

      if (historyRootSnap && historyRootSnap.exists) {
        const data = historyRootSnap.data() || {}
        const recent = Array.isArray(data.recentQuestionIds) ? data.recentQuestionIds : []
        recent.forEach((id: any) => answeredIdsSet.add(String(id)))
      }

      if (userSnap && userSnap.exists) {
        const uData = userSnap.data() || {}
        const answered = Array.isArray(uData.answeredQuestionIds) ? uData.answeredQuestionIds : []
        answered.forEach((id: any) => answeredIdsSet.add(String(id)))
      }

      // 4.2 Chunks particionados de histórico
      const chunksSnap = await historyRootRef.collection('chunks').limit(5).get().catch(() => null)
      if (chunksSnap && !chunksSnap.empty) {
        chunksSnap.forEach((chunkDoc) => {
          const cData = chunkDoc.data() || {}
          if (Array.isArray(cData.questionIds)) {
            cData.questionIds.forEach((id: any) => answeredIdsSet.add(String(id)))
          }
        })
      }
    } catch (histErr) {
      console.warn('[EVENT_INIT_HISTORY_WARN] Falha menor ao ler histórico cloud:', histErr)
    }

    // 5. Filtrar perguntas elegíveis
    let eligiblePool: Question[] = []
    if (isPortoLisboa) {
      const plQuestions = registry.getPortoLisboaQuestions()
      eligiblePool = plQuestions && plQuestions.length > 0 ? plQuestions : PORTO_LISBOA_QUESTIONS
    } else {
      const allQuestions = registry.getAllQuestions()
      eligiblePool = allQuestions.filter(isEligibleEventQuestion)
    }

    // Separar entre não respondidas e já respondidas
    const unseenPool: Question[] = []
    const seenPool: Question[] = []

    for (const q of eligiblePool) {
      if (answeredIdsSet.has(String(q.id))) {
        seenPool.push(q)
      } else {
        unseenPool.push(q)
      }
    }

    // 6. Selecionar 10 perguntas garantindo diversidade temática
    const selected: Question[] = []
    const shuffledUnseen = shuffleArray(unseenPool)

    // Agrupar por tema / universo para garantir equilíbrio
    const byCategory = new Map<string, Question[]>()
    for (const q of shuffledUnseen) {
      const cat = isPortoLisboa
        ? ((q as any).universe || q.subcategory || 'porto').toLowerCase()
        : (q.category || 'portugal').toLowerCase()
      if (!byCategory.has(cat)) byCategory.set(cat, [])
      byCategory.get(cat)!.push(q)
    }

    // Round-robin por categoria/universo
    const catKeys = Array.from(byCategory.keys())
    let round = 0
    while (selected.length < 10 && catKeys.length > 0 && round < 10) {
      for (const k of catKeys) {
        if (selected.length >= 10) break
        const list = byCategory.get(k)
        if (list && list.length > 0) {
          const q = list.pop()!
          selected.push(q)
        }
      }
      round++
    }

    // Fallback: se não atingiu 10 com round-robin, preencher com perguntas não vistas
    if (selected.length < 10) {
      for (const q of shuffledUnseen) {
        if (selected.length >= 10) break
        if (!selected.some((s) => s.id === q.id)) {
          selected.push(q)
        }
      }
    }

    // Fallback absoluto: se o jogador já esgotou praticamente todas as perguntas do ecossistema,
    // utilizar as perguntas elegíveis vistas mais antigas para nunca bloquear a partida
    if (selected.length < 10) {
      const shuffledSeen = shuffleArray(seenPool)
      for (const q of shuffledSeen) {
        if (selected.length >= 10) break
        if (!selected.some((s) => s.id === q.id)) {
          selected.push(q)
        }
      }
    }

    const finalQuestions = selected.slice(0, 10)
    const finalQuestionIds = finalQuestions.map((q) => String(q.id))

    // 7. Registar a partida como ativa no backend
    const lisbonDateStr = getLisbonDateString()
    await matchDocRef.set(
      {
        matchId,
        id: matchId,
        gameType: 'event',
        eventId: targetEventId,
        eventSlug,
        userId,
        team: userTeam || null,
        status: 'in_progress',
        questionIds: finalQuestionIds,
        date: lisbonDateStr,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    // 8. Reservar perguntas no histórico do utilizador (anti-repetição)
    try {
      const userRef = db.collection('users').doc(userId)
      await userRef.update({
        answeredQuestionIds: FieldValue.arrayUnion(...finalQuestionIds),
        lastMatchStartedAt: FieldValue.serverTimestamp(),
      }).catch(() => null)
    } catch {}

    return NextResponse.json({
      success: true,
      matchId,
      eventId: targetEventId,
      eventSlug,
      team: userTeam || null,
      isResumed: false,
      questions: finalQuestions,
    })
  } catch (error: any) {
    console.error('[API /api/events/match/init ERROR]:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao inicializar partida do evento.' },
      { status: 500 }
    )
  }
}
