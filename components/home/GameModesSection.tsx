'use client'

import React from 'react'
import { Play, Swords, MapPin, Building2, Laugh, Eye, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'

interface GameModesSectionProps {
  onStartGame: (route: string) => void
}

export function GameModesSection({ onStartGame }: GameModesSectionProps) {
  return (
    <section
      id="modos-de-jogo"
      aria-label="Modos de jogo"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header da Secção */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARENAS & DESAFIOS</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          COMO QUERES JOGAR?
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Escolhe a tua modalidade e entra diretamente no universo competitivo.
        </p>
      </div>

      {/* Grid com Hierarquia de Videojogo */}
      <div className="space-y-6">
        {/* 1. GRANDE DESTAQUE: MODO PRINCIPAL (JOGAR) */}
        <div
          onClick={() => onStartGame('/jogar?cat=desafio-nacional')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar?cat=desafio-nacional')}
          className="group relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-slate-950 border-2 border-emerald-500/60 hover:border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
          {/* Luz de fundo do destaque */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -z-10 group-hover:bg-emerald-500/25 transition-all" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                  ★ EXPERIÊNCIA PRINCIPAL
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  10 Perguntas • 60s
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <Play className="w-7 h-7 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                    JOGAR
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
                    Desafio Nacional de Portugal
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                A ronda clássica de conhecimento geral sobre Portugal: história, geografia, sociedade, cultura e património nacional. Sem demoras, entra e joga de imediato.
              </p>
            </div>

            {/* CTA Embutido no Destaque */}
            <div className="shrink-0">
              <div className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-all">
                <span>JOGAR AGORA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. OS 3 MODOS COMPETITIVOS E TERRITORIAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* MODO: 1V1 */}
          <div
            onClick={() => onStartGame('/jogar/duelo')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar/duelo')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-slate-950 border-2 border-purple-500/40 hover:border-purple-400 shadow-lg hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  TEMPO REAL
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Swords className="w-5 h-5" />
                </div>
              </div>

              <h4 className="font-display font-black text-2xl uppercase text-white tracking-wide group-hover:text-purple-300 transition-colors">
                1V1
              </h4>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mt-0.5">
                Dois jogadores. Um confronto.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Enfrenta outro jogador individualmente. Mesmas perguntas, mesmo tempo. Quem responder melhor e mais rápido sobe no ranking Elo.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-300">
              <span className="font-mono text-[11px] text-slate-400">Liga Elo Nacional</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                ENTRAR NO 1V1 ➔
              </span>
            </div>
          </div>

          {/* MODO: MEU DISTRITO */}
          <div
            onClick={() => onStartGame('/meu-distrito')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStartGame('/meu-distrito')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SOBERANIA
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>

              <h4 className="font-display font-black text-2xl uppercase text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                MEU DISTRITO
              </h4>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mt-0.5">
                Representa o teu território.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Joga pelo teu distrito natal. Cada resposta correta protege os teus concelhos e soma pontos para a Guerra dos Distritos.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="font-mono text-[11px] text-slate-400">Guerra dos Distritos</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                DEFENDER TERRA ➔
              </span>
            </div>
          </div>

          {/* MODO: DESAFIO DA CIDADE */}
          <div
            onClick={() => onStartGame('/desafio-cidade')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStartGame('/desafio-cidade')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-950/70 via-slate-900/90 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CONCELHOS
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <h4 className="font-display font-black text-2xl uppercase text-white tracking-wide group-hover:text-amber-300 transition-colors">
                DESAFIO DA CIDADE
              </h4>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mt-0.5">
                Compete localmente.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Perguntas focadas na história, lendas, gastronomia e tradições do teu concelho específico. Prova que conheces a tua terra melhor que ninguém.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="font-mono text-[11px] text-slate-400">308 Concelhos</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                JOGAR CIDADE ➔
              </span>
            </div>
          </div>
        </div>

        {/* 3. MODOS ESPECIAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MODO MALUCO */}
          <div
            onClick={() => onStartGame('/jogar?cat=modo-maluco')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar?cat=modo-maluco')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-950/70 via-slate-900/90 to-slate-950 border-2 border-rose-500/40 hover:border-rose-400 shadow-lg hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Laugh className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                  MODO ESPECIAL
                </span>
                <h4 className="font-display font-black text-xl sm:text-2xl uppercase text-white tracking-wide group-hover:text-rose-300 transition-colors">
                  MODO MALUCO
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  Humor absurdo, armadilhas culturais, memes e raciocínio fora da caixa.
                </p>
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-rose-300 group-hover:translate-x-1 transition-all shrink-0 ml-3">
              →
            </span>
          </div>

          {/* DESAFIO VISUAL */}
          <div
            onClick={() => onStartGame('/jogar?cat=desafio-visual')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStartGame('/jogar?cat=desafio-visual')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-950/70 via-slate-900/90 to-slate-950 border-2 border-blue-500/40 hover:border-blue-400 shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                  MODO ESPECIAL
                </span>
                <h4 className="font-display font-black text-xl sm:text-2xl uppercase text-white tracking-wide group-hover:text-blue-300 transition-colors">
                  DESAFIO VISUAL
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  Reconhece monumentos, bandeiras, brasões e detalhe fotográfico de Portugal.
                </p>
              </div>
            </div>
            <span className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all shrink-0 ml-3">
              →
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
