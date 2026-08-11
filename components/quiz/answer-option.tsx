'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AnswerState = 'idle' | 'correct' | 'wrong' | 'muted'

export function AnswerOption({
  optionKey,
  text,
  state,
  disabled,
  onSelect,
}: {
  optionKey: 'A' | 'B' | 'C' | 'D'
  text: string
  state: AnswerState
  disabled?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`Resposta ${optionKey}: ${text}`}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/40 sm:p-5',
        state === 'idle' &&
          'border-white/10 bg-card/60 backdrop-blur hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/90 active:translate-y-0',
        state === 'correct' &&
          'border-primary/60 bg-primary/15 shadow-[0_0_34px_-8px_var(--primary)]',
        state === 'wrong' && 'border-flag-red/60 bg-flag-red/15 shadow-[0_0_34px_-8px_var(--flag-red)]',
        state === 'muted' && 'border-white/5 bg-card/30 opacity-55',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-black transition-colors',
          state === 'idle' && 'bg-white/5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary',
          state === 'correct' && 'bg-primary text-primary-foreground',
          state === 'wrong' && 'bg-flag-red text-flag-red-foreground',
          state === 'muted' && 'bg-white/5 text-muted-foreground',
        )}
      >
        {state === 'correct' ? (
          <Check className="h-5 w-5" />
        ) : state === 'wrong' ? (
          <X className="h-5 w-5" />
        ) : (
          optionKey
        )}
      </span>
      <span
        className={cn(
          'flex-1 text-pretty text-base font-semibold',
          state === 'muted' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {text}
      </span>
    </button>
  )
}
