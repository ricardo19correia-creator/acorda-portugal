'use client'

import React from 'react'
import { ShieldCheck, CheckCheck, Eye, Layers } from 'lucide-react'

export function InstitutionalVerification() {
  return (
    <section
      id="verificacao"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/15 bg-[#030b06]/80"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Identificador & Cabeçalho da Secção */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#061A10] px-3.5 py-1 text-xs font-semibold text-[#E5C158] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="uppercase tracking-widest text-[10px] font-mono">05 • Credibilidade & Rigor</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Verificação de Informação
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            A importância fundamental da confirmação factual e da credibilidade de toda a informação partilhada na plataforma.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
            O rigor é o escudo da verdade. Informação não verificada é ruído; informação confirmada é poder para os cidadãos.
          </p>
        </div>

        {/* 3 Pilares de Rigor e Verificação */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Confirmação Factual */}
          <div className="flex flex-col rounded-2xl border border-[#D4AF37]/30 bg-[#061A10]/60 p-6 sm:p-7 hover:border-[#D4AF37]/60 transition-colors shadow-lg shadow-black/20">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158] mb-5">
              <CheckCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Confirmação Factual
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Exigência de validação antes de atribuir estatuto de facto estabelecido a qualquer dado ou relato recebido.
            </p>
          </div>

          {/* Pilar 2: Cruzamento de Fontes */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/40 p-6 sm:p-7 hover:border-white/25 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-5">
              <Layers className="w-5 h-5 text-[#34D399]" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Cruzamento de Fontes
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Verificação comparativa entre múltiplos testemunhos, registos fotográficos e dados oficiais para assegurar exatidão.
            </p>
          </div>

          {/* Pilar 3: Combate à Desinformação */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/40 p-6 sm:p-7 hover:border-white/25 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-5">
              <Eye className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Combate à Desinformação
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Proteção ativa contra boatos, manipulação e desinformação deliberada, reforçando a confiança pública.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
