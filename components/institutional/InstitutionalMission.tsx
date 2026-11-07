'use client'

import React from 'react'
import {
  Shield,
  MapPin,
  CheckCircle,
  Zap,
  Users,
  Eye,
  Building2,
  HeartHandshake,
} from 'lucide-react'

export function InstitutionalMission() {
  const PILLARS = [
    {
      icon: Shield,
      title: 'Independência Editorial & Cívica',
      description:
        'Não recebemos subvenções partidárias, não temos agendas corporativas e não dependemos de grupos de pressão. O nosso único compromisso é com a fidelidade aos factos e o bem comum dos cidadãos.',
      accent: 'emerald',
    },
    {
      icon: MapPin,
      title: 'Descentralização da Informação',
      description:
        'Portugal não termina nos grandes centros urbanos. Damos voz aos concelhos do interior, às comunidades rurais, aos arquipélagos dos Açores e da Madeira e aos portugueses pelo mundo.',
      accent: 'amber',
    },
    {
      icon: CheckCircle,
      title: 'Verificação Colaborativa Rigorosa',
      description:
        'Num ecossistema saturado de desinformação, cada alerta ou ocorrência passa por validação documental e confirmação com cidadãos no terreno antes de ser promovido a facto verificado.',
      accent: 'emerald',
    },
    {
      icon: Zap,
      title: 'Comunicação em Tempo Real',
      description:
        'A informação crítica — de alertas meteorológicos a ocorrências de segurança, decisões municipais e movimentos cívicos — deve chegar aos cidadãos sem barreiras, atrasos ou censura.',
      accent: 'amber',
    },
  ]

  return (
    <section id="missao" className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-transparent via-[#091528]/60 to-transparent border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho da Secção */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <span>A NOSSA MISSÃO</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight">
            Por que nasce o Acorda Portugal?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Um pacto nacional entre cidadãos para restaurar a verdade, a transparência e a responsabilidade coletiva na sociedade portuguesa.
          </p>
        </div>

        {/* Manifesto em Destaque */}
        <div className="mt-12 rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          
          <div className="max-w-4xl mx-auto space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            <p className="text-lg sm:text-xl font-bold text-white leading-snug">
              «Quando a informação falha, o país adormece. Quando os cidadãos se unem para observar, relatar e exigir transparência, a democracia fortalece-se.»
            </p>
            <p className="text-slate-300">
              O distanciamento entre as estruturas centrais e as necessidades concretas das populações criou um fosso de confiança. Acreditamos que a solução não passa pelo silêncio nem pela desinformação das redes sociais, mas pela <strong>construção de uma rede cívica informada, vigilante e participativa</strong>.
            </p>
            <p className="text-slate-300">
              O Acorda Portugal coloca a tecnologia ao serviço das pessoas: permitindo a cada habitante partilhar ocorrências da sua terra, confrontar dados oficiais com a realidade do terreno e construir um arquivo vivo da verdade em Portugal.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Iniciativa Cívica de Interesse Público
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" />
              Observação Cívica Independente
            </span>
            <span className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              Compromisso com Todos os Portugueses
            </span>
          </div>
        </div>

        {/* Quatro Pilares */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((p, idx) => {
            const Icon = p.icon
            const isEmerald = p.accent === 'emerald'
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-md hover:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      isEmerald
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/25'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-black uppercase text-white tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
