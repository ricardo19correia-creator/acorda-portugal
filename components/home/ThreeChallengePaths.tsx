'use client'

import React from 'react'
import { Swords, Zap, Trophy, ChevronRight, Play } from 'lucide-react'

interface ThreeChallengePathsProps {
  onStartGame: (route: string) => void
}

export function ThreeChallengePaths({ onStartGame }: ThreeChallengePathsProps) {
  const PATHS = [
    {
      id: 'jogar',
      title: 'JOGAR',
      badge: 'EXPERIÊNCIA PRINCIPAL',
      icon: Swords,
      description: 'Testa o teu conhecimento e sobe no jogo.',
      cta: 'JOGAR',
      route: '/jogar',
      accentColor: 'emerald',
      bgGlow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
      borderStyle: 'border-emerald-500/30 group-hover:border-emerald-400/60',
      tagStyle: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      btnStyle: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30',
      iconStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'duelo',
      title: 'MULTIPLAYER',
      badge: 'MULTIJOGADOR DIRETO',
      icon: Zap,
      description: 'Enfrenta outro jogador em tempo real.',
      cta: 'DESAFIAR',
      route: '/jogar/duelo',
      accentColor: 'purple',
      bgGlow: 'bg-purple-500/10 group-hover:bg-purple-500/20',
      borderStyle: 'border-purple-500/30 group-hover:border-purple-400/60',
      tagStyle: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      btnStyle: 'bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-purple-500/30',
      iconStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'rankings',
      title: 'RANKINGS',
      badge: 'COMPETIÇÃO & DISTRITOS',
      icon: Trophy,
      description: 'Representa o teu distrito e compete pelo topo nacional.',
      cta: 'VER RANKINGS',
      route: '/rankings',
      accentColor: 'amber',
      bgGlow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      borderStyle: 'border-amber-500/30 group-hover:border-amber-400/60',
      tagStyle: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      btnStyle: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30',
      iconStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ]

  return (
    <section
      aria-label="Escolhe o Teu Desafio"
      className="w-full max-w-6xl mx-auto px-4 pt-6 sm:pt-8 pb-3 sm:pb-4 select-none"
    >
      {/* Título da Secção */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          ESCOLHE O TEU DESAFIO
        </h2>
        <div className="h-1 w-12 mx-auto mt-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400" />
      </div>

      {/* Grelha dos 3 Grandes Caminhos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {PATHS.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.id}
              onClick={() => onStartGame(item.route)}
              className={`group relative flex flex-col justify-between rounded-3xl bg-slate-950/80 backdrop-blur-xl border ${item.borderStyle} p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer overflow-hidden`}
            >
              {/* Luz ambiente de fundo ao passar o cursor */}
              <div
                className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${item.bgGlow}`}
              />

              {/* Topo do Card: Badge + Ícone */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-sm ${item.tagStyle}`}
                  >
                    {item.badge}
                  </span>

                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${item.iconStyle}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Título */}
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>

                {/* Descrição Curta */}
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* Botão de Ação do Caminho */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 w-full py-3 sm:py-3.5 px-4 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md ${item.btnStyle} active:scale-95`}
                >
                  <span>{item.cta}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
