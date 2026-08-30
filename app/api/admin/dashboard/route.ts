import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { QuestionRegistry } from '@/lib/question-system/registry'
import { getActiveNpcs } from '@/lib/npc-system/npc-schedule-engine'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    let db: any = null
    try {
      const { getAdminFirestore } = await import('@/lib/firebase-admin')
      db = getAdminFirestore()
    } catch {}

    // 1. Contagem de Perguntas do Registry Oficial
    const registry = QuestionRegistry.getInstance()
    const allQuestions = registry.getAllQuestions()
    const statsReport = registry.getSystemStats()

    // 2. Utilizadores e Presença
    let totalUsers = 0
    let onlineHumans = 0
    let activeMatchesCount = 0
    let completedMatchesCount = 0
    let alerts: any[] = []
    let settings: any = {
      multiplayerEnabled: true,
      maintenanceMode: false,
      matchmakingWindowSeconds: 30,
    }

    const nowMs = Date.now()

    if (db) {
      const usersCountSnap = await db.collection('users').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
      totalUsers = usersCountSnap.data().count

      const presenceSnap = await db.collection('presence').get().catch(() => ({ size: 0, docs: [] }))
      onlineHumans = presenceSnap.docs.filter((d: any) => {
        const data = d.data()
        return data.online === true || (data.lastSeen && data.lastSeen >= nowMs - 45_000)
      }).length

      const activeDuelsSnap = await db.collection('duels').where('status', 'in', ['waiting', 'matched', 'playing']).get().catch(() => ({ size: 0, docs: [] }))
      activeMatchesCount = activeDuelsSnap.size

      const completedGamesCountSnap = await db.collection('games').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
      completedMatchesCount = completedGamesCountSnap.data().count

      const alertsSnap = await db.collection('adminAlerts').orderBy('timestamp', 'desc').limit(10).get().catch(() => ({ docs: [] }))
      alerts = alertsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))

      const settingsDoc = await db.collection('adminSettings').doc('global').get().catch(() => null)
      if (settingsDoc?.exists) {
        settings = settingsDoc.data()
      }
    }

    const { npcCount } = getActiveNpcs(new Date(nowMs))
    const totalVisibleOnline = onlineHumans + npcCount

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          onlineHumans,
          npcOnline: npcCount,
          totalVisibleOnline,
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
