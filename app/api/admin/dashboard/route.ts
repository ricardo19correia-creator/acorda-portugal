import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { QuestionRegistry } from '@/lib/question-system/registry'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()

    // 1. Contagem de Perguntas do Registry Oficial
    const registry = QuestionRegistry.getInstance()
    const allQuestions = registry.getAllQuestions()
    const statsReport = registry.getSystemStats()

    // 2. Utilizadores e Presença
    const usersCountSnap = await db.collection('users').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    const totalUsers = usersCountSnap.data().count

    const nowMs = Date.now()
    const presenceSnap = await db.collection('presence').get().catch(() => ({ size: 0, docs: [] }))
    const onlineHumans = Math.max(1, presenceSnap.docs.filter((d: any) => {
      const data = d.data()
      return data.online === true || (data.lastActive && data.lastActive >= nowMs - 45_000)
    }).length)

    // 3. Bots Registados
    const botsSnap = await db.collection('botPlayers').get().catch(() => ({ size: 0, docs: [] }))
    const bots = botsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const activeBots = bots.filter((b: any) => b.status === 'ACTIVE').length
    const inMatchBots = bots.filter((b: any) => b.status === 'IN_MATCH').length

    // 4. Partidas 1v1 em Curso e Concluídas
    const activeDuelsSnap = await db.collection('duels').where('status', 'in', ['waiting', 'matched', 'playing']).get().catch(() => ({ size: 0, docs: [] }))
    const activeMatchesCount = activeDuelsSnap.size

    const completedGamesCountSnap = await db.collection('games').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    const completedMatchesCount = completedGamesCountSnap.data().count

    // 5. Alertas Administrativos Ativos
    const alertsSnap = await db.collection('adminAlerts').orderBy('timestamp', 'desc').limit(10).get().catch(() => ({ docs: [] }))
    const alerts = alertsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // 6. Configurações Globais
    const settingsDoc = await db.collection('adminSettings').doc('global').get().catch(() => null)
    const settings = settingsDoc?.exists ? settingsDoc.data() : {
      multiplayerEnabled: true,
      botsEnabled: true,
      maintenanceMode: false,
      matchmakingWindowSeconds: 15,
      botFallbackSeconds: 10,
    }

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          onlineHumans,
          activeBots,
          inMatchBots,
          activeMatchesCount,
          completedMatchesCount,
          totalQuestions: allQuestions.length,
          publishedQuestions: allQuestions.length,
          questionsInReview: 0,
          categoriesCount: statsReport.totalThemes,
          subcategoriesCount: statsReport.totalSubthemes,
          alertsCount: alerts.length,
        },
        settings,
        recentAlerts: alerts,
      },
    })
  } catch (error: any) {
    console.error('[API ADMIN DASHBOARD ERROR]', error)
    return NextResponse.json({ error: 'Erro ao carregar dados do Dashboard.' }, { status: 500 })
  }
}
