'use client'

import React, { useEffect } from 'react'
import { RefreshCw, Home, ShieldCheck } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GLOBAL_APP_ERROR]', {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      error,
    })
  }, [error])

  return (
    <html lang="pt-PT" className="dark">
      <body className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white antialiased font-sans">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
              <span>🇵🇹</span>
              <span>Acorda Portugal</span>
            </div>

            <h1 className="text-2xl font-black uppercase text-white tracking-tight">
              Desafio Nacional
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A tua sessão e dados de jogo estão protegidos. Clica abaixo para recarregar a plataforma com segurança.
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
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/jogar'
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>Central de Jogos</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
