'use client'

import React from 'react'
import { Sparkles, Radio, Eye, MapPin, Send, Compass, Smartphone } from 'lucide-react'

const FUTURE_QUESTIONS = [
  { q: '“O que está a acontecer agora?”', sub: 'O pulso dos factos em tempo real.' },
  { q: '“Quem está no local?”', sub: 'Pessoas e relatos diretos no terreno.' },
  { q: '“Existe algum direto a decorrer?”', sub: 'Transmissões ao vivo do acontecimento.' },
  { q: '“O que está a acontecer perto de mim?”', sub: 'Notificações por proximidade territorial.' },
  { q: '“Posso acompanhar e contribuir?”', sub: 'Comunidade ativa com moderação e contexto.' },
  { q: '“Posso ser eu a dar a notícia?”', sub: 'O cidadão com voz e responsabilidade cívica.' },
]

export function FutureVisionSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>12 — PARA ONDE VAMOS</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            O FUTURO DO VERDADEIRO ACORDA PORTUGAL
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            O Desafio Nacional é o presente vivo do projeto, mas o horizonte continua a apontar para a grande visão que lhe deu origem.
          </p>
        </div>

        {/* Card Central de Visão de Futuro */}
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-zinc-950/90 to-zinc-950 p-6 sm:p-10 backdrop-blur-2xl mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10 mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-purple-400 block">
                O CORAÇÃO DA VISÃO
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                ABRIR O TELEMÓVEL E SENTIR O PAÍS EM TEMPO REAL
              </h3>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-500/30 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              VISÃO / ROTEIRO CONCEPTUAL
            </span>
          </div>

          {/* Grelha das 6 Perguntas do Futuro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {FUTURE_QUESTIONS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-2"
              >
                <span className="text-sm font-bold text-white font-display">{item.q}</span>
                <span className="text-xs text-zinc-400">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
