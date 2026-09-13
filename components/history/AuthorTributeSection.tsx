'use client'

import React from 'react'
import { MapPin, Sparkles } from 'lucide-react'

export function AuthorTributeSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Momento Culminante: HOJE, A IDEIA JOGA-SE. */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>O CULMINAR DA VISÃO</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-sm">
            HOJE, A IDEIA JOGA-SE.
          </h2>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-300 font-normal leading-relaxed">
            O que começou como uma visão criada por António Ricardo Correia Moreira, em Vila Real, transformou-se num projeto em constante evolução — e numa experiência onde conhecimento, competição e identidade portuguesa se encontram.
          </p>

          <div className="mt-8 flex flex-col items-center gap-1">
            <span className="font-display text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-400">
              DESAFIO NACIONAL
            </span>
            <span className="text-sm sm:text-base font-semibold text-zinc-300">
              Portugal inteiro pode jogar.
            </span>
          </div>
        </div>

        {/* Área Elegante e Nobre de Autoria */}
        <div className="max-w-xl mx-auto">
          <div className="relative rounded-3xl border border-white/15 bg-zinc-950/80 p-8 sm:p-10 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center overflow-hidden">
            {/* Decoração luminosa subtil */}
            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-48 bg-emerald-500/20 blur-2xl" />

            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 block mb-3">
              Concebido por
            </span>

            <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              António Ricardo Correia Moreira
            </h3>

            <p className="mt-1 font-display text-lg font-bold text-emerald-400">
              Riky Moreira
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>Vila Real, Portugal</span>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs sm:text-sm text-zinc-300 italic font-medium">
                “Uma ideia portuguesa, construída passo a passo.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
