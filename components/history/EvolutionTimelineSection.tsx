'use client'

import React from 'react'
import {
  Lightbulb,
  FileCode2,
  Cpu,
  Layers,
  FlaskConical,
  TrendingUp,
  Trophy,
} from 'lucide-react'

const TIMELINE_STEPS = [
  {
    stage: '01',
    name: 'IDEIA',
    icon: Lightbulb,
    desc: 'O ponto de partida em Vila Real: conceber uma forma autêntica de ligar informação, orgulho territorial e cidadãos.',
    accent: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
  },
  {
    stage: '02',
    name: 'MASTER PLAN',
    icon: FileCode2,
    desc: 'O nascimento da arquitetura do Desafio Nacional: formalização das 8 áreas nucleares, das perguntas aos duelos e progressão.',
    accent: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  },
  {
    stage: '03',
    name: 'PROTÓTIPO',
    icon: Cpu,
    desc: 'Primeiras experiências mecânicas de quiz interativo, cronómetros de resposta e pontuação territorial.',
    accent: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10',
  },
  {
    stage: '04',
    name: 'DESENVOLVIMENTO',
    icon: Layers,
    desc: 'Construção da plataforma completa em Next.js e Firebase: sincronização em tempo real, economia de moedas e arenas.',
    accent: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    stage: '05',
    name: 'TESTES & AUDITORIA',
    icon: FlaskConical,
    desc: 'Auditoria forense rigorosa ao inventário de perguntas portuguesas, segurança económica e compatibilidade mobile APK.',
    accent: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    stage: '06',
    name: 'EVOLUÇÃO',
    icon: TrendingUp,
    desc: 'Refinamento do sistema de 3 ajudas canónicas, mapa vivo nacional, modos de jogo especiais e otimização visual contínua.',
    accent: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
  },
  {
    stage: '07',
    name: 'DESAFIO NACIONAL',
    icon: Trophy,
    desc: 'O produto contemporâneo de excelência: um ecossistema competitivo onde Portugal inteiro joga, compete e representa a sua terra.',
    accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    isCurrent: true,
  },
]

export function EvolutionTimelineSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            Cronologia de Maturação
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            DO MASTER PLAN AO JOGO REAL
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-300">
            A passagem documentada entre a imaginação estratégica e o produto digital construído linha a linha.
          </p>
        </div>

        {/* Timeline Vertical / Cards Sequenciais */}
        <div className="relative">
          {/* Linha vertical conectora no centro em desktop */}
          <div className="hidden md:block absolute left-1/2 top-6 bottom-6 -translate-x-1/2 w-0.5 bg-gradient-to-b from-teal-500/40 via-purple-500/40 to-emerald-500/60" />

          <div className="space-y-6 md:space-y-12">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isEven = idx % 2 === 0
              return (
                <div
                  key={step.name}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Ponto Central com Ícone */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-zinc-950 shadow-xl">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${step.accent}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Espaço Vazio para Equilibrar o Grid */}
                  <div className="hidden md:block w-1/2" />

                  {/* Card de Conteúdo */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-10' : 'md:pr-10'}`}>
                    <div
                      className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                        step.isCurrent
                          ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                          : 'border-white/10 bg-zinc-950/70 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-black tracking-widest text-zinc-500">
                          ETAPA {step.stage}
                        </span>
                        <div className={`flex md:hidden h-7 w-7 items-center justify-center rounded-lg border ${step.accent}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        {step.isCurrent && (
                          <span className="hidden md:inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                            Produto Vivo
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                        {step.name}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
