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
    <div className="h-7 flex items-center justify-center gap-2 my-0.5 shrink-0 select-none">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={onUse5050}
        aria-label="Usar Ajuda 50/50"
        className={cn(
          'h-6 flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold shadow-sm backdrop-blur-md transition-all select-none text-[10px]',
          used5050
            ? 'bg-slate-900/95 border border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'bg-slate-900/95 border border-cyan-400 text-cyan-300 hover:bg-cyan-950/80 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/80 border border-slate-700/60 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-0.5">
          {used5050 ? <Check className="h-3 w-3 text-emerald-400 stroke-[3]" /> : '✨ 50/50'}
        </span>
        <span
          className={cn(
            'px-1 py-0 rounded text-[9px] font-black',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300'
              : count5050 > 0
                ? 'bg-cyan-500/25 text-white'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {used5050 ? 'OK' : `x${count5050}`}
        </span>
      </button>

      {/* 2. POWER-UP CONGELAR TEMPO (+15s) */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={onUseFreeze}
        aria-label="Usar Congelar Tempo (+15s)"
        className={cn(
          'h-6 flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold shadow-sm backdrop-blur-md transition-all select-none text-[10px]',
          isFrozen
            ? 'bg-slate-900/95 border border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.6)] animate-pulse'
            : canUseFreeze
              ? 'bg-slate-900/95 border border-amber-400 text-amber-300 hover:bg-amber-950/80 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/80 border border-slate-700/60 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-0.5">
          {isFrozen ? <Snowflake className="h-3 w-3 animate-spin text-blue-300" /> : '⏳ Congelar'}
        </span>
        <span
          className={cn(
            'px-1 py-0 rounded text-[9px] font-black',
            isFrozen
              ? 'bg-blue-500/30 text-white'
              : countFreeze > 0
                ? 'bg-amber-500/25 text-white'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : `x${countFreeze}`}
        </span>
      </button>
    </div>
  )
}
