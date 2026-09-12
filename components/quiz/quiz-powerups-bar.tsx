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
  onUseFreeze?: () => void
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
  // Resolução canónica e retrocompatível de stocks (nunca negativa)
  const countClue = Math.max(
    0,
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
              inventory['dica'] ??
              inventory['utilities']?.hints ??
              0,
          ),
  )

  const count5050 = Math.max(
    0,
    typeof stock5050 === 'number'
      ? stock5050
      : Number(
          inventory['AID_002'] ??
            inventory['aid_50_50'] ??
            inventory['consumable_50_50'] ??
            inventory['help5050'] ??
            inventory['utilities']?.fiftyFifty ??
            0,
        ),
  )

  const countPublicVote = Math.max(
    0,
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
        ),
  )

  const countFreeze = Math.max(
    0,
    typeof stockFreeze === 'number'
      ? stockFreeze
      : Number(
          inventory['AID_004'] ??
            inventory['aid_freeze_time'] ??
            inventory['consumable_congelar_tempo'] ??
            inventory['freezeTime'] ??
            inventory['utilities']?.freezeTime ??
            0,
        ),
  )

  const isGloballyDisabled = disabled || isProcessing

  // Regra 2.b: Bloqueia o clique se a quantidade for 0 (fica desativado / disabled cinzento)
  const canUse5050 = !isGloballyDisabled && !used5050 && count5050 > 0
  const canUseClue =
    !isGloballyDisabled &&
    !usedClue &&
    countClue > 0 &&
    (typeof onUseClue === 'function' || typeof onRequestPreview === 'function')

  // O 3º poder é Ajuda do Público (prioritário) ou Congelar Tempo caso público não seja fornecido
  const hasPublicVoteAction = typeof onUsePublicVote === 'function' || typeof onRequestPreview === 'function'
  const isPublicThirdButton = hasPublicVoteAction || typeof stockPublicVote === 'number'

  const canUsePublicVote =
    !isGloballyDisabled &&
    !usedPublicVote &&
    countPublicVote > 0 &&
    hasPublicVoteAction

  const canUseFreeze = !isGloballyDisabled && !isFrozen && countFreeze > 0 && typeof onUseFreeze === 'function'

  const handleClick5050 = () => {
    if (!canUse5050) return
    if (onRequestPreview && count5050 > 0) {
      onRequestPreview('5050')
    } else {
      onUse5050()
    }
  }

  const handleClickClue = () => {
    if (!canUseClue) return
    if (onRequestPreview && countClue > 0) {
      onRequestPreview('hint')
    } else if (onUseClue) {
      onUseClue()
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
    } else if (onUseFreeze) {
      onUseFreeze()
    }
  }

  return (
    <div className="w-full grid grid-cols-3 gap-2 select-none shrink-0 max-w-lg mx-auto">
      {/* 1. POWER-UP 50/50 */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={handleClick5050}
        aria-label={`Ajuda 50:50 (${count5050} disponíveis)`}
        className={cn(
          'w-full h-10 sm:h-11 px-2 sm:px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
          used5050
            ? 'bg-slate-900 border-emerald-500/60 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'bg-slate-800/95 border-cyan-500/40 text-cyan-200 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer shadow-cyan-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 min-w-0">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400 shrink-0" />
          ) : used5050 ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3] shrink-0" />
          ) : (
            <span className="shrink-0 text-sm leading-none">🌓</span>
          )}
          <span className="truncate text-[11px] sm:text-xs font-bold">50:50</span>
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

      {/* 2. POWER-UP DICA / PISTA */}
      <button
        type="button"
        disabled={!canUseClue}
        onClick={handleClickClue}
        aria-label={`Dica (${countClue} disponíveis)`}
        className={cn(
          'w-full h-10 sm:h-11 px-2 sm:px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
          usedClue
            ? 'bg-slate-900 border-amber-500/60 text-amber-400 opacity-80 cursor-default'
            : canUseClue
              ? 'bg-slate-800/95 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-slate-800 cursor-pointer shadow-amber-500/10'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
        )}
      >
        <span className="flex items-center gap-1 min-w-0">
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
          ) : usedClue ? (
            <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3] shrink-0" />
          ) : (
            <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          )}
          <span className="truncate text-[11px] sm:text-xs font-bold">Dica</span>
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-black shrink-0 font-mono leading-none',
            usedClue
              ? 'bg-amber-500/20 text-amber-300'
              : countClue > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/50',
          )}
        >
          {usedClue ? 'OK' : `x${countClue}`}
        </span>
      </button>

      {/* 3. POWER-UP PÚBLICO (OU CONGELAR TEMPO CASO PÚBLICO NÃO ESTEJA DEFINIDO) */}
      {isPublicThirdButton ? (
        <button
          type="button"
          disabled={!canUsePublicVote}
          onClick={handleClickPublicVote}
          aria-label={`Ajuda do Público (${countPublicVote} disponíveis)`}
          className={cn(
            'w-full h-10 sm:h-11 px-2 sm:px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
            usedPublicVote
              ? 'bg-slate-900 border-purple-500/60 text-purple-300 opacity-80 cursor-default'
              : canUsePublicVote
                ? 'bg-slate-800/95 border-purple-500/40 text-purple-300 hover:border-purple-400 hover:bg-slate-800 cursor-pointer shadow-purple-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
          )}
        >
          <span className="flex items-center gap-1 min-w-0">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400 shrink-0" />
            ) : usedPublicVote ? (
              <Check className="h-3.5 w-3.5 text-purple-400 stroke-[3] shrink-0" />
            ) : (
              <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            )}
            <span className="truncate text-[11px] sm:text-xs font-bold">Público</span>
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
      ) : (
        <button
          type="button"
          disabled={!canUseFreeze}
          onClick={handleClickFreeze}
          aria-label={`Congelar Tempo (${countFreeze} disponíveis)`}
          className={cn(
            'w-full h-10 sm:h-11 px-2 sm:px-2.5 rounded-xl border font-bold text-xs flex items-center justify-between gap-1 active:scale-95 transition-all select-none shadow-sm',
            isFrozen
              ? 'bg-slate-900 border-blue-400 text-blue-200 shadow-[0_0_15px_rgba(96,165,250,0.5)] animate-pulse'
              : canUseFreeze
                ? 'bg-slate-800/95 border-blue-500/40 text-blue-300 hover:border-blue-400 hover:bg-slate-800 cursor-pointer shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-45 cursor-not-allowed',
          )}
        >
          <span className="flex items-center gap-1 min-w-0">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400 shrink-0" />
            ) : isFrozen ? (
              <Snowflake className="h-3.5 w-3.5 animate-spin text-blue-300 shrink-0" />
            ) : (
              <Snowflake className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            )}
            <span className="truncate text-[11px] sm:text-xs font-bold">Congelar</span>
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
      )}
    </div>
  )
}
