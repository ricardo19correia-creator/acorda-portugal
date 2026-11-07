'use client'

import React from 'react'
import Link from 'next/link'
import {
  Radio,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export function InstitutionalLiveVerification() {
  const PROTOCOL_STEPS = [
    {
      step: '01',
      title: 'Deteção & Triagem Inicial',
      desc: 'Os relatos submetidos por cidadãos ou detetados em canais públicos são catalogados por distrito, concelho e grau de urgência cívica.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Confirmação no Terreno',
      desc: 'Contacto direto com residentes, correspondentes voluntários e testemunhas locais para confirmar a veracidade física da ocorrência.',
      icon: Eye,
    },
    {
      step: '03',
      title: 'Confrontação com Dados Oficiais',
      desc: 'Cruzamento com comunicados da Proteção Civil, entidades hospitalares, autarquias, IPMA e documentos em Diário da República.',
      icon: FileCheck,
    },
    {
      step: '04',
      title: 'Classificação & Emissão de Selo',
      desc: 'Atribuição pública de selo de rigor: Verificado, Em Apuramento ou Incorreto, com disponibilização transparente das fontes apuradas.',
      icon: ShieldCheck,
    },
  ]

  return (
    <section id="diretos" className="relative w-full py-16 sm:py-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Secção */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>COMUNICAÇÃO EM TEMPO REAL & RIGOR</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            Diretos ao Vivo & Verificação Factual
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Como operam os nossos canais de emissão em direto e o protocolo independente de fact-checking que protege os portugueses da desinformação.
          </p>
        </div>

        {/* Bloco 1: Ecrã de Emissão & Plantão Cívico */}
        <div className="mt-12 rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Esquerda: Ecrã de Estúdio / Monitor */}
            <div className="w-full lg:w-1/2 rounded-2xl border border-white/15 bg-black/60 p-5 sm:p-6 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="font-mono font-bold uppercase tracking-wider text-emerald-300 text-[11px]">
                    Central de Emissão Cívica
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">Em Linha • 24/7</span>
              </div>

              <div className="aspect-video w-full rounded-xl bg-slate-950/90 border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <Radio className="w-7 h-7" />
                </div>
                <h4 className="font-display font-black text-white text-base sm:text-lg uppercase tracking-tight">
                  Canal Nacional de Diretos
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  Transmissão contínua de alertas territoriais, conferências de interesse público e debates com a comunidade.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                  <span>Modo de Plantão Ativo</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Transmissão institucional aberta</span>
                <Link
                  href="/comunidade"
                  className="font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Debater em Direto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Direita: Explicação do Papel dos Diretos */}
            <div className="w-full lg:w-1/2 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
                  Cobertura Sem Intermediários
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  A verdade dos factos transmitida em tempo real
                </h3>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Quando ocorrem eventos de grande impacto em Portugal — intempéries, crises nos serviços públicos, manifestações ou decisões legislativas cruciais —, o Acorda Portugal mobiliza os seus canais diretos para assegurar informação transparente aos portugueses.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Alertas Prioritários</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Notificação em tempo real sobre situações de risco civil ou alterações de serviços essenciais.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Interação Aberta com o Público</h5>
                    <p className="text-xs text-slate-300 mt-0.5">Os cidadãos colocam perguntas em direto e partilham atualizações do que veem nas suas ruas e aldeias.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bloco 2: O Protocolo de Verificação (Fact-Checking Cívico) */}
        <div className="mt-16 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              O Protocolo de Verificação Factual
            </h3>
            <p className="text-sm text-slate-300">
              Quatro etapas estritas para garantir que nenhuma informação incorreta ou boato sem fundamento é propagado na rede nacional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROTOCOL_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.step}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-emerald-400">
                        {step.step}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                        <Icon className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <h4 className="font-display font-black text-base text-white uppercase tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conformidade Cívica</span>
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
