'use client'

import React from 'react'
import {
  HelpCircle,
  TrendingUp,
  MapPin,
  Swords,
  Users2,
  CalendarDays,
  Sparkles,
  ShoppingBag,
  DoorOpen,
} from 'lucide-react'

const PILLARS = [
  {
    icon: HelpCircle,
    title: 'PERGUNTAS',
    items: ['História', 'Geografia', 'Cultura', 'Música', 'Futebol', 'Gastronomia', 'Atualidade', 'Ciência', 'Tecnologia', 'Natureza', 'Curiosidades'],
    tag: 'Conhecimento',
    accent: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: TrendingUp,
    title: 'PROGRESSÃO',
    items: ['XP', 'Níveis RPG', 'Títulos de Honra', 'Emblemas', 'Molduras', 'Conquistas', 'Recompensas'],
    tag: 'Evolução',
    accent: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    icon: MapPin,
    title: 'TERRITÓRIO',
    items: ['Cidade', 'Concelho', 'Distrito', 'Identidade Regional Soberana'],
    tag: 'Pertença',
    accent: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: Swords,
    title: 'COMPETIÇÃO',
    items: ['Guerra das Cidades', 'Guerra dos Distritos', 'Rankings Nacionais', 'Duelos 1v1'],
    tag: 'Disputa',
    accent: 'border-red-500/30 text-red-400 bg-red-500/10',
  },
  {
    icon: Users2,
    title: 'COMUNIDADE',
    items: ['Comunidades Locais', 'Missões Coletivas', 'Classificações de Grupo'],
    tag: 'União',
    accent: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  {
    icon: CalendarDays,
    title: 'DESAFIOS',
    items: ['Desafio Diário', 'Medalhas Especiais', 'Eventos Sazonais'],
    tag: 'Desafio',
    accent: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
  },
  {
    icon: Sparkles,
    title: 'TEMPORADAS',
    items: ['Temas Mensais', 'Competições Especiais', 'Ciclos Competitivos'],
    tag: 'Ritmo',
    accent: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  {
    icon: ShoppingBag,
    title: 'LOJA',
    items: ['Avatares Portugueses', 'Molduras Dinâmicas', 'Bandeiras', 'Cosméticos Culturais'],
    tag: 'Identidade',
    accent: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
  },
]

export function MasterPlanSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DOCUMENTO FUNDADOR</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            O PRIMEIRO MASTER PLAN DO JOGO
          </h2>

          <div className="mt-6 inline-block rounded-2xl border border-white/10 bg-zinc-950/70 px-6 py-3 backdrop-blur-xl shadow-lg">
            <p className="font-display text-lg sm:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-200 to-amber-400">
              “O jogo começou como um plano. Depois começou a ganhar vida.”
            </p>
          </div>
        </div>

        {/* Os 8 Pilares do Master Plan Original */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-zinc-900/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${p.accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white tracking-wide">
                    {p.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* A Porta de Entrada — Visão Estratégica Documentada */}
        <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950/90 via-zinc-900/60 to-zinc-950/90 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <DoorOpen className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3">
                <span>ESTRATÉGIA DE PRODUTO</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                A Porta de Entrada para a Marca
              </h3>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                Uma das ideias estratégicas mais determinantes registadas no Master Plan: o jogo foi pensado como uma grande porta de entrada para a marca <strong className="text-emerald-400">ACORDA PORTUGAL</strong>. O objetivo não era simplesmente criar outro quiz. Era erguer uma experiência capaz de transportar a identidade portuguesa para uma nova dimensão:
              </p>

              {/* Equação Estratégica */}
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-sm font-bold">
                <span className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">Competição</span>
                <span className="text-zinc-500">+</span>
                <span className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-cyan-300">Conhecimento</span>
                <span className="text-zinc-500">+</span>
                <span className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-amber-300">Território</span>
                <span className="text-zinc-500">+</span>
                <span className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-purple-300">Comunidade</span>
                <span className="text-zinc-500">+</span>
                <span className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-red-300">Identidade Portuguesa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
