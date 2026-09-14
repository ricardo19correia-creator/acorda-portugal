'use client'

import React from 'react'
import {
  ShieldAlert,
  Smartphone,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  Radio,
  FileCheck,
} from 'lucide-react'

const CAPABILITIES = [
  {
    title: 'Acompanhar Notícias e Acontecimentos',
    status: 'CONCEITO CENTRAL',
    statusClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    desc: 'Receber informação de factos verificados em todo o território nacional.',
  },
  {
    title: 'Transmissões em Direto do Terreno',
    status: 'VISÃO / FUTURO',
    statusClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    desc: 'Possibilidade de qualquer cidadão iniciar uma emissão ao vivo a partir do local do acontecimento.',
  },
  {
    title: 'Alertas Geolocalizados de Proximidade',
    status: 'VISÃO / FUTURO',
    statusClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    desc: 'Notificações automáticas quando algo de relevo estiver a acontecer perto da sua localização.',
  },
  {
    title: 'Plataforma Web e Contas de Utilizador',
    status: 'DISPONÍVEL HOJE',
    statusClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    desc: 'Infraestrutura com autenticação segura, perfis de jogador, histórico e base de dados em nuvem.',
  },
  {
    title: 'Desafio Nacional de Conhecimento',
    status: 'DISPONÍVEL HOJE',
    statusClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    desc: 'O jogo oficial em produção com milhares de perguntas, rankings e competição territorial ativa.',
  },
  {
    title: 'Aplicação Móvel Unificada de Informação',
    status: 'CONCEITO / ROADMAP',
    statusClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    desc: 'A convergência futura de todo o universo num aplicativo móvel nativo de referência cívica.',
  },
]

export function TrueAcordaPortugalSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Smartphone className="h-3.5 w-3.5" />
            <span>07 — A MATRIZ DE ORIGEM</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            O VERDADEIRO ACORDA PORTUGAL
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Esta é a visão principal e original do projeto: uma aplicação móvel focada na vivência real do país. O jogo que hoje tantos jogam nasceu a partir desta mesma semente, mas a raiz original é a informação e a proximidade cívica.
          </p>
        </div>

        {/* Matriz de Transparência Rigorosa */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
            <div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white">
                MATRIZ DE TRANSPARÊNCIA: REALIDADE vs VISÃO
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Sem invenções e sem promessas falsas. A separação honesta entre o que está construído e o que é visão de futuro.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESTADO REAL DO PROJETO</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAPABILITIES.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-3 hover:border-white/15 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${c.statusClass}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{c.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
