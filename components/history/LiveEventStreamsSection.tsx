'use client'

import React from 'react'
import {
  Radio,
  Video,
  Eye,
  MapPin,
  ArrowRight,
  Sparkles,
  Cast,
} from 'lucide-react'

const STREAM_STEPS = [
  { step: '01', title: 'VER', desc: 'Presenciar um acontecimento com impacto ou relevância pública.' },
  { step: '02', title: 'ESTAR NO LOCAL', desc: 'A autenticidade de quem vive a realidade diretamente no terreno.' },
  { step: '03', title: 'TRANSMITIR', desc: 'Abrir a aplicação e iniciar um direto com geolocalização ativa.' },
  { step: '04', title: 'INFORMAR', desc: 'Contextualizar os factos com honestidade e dignidade cívica.' },
  { step: '05', title: 'COMUNIDADE ACOMPANHA', desc: 'O país inteiro pode sintonizar e acompanhar o momento em direto.' },
]

export function LiveEventStreamsSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-rose-400 mb-4">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>05 — DIRETOS DO ACONTECIMENTO</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            TRANSMISSÕES AO VIVO A PARTIR DO LOCAL
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            A essência do verdadeiro Acorda Portugal ganha toda a sua força no momento em que a imagem e a voz no terreno se tornam imediatas para toda a comunidade.
          </p>
        </div>

        {/* Simulador Cinematográfico de Ecrã de Direto */}
        <div className="relative rounded-3xl border border-rose-500/30 bg-gradient-to-b from-zinc-950 via-slate-950 to-zinc-950 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl mb-14 overflow-hidden">
          {/* Tag de LIVE pulsante */}
          <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white font-mono text-xs font-black uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                DIRETO
              </span>
              <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
                TRANSMISSÃO EM TEMPO REAL
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Eye className="w-4 h-4" />
              <span>A COMUNIDADE EM DIRETO</span>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto py-6">
            <p className="font-display text-xl sm:text-3xl font-black text-white leading-snug uppercase">
              “Tu podes estar onde a notícia está a acontecer.<br />
              <span className="text-rose-400">Tu podes ser a primeira pessoa a mostrar ao país o que se está a passar.”</span>
            </p>
            <p className="text-sm text-zinc-400 mt-4 leading-relaxed">
              Não se trata apenas de redigir uma notícia após o fecho do dia. Trata-se da vivência imediata, da transparência e da proximidade de quem está efetivamente lá.
            </p>
          </div>
        </div>

        {/* O Fluxo: VER -> ESTAR NO LOCAL -> TRANSMITIR -> INFORMAR -> A COMUNIDADE ACOMPANHA */}
        <div>
          <div className="text-center mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block">
              O FLUXO DA INFORMAÇÃO PARTICIPATIVA
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-1">
              DA TESTEMUNHA AO PAÍS EM SEGUNDOS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {STREAM_STEPS.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between text-center group hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all"
              >
                <div>
                  <span className="text-xs font-mono font-black text-emerald-400 block mb-1">
                    {s.step}
                  </span>
                  <h4 className="font-bold text-sm text-white font-display">{s.title}</h4>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
