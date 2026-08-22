'use client'

import { Check, X, ChevronRight } from 'lucide-react'
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
        className="flex w-full items-center gap-3.5 sm:gap-4.5 rounded-3xl border-2 border-slate-800/60 bg-slate-950/90 p-3.5 sm:p-4.5 text-left opacity-35 select-none cursor-not-allowed transition-all shadow-inner"
      >
        <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl border border-slate-800 bg-slate-900 font-display text-sm font-black text-slate-500 line-through">
          {optionKey}
        </span>
        <span className="flex-1 text-sm font-bold text-slate-500 line-through">
          {text}
        </span>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[0.62rem] font-black text-slate-400 uppercase tracking-wider">
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
        'group relative flex w-full items-center gap-3.5 sm:gap-4.5 rounded-3xl p-3.5 sm:p-5 text-left transition-all duration-200 outline-none select-none cursor-pointer',
        state === 'idle' &&
          'bg-slate-900/95 border-2 border-slate-700/80 text-white shadow-xl hover:border-emerald-400 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0',
        state === 'correct' &&
          'bg-emerald-950/95 border-2 border-emerald-400 text-white ring-4 ring-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.45)] scale-[1.01] animate-pop',
        state === 'wrong' &&
          'bg-rose-950/95 border-2 border-rose-500 text-white ring-4 ring-rose-500/30 shadow-[0_0_35px_rgba(244,63,94,0.45)] scale-[1.01] animate-pop',
        state === 'muted' && 'bg-slate-900/80 border-2 border-slate-800/80 text-slate-500 opacity-40 cursor-default',
      )}
    >
      {/* Option Key Badge */}
      <span
        className={cn(
          'grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl font-display text-base sm:text-lg font-black transition-all duration-200 border',
          state === 'idle' &&
            'bg-slate-800 border border-slate-600 text-emerald-400 font-bold group-hover:border-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]',
          state === 'correct' &&
            'bg-emerald-500 border border-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-105',
          state === 'wrong' &&
            'bg-rose-600 border border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] scale-105',
          state === 'muted' && 'bg-slate-800/50 border border-slate-700/40 text-slate-500',
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
          state === 'idle' && 'text-white group-hover:text-emerald-300',
          state === 'correct' && 'text-emerald-100 font-black',
          state === 'wrong' && 'text-rose-100 font-black',
          state === 'muted' && 'text-slate-500',
        )}
      >
        {text}
      </span>

      {/* Interactive trailing indicator for idle hover */}
      {state === 'idle' && (
        <span className="hidden sm:grid h-8 w-8 place-items-center rounded-xl bg-slate-800/0 text-slate-400/0 transition-all duration-200 group-hover:bg-slate-800 group-hover:text-emerald-400">
          <ChevronRight className="h-5 w-5" />
        </span>
      )}
    </button>
  )
}
