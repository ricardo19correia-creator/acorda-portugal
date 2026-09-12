'use client'

import React from 'react'
import Link from 'next/link'
import { Map, Compass, Globe2, ArrowRight, Shield, Layers } from 'lucide-react'

const REGIONS = [
  {
    id: 'continental',
    name: 'PORTUGAL CONTINENTAL',
    tag: '18 DISTRITOS',
    subtitle: 'Norte ao Sul • Litoral ao Interior',
    description: 'De Viana do Castelo a Faro, centenas de concelhos disputam cada metro de soberania territorial e pontos de distrito.',
    stats: '278 Concelhos',
    accentColor: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400',
    glowClass: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    symbol: '🇵🇹',
  },
  {
    id: 'acores',
    name: 'AÇORES',
    tag: '9 ILHAS',
    subtitle: 'Região Autónoma • Soberania Atlântica',
    description: 'Santa Maria a Corvo. O arquipélago atlântico entra na arena nacional com a sua história, património vulcânico e identidade singular.',
    stats: '19 Concelhos',
    accentColor: 'cyan',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    borderClass: 'border-cyan-500/30 hover:border-cyan-400',
    glowClass: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    symbol: '🌋',
  },
  {
    id: 'madeira',
    name: 'MADEIRA',
    tag: 'ARQUIPÉLAGO',
    subtitle: 'Região Autónoma • Funchal & Porto Santo',
    description: 'Do Funchal às ilhas douradas de Porto Santo. Os jogadores insulares disputam a honra do arquipélago no grande mapa de Portugal.',
    stats: '11 Concelhos',
    accentColor: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/30 hover:border-amber-400',
    glowClass: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    symbol: '🌺',
  },
]

export function TerritorySection() {
  return (
    <section
      aria-label="Portugal é o teu campo de jogo"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Luz ambiente suave */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Cinematográfico */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-3 backdrop-blur-md">
          <Globe2 className="w-3.5 h-3.5" />
          <span>SOBERANIA NACIONAL</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          PORTUGAL É O TEU CAMPO DE JOGO.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          De distrito em distrito, cada jogador contribui para uma competição que envolve todo o país.
        </p>
      </div>

      {/* Os 3 Polos Territoriais em Apresentação Leve e Estilizada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 sm:mb-12">
        {REGIONS.map((region) => (
          <div
            key={region.id}
            className={`group relative rounded-3xl p-6 sm:p-7 bg-slate-900/80 backdrop-blur-xl border ${region.borderClass} ${region.glowClass} transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
          >
            {/* Elemento de fundo estilizado */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />

            <div>
              {/* Top: Símbolo e Tag */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${region.iconBg} shadow-inner group-hover:scale-105 transition-transform`}
                >
                  <span>{region.symbol}</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${region.badgeClass}`}
                >
                  {region.tag}
                </span>
              </div>

              {/* Títulos e Subtítulos */}
              <h3 className="text-xl sm:text-2xl font-display font-black uppercase text-white tracking-wide leading-tight group-hover:text-cyan-200 transition-colors">
                {region.name}
              </h3>
              <p className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-wide">
                {region.subtitle}
              </p>

              {/* Descrição */}
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {region.description}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>{region.stats}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-cyan-300 transition-colors">
                Território Ativo
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA de Exploração do Território */}
      <div className="text-center">
        <Link
          href="/mapa"
          className="group inline-flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.45)] transition-all duration-200 hover:scale-[1.02] cursor-pointer"
        >
          <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
          <span>EXPLORAR PORTUGAL 2026</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
