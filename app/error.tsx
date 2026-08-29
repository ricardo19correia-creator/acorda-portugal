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
    // 1. Expor a causa real nos logs da consola conforme especificado
    console.error('[CRITICAL_APP_ERROR]', {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      error,
    })

    // 2. Auto-recuperação silenciosa para erros transitórios de rede ou carregamento de chunks
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
        }, 1200)
        return () => clearTimeout(timer)
      }
    }
  }, [error, reset])

  const handleManualReset = async () => {
    sessionStorage.removeItem('ap_error_auto_retried')
    try {
      const { connectionManager } = await import('@/lib/connection-manager')
      await connectionManager.forceReconnect()
    } catch {}
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
            Recuperação de Sessão
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {autoRetrying
              ? 'A restabelecer a tua ligação de forma automática...'
              : 'O teu progresso e dados de conta estão protegidos. Clica abaixo para continuar a jogar.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleManualReset}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${autoRetrying ? 'animate-spin' : ''}`} />
            <span>{autoRetrying ? 'A restaurar...' : 'Continuar Jogo'}</span>
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
