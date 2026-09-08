'use client'

import React from 'react'
import type { DistrictItem } from '@/src/data/districts'
import type { ScreenPoint } from '@/src/game/world/WorldState'
import { Users, Activity, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapTooltipProps {
  district: DistrictItem | null
  pos: ScreenPoint | null
  onlinePlayers?: number
}

export function MapTooltip({ district, pos, onlinePlayers = 0 }: MapTooltipProps) {
  if (!district || !pos) return null

  // Activity tier configuration
  const activityConfig =
    onlinePlayers >= 50
      ? { label: 'ATIVIDADE MUITO ALTA', color: 'text-rose-400 border-rose-500/40 bg-rose-500/15' }
      : onlinePlayers >= 21
      ? { label: 'ATIVIDADE ALTA', color: 'text-amber-400 border-amber-500/40 bg-amber-500/15' }
      : onlinePlayers >= 6
      ? { label: 'ATIVIDADE MÉDIA', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/15' }
      : onlinePlayers >= 1
      ? { label: 'ATIVIDADE BAIXA', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/15' }
      : { label: 'SEM ATIVIDADE', color: 'text-slate-400 border-white/10 bg-white/5' }

  // Tooltip positioning offset
  const offsetX = 16
  const offsetY = 16

  return (
    <div
      style={{
        transform: `translate3d(${pos.x + offsetX}px, ${pos.y + offsetY}px, 0)`,
      }}
      className="pointer-events-none fixed top-0 left-0 z-30 transition-transform duration-75 ease-out"
    >
      <div className="w-60 rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl animate-fadeIn">
        {/* Header: Type and Region Badge */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase mb-1">
          <span className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full shadow-sm"
              style={{ backgroundColor: district.dominantColor || '#00e5ff' }}
            />
            {district.region}
          </span>
          <span className="text-[9px] text-cyan-400">
            {district.type === 'island' ? 'ILHA' : 'DISTRITO'}
          </span>
        </div>

        {/* Territory Name */}
        <h3 className="font-display text-sm font-black uppercase text-white tracking-wide truncate">
          {district.name}
        </h3>

        {/* Capital */}
        <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-0.5">
          <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
          <span className="truncate">Capital: {district.capital}</span>
        </div>

        {/* Real Online Presence & Activity Bar */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
            <Users className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>
              {onlinePlayers}{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                {onlinePlayers === 1 ? 'humano online' : 'humanos online'}
              </span>
            </span>
          </div>

          <div
            className={cn(
              'px-2 py-0.5 rounded-full border text-[9px] font-mono font-black tracking-wider',
              activityConfig.color
            )}
          >
            {activityConfig.label}
          </div>
        </div>
      </div>
    </div>
  )
}
