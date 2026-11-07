'use client'

import React from 'react'
import { Newspaper, Compass, CheckCircle2 } from 'lucide-react'

export function InstitutionalNews() {
  return (
    <section
      id="noticias"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/15 bg-[#040e08]/70 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Identificador & Cabeçalho da Secção */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#061A10] px-3.5 py-1 text-xs font-semibold text-[#34D399] mb-4">
            <Newspaper className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="uppercase tracking-widest text-[10px] font-mono">02 • Plataforma de Informação</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Informação e Notícias
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            Uma plataforma dedicada à informação nacional e ao acompanhamento rigoroso dos acontecimentos em Portugal.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
            Informação factual sobre a atualidade portuguesa, sem dependências partidárias ou filtros comerciais.
          </p>
        </div>

        {/* 3 Blocos de Síntese Objetiva */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bloco 1: Cobertura Nacional */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/50 p-6 sm:p-7 hover:border-[#10B981]/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] mb-5">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Cobertura Nacional
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Acompanhamento de acontecimentos em todo o território nacional, do litoral ao interior e às regiões autónomas.
            </p>
          </div>

          {/* Bloco 2: Rigor e Independência */}
          <div className="flex flex-col rounded-2xl border border-[#D4AF37]/20 bg-[#061A10]/70 p-6 sm:p-7 hover:border-[#D4AF37]/50 transition-colors shadow-lg shadow-black/30">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#E5C158] mb-5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Independência Editorial
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Foco estrito no interesse público e nos factos reais, promovendo a clareza e a transparência informativa.
            </p>
          </div>

          {/* Bloco 3: Centralização de Factos */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/50 p-6 sm:p-7 hover:border-[#DC2626]/40 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-[#DC2626]/15 border border-[#DC2626]/30 flex items-center justify-center text-[#EF4444] mb-5">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Acontecimentos Reais
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Acesso estruturado e direto às notícias essenciais do país, organizadas de forma limpa e sem ruído mediático.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
