'use client'

import React from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  FileCheck,
  Search,
  Scale,
  Users,
} from 'lucide-react'

const MECHANISMS = [
  {
    icon: ShieldCheck,
    title: 'Moderação e Validação',
    desc: 'Triagem comunitária e revisão para garantir a veracidade dos relatos submetidos.',
  },
  {
    icon: MapPin,
    title: 'Geolocalização Precisa',
    desc: 'Identificação e confirmação do local exato onde a ocorrência está a decorrer.',
  },
  {
    icon: Search,
    title: 'Contexto e Confirmação',
    desc: 'Cruzamento de relatos múltiplos e fontes complementares para evitar ambiguidades.',
  },
  {
    icon: AlertTriangle,
    title: 'Combate à Desinformação',
    desc: 'Sistemas de denúncia de conteúdo falso, rotulagem de alertas e penalização de abusos.',
  },
]

export function CitizenReporterSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
            <Users className="h-3.5 w-3.5" />
            <span>03 & 04 — O CIDADÃO NO CENTRO</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            E SE QUEM ESTÁ NO LOCAL PUDESSE MOSTRAR O QUE ACONTECEU?
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            A grande interrogação que esteve na base de tudo. Quantas vezes um acontecimento relevante ocorre e as pessoas a centenas de quilómetros apenas tomam conhecimento horas ou dias mais tarde, já sem a verdade crua do momento?
          </p>
        </div>

        {/* Três Perguntas Fundamentais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 text-center flex flex-col justify-center">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase mb-2">Pergunta 1</span>
            <p className="text-base font-bold text-white">
              “E se, quando algo acontecer, não tivéssemos de esperar pelos canais tradicionais?”
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 text-center flex flex-col justify-center">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase mb-2">Pergunta 2</span>
            <p className="text-base font-bold text-white">
              “E se quem está no local pudesse mostrar diretamente o que está a acontecer?”
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/70 border border-white/10 text-center flex flex-col justify-center">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase mb-2">Pergunta 3</span>
            <p className="text-base font-bold text-white">
              “E se o próprio cidadão pudesse ser os olhos de quem está longe?”
            </p>
          </div>
        </div>

        {/* A Grande Ideia: O Utilizador Também Pode Ser o Repórter */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-zinc-950/80 to-zinc-950 p-6 sm:p-10 backdrop-blur-xl mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 inline-block">
              O CONCEITO CENTRAL
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display uppercase">
              O UTILIZADOR TAMBÉM PODE SER O REPÓRTER
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Não como mero espectador passivo do país, mas como alguém que tem voz, olhos no terreno e capacidade de partilhar acontecimentos de relevo com respeito, contexto e sentido comunitário.
            </p>
          </div>
        </div>

        {/* Mecanismos de Credibilidade e Controlo (Identificados como Conceito/Futuro) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-display">
                MECANISMOS DE CREDIBILIDADE & ÉTICA
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                O cidadão-repórter não significa publicação sem controlo. A visão assenta em critérios rigorosos de fiabilidade.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 shrink-0">
              <Scale className="w-3.5 h-3.5" />
              CONCEITO & MODELO EM PROJETO
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MECHANISMS.map((m, i) => {
              const Icon = m.icon
              return (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{m.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{m.desc}</p>
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
