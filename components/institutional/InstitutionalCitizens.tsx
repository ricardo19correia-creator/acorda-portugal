'use client'

import React from 'react'
import { Send, Users, Megaphone, MapPin } from 'lucide-react'

export function InstitutionalCitizens() {
  return (
    <section
      id="voz-cidadaos"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/15 bg-[#030b06]/85"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Identificador & Cabeçalho da Secção */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-3.5 py-1 text-xs font-semibold text-white mb-4">
            <Users className="w-3.5 h-3.5 text-[#E5C158]" />
            <span className="uppercase tracking-widest text-[10px] font-mono">03 • Participação Cívica</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            A Voz dos Cidadãos
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            A informação começa nas pessoas. Uma plataforma onde os cidadãos poderão comunicar acontecimentos, partilhar informações e contribuir para dar visibilidade ao que acontece no país.
          </p>
        </div>

        {/* 3 Pilares da Participação dos Cidadãos */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Comunicar Acontecimentos */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/40 p-6 sm:p-7 hover:border-white/25 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-5">
              <Send className="w-5 h-5 text-[#34D399]" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Comunicar Acontecimentos
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Os cidadãos poderão relatar ocorrências locais, acontecimentos de interesse público e factos que presenciam no seu quotidiano.
            </p>
          </div>

          {/* 2. Partilhar Informação */}
          <div className="flex flex-col rounded-2xl border border-[#D4AF37]/25 bg-[#061A10]/60 p-6 sm:p-7 hover:border-[#D4AF37]/50 transition-colors shadow-lg shadow-black/20">
            <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158] mb-5">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Partilhar Informação
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Possibilidade de transmitir testemunhos diretos e documentação factual, garantindo que temas vitais não fiquem sem resposta.
            </p>
          </div>

          {/* 3. Visibilidade Regional */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#061A10]/40 p-6 sm:p-7 hover:border-white/25 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-5">
              <MapPin className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              Dar Visibilidade ao País
            </h3>
            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
              Valorização da realidade de cada comunidade e freguesia, descentralizando a atenção pública para lá dos grandes centros.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
