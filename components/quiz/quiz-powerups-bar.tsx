'use client'

import React from 'react'
import { Snowflake, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuizPowerUpsBarProps {
  stock5050?: number
  stockFreeze?: number
  inventory?: Record<string, number>
  disabled?: boolean
  used5050: boolean
  isFrozen?: boolean
  freezeTimeLeft?: number
  onUse5050: () => void
  onUseFreeze: () => void
  usedClue?: boolean
  onUseClue?: () => void
}

export function QuizPowerUpsBar({
  stock5050,
  stockFreeze,
  inventory = {},
  disabled = false,
  used5050,
  isFrozen = false,
  freezeTimeLeft = 0,
  onUse5050,
  onUseFreeze,
}: QuizPowerUpsBarProps) {
  const count5050 =
    typeof stock5050 === 'number'
      ? stock5050
      : (inventory['consumable_50_50'] ?? inventory['help5050'] ?? 0)

  const countFreeze =
    typeof stockFreeze === 'number'
      ? stockFreeze
      : (inventory['consumable_congelar_tempo'] ?? inventory['freezeTime'] ?? 0)

  const canUse5050 = !disabled && !used5050 && count5050 > 0
  const canUseFreeze = !disabled && countFreeze > 0

  return (
    <div className="my-1 sm:my-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 shrink-0">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={onUse5050}
        aria-label="Usar Ajuda 50/50"
        className={cn(
          'flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold shadow-md backdrop-blur-md transition-all select-none text-xs',
          used5050
            ? 'bg-slate-900/95 border-2 border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'bg-slate-900/95 border-2 border-cyan-400 text-cyan-300 hover:bg-cyan-950/80 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 border border-slate-700/60 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1">
          {used5050 ? <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" /> : '✨ 50/50'}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-black',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300'
              : count5050 > 0
                ? 'bg-cyan-500/25 border border-cyan-400/40 text-white'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {used5050 ? 'Usada' : `x${count5050}`}
        </span>
      </button>

      {/* 2. POWER-UP CONGELAR TEMPO (+15s) */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={onUseFreeze}
        aria-label="Usar Congelar Tempo (+15s)"
        className={cn(
          'flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold shadow-md backdrop-blur-md transition-all select-none text-xs',
          isFrozen
            ? 'bg-slate-900/95 border-2 border-blue-400 text-blue-200 shadow-[0_0_25px_rgba(96,165,250,0.6)] animate-pulse'
            : canUseFreeze
              ? 'bg-slate-900/95 border-2 border-amber-400 text-amber-300 hover:bg-amber-950/80 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/80 border border-slate-700/60 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1">
          {isFrozen ? <Snowflake className="h-3.5 w-3.5 animate-spin text-blue-300" /> : '⏳ Congelar'}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[10px] sm:text-xs font-black',
            isFrozen
              ? 'bg-blue-500/30 text-white'
              : countFreeze > 0
                ? 'bg-amber-500/25 border border-amber-400/40 text-white'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : `+15s (x${countFreeze})`}
        </span>
      </button>
    </div>
  )
}
