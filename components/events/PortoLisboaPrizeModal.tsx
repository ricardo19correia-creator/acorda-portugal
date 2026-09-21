'use client'

import React, { useEffect } from 'react'
import { X, Trophy, Sparkles, Shield, Coins, Crown, Flame, Award, ArrowRight } from 'lucide-react'
import { PortoLisboaPrize3D, type TrophyPlacement, type TrophyTeamSide } from './PortoLisboaTrophy3D'
import { cn } from '@/lib/utils'

export interface PrizeDetails {
  placement: TrophyPlacement
  title: string
  trophyName: string
  acordas: number
  rankLabel: string
  subtitle: string
  description: string
  rarity: 'Mítico' | 'Lendário' | 'Épico'
  rarityBadge: string
  accentColor: string
}

export const OFFICIAL_PORTO_LISBOA_PRIZES: Record<TrophyPlacement, PrizeDetails> = {
  1: {
    placement: 1,
    title: 'REI DA RIVALIDADE',
    trophyName: 'TROFÉU SUPREMO — PORTO × LISBOA 2026',
    acordas: 50000,
    rankLabel: '🥇 1.º LUGAR',
    subtitle: 'Consagração Máxima do Grande Duelo Nacional',
    description:
      'A honraria máxima concedida ao grande vencedor nacional do evento. Esculpido em ouro 24k com cinzelamento manual, base de pedestal em obsidiana negra e incrustação de safira azul e rubi carmesim, celebrando o triunfo supremo entre Porto e Lisboa.',
    rarity: 'Mítico',
    rarityBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    accentColor: 'from-amber-500 to-yellow-300',
  },
  2: {
    placement: 2,
    title: 'SENHOR DA RIVALIDADE',
    trophyName: 'MEDALHA DE PRATA — PORTO × LISBOA 2026',
    acordas: 30000,
    rankLabel: '🥈 2.º LUGAR',
    subtitle: 'Glória de Elite na Cimeira de Portugal',
    description:
      'Medalha de joalharia em prata pura e platina com acabamento escovado e espelhado. Gravação cinzelada da data comemorativa de 2026 e fita cerimonial em seda nobre. Uma prova eterna de mestria cognitiva e liderança territorial.',
    rarity: 'Lendário',
    rarityBadge: 'bg-slate-300/20 text-slate-200 border-slate-300/40 shadow-[0_0_15px_rgba(226,232,240,0.3)]',
    accentColor: 'from-slate-200 to-slate-400',
  },
  3: {
    placement: 3,
    title: 'GUERREIRO DA RIVALIDADE',
    trophyName: 'MEDALHA DE BRONZE — PORTO × LISBOA 2026',
    acordas: 20000,
    rankLabel: '🥉 3.º LUGAR',
    subtitle: 'Pódio Histórico de Bravura e Conhecimento',
    description:
      'Medalha tridimensional em bronze nobre e cobre polido de coleção. Ostenta os relevos das espadas cruzadas do Grande Duelo e a pátina de campeão. Permanecerá para sempre no teu perfil como marca de prestígio.',
    rarity: 'Épico',
    rarityBadge: 'bg-amber-700/20 text-amber-400 border-amber-700/40 shadow-[0_0_15px_rgba(217,119,6,0.3)]',
    accentColor: 'from-amber-600 to-orange-400',
  },
}

interface PortoLisboaPrizeModalProps {
  placement: TrophyPlacement | null
  teamSide?: TrophyTeamSide
  isConquered?: boolean
  conqueredDate?: string | null
  onClose: () => void
}

export function PortoLisboaPrizeModal({
  placement,
  teamSide = null,
  isConquered = false,
  conqueredDate,
  onClose,
}: PortoLisboaPrizeModalProps) {
  useEffect(() => {
    if (!placement) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [placement, onClose])

  if (!placement) return null

  const prize = OFFICIAL_PORTO_LISBOA_PRIZES[placement]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prize-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-xl rounded-3xl p-5 sm:p-8 bg-gradient-to-b from-slate-900/95 via-[#060c1d]/98 to-slate-950 border shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden transition-all text-center',
          placement === 1
            ? 'border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
            : placement === 2
            ? 'border-slate-300/50 shadow-[0_0_40px_rgba(226,232,240,0.2)] ring-1 ring-slate-300/30'
            : 'border-amber-700/50 shadow-[0_0_40px_rgba(217,119,6,0.2)] ring-1 ring-amber-700/30'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luzes de Fundo de Identidade da Equipa */}
        {teamSide === 'porto' ? (
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />
        ) : teamSide === 'lisboa' ? (
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-600/25 blur-3xl pointer-events-none" />
        ) : (
          <>
            <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />
          </>
        )}

        {/* Botão de Fecho */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-2xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fechar janela de prémio"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badges de Cabeçalho */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-3">
          <span className="px-3 py-1 rounded-full bg-slate-950 border border-white/15 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-300">
            PORTO × LISBOA · 2026
          </span>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm',
              prize.rarityBadge
            )}
          >
            {prize.rarity}
          </span>

          {/* Estado da Recompensa */}
          {isConquered ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <span>🏆</span>
              <span>CONQUISTADO</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span>⚔️</span>
              <span>PRÉMIO EM DISPUTA</span>
            </span>
          )}
        </div>

        {/* Visualização 3D Monumental em Destaque */}
        <div className="py-3 sm:py-5 flex items-center justify-center">
          <PortoLisboaPrize3D
            placement={placement}
            teamSide={teamSide}
            size="xl"
            interactive={true}
            showAura={true}
          />
        </div>

        {/* Informações Oficiais do Prémio */}
        <div className="space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-2xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400 shadow-inner">
            <span>{prize.rankLabel}</span>
          </div>

          <h3
            id="prize-modal-title"
            className={cn(
              'font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-md'
            )}
          >
            {prize.title}
          </h3>

          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
            {prize.trophyName}
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed px-2">
            {prize.description}
          </p>

          {/* Bloco de Recompensa em Acordas */}
          <div className="pt-2">
            <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-500/40 shadow-xl">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Coins className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase text-slate-400">Recompensa Oficial</p>
                <p className="font-display text-lg sm:text-2xl font-black text-amber-300">
                  {prize.acordas.toLocaleString('pt-PT')} Acordas
                </p>
              </div>
            </div>
          </div>

          {/* Identidade do Lado Escolhido e Data se Conquistado */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-400">
            {teamSide === 'porto' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300">
                <span>🔵</span> Lado: <strong>Porto (A Invicta)</strong>
              </span>
            ) : teamSide === 'lisboa' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300">
                <span>🔴</span> Lado: <strong>Lisboa (A Capital)</strong>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-slate-400">
                <span>⚔️</span> Lado: <strong>A Definir no Evento</strong>
              </span>
            )}

            {isConquered && conqueredDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                <span>📅</span> Conquistado em: <strong>{conqueredDate}</strong>
              </span>
            )}
          </div>

          {/* Aviso de Exclusividade Absoluta */}
          <div className="pt-3 border-t border-white/10">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium max-w-md mx-auto leading-normal">
              🛡️ <strong>Exclusividade Permanente:</strong> Este prémio é exclusivo do evento PORTO × LISBOA 2026. Não pode ser comprado, vendido ou transferido, e ficará guardado eternamente no teu perfil.
            </p>
          </div>
        </div>

        {/* Botão de Fecho Inferior */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition cursor-pointer"
          >
            Fechar Apresentação
          </button>
        </div>
      </div>
    </div>
  )
}
