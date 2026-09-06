'use client'

import React from 'react'
import { Swords, Crown, Users, MapPin, ChevronRight, Shield } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { getTerritoryByName } from '@/lib/portugal-geojson'
import { cn } from '@/lib/utils'

interface DistrictIntelCardProps {
  districtName: string
  territory: DistrictWarTerritory | null
  onOpenDetails: () => void
  onStartGame: (route: string) => void
  className?: string
}

export function DistrictIntelCard({
  districtName,
  territory,
  onOpenDetails,
  onStartGame,
  className,
}: DistrictIntelCardProps) {
  const metadata = getTerritoryByName(districtName)
  const displayName = territory?.name || metadata?.name || districtName
  const pos = territory?.pos || 1
  const power = territory?.powerFormatted || '50.000'
  const players = territory?.activePlayers ?? 120
  const arenaCount = (metadata as any)?.arenasCount || 2
  const king = territory?.king

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-3xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-2xl p-4 sm:p-5 w-72 sm:w-84 select-none animate-in fade-in slide-in-from-bottom-3 duration-200',
        className
      )}
      style={{
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.15), 0 20px 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* Top Bar with Tactical Tag & Position */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-[9px] uppercase font-black tracking-widest text-cyan-400">
            Dossiê Tático // 2150
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Rank #{pos} Nacional
        </span>
      </div>

      {/* Main Title & Capital */}
      <div className="mb-3">
        <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight flex items-center gap-2">
          <span>{displayName}</span>
        </h2>
        <span className="text-[10px] font-mono text-slate-400">
          Setor Territorial {metadata?.capital ? `• Capital: ${metadata.capital}` : ''}
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
            Poder Territorial
          </span>
          <span className="font-mono font-black text-sm text-amber-400 block mt-0.5">
            {power} <span className="text-[9px] text-amber-400/70">PTS</span>
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
            Agentes Ativos
          </span>
          <span className="font-mono font-black text-sm text-cyan-300 block mt-0.5">
            {players.toLocaleString('pt-PT')}
          </span>
        </div>
      </div>

      {/* District Champion Card */}
      {king && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <UserAvatar
                src={king.photoURL}
                alt={king.displayName}
                size="sm"
                className="w-8 h-8 ring-2 ring-amber-400/60"
              />
              <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-amber-300 uppercase tracking-widest font-black block">
                Campeão Distrital
              </span>
              <span className="font-display font-bold text-xs text-white truncate block">
                {king.displayName}
              </span>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-amber-500/20 text-amber-300">
            Nv. {king.level || 1}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onStartGame(`/jogar?distrito=${encodeURIComponent(displayName)}`)}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Jogar</span>
        </button>

        <button
          type="button"
          onClick={onOpenDetails}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          title="Ver Dossiê Completo"
        >
          <span>Dossiê</span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    </div>
  )
}
