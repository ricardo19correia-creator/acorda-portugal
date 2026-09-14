'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Trophy, ArrowLeft, Radio, Heart } from 'lucide-react'

export function EpilogueClosingSection() {
  return (
    <section className="relative py-20 md:py-32 border-t border-white/10 overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Glow Superior */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
            <span>13 — EPÍLOGO</span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight uppercase">
              “Portugal não acontece apenas nas notícias.<br />
              <span className="text-zinc-400">Portugal acontece todos os dias, em todo o lado.</span>”
            </p>

            <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed pt-2">
              E quem está lá pode ser a primeira pessoa a mostrar o que aconteceu.
            </p>
          </div>

          <div className="pt-6 pb-2">
            <h3 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              ACORDA PORTUGAL
            </h3>
            <p className="mt-3 text-sm sm:text-base font-mono font-bold uppercase tracking-widest text-emerald-400">
              Não esperes pela notícia. Esteja onde ela acontece.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/jogar"
              className="button-game-gold w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-105 transition-transform"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Entrar no Desafio Nacional</span>
            </Link>

            <Link
              href="/rankings"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 border border-white/15 hover:border-emerald-500/40 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Ver Rankings da Liga</span>
            </Link>
          </div>

          <div className="pt-10 text-[11px] font-mono text-zinc-500">
            Concebido e desenvolvido em Vila Real, Portugal • Documentação oficial de origem
          </div>
        </div>
      </div>
    </section>
  )
}
