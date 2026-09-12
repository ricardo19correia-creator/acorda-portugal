'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { filterActiveRealPlayers } from '@/lib/real-presence'
import { cn } from '@/lib/utils'

export function HeaderOnlineBadge({ className }: { className?: string }) {
  const { user } = useAuth()
  const [rawDocs, setRawDocs] = useState<any[]>([])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(250))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data && data.userId) {
              docs.push(data)
            }
          })
          setRawDocs(docs)
        },
        (err) => {
          console.debug('[HeaderOnlineBadge] Presença indisponível:', err)
        }
      )
    } catch (err) {
      console.debug('[HeaderOnlineBadge] Falha ao configurar listener:', err)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(interval)
  }, [])

  const community = useMemo(() => {
    return filterActiveRealPlayers(rawDocs, user?.uid, now)
  }, [rawDocs, user?.uid, now])

  const onlineCount = Math.max(1, community.humanOnline)

  return (
    <Link
      href="/jogadores"
      title={`${onlineCount} ${onlineCount === 1 ? 'jogador online' : 'jogadores online'} em Portugal — Clica para ver lista`}
      className={cn(
        'flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all cursor-pointer select-none',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="tabular-nums font-mono text-emerald-400 font-extrabold">{onlineCount}</span>
      <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">online</span>
    </Link>
  )
}
