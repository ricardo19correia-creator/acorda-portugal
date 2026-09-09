'use client'

import React, { useState } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { Trophy, ChevronDown, ChevronUp, Users, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RankingOverlayProps {
  rankingList: DistrictMapItem[]
  selectedId: string | null
  onSelectDistrict: (district: DistrictMapItem) => void
  className?: string
}

export function RankingOverlay({
  rankingList,
  selectedId,
  onSelectDistrict,
  className,
}: RankingOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-2xl border border-cyan-500/25 bg-slate-950/90 backdrop-blur-xl shadow-xl text-white select-none transition-all duration-200',
        className
      )}
    >
      {/* 1. CABEÇALHO & LEGENDA COMPACTA */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className="font-display text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-200">
              Classificação dos Distritos
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10"
          >
            <span>{isExpanded ? 'Recolher' : 'Ver Top 20'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Legenda de Níveis de Destaque Visual */}
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-slate-300 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_#f59e0b]" />
            <span className="truncate">#1 Campeão</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
            <span className="truncate">#2-#3 Pódio</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
            <span className="truncate">#4-#8 Top</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
            <span className="truncate">#9-#20 Geral</span>
          </div>
        </div>
      </div>

      {/* 2. LISTA TOP 20 EXPANSÍVEL */}
      {isExpanded && (
        <div className="border-t border-white/10 max-h-56 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
          {rankingList.map((district) => {
            const isSelected = selectedId === district.id

            return (
              <button
                key={district.id}
                type="button"
                onClick={() => onSelectDistrict(district)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer text-xs font-mono',
                  isSelected
                    ? 'bg-cyan-500/25 border border-cyan-400/50 text-white font-bold'
                    : 'hover:bg-white/5 text-slate-300'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'w-5 font-black shrink-0 text-center text-[11px]',
                      district.pos === 1
                        ? 'text-amber-400'
                        : district.pos <= 3
                          ? 'text-slate-200'
                          : 'text-slate-400'
                    )}
                  >
                    {district.pos === 1 ? '👑' : `#${district.pos}`}
                  </span>
                  <span className="truncate">{district.name}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-400">
                  <span>{district.activePlayers} jog.</span>
                  <strong className="text-amber-300">{district.powerFormatted}</strong>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
