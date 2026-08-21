'use client'

import React from 'react'
import { Sparkles, Timer, Snowflake, Check } from 'lucide-react'
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
    <div className="my-4 flex flex-wrap items-center justify-center gap-3">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={onUse5050}
        aria-label="Usar Ajuda 50/50"
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          used5050
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'border-white/5 bg-white/[0.02] text-muted-foreground/50 opacity-50 cursor-not-allowed',
        )}
      >
        <div
          className={cn(
            'grid h-6 w-6 place-items-center rounded-lg',
            used5050
              ? 'bg-emerald-500/20 text-emerald-400'
              : canUse5050
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-white/5 text-muted-foreground/50',
          )}
        >
          {used5050 ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span>50/50</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[0.68rem] font-black',
              count5050 > 0 ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-muted-foreground',
            )}
          >
            ×{count5050}
          </span>
        </div>
      </button>

      {/* 2. POWER-UP CONGELAR TEMPO (+15s) */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={onUseFreeze}
        aria-label="Usar Congelar Tempo (+15s)"
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          isFrozen
            ? 'border-blue-400 bg-blue-500/25 text-blue-200 shadow-[0_0_20px_rgba(96,165,250,0.5)] animate-pulse'
            : canUseFreeze
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-400 hover:bg-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]'
              : 'border-white/5 bg-white/[0.02] text-muted-foreground/50 opacity-50 cursor-not-allowed',
        )}
      >
        <div
          className={cn(
            'grid h-6 w-6 place-items-center rounded-lg',
            isFrozen
              ? 'bg-blue-400 text-black'
              : canUseFreeze
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-white/5 text-muted-foreground/50',
          )}
        >
          {isFrozen ? <Snowflake className="h-3.5 w-3.5 animate-spin" /> : <Timer className="h-3.5 w-3.5" />}
        </div>
        <div className="flex items-center gap-1.5">
          <span>{isFrozen ? `❄️ +15s (${freezeTimeLeft}s)` : 'Congelar (+15s)'}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[0.68rem] font-black',
              countFreeze > 0 ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-muted-foreground',
            )}
          >
            ×{countFreeze}
          </span>
        </div>
      </button>
    </div>
  )
}
