'use client'

import React from 'react'
import { Sparkles, Calendar, BookOpen, Flame, Compass } from 'lucide-react'

const ROADMAP_ITEMS = [
  {
    icon: BookOpen,
    title: 'NOVOS CONTEÚDOS',
    description: 'Expansão contínua do banco editorial com novas perguntas verificadas sobre a história, sociedade e atualidade portuguesa.',
    badge: 'EDITORIAL',
  },
  {
    icon: Compass,
    title: 'COMPETIÇÃO DISTRITAL',
    description: 'Batalhas de soberania territorial e pontuações dinâmicas que colocam cada concelho no centro da disputa.',
    badge: 'TERRITÓRIO',
  },
  {
    icon: Flame,
    title: 'EVOLUÇÃO & PRESTÍGIO',
    description: 'Novas temporadas, títulos honoríficos, molduras de avatar exclusivas e escalões competitivos da Liga Elo.',
    badge: 'PROGRESSÃO',
  },
  {
    icon: Calendar,
    title: 'EVENTOS NACIONAIS',
    description: 'Rondas comemorativas ligadas às grandes datas da nossa história e momentos marcantes do país.',
    badge: 'TEMPORADA',
  },
]

export function FutureSection() {
  return (
    <section
      aria-label="O futuro do jogo"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>UNIVERSO EM EVOLUÇÃO</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          O FUTURO DO JOGO.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          O Acorda Portugal está apenas a começar. Uma experiência concebida para crescer com a comunidade de norte a sul do país.
        </p>
      </div>

      {/* Grid de Pilares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ROADMAP_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="group relative rounded-3xl p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-display font-black text-base sm:text-lg uppercase text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Ecossistema Ativo</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
