'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight, Shield, Globe, Users } from 'lucide-react'

export function InstitutionalHero() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="acorda-portugal"
      className="relative w-full pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl flex flex-col items-center">
        {/* Selo Nacional Oficial: Verde, Dourado e Vermelho */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4AF37]/30 bg-[#061A10]/80 px-4 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md mb-8">
          <span className="flex h-2.5 w-2.5 relative items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
          </span>
          <span className="tracking-widest uppercase text-white font-mono text-[11px]">
            Acorda Portugal
          </span>
          <span className="text-[#D4AF37]">•</span>
          <span className="text-[#E5C158] font-medium text-[11px] tracking-wide">
            Informação & Cidadania
          </span>
        </div>

        {/* Frase Principal Obrigatória */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[1.05] max-w-4xl drop-shadow-md">
          Portugal precisa de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#E5C158]">
            acordar.
          </span>
        </h1>

        {/* Breve Explicação sobre a Visão e Missão do Projeto */}
        <p className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-slate-100 max-w-2xl leading-relaxed">
          Uma plataforma cívica e independente dedicada a dar voz aos portugueses, promover a transparência e assegurar informação rigorosa e descentralizada em todo o país.
        </p>

        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
          A informação começa nas pessoas. Construímos um espaço soberano para acompanhar a realidade de Portugal, de norte a sul e nas ilhas.
        </p>

        {/* Pilares Institucionais em Síntese Rápida */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#10B981]/30 bg-[#061A10]/60 px-4 py-3 text-xs font-bold text-slate-200">
            <Shield className="h-4 w-4 text-[#10B981] shrink-0" />
            <span>Independência Total</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-xs font-bold text-white">
            <Users className="h-4 w-4 text-white shrink-0" />
            <span>Voz dos Cidadãos</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#DC2626]/30 bg-[#250909]/60 px-4 py-3 text-xs font-bold text-slate-200">
            <Globe className="h-4 w-4 text-[#EF4444] shrink-0" />
            <span>Dimensão Nacional</span>
          </div>
        </div>

        {/* Ações Institucionais */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <button
            type="button"
            onClick={() => scrollTo('noticias')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#15803D] to-[#10B981] hover:from-[#16a34a] hover:to-[#34d399] text-[#041009] font-extrabold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-black/50 active:scale-95 cursor-pointer"
          >
            <span>Conhecer o Projeto</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <Link
            href="/jogar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#061A10]/50 hover:bg-[#D4AF37]/10 text-white font-bold px-6 py-3.5 text-xs sm:text-sm uppercase tracking-wider transition-all backdrop-blur-md active:scale-95"
          >
            <span className="text-[#E5C158]">Desafio Nacional</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </Link>
        </div>
      </div>
    </section>
  )
}
