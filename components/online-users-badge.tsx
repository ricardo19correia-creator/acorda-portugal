'use client'

import React, { useState } from 'react'
import { usePresence } from '@/components/presence-provider'
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

  const { onlineCount, activeMatches, activeUsers } = usePresence()

  const visibleOnlineCount = onlineCount
  const activeMatchesCount = activeMatches
  const previewUsers = (activeUsers || []).slice(0, 3)

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
            title="Clica para ver os jogadores online em Portugal"
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
              <strong className="text-emerald-400 font-mono font-black">{visibleOnlineCount}</strong>
              <span className="text-emerald-300">
                {visibleOnlineCount === 1 ? 'PESSOA ONLINE' : 'PESSOAS ONLINE'}
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

  if (variant === 'header' || variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95 cursor-pointer',
            className,
          )}
          title="Ver participantes em direto"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono font-black">{visibleOnlineCount}</span>
          <span className="hidden sm:inline">online</span>
        </button>

        <OnlinePlayersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/80 px-3 py-1 text-xs font-bold text-zinc-200 backdrop-blur transition hover:border-emerald-400 active:scale-95 cursor-pointer',
          className,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono font-black text-emerald-400">{visibleOnlineCount}</span>
        <span>online</span>
      </button>

      <OnlinePlayersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
