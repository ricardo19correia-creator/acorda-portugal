'use client'

import React from 'react'
import { MapPin, Compass, Shield } from 'lucide-react'

const TERRITORIES = [
  'Viana do Castelo',
  'Braga',
  'Vila Real',
  'Bragança',
  'Porto',
  'Aveiro',
  'Viseu',
  'Guarda',
  'Coimbra',
  'Castelo Branco',
  'Leiria',
  'Santarém',
  'Lisboa',
  'Portalegre',
  'Setúbal',
  'Évora',
  'Beja',
  'Faro',
  'R. A. Açores',
  'R. A. Madeira',
]

export function InstitutionalRadar() {
  return (
    <section
      id="radar"
      className="relative w-full py-16 sm:py-24 border-t border-[#D4AF37]/15 bg-[#040e08]/90"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Identificador & Cabeçalho da Secção */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#061A10] px-3.5 py-1 text-xs font-semibold text-[#34D399] mb-4">
            <Compass className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="uppercase tracking-widest text-[10px] font-mono">06 • Dimensão Territorial</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Radar Nacional
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            A visão de acompanhamento dos acontecimentos em todo o território português, conectando o continente e as ilhas numa rede única de informação cívica.
          </p>
        </div>

        {/* Painel Visual dos Territórios de Portugal */}
        <div className="mt-12 rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-b from-[#061A10]/70 to-[#030b06]/95 p-6 sm:p-8 lg:p-10 shadow-xl shadow-black/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                Abrangência Territorial
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white mt-1">
                Portugal Continental & Regiões Autónomas
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 text-xs font-mono text-[#34D399]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>20 Unidades Territoriais</span>
            </div>
          </div>

          {/* Grelha dos 20 Territórios */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {TERRITORIES.map((territory, idx) => {
              const isIslands = idx >= 18
              return (
                <div
                  key={territory}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    isIslands
                      ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#FCE788]'
                      : 'border-white/10 bg-white/[0.03] text-slate-200 hover:border-[#10B981]/30 hover:bg-[#10B981]/5'
                  }`}
                >
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isIslands ? 'text-[#D4AF37]' : 'text-[#10B981]'
                    }`}
                  />
                  <span className="truncate">{territory}</span>
                </div>
              )
            })}
          </div>

          {/* Nota de Síntese */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#10B981]" />
              <span>Descentralização informativa: nenhuma terra fica invisível</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Vigilância Cívica Permanente
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
