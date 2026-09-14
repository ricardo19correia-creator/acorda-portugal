'use client'

import React from 'react'
import {
  CheckCircle2,
  Trophy,
  Swords,
  Crown,
  Sparkles,
  ShoppingBag,
  Award,
  Zap,
  HelpCircle,
  TrendingUp,
} from 'lucide-react'

const REAL_FEATURES = [
  {
    icon: HelpCircle,
    title: 'Inventário de Perguntas & Categorias',
    desc: 'Milhares de perguntas rigorosamente organizadas sobre história, geografia, tradições, gastronomia e património português.',
  },
  {
    icon: TrendingUp,
    title: 'Progressão Real de 21 Níveis',
    desc: 'Escalada de longo prazo baseada em XP acumulado, desde Curioso até ao título máximo de Mestre de Portugal.',
  },
  {
    icon: Trophy,
    title: 'Rankings Nacionais & Territoriais',
    desc: 'Classificação oficial em tempo real de Portugal e grelha dos 18 distritos continentais mais regiões autónomas.',
  },
  {
    icon: Swords,
    title: 'Duelos Competitivos 1v1',
    desc: 'Confrontos diretos em tempo real com rating Elo e divisão competitiva (Bronze a Lendário).',
  },
  {
    icon: ShoppingBag,
    title: 'Loja Oficial & Personalização',
    desc: 'Catálogo de cosméticos com moedas virtuais do jogo: avatares, molduras animadas e títulos de prestígio.',
  },
  {
    icon: Award,
    title: 'Temporada Oficial & Conquistas',
    desc: 'Épocas competitivas ativas com recompensas oficiais e distintivos de mérito individual.',
  },
]

export function PresentGameSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>11 — ONDE ESTAMOS HOJE</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            A REALIDADE DO DESAFIO NACIONAL
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Hoje, a vertente do jogo é uma realidade sólida, testada e em contínua evolução. Todos os sistemas existentes foram construídos com dados reais e rigor técnico.
          </p>
        </div>

        {/* Grelha de Funcionalidades Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {REAL_FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 w-fit mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white font-display">{f.title}</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{f.desc}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>EM PRODUÇÃO ATIVA</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
