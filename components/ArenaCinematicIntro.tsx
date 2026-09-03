'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Crown, Shield, Zap } from 'lucide-react'
import type { SupremeArenaDefinition } from '@/lib/supreme-arenas'
import { SupremeArenaAtmosphere } from '@/components/SupremeArenaAtmosphere'

interface ArenaCinematicIntroProps {
  arena: SupremeArenaDefinition
  playerName?: string
  playerTier?: string
  onComplete: () => void
  onSkip?: () => void
}

export function ArenaCinematicIntro({
  arena,
  playerName = 'CAMPEÃO NACIONAL',
  playerTier = 'MESTRE',
  onComplete,
  onSkip,
}: ArenaCinematicIntroProps) {
  const [phase, setPhase] = useState<'black' | 'reveal' | 'ready' | 'exit'>('black')

  useEffect(() => {
    // Fase 1: Black to Reveal (0.3s)
    const t1 = setTimeout(() => {
      setPhase('reveal')
    }, 250)

    // Fase 2: Ready Prompt (1.1s)
    const t2 = setTimeout(() => {
      setPhase('ready')
    }, 1100)

    // Fase 3: Exit & Quiz Start (1.8s)
    const t3 = setTimeout(() => {
      setPhase('exit')
      setTimeout(onComplete, 350)
    }, 1900)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, rgba(15,23,42,0.95) 0%, rgba(2,6,23,1) 100%)',
      }}
    >
      {/* Imagem de Fundo da Arena em Revelação Cinematográfica */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
          phase === 'black'
            ? 'scale-125 blur-xl opacity-0'
            : 'scale-100 blur-0 opacity-70'
        }`}
        style={{ backgroundImage: `url(${arena.assetPath})` }}
      />

      {/* Camada de Partículas Vivas da Arena */}
      <SupremeArenaAtmosphere effectType={arena.effectType} quality="ultra" />

      {/* Brilho de Iluminação Volumétrica */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: arena.lightingProfile.spotlightBeam,
          opacity: phase === 'reveal' || phase === 'ready' ? 0.8 : 0,
        }}
      />

      {/* Cartão de Apresentação Central do Palco */}
      <div className="relative z-10 text-center max-w-xl px-6 animate-in fade-in zoom-in duration-500">
        {/* Badge da Raridade */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 font-black tracking-widest text-xs uppercase mb-3 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>ARENA {arena.rarity} // 2150</span>
        </div>

        {/* Nome Monumental da Arena */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider uppercase drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] mb-2 font-display">
          {arena.name}
        </h1>

        {/* Subtítulo Épico */}
        <p className="text-amber-200/90 text-sm sm:text-base font-semibold tracking-wide italic mb-6">
          «{arena.subtitle}»
        </p>

        {/* Cartão do Jogador Desafiante */}
        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/70 border border-white/20 backdrop-blur-xl shadow-2xl mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Desafiante
            </div>
            <div className="text-base font-black text-white tracking-wide">
              {playerName}
            </div>
          </div>
          <div className="px-3 py-1 rounded-lg bg-white/10 text-amber-300 text-xs font-bold tracking-wider uppercase border border-amber-500/30">
            {playerTier}
          </div>
        </div>

        {/* Sinal de Prontidão */}
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-sm tracking-widest uppercase font-bold animate-pulse">
          <Zap className="w-4 h-4" />
          <span>PREPARADO PARA O DUELO</span>
        </div>
      </div>

      {/* Botão de Saltar Apresentação */}
      <button
        onClick={onSkip || onComplete}
        className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 text-white/70 hover:text-white text-xs font-mono tracking-wider uppercase transition-all backdrop-blur-md cursor-pointer"
      >
        Saltar [ESC]
      </button>
    </div>
  )
}
