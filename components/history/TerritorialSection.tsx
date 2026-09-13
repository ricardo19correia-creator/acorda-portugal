'use client'

import React from 'react'
import { MapPin, Flag, Compass, ChevronRight, Shield } from 'lucide-react'

const TIERS = [
  {
    level: '01',
    title: 'CIDADE',
    desc: 'O ponto de origem do jogador, as suas raízes e a sua localidade imediata.',
    accent: 'from-teal-500/20 to-teal-500/5 border-teal-500/30 text-teal-400',
  },
  {
    level: '02',
    title: 'CONCELHO',
    desc: 'A proximidade territorial e a ligação às tradições e património vizinho.',
    accent: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
  },
  {
    level: '03',
    title: 'DISTRITO',
    desc: 'O bastião soberano de competição: 18 distritos e as Regiões Autónomas dos Açores e Madeira.',
    accent: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400',
  },
  {
    level: '04',
    title: 'PORTUGAL',
    desc: 'A grande arena unificada onde todo o país se junta em torno do conhecimento nacional.',
    accent: 'from-emerald-500/30 to-emerald-500/10 border-emerald-500/40 text-emerald-300',
  },
]

export function TerritorialSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>DIMENSÃO TERRITORIAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            PORTUGAL ENTROU NO JOGO.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            A dimensão territorial sempre foi uma das características que diferenciou o conceito desde a génese. O jogador não responde apenas por si. Existe uma dimensão coletiva: <strong className="text-emerald-400 font-semibold">a sua região também joga</strong>.
          </p>
        </div>

        {/* Progressão Territorial Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {TIERS.map((tier, idx) => (
            <div
              key={tier.title}
              className={`rounded-3xl border bg-gradient-to-b ${tier.accent} p-6 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-black tracking-widest text-zinc-400">
                    ESCALÃO {tier.level}
                  </span>
                  {idx < TIERS.length - 1 ? (
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <Flag className="h-4 w-4 text-emerald-400" />
                  )}
                </div>

                <h3 className="font-display text-xl font-black tracking-wide text-white">
                  {tier.title}
                </h3>

                <p className="mt-3 text-xs text-zinc-300 leading-relaxed font-normal">
                  {tier.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>Pertença & Orgulho</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem de Pertença Regional */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 backdrop-blur-xl text-center">
          <div className="inline-flex items-center gap-2 text-xs text-amber-400 font-mono uppercase tracking-wider mb-2">
            <Shield className="h-4 w-4" />
            <span>Honra e Representação</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Cada resposta certa soma pontuação e prestígio ao distrito do jogador, criando uma rivalidade saudável e fraterna entre todas as terras de Portugal.
          </p>
        </div>
      </div>
    </section>
  )
}
