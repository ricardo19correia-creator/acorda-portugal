'use client'

import React from 'react'
import {
  X,
  Play,
  Flame,
  Swords,
  Trophy,
} from 'lucide-react'
import { getNexusTerritoryByName, CANONICAL_ARENAS } from '@/lib/portugal-map-nexus-data'
import type { DistrictWarTerritory } from '@/lib/district-war'

export interface NexusDistrictDossierProps {
  districtName: string
  territory: DistrictWarTerritory | null
  isOpen: boolean
  onClose: () => void
  onStartGame: (route: string) => void
  onSelectArena?: (arenaId: string) => void
}

export function NexusDistrictDossier({
  districtName,
  territory,
  isOpen,
  onClose,
  onStartGame,
}: NexusDistrictDossierProps) {
  if (!isOpen || !districtName) return null

  const metadata = getNexusTerritoryByName(districtName)
  const displayName = metadata?.name || districtName

  // Real authoritative data from Firebase
  const realPower = territory?.power ?? 0
  const realPowerFormatted = realPower >= 1000
    ? `${(realPower / 1000).toFixed(1)}K`
    : realPower.toString()
  const realRankingPos = territory?.pos ? `#${territory.pos}` : '#--'

  // Verified arenas in this district
  const districtArenasCount = CANONICAL_ARENAS.filter(
    (a) => a.district.toLowerCase() === displayName.toLowerCase()
  ).length

  return (
    <aside
      className="pointer-events-auto fixed sm:absolute z-40 inset-x-4 bottom-4 sm:bottom-auto sm:top-20 sm:right-6 sm:w-72 sm:inset-x-auto rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl text-white animate-slide-up isolate"
      style={{
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-white/10">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {displayName}
          </h2>
          <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            {realRankingPos !== '#--' ? `TERRITÓRIO ${realRankingPos}` : 'TERRITÓRIO'}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics Row (PODER | ARENAS | RANKING) */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-white/10 text-center">
        {/* PODER */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Flame className="h-3 w-3 text-cyan-400" />
            <span>Poder</span>
          </div>
          <span className="font-mono text-base font-black text-cyan-300">
            {realPowerFormatted}
          </span>
        </div>

        {/* ARENAS */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Swords className="h-3 w-3 text-purple-400" />
            <span>Arenas</span>
          </div>
          <span className="font-mono text-base font-black text-purple-300">
            {districtArenasCount}
          </span>
        </div>

        {/* RANKING */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Ranking</span>
          </div>
          <span className="font-mono text-base font-black text-amber-300">
            {realRankingPos}
          </span>
        </div>
      </div>

      {/* Action Button: [ JOGAR ] */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => onStartGame(`/jogar?distrito=${encodeURIComponent(displayName)}`)}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Play className="h-4 w-4 fill-current text-slate-950" />
          <span>Jogar por {displayName}</span>
        </button>
      </div>
    </aside>
  )
}

export default NexusDistrictDossier
