'use client'

import React from 'react'
import {
  ShieldAlert,
  ArrowDown,
  CheckCircle2,
  Award,
  Sparkles,
  Info,
} from 'lucide-react'

const TRUST_STEPS = [
  { level: 'NÍVEL 1', title: 'NOVO', desc: 'Entrada na plataforma com privilégios moderados e verificação inicial.' },
  { level: 'NÍVEL 2', title: 'ATIVIDADE VALIDADA', desc: 'Participação consequente e histórico sem infrações éticas.' },
  { level: 'NÍVEL 3', title: 'COLABORADOR FIÁVEL', desc: 'Contribuições com impacto cívico e reconhecimento pela comunidade.' },
  { level: 'NÍVEL 4', title: 'CONFIANÇA SÓLIDA', desc: 'Autoridade comunitária consolidada e moderação descentralizada.' },
  { level: 'NÍVEL 5', title: 'ELEGÍVEL PARA DESTAQUE', desc: 'Voz de referência máxima para curadoria e iniciativas de grande alcance.' },
]

const TRUST_SYSTEMS = [
  'Pontuação Transparente',
  'Ranking de Mérito',
  'Níveis de Confiança',
  'Badges de Contribuição',
  'Estatutos Não Comerciais',
  'Reputação Orgânica',
  'Recompensas Cívicas',
  'Moderação Colaborativa',
]

export function CommunityTrustSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
            <Award className="h-3.5 w-3.5" />
            <span>ARQUITETURA CÍVICA · SISTEMA ORIGINAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            UMA COMUNIDADE PRECISAVA DE CONFIANÇA.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            A lógica do sistema comunitário original era clara: reconhecer a contribuição real, sem vender credibilidade e sem transformar estatutos em produtos compráveis.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-400">
            <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Nota Importante: Esta progressão pertencia à visão da rede comunitária inicial e distingue-se dos níveis RPG do jogo atual.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Escada de Confiança Conceptual */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>A Progressão Conceptual de Confiança</span>
            </h3>

            {TRUST_STEPS.map((step, idx) => (
              <div key={step.title} className="flex flex-col">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 backdrop-blur-xl transition-all duration-200 hover:border-amber-500/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {step.level}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-amber-400/60" />
                  </div>
                  <h4 className="mt-2 font-display text-sm sm:text-base font-bold text-white tracking-wide">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-400 font-normal">
                    {step.desc}
                  </p>
                </div>
                {idx < TRUST_STEPS.length - 1 && (
                  <div className="flex justify-center py-1 text-amber-500/40">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pilares de Mérito e Segurança */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
              <h3 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                <span>Mecanismos Documentados</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                Nenhum selo ou destaque podia ser adquirido por meios financeiros. Todo o estatuto era conquistado exclusivamente por ação comprovada e integridade comunitária.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TRUST_SYSTEMS.map((sys) => (
                  <div
                    key={sys}
                    className="flex items-center gap-2 rounded-xl bg-black/40 border border-white/5 px-3 py-2 text-xs font-medium text-zinc-300"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{sys}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
