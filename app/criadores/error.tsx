'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, Sparkles } from 'lucide-react'

export default function CriadoresError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CRIADORES_ERROR_BOUNDARY]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-4 sm:p-6 bg-transparent text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-2xl">
          🇵🇹
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Os Criadores • Comunidade</span>
          </div>

          <h2 className="font-display text-xl font-black uppercase text-white tracking-tight">
            Comunidade Acorda Portugal
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Não foi possível carregar as publicações comunitárias neste instante. Clica abaixo para recarregar o feed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recarregar Feed</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
