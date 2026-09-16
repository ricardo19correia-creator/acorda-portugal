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
 * 🇵🇹 ACORDA PORTUGAL — BARRA DE RESPOSTA ANGULAR (DESIGN FIDELIDADE TOTAL)
 * Barra horizontal angular com pontas chanfradas, compartimento hexagonal metálico dourado
 * para a letra (A, B, C, D) e tipografia branca cristalina de alto contraste.
 *
 * Estados visuais:
 * - Normal: Vidro azul noite profundo, contorno neon azul e remates dourados.
 * - Hover: Brilho aumentado e feedback luminoso.
 * - Selecionado (Lock-in): Destaque âmbar/ouro luminoso.
 * - Correto: Verde esmeralda neon vibrante (#00ff88) com glow radiante (como a opção C da referência).
 * - Errado: Vermelho rubi neon vibrante (#ff2244) com glow radiante.
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
        className="relative w-full min-h-[2.5rem] sm:min-h-[2.85rem] md:min-h-[3.25rem] my-0.5 sm:my-1 opacity-20 select-none cursor-not-allowed filter grayscale transition-opacity duration-300 pointer-events-none"
      >
        <div
          className="relative w-full h-full p-[1.5px] bg-slate-800/40"
          style={{
            clipPath:
              'polygon(16px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 16px 100%, 0% 50%)',
          }}
        >
          <div
            className="w-full h-full px-3 sm:px-5 py-1 sm:py-2 bg-[#050b18]/80 flex items-center gap-2.5 sm:gap-3.5"
            style={{
              clipPath:
                'polygon(15px 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0% 50%)',
            }}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-900 flex items-center justify-center font-display font-bold text-slate-600 line-through text-xs sm:text-sm">
              {optionKey}
            </div>
            <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-600 line-through truncate">
              {text}
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 uppercase font-black tracking-wider">
              50:50
            </span>
          </div>
        </div>
      </div>
    )
  }

  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isMuted = state === 'muted'
  const isCurrentlySelected = state === 'selected' || isSelected

  // Paleta de bordas e preenchimento conforme o estado
  let outerBorderGradient =
    'from-amber-400/80 via-blue-500/80 to-cyan-400/80 hover:from-amber-300 hover:via-blue-400 hover:to-cyan-300'
  let innerBg = 'bg-[#06122d]/95 hover:bg-[#091b3f]/95'
  let containerGlow =
    'shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_14px_rgba(30,58,138,0.35)] hover:shadow-[0_0_20px_rgba(56,189,248,0.45)]'
  let hexagonBorder = 'border-amber-400/90 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
  let hexagonBg = 'bg-gradient-to-b from-[#1b2b52] to-[#0d172e]'
  let textStyles = 'text-white'
  let animationClass = ''

  if (isCorrect) {
    // 5. RESPOSTA CORRETA: Verde neon radiante (IDÊNTICO À OPÇÃO C NA IMAGEM)
    outerBorderGradient = 'from-emerald-400 via-[#00ff88] to-teal-400'
    innerBg = 'bg-gradient-to-r from-[#06381d]/95 via-[#0a4d29]/95 to-[#06381d]/95'
    containerGlow =
      'shadow-[0_0_35px_rgba(0,255,136,0.6),0_0_15px_rgba(16,185,129,0.8),0_6px_24px_rgba(0,0,0,0.8)]'
    hexagonBorder = 'border-emerald-300 text-slate-950 bg-emerald-400 shadow-[0_0_15px_rgba(0,255,136,0.8)]'
    hexagonBg = 'bg-emerald-400'
    textStyles = 'text-white font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
    animationClass = 'animate-[pulse-gentle_1.5s_ease-in-out_infinite]'
  } else if (isWrong) {
    // 6. RESPOSTA ERRADA: Vermelho rubi neon radiante
    outerBorderGradient = 'from-rose-500 via-[#ff2244] to-red-600'
    innerBg = 'bg-gradient-to-r from-[#420f18]/95 via-[#541420]/95 to-[#420f18]/95'
    containerGlow =
      'shadow-[0_0_35px_rgba(255,34,68,0.6),0_0_15px_rgba(239,68,68,0.8),0_6px_24px_rgba(0,0,0,0.8)]'
    hexagonBorder = 'border-rose-300 text-white bg-rose-600 shadow-[0_0_15px_rgba(255,34,68,0.8)]'
    hexagonBg = 'bg-rose-600'
    textStyles = 'text-white font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
    animationClass = 'animate-[shake-subtle_0.35s_ease-in-out]'
  } else if (isCurrentlySelected) {
    // 4. SELECIONADO: Âmbar/Ouro com suspensa lock-in
    outerBorderGradient = 'from-amber-300 via-yellow-400 to-amber-500'
    innerBg = 'bg-gradient-to-r from-[#1b2b52]/95 via-[#233866]/95 to-[#1b2b52]/95'
    containerGlow =
      'shadow-[0_0_30px_rgba(245,158,11,0.55),0_0_12px_rgba(251,191,36,0.7)]'
    hexagonBorder = 'border-amber-200 text-slate-950 bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.7)]'
    hexagonBg = 'bg-amber-400'
    textStyles = 'text-amber-100 font-extrabold'
    animationClass = 'animate-[pop-subtle_0.2s_ease-out]'
  } else if (isMuted) {
    outerBorderGradient = 'from-slate-700/40 via-blue-900/30 to-slate-800/40'
    innerBg = 'bg-[#050b18]/60'
    containerGlow = 'opacity-40 shadow-none'
    hexagonBorder = 'border-slate-700/50 text-slate-500'
    hexagonBg = 'bg-slate-900/60'
    textStyles = 'text-slate-400'
  }

  return (
    <button
      type="button"
      disabled={disabled || isMuted}
      onClick={onSelect}
      aria-label={`Opção ${optionKey}: ${text}`}
      className={cn(
        'group relative w-full min-h-[2.5rem] sm:min-h-[2.85rem] md:min-h-[3.25rem] my-0.5 sm:my-1 outline-none select-none transition-all duration-200 cursor-pointer block',
        animationClass,
        containerGlow,
        !disabled && !isMuted && !isCurrentlySelected && !isCorrect && !isWrong && 'hover:scale-[1.01] active:scale-[0.99] active:brightness-110',
        (disabled || isMuted) && 'cursor-default'
      )}
    >
      {/* MOLDURA EXTERIOR CHANFRADA (Bordas metálicas neon com chanfro a 45º) */}
      <div
        className={cn(
          'relative w-full h-full p-[1.5px] sm:p-[2px] transition-all duration-200 bg-gradient-to-r',
          outerBorderGradient
        )}
        style={{
          clipPath:
            'polygon(14px 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0% 50%)',
        }}
      >
        {/* CORPO INTERIOR CHANFRADO */}
        <div
          className={cn(
            'w-full h-full px-3 sm:px-5 py-1 sm:py-2 flex items-center gap-2.5 sm:gap-3.5 transition-all duration-200 backdrop-blur-xl',
            innerBg
          )}
          style={{
            clipPath:
              'polygon(13px 0%, calc(100% - 13px) 0%, 100% 50%, calc(100% - 13px) 100%, 13px 100%, 0% 50%)',
          }}
        >
          {/* 1. MÓDULO HEXAGONAL METÁLICO DOURADO PARA A LETRA A / B / C / D */}
          <div className="relative flex items-center justify-center shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9">
            <div
              className={cn(
                'w-full h-full p-[1.5px] transition-all duration-200 flex items-center justify-center',
                isCorrect
                  ? 'bg-emerald-300'
                  : isWrong
                    ? 'bg-rose-300'
                    : isCurrentlySelected
                      ? 'bg-amber-300'
                      : 'bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600'
              )}
              style={{
                clipPath:
                  'polygon(28% 0%, 72% 0%, 100% 50%, 72% 100%, 28% 100%, 0% 50%)',
              }}
            >
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center font-display font-black text-xs sm:text-sm md:text-base tracking-wider transition-colors duration-200',
                  hexagonBg,
                  isCorrect || isWrong || isCurrentlySelected ? '' : 'text-amber-300'
                )}
                style={{
                  clipPath:
                    'polygon(28% 0%, 72% 0%, 100% 50%, 72% 100%, 28% 100%, 0% 50%)',
                }}
              >
                {isCorrect ? (
                  <Check className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 stroke-[3.5] text-slate-950" />
                ) : isWrong ? (
                  <X className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 stroke-[3.5] text-white" />
                ) : (
                  <span className={cn(isCurrentlySelected ? 'text-slate-950' : 'text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]')}>
                    {optionKey}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. TEXTO DA RESPOSTA (BRANCO, GRANDE, DE ALTA LEGIBILIDADE) */}
          <span
            className={cn(
              'flex-1 min-w-0 text-xs sm:text-sm md:text-[15px] font-bold leading-tight sm:leading-snug tracking-wide break-words hyphens-auto text-left transition-colors duration-200 select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]',
              textStyles
            )}
          >
            {text}
          </span>

          {/* 3. PERCENTAGEM DO VOTO DO PÚBLICO (QUANDO ATIVA) */}
          {publicVotePercent !== undefined && !eliminated && (
            <div className="ml-auto px-1.5 sm:px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400/80 text-purple-200 font-mono font-black text-[10px] sm:text-xs shadow-md shadow-purple-500/30 flex items-center gap-1 shrink-0">
              <span className="text-[9px] sm:text-[10px]">👥</span>
              <span>{publicVotePercent}%</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
