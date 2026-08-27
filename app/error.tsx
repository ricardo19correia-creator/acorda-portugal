'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, ShieldAlert, ArrowLeft } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[NEXT ERROR BOUNDARY]', error)
  }, [error])

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white relative overflow-hidden">
      {/* Luzes de fundo atmosféricas */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
            <span>🇵🇹</span>
            <span>Acorda Portugal</span>
          </div>

          <h1 className="font-display text-2xl font-black uppercase text-white tracking-tight">
            Instabilidade Temporária
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Ocorreu uma oscilação momentânea de ligação. Clica em recarregar para restaurar a tua sessão de jogo com segurança.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tentar Novamente</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </Link>
        </div>

        {process.env.NODE_ENV !== 'production' && error?.message && (
          <div className="pt-4 border-t border-white/5 text-left">
            <p className="text-[10px] font-mono text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/20 break-words">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
