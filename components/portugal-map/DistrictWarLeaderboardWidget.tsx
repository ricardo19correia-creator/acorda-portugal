'use client'

import React, { useState } from 'react'
import { Crown, Swords, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { cn } from '@/lib/utils'

interface DistrictWarLeaderboardWidgetProps {
  territories: DistrictWarTerritory[]
  selectedDistrict: string
  onSelectDistrict: (name: string) => void
  className?: string
}

export function DistrictWarLeaderboardWidget({
  territories,
  selectedDistrict,
  onSelectDistrict,
  className,
}: DistrictWarLeaderboardWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const sorted = [...territories].sort((a, b) => a.pos - b.pos)
  const top1 = sorted[0]

  return (
    <div
      className={cn(
        'pointer-events-auto transition-all duration-300 select-none z-30',
        className
      )}
    >
      {isExpanded ? (
        <div className="w-72 sm:w-80 rounded-2xl sm:rounded-3xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/40 p-3 sm:p-4 flex flex-col gap-2.5 max-h-[55vh] sm:max-h-[60vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                  <span>Guerra dos Distritos</span>
                </h3>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Ranking Territorial em Tempo Real
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Recolher Painel"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* District List */}
          <div className="overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {sorted.map((t) => {
              const isSelected = t.name.toLowerCase() === selectedDistrict.toLowerCase()
              const isFirst = t.pos === 1
              const isSecond = t.pos === 2
              const isThird = t.pos === 3

              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => onSelectDistrict(t.name)}
                  className={cn(
                    'w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group',
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span
                      className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-black shrink-0',
                        isFirst
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/50'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {isFirst ? <Crown className="w-3 h-3 text-slate-950" /> : t.pos}
                    </span>

                    {/* Leader Avatar */}
                    {t.king && (
                      <div className="relative shrink-0">
                        <UserAvatar
                          src={t.king.avatarUrl}
                          name={t.king.displayName}
                          size="xs"
                          className="w-5 h-5 ring-1 ring-white/20"
                        />
                      </div>
                    )}

                    {/* Name */}
                    <div className="min-w-0">
                      <span className="font-display font-bold text-[11px] text-white truncate block group-hover:text-cyan-300 transition-colors">
                        {t.name}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 truncate block">
                        {t.powerFormatted} pts
                      </span>
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="shrink-0 text-[10px] font-mono font-bold flex items-center">
                    {t.trend === 'up' ? (
                      <span className="text-emerald-400 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        +{t.trendDelta || 1}
                      </span>
                    ) : t.trend === 'down' ? (
                      <span className="text-rose-400 flex items-center">
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                        {t.trendDelta}
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center">
                        <Minus className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Quick summary footer */}
          {top1 && (
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono uppercase text-[9px] text-amber-400 font-bold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                Líder Atual: {top1.name}
              </span>
              <span className="font-mono text-[9px] text-cyan-400">
                {top1.powerFormatted} PTS
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Collapsed Button */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="p-2.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-xl flex items-center gap-2 text-white hover:bg-slate-900 transition-all cursor-pointer group"
          title="Abrir Guerra dos Distritos"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-black text-xs uppercase tracking-wider text-slate-200 group-hover:text-cyan-300">
            Guerra Distrital
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      )}
    </div>
  )
}
