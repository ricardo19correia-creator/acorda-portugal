'use client'

import React from 'react'
import { ChevronRight, ArrowDown } from 'lucide-react'

const STAGES = [
  { step: '01', title: 'ACORDA PORTUGAL', subtitle: 'A génese da marca', color: 'from-emerald-500 to-teal-400' },
  { step: '02', title: 'Visão Nacional', subtitle: 'Informação e território', color: 'from-teal-400 to-cyan-500' },
  { step: '03', title: 'Identidade', subtitle: 'Música e linguagem própria', color: 'from-cyan-500 to-blue-500' },
  { step: '04', title: 'Comunidade', subtitle: 'Voz cívica e mérito', color: 'from-blue-500 to-indigo-500' },
  { step: '05', title: 'Estrutura', subtitle: 'Arquitetura e ecossistema', color: 'from-indigo-500 to-purple-500' },
  { step: '06', title: 'Progressão', subtitle: 'Sistemas de confiança', color: 'from-purple-500 to-amber-500' },
  { step: '07', title: 'Nascimento do Desafio', subtitle: 'A grande transformação', color: 'from-amber-500 to-orange-500', highlight: true },
  { step: '08', title: 'Evolução do Jogo', subtitle: 'Do Master Plan à realidade', color: 'from-orange-500 to-emerald-500' },
  { step: '09', title: 'Produto Atual', subtitle: 'O universo vivo de Portugal', color: 'from-emerald-400 to-amber-400', current: true },
]

export function HistoryTimelineFlow() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            A Sequência Fundamental
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-display font-black uppercase text-white tracking-tight">
            A Linha de Continuidade Histórica
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            O Desafio Nacional é o fruto maduro de uma viagem conceitual contínua que começou com uma visão ampla de identidade nacional.
          </p>
        </div>

        {/* Layout Desktop / Tablet em Linha / Grelha fluida */}
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {STAGES.map((s, idx) => (
            <div
              key={s.step}
              className={`relative rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                s.current
                  ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                  : s.highlight
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-white/10 bg-zinc-900/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-black tracking-wider text-zinc-500">
                  PASSO {s.step}
                </span>
                {idx < STAGES.length - 1 ? (
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <h3 className="font-display text-base font-bold text-white tracking-tight">
                {s.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                {s.subtitle}
              </p>
              <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${s.color} opacity-80`} />
            </div>
          ))}
        </div>

        {/* Layout Mobile / Tablet Vertical */}
        <div className="lg:hidden space-y-3">
          {STAGES.map((s, idx) => (
            <div key={s.step} className="flex flex-col items-center">
              <div
                className={`w-full rounded-2xl border p-4 backdrop-blur-xl ${
                  s.current
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : s.highlight
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/10 bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400/80 bg-white/5 px-2 py-1 rounded-md">
                      {s.step}
                    </span>
                    <div>
                      <h3 className="font-display text-sm sm:text-base font-bold text-white">
                        {s.title}
                      </h3>
                      <p className="text-xs text-zinc-400">{s.subtitle}</p>
                    </div>
                  </div>
                  {s.current && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Atual
                    </span>
                  )}
                </div>
              </div>
              {idx < STAGES.length - 1 && (
                <div className="py-1 text-zinc-600">
                  <ArrowDown className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
