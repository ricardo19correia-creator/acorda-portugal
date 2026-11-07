'use client'

import React, { useState } from 'react'
import { Compass, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { PORTUGAL_DISTRICTS, DISTRICT_CITIES_MAP, type ValidDistrict } from '@/data/districts'

interface RegionGroup {
  name: string
  districts: ValidDistrict[]
}

const REGIONS: RegionGroup[] = [
  { name: 'Norte', districts: ['Porto', 'Braga', 'Viana do Castelo', 'Vila Real', 'Bragança'] },
  { name: 'Centro', districts: ['Coimbra', 'Aveiro', 'Leiria', 'Viseu', 'Guarda', 'Castelo Branco'] },
  { name: 'Lisboa & Tejo', districts: ['Lisboa', 'Santarém', 'Setúbal'] },
  { name: 'Alentejo', districts: ['Évora', 'Beja', 'Portalegre'] },
  { name: 'Algarve', districts: ['Faro'] },
  { name: 'Ilhas', districts: ['Açores', 'Madeira'] },
]

export function InstitutionalRadar() {
  const [selectedRegion, setSelectedRegion] = useState<string>('Norte')
  const [selectedDistrict, setSelectedDistrict] = useState<ValidDistrict>('Porto')

  const currentRegion = REGIONS.find((r) => r.name === selectedRegion) || REGIONS[0]
  const cities = DISTRICT_CITIES_MAP[selectedDistrict] || []

  const handleRegionChange = (regName: string) => {
    setSelectedRegion(regName)
    const targetReg = REGIONS.find((r) => r.name === regName)
    if (targetReg && targetReg.districts.length > 0) {
      setSelectedDistrict(targetReg.districts[0])
    }
  }

  return (
    <section id="radar" className="relative w-full py-14 sm:py-18 border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Compass className="w-3.5 h-3.5" />
            <span>TERRITÓRIO</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
            Radar Nacional
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Monitorização cívica descentralizada de norte a sul do país e regiões autónomas.
          </p>
        </div>

        {/* Explorador de Regiões e Distritos */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-md p-5 sm:p-7 shadow-xl space-y-6">
          
          {/* Tabs de Regiões */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-white/10 pb-4">
            {REGIONS.map((reg) => (
              <button
                key={reg.name}
                type="button"
                onClick={() => handleRegionChange(reg.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRegion === reg.name
                    ? 'bg-emerald-600 text-slate-950 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {reg.name}
              </button>
            ))}
          </div>

          {/* Seletor de Distritos da Região Ativa */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center sm:text-left">
              Distritos Monitorizados:
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {currentRegion.districts.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setSelectedDistrict(dist)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDistrict === dist
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dist}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Painel do Distrito Selecionado */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-white uppercase flex items-center gap-2">
                  <span>Distrito de {selectedDistrict}</span>
                  <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Radar Ativo
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {cities.length} concelhos sob observação da rede cívica local
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Canais Abertos para Relatos</span>
              </div>
            </div>

            {/* Lista dos Concelhos */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cities.map((city) => (
                <span
                  key={city}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

export default InstitutionalRadar
