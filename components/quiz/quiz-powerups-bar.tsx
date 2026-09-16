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
    <div className="w-full max-w-md mx-auto my-0.5 sm:my-1 select-none shrink-0">
      {/* CÁPSULA HORIZONTAL DE POWER-UPS COM BRILHO NEON AZUL E BORDA DOURADA/AZUL */}
      <div className="relative w-full rounded-full p-[1.5px] bg-gradient-to-r from-blue-500/40 via-cyan-400/60 to-blue-500/40 shadow-[0_0_20px_rgba(30,58,138,0.35),0_0_10px_rgba(56,189,248,0.2)]">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[#050f26]/95 via-[#091b42]/95 to-[#050f26]/95 backdrop-blur-2xl px-2.5 sm:px-5 py-1 sm:py-1.5 flex items-center justify-around gap-1.5 sm:gap-3">
          {/* ========================================================= */}
          {/* 1. POWER-UP: 50/50 (CISÃO DOURADA)                        */}
          {/* ========================================================= */}
          <button
            type="button"
            disabled={!canUse5050}
            onClick={handleClick5050}
            aria-label={`Ajuda 50:50 (${count5050} disponíveis)`}
            className={cn(
              'group flex flex-col items-center gap-0.5 sm:gap-1 outline-none select-none cursor-pointer transition-all duration-200',
              used5050 ? 'opacity-60 cursor-default' : canUse5050 ? 'hover:scale-105 active:scale-95' : 'opacity-30 pointer-events-none cursor-not-allowed'
            )}
          >
            {/* Círculo Luminoso Dourado */}
            <div
              className={cn(
                'relative w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center p-[1.5px] sm:p-[2px] transition-all duration-200',
                used5050
                  ? 'bg-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : count5050 > 0
                    ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_18px_rgba(245,158,11,0.8)]'
                    : 'bg-slate-700/40'
              )}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c2742] to-[#0a1224] flex items-center justify-center border border-amber-400/40">
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-amber-400" />
                ) : used5050 ? (
                  <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-400 stroke-[3]" />
                ) : (
                  <span className="font-display font-black text-amber-300 text-[10px] xs:text-xs sm:text-sm tracking-tight drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                    50/50
                  </span>
                )}
              </div>
            </div>

            {/* Nome da Ajuda */}
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-200 group-hover:text-white tracking-wide leading-tight">
              50/50
            </span>

            {/* Badge de Quantidade */}
            <div
              className={cn(
                'px-1.5 sm:px-2 py-0 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold leading-none border transition-all',
                used5050
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : count5050 > 0
                    ? 'bg-[#081530] border-blue-400/50 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                    : 'bg-black/50 border-white/10 text-slate-500'
              )}
            >
              {used5050 ? 'OK' : `x${count5050}`}
            </div>
          </button>

          {/* ========================================================= */}
          {/* 2. POWER-UP: PISTA HISTÓRICA / VOTAÇÃO DO PÚBLICO         */}
          {/* ========================================================= */}
          <button
            type="button"
            disabled={!canUsePublicVote}
            onClick={handleClickPublicVote}
            aria-label={`Pista Histórica (${countPublicVote} disponíveis)`}
            className={cn(
              'group flex flex-col items-center gap-0.5 sm:gap-1 outline-none select-none cursor-pointer transition-all duration-200',
              usedPublicVote ? 'opacity-60 cursor-default' : canUsePublicVote ? 'hover:scale-105 active:scale-95' : 'opacity-30 pointer-events-none cursor-not-allowed'
            )}
          >
            {/* Círculo Luminoso Dourado / Pista */}
            <div
              className={cn(
                'relative w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center p-[1.5px] sm:p-[2px] transition-all duration-200',
                usedPublicVote
                  ? 'bg-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : countPublicVote > 0
                    ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_18px_rgba(245,158,11,0.8)]'
                    : 'bg-slate-700/40'
              )}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c2742] to-[#0a1224] flex items-center justify-center border border-amber-400/40">
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-amber-400" />
                ) : usedPublicVote ? (
                  <Check className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-400 stroke-[3]" />
                ) : (
                  <Users className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                )}
              </div>
            </div>

            {/* Nome da Ajuda */}
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-200 group-hover:text-white tracking-wide leading-tight">
              Pista Histórica
            </span>

            {/* Badge de Quantidade */}
            <div
              className={cn(
                'px-1.5 sm:px-2 py-0 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold leading-none border transition-all',
                usedPublicVote
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                  : countPublicVote > 0
                    ? 'bg-[#081530] border-blue-400/50 text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.25)]'
                    : 'bg-black/50 border-white/10 text-slate-500'
              )}
            >
              {usedPublicVote ? 'OK' : `x${countPublicVote}`}
            </div>
          </button>

          {/* ========================================================= */}
          {/* 3. POWER-UP: CONGELAR TEMPO (CRISTAL GLACIAL)             */}
          {/* ========================================================= */}
          <button
            type="button"
            disabled={!canUseFreeze}
            onClick={handleClickFreeze}
            aria-label={`Congelar Tempo (${countFreeze} disponíveis)`}
            className={cn(
              'group flex flex-col items-center gap-0.5 sm:gap-1 outline-none select-none cursor-pointer transition-all duration-200',
              isFrozen ? 'animate-pulse' : canUseFreeze ? 'hover:scale-105 active:scale-95' : 'opacity-30 pointer-events-none cursor-not-allowed'
            )}
          >
            {/* Círculo Luminoso Neon Ciano */}
            <div
              className={cn(
                'relative w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center p-[1.5px] sm:p-[2px] transition-all duration-200',
                isFrozen
                  ? 'bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]'
                  : countFreeze > 0
                    ? 'bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_18px_rgba(56,189,248,0.8)]'
                    : 'bg-slate-700/40'
              )}
            >
              <div
                className={cn(
                  'w-full h-full rounded-full flex items-center justify-center border',
                  isFrozen
                    ? 'bg-cyan-950 border-cyan-300'
                    : 'bg-gradient-to-b from-[#162a4d] to-[#0a1224] border-cyan-400/40'
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-cyan-400" />
                ) : (
                  <Snowflake
                    className={cn(
                      'h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-cyan-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]',
                      isFrozen && 'animate-spin'
                    )}
                  />
                )}
              </div>
            </div>

            {/* Nome da Ajuda */}
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-200 group-hover:text-white tracking-wide leading-tight">
              Congelar Tempo
            </span>

            {/* Badge de Quantidade */}
            <div
              className={cn(
                'px-1.5 sm:px-2 py-0 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-mono font-bold leading-none border transition-all',
                isFrozen
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  : countFreeze > 0
                    ? 'bg-[#081530] border-blue-400/50 text-cyan-300 shadow-[0_0_6px_rgba(56,189,248,0.25)]'
                    : 'bg-black/50 border-white/10 text-slate-500'
              )}
            >
              {isFrozen ? `${freezeTimeLeft}s` : `x${countFreeze}`}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
