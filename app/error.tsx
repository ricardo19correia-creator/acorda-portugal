'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, ShieldCheck, Play } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [autoRetrying, setAutoRetrying] = useState(false)

  useEffect(() => {
    // 1. Diagnóstico completo nos logs para depuração
    console.error('[APP_ERROR_CAUGHT]', {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      error,
    })

    // 2. Auto-recuperação transparente e silenciosa para erros transitórios de chunks ou rede
    const errorMsg = String(error?.message || '').toLowerCase()
    const isTransient =
      errorMsg.includes('chunk') ||
      errorMsg.includes('loading chunk') ||
      errorMsg.includes('failed to fetch') ||
      errorMsg.includes('network') ||
      errorMsg.includes('dynamically imported module')

    if (isTransient) {
      const hasAutoRetried = sessionStorage.getItem('ap_error_auto_retried')
      if (!hasAutoRetried) {
        sessionStorage.setItem('ap_error_auto_retried', 'true')
        setAutoRetrying(true)
        const timer = setTimeout(() => {
          reset()
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [error, reset])

  const handleManualReset = () => {
    sessionStorage.removeItem('ap_error_auto_retried')
    reset()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white relative overflow-hidden">
      {/* Luzes de fundo atmosféricas */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
            <span>🇵🇹</span>
            <span>Acorda Portugal</span>
          </div>

          <h1 className="font-display text-2xl font-black uppercase text-white tracking-tight">
            Desafio Nacional
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {autoRetrying
              ? 'A restabelecer a ligação automaticamente...'
              : 'O teu progresso e dados de conta estão protegidos. Clica abaixo para recarregar o jogo.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleManualReset}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${autoRetrying ? 'animate-spin' : ''}`} />
            <span>{autoRetrying ? 'A restaurar...' : 'Recarregar Jogo'}</span>
          </button>

          <Link
            href="/jogar"
            onClick={() => sessionStorage.removeItem('ap_error_auto_retried')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="h-4 w-4 text-emerald-400" />
            <span>Central de Jogos</span>
          </Link>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            onClick={() => sessionStorage.removeItem('ap_error_auto_retried')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Voltar à Página Principal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
