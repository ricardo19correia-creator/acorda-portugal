'use client'

import React from 'react'
import Link from 'next/link'
import { X, MapPin, Trophy, Swords, Zap, ExternalLink, Shield } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { cn } from '@/lib/utils'
import type { ResolvedPlayerPin } from '@/src/hooks/usePortugalVivoData'

interface PlayerContextCardProps {
  player: ResolvedPlayerPin
  onClose: () => void
}

export function PlayerContextCard({ player, onClose }: PlayerContextCardProps) {
  const activityLabel =
    player.activity === 'playing'
      ? 'A jogar Quiz'
      : player.activity === 'duel'
      ? 'Em Duelo 1v1'
      : 'A explorar Portugal'

  const locationText = player.city
    ? `${player.city}, ${player.district}`
    : player.district || 'Portugal'

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:right-auto sm:left-5 z-40 w-auto sm:w-80 rounded-3xl bg-slate-950/92 p-4 border border-cyan-500/30 shadow-2xl backdrop-blur-xl animate-slideUp select-none">
      {/* Puxador táctil mobile */}
      <div className="flex sm:hidden justify-center pb-2">
        <div className="h-1 w-10 rounded-full bg-white/20" />
      </div>

      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <UserAvatar
              photoURL={player.photoURL}
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
                <span className="px-1.5 py-0.2 rounded-md bg-cyan-500 text-[9px] font-black uppercase text-slate-950">
                  Você
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold font-mono">
                🟢 ONLINE
              </span>
              <span>•</span>
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

      {/* Detalhes de Localização & Atividade */}
      <div className="space-y-2 py-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{locationText}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400">Estado:</span>
          <span className="font-medium text-slate-200">{activityLabel}</span>
        </div>

        {player.title && (
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Título:</span>
            <span className="font-bold text-indigo-300">{player.title}</span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
        <Link
          href={`/perfil?user=${encodeURIComponent(player.userId)}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Ver Perfil</span>
        </Link>

        {!player.isCurrentUser && (
          <Link
            href={`/jogar/duelo?challenge=${encodeURIComponent(player.userId)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Swords className="h-3.5 w-3.5 text-amber-400" />
            <span>Desafiar</span>
          </Link>
        )}
      </div>
    </div>
  )
}
