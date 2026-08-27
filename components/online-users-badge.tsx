'use client'

import React, { useState } from 'react'
import { usePresence } from '@/components/presence-provider'
import { useOnlineUsers } from '@/hooks/use-online-users'
import { cn } from '@/lib/utils'
import { Swords } from 'lucide-react'
import { OnlinePlayersModal } from './online-players-modal'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Obter presença real de humanos via Context
  let presenceData: {
    onlineCount: number
    duelCount: number
    playingCount: number
    activeUsers: Array<{ id: string; username: string; photoURL?: string | null; level: number; district: string }>
  } | null = null

  try {
    presenceData = usePresence()
  } catch {
    // Fallback gracioso se fora do provider
  }

  const hookOnline = useOnlineUsers()
  const humanOnlineCount = Math.max(1, presenceData?.onlineCount ?? hookOnline ?? 1)
  const activeMatchesCount = Math.max(0, (presenceData?.duelCount ?? 0) + (presenceData?.playingCount ?? 0))
  const activeUsers = presenceData?.activeUsers || []

  const previewUsers = activeUsers.slice(0, 3)

  if (variant === 'hero') {
    return (
      <>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              'animate-rise inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-zinc-950/85 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-zinc-200 backdrop-blur-xl shadow-lg shadow-emerald-500/20 select-none transition hover:border-emerald-400 hover:scale-105 active:scale-95 cursor-pointer',
              className,
            )}
            style={{ animationDelay: '60ms' }}
            title="Clica para ver os jogadores reais online"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            </span>

            {/* Mini Avatares Previews */}
            {previewUsers.length > 0 && (
              <div className="flex -space-x-1.5 items-center mr-0.5">
                {previewUsers.map((u, i) => (
                  <img
                    key={u.id || i}
                    src={u.photoURL || '/images/avatars/camoes-2050.jpg'}
                    alt={u.username}
                    className="h-4.5 w-4.5 rounded-full border border-zinc-950 object-cover bg-zinc-900"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/images/avatars/camoes-2050.jpg'
                    }}
                  />
                ))}
              </div>
            )}

            <span className="flex items-center gap-1">
              <strong className="text-emerald-400 font-mono font-black">{humanOnlineCount}</strong>
              <span className="text-emerald-300">
                {humanOnlineCount === 1 ? 'PESSOA ONLINE' : 'PESSOAS ONLINE'}
              </span>
            </span>
          </button>

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

        <OnlinePlayersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 bg-zinc-950/80 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-md backdrop-blur-md select-none shrink-0 hover:border-emerald-400 transition cursor-pointer',
            className
          )}
          title={`${humanOnlineCount} humanos online. Clica para ver lista.`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <strong className="text-emerald-400 font-mono font-black text-[11px]">{humanOnlineCount}</strong>
        </button>

        <OnlinePlayersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  // Header / Default variant
  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'flex items-center gap-2 px-3 py-1 bg-zinc-950/85 border border-emerald-500/30 rounded-full text-xs text-zinc-200 font-semibold shadow-lg backdrop-blur-md select-none transition-all hover:border-emerald-500/60 hover:scale-105 active:scale-95 cursor-pointer',
            className,
          )}
          title={`${humanOnlineCount} humanos online em tempo real. Clica para ver quem está ativo.`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <span className="text-[11px]">
            <strong className="text-emerald-400 font-mono font-black">{humanOnlineCount}</strong> Online
          </span>
        </button>

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

      <OnlinePlayersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export const OnlinePlayersIndicator = OnlineUsersBadge
