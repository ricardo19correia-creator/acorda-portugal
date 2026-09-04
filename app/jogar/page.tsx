'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, Component, type ReactNode, type ErrorInfo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QuizPage } from '@/components/quiz/page'
import { resolveArenaForGame } from '@/src/data/arenaCatalog'
import { AppBackground } from '@/components/AppBackground'
import { LoadingQuiz } from '@/components/quiz/loading-quiz'
import { useAuth } from '@/components/auth-provider'
import { AlertTriangle, RefreshCw, Home, Play } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary específico da rota /jogar para blindar a aplicação
 * contra quedas de runtime e impedir ativação do ecrã global de erro.
 */
export class JogarErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRASH /jogar]:', error, errorInfo)
  }

  handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ap_error_auto_retried')
        window.location.reload()
      }
    } catch {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white relative overflow-hidden select-none">
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fadeIn">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                <span>🇵🇹</span>
                <span>Acorda Portugal</span>
              </div>

              <h1 className="font-display text-2xl font-black uppercase text-white tracking-tight">
                Recuperação de Partida
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                O teu progresso e dados de conta estão protegidos. Clica abaixo para recarregar o jogo ou voltar à central.
              </p>

              {process.env.NODE_ENV !== 'production' && this.state.error?.message && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-left font-mono text-[11px] text-rose-300 max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Recarregar Jogo</span>
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

/**
 * Content container que lê com segurança os parâmetros de pesquisa da rota.
 */
function JogarContainer() {
  const searchParams = useSearchParams()
  const { user, authResolved, profileLoading } = useAuth()

  const rawCategoryParam =
    searchParams.get('cat') ||
    searchParams.get('category') ||
    searchParams.get('categoria') ||
    searchParams.get('theme') ||
    searchParams.get('tema') ||
    searchParams.get('mode') ||
    searchParams.get('modo') ||
    searchParams.get('topic') ||
    searchParams.get('topico') ||
    searchParams.get('event') ||
    searchParams.get('evento')

  const districtParam = searchParams.get('dist') || searchParams.get('distrito')
  const cityParam = searchParams.get('city') || searchParams.get('cidade')
  const gameParam = searchParams.get('game') || searchParams.get('gameId')
  const arenaParam =
    searchParams.get('arena') ||
    searchParams.get('arenaId') ||
    searchParams.get('arena_id')

  // Se passou distrito ou cidade sem categoria explícita, seleciona o modo territorial
  const effectiveCategory =
    rawCategoryParam ||
    (districtParam ? 'o-meu-distrito' : null) ||
    (cityParam ? 'desafio-cidade' : null) ||
    (gameParam ? 'desafio-nacional' : null)

  const isPlaying = Boolean(effectiveCategory || gameParam)
  const [equippedArena, setEquippedArena] = useState<string | null>(null)

  // Leitura segura de localStorage exclusivamente dentro de useEffect com try/catch
  useEffect(() => {
    const sync = () => {
      try {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('equipped_arena')
          if (saved && saved !== 'arena_palacio_nacional') {
            setEquippedArena(saved)
          } else if (saved === 'arena_palacio_nacional') {
            const explicitlyEquipped = localStorage.getItem('arena_explicitly_equipped') === 'true'
            if (explicitlyEquipped) {
              setEquippedArena(saved)
            }
          }
        }
      } catch (err) {
        console.warn('[JogarContainer] Erro seguro ao aceder a localStorage:', err)
      }
    }

    sync()
    window.addEventListener('arenaChanged', sync)
    window.addEventListener('inventory_updated', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('arenaChanged', sync)
      window.removeEventListener('inventory_updated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // Resolução da arena com fallback seguro
  const activeArena = useMemo(() => {
    if (!isPlaying) return null
    try {
      const res = resolveArenaForGame({
        arenaId: arenaParam,
        categorySlug: effectiveCategory,
        equippedArenaId: equippedArena,
      })
      return res?.arena || null
    } catch (e) {
      console.warn('[JogarContainer] Aviso ao resolver arena:', e)
      return null
    }
  }, [isPlaying, arenaParam, effectiveCategory, equippedArena])

  // Blindagem do Ciclo de Vida da Sessão Firebase
  if (!authResolved || (user && profileLoading)) {
    return <LoadingQuiz message="A sincronizar sessão..." submessage="A verificar credenciais e perfil..." />
  }

  return (
    <div className="relative min-h-[100dvh] w-full isolate overflow-x-hidden bg-transparent text-white flex flex-col justify-between">
      {/* 1. FUNDO GLOBAL OFICIAL DO JOGO */}
      <AppBackground customImage={isPlaying && activeArena ? activeArena.assetPath : undefined} />

      {/* 2. CONTEÚDO DA CENTRAL DE JOGO / TABULEIRO DE QUIZ */}
      <main className="relative z-10 w-full max-w-4xl mx-auto min-h-[100dvh] p-2 sm:p-4 flex flex-col justify-between bg-transparent">
        <QuizPage />
      </main>
    </div>
  )
}

/**
 * Página principal da rota /jogar com Suspense e ErrorBoundary estritos
 */
export default function JogarPage() {
  return (
    <JogarErrorBoundary>
      <Suspense fallback={<LoadingQuiz message="A carregar desafio..." />}>
        <JogarContainer />
      </Suspense>
    </JogarErrorBoundary>
  )
}
