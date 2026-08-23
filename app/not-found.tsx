'use client'

import React from 'react'
import Link from 'next/link'
import { Compass, Home, ArrowLeft } from 'lucide-react'
import { AppBackground } from '@/components/AppBackground'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <div className="relative min-h-screen text-foreground flex flex-col justify-between overflow-x-hidden">
      {/* 1. FUNDO OFICIAL 24: 404 / PÁGINA INEXISTENTE */}
      <AppBackground variant="not-found" contrastIntensity="normal" />

      {/* 2. CONTEÚDO */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <div className="max-w-md w-full text-center rounded-3xl border border-white/15 bg-slate-900/80 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.35)] animate-pulse">
              <Compass className="h-10 w-10 text-indigo-400 animate-spin-slow" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-widest mb-3">
                Pergunta Rápida: 404
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Página Não Encontrada
              </h1>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Parece que navegaste para fora do território nacional mapeado. Esta coordenada não contém nenhum quiz ativo.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-display text-xs font-black uppercase tracking-wider text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition active:scale-95"
              >
                <Home className="h-4 w-4" />
                <span>Voltar ao Início</span>
              </Link>
              <Link
                href="/jogar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Ir para o Quiz</span>
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
