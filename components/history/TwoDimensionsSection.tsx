'use client'

import React from 'react'
import { Layers, Radio, Trophy, ArrowDown, HelpCircle, Eye } from 'lucide-react'

export function TwoDimensionsSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Layers className="h-3.5 w-3.5" />
            <span>10 — O UNIVERSO ACORDA PORTUGAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            DUAS DIMENSÕES DO MESMO UNIVERSO
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Compreender o Acorda Portugal exige olhar para a arquitetura completa do projeto. Não são duas iniciativas isoladas: são duas facetas complementares que respondem a duas necessidades complementares.
          </p>
        </div>

        {/* Diagrama Visual em Árvore */}
        <div className="rounded-3xl border border-white/15 bg-zinc-950/80 p-6 sm:p-12 backdrop-blur-2xl shadow-2xl mb-12">
          {/* Tronco: ACORDA PORTUGAL */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-display font-black text-base sm:text-xl uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              ACORDA PORTUGAL
            </div>
            <div className="w-0.5 h-8 bg-white/20 mt-2" />
            <div className="w-full max-w-md h-0.5 bg-white/20 hidden sm:block" />
          </div>

          {/* Ramificações: Duas Dimensões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            {/* Dimensão 1: Informação em Tempo Real */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                    DIMENSÃO 1
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-display uppercase">
                  INFORMAÇÃO EM TEMPO REAL
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Notícias em primeira mão • Diretos do terreno • Participação cívica • Alertas comunitários.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-500/20">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Pergunta Central</span>
                <span className="text-sm font-bold text-emerald-300 font-display">
                  “O QUE ESTÁ A ACONTECER?”
                </span>
              </div>
            </div>

            {/* Dimensão 2: Desafio Nacional */}
            <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    DIMENSÃO 2
                  </span>
                </div>
                <h3 className="text-xl font-black text-white font-display uppercase">
                  DESAFIO NACIONAL
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Jogo de cultura geral • Batalhas distritais • Duelos 1v1 • Conhecimento e identidade nacional.
                </p>
              </div>

              <div className="mt-6 pt-4 border-amber-500/20 border-t">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Pergunta Central</span>
                <span className="text-sm font-bold text-amber-300 font-display">
                  “O QUANTO CONHECES O PAÍS?”
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
