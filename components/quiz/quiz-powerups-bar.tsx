'use client'

import React from 'react'
import { Snowflake, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuizPowerUpsBarProps {
  stock5050?: number
  stockFreeze?: number
  stockPublicVote?: number
  inventory?: Record<string, number>
  disabled?: boolean
  used5050: boolean
  usedPublicVote?: boolean
  isFrozen?: boolean
  freezeTimeLeft?: number
  onUse5050: () => void
  onUseFreeze: () => void
  onUsePublicVote?: () => void
  usedClue?: boolean
  onUseClue?: () => void
}

export function QuizPowerUpsBar({
  stock5050,
  stockFreeze,
  stockPublicVote,
  inventory = {},
  disabled = false,
  used5050,
  usedPublicVote = false,
  isFrozen = false,
  freezeTimeLeft = 0,
  onUse5050,
  onUseFreeze,
  onUsePublicVote,
}: QuizPowerUpsBarProps) {
  const count5050 =
    typeof stock5050 === 'number'
      ? stock5050
      : (inventory['consumable_50_50'] ?? inventory['help5050'] ?? 0)

  const countFreeze =
    typeof stockFreeze === 'number'
      ? stockFreeze
      : (inventory['consumable_congelar_tempo'] ?? inventory['freezeTime'] ?? 0)

  const countPublicVote =
    typeof stockPublicVote === 'number'
      ? stockPublicVote
      : (inventory['HELP_005'] ?? inventory['consumable_public_vote'] ?? inventory['publicVote'] ?? 0)

  const canUse5050 = !disabled && !used5050 && count5050 > 0
  const canUsePublicVote = !disabled && !usedPublicVote && countPublicVote > 0 && typeof onUsePublicVote === 'function'
  const canUseFreeze = !disabled && countFreeze > 0

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 select-none shrink-0">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={onUse5050}
        aria-label="Usar Ajuda 50/50"
        className={cn(
          'h-8 px-2.5 sm:px-3.5 py-1 rounded-xl border font-bold text-xs flex items-center gap-1 active:scale-95 transition-all select-none cursor-pointer shadow-sm',
          used5050
            ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'bg-slate-800/90 border-slate-700 text-cyan-300 hover:border-cyan-400 hover:bg-slate-800'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1">
          {used5050 ? <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" /> : '✨ 50/50'}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[10px] font-black',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300'
              : count5050 > 0
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {used5050 ? 'OK' : `x${count5050}`}
        </span>
      </button>

      {/* 2. POWER-UP PERGUNTA AO PÚBLICO (VOTAÇÃO SIMULADA) */}
      <button
        type="button"
        disabled={!canUsePublicVote}
        onClick={onUsePublicVote}
        aria-label="Usar Pergunta ao Público"
        className={cn(
          'h-8 px-2.5 sm:px-3.5 py-1 rounded-xl border font-bold text-xs flex items-center gap-1 active:scale-95 transition-all select-none cursor-pointer shadow-sm',
          usedPublicVote
            ? 'bg-slate-900 border-purple-500/60 text-purple-300 opacity-80 cursor-default'
            : canUsePublicVote
              ? 'bg-slate-800/90 border-slate-700 text-purple-300 hover:border-purple-400 hover:bg-slate-800'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1">
          {usedPublicVote ? <Check className="h-3.5 w-3.5 text-purple-400 stroke-[3]" /> : (
            <>
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>Público</span>
            </>
          )}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[10px] font-black',
            usedPublicVote
              ? 'bg-purple-500/20 text-purple-300'
              : countPublicVote > 0
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {usedPublicVote ? 'OK' : `x${countPublicVote}`}
        </span>
      </button>

      {/* 3. POWER-UP CONGELAR TEMPO (+15s) */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={onUseFreeze}
        aria-label="Usar Congelar Tempo (+15s)"
        className={cn(
          'h-8 px-2.5 sm:px-3.5 py-1 rounded-xl border font-bold text-xs flex items-center gap-1 active:scale-95 transition-all select-none cursor-pointer shadow-sm',
          isFrozen
            ? 'bg-slate-900 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse'
            : canUseFreeze
              ? 'bg-slate-800/90 border-slate-700 text-amber-300 hover:border-amber-400 hover:bg-slate-800'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1">
          {isFrozen ? <Snowflake className="h-3.5 w-3.5 animate-spin text-blue-300" /> : '⏳ Congelar'}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.2 rounded text-[10px] font-black',
            isFrozen
              ? 'bg-blue-500/30 text-white'
              : countFreeze > 0
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-slate-400',
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : `x${countFreeze}`}
        </span>
      </button>
    </div>
  )
}
