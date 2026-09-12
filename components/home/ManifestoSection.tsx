'use client'

import React from 'react'
import { Brain, TrendingUp, Flag, Swords, Sparkles } from 'lucide-react'

const MOMENTS = [
  {
    step: '01',
    label: 'RESPONDE',
    title: 'Desafia a Tua Mente',
    description: 'Enfrenta perguntas de dezenas de temas da história, geografia, cultura e atualidade de Portugal ao Mundo.',
    icon: Brain,
    accent: 'emerald',
    badge: 'CONHECIMENTO',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    numColor: 'text-emerald-400/30 group-hover:text-emerald-400/50',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  {
    step: '02',
    label: 'EVOLUI',
    title: 'Sobe no Escalão Nacional',
    description: 'Ganha XP em cada partida, sobe de nível e conquista títulos de prestígio, molduras e recompensas exclusivas.',
    icon: TrendingUp,
    accent: 'teal',
    badge: 'PROGRESSÃO',
    borderClass: 'border-teal-500/40 hover:border-teal-400',
    glowClass: 'shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.35)]',
    bgBadge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    numColor: 'text-teal-400/30 group-hover:text-teal-400/50',
    iconBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  {
    step: '03',
    label: 'REPRESENTA',
    title: 'A Soberania da Tua Terra',
    description: 'O teu distrito passa a fazer parte da tua jornada. Cada resposta certa soma pontos para a soberania do teu território.',
    icon: Flag,
    accent: 'cyan',
    badge: 'IDENTIDADE',
    borderClass: 'border-cyan-500/40 hover:border-cyan-400',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]',
    bgBadge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    numColor: 'text-cyan-400/30 group-hover:text-cyan-400/50',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    step: '04',
    label: 'COMPETE',
    title: 'Duelo e Glória no Topo',
    description: 'Enfrenta jogadores de todo o país em tempo real, sobe na Liga Elo e luta pelo primeiro lugar no ranking de Portugal.',
    icon: Swords,
    accent: 'gold',
    badge: 'COMPETIÇÃO',
    borderClass: 'border-amber-500/40 hover:border-amber-400',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]',
    bgBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    numColor: 'text-amber-400/30 group-hover:text-amber-400/50',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
]

export function ManifestoSection() {
  return (
    <section
      id="manifesto"
      aria-label="O que é o Acorda Portugal"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header Editorial da Secção */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-slate-300 mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>O CONCEITO</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          NÃO É APENAS UM QUIZ.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
          O Acorda Portugal transforma conhecimento numa competição nacional.
        </p>
      </div>

      {/* Narrativa Visual Contínua dos 4 Momentos */}
      <div className="relative">
        {/* Linha guia de conexão no desktop */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/30 to-amber-500/20 -translate-y-1/2 pointer-events-none z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {MOMENTS.map((moment, idx) => {
            const Icon = moment.icon
            return (
              <div
                key={moment.step}
                className={`group relative rounded-3xl p-6 sm:p-7 bg-slate-900/80 backdrop-blur-xl border ${moment.borderClass} ${moment.glowClass} transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden`}
              >
                {/* Número Grande Holográfico em Fundo */}
                <div
                  className={`absolute -top-3 -right-2 text-7xl sm:text-8xl font-black font-display tracking-tighter ${moment.numColor} transition-colors pointer-events-none select-none`}
                >
                  {moment.step}
                </div>

                {/* Top: Ícone e Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${moment.iconBg} shadow-inner group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${moment.bgBadge}`}
                    >
                      {moment.badge}
                    </span>
                  </div>

                  {/* Título do Momento */}
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">
                    {moment.step} — {moment.label}
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-black uppercase text-white tracking-wide leading-tight group-hover:text-slate-100 transition-colors">
                    {moment.title}
                  </h3>

                  {/* Descrição */}
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    {moment.description}
                  </p>
                </div>

                {/* Rodapé tático discreto */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="uppercase tracking-widest">Fase {idx + 1}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-emerald-400 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
