'use client'

import React from 'react'
import { Snowflake, Check, Users, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuizPowerUpsBarProps {
  stock5050?: number
  stockFreeze?: number
  stockPublicVote?: number
  stockHint?: number
  stockClue?: number
  inventory?: Record<string, any>
  disabled?: boolean
  isProcessing?: boolean
  used5050: boolean
  usedPublicVote?: boolean
  usedClue?: boolean
  isFrozen?: boolean
  freezeTimeLeft?: number
  onUse5050: () => void
  onUseFreeze?: () => void
  onUsePublicVote?: () => void
  onUseClue?: () => void
  onRequestPreview?: (aidType: '5050' | 'publicVote' | 'freeze' | 'hint') => void
}

export function QuizPowerUpsBar({
  stock5050,
  stockFreeze,
  stockPublicVote,
  inventory = {},
  disabled = false,
  isProcessing = false,
  used5050,
  usedPublicVote = false,
  isFrozen = false,
  freezeTimeLeft = 0,
  onUse5050,
  onUseFreeze,
  onUsePublicVote,
  onRequestPreview,
}: QuizPowerUpsBarProps) {
  // 1. 50:50 stock
  const count5050 = Math.max(
    0,
    typeof stock5050 === 'number'
      ? stock5050
      : Number(
          inventory['powerUps']?.fiftyFifty ??
            inventory['AID_002'] ??
            inventory['aid_50_50'] ??
            inventory['consumable_50_50'] ??
            inventory['help5050'] ??
            inventory['utilities']?.fiftyFifty ??
            0,
        ),
  )

  // 2. Congelar Tempo stock
  const countFreeze = Math.max(
    0,
    typeof stockFreeze === 'number'
      ? stockFreeze
      : Number(
          inventory['powerUps']?.freeze ??
            inventory['powerUps']?.freezeTime ??
            inventory['powerUps']?.congelar ??
            inventory['AID_004'] ??
            inventory['aid_freeze_time'] ??
            inventory['consumable_congelar_tempo'] ??
            inventory['freezeTime'] ??
            inventory['utilities']?.freezeTime ??
            0,
        ),
  )

  // 3. Ajuda do Público stock
  const countPublicVote = Math.max(
    0,
    typeof stockPublicVote === 'number'
      ? stockPublicVote
      : Number(
          inventory['powerUps']?.publicVote ??
            inventory['powerUps']?.publico ??
            inventory['AID_003'] ??
            inventory['aid_public_vote'] ??
            inventory['consumable_public_vote'] ??
            inventory['HELP_005'] ??
            inventory['publicVote'] ??
            inventory['utilities']?.publicVote ??
            0,
        ),
  )

  const isGloballyDisabled = disabled || isProcessing

  // Bloqueio rigoroso: desativa se a quantidade for 0 ou já usado nesta pergunta
  const canUse5050 = !isGloballyDisabled && !used5050 && count5050 > 0
  const canUseFreeze =
    !isGloballyDisabled &&
    !isFrozen &&
    countFreeze > 0 &&
    typeof onUseFreeze === 'function'
  const canUsePublicVote =
    !isGloballyDisabled &&
    !usedPublicVote &&
    countPublicVote > 0 &&
    (typeof onUsePublicVote === 'function' || typeof onRequestPreview === 'function')

  const handleClick5050 = () => {
    if (!canUse5050) return
    if (onRequestPreview && count5050 > 0) {
      onRequestPreview('5050')
    } else {
      onUse5050()
    }
  }

  const handleClickFreeze = () => {
    if (!canUseFreeze) return
    if (onRequestPreview && countFreeze > 0) {
      onRequestPreview('freeze')
    } else if (onUseFreeze) {
      onUseFreeze()
    }
  }

  const handleClickPublicVote = () => {
    if (!canUsePublicVote) return
    if (onRequestPreview && countPublicVote > 0) {
      onRequestPreview('publicVote')
    } else if (onUsePublicVote) {
      onUsePublicVote()
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm mx-auto my-3 select-none shrink-0">
      {/* 1. POWER-UP 50:50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={handleClick5050}
        aria-label={`Ajuda 50:50 (${count5050} disponíveis)`}
        className={cn(
          'w-full h-11 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
          used5050
            ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'bg-slate-800/95 border-cyan-500/40 text-cyan-200 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer shadow-cyan-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 pointer-events-none cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400 shrink-0" />
          ) : used5050 ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3] shrink-0" />
          ) : (
            <span className="shrink-0 text-sm leading-none">🌓</span>
          )}
          <span className="truncate text-xs font-bold">50:50</span>
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono leading-none',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300'
              : count5050 > 0
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/50',
          )}
        >
          {used5050 ? 'OK' : `x${count5050}`}
        </span>
      </button>

      {/* 2. POWER-UP CONGELAR TEMPO */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={handleClickFreeze}
        aria-label={`Congelar Tempo (${countFreeze} disponíveis)`}
        className={cn(
          'w-full h-11 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
          isFrozen
            ? 'bg-slate-900 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse'
            : canUseFreeze
              ? 'bg-slate-800/95 border-blue-500/40 text-blue-300 hover:border-blue-400 hover:bg-slate-800 cursor-pointer shadow-blue-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 pointer-events-none cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
          ) : isFrozen ? (
            <Snowflake className="h-3.5 w-3.5 animate-spin text-blue-300 shrink-0" />
          ) : (
            <Snowflake className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          )}
          <span className="truncate text-xs font-bold">Gelo +15s</span>
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono leading-none',
            isFrozen
              ? 'bg-blue-500/30 text-white'
              : countFreeze > 0
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/50',
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : `x${countFreeze}`}
        </span>
      </button>

      {/* 3. POWER-UP AJUDA DO PÚBLICO */}
      <button
        type="button"
        disabled={!canUsePublicVote}
        onClick={handleClickPublicVote}
        aria-label={`Ajuda do Público (${countPublicVote} disponíveis)`}
        className={cn(
          'w-full h-11 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
          usedPublicVote
            ? 'bg-slate-900 border-purple-500/60 text-purple-300 opacity-80 cursor-default'
            : canUsePublicVote
              ? 'bg-slate-800/95 border-purple-500/40 text-purple-300 hover:border-purple-400 hover:bg-slate-800 cursor-pointer shadow-purple-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 pointer-events-none cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400 shrink-0" />
          ) : usedPublicVote ? (
            <Check className="h-3.5 w-3.5 text-purple-400 stroke-[3] shrink-0" />
          ) : (
            <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
          )}
          <span className="truncate text-xs font-bold">Público</span>
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono leading-none',
            usedPublicVote
              ? 'bg-purple-500/20 text-purple-300'
              : countPublicVote > 0
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/50',
          )}
        >
          {usedPublicVote ? 'OK' : `x${countPublicVote}`}
        </span>
      </button>
    </div>
  )
}
