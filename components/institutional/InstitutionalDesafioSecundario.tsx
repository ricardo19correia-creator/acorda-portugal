'use client'

import React from 'react'
import Link from 'next/link'
import { BookOpen, Trophy, ArrowRight, Gamepad2, Shield } from 'lucide-react'

export function InstitutionalDesafioSecundario() {
  return (
    <section id="desafio-nacional" className="relative w-full py-14 sm:py-18 border-t border-white/10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Cartão Independente, Sóbrio e Elegante */}
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Apontamento de Luz Suave */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl -z-10" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <BookOpen className="w-3.5 h-3.5" />
              <span>INICIATIVA CULTURAL COMPLEMENTAR</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black uppercase text-white tracking-tight">
                Acorda Portugal — Desafio Nacional
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Como projeto complementar de literacia e valorização do património, o <strong>Desafio Nacional</strong> é o jogo de cultura geral, história, geografia e tradições de Portugal. Criado para celebrar o conhecimento sobre o nosso país através de perguntas documentadas e competição cívica e saudável entre os distritos.
              </p>
            </div>

            {/* Três pequenos aspetos culturais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-left">
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs font-bold text-amber-300 uppercase">Cultura & História</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Perguntas rigorosas sobre o património de Portugal.</p>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs font-bold text-emerald-300 uppercase">Território</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Representação cívica dos 18 distritos e ilhas.</p>
              </div>
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <p className="text-xs font-bold text-teal-300 uppercase">Conhecimento</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Partidas individuais e duelos de aprendizagem.</p>
              </div>
            </div>

            {/* Ligações Claras */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/desafio-nacional"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Conhecer o Desafio Nacional</span>
              </Link>

              <Link
                href="/jogar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Jogar Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default InstitutionalDesafioSecundario
