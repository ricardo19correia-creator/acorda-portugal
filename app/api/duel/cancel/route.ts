import { NextRequest, NextResponse } from 'next/server'
import { cancelWaitingRoom, cancelMatchmakingQueue, surrenderDuel } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, uid, duelId } = body
    const targetUid = userId || uid

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
