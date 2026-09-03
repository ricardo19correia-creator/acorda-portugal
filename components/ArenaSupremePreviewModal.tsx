'use client'

import React, { useState } from 'react'
import {
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  Play,
  Volume2,
  ShieldCheck,
  ShoppingBag,
  Coins,
  Flame,
  ArrowRight,
} from 'lucide-react'
import type { SupremeArenaDefinition } from '@/lib/supreme-arenas'
import { SupremeArenaAtmosphere } from '@/components/SupremeArenaAtmosphere'
import { playSound } from '@/lib/sound-engine'

interface ArenaSupremePreviewModalProps {
  isOpen: boolean
  arena: SupremeArenaDefinition | null
  isOwned: boolean
  isEquipped: boolean
  onClose: () => void
  onEquip: (arenaId: string) => void
  onBuy?: (arena: SupremeArenaDefinition) => void
}

export function ArenaSupremePreviewModal({
  isOpen,
  arena,
  isOwned,
  isEquipped,
  onClose,
  onEquip,
  onBuy,
}: ArenaSupremePreviewModalProps) {
  const [testMode, setTestMode] = useState(false)
  const [testFeedback, setTestFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [testScore, setTestScore] = useState(0)

  if (!isOpen || !arena) return null

  const handleTestAnswer = (isCorrect: boolean) => {
    setTestFeedback(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      playSound('correct')
      setTestScore((prev) => prev + 100)
    } else {
      playSound('wrong')
    }
    setTimeout(() => {
      setTestFeedback(null)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Container Principal do Modal em Formato de Palco */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 shadow-2xl flex flex-col">
        {/* Vista Superior com Efeitos Vivos da Arena */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-white/10 bg-slate-900">
          {/* Fundo da Arena */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: `url(${arena.assetPath})` }}
          />

          {/* Partículas e Atmosfera Vivas */}
          <SupremeArenaAtmosphere
            effectType={arena.effectType}
            quality="ultra"
            burstTrigger={testFeedback}
          />

          {/* Iluminação Volumétrica */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: arena.lightingProfile.spotlightBeam }}
          />

          {/* Gradiente de Escurecimento Inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Badges Flutuantes */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              {arena.rarity}
            </span>
            {isEquipped && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Equipada
              </span>
            )}
          </div>

          {/* Título Sobreposto no Palco */}
          <div className="absolute bottom-4 left-6 right-6 z-20">
            <div className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold mb-1">
              {arena.atmosphereTag}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wide drop-shadow-md">
              {arena.name}
            </h2>
            <p className="text-sm text-slate-300 italic">«{arena.subtitle}»</p>
          </div>
        </div>

        {/* Corpo de Detalhes e Painel de Ação */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Citação e Descrição */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
            <p className="text-amber-300/90 font-medium italic text-sm">
              {arena.quote}
            </p>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {arena.description}
            </p>
          </div>

          {/* Detalhes Arquitetónicos 2150 */}
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Elementos Arquitetónicos do Palco</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {arena.architecturalDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-200"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seção «Testar Arena» Interativa */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Simulação de Resposta em Jogo
                </span>
              </div>
              {testScore > 0 && (
                <span className="text-xs font-mono font-bold text-amber-300">
                  +{testScore} Pontos de Teste
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Testa a reação ambiental em tempo real com efeitos de luz e partículas:
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleTestAnswer(true)}
                className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Testar Acerto (+Luz)
              </button>
              <button
                onClick={() => handleTestAnswer(false)}
                className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <Flame className="w-4 h-4" />
                Testar Erro (Tensão)
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé de Ações: Equipar / Comprar */}
        <div className="border-t border-white/10 bg-slate-900/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {arena.isVipEur ? (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  Preço VIP Real
                </span>
                <span className="text-lg font-black text-white font-mono">
                  €{arena.priceEur?.toFixed(2)} EUR
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  Preço em Moedas
                </span>
                <span className="text-lg font-black text-amber-400 font-mono flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {arena.priceCoins?.toLocaleString()} Acordas
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isOwned ? (
              <button
                onClick={() => {
                  onEquip(arena.id)
                  playSound('equip')
                }}
                disabled={isEquipped}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isEquipped
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 opacity-70 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                }`}
              >
                {isEquipped ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Arena Ativa
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Equipar Esta Arena
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => onBuy && onBuy(arena)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm tracking-wider uppercase transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Desbloquear Arena VIP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
