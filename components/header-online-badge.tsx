'use client'

import React from 'react'
import Link from 'next/link'
import { useLivePresence } from '@/hooks/use-live-presence'
import { cn } from '@/lib/utils'

export function HeaderOnlineBadge({ className }: { className?: string }) {
  const { humanOnline } = useLivePresence()
  const onlineCount = humanOnline

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

