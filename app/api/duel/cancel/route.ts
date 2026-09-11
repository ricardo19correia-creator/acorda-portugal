import { NextRequest, NextResponse } from 'next/server'
import { cancelWaitingRoom, cancelMatchmakingQueue, surrenderDuel } from '@/lib/duel'
import { getAdminAuth } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(idToken).catch(() => null)

    if (!decodedToken || !decodedToken.uid) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const targetUid = decodedToken.uid
    const body = await request.json().catch(() => ({}))
    const { duelId } = body

    if (duelId && targetUid) {
      await surrenderDuel(duelId, targetUid).catch(() => {})
      await cancelWaitingRoom(duelId, targetUid).catch(() => {})
      console.log('[/api/duel/cancel] Duel surrendered/cancelled:', duelId, targetUid)
    }

    if (targetUid) {
      await cancelMatchmakingQueue(targetUid).catch(() => {})
      console.log('[/api/duel/cancel] User removed from queue:', targetUid)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[/api/duel/cancel ERROR]:', err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}
