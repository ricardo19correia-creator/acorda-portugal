import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { ECONOMY_CONFIG } from '@/src/data/economy'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()

    // 1. Amostra de saldo em circulação
    const usersSnap = await db.collection('users').select('coins').limit(500).get().catch(() => ({ docs: [] }))
    let totalSampleCoins = 0
    usersSnap.docs.forEach((d) => {
      const c = Number(d.data()?.coins || 0)
      totalSampleCoins += isNaN(c) ? 0 : c
    })

    // 2. Transações Recentes
    const txSnap = await db.collection('transactions').orderBy('createdAt', 'desc').limit(25).get().catch(() => ({ docs: [] }))
    const recentTransactions = txSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({
      success: true,
      economy: {
        totalCirculatingCoinsSample: totalSampleCoins,
        sampleUsersCount: usersSnap.docs.length,
        config: ECONOMY_CONFIG,
        recentTransactions,
      },
    })
  } catch (error: any) {
    console.error('[API ADMIN ECONOMY GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao obter métricas de economia.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { targetUid, amount, reason } = body

    if (!targetUid || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Parâmetros "targetUid" e "amount" (numérico) são obrigatórios.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(targetUid)
    const snap = await userRef.get()

    if (!snap.exists) {
      return NextResponse.json({ error: 'Jogador não encontrado.' }, { status: 404 })
    }

    const currentCoins = Number(snap.data()?.coins || 0)
    const nextCoins = Math.max(0, currentCoins + amount)

    await userRef.update({
      coins: nextCoins,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Gravar transação
    await db.collection('transactions').add({
      userId: targetUid,
      type: amount >= 0 ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
      amount: Math.abs(amount),
      reason: reason || 'Ajuste manual de saldo pelo Administrador',
      adminUid: authResult.adminUser.uid,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Gravar auditoria
    await recordAdminAuditLog({
      adminUid: authResult.adminUser.uid,
      adminEmail: authResult.adminUser.email,
      action: 'COINS_MANUAL_ADJUSTMENT',
      entity: 'USER_ECONOMY',
      entityId: targetUid,
      details: `${amount >= 0 ? 'Creditou' : 'Debitou'} ${Math.abs(amount)} Moedas Acorda (€). Motivo: ${reason || 'Sem motivo especificado'}`,
      previousValue: { coins: currentCoins },
      newValue: { coins: nextCoins },
      status: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      message: `Saldo atualizado com sucesso. Novo saldo: €${nextCoins}`,
      previousCoins: currentCoins,
      newCoins: nextCoins,
    })
  } catch (error: any) {
    console.error('[API ADMIN ECONOMY POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao ajustar saldo de economia.' }, { status: 500 })
  }
}
