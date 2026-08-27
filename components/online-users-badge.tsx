'use client'

import React from 'react'
import { usePresence } from '@/components/presence-provider'
import { useOnlineUsers } from '@/hooks/use-online-users'
import { cn } from '@/lib/utils'
import { Swords } from 'lucide-react'

interface OnlineUsersBadgeProps {
  className?: string
  variant?: 'default' | 'hero' | 'header' | 'compact' | 'with-matches'
  showMatches?: boolean
}

export function OnlineUsersBadge({
  className,
  variant = 'default',
  showMatches = false,
}: OnlineUsersBadgeProps) {
  // Obter presença real de humanos via Context
  let presenceData: { onlineCount: number; duelCount: number; playingCount: number } | null = null
  try {
    presenceData = usePresence()
  } catch {
    // Fallback gracioso se fora do provider
  }

  const hookOnline = useOnlineUsers()
  const humanOnlineCount = Math.max(1, presenceData?.onlineCount ?? hookOnline ?? 1)
  const activeMatchesCount = Math.max(0, (presenceData?.duelCount ?? 0) + (presenceData?.playingCount ?? 0))

  if (variant === 'hero') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <div
          className={cn(
            'animate-rise inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-zinc-950/85 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-200 backdrop-blur-xl shadow-lg shadow-emerald-500/20 select-none transition hover:border-emerald-400',
            className,
          )}
          style={{ animationDelay: '60ms' }}
          title={`${humanOnlineCount} pessoas humanas ativas em tempo real`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-emerald-400 font-mono font-black">{humanOnlineCount}</strong>
            <span className="text-emerald-300">
              {humanOnlineCount === 1 ? 'PESSOA ONLINE' : 'PESSOAS ONLINE'}
            </span>
          </span>
        </div>

        {activeMatchesCount > 0 && (
          <div
            className={cn(
              'animate-rise inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-zinc-950/85 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-xl shadow-md select-none',
              className,
            )}
            title={`${activeMatchesCount} partidas ativas agora`}
          >
            <Swords className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono font-bold text-amber-400">{activeMatchesCount}</span>
            <span>{activeMatchesCount === 1 ? 'PARTIDA' : 'PARTIDAS'}</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 bg-zinc-950/80 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-md backdrop-blur-md select-none shrink-0',
          className
        )}
        title={`${humanOnlineCount} pessoas humanas online`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <strong className="text-emerald-400 font-mono font-black text-[11px]">{humanOnlineCount}</strong>
      </div>
    )
  }

  // Header / Default variant
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1 bg-zinc-950/85 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-lg backdrop-blur-md select-none transition-all hover:border-emerald-500/60',
          className,
        )}
        title={`${humanOnlineCount} pessoas humanas online em tempo real`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </span>
        <span className="text-[11px]">
          <strong className="text-emerald-400 font-mono font-black">{humanOnlineCount}</strong> Online
        </span>
      </div>

      {(showMatches || variant === 'with-matches') && activeMatchesCount > 0 && (
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950/85 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-bold shadow-md backdrop-blur-md select-none',
            className
          )}
          title={`${activeMatchesCount} partidas ativas a decorrer`}
        >
          <Swords className="h-3 w-3 text-amber-400" />
          <span className="font-mono text-amber-400">{activeMatchesCount}</span>
          <span>Partidas</span>
        </div>
      )}
    </div>
  )
}

export const OnlinePlayersIndicator = OnlineUsersBadge
