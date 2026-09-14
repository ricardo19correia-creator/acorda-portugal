'use client'

import React from 'react'
import {
  Users2,
  Check,
  Building2,
  Globe2,
  ArrowRight,
  Handshake,
} from 'lucide-react'

export function CommunityInformationSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do Capítulo */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-teal-400 mb-4">
            <Users2 className="h-3.5 w-3.5" />
            <span>06 — O CIDADÃO COMO PARTE ATIVA</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            NÃO É APENAS CONSUMIR NOTÍCIAS. É PARTICIPAR NA INFORMAÇÃO.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
            Durante décadas, a relação das pessoas com a informação foi estritamente unidirecional: assistir de forma distante àquilo que outros decidiram reportar. O Acorda Portugal nasceu para quebrar essa passividade.
          </p>
        </div>

        {/* Comparação dos Modelos: Tradicional vs Acorda Portugal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Modelo Tradicional */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                MODELO CONVENCIONAL
              </span>
              <h3 className="text-lg font-bold text-white mb-4">Unidirecional & Centralizado</h3>
              <div className="space-y-2.5 font-mono text-xs text-zinc-300">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <span className="text-zinc-500 font-bold">1.</span> Acontecimento Ocorre
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <span className="text-zinc-500 font-bold">2.</span> Deslocação de Equipa / Jornalista
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <span className="text-zinc-500 font-bold">3.</span> Filtragem na Redação Central
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <span className="text-zinc-500 font-bold">4.</span> Emissão / Noticiário Horas Mais Tarde
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-zinc-400">
                  <span className="text-zinc-500 font-bold">5.</span> Público Assiste Passivamente
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-6 pt-4 border-t border-white/5">
              Distante do momento e condicionado pela escala de prioridades das redações centrais.
            </p>
          </div>

          {/* Conceito Acorda Portugal */}
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                O CONCEITO ACORDA PORTUGAL
              </span>
              <h3 className="text-lg font-bold text-white mb-4">Participativo, Imediato & Transparente</h3>
              <div className="space-y-2.5 font-mono text-xs text-emerald-100">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">1.</span> Acontecimento Ocorre
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">2.</span> Cidadão Presente no Local
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">3.</span> Direto & Notificação de Proximidade
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">4.</span> Comunidade Acompanha e Contextualiza
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="text-emerald-400 font-bold">5.</span> Informação Viva, Aberta e Verificada
                </div>
              </div>
            </div>
            <p className="text-xs text-emerald-300/80 mt-6 pt-4 border-t border-emerald-500/20">
              O cidadão no terreno passa a ter voz e capacidade de informar os seus concidadãos.
            </p>
          </div>
        </div>

        {/* Nota Ética de Complementaridade */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Princípio da Complementaridade com o Jornalismo</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                ÉTICA FUNDAMENTAL
              </span>
            </h4>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              O Acorda Portugal nunca pretendeu substituir os jornalistas nem a função insubstituível da imprensa profissional. Pelo contrário: a visão é de sinergia mútua — onde o relato factual e imediato dos cidadãos no local complementa e enriquece a análise, investigação e rigor dos profissionais de comunicação.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
