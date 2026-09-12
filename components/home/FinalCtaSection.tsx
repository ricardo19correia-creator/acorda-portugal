'use client'

import React from 'react'
import { Play } from 'lucide-react'

interface FinalCtaSectionProps {
  onStartGame: (route: string) => void
}

export function FinalCtaSection({ onStartGame }: FinalCtaSectionProps) {
  return (
    <section
      aria-label="Chamada final para jogar"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center select-none"
    >
      {/* Luzes dinâmicas de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Caixa Glassmorphism Imponente */}
      <div className="relative rounded-3xl sm:rounded-[36px] p-8 sm:p-14 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] backdrop-blur-2xl overflow-hidden">
        {/* Linha superior luminosa */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4">
          🇵🇹 ENTRA NA COMPETIÇÃO
        </span>

        <h2 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          ESTÁS PRONTO?
        </h2>
        <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
          Portugal está em jogo.
        </p>

        {/* Botão Gigante JOGAR AGORA */}
        <div className="mt-8 sm:mt-10 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onStartGame('/jogar?cat=desafio-nacional')}
            className="group relative w-full py-5 sm:py-6 px-8 sm:px-12 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-display font-black text-lg sm:text-2xl uppercase tracking-wider shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_55px_rgba(16,185,129,0.75)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer overflow-hidden border border-emerald-300/50"
          >
            {/* Brilho animado de reflexo */}
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <span className="relative z-10 text-slate-950 font-black">JOGAR AGORA</span>
          </button>
        </div>

        {/* Texto Pequeno Final */}
        <p className="mt-6 text-xs sm:text-sm font-mono text-slate-300 tracking-wide uppercase">
          Entra no jogo. Responde. Evolui. Compete. Representa.
        </p>
      </div>
    </section>
  )
}
