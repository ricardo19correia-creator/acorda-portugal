'use client'

import React from 'react'
import { Check, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted'

export interface AnswerOptionProps {
  optionKey: 'A' | 'B' | 'C' | 'D'
  text: string
  state: AnswerState
  disabled?: boolean
  eliminated?: boolean
  isSelected?: boolean
  publicVotePercent?: number
  onSelect?: () => void
}

/**
 * 🇵🇹 ACORDA PORTUGAL — PORTA DE COMPETIÇÃO "NATIONAL SHOW"
 * Painel de resposta angular cinematográfico, translúcido sobre o cenário da arena,
 * com medalhão heráldico da letra (A/B/C/D) e iluminação de estado de alta intensidade.
 */
export function AnswerOption({
  optionKey,
  text,
  state,
  disabled = false,
  eliminated = false,
  isSelected = false,
  publicVotePercent,
  onSelect,
}: AnswerOptionProps) {
  // 1. Estado Eliminado pelo 50:50
  if (eliminated) {
    return (
      <div
        aria-hidden="true"
        className="group relative flex min-h-[3.25rem] sm:min-h-[4rem] landscape:min-h-[3rem] h-auto w-full items-center gap-2.5 sm:gap-3.5 rounded-2xl p-2.5 sm:p-3.5 text-left select-none cursor-not-allowed national-show-door-eliminated transition-all"
      >
        {/* Medalhão Eliminado */}
        <span className="relative flex h-8 w-8 sm:h-9 sm:w-9 landscape:h-7 landscape:w-7 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/80 font-display text-xs sm:text-sm font-black text-slate-600 line-through">
          {optionKey}
        </span>

        {/* Texto Riscado com Desvanecimento */}
        <span className="flex-1 min-w-0 text-xs sm:text-sm landscape:text-xs font-semibold text-slate-600 line-through leading-snug break-words hyphens-auto">
          {text}
        </span>

        {/* Badge 50/50 */}
        <span className="shrink-0 px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
          50:50
        </span>
      </div>
    )
  }

  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isMuted = state === 'muted'
  const isCurrentlySelected = state === 'selected' || isSelected

  // Determinar classes visuais de acordo com o estado do Game Show
  let stateClasses = 'national-show-door hover:border-cyan-400/80'
  if (isCorrect) {
    stateClasses = 'national-show-door-correct scale-[1.01]'
  } else if (isWrong) {
    stateClasses = 'national-show-door-wrong scale-[1.01]'
  } else if (isCurrentlySelected) {
    stateClasses = 'national-show-door-selected scale-[1.01]'
  } else if (isMuted) {
    stateClasses = 'national-show-door-muted'
  }

  return (
    <button
      type="button"
      disabled={disabled || isMuted}
      onClick={onSelect}
      aria-label={`Opção ${optionKey}: ${text}`}
      className={cn(
        'group relative flex min-h-[3.25rem] sm:min-h-[4rem] landscape:min-h-[3rem] h-auto w-full items-center gap-2.5 sm:gap-3.5 rounded-2xl p-2.5 sm:p-3.5 text-left outline-none select-none cursor-pointer',
        stateClasses
      )}
    >
      {/* Filetes de Luz Heráldicos nos Cantos (Aeroespacial + Manuelino) */}
      <span className="pointer-events-none absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-lg group-hover:border-cyan-300 transition-colors" />
      <span className="pointer-events-none absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400/40 rounded-br-lg group-hover:border-cyan-300 transition-colors" />

      {/* ========================================================= */}
      {/* MEDALHÃO HERÁLDICO DA LETRA (A, B, C, D)                  */}
      {/* ========================================================= */}
      <span
        className={cn(
          'door-medallion flex h-8 w-8 sm:h-9 sm:w-9 landscape:h-7 landscape:w-7 shrink-0 items-center justify-center text-xs sm:text-sm font-black transition-all duration-200',
          isCorrect
            ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-105'
            : isWrong
              ? 'bg-rose-600 border-rose-300 text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-105'
              : isCurrentlySelected
                ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105'
                : 'text-cyan-300 group-hover:text-amber-300 group-hover:border-amber-400/80 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.4)]'
        )}
      >
        {isCorrect ? (
          <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3.5] text-slate-950" />
        ) : isWrong ? (
          <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3.5] text-white" />
        ) : (
          <span>{optionKey}</span>
        )}
      </span>

      {/* ========================================================= */}
      {/* TEXTO DA RESPOSTA (CRISTALINO E LEGÍVEL)                  */}
      {/* ========================================================= */}
      <span
        className={cn(
          'flex-1 min-w-0 text-xs sm:text-sm landscape:text-xs font-bold leading-snug tracking-wide break-words hyphens-auto transition-colors',
          isCorrect
            ? 'text-emerald-100 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
            : isWrong
              ? 'text-rose-100 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
              : isCurrentlySelected
                ? 'text-amber-100 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : isMuted
                  ? 'text-slate-500'
                  : 'text-slate-100 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
        )}
      >
        {text}
      </span>

      {/* ========================================================= */}
      {/* PERCENTAGEM DA AJUDA DO PÚBLICO (SE ATIVA)                */}
      {/* ========================================================= */}
      {publicVotePercent !== undefined && (
        <div className="ml-auto px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-400/80 text-purple-200 font-mono font-black text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 shrink-0 animate-pop">
          <span className="text-[11px]">👥</span>
          <span>{publicVotePercent}%</span>
        </div>
      )}

      {/* Efeito sutil de indicação de hover */}
      {!disabled && !isMuted && !isCorrect && !isWrong && (
        <span className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400/80 shrink-0">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </button>
  )
}
