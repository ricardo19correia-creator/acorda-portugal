'use client'

import React, { useState } from 'react'
import { MapPin, ChevronUp, ChevronDown, Sparkles, ExternalLink } from 'lucide-react'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { MapArenaPOI } from './types'
import { cn } from '@/lib/utils'

interface ActiveArenasDrawerProps {
  onSelectArena: (arena: MapArenaPOI) => void
  className?: string
}

export function ActiveArenasDrawer({ onSelectArena, className }: ActiveArenasDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('pointer-events-auto select-none z-30', className)}>
      {isOpen ? (
        <div className="w-64 sm:w-72 rounded-3xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl p-3 sm:p-4 flex flex-col gap-2 max-h-72 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                Arenas em Destaque
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-amber-500/30">
            {OFFICIAL_MAP_ARENAS.map((arena) => {
              const isVip = arena.rarity === 'VIP'
              const isLegendary = arena.rarity === 'Lendária'

              return (
                <button
                  key={arena.id}
                  type="button"
                  onClick={() => onSelectArena(arena)}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="font-display font-bold text-[11px] text-white group-hover:text-amber-300 truncate block transition-colors">
                      {arena.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block">
                      {arena.district}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono shrink-0',
                      isVip
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isLegendary
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    )}
                  >
                    {arena.rarity}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2.5 rounded-2xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md shadow-xl flex items-center gap-2 text-white hover:bg-slate-900 transition-all cursor-pointer group"
          title="Ver Arenas Ativas"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-black text-xs uppercase tracking-wider text-slate-200 group-hover:text-amber-300">
            {OFFICIAL_MAP_ARENAS.length} Arenas Ativas
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
        </button>
      )}
    </div>
  )
}
