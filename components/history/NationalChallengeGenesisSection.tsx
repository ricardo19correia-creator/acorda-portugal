'use client'

import React from 'react'
import { Trophy, Compass, Sparkles, BookOpen, Swords, Globe2 } from 'lucide-react'

export function NationalChallengeGenesisSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4">
            <Trophy className="h-3.5 w-3.5" />
            <span>09 — A EVOLUÇÃO POSTERIOR</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            MAS O ACORDA PORTUGAL NÃO PRECISAVA DE SER APENAS INFORMAÇÃO.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Se a missão era fazer os portugueses olharem para o seu país com atenção, porque não desafiá-los também a conhecerem a sua própria história, património e cultura de uma forma dinâmica e envolvente?
          </p>
        </div>

        {/* Card de Transição Narrativa */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-10 backdrop-blur-xl mb-10">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
              A EXPANSÃO DO UNIVERSO
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-display">
              NASCE O DESAFIO NACIONAL
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              A partir da mesma energia que sonhou uma plataforma de cidadania e notícias em tempo real, surgiu uma segunda vertente: criar o maior jogo de perguntas e cultura geral sobre Portugal, onde cada distrito compete pela honra do seu território.
            </p>

            {/* Aviso de Clarificação Inequívoca */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium mt-6">
              <p className="font-bold mb-1">Nota Histórica Fundamental:</p>
              <p>
                O Desafio Nacional é uma <strong className="text-white">vertente e uma expansão posterior</strong> do projeto. Não é a origem do Acorda Portugal nem foi o jogo que deu nome à ideia. O jogo foi a forma escolhida para fazer a comunidade começar a interagir, a competir e a aprender já hoje.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
