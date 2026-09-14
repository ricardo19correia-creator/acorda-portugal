'use client'

import React from 'react'
import { X, MapPin, Shield, Crosshair, Navigation } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { ResolvedPlayerPin } from '@/src/hooks/usePortugalVivoData'

interface PlayerContextCardProps {
  player: ResolvedPlayerPin
  onClose: () => void
}

export function PlayerContextCard({ player, onClose }: PlayerContextCardProps) {
  const locationText = player.city
    ? `${player.city}, ${player.district}`
    : player.district || 'Portugal'

  const isGps = player.locationSource === 'gps'

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:right-auto sm:left-6 z-40 w-auto sm:w-80 rounded-3xl bg-slate-950/92 p-4 border border-cyan-500/30 shadow-2xl backdrop-blur-xl select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <UserAvatar
              photoURL={player.photoURL || player.avatar}
              displayName={player.displayName}
              size="sm"
              isCurrentUser={player.isCurrentUser}
              equippedFrame={player.equippedFrame}
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-slate-950" />
            </span>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black text-white truncate">
                {player.displayName}
              </span>
              {player.isCurrentUser && (
                <span className="px-1.5 py-0.5 rounded-md bg-cyan-500 text-[9px] font-black uppercase text-slate-950 shrink-0">
                  Você
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
                ● Online agora
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-cyan-300 font-bold">
                Nv. {player.level}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Detalhes de Localização & Precisão */}
      <div className="space-y-2 pt-3 text-xs">
        <div className="flex items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 bg-white/5 border border-white/10 text-slate-300">
            {isGps ? (
              <>
                <Crosshair className="h-2.5 w-2.5 text-emerald-400" />
                <span>GPS Real</span>
              </>
            ) : (
              <>
                <Navigation className="h-2.5 w-2.5 text-cyan-400" />
                <span>Concelho</span>
              </>
            )}
          </span>
        </div>

        {player.title && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate text-slate-300">{player.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}
