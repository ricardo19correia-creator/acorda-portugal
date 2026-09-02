'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Sparkles, MapPin, Trophy, ArrowRight, Zap, Target, Coins, ShieldCheck, Flame, Compass } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: Play,
    title: 'Joga',
    description: 'Escolhe entre 18 categorias temáticas de Portugal ou desafia outros concorrentes em Duelos 1v1.',
    tone: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
  },
  {
    num: '02',
    icon: Target,
    title: 'Acerta',
    description: 'Responde com rapidez e precisão para ativar séries de acertos consecutivos (streak) e bónus.',
    tone: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400',
  },
  {
    num: '03',
    icon: Coins,
    title: 'Ganha XP e Moedas',
    description: 'Cada acerto gera experiência para o teu nível e moedas virtuais € Acorda para desbloquear itens.',
    tone: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
  },
  {
    num: '04',
    icon: Zap,
    title: 'Evolui',
    description: 'Avança pelos 21 níveis de prestígio RPG e desbloqueia avatares, arenas e títulos oficiais.',
    tone: 'border-purple-500/30 bg-purple-950/20 text-purple-400',
  },
  {
    num: '05',
    icon: MapPin,
    title: 'Representa o Distrito',
    description: 'Cada partida concluída soma pontos ao teu território nos 18 distritos, Açores e Madeira.',
    tone: 'border-rose-500/30 bg-rose-950/20 text-rose-400',
  },
  {
    num: '06',
    icon: Trophy,
    title: 'Conquista Portugal',
    description: 'Sobe no ranking nacional e ajuda o teu distrito a conquistar o primeiro lugar da tabela.',
    tone: 'border-yellow-500/30 bg-yellow-950/20 text-yellow-400',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="como-funciona-title" className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Container Principal com Estilo Glassmorphism */}
      <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/60 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
        {/* Glows Decorativos de Canto */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

        {/* Cabeçalho da Secção */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mecânica de Jogo</span>
          </div>

          <h2 id="como-funciona-title" className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            Como Funciona?
          </h2>

          <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed">
            Uma competição nacional concebida para ser rápida, viciante e 100% justa. Aprende a mecânica em 6 passos simples.
          </p>
        </div>

        {/* Demonstração Visual do Core Loop */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center overflow-x-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Fluxo Contínuo de Recompensa
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 min-w-[500px] text-xs sm:text-sm font-black text-white">
            <span className="rounded-xl bg-slate-800/90 border border-white/10 px-3 py-1.5 text-emerald-300 shadow-sm">
              ❓ Pergunta
            </span>
            <span className="text-emerald-400">➔</span>
            <span className="rounded-xl bg-slate-800/90 border border-white/10 px-3 py-1.5 text-cyan-300 shadow-sm">
              🎯 Resposta
            </span>
            <span className="text-cyan-400">➔</span>
            <span className="rounded-xl bg-slate-800/90 border border-white/10 px-3 py-1.5 text-amber-300 shadow-sm">
              ⭐ XP
            </span>
            <span className="text-amber-400">➔</span>
            <span className="rounded-xl bg-slate-800/90 border border-white/10 px-3 py-1.5 text-yellow-300 shadow-sm">
              🪙 Moedas
            </span>
            <span className="text-yellow-400">➔</span>
            <span className="rounded-xl bg-slate-800/90 border border-white/10 px-3 py-1.5 text-rose-300 shadow-sm">
              🏆 Ranking
            </span>
            <span className="text-rose-400">➔</span>
            <span className="rounded-xl bg-emerald-500 px-3 py-1.5 text-slate-950 font-black shadow-md">
              📈 Progresso
            </span>
          </div>
        </div>

        {/* Grelha dos 6 Passos Canónicos */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">
                    Passo {step.num}
                  </span>
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${step.tone} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="font-display text-lg font-black text-white uppercase tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* CTAs Finais de Ação */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <Link
            href="/jogar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Jogar Agora</span>
          </Link>

          <Link
            href="/explorar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white px-7 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Explorar o Desafio</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
