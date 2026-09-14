'use client'

import React from 'react'
import { Flag, Sparkles, HeartHandshake, Eye, Volume2 } from 'lucide-react'

export function IdentityNameSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
            <Flag className="h-3.5 w-3.5" />
            <span>08 — O SIGNIFICADO DO NOME</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            O QUE SIGNIFICA “ACORDA PORTUGAL”?
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Muitas vezes confundido com o título de uma competição de entretenimento, o nome carrega em si uma declaração de intenções muito mais profunda.
          </p>
        </div>

        {/* Caixa de Manifesto de Identidade */}
        <div className="relative rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-zinc-950/90 to-zinc-950 p-6 sm:p-12 backdrop-blur-2xl text-center overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              NÃO É APENAS O NOME DE UM JOGO.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500">
                É UM APELO CÍVICO À PARTICIPAÇÃO.
              </span>
            </p>

            <div className="h-0.5 w-24 bg-gradient-to-r from-emerald-500 to-amber-500 mx-auto" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="font-mono text-xs text-amber-400 font-bold uppercase block mb-1">
                  1. Uma Chamada à Atenção
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para não deixarmos que o país passe ao lado. Para olhar com atenção para cada aldeia, vila e cidade de norte a sul e ilhas.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase block mb-1">
                  2. Recusa da Passividade
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Para não ficarmos resignados a assistir de longe àquilo que diz respeito a todos nós como comunidade.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase block mb-1">
                  3. Saber o que Está a Acontecer
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Ter a curiosidade viva de procurar a verdade, de acompanhar a atualidade e de exigir transparência factual.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="font-mono text-xs text-rose-400 font-bold uppercase block mb-1">
                  4. E, no Momento Certo: Dar a Notícia
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Estar no local certo e ter a coragem cívica de ser a voz que mostra aos outros o que está a decorrer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
