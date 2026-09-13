'use client'

import React from 'react'
import { Sparkles, Gamepad2, Flame, Award } from 'lucide-react'

export function TheTransformationSection() {
  return (
    <section className="relative py-20 md:py-32 border-t border-white/10 overflow-hidden">
      {/* Halo de iluminação central com o verde e dourado português */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full bg-emerald-500/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] sm:h-[450px] sm:w-[450px] rounded-full bg-amber-500/15 blur-[80px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Introdução da Transformação */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>O MOMENTO DE VIRAGEM</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-md">
            E ENTÃO SURGIU UMA NOVA IDEIA.
          </h2>

          <p className="mt-4 text-base sm:text-xl text-zinc-300 font-medium">
            A visão começou a ganhar uma nova forma.
          </p>
        </div>

        {/* O Monumento de Revelação do Jogo */}
        <div className="relative rounded-3xl border-2 border-emerald-500/40 bg-zinc-950/80 p-8 sm:p-14 md:p-20 backdrop-blur-3xl shadow-[0_0_80px_rgba(16,185,129,0.25)] text-center overflow-hidden">
          {/* Luzes decorativas */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Etiqueta Canónica */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300 mb-8 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Gamepad2 className="h-4 w-4 text-amber-400" />
            <span>O NASCIMENTO DO JOGO</span>
          </div>

          {/* Título Monumental Revelado */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-2xl sm:text-4xl md:text-5xl font-black tracking-wider text-white uppercase drop-shadow-sm">
              ACORDA PORTUGAL
            </span>
            <span className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 drop-shadow-[0_4px_30px_rgba(16,185,129,0.4)]">
              DESAFIO NACIONAL
            </span>
          </div>

          {/* Frase Histórica Canónica em Grande Destaque */}
          <div className="mt-10 max-w-3xl mx-auto pt-8 border-t border-white/15">
            <p className="font-display text-xl sm:text-2xl md:text-3xl font-black italic text-zinc-100 tracking-tight leading-relaxed">
              “Jogo mobile/web de quiz competitivo com identidade portuguesa.”
            </p>
            <p className="mt-4 text-xs sm:text-sm font-mono uppercase tracking-widest text-emerald-400/90 font-bold">
              Definição Canónica Histórica
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
