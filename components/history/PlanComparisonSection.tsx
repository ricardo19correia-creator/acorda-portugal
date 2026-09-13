'use client'

import React from 'react'
import { ArrowDown, CheckCircle, Sparkles, ScrollText, Gamepad2 } from 'lucide-react'

const MASTER_PLAN_ITEMS = [
  'Quiz Geral',
  'Cidades',
  'Distritos',
  'XP Básico',
  'Rankings Teóricos',
  'Duelos Conceituais',
  'Loja Planeada',
  'Comunidades',
  'Temporadas',
]

const CURRENT_GAME_ITEMS = [
  { name: 'Categorias Temáticas', desc: 'História, Geografia, Gastronomia, Tradições, Música, etc.' },
  { name: 'Perguntas Verificadas', desc: 'Mais de 10.000 questões com auditoria cultural portuguesa' },
  { name: 'Progressão de XP', desc: 'Cálculo dinâmico por acerto, velocidade e bónus' },
  { name: 'Níveis & Títulos RPG', desc: 'De Curioso a Lenda de Portugal com escalões de honra' },
  { name: 'Acordas (Economia)', desc: 'Moeda canónica conquistada por mérito de jogo' },
  { name: 'Loja de Cosméticos', desc: 'Catálogo curado com identidade e símbolos nacionais' },
  { name: 'Avatares Temáticos', desc: 'Figuras históricas e ícones contemporâneos ilustrados' },
  { name: 'Molduras Dinâmicas', desc: 'Efeitos visuais animados para personalização de perfil' },
  { name: 'Títulos Equipáveis', desc: 'Distinções de prestígio visíveis em toda a rede' },
  { name: 'Arenas Portuguesas', desc: 'Cenários imersivos (Ponte 25 de Abril, Alfama, Vulcão, etc.)' },
  { name: 'Arsenal de 3 Ajudas', desc: '50:50, Congelar Tempo 15s e Ajuda do Público' },
  { name: 'Desafios Especiais', desc: 'Modo Maluco frenético, Desafio Cidade e Desafio Visual' },
  { name: 'Rankings em Tempo Real', desc: 'Pódio nacional, filtros diários, semanais e históricos' },
  { name: 'Soberania Distrital', desc: '18 distritos e regiões autónomas (Açores e Madeira)' },
  { name: 'Multiplayer & Duelos 1v1', desc: 'Matchmaking dinâmico em tempo real com confronto direto' },
  { name: 'Conquistas & Troféus', desc: 'Desbloqueios de prestígio por marcas de conhecimento' },
  { name: 'Missões Diárias', desc: 'Metas rotativas para envolvimento regular da comunidade' },
  { name: 'Eventos Especiais', desc: 'Competições temáticas dedicadas a efemérides nacionais' },
  { name: 'Mapa Nacional Vivo', desc: 'Cartografia interativa com calor e presença de jogadores' },
]

export function PlanComparisonSection() {
  return (
    <section className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ANÁLISE COMPARATIVA</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            “O PLANO CRESCEU.”
          </h2>

          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 font-normal leading-relaxed">
            Uma comparação direta e transparente entre a especificação inicial do Master Plan e o universo completo de sistemas implementados e verificados no código atual.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Caixa 1: No Master Plan */}
          <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-400">
                <ScrollText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                  ORIGEM CONCEPTUAL
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  NO MASTER PLAN
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {MASTER_PLAN_ITEMS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-zinc-300"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-zinc-500 italic">
              9 pilares concebidos originalmente no papel.
            </div>
          </div>

          {/* Seta de Transição */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center self-center text-emerald-400">
            <div className="h-12 w-0.5 bg-gradient-to-b from-zinc-700 to-emerald-500" />
            <div className="my-2 p-2 rounded-full border border-emerald-500/40 bg-emerald-500/10">
              <ArrowDown className="h-5 w-5" />
            </div>
            <div className="h-12 w-0.5 bg-gradient-to-b from-emerald-500 to-zinc-700" />
          </div>

          {/* Caixa 2: No Jogo Atual */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-emerald-500/40 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Gamepad2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                    CÓDIGO & SISTEMAS VERIFICADOS
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">
                    NO JOGO ATUAL
                  </h3>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                19+ Sistemas Ativos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENT_GAME_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 backdrop-blur-md hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <h4 className="font-display text-xs font-bold text-white">
                      {item.name}
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-snug pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20 text-center text-xs text-emerald-300/80 font-medium">
              Todos os sistemas acima estão ativamente em produção no código da aplicação.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
