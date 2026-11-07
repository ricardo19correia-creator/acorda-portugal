'use client'

import React from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Send,
  Compass,
  ArrowRight,
  Radio,
  FileText,
  MapPin,
  CheckCircle2,
} from 'lucide-react'

export function InstitutionalHero() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      {/* Luzes subtis de fundo institucional (azul escuro e verde bandeira) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] max-w-full h-[400px] bg-gradient-to-b from-emerald-600/15 via-[#0b2545]/20 to-transparent blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-40 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[110px] -z-10" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-96 h-96 bg-[#0a1931]/40 rounded-full blur-[120px] -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Selo Institucional de Identidade */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-[#0a192f]/80 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md mb-8 animate-fadeIn">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">🇵🇹 Plataforma Nacional de Informação & Cidadania</span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-amber-300/90 font-medium hidden sm:inline">Tempo Real</span>
        </div>

        {/* Título Principal Mandatário */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-[1.08] max-w-4xl mx-auto drop-shadow-md">
          Portugal precisa de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
            acordar.
          </span>
        </h1>

        {/* Subtítulo Mandatário */}
        <p className="mt-5 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-100 max-w-3xl mx-auto">
          A informação começa nas pessoas.
        </p>

        {/* Texto Editorial de Enquadramento */}
        <p className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300/90 max-w-3xl mx-auto font-normal">
          O <strong className="text-white font-semibold">Acorda Portugal</strong> é uma plataforma cívica e independente desenhada para acompanhar, reportar e verificar o que realmente acontece de norte a sul do país, nas regiões autónomas e nas comunidades da diáspora. Sem filtros partidários, sem sensacionalismo e com compromisso absoluto com o interesse público.
        </p>

        {/* Ações Principais da Homepage */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-xl mx-auto">
          <a
            href="#participar"
            onClick={(e) => scrollToSection(e, 'participar')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Acontecimento</span>
          </a>

          <a
            href="#radar"
            onClick={(e) => scrollToSection(e, 'radar')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 hover:bg-slate-800/90 text-white px-5 py-3.5 text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Radar Nacional</span>
          </a>

          <a
            href="#missao"
            onClick={(e) => scrollToSection(e, 'missao')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 px-5 py-3.5 text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>A Nossa Missão</span>
          </a>
        </div>

        {/* Barra de Credenciais Cívicas */}
        <div className="mt-14 sm:mt-18 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cobertura Territorial</span>
            </div>
            <p className="text-lg font-black text-white">18 Distritos + Ilhas</p>
            <p className="text-xs text-slate-400 mt-0.5">Monitorização cívica descentralizada</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-400 mb-1.5">
              <Radio className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Emissão & Alertas</span>
            </div>
            <p className="text-lg font-black text-white">Tempo Real</p>
            <p className="text-xs text-slate-400 mt-0.5">Comunicação direta dos factos</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Rigor Factual</span>
            </div>
            <p className="text-lg font-black text-white">Verificação Dupla</p>
            <p className="text-xs text-slate-400 mt-0.5">Cruzamento de fontes comunitárias</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-300 mb-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Estatuto Cívico</span>
            </div>
            <p className="text-lg font-black text-white">100% Independente</p>
            <p className="text-xs text-slate-400 mt-0.5">Sem financiamento partidário</p>
          </div>
        </div>
      </div>
    </section>
  )
}
