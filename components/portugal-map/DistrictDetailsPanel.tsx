'use client'

import React from 'react'
import Link from 'next/link'
import {
  Crown,
  Trophy,
  Swords,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { getTerritoryByName } from '@/lib/portugal-geojson'
import { cn } from '@/lib/utils'

interface DistrictDetailsPanelProps {
  territory: DistrictWarTerritory | null
  districtName: string
  isOpen: boolean
  onClose: () => void
  onSelectPlayer?: (player: any) => void
  onStartGame?: (route: string) => void
  className?: string
}

export function DistrictDetailsPanel({
  territory,
  districtName,
  isOpen,
  onClose,
  onSelectPlayer,
  onStartGame,
  className,
}: DistrictDetailsPanelProps) {
  if (!isOpen) return null

  const metadata = getTerritoryByName(districtName)
  const displayName = territory?.name || metadata?.name || districtName
  const capital = metadata?.capital || displayName
  const motto = territory?.motto || metadata?.motto || 'Terra de Tradição e Conquista'
  const tag = territory?.tacticalTag || `SETOR ${displayName.toUpperCase()}`
  const accentColor = territory?.accentColor || metadata?.dominantColor || '#06b6d4'

  const trendIcon = territory?.trend === 'up' ? (
    <span className="flex items-center text-xs font-black text-emerald-400">
      <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{territory.trendDelta || 1}
    </span>
  ) : territory?.trend === 'down' ? (
    <span className="flex items-center text-xs font-black text-rose-400">
      <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {territory.trendDelta}
    </span>
  ) : (
    <span className="flex items-center text-xs font-bold text-slate-400">
      <Minus className="w-3.5 h-3.5 mr-0.5" /> Estável
    </span>
  )

  const handlePlay = () => {
    const route = `/jogar?distrito=${encodeURIComponent(displayName)}`
    if (onStartGame) {
      onStartGame(route)
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 sm:bottom-6 sm:left-6 sm:right-auto z-40 sm:w-[400px] pointer-events-none',
        className
      )}
    >
      <div
        className="w-full max-h-[82vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border bg-slate-950/95 border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-white pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-left-6"
        style={{
          boxShadow: `0 0 35px ${accentColor}25, 0 20px 40px rgba(0,0,0,0.8)`,
          borderColor: `${accentColor}50`,
        }}
      >
        {/* Glow Superior */}
        <div
          className="absolute top-0 inset-x-0 h-28 opacity-20 blur-2xl pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        {/* Mobile Swipe Handle */}
        <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Top Header */}
        <div className="relative flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full animate-ping"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="text-[10px] font-black uppercase font-mono tracking-widest"
                style={{ color: accentColor }}
              >
                {tag}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Capital: {capital}</span>
              {metadata?.region && <span>• Região {metadata.region}</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lema */}
        <p className="mt-2.5 text-xs text-slate-300 italic font-serif">
          “{motto}”
        </p>

        {/* Estatísticas Reais da Guerra dos Distritos */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Posição
            </span>
            <span className="text-lg font-black text-amber-400 font-display">
              {territory?.pos ? `#${territory.pos}` : 'Dados indisponíveis'}
            </span>
            <div className="mt-0.5 flex justify-center">{trendIcon}</div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Poder Militar
            </span>
            <span className="text-lg font-black text-cyan-400 font-display truncate block">
              {territory ? `${territory.powerFormatted} pts` : 'Dados indisponíveis'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {territory ? `${Math.round(territory.dominancePercentage)}% domínio` : '---'}
            </span>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Jogadores
            </span>
            <span className="text-lg font-black text-white font-display">
              {territory ? territory.activePlayers : 'Dados indisponíveis'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {territory?.totalXp ? `${Math.round(territory.totalXp / 1000)}k XP` : '---'}
            </span>
          </div>
        </div>

        {/* Soberano do Território (Rei Distrital Real) */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase font-mono text-amber-400 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-amber-400" />
              Soberano do Distrito
            </span>
            {territory?.king && (
              <span className="text-[10px] font-bold text-slate-400">
                Nível {territory.king.level}
              </span>
            )}
          </div>

          {territory?.king ? (
            <div
              onClick={() => onSelectPlayer && onSelectPlayer(territory.king)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <UserAvatar
                  src={territory.king.photoURL}
                  alt={territory.king.displayName}
                  size="md"
                  frameId={territory.king.equippedFrame}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                  {territory.king.displayName}
                </div>
                <div className="text-xs text-amber-400 font-medium truncate">
                  {territory.king.title || 'Guardião Distrital'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-1">
              Trono disponível — lidera o ranking distrital para reclamar a coroa!
            </div>
          )}
        </div>

        {/* Top Contribuidores Reais */}
        {territory && territory.topContributors && territory.topContributors.length > 0 && (
          <div className="mt-4">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-400 block mb-2">
              Top Contribuidores do Distrito
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {territory.topContributors.slice(0, 3).map((contrib, idx) => (
                <div
                  key={contrib.uid}
                  onClick={() => onSelectPlayer && onSelectPlayer(contrib)}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-slate-500 w-3 text-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white truncate max-w-[120px]">
                      {contrib.displayName}
                    </span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold shrink-0">
                    {Math.round(contrib.contributionPercentage)}% poder
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-5">
          <button
            type="button"
            onClick={handlePlay}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Swords className="w-4 h-4" />
            <span>Defender {displayName}</span>
          </button>

          <Link
            href={`/rankings?district=${encodeURIComponent(displayName)}`}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-900 border border-white/15 hover:border-white/30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer hover:bg-slate-800"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver Ranking</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
