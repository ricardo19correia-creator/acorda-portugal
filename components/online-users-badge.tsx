'use client'

import React from 'react'
import { useOnlineUsers } from '@/hooks/use-online-users'
import { cn } from '@/lib/utils'

interface OnlineUsersBadgeProps {
  className?: string
  variant?: 'default' | 'hero' | 'header' | 'compact'
}

export function OnlineUsersBadge({ className, variant = 'default' }: OnlineUsersBadgeProps) {
  const onlineCount = useOnlineUsers()

  // Garante contagem mínima de 1 (o próprio utilizador conectado)
  const displayCount = Math.max(1, onlineCount)

  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'animate-rise inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-zinc-900/85 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-200 backdrop-blur-xl shadow-lg shadow-emerald-500/20 select-none transition hover:border-emerald-400',
          className,
        )}
        style={{ animationDelay: '60ms' }}
        title={`${displayCount} jogadores ativos em tempo real em Portugal`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
        </span>
        <span className="flex items-center gap-1">
          <strong className="text-emerald-400 font-mono font-black">{displayCount}</strong>
          <span className="text-emerald-300">
            {displayCount === 1 ? 'JOGADOR ATIVO' : 'JOGADORES ATIVOS'}
          </span>
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 bg-zinc-900/80 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-md backdrop-blur-md select-none shrink-0',
          className
        )}
        title={`${displayCount} jogadores online em tempo real`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <strong className="text-emerald-400 font-mono font-black text-[11px]">{displayCount}</strong>
      </div>
    )
  }

  // Header / Default variant
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1 bg-zinc-900/80 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-lg backdrop-blur-md select-none transition-all hover:border-emerald-500/60',
        className,
      )}
      title={`${displayCount} conexões ativas em tempo real`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
      </span>
      <span>
        <strong className="text-emerald-400 font-mono font-black">{displayCount}</strong> Online
      </span>
    </div>
  )
}
