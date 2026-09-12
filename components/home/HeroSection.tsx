'use client'

import React from 'react'
import { Play, Compass, Users, MapPin, Trophy, Sparkles } from 'lucide-react'
import { useLivePresence } from '@/hooks/use-live-presence'

interface HeroSectionProps {
  onStartGame: (route: string) => void
}

export function HeroSection({ onStartGame }: HeroSectionProps) {
  const { humanOnline, loading: loadingPresence } = useLivePresence()

  const handleScrollToManifesto = () => {
    const el = document.getElementById('manifesto')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      aria-label="Primeiro ecrã de impacto"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center lg:items-start text-center lg:text-left px-4 sm:px-6 lg:px-8 py-10 lg:py-16 max-w-7xl mx-auto w-full select-none"
    >
      {/* Luz ambiente subtil verde/ouro sem ofuscar o vídeo global */}
      <div className="absolute -top-12 -left-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Tag de Identidade Nacional Cyberpunk */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)] mb-5">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-white font-mono">🇵🇹 O JOGO NACIONAL</span>
      </div>

      {/* 2. Título de Grande Impacto Visual */}
      <div className="space-y-1">
        <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.95] text-white">
          <span className="block drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">ACORDA</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 drop-shadow-[0_0_35px_rgba(16,185,129,0.35)]">
            PORTUGAL
          </span>
        </h1>
      </div>

      {/* 3. Subtítulo e Frase Curta */}
      <p className="mt-4 sm:mt-5 text-base sm:text-xl lg:text-2xl font-bold text-slate-100 max-w-2xl leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        O jogo nacional de conhecimento, competição e evolução.
      </p>
      <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 max-w-xl leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
        Testa o que sabes. Evolui o teu jogador. Representa o teu distrito. Compete com Portugal.
      </p>

      {/* 4. Botões de Ação Imediata (Hierarquia de Videojogo) */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
        {/* Botão Primário: JOGAR AGORA */}
        <button
          type="button"
          onClick={() => onStartGame('/jogar?cat=desafio-nacional')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-slate-950 font-display font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_45px_rgba(16,185,129,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden border border-emerald-300/40"
        >
          {/* Brilho animado de reflexo */}
          <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

          <div className="w-7 h-7 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <span className="relative z-10 text-slate-950 font-black">JOGAR AGORA</span>
        </button>

        {/* Botão Secundário: EXPLORAR O JOGO */}
        <button
          type="button"
          onClick={handleScrollToManifesto}
          className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-4 sm:py-5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/15 hover:border-emerald-500/40 text-slate-200 hover:text-white font-display font-bold text-sm sm:text-base uppercase tracking-wider backdrop-blur-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>EXPLORAR O JOGO</span>
        </button>
      </div>

      {/* 5. Ticker de Indicadores Reais e Discretos */}
      <div className="mt-10 sm:mt-14 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-mono text-slate-300">
        {/* Jogadores Online Reais */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-sm shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-white font-bold">
              {loadingPresence ? '...' : humanOnline > 0 ? humanOnline : '1'}
            </strong>{' '}
            <span className="text-slate-400 uppercase text-[11px]">jogadores online</span>
          </span>
        </div>

        {/* 20 Distritos e Regiões */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-sm shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong className="text-white font-bold">20</strong>{' '}
            <span className="text-slate-400 uppercase text-[11px]">distritos & regiões</span>
          </span>
        </div>

        {/* Ranking Nacional */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-sm shadow-sm">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>
            <span className="text-amber-300 font-bold">TEMPORADA 01</span>{' '}
            <span className="text-slate-400 uppercase text-[11px]">ranking ativo</span>
          </span>
        </div>
      </div>
    </section>
  )
}
