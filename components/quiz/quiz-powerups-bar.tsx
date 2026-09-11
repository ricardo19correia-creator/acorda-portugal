'use client'

import React from 'react'
import { Snowflake, Check, Users, Loader2, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuizPowerUpsBarProps {
  stockHint?: number
  stockClue?: number
  stock5050?: number
  stockFreeze?: number
  stockPublicVote?: number
  inventory?: Record<string, any>
  disabled?: boolean
  isProcessing?: boolean
  usedClue?: boolean
  used5050: boolean
  usedPublicVote?: boolean
  isFrozen?: boolean
  freezeTimeLeft?: number
  onUseClue?: () => void
  onUse5050: () => void
  onUseFreeze: () => void
  onUsePublicVote?: () => void
  onRequestPreview?: (aidType: '5050' | 'publicVote' | 'freeze' | 'hint') => void
}

export function QuizPowerUpsBar({
  stockHint,
  stockClue,
  stock5050,
  stockFreeze,
  stockPublicVote,
  inventory = {},
  disabled = false,
  isProcessing = false,
  usedClue = false,
  used5050,
  usedPublicVote = false,
  isFrozen = false,
  freezeTimeLeft = 0,
  onUseClue,
  onUse5050,
  onUseFreeze,
  onUsePublicVote,
  onRequestPreview,
}: QuizPowerUpsBarProps) {
  // Resolução canónica e retrocompatível de stocks
  const countClue =
    typeof stockHint === 'number'
      ? stockHint
      : typeof stockClue === 'number'
        ? stockClue
        : Number(
            inventory['AID_001'] ??
              inventory['aid_hint'] ??
              inventory['consumable_pista'] ??
              inventory['pista_historica'] ??
              inventory['ajuda_pista'] ??
              inventory['hints'] ??
              inventory['utilities']?.hints ??
              0,
          )

  const count5050 =
    typeof stock5050 === 'number'
      ? stock5050
      : Number(
          inventory['AID_002'] ??
            inventory['aid_50_50'] ??
            inventory['consumable_50_50'] ??
            inventory['help5050'] ??
            inventory['utilities']?.fiftyFifty ??
            0,
        )

  const countFreeze =
    typeof stockFreeze === 'number'
      ? stockFreeze
      : Number(
          inventory['AID_004'] ??
            inventory['aid_freeze_time'] ??
            inventory['consumable_congelar_tempo'] ??
            inventory['freezeTime'] ??
            inventory['utilities']?.freezeTime ??
            0,
        )

  const countPublicVote =
    typeof stockPublicVote === 'number'
      ? stockPublicVote
      : Number(
          inventory['AID_003'] ??
            inventory['aid_public_vote'] ??
            inventory['consumable_public_vote'] ??
            inventory['HELP_005'] ??
            inventory['publicVote'] ??
            inventory['utilities']?.publicVote ??
            0,
        )

  const isGloballyDisabled = disabled || isProcessing

  const canUseClue =
    !isGloballyDisabled &&
    !usedClue &&
    (typeof onUseClue === 'function' || typeof onRequestPreview === 'function')
  const canUse5050 = !isGloballyDisabled && !used5050
  const canUsePublicVote =
    !isGloballyDisabled &&
    !usedPublicVote &&
    (typeof onUsePublicVote === 'function' || typeof onRequestPreview === 'function')
  const canUseFreeze = !isGloballyDisabled && !isFrozen

  const handleClickClue = () => {
    if (!canUseClue) return
    if (onRequestPreview && countClue > 0) {
      onRequestPreview('hint')
    } else if (onUseClue) {
      onUseClue()
    }
  }

  const handleClick5050 = () => {
    if (!canUse5050) return
    if (onRequestPreview && count5050 > 0) {
      onRequestPreview('5050')
    } else {
      onUse5050()
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

  const handleClickFreeze = () => {
    if (!canUseFreeze) return
    if (onRequestPreview && countFreeze > 0) {
      onRequestPreview('freeze')
    } else {
      onUseFreeze()
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 select-none shrink-0 w-full max-w-lg mx-auto px-1">
      {/* 0. POWER-UP PISTA HISTÓRICA */}
      <button
        type="button"
        disabled={!canUseClue}
        onClick={handleClickClue}
        aria-label={`Usar Pista Histórica (${countClue} disponíveis)`}
        className={cn(
          'flex-1 min-w-0 h-9 sm:h-10 px-2 sm:px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none shadow-sm',
          usedClue
            ? 'bg-slate-900 border-amber-500/60 text-amber-400 opacity-80 cursor-default'
            : canUseClue
              ? countClue > 0
                ? 'bg-slate-800/95 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-slate-800 cursor-pointer shadow-amber-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 truncate">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : usedClue ? (
            <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />
          ) : (
            <>
              <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Pista</span>
            </>
          )}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono',
            usedClue
              ? 'bg-amber-500/20 text-amber-300'
              : countClue > 0
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-rose-400/80 border border-slate-700/50',
          )}
        >
          {usedClue ? 'OK' : countClue}
        </span>
      </button>
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={handleClick5050}
        aria-label={`Usar Ajuda 50/50 (${count5050} disponíveis)`}
        className={cn(
          'flex-1 min-w-0 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none shadow-sm',
          used5050
            ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? count5050 > 0
                ? 'bg-slate-800/95 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer shadow-cyan-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 truncate">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          ) : used5050 ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
          ) : (
            '🌓 50/50'
          )}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300'
              : count5050 > 0
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-800 text-rose-400/80 border border-slate-700/50',
          )}
        >
          {used5050 ? 'OK' : count5050}
        </span>
      </button>

      {/* 2. POWER-UP PERGUNTA AO PÚBLICO */}
      <button
        type="button"
        disabled={!canUsePublicVote}
        onClick={handleClickPublicVote}
        aria-label={`Usar Pergunta ao Público (${countPublicVote} disponíveis)`}
        className={cn(
          'flex-1 min-w-0 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none shadow-sm',
          usedPublicVote
            ? 'bg-slate-900 border-purple-500/60 text-purple-300 opacity-80 cursor-default'
            : canUsePublicVote
              ? countPublicVote > 0
                ? 'bg-slate-800/95 border-purple-500/40 text-purple-300 hover:border-purple-400 hover:bg-slate-800 cursor-pointer shadow-purple-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 truncate">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
          ) : usedPublicVote ? (
            <Check className="h-3.5 w-3.5 text-purple-400 stroke-[3]" />
          ) : (
            <>
              <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Público</span>
            </>
          )}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono',
            usedPublicVote
              ? 'bg-purple-500/20 text-purple-300'
              : countPublicVote > 0
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-slate-800 text-rose-400/80 border border-slate-700/50',
          )}
        >
          {usedPublicVote ? 'OK' : countPublicVote}
        </span>
      </button>

      {/* 3. POWER-UP CONGELAR TEMPO (+15s) */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={handleClickFreeze}
        aria-label={`Usar Congelar Tempo (+15s) (${countFreeze} disponíveis)`}
        className={cn(
          'flex-1 min-w-0 h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all select-none shadow-sm',
          isFrozen
            ? 'bg-slate-900 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse'
            : canUseFreeze
              ? countFreeze > 0
                ? 'bg-slate-800/95 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-slate-800 cursor-pointer shadow-amber-500/10'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300 cursor-pointer'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 truncate">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : isFrozen ? (
            <Snowflake className="h-3.5 w-3.5 animate-spin text-blue-300" />
          ) : (
            <>
              <span className="shrink-0">⏳</span>
              <span className="truncate">Congelar</span>
            </>
          )}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono',
            isFrozen
              ? 'bg-blue-500/30 text-white'
              : countFreeze > 0
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-800 text-rose-400/80 border border-slate-700/50',
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : countFreeze}
        </span>
      </button>
    </div>
  )
}
