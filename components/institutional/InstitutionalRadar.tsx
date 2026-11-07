'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  MapPin,
  ShieldCheck,
  Radio,
  ExternalLink,
  ChevronRight,
  Layers,
  Building,
  CheckCircle2,
} from 'lucide-react'
import { PORTUGAL_DISTRICTS, DISTRICT_CITIES_MAP, type ValidDistrict } from '@/data/districts'

interface RegionGroup {
  name: string
  districts: ValidDistrict[]
}

const REGION_GROUPS: RegionGroup[] = [
  {
    name: 'Norte',
    districts: ['Porto', 'Braga', 'Viana do Castelo', 'Vila Real', 'Bragança'],
  },
  {
    name: 'Centro',
    districts: ['Coimbra', 'Aveiro', 'Leiria', 'Viseu', 'Guarda', 'Castelo Branco'],
  },
  {
    name: 'Lisboa & Vale do Tejo',
    districts: ['Lisboa', 'Santarém', 'Setúbal'],
  },
  {
    name: 'Alentejo',
    districts: ['Évora', 'Beja', 'Portalegre'],
  },
  {
    name: 'Algarve',
    districts: ['Faro'],
  },
  {
    name: 'Regiões Autónomas',
    districts: ['Açores', 'Madeira'],
  },
]

export function InstitutionalRadar() {
  const [selectedDistrict, setSelectedDistrict] = useState<ValidDistrict>('Lisboa')

  const cities = DISTRICT_CITIES_MAP[selectedDistrict] || []

  return (
    <section id="radar" className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-transparent via-[#081324]/50 to-transparent border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Secção */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>OBSERVATÓRIO TERRITORIAL</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            Radar Nacional
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Acompanhe o estado da rede cívica em todos os 18 distritos de Portugal continental e nas duas Regiões Autónomas.
          </p>
        </div>

        {/* Painel do Radar (2 Colunas: Seletor Territorial à Esquerda, Ficha de Distrito à Direita) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Seletor de Territórios (7 colunas) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-lg font-black uppercase text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Distritos & Regiões de Portugal</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">20 Territórios Cobertos</span>
            </div>

            <div className="space-y-5">
              {REGION_GROUPS.map((group) => (
                <div key={group.name} className="space-y-2">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    {group.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {group.districts.map((d) => {
                      const isSelected = selectedDistrict === d
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setSelectedDistrict(d)}
                          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-slate-950 font-black shadow-md shadow-emerald-950/40 scale-105'
                              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <MapPin className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                          <span>{d}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ficha Territorial do Distrito Selecionado (5 colunas) */}
          <div className="lg:col-span-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a1f33] to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="space-y-1.5 border-b border-white/10 pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Canal Territorial Ativo</span>
              </div>
              <h3 className="font-display text-3xl font-black uppercase text-white tracking-tight">
                {selectedDistrict}
              </h3>
              <p className="text-xs text-slate-300">
                Monitorização cívica permanente e acompanhamento de ocorrências municipais.
              </p>
            </div>

            {/* Métricas do Distrito */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <span className="text-[11px] text-slate-400 uppercase font-mono block">Concelhos</span>
                <span className="text-xl font-black text-white font-mono">{cities.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Municípios mapeados</span>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <span className="text-[11px] text-slate-400 uppercase font-mono block">Estado na Rede</span>
                <span className="text-base font-black text-emerald-400 block">Monitorizado</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Emissão em aberto</span>
              </div>
            </div>

            {/* Principais Concelhos */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Concelhos em Foco ({selectedDistrict}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {cities.map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 font-medium"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Ações para o Território */}
            <div className="pt-2 border-t border-white/10 space-y-2.5">
              <a
                href="#participar"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold uppercase tracking-wider px-4 py-3 text-xs transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <span>Reportar Ocorrência em {selectedDistrict}</span>
              </a>

              <Link
                href="/meu-distrito"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2.5 text-xs transition-all cursor-pointer"
              >
                <span>Explorar Página Territorial de {selectedDistrict}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
