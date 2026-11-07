'use client'

import React from 'react'
import Link from 'next/link'
import { Radio, ShieldCheck, Search, Eye, FileCheck, ArrowRight, MessageSquare } from 'lucide-react'

export function InstitutionalLiveVerification() {
  const STEPS = [
    {
      num: '01',
      title: 'Triagem Inicial',
      desc: 'Catalogação do relato por distrito, relevância e urgência cívica.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Validação no Terreno',
      desc: 'Contacto direto com testemunhas e residentes locais no concelho.',
      icon: Eye,
    },
    {
      num: '03',
      title: 'Cruzamento Oficial',
      desc: 'Confrontação com dados da Proteção Civil, autarquias e entidades públicas.',
      icon: FileCheck,
    },
    {
      num: '04',
      title: 'Selo Factual',
      desc: 'Atribuição pública de selo: Verificado, Em Apuramento ou Incorreto.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="w-full space-y-16">
      
      {/* Secção de Diretos */}
      <section id="diretos" className="relative w-full py-14 sm:py-18 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>TEMPO REAL</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
              Diretos ao Vivo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Acompanhamento de acontecimentos locais em tempo real com transmissões e relatos no terreno.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left max-w-lg">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Canal Cívico em Transmissão Contínua</span>
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase">
                Cobertura Territorial Descentralizada
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Acompanhe o que está a acontecer nos 18 distritos de Portugal continental e regiões autónomas com intervenções de cidadãos e atualizações imediatas.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/comunidade"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Entrar na Comunidade em Direto</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Secção de Verificação */}
      <section id="verificacao" className="relative w-full py-14 sm:py-18 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RIGOR FACTUAL</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
              Mesa de Verificação Factual
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              O protocolo independente de confirmação em quatro etapas que protege a sociedade de boatos e desinformação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.num}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 backdrop-blur-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                    <span className="font-bold text-amber-400">{s.num}</span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              )
            })}
          </div>

        </div>
      </section>

    </div>
  )
}

export default InstitutionalLiveVerification
