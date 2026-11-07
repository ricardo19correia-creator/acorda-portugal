'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, ArrowRight, BookOpen, Award } from 'lucide-react'

export function InstitutionalDesafio() {
  return (
    <section
      id="desafio-nacional"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/20 bg-gradient-to-b from-[#030b06] to-[#040e08]"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Caixa Pequena e Independente */}
        <div className="relative rounded-3xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#061A10] via-[#040e08] to-[#1C0808]/40 p-8 sm:p-10 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Apontamento de Luz Dourada */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-xl">
              {/* Badge Cultural */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1 text-xs font-semibold text-[#E5C158] mb-4">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="uppercase tracking-widest text-[10px] font-mono">07 • Iniciativa Cultural</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                Desafio Nacional
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
                O Acorda Portugal integra também um jogo de cultura geral e conhecimento sobre a história, geografia, património e tradições de Portugal.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#34D399]" />
                  Património e Tradições
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#E5C158]" />
                  Cultura de Portugal
                </span>
              </div>
            </div>

            {/* Ligação Clara e Destacada para /jogar */}
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/jogar"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] hover:brightness-110 text-[#041009] font-black px-6 py-4 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#D4AF37]/20 active:scale-95"
              >
                <span>Conhecer e Jogar</span>
                <ArrowRight className="w-4 h-4 text-[#041009]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
