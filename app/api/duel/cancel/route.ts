import { NextRequest, NextResponse } from 'next/server'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (userId) {
      const ticketRef = doc(db, 'duelQueue', userId)
      await deleteDoc(ticketRef)
      console.log('[/api/duel/cancel] User removed from queue:', userId)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[/api/duel/cancel ERROR]:', err)
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}
