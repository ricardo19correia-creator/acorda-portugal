'use client'

import React from 'react'
import { Flame, Clock, Award, Play } from 'lucide-react'
import { EVENTS } from '@/lib/game-data'

interface FeaturedChallengeSectionProps {
  onStartGame: (route: string) => void
}

export function FeaturedChallengeSection({ onStartGame }: FeaturedChallengeSectionProps) {
  // Obter o primeiro evento oficial ativo do sistema real
  const featured = EVENTS && EVENTS.length > 0 ? EVENTS[0] : null

  // REGRA ESTRITA: Se não houver evento disponível, NÃO criar dados falsos — remover secção completamente
  if (!featured) {
    return null
  }

  const targetRoute = '/jogar?cat=desafio-nacional'

  return (
    <section
      aria-label="Desafio em Destaque"
      className="w-full max-w-5xl mx-auto px-4 py-6 select-none"
    >
      <div className="relative rounded-2xl bg-slate-950/70 border border-amber-500/30 backdrop-blur-xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Luz subtil dourada */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Lado Esquerdo: Tag, Título e Recompensa */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DESAFIO EM DESTAQUE
                </span>
                {featured.timeLeft && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {featured.timeLeft}
                  </span>
                )}
              </div>

              <h3 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-white">
                {featured.title}
              </h3>

              {featured.reward && (
                <p className="text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Recompensa: {featured.reward}</span>
                </p>
              )}
            </div>
          </div>

          {/* Lado Direito: CTA de Jogo */}
          <div className="w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => onStartGame(targetRoute)}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>JOGAR</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
