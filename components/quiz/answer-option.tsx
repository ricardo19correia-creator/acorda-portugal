'use client'

import { Check, X, ChevronRight, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'muted'

export function AnswerOption({
  optionKey,
  text,
  state,
  disabled,
  eliminated = false,
  onSelect,
}: {
  optionKey: 'A' | 'B' | 'C' | 'D'
  text: string
  state: AnswerState
  disabled?: boolean
  eliminated?: boolean
  onSelect?: () => void
}) {
  if (eliminated) {
    return (
      <div
        aria-hidden="true"
        className="flex w-full items-center gap-3.5 sm:gap-4.5 rounded-3xl border border-white/5 bg-white/[0.01] p-3 sm:p-4 text-left opacity-35 select-none cursor-not-allowed transition-all"
      >
        <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl border border-white/5 bg-white/5 font-display text-sm font-black text-muted-foreground line-through">
          {optionKey}
        </span>
        <span className="flex-1 text-sm font-bold text-muted-foreground line-through">
          {text}
        </span>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[0.62rem] font-bold text-muted-foreground/60 uppercase">
          Eliminada (50/50)
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`Opção ${optionKey}: ${text}`}
      className={cn(
        'group relative flex w-full items-center gap-3.5 sm:gap-4.5 rounded-3xl border p-3.5 sm:p-5 text-left transition-all duration-250 outline-none select-none cursor-pointer',
        state === 'idle' &&
          'border-white/12 bg-card/75 backdrop-blur-xl shadow-md hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/95 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] active:translate-y-0',
        state === 'correct' &&
          'border-primary bg-primary/18 backdrop-blur-2xl ring-2 ring-primary/50 shadow-[0_0_35px_-5px_rgba(0,255,162,0.35)] animate-pop',
        state === 'wrong' &&
          'border-flag-red bg-flag-red/18 backdrop-blur-2xl ring-2 ring-flag-red/50 shadow-[0_0_35px_-5px_rgba(244,63,94,0.35)] animate-pop',
        state === 'muted' && 'border-white/5 bg-card/30 opacity-40 cursor-default',
      )}
    >
      {/* Option Key Badge */}
      <span
        className={cn(
          'grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl font-display text-base sm:text-lg font-black transition-all duration-200 border',
          state === 'idle' &&
            'border-white/10 bg-white/5 text-muted-foreground group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_15px_rgba(0,255,162,0.35)]',
          state === 'correct' &&
            'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,255,162,0.6)] scale-105',
          state === 'wrong' &&
            'border-flag-red bg-flag-red text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-105',
          state === 'muted' && 'border-white/5 bg-white/5 text-muted-foreground/60',
        )}
      >
        {state === 'correct' ? (
          <Check className="h-6 w-6 stroke-[3]" />
        ) : state === 'wrong' ? (
          <X className="h-6 w-6 stroke-[3]" />
        ) : (
          optionKey
        )}
      </span>

      {/* Answer text */}
      <span
        className={cn(
          'flex-1 text-pretty text-sm sm:text-base md:text-lg font-bold transition-colors leading-snug',
          state === 'idle' && 'text-foreground group-hover:text-white',
          state === 'correct' && 'text-white font-black',
          state === 'wrong' && 'text-red-100 font-black',
          state === 'muted' && 'text-muted-foreground',
        )}
      >
        {text}
      </span>

      {/* Interactive trailing indicator for idle hover */}
      {state === 'idle' && (
        <span className="hidden sm:grid h-8 w-8 place-items-center rounded-xl bg-white/0 text-muted-foreground/0 transition-all duration-200 group-hover:bg-white/5 group-hover:text-primary">
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </button>
  )
}


