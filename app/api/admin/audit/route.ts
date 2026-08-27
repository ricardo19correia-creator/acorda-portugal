import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const limitCount = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)))
    const actionFilter = searchParams.get('action') || 'all'

    const db = getAdminFirestore()
    let queryRef = db.collection('adminAuditLogs').orderBy('timestamp', 'desc').limit(limitCount)

    const snap = await queryRef.get()
    let logs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))

    if (actionFilter !== 'all') {
      logs = logs.filter((l: any) => l.action?.toLowerCase().includes(actionFilter.toLowerCase()))
    }

    return NextResponse.json({
      success: true,
      logs,
      totalCount: logs.length,
    })
  } catch (error: any) {
    console.error('[API ADMIN AUDIT GET ERROR]', error)
    return NextResponse.json({ error: 'Erro ao obter logs de auditoria.' }, { status: 500 })
  }
}
