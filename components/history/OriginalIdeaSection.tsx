'use client'

import React from 'react'
import {
  Smartphone,
  Bell,
  Radio,
  MapPin,
  Flame,
  Eye,
  Send,
  Zap,
} from 'lucide-react'

const PILLARS = [
  {
    icon: Bell,
    title: 'Notícias em Tempo Real',
    desc: 'Acompanhar as notícias da atualidade no momento exato em que se desenrolam.',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  {
    icon: MapPin,
    title: 'Acontecimentos Perto de Si',
    desc: 'Descobrir ocorrências, eventos e relatos verificados na sua própria região ou distrito.',
    accent: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  {
    icon: Radio,
    title: 'Alertas Imediatos',
    desc: 'Receber notificações instantâneas sobre acontecimentos relevantes enquanto eles acontecem.',
    accent: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  {
    icon: Send,
    title: 'Ser Quem Dá a Notícia',
    desc: 'Estar no local certo e permitir que o próprio cidadão possa transmitir e informar o país.',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
]

export function OriginalIdeaSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Smartphone className="h-3.5 w-3.5" />
            <span>02 — A IDEIA ORIGINAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            UMA APLICAÇÃO MÓVEL DE INFORMAÇÃO EM PRIMEIRA MÃO
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            A génese do <strong className="text-emerald-400 font-semibold">Acorda Portugal</strong> nunca foi uma grelha de perguntas. Foi a convicção de que o acesso à informação em Portugal podia ser mais direto, mais transparente e mais próximo das pessoas reais.
          </p>
        </div>

        {/* Bloco de Destaque da Visão */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/60 p-6 sm:p-10 backdrop-blur-xl mb-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block">
              O PROPÓSITO INICIAL
            </span>
            <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed font-display">
              Construir uma plataforma que permitisse a qualquer pessoa em Portugal saber o que está a acontecer à sua volta, sem filtros distorcidos, sem horas de atraso e com a participação viva da própria comunidade.
            </p>
          </div>
        </div>

        {/* Grelha dos 4 Pilares da Ideia Original */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white/[0.02] border ${p.border} hover:bg-white/[0.04] transition-all flex flex-col justify-between gap-3`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${p.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">{p.title}</h3>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
