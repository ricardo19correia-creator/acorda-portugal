'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  Play,
  Trophy,
  Users,
  Zap,
  Swords,
  Crown,
  ChevronRight,
  Flame,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PortugalVivoDistrict } from '@/src/hooks/usePortugalVivoData'

interface DistrictActionPanelProps {
  district: PortugalVivoDistrict
  onClose: () => void
}

export function DistrictActionPanel({
  district,
  onClose,
}: DistrictActionPanelProps) {
  const router = useRouter()

  const handlePlay = () => {
    // Rota oficial com parâmetros territoriais que iniciam o jogo imediatamente
    router.push(`/jogar?district=${encodeURIComponent(district.slug)}&play=true`)
  }

  const handleRankings = () => {
    router.push(`/rankings?district=${encodeURIComponent(district.slug)}`)
  }

  const inDispute = Boolean(district.inDisputeWith)

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] sm:bottom-5 left-3 right-3 sm:right-auto sm:left-4 z-40 w-auto sm:w-96 rounded-3xl bg-slate-950/92 p-4 sm:p-5 border border-white/15 shadow-2xl backdrop-blur-xl animate-slideUp select-none">
      {/* Topo do Painel */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🇵🇹</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              {district.region}
            </span>
            {district.isLeader && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="h-3 w-3 text-amber-400" />
                <span>Líder Nacional</span>
              </span>
            )}
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {district.name}
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-300 italic line-clamp-1">
            &ldquo;{district.motto}&rdquo;
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Fechar painel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Banner de Confronto / Disputa Ativa se existir */}
      {inDispute && (
        <div className="my-3 flex items-center justify-between gap-2 rounded-2xl bg-amber-500/15 p-2.5 border border-amber-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
              <Swords className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Disputa Territorial
              </div>
              <div className="text-xs font-black text-white truncate">
                {district.name} vs {district.inDisputeWith}
              </div>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
            Em Combate
          </span>
        </div>
      )}

      {/* Banner de Evento se existir */}
      {district.activeEvent && (
        <div className="my-3 flex items-center justify-between gap-2 rounded-2xl bg-rose-500/15 p-2.5 border border-rose-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Evento Especial
              </div>
              <div className="text-xs font-black text-white truncate">
                {district.activeEvent.title}
              </div>
            </div>
          </div>
          <span className="shrink-0 font-mono text-xs font-bold text-rose-300">
            +{district.activeEvent.xpReward} XP
          </span>
        </div>
      )}

      {/* Grelha de Métricas Reais do Distrito */}
      <div className="grid grid-cols-3 gap-2 my-3">
        {/* Poder Territorial */}
        <div className="flex flex-col rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="h-3 w-3 text-cyan-400" />
            <span>Poder</span>
          </div>
          <span className="mt-1 font-mono text-sm sm:text-base font-black text-white">
            {district.powerFormatted}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {district.dominancePercentage}% domínio
          </span>
        </div>

        {/* Jogadores Ativos */}
        <div className="flex flex-col rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Users className="h-3 w-3 text-emerald-400" />
            <span>Jogadores</span>
          </div>
          <span className="mt-1 font-mono text-sm sm:text-base font-black text-white">
            {district.onlineNow > 0 ? (
              <span className="text-emerald-400">{district.onlineNow} online</span>
            ) : (
              <span>{district.activePlayers}</span>
            )}
          </span>
          <span className="text-[9px] text-slate-400">
            {district.onlineNow > 0 ? 'ativos agora' : 'registados'}
          </span>
        </div>

        {/* Ranking & XP */}
        <div className="flex flex-col rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Ranking</span>
          </div>
          <span className="mt-1 font-mono text-sm sm:text-base font-black text-white">
            #{district.pos}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {district.totalXp >= 1000 ? `${(district.totalXp / 1000).toFixed(0)}k XP` : `${district.totalXp} XP`}
          </span>
        </div>
      </div>

      {/* Rei / Maior Contribuidor se existir */}
      {district.king && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/5 mb-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 truncate">Rei do Território:</span>
            <span className="font-bold text-slate-200 truncate">{district.king.displayName}</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-400 shrink-0">
            Nv. {district.king.level}
          </span>
        </div>
      )}

      {/* Botões de Ação Principal */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handlePlay}
          className={cn(
            'w-full flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer',
            inDispute
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
          )}
        >
          {inDispute ? <Swords className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
          <span>{inDispute ? 'Entrar no Confronto' : 'Jogar Neste Distrito'}</span>
        </button>

        <button
          type="button"
          onClick={handleRankings}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-bold text-slate-200 transition-all active:scale-95 cursor-pointer"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span>Classificação</span>
        </button>
      </div>
    </div>
  )
}
