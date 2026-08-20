'use client'

import React from 'react'
import { Sparkles, Lightbulb, Timer, Snowflake, Lock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizPowerUpsBarProps {
  inventory: Record<string, number>
  disabled?: boolean
  used5050: boolean
  usedClue: boolean
  isFrozen: boolean
  freezeTimeLeft: number
  onUse5050: () => void
  onUseClue: () => void
  onUseFreeze: () => void
}

export function QuizPowerUpsBar({
  inventory,
  disabled = false,
  used5050,
  usedClue,
  isFrozen,
  freezeTimeLeft,
  onUse5050,
  onUseClue,
  onUseFreeze,
}: QuizPowerUpsBarProps) {
  const count5050 = inventory['consumable_50_50'] || 0
  const countClue = inventory['consumable_pista'] || 0
  const countFreeze = inventory['consumable_congelar_tempo'] || 0

  const canUse5050 = !disabled && !used5050 && count5050 > 0
  const canUseClue = !disabled && !usedClue && countClue > 0
  const canUseFreeze = !disabled && !isFrozen && countFreeze > 0

  return (
    <div className="my-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={onUse5050}
        aria-label="Usar Ajuda 50/50"
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          used5050
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]'
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
        <div className="flex items-center gap-1">
          <span>50/50</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[0.62rem] font-black',
              count5050 > 0 ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-muted-foreground',
            )}
          >
            ×{count5050}
          </span>
        </div>
      </button>

      {/* 2. POWER-UP PISTA HISTÓRICA */}
      <button
        type="button"
        disabled={!canUseClue}
        onClick={onUseClue}
        aria-label="Usar Pista Histórica"
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          usedClue
            ? 'border-gold/40 bg-gold/15 text-gold opacity-90 cursor-default'
            : canUseClue
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'border-white/5 bg-white/[0.02] text-muted-foreground/50 opacity-50 cursor-not-allowed',
        )}
      >
        <div
          className={cn(
            'grid h-6 w-6 place-items-center rounded-lg',
            usedClue
              ? 'bg-gold/20 text-gold'
              : canUseClue
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-white/5 text-muted-foreground/50',
          )}
        >
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-1">
          <span>Pista</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[0.62rem] font-black',
              countClue > 0 ? 'bg-amber-500/30 text-amber-200' : 'bg-white/10 text-muted-foreground',
            )}
          >
            ×{countClue}
          </span>
        </div>
      </button>

      {/* 3. POWER-UP CONGELAR TEMPO */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={onUseFreeze}
        aria-label="Usar Congelar Tempo"
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          isFrozen
            ? 'border-blue-400 bg-blue-500/25 text-blue-200 shadow-[0_0_20px_rgba(96,165,250,0.5)] animate-pulse cursor-default'
            : canUseFreeze
              ? 'border-blue-500/40 bg-blue-500/10 text-blue-300 hover:border-blue-400 hover:bg-blue-500/20 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]'
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
        <div className="flex items-center gap-1">
          <span>{isFrozen ? `❄️ Pausado (${freezeTimeLeft}s)` : 'Congelar'}</span>
          {!isFrozen && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[0.62rem] font-black',
                countFreeze > 0 ? 'bg-blue-500/30 text-blue-200' : 'bg-white/10 text-muted-foreground',
              )}
            >
              ×{countFreeze}
            </span>
          )}
        </div>
      </button>
    </div>
  )
}
