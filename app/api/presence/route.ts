import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDocs, deleteDoc, collection } from 'firebase/firestore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// In-memory fallback map for instant multi-client counting
const localPresence = new Map<string, number>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const clientId = body?.clientId || body?.sessionId || `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`
    const now = Date.now()
    const cutoff = now - 30_000 // 30 segundos

    // 1. Chamar RPC no Supabase com SECURITY DEFINER
    const { data, error } = await supabaseAdmin.rpc('heartbeat_online', {
      p_client_id: clientId,
    })

    if (!error && typeof data === 'number' && data > 0) {
      return NextResponse.json(
        { online: Number(data) || 1, onlineCount: Number(data) || 1 },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
    }

    // 2. Fallback Atómico no Firestore & Memória
    localPresence.set(clientId, now)
    for (const [id, time] of localPresence.entries()) {
      if (time < cutoff) localPresence.delete(id)
    }

    try {
      const docRef = doc(db, 'active_presence', clientId)
      await setDoc(docRef, { clientId, lastSeen: now }, { merge: true })

      const snapshot = await getDocs(collection(db, 'active_presence'))
      let activeFirestoreCount = 0
      const deletePromises: Promise<void>[] = []

      for (const d of snapshot.docs) {
        const dData = d.data()
        const seen = Number(dData?.lastSeen || 0)
        if (seen > cutoff) {
          activeFirestoreCount++
          localPresence.set(d.id, seen)
        } else if (seen < now - 60_000) {
          deletePromises.push(deleteDoc(d.ref).catch(() => {}))
        }
      }

      if (deletePromises.length > 0) {
        Promise.all(deletePromises).catch(() => {})
      }

      const totalCount = Math.max(activeFirestoreCount, localPresence.size, 1)

      return NextResponse.json(
        { online: totalCount, onlineCount: totalCount },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
    } catch {
      const memCount = Math.max(localPresence.size, 1)
      return NextResponse.json(
        { online: memCount, onlineCount: memCount },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
    }
  } catch {
    return NextResponse.json(
      { online: 1, onlineCount: 1 },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )
  }
}

export async function GET() {
  return POST(new NextRequest('https://localhost/api/presence', { method: 'POST' }))
}
