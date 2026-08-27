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
    const { searchParams } = new URL(req.url)
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase()
    const districtFilter = searchParams.get('district') || 'all'
    const statusFilter = searchParams.get('status') || 'all'
    const limitCount = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)))

    const db = getAdminFirestore()
    let queryRef = db.collection('users').limit(limitCount * 2)

    const snap = await queryRef.get()
    let players = snap.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
    })) as any[]

    // Filtragem em memória para flexibilidade de pesquisa
    if (searchQuery) {
      players = players.filter((p) => {
        const name = (p.displayName || '').toLowerCase()
        const username = (p.username || '').toLowerCase()
        const email = (p.email || '').toLowerCase()
        const uid = (p.uid || '').toLowerCase()
        return (
          name.includes(searchQuery) ||
          username.includes(searchQuery) ||
          email.includes(searchQuery) ||
          uid.includes(searchQuery)
        )
      })
    }

    if (districtFilter !== 'all') {
      players = players.filter((p) => (p.district || '').toLowerCase() === districtFilter.toLowerCase())
    }

    if (statusFilter !== 'all') {
      players = players.filter((p) => {
        const status = p.accountStatus || (p.banned ? 'BANNED' : p.suspended ? 'SUSPENDED' : 'ACTIVE')
        return status.toLowerCase() === statusFilter.toLowerCase()
      })
    }

    players = players.slice(0, limitCount)

    return NextResponse.json({
      success: true,
      players,
      totalCount: players.length,
    })
  } catch (error: any) {
    console.error('[API ADMIN PLAYERS GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao listar jogadores.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized || !authResult.adminUser) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, targetUid, data } = body

    if (!action || !targetUid) {
      return NextResponse.json({ error: 'Parâmetros "action" e "targetUid" são obrigatórios.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const userDocRef = db.collection('users').doc(targetUid)
    const userSnap = await userDocRef.get()

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Jogador não encontrado.' }, { status: 404 })
    }

    const prevData = userSnap.data() || {}
    let updatePayload: Record<string, any> = { updatedAt: FieldValue.serverTimestamp() }
    let actionDescription = ''

    switch (action) {
      case 'ban':
        updatePayload.banned = true
        updatePayload.accountStatus = 'BANNED'
        updatePayload.banReason = data?.reason || 'Violou as regras da comunidade.'
        actionDescription = `Baniu o jogador ${prevData.displayName || targetUid}: ${updatePayload.banReason}`
        break

      case 'suspend':
        updatePayload.suspended = true
        updatePayload.accountStatus = 'SUSPENDED'
        updatePayload.suspendedUntil = data?.until || null
        updatePayload.suspendReason = data?.reason || 'Suspensão temporária preventiva.'
        actionDescription = `Suspendeu o jogador ${prevData.displayName || targetUid}`
        break

      case 'restore':
        updatePayload.banned = false
        updatePayload.suspended = false
        updatePayload.accountStatus = 'ACTIVE'
        updatePayload.banReason = null
        updatePayload.suspendReason = null
        actionDescription = `Restaurou a conta do jogador ${prevData.displayName || targetUid}`
        break

      case 'update_stats':
        if (typeof data?.coins === 'number') updatePayload.coins = Math.max(0, data.coins)
        if (typeof data?.level === 'number') updatePayload.level = Math.max(1, data.level)
        if (typeof data?.xp === 'number') updatePayload.xp = Math.max(0, data.xp)
        if (typeof data?.district === 'string') updatePayload.district = data.district
        actionDescription = `Alterou estatísticas do jogador ${prevData.displayName || targetUid}`
        break

      case 'adjust_coins':
        const delta = Number(data?.amount || 0)
        const currentCoins = Number(prevData.coins || 0)
        const finalCoins = Math.max(0, currentCoins + delta)
        updatePayload.coins = finalCoins
        actionDescription = `${delta >= 0 ? 'Adicionou' : 'Removeu'} ${Math.abs(delta)} moedas ao jogador ${prevData.displayName || targetUid}. Motivo: ${data?.reason || 'Ajuste administrativo'}`
        break

      default:
        return NextResponse.json({ error: `Ação desconhecida: "${action}"` }, { status: 400 })
    }

    await userDocRef.update(updatePayload)

    // Gravar no log de auditoria
    await recordAdminAuditLog({
      adminUid: authResult.adminUser.uid,
      adminEmail: authResult.adminUser.email,
      action: `PLAYER_${action.toUpperCase()}`,
      entity: 'USER',
      entityId: targetUid,
      details: actionDescription,
      previousValue: prevData,
      newValue: { ...prevData, ...updatePayload },
      status: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      message: actionDescription,
      updatedUser: { ...prevData, ...updatePayload },
    })
  } catch (error: any) {
    console.error('[API ADMIN PLAYERS POST ERROR]', error)
    return NextResponse.json({ error: error.message || 'Erro ao executar ação administrativa.' }, { status: 500 })
  }
}
