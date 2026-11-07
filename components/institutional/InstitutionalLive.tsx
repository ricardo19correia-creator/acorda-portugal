'use client'

import React from 'react'
import { Radio, Video, Navigation, Clock } from 'lucide-react'

export function InstitutionalLive() {
  return (
    <section
      id="diretos"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/15 bg-[#040e08]/90"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Identificador & Cabeçalho da Secção */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DC2626]/40 bg-[#250909]/70 px-3.5 py-1 text-xs font-semibold text-[#FCA5A5] mb-4">
            <Radio className="w-3.5 h-3.5 text-[#EF4444] animate-pulse" />
            <span className="uppercase tracking-widest text-[10px] font-mono">04 • Emissão & Terreno</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Diretos e Acontecimentos
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            Acompanhar os acontecimentos do país através de transmissões em direto e informação recolhida diretamente no terreno.
          </p>
        </div>

        {/* 2 Blocos Principais de Impacto Visual */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloco 1: Transmissões em Direto */}
          <div className="flex flex-col rounded-2xl border border-[#DC2626]/30 bg-gradient-to-br from-[#1C0808]/60 to-[#061A10]/50 p-6 sm:p-8 hover:border-[#DC2626]/50 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="h-11 w-11 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 flex items-center justify-center text-[#EF4444]">
                <Video className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#DC2626]/20 border border-[#DC2626]/30 text-[#FCA5A5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-ping" />
                Diretos
              </span>
            </div>

            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Transmissões em Direto
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Possibilidade de acompanhar em tempo real intervenções cívicas, ocorrências públicas e transmissões de momentos com impacto para os cidadãos.
            </p>
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Transmissões no momento do acontecimento</span>
            </div>
          </div>

          {/* Bloco 2: Informação no Terreno */}
          <div className="flex flex-col rounded-2xl border border-[#10B981]/30 bg-gradient-to-br from-[#061A10]/70 to-[#040e08]/90 p-6 sm:p-8 hover:border-[#10B981]/50 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="h-11 w-11 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#10B981]/20 border border-[#10B981]/30 text-[#34D399]">
                Terreno
              </span>
            </div>

            <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
              Informação no Terreno
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Relatos fiáveis de quem se encontra no local das situações, permitindo perceber o contexto concreto de cada ocorrência em tempo útil.
            </p>
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Radio className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Contexto autêntico sem intermediários</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
