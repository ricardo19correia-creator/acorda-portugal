'use client'

import React from 'react'
import { Globe } from 'lucide-react'

export function WorldLoading() {
  return (
    <div
      className="relative w-full h-full min-h-[450px] bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
      suppressHydrationWarning
    >
      <div className="relative mb-5">
        <div className="w-14 h-14 rounded-full border-3 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Globe className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display text-base font-black uppercase tracking-wider text-white">
          PORTUGAL
        </h2>
        <p className="font-mono text-xs text-cyan-400 uppercase tracking-widest animate-pulse">
          A carregar mundo...
        </p>
      </div>
    </div>
  )
}
