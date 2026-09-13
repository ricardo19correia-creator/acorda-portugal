'use client'

import React from 'react'
import {
  Compass,
  Radio,
  Newspaper,
  Users,
  Map,
  Video,
  FileText,
  Radar,
  MessageSquareShare,
  Layers,
} from 'lucide-react'

const CONCEPTS = [
  { icon: Newspaper, title: 'Informação & Notícias', desc: 'Foco no rigor, contexto real e proximidade regional.' },
  { icon: Users, title: 'Comunidade Cívica', desc: 'Espaço de união, partilha e dignificação dos cidadãos.' },
  { icon: Map, title: 'Mapa Nacional', desc: 'Visualização viva do território de norte a sul e ilhas.' },
  { icon: Video, title: 'Transmissões em Direto', desc: 'Cobertura em tempo real dos acontecimentos locais.' },
  { icon: Radio, title: 'Rádio & Voz', desc: 'Comunicação sonora e identidade cultural falada.' },
  { icon: MessageSquareShare, title: 'Participação dos Cidadãos', desc: 'Espaço onde cada região tinha representação ativa.' },
  { icon: FileText, title: 'Dossiês Vivos', desc: 'Documentação aprofundada de temas estruturantes do país.' },
  { icon: Radar, title: 'Radar Nacional', desc: 'Mapeamento de pulso e tendências comunitárias.' },
]

export function OriginalVisionSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Secção */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">
            <Compass className="h-3.5 w-3.5" />
            <span>VISÃO ORIGINAL · FASE CONCEPTUAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            PRIMEIRO EXISTIA UMA IDEIA.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            A visão original do <strong className="text-emerald-400 font-semibold">ACORDA PORTUGAL</strong> era muito mais ampla do que um jogo.
            Concebida conceptualmente e documentada em detalhe, a ideia inicial imaginava uma plataforma nacional dedicada a aproximar os portugueses através de informação transparente, acontecimentos locais e participação cívica ativa.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300/90 font-medium">
            <Layers className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
            <span>Registo Histórico: Esta fase assentou em conceção e planeamento documental, não tendo sido lançada como aplicação pública.</span>
          </div>
        </div>

        {/* Composição Visual de Conceitos Ligados Entre Si */}
        <div className="relative">
          {/* Fundo subtil em rede */}
          <div className="absolute inset-0 bg-radial from-teal-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {CONCEPTS.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-teal-500/40 hover:bg-zinc-900/80 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      CONCEITO
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                    {c.title}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed font-normal">
                    {c.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
