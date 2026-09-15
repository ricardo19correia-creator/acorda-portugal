'use client'

import React from 'react'
import { Snowflake, Check, Users, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuizPowerUpsBarProps {
  stock5050?: number
  stockFreeze?: number
  stockPublicVote?: number
  inventory?: Record<string, any>
  disabled?: boolean
  isProcessing?: boolean
  used5050: boolean
  usedPublicVote?: boolean
  isFrozen?: boolean
  freezeTimeLeft?: number
  onUse5050: () => void
  onUseFreeze?: () => void
  onUsePublicVote?: () => void
  onRequestPreview?: (aidType: '5050' | 'publicVote' | 'freeze') => void
}

/**
 * 🇵🇹 ACORDA PORTUGAL — BARRA DE ARTEFACTOS DE PODER (LIFELINES)
 * Apresentação dos poderes do jogo como artefactos sagrados de competição:
 * - 50:50 (Cisão Dourada)
 * - Congelar Tempo (Cristal Glacial +15s)
 * - Ajuda do Público (Voz da Nação)
 */
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
  // 1. Stock do 50:50
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

  // 2. Stock de Congelar Tempo
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

  // 3. Stock de Ajuda do Público
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
    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm sm:max-w-md mx-auto my-1.5 select-none shrink-0">
      {/* ========================================================= */}
      {/* 1. ARTEFACTO: 50:50 (CISÃO DOURADA)                       */}
      {/* ========================================================= */}
      <button
        type="button"
        disabled={!canUse5050}
        onClick={handleClick5050}
        aria-label={`Ajuda 50:50 (${count5050} disponíveis)`}
        className={cn(
          'artifact-pedestal relative w-full h-12 sm:h-13 px-2 sm:px-3 rounded-2xl flex items-center justify-between gap-1.5 outline-none select-none cursor-pointer',
          used5050
            ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400 opacity-80 cursor-default'
            : canUse5050
              ? 'hover:border-amber-400/80 active:scale-95 shadow-amber-500/10'
              : 'opacity-35 pointer-events-none cursor-not-allowed border-white/5 bg-slate-950/60 text-slate-500'
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : used5050 ? (
              <Check className="h-4 w-4 text-emerald-400 stroke-[3]" />
            ) : (
              <span className="text-xs sm:text-sm font-black font-display text-amber-300">½</span>
            )}
          </span>
          <div className="flex flex-col text-left min-w-0">
            <span className="truncate text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-100">
              50:50
            </span>
            <span className="text-[9px] text-amber-300/80 font-medium leading-none hidden sm:block">
              Cisão
            </span>
          </div>
        </span>

        {/* Badge de Stock Dourado */}
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-lg text-[10px] font-black shrink-0 font-mono leading-none border',
            used5050
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : count5050 > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'bg-black/40 text-slate-600 border-white/5'
          )}
        >
          {used5050 ? 'OK' : `x${count5050}`}
        </span>
      </button>

      {/* ========================================================= */}
      {/* 2. ARTEFACTO: CONGELAR TEMPO (CRISTAL GLACIAL)            */}
      {/* ========================================================= */}
      <button
        type="button"
        disabled={!canUseFreeze}
        onClick={handleClickFreeze}
        aria-label={`Congelar Tempo (${countFreeze} disponíveis)`}
        className={cn(
          'artifact-pedestal relative w-full h-12 sm:h-13 px-2 sm:px-3 rounded-2xl flex items-center justify-between gap-1.5 outline-none select-none cursor-pointer',
          isFrozen
            ? 'border-cyan-300 bg-cyan-950/70 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse'
            : canUseFreeze
              ? 'hover:border-cyan-400/80 active:scale-95 shadow-cyan-500/10'
              : 'opacity-35 pointer-events-none cursor-not-allowed border-white/5 bg-slate-950/60 text-slate-500'
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            ) : (
              <Snowflake className={cn('h-4 w-4 text-cyan-300', isFrozen && 'animate-spin')} />
            )}
          </span>
          <div className="flex flex-col text-left min-w-0">
            <span className="truncate text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-100">
              Gelo
            </span>
            <span className="text-[9px] text-cyan-300/80 font-medium leading-none hidden sm:block">
              +15s
            </span>
          </div>
        </span>

        {/* Badge de Stock Glacial */}
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-lg text-[10px] font-black shrink-0 font-mono leading-none border',
            isFrozen
              ? 'bg-cyan-500/30 text-white border-cyan-400'
              : countFreeze > 0
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                : 'bg-black/40 text-slate-600 border-white/5'
          )}
        >
          {isFrozen ? `${freezeTimeLeft}s` : `x${countFreeze}`}
        </span>
      </button>

      {/* ========================================================= */}
      {/* 3. ARTEFACTO: AJUDA DO PÚBLICO (VOZ DA NAÇÃO)             */}
      {/* ========================================================= */}
      <button
        type="button"
        disabled={!canUsePublicVote}
        onClick={handleClickPublicVote}
        aria-label={`Ajuda do Público (${countPublicVote} disponíveis)`}
        className={cn(
          'artifact-pedestal relative w-full h-12 sm:h-13 px-2 sm:px-3 rounded-2xl flex items-center justify-between gap-1.5 outline-none select-none cursor-pointer',
          usedPublicVote
            ? 'border-purple-500/50 bg-purple-950/40 text-purple-300 opacity-80 cursor-default'
            : canUsePublicVote
              ? 'hover:border-purple-400/80 active:scale-95 shadow-purple-500/10'
              : 'opacity-35 pointer-events-none cursor-not-allowed border-white/5 bg-slate-950/60 text-slate-500'
        )}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 border border-purple-400/30 text-purple-300">
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
            ) : usedPublicVote ? (
              <Check className="h-4 w-4 text-purple-300 stroke-[3]" />
            ) : (
              <Users className="h-4 w-4 text-purple-300" />
            )}
          </span>
          <div className="flex flex-col text-left min-w-0">
            <span className="truncate text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-100">
              Público
            </span>
            <span className="text-[9px] text-purple-300/80 font-medium leading-none hidden sm:block">
              Votação
            </span>
          </div>
        </span>

        {/* Badge de Stock Púrpura Imperial */}
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-lg text-[10px] font-black shrink-0 font-mono leading-none border',
            usedPublicVote
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
              : countPublicVote > 0
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]'
                : 'bg-black/40 text-slate-600 border-white/5'
          )}
        >
          {usedPublicVote ? 'OK' : `x${countPublicVote}`}
        </span>
      </button>
    </div>
  )
}
