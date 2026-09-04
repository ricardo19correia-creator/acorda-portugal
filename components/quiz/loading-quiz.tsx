'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export interface LoadingQuizProps {
  message?: string
  submessage?: string
}

export function LoadingQuiz({
  message = 'A carregar...',
  submessage = 'A preparar a arena e os desafios para ti...',
}: LoadingQuizProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] sm:min-h-[70vh] w-full flex-col items-center justify-center p-6 text-center select-none animate-fadeIn"
    >
      <div className="relative flex items-center justify-center">
        {/* Glow animado */}
        <div className="absolute h-24 w-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl backdrop-blur-md">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
        </div>
      </div>

      <div className="mt-6 max-w-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span>🇵🇹</span>
          <span>Acorda Portugal</span>
        </div>
        <p className="font-display text-sm sm:text-base font-bold text-white tracking-wide">
          {message}
        </p>
        {submessage && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {submessage}
          </p>
        )}
      </div>
    </div>
  )
}
