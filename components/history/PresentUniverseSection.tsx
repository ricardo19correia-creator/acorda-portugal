'use client'

import React from 'react'
import {
  Gamepad2,
  Trophy,
  TrendingUp,
  Palette,
  Compass,
  Flag,
  Sparkles,
  CheckCircle,
} from 'lucide-react'

const PILLARS = [
  {
    icon: Gamepad2,
    group: 'JOGAR',
    tagline: 'Mecânicas de Ação Imediata',
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    features: [
      'Quiz Temático por Categorias',
      'Modo Maluco com Tempo Acelerado',
      'Desafio Cidade & Desafio Visual',
      'Arenas Visuais Imersivas de Portugal',
      'Arsenal de 3 Ajudas (50:50, Tempo, Público)',
    ],
  },
  {
    icon: Trophy,
    group: 'COMPETIR',
    tagline: 'Rivalidade e Confronto Direto',
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    features: [
      'Duelos 1v1 em Tempo Real com Matchmaking',
      'Pódios Nacionais Diários e Semanais',
      'Classificação Histórica Global',
      'Batalhas de Pontuação Distrital',
      'Estatísticas de Vitórias e Precisão',
    ],
  },
  {
    icon: TrendingUp,
    group: 'PROGREDIR',
    tagline: 'Jornada e Níveis de RPG',
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    features: [
      'Níveis de Jogador com Fórmulas de XP',
      'Escalões de Títulos de Curioso a Lenda',
      'Conquistas com Recompensas Próprias',
      'Missões Diárias Desafiantes',
      'Acumulação de Moedas por Mérito',
    ],
  },
  {
    icon: Palette,
    group: 'PERSONALIZAR',
    tagline: 'Identidade e Cosméticos Portugueses',
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    features: [
      'Loja Oficial de Cosméticos Culturais',
      'Catálogo de Avatares Ilustrados',
      'Molduras Animadas com Efeitos Visuais',
      'Títulos de Honra Equipáveis no Perfil',
      'Símbolos e Insígnias Regionais',
    ],
  },
  {
    icon: Compass,
    group: 'EXPLORAR',
    tagline: 'Cartografia Viva e Partilha',
    color: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
    features: [
      'Mapa Nacional Interativo com Presença ao Vivo',
      'Comunidade de Criadores e Sugestões',
      'Arquivo e Dicionário Cultural Integrado',
      'Central de Ajuda e Suporte Completo',
      'Aplicação Nativa Android (APK)',
    ],
  },
  {
    icon: Flag,
    group: 'REPRESENTAR PORTUGAL',
    tagline: 'Orgulho e Soberania Distrital',
    color: 'border-red-500/30 bg-red-500/10 text-red-400',
    features: [
      'Soberania dos 18 Distritos e Regiões Autónomas',
      'Arena Distrital Exclusiva (Meu Distrito)',
      '10.000+ Perguntas Auditadas de Portugal',
      'História, Tradições, Gastronomia e Património',
      'Celebração Fraterna da Identidade Portuguesa',
    ],
  },
]

export function PresentUniverseSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>O ECOSSISTEMA ATUAL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            E A IDEIA CONTINUOU A CRESCER.
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            Isto começou como um plano e tornou-se um universo vivo. Hoje, os sistemas do ACORDA PORTUGAL articulam-se em seis grandes pilares em produção contínua.
          </p>
        </div>

        {/* Os 6 Grandes Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.group}
                className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-zinc-900/80 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${p.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      PILAR OFICIAL
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-black text-white tracking-wide">
                    {p.group}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    {p.tagline}
                  </p>

                  <div className="mt-5 space-y-2">
                    {p.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-zinc-300 leading-snug font-normal">
                          {feat}
                        </span>
                      </div>
                    ))}
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
