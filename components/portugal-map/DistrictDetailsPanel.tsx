'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  Play,
  Trophy,
  Crown,
  Users,
  Shield,
  Zap,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { getTerritoryByName } from '@/lib/territory-metadata'
import { getArenasByDistrict } from '@/lib/map-arena-registry'
import type { MapArenaPOI } from './types'
import { cn } from '@/lib/utils'

export interface DistrictDetailsPanelProps {
  territory: DistrictWarTerritory | null
  districtName: string
  isOpen: boolean
  onClose: () => void
  onSelectArena?: (arena: MapArenaPOI) => void
  onPlayDistrict?: (districtSlug: string) => void
  onlineCount?: number
  className?: string
}

export function DistrictDetailsPanel({
  territory,
  districtName,
  isOpen,
  onClose,
  onSelectArena,
  onPlayDistrict,
  onlineCount,
  className,
}: DistrictDetailsPanelProps) {
  if (!isOpen) return null

  const metadata = getTerritoryByName(districtName)
  const displayName = territory?.name || metadata?.name || districtName
  const capital = metadata?.capital || displayName
  const region = metadata?.region || ''
  const isIsland = metadata?.type === 'island'
  const rankNumber = territory?.pos ? `#${territory.pos} Nacional` : 'Em classificação'
  const motto = territory?.motto || metadata?.motto || 'Terra de Tradição e Conquista Heroica'
  const accentColor = territory?.accentColor || metadata?.dominantColor || '#06b6d4'

  // Arenas associadas ao distrito
  const districtArenas = getArenasByDistrict(displayName)
  const arenasCount = districtArenas.length

  // Métricas 100% Reais
  const registeredPlayers = territory?.activePlayers || 0
  const onlineNow = typeof onlineCount === 'number' ? onlineCount : 0
  const totalPartidas = territory?.totalGames || 0
  const totalVitorias = territory?.totalDuelWins || 0
  const powerDisplay = territory?.powerFormatted || (territory?.power ? `${Math.round(territory.power / 100) / 10}K` : '0')
  const avgXp = territory?.activePlayers && territory.totalXp ? Math.round(territory.totalXp / territory.activePlayers) : 0
  const bestPlayer = territory?.king

  const handlePlay = () => {
    const slug = territory?.id || metadata?.id || displayName.toLowerCase().replace(/\s+/g, '-')
    if (onPlayDistrict) {
      onPlayDistrict(slug)
    }
  }

  return (
    <aside
      aria-label={`Painel tático do território de ${displayName}`}
      className={cn(
        // Desktop: docked lateral panel on the right (20-30% of viewport, max 380px)
        // Mobile: smooth bottom sheet drawer
        'fixed z-40 inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-auto sm:w-[350px] lg:w-[370px]',
        'max-h-[82vh] sm:max-h-[calc(100vh-105px)] overflow-y-auto',
        'rounded-t-3xl sm:rounded-3xl border border-cyan-500/35 bg-slate-950/95',
        'backdrop-blur-2xl shadow-2xl p-4 sm:p-5 text-white select-none',
        'animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-right-8 duration-250 ease-out',
        className
      )}
      style={{
        boxShadow: `0 0 35px ${accentColor}25, 0 25px 50px rgba(0,0,0,0.92)`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top subtle glow banner */}
      <div
        className="absolute top-0 inset-x-0 h-20 opacity-20 blur-2xl pointer-events-none rounded-t-3xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Mobile Swipe Handle */}
      <div className="sm:hidden w-10 h-1 rounded-full bg-white/25 mx-auto mb-2" />

      {/* HEADER SECTION */}
      <div className="relative flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            <span
              className="font-mono text-[11px] font-black uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              {rankNumber} • {isIsland ? 'REGIÃO AUTÓNOMA' : 'DISTRITO'}
            </span>
            {region && (
              <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                • {region}
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md flex items-center gap-2">
            <span>🇵🇹</span>
            <span>{displayName}</span>
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Capital: <strong className="text-white font-bold">{capital}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel do distrito"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95 border border-white/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 4 REAL METRICS COMPACT GRID */}
      <div className="grid grid-cols-2 gap-2 py-3 border-b border-white/10 text-left">
        {/* Jogadores */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-cyan-400" />
              <span>Jogadores</span>
            </span>
            {onlineNow > 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {onlineNow} online
              </span>
            ) : (
              <span className="text-slate-500 text-[9px]">0 online</span>
            )}
          </div>
          <div className="mt-1">
            <span className="font-display text-xl font-black text-white">
              {registeredPlayers}
            </span>
            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
              registados
            </span>
          </div>
        </div>

        {/* Partidas & Duelos */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-emerald-400" />
              <span>Partidas</span>
            </span>
            <span className="text-slate-400 text-[9px]">{totalVitorias} duelos</span>
          </div>
          <div className="mt-1">
            <span className="font-display text-xl font-black text-emerald-300">
              {totalPartidas}
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 ml-1.5">
              totais
            </span>
          </div>
        </div>

        {/* Poder Territorial */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-slate-400">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Poder Distrital</span>
          </div>
          <div className="mt-1">
            <span className="font-display text-xl font-black text-amber-300">
              {powerDisplay}
            </span>
            <span className="text-[10px] font-mono text-amber-400/80 ml-1.5">
              pontos
            </span>
          </div>
        </div>

        {/* XP Médio */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-slate-400">
            <Trophy className="h-3 w-3 text-purple-400" />
            <span>XP Médio</span>
          </div>
          <div className="mt-1">
            <span className="font-display text-xl font-black text-purple-300">
              {avgXp > 0 ? avgXp.toLocaleString('pt-PT') : '0'}
            </span>
            <span className="text-[10px] font-mono text-purple-400/80 ml-1.5">
              XP
            </span>
          </div>
        </div>
      </div>

      {/* MOTTO / LEMA HISTÓRICO */}
      <div className="py-2.5 border-b border-white/10 text-center">
        <p className="font-mono text-xs italic text-slate-300 leading-relaxed">
          &ldquo;{motto}&rdquo;
        </p>
      </div>

      {/* MELHOR JOGADOR (REI DO DISTRITO) */}
      <div className="py-2.5 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-mono uppercase text-amber-400 block font-black leading-none">
              Melhor Jogador // Soberano
            </span>
            <span className="text-xs font-display font-bold text-white truncate block">
              {bestPlayer ? bestPlayer.displayName : 'Sem líder atribuído'}
            </span>
          </div>
        </div>
        {bestPlayer && (
          <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
            {bestPlayer.xp?.toLocaleString('pt-PT')} XP
          </span>
        )}
      </div>

      {/* ARENAS NACIONAIS DA REGIÃO */}
      <div className="py-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Arenas Nacionais ({arenasCount})
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Toque para inspecionar
          </span>
        </div>

        {districtArenas.length > 0 ? (
          <div className="space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {districtArenas.map((arena) => {
              const rarityColor =
                arena.rarity === 'Lendária'
                  ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                  : arena.rarity === 'Épica'
                  ? 'text-purple-300 border-purple-500/40 bg-purple-500/10'
                  : arena.rarity === 'Rara'
                  ? 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
                  : 'text-slate-300 border-slate-500/40 bg-slate-500/10'

              return (
                <button
                  key={arena.id}
                  type="button"
                  onClick={() => onSelectArena && onSelectArena(arena)}
                  className="w-full p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/40 transition-all flex items-center gap-2.5 text-left group cursor-pointer active:scale-98"
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                    <Image
                      src={arena.image}
                      alt={arena.name}
                      fill
                      loading="lazy"
                      sizes="40px"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                      {arena.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase border',
                          rarityColor
                        )}
                      >
                        {arena.rarity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 capitalize">
                        {arena.category}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
            Arenas táticas em calibração para este território.
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div className="pt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={handlePlay}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
        >
          <Play className="h-4 w-4 fill-slate-950 shrink-0" />
          <span>Jogar em {displayName}</span>
        </button>

        <Link
          href={`/rankings?district=${encodeURIComponent(displayName)}`}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all active:scale-98 cursor-pointer"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Ver Ranking do Distrito</span>
        </Link>
      </div>
    </aside>
  )
}

export default DistrictDetailsPanel
