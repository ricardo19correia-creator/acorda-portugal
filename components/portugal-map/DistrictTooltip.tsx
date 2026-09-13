'use client'

import React from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { Trophy, Users, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DistrictTooltipProps {
  district: DistrictMapItem | null
  mousePosition: { x: number; y: number }
}

export function DistrictTooltip({ district, mousePosition }: DistrictTooltipProps) {
  if (!district) return null

  // Limitar posição do tooltip para não sair do viewport
  const left = Math.min(Math.max(16, mousePosition.x + 16), window.innerWidth - 260)
  const top = Math.min(Math.max(16, mousePosition.y - 120), window.innerHeight - 200)

  const isPodium = district.pos <= 3

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 w-60 rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 16px rgba(6, 182, 212, 0.25)',
      }}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base">{district.type === 'island' ? '🌊' : '🇵🇹'}</span>
          <h4 className="font-display text-xs font-black uppercase text-white truncate">
            {district.name}
          </h4>
        </div>

        <span
          className={cn(
            'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black',
            district.pos === 1
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : district.pos === 2
                ? 'bg-slate-200/20 text-slate-100 border border-slate-300/40'
                : district.pos === 3
                  ? 'bg-orange-500/20 text-orange-200 border border-orange-500/40'
                  : district.pos <= 10
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-300 border border-white/10'
          )}
        >
          {district.pos === 1 && '👑'}
          #{district.pos} Nacional
        </span>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <Users className="w-3 h-3 text-cyan-400" />
            Jogadores:
          </span>
          <span className="font-bold text-white">
            {district.activePlayers}
            {district.onlineNow > 0 && (
              <span className="text-emerald-400 font-bold ml-1">
                ({district.onlineNow} online)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3 h-3 text-amber-400" />
            XP Total:
          </span>
          <span className="font-bold text-amber-300">
            {district.totalXp.toLocaleString('pt-PT')}
          </span>
        </div>

        {district.king && (
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <Crown className="w-3 h-3 text-amber-400" />
              Líder:
            </span>
            <span className="font-bold text-cyan-200 truncate max-w-[120px]">
              {district.king.displayName}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
          <span className="text-slate-400">Atividade:</span>
          <span
            className={`font-bold ${
              district.activityLevel === 'Alta'
                ? 'text-emerald-400'
                : district.activityLevel === 'Média'
                  ? 'text-cyan-400'
                  : 'text-slate-400'
            }`}
          >
            ● {district.activityLevel}
          </span>
        </div>
      </div>

      {/* Dica */}
      <div className="mt-2 text-center text-[9px] text-slate-400 font-mono">
        Clica para abrir painel completo
      </div>
    </div>
  )
}
