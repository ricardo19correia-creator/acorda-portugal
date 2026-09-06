'use client'

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Globe, AlertTriangle, RefreshCw, Play, Home } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary específico da rota /portugal-mapa.
 * Impede que qualquer falha do Mapbox, WebGL ou chunk loading derrube a aplicação
 * com erro global ou cause Hydration Mismatch (#418).
 */
export class PortugalMapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRASH /portugal-mapa]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white relative overflow-hidden select-none">
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fadeIn">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <AlertTriangle className="h-8 w-8 text-cyan-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                <span>🇵🇹</span>
                <span>Portugal 2150</span>
              </div>

              <h1 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                Falha ao Carregar Mapa
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Não foi possível inicializar a interface do mapa. Clica abaixo para tentar novamente ou regressar à central.
              </p>

              {this.state.error?.message && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Tentar Novamente</span>
              </button>

              <Link
                href="/jogar"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="h-4 w-4 text-emerald-400" />
                <span>Central de Jogos</span>
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/"
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

    return this.props.children
  }
}

// 1. ELIMINAR SSR DO MAPBOX:
// O componente do mapa é importado exclusivamente via dynamic com { ssr: false }.
// Nenhuma lógica, canvas ou árvore do Mapbox é executada no servidor.
const PortugalMapComponent = dynamic(
  () =>
    import('@/components/portugal-map/PortugalMapComponent').then(
      (mod) => mod.PortugalMapComponent
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full h-[100dvh] min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
        suppressHydrationWarning
      >
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span
          className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400"
          suppressHydrationWarning
        >
          A CARREGAR MAPA NACIONAL // PORTUGAL 2150
        </span>
        <span
          className="text-[10px] font-mono text-emerald-400/90 mt-2 uppercase tracking-widest"
          suppressHydrationWarning
        >
          BUILD-ID: MAP2150-V2
        </span>
      </div>
    ),
  }
)

export default function PortugalMapaPage() {
  return (
    <PortugalMapErrorBoundary>
      <PortugalMapComponent />
    </PortugalMapErrorBoundary>
  )
}
