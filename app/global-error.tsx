'use client'

import React, { useEffect } from 'react'
import { RefreshCw, Home, ShieldAlert } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[NEXT GLOBAL ERROR BOUNDARY]', error)
  }, [error])

  return (
    <html lang="pt-PT" className="dark">
      <body className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white antialiased font-sans">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
              <span>🇵🇹</span>
              <span>Acorda Portugal</span>
            </div>

            <h1 className="text-2xl font-black uppercase text-white tracking-tight">
              Instabilidade de Sistema
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Ocorreu um erro inesperado ao carregar a plataforma. Clica abaixo para recarregar a aplicação de forma segura.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recarregar Jogo</span>
            </button>

            <button
              type="button"
              onClick={() => { window.location.href = '/' }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
