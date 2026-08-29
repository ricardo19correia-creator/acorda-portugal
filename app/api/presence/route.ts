import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDocs, deleteDoc, collection } from 'firebase/firestore'
import { getActiveNpcs } from '@/lib/npc-system/npc-schedule-engine'

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

    const { npcCount } = getActiveNpcs(new Date(now))

    // 1. Chamar RPC no Supabase com SECURITY DEFINER
    const { data, error } = await supabaseAdmin.rpc('heartbeat_online', {
      p_client_id: clientId,
    })

    if (!error && typeof data === 'number') {
      const humanOnline = Number(data)
      return NextResponse.json(
        { online: humanOnline, onlineCount: humanOnline, humanOnline, npcOnline: npcCount },
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

      const humanOnline = Math.max(activeFirestoreCount, localPresence.size)

      return NextResponse.json(
        { online: humanOnline, onlineCount: humanOnline, humanOnline, npcOnline: npcCount },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
    } catch {
      const humanOnline = localPresence.size
      return NextResponse.json(
        { online: humanOnline, onlineCount: humanOnline, humanOnline, npcOnline: npcCount },
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
    const { npcCount } = getActiveNpcs(new Date())
    return NextResponse.json(
      { online: 0, onlineCount: 0, humanOnline: 0, npcOnline: npcCount },
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
