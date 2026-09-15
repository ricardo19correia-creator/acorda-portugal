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
        className="relative w-full min-h-[3.75rem] sm:min-h-[4.25rem] px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-white/5 bg-[#060c1d]/30 flex items-center gap-3.5 sm:gap-4 opacity-20 select-none cursor-not-allowed filter grayscale transition-opacity duration-300"
      >
        <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 font-display text-xs sm:text-sm font-black text-slate-600 line-through">
          {optionKey}
        </span>
        <span className="flex-1 min-w-0 text-xs sm:text-sm md:text-base font-semibold text-slate-600 line-through truncate">
          {text}
        </span>
        <span className="text-[10px] font-mono text-slate-600 uppercase font-black tracking-wider shrink-0">
          50:50
        </span>
      </div>
    )
  }

  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isMuted = state === 'muted'
  const isCurrentlySelected = state === 'selected' || isSelected

  // Cores, bordas e iluminação de concurso televisivo profissional
  let containerStyles = 'bg-[#0a1532]/90 hover:bg-[#102047] border-blue-500/30 hover:border-blue-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.5),0_0_15px_rgba(30,58,138,0.2)]'
  let letterBadgeStyles = 'bg-[#122247] border-blue-400/35 text-blue-200 group-hover:text-white group-hover:border-blue-300/80 group-hover:bg-[#182e5e]'
  let textStyles = 'text-slate-100 group-hover:text-white'
  let animationClass = ''

  if (isCorrect) {
    // 5. RESPOSTA CERTA: Verde premium, texto branco, glow verde subtil
    containerStyles = 'bg-[#0a3821] border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.45),0_6px_24px_rgba(0,0,0,0.6)]'
    letterBadgeStyles = 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
    textStyles = 'text-white font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
    animationClass = 'animate-[pulse-gentle_1.5s_ease-in-out_infinite]'
  } else if (isWrong) {
    // 6. RESPOSTA ERRADA: Vermelho premium, texto branco, glow vermelho subtil
    containerStyles = 'bg-[#3b1219] border-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.45),0_6px_24px_rgba(0,0,0,0.6)]'
    letterBadgeStyles = 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
    textStyles = 'text-white font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
    animationClass = 'animate-[shake-subtle_0.35s_ease-in-out]'
  } else if (isCurrentlySelected) {
    // 4. SELECIONADO: Destaque imediato âmbar/ouro de lock-in
    containerStyles = 'bg-[#15274d] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4),0_6px_20px_rgba(0,0,0,0.6)] ring-1 ring-amber-400/50'
    letterBadgeStyles = 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
    textStyles = 'text-amber-100 font-black'
    animationClass = 'animate-[pop-subtle_0.2s_ease-out]'
  } else if (isMuted) {
    containerStyles = 'bg-[#081022]/60 border-white/5 opacity-35 shadow-none'
    letterBadgeStyles = 'bg-slate-900/60 border-slate-700/30 text-slate-500'
    textStyles = 'text-slate-400'
  }

  return (
    <button
      type="button"
      disabled={disabled || isMuted}
      onClick={onSelect}
      aria-label={`Opção ${optionKey}: ${text}`}
      className={cn(
        'group relative w-full min-h-[3.75rem] sm:min-h-[4.25rem] px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border flex items-center gap-3.5 sm:gap-4.5 text-left outline-none select-none transition-all duration-200 cursor-pointer backdrop-blur-xl',
        containerStyles,
        animationClass,
        !disabled && !isMuted && !isCurrentlySelected && !isCorrect && !isWrong && 'hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.995]',
        (disabled || isMuted) && 'cursor-default'
      )}
    >
      {/* 1. MEDALHÃO DA LETRA (A, B, C, D) */}
      <span
        className={cn(
          'relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border font-display font-black text-sm sm:text-base tracking-wider transition-all duration-200 shadow-sm',
          letterBadgeStyles
        )}
      >
        {isCorrect ? (
          <Check className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3.5] text-slate-950" />
        ) : isWrong ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3.5] text-white" />
        ) : (
          <span>{optionKey}</span>
        )}
      </span>

      {/* 2. TEXTO DA RESPOSTA (GRANDE, LEGÍVEL E CRISTALINO) */}
      <span
        className={cn(
          'flex-1 min-w-0 text-sm sm:text-base md:text-[17px] font-bold leading-snug sm:leading-relaxed tracking-wide break-words hyphens-auto transition-colors duration-200',
          textStyles
        )}
      >
        {text}
      </span>

      {/* 3. PERCENTAGEM DO VOTO DO PÚBLICO (SE APLICÁVEL) */}
      {publicVotePercent !== undefined && !eliminated && (
        <span className="ml-auto px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-400/80 text-purple-200 font-mono font-black text-xs sm:text-sm shadow-md shadow-purple-500/30 flex items-center gap-1 shrink-0">
          <span className="text-[11px]">👥</span>
          <span>{publicVotePercent}%</span>
        </span>
      )}
    </button>
  )
}
