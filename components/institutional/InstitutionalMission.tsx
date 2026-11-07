'use client'

import React from 'react'
import { Newspaper, Users, Radio, Shield, Check, Lock, Globe } from 'lucide-react'

export function InstitutionalMission() {
  const PILLARS = [
    {
      icon: Newspaper,
      title: 'Informação',
      tag: 'Rigor & Independência',
      desc: 'Notícias e acontecimentos tratados com rigor, isenção e compromisso absoluto com o interesse público. Sem filtros de conveniência.',
      accent: 'emerald',
    },
    {
      icon: Users,
      title: 'Participação dos Cidadãos',
      tag: 'Voz Comunitária',
      desc: 'Quem está no terreno conhece o seu concelho como ninguém. Qualquer cidadão pode comunicar factos, ocorrências e alertas locais.',
      accent: 'amber',
    },
    {
      icon: Radio,
      title: 'Comunicação em Tempo Real',
      tag: 'Conexão Direta',
      desc: 'Transmissões em direto, acompanhamento minuto a minuto e alertas imediatos para manter a comunidade informada sem atrasos.',
      accent: 'teal',
    },
  ]

  return (
    <section id="missao" className="relative w-full py-16 sm:py-20 border-t border-white/10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* 2. Explicação Breve do Verdadeiro Projeto Acorda Portugal */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>O Verdadeiro Projeto</span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
              O Que É o Acorda Portugal?
            </h2>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
              O <strong className="text-white font-semibold">Acorda Portugal</strong> é uma infraestrutura cívica e descentralizada, desenhada para restabelecer a ligação entre a realidade das populações e a informação pública. Não somos um partido político nem uma redação convencional: colocamos tecnologia nas mãos dos cidadãos para observar, reportar e proteger a verdade no terreno.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left text-xs text-slate-300">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Totalmente independente e apartidário</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Proteção de fontes e canais seguros</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Globe className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Acesso livre a todos os cidadãos</span>
            </div>
          </div>
        </div>

        {/* 3. Missão: Informação, Participação e Comunicação em Tempo Real */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span>OS TRÊS PILARES</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              A Nossa Missão
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Três eixos fundamentais que orientam toda a ação e ferramentas da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {PILLARS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6 backdrop-blur-sm space-y-3 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-white/10 px-2 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {item.desc}
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

export default InstitutionalMission
