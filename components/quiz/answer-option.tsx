'use client'

import React from 'react'
import { Check, X, ChevronRight, Sparkles } from 'lucide-react'
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
 * Painel chanfrado angular aeroespacial com moldura metálica vetorial,
 * medalhão heráldico octogonal em ouro para a letra e vidro translúcido sobre o cenário.
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
        className="group relative w-full p-[1.5px] opacity-25 select-none cursor-not-allowed filter grayscale"
        style={{
          clipPath:
            'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)',
        }}
      >
        <div
          className="w-full min-h-[3.5rem] sm:min-h-[4rem] landscape:min-h-[3.25rem] bg-slate-950/80 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-3"
          style={{
            clipPath:
              'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)',
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-slate-900 border border-white/10 font-display text-xs font-black text-slate-600 line-through">
            {optionKey}
          </span>
          <span className="flex-1 min-w-0 text-xs sm:text-sm font-semibold text-slate-600 line-through truncate">
            {text}
          </span>
          <span className="text-[10px] font-mono text-slate-600 uppercase font-black tracking-wider">
            50:50
          </span>
        </div>
      </div>
    )
  }

  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isMuted = state === 'muted'
  const isCurrentlySelected = state === 'selected' || isSelected

  // Gradiente da Moldura Chanfrada Externa
  let borderGradient = 'from-cyan-500/40 via-amber-400/50 to-cyan-500/40 group-hover:from-cyan-400 group-hover:via-amber-300 group-hover:to-cyan-400'
  let innerBackground = 'bg-gradient-to-r from-slate-950/85 via-blue-950/75 to-slate-950/85'
  let outerGlow = 'shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:shadow-[0_8px_30px_rgba(6,182,212,0.35)]'

  if (isCorrect) {
    borderGradient = 'from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)]'
    innerBackground = 'bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-emerald-950/90'
    outerGlow = 'shadow-[0_0_35px_rgba(16,185,129,0.6)] scale-[1.015]'
  } else if (isWrong) {
    borderGradient = 'from-rose-500 via-red-400 to-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.7)]'
    innerBackground = 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-rose-950/90'
    outerGlow = 'shadow-[0_0_35px_rgba(239,68,68,0.6)] scale-[1.015]'
  } else if (isCurrentlySelected) {
    borderGradient = 'from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]'
    innerBackground = 'bg-gradient-to-r from-amber-950/90 via-blue-950/85 to-amber-950/90'
    outerGlow = 'shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-[1.015]'
  } else if (isMuted) {
    borderGradient = 'from-white/10 via-white/5 to-white/10'
    innerBackground = 'bg-slate-950/80'
    outerGlow = 'opacity-35'
  }

  return (
    <button
      type="button"
      disabled={disabled || isMuted}
      onClick={onSelect}
      aria-label={`Opção ${optionKey}: ${text}`}
      className={cn(
        'group relative w-full p-[1.5px] transition-all duration-200 outline-none select-none cursor-pointer',
        outerGlow,
        !disabled && !isMuted && 'hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.99]'
      )}
      style={{
        clipPath:
          'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
      }}
    >
      {/* 1. Moldura Chanfrada Metálica Externa */}
      <div
        className={cn(
          'w-full h-full bg-gradient-to-r p-[1.5px] transition-all duration-200',
          borderGradient
        )}
      >
        {/* 2. Corpo Interno da Porta (Vidro Translúcido sobre o Cenário) */}
        <div
          className={cn(
            'w-full min-h-[3.75rem] sm:min-h-[4.25rem] landscape:min-h-[3.5rem] px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3 sm:gap-4 backdrop-blur-xl transition-all duration-200 relative overflow-hidden',
            innerBackground
          )}
          style={{
            clipPath:
              'polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% calc(100% - 13px), calc(100% - 13px) 100%, 13px 100%, 0 calc(100% - 13px), 0 13px)',
          }}
        >
          {/* Reflexo de Varredura de Luz no Hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-700 ease-in-out" />

          {/* ========================================================= */}
          {/* 3. MEDALHÃO HERÁLDICO OCTOGONAL DA LETRA (A, B, C, D)     */}
          {/* ========================================================= */}
          <div
            className={cn(
              'relative shrink-0 flex items-center justify-center p-[1.5px] transition-all duration-200 shadow-md',
              isCorrect
                ? 'bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-700'
                : isWrong
                  ? 'bg-gradient-to-b from-rose-300 via-rose-500 to-rose-700'
                  : isCurrentlySelected
                    ? 'bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600'
                    : 'bg-gradient-to-b from-amber-300 via-cyan-400 to-amber-500 group-hover:from-yellow-200 group-hover:to-amber-400'
            )}
            style={{
              clipPath:
                'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            }}
          >
            <span
              className={cn(
                'flex h-8 w-8 sm:h-9 sm:w-9 landscape:h-7.5 landscape:w-7.5 items-center justify-center font-display font-black text-xs sm:text-sm tracking-tighter transition-colors',
                isCorrect
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : isWrong
                    ? 'bg-rose-600 text-white font-black'
                    : isCurrentlySelected
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-950/90 text-amber-300 group-hover:text-white'
              )}
              style={{
                clipPath:
                  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
              }}
            >
              {isCorrect ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3.5] text-slate-950" />
              ) : isWrong ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5 stroke-[3.5] text-white" />
              ) : (
                <span>{optionKey}</span>
              )}
            </span>
          </div>

          {/* ========================================================= */}
          {/* 4. TEXTO DA RESPOSTA (CRISTALINO E LEGÍVEL)               */}
          {/* ========================================================= */}
          <span
            className={cn(
              'flex-1 min-w-0 text-xs sm:text-sm md:text-[15px] landscape:text-xs sm:landscape:text-sm font-bold leading-snug tracking-wide break-words hyphens-auto transition-colors',
              isCorrect
                ? 'text-emerald-100 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                : isWrong
                  ? 'text-rose-100 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                  : isCurrentlySelected
                    ? 'text-amber-100 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                    : isMuted
                      ? 'text-slate-500'
                      : 'text-slate-100 group-hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]'
            )}
          >
            {text}
          </span>

          {/* ========================================================= */}
          {/* 5. BADGE DE VOTAÇÃO DO PÚBLICO                            */}
          {/* ========================================================= */}
          {publicVotePercent !== undefined && (
            <div className="ml-auto px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-400/80 text-purple-200 font-mono font-black text-xs shadow-md shadow-purple-500/30 flex items-center gap-1.5 shrink-0 animate-pop">
              <span className="text-[11px]">👥</span>
              <span>{publicVotePercent}%</span>
            </div>
          )}

          {/* Chevron Interativo no Hover */}
          {!disabled && !isMuted && !isCorrect && !isWrong && (
            <span className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity text-amber-300 shrink-0">
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
