'use client'

import React from 'react'
import {
  Calendar,
  Layers,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
  Users,
  Video,
  Radar,
  Sliders,
  Award,
  MapPin,
  Lock,
} from 'lucide-react'

const ECOSYSTEM_MODULES = [
  { name: 'Notícias Regionais', category: 'Informação', icon: FileSpreadsheet, desc: 'Cobertura contextualizada por concelho e distrito.' },
  { name: 'Comunidade & Fórum', category: 'Interação', icon: Users, desc: 'Espaço de partilha e diálogo construtivo entre cidadãos.' },
  { name: 'Live Repórter', category: 'Transmissão', icon: Video, desc: 'Capacidade de relato e envio de testemunhos em direto.' },
  { name: 'Radar Nacional', category: 'Monitorização', icon: Radar, desc: 'Sistematização de temas emergentes e pulsos de opinião.' },
  { name: 'Dossiês Vivos', category: 'Investigação', icon: Layers, desc: 'Registos profundos e atualizáveis sobre a realidade do país.' },
  { name: 'Mapa Nacional', category: 'Território', icon: MapPin, desc: 'Visualização geográfica de acontecimentos e dados locais.' },
  { name: 'Rádio & Áudio', category: 'Comunicação', icon: Radio, desc: 'Emissões e registos sonoros com identidade portuguesa.' },
  { name: 'Perfis de Cidadão', category: 'Identidade', icon: Users, desc: 'Registo e representação de cada membro com base no mérito.' },
  { name: 'Moderação Ética', category: 'Segurança', icon: ShieldCheck, desc: 'Regras rigorosas contra desinformação e ruído tóxico.' },
  { name: 'Segurança & Privacidade', category: 'Proteção', icon: Lock, desc: 'Proteção sólida de dados e integridade do ecossistema.' },
  { name: 'Painel Administrativo', category: 'Gestão', icon: Sliders, desc: 'Ferramentas de controlo operacional e supervisão global.' },
  { name: 'Sistemas de Confiança', category: 'Mérito', icon: Award, desc: 'Métricas de fiabilidade e reputação transparente.' },
]

export function StructuralEvolutionSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">
            <Calendar className="h-3.5 w-3.5" />
            <span>ABRIL 2026 · ESTRUTURAÇÃO DOCUMENTAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            A IDEIA COMEÇA A TORNAR-SE UM PROJETO.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            Durante o mês de abril de 2026, a visão documental do ACORDA PORTUGAL ganhou densidade e estrutura arquitetural. 
            Começou a desenhar-se um verdadeiro ecossistema integrado de módulos cívicos, informação, segurança e sistemas de confiança.
          </p>
        </div>

        {/* Grelha do Ecossistema em Formação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ECOSYSTEM_MODULES.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.name}
                className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:bg-zinc-900/80 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    {m.category}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                  {m.name}
                </h3>

                <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
                  {m.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
