import { NextRequest, NextResponse } from 'next/server'
import { cancelWaitingRoom, cancelMatchmakingQueue } from '@/lib/duel'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, duelId } = body

    if (duelId) {
      await cancelWaitingRoom(duelId, userId).catch(() => {})
      console.log('[/api/duel/cancel] Waiting room cancelled:', duelId)
    }

    if (userId) {
      await cancelMatchmakingQueue(userId).catch(() => {})
      console.log('[/api/duel/cancel] User removed from queue:', userId)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[/api/duel/cancel ERROR]:', err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}

