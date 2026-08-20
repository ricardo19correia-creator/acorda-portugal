'use client'

import React from 'react'
import { usePresence } from '@/components/presence-provider'
import { cn } from '@/lib/utils'

interface OnlineUsersBadgeProps {
  className?: string
  variant?: 'default' | 'hero' | 'header' | 'compact'
}

export function OnlineUsersBadge({ className, variant = 'default' }: OnlineUsersBadgeProps) {
  const { onlineCount, loading } = usePresence()

  // Garante contagem mínima de 1 (o utilizador atual)
  const displayCount = loading ? 1 : Math.max(1, onlineCount)

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-zinc-900/80 px-2.5 py-1 text-[0.7rem] font-semibold text-zinc-200 backdrop-blur-md shadow-sm shadow-emerald-500/10 select-none',
          className,
        )}
        title={`${displayCount} jogadores ativos em tempo real`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <span>
          <strong className="font-black text-emerald-400 font-mono">{displayCount}</strong> Online
        </span>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'animate-rise inline-flex items-center gap-2 rounded-full border border-emerald-500/35 bg-zinc-900/85 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-xl shadow-lg shadow-emerald-500/15 select-none transition hover:border-emerald-400/60',
          className,
        )}
        style={{ animationDelay: '60ms' }}
        title={`${displayCount} jogadores ativos em tempo real em Portugal`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
        </span>
        <span className="flex items-center gap-1">
          <span className="font-bold text-foreground">
            <strong className="font-black text-emerald-400 font-mono">{displayCount}</strong>{' '}
            {displayCount === 1 ? 'Tuga Online' : 'Tugas a Jogar Agora'}
          </span>
        </span>
      </div>
    )
  }

  // Variant 'header' & 'default'
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md shadow-md shadow-emerald-500/10 select-none transition-colors hover:border-emerald-500/50',
        className,
      )}
      title={`${displayCount} jogadores ativos em tempo real`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
      </span>
      <span>
        <strong className="font-black text-emerald-400 font-mono">{displayCount}</strong>{' '}
        {displayCount === 1 ? 'Jogador Online' : 'Jogadores Online'}
      </span>
    </div>
  )
}
