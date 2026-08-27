import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { syncBotPopulationState } from '@/lib/bot-network/bot-population-manager'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const status = await syncBotPopulationState()
    return NextResponse.json({ success: true, population: status })
  } catch (error: any) {
    console.error('[API BOT POPULATION GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao avaliar estado da população de bots.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action } = body

    const db = getAdminFirestore()
    const configDocRef = db.collection('adminSettings').doc('bot_population')

    if (action === 'pause_network') {
      await configDocRef.set({ isNetworkPaused: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_NETWORK_PAUSED',
        entity: 'BOT_NETWORK',
        entityId: 'bot_population',
        details: 'Pausou a rede global de desafiantes virtuais.',
        status: 'SUCCESS',
      })

      const status = await syncBotPopulationState()
      return NextResponse.json({ success: true, message: 'Bot Network pausada com sucesso.', population: status })
    }

    if (action === 'resume_network') {
      await configDocRef.set({ isNetworkPaused: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_NETWORK_RESUMED',
        entity: 'BOT_NETWORK',
        entityId: 'bot_population',
        details: 'Retomou a rede global de desafiantes virtuais.',
        status: 'SUCCESS',
      })

      const status = await syncBotPopulationState()
      return NextResponse.json({ success: true, message: 'Bot Network retomada com sucesso.', population: status })
    }

    if (action === 'restart_24h_cycle') {
      await configDocRef.set({
        activationStartTime: Date.now(),
        isNetworkPaused: false,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'BOT_24H_CYCLE_RESTARTED',
        entity: 'BOT_NETWORK',
        entityId: 'bot_population',
        details: 'Reiniciou o ciclo de ativação progressiva de 24 horas.',
        status: 'SUCCESS',
      })

      const status = await syncBotPopulationState()
      return NextResponse.json({ success: true, message: 'Ciclo de 24 horas reiniciado.', population: status })
    }

    return NextResponse.json({ error: `Ação inválida: "${action}"` }, { status: 400 })
  } catch (error: any) {
    console.error('[API BOT POPULATION POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao atualizar população de bots.' }, { status: 500 })
  }
}
