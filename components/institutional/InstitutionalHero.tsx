'use client'

import React from 'react'
import { Send, Compass, ShieldCheck, MapPin, Radio, CheckCircle2 } from 'lucide-react'

export function InstitutionalHero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative w-full pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 text-center">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Selo Nobre Institucional */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md mb-6">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">Plataforma Cívica Independente</span>
          <span className="text-white/20">•</span>
          <span className="text-amber-300/90 font-medium">Tempo Real</span>
        </div>

        {/* 1. Apresentação: «Portugal precisa de acordar.» */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
          Portugal precisa de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            acordar.
          </span>
        </h1>

        {/* Subtítulo Mandatário */}
        <p className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-100 max-w-3xl mx-auto">
          A informação começa nas pessoas.
        </p>

        {/* Texto Editorial Breve */}
        <p className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-slate-300/90 max-w-2xl mx-auto font-normal">
          O <strong className="text-white font-semibold">Acorda Portugal</strong> é uma plataforma cívica e independente desenhada para acompanhar, reportar e verificar o que realmente acontece em todo o território nacional — sem filtros partidários e ao serviço dos cidadãos.
        </p>

        {/* Botões de Ação Principais */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => scrollTo('acontecimentos')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Acontecimento</span>
          </button>

          <button
            type="button"
            onClick={() => scrollTo('radar')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-900/80 hover:bg-slate-800/90 text-white px-5 py-3.5 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Radar Nacional</span>
          </button>

          <button
            type="button"
            onClick={() => scrollTo('missao')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-300 px-4 py-3.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>A Nossa Missão</span>
          </button>
        </div>

        {/* Indicadores Focados de Cobertura */}
        <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Território</span>
            </div>
            <p className="text-base font-black text-white">18 Distritos & Ilhas</p>
            <p className="text-[11px] text-slate-400">Monitorização cívica contínua</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Rigor</span>
            </div>
            <p className="text-base font-black text-white">Verificação Comunitária</p>
            <p className="text-[11px] text-slate-400">Combate ativo à desinformação</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Radio className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Comunicação</span>
            </div>
            <p className="text-base font-black text-white">Alertas em Tempo Real</p>
            <p className="text-[11px] text-slate-400">Diretos e ocorrências locais</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default InstitutionalHero
