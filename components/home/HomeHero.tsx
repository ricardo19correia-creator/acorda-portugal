'use client'

import React from 'react'
import { Play } from 'lucide-react'

interface HomeHeroProps {
  onStartGame: (route: string) => void
  isAuthenticated: boolean
}

export function HomeHero({ onStartGame, isAuthenticated }: HomeHeroProps) {
  return (
    <section
      aria-label="Menu Principal — Hero"
      className="relative flex flex-col items-center justify-center text-center px-4 pt-12 pb-6 sm:pt-20 sm:pb-8 max-w-5xl mx-auto w-full select-none"
    >
      {/* Luz ambiente subtil (verde e dourado) sem ocultar o vídeo de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[500px] h-64 sm:h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Tag de Identidade Nacional */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-4 sm:mb-6">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-white/90 font-mono">🇵🇹 O JOGO NACIONAL</span>
      </div>

      {/* Título Principal de Impacto Cinematográfico */}
      <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight uppercase leading-[0.92] text-white">
        <span className="block drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">ACORDA</span>
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
          PORTUGAL
        </span>
        <span className="sr-only"> — </span>
        <span className="block mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] sm:tracking-[0.3em] text-amber-400 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          Desafio Nacional
        </span>
      </h1>

      {/* Subheadline Curta e Direta */}
      <p className="mt-4 sm:mt-5 text-lg sm:text-2xl font-bold text-slate-100 max-w-xl leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        Portugal está em jogo.
      </p>

      {/* CTA PRINCIPAL — O elemento visual mais importante da página */}
      <div className="mt-8 sm:mt-10 w-full sm:w-auto flex justify-center">
        <button
          type="button"
          onClick={() => onStartGame('/jogar')}
          className="group relative inline-flex items-center justify-center gap-3.5 w-full sm:w-auto px-10 sm:px-14 py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 font-display font-black text-lg sm:text-xl uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.55)] hover:shadow-[0_0_55px_rgba(16,185,129,0.8)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-300/40"
        >
          {/* Brilho animado de reflexo */}
          <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[350%] transition-transform duration-1000 ease-out pointer-events-none" />

          <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
          </div>

          <span className="relative z-10 text-slate-950 font-black">
            {isAuthenticated ? 'JOGAR' : 'JOGAR AGORA'}
          </span>
        </button>
      </div>
    </section>
  )
}
