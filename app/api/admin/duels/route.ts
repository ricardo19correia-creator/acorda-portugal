import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()

    // 1. Duelos ativos (playing, waiting, matched)
    const duelsSnap = await db
      .collection('duels')
      .where('status', 'in', ['waiting', 'matched', 'playing'])
      .limit(50)
      .get()

    const activeDuels = duelsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    // 2. Fila de Matchmaking ativa
    const queueSnap = await db.collection('duelQueue').limit(30).get().catch(() => ({ docs: [] }))
    const queueTickets = queueSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // 3. Histórico recente de jogos terminados
    const finishedSnap = await db.collection('games').orderBy('createdAt', 'desc').limit(20).get().catch(() => ({ docs: [] }))
    const recentFinishedGames = finishedSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({
      success: true,
      activeDuels,
      queueTickets,
      recentFinishedGames,
      summary: {
        activeCount: activeDuels.length,
        queueCount: queueTickets.length,
        finishedCount: recentFinishedGames.length,
      },
    })
  } catch (error: any) {
    console.error('[API ADMIN DUELS GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao consultar multiplayer.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, duelId, reason } = body

    const db = getAdminFirestore()

    if (action === 'terminate_duel' && duelId) {
      const duelRef = db.collection('duels').doc(duelId)
      const snap = await duelRef.get()

      if (!snap.exists) {
        return NextResponse.json({ error: 'Duelo não encontrado.' }, { status: 404 })
      }

      await duelRef.update({
        status: 'cancelled',
        terminatedByAdmin: true,
        terminationReason: reason || 'Terminado pelo Administrador no Centro de Controlo.',
        updatedAt: FieldValue.serverTimestamp(),
      })

      await recordAdminAuditLog({
        adminUid: authResult.adminUser.uid,
        adminEmail: authResult.adminUser.email,
        action: 'DUEL_FORCE_TERMINATE',
        entity: 'DUEL',
        entityId: duelId,
        details: `Terminou forçadamente o duelo ${duelId}. Motivo: ${reason || 'Sem motivo especificado'}`,
        status: 'SUCCESS',
      })

      return NextResponse.json({ success: true, message: `Duelo ${duelId} cancelado com sucesso.` })
    }

    return NextResponse.json({ error: `Ação inválida: "${action}"` }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN DUELS POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao processar ação de duelo.' }, { status: 500 })
  }
}
