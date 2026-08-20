import { NextRequest, NextResponse } from 'next/server'
import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const sessionId = body?.sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`

    const now = Date.now()
    const cutoff = now - 45_000 // Inativo há mais de 45 segundos

    const sessionDocRef = doc(db, 'presence', sessionId)

    // 1. Regista ou atualiza o ping da sessão atual
    await setDoc(
      sessionDocRef,
      {
        sessionId,
        lastPing: now,
        lastSeen: now,
        online: true,
      },
      { merge: true },
    )

    // 2. Consulta todas as sessões para limpar inativas e contar ativas
    const presenceCol = collection(db, 'presence')
    const snapshot = await getDocs(presenceCol)

    let activeCount = 0
    const deletePromises: Promise<void>[] = []

    for (const d of snapshot.docs) {
      const data = d.data()
      const pingTime = Number(data?.lastPing || data?.lastSeen || 0)

      if (pingTime > cutoff && data?.online !== false) {
        activeCount++
      } else if (pingTime < now - 60_000) {
        // Limpeza passiva de sessões antigas
        deletePromises.push(deleteDoc(d.ref).catch(() => {}))
      }
    }

    if (deletePromises.length > 0) {
      Promise.all(deletePromises).catch(() => {})
    }

    const finalCount = Math.max(1, activeCount)

    return NextResponse.json({
      onlineCount: finalCount,
    })
  } catch (err: any) {
    console.error('[/api/presence/ping ERROR]:', err)
    return NextResponse.json({ onlineCount: 1 })
  }
}
