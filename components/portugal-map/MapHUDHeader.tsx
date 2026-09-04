'use client'

import React from 'react'
import Link from 'next/link'
import type { MapDisplayMode, MapRegion, MapEngineState } from './types'
import { MapStatusBadge } from './MapStatusBadge'
import { cn } from '@/lib/utils'
import {
  Globe,
  Mountain,
  Crosshair,
  Moon,
  ArrowLeft,
  Swords,
} from 'lucide-react'

interface MapHUDHeaderProps {
  engineState: MapEngineState
  activeMode: MapDisplayMode
  activeRegion: MapRegion
  onSelectMode: (mode: MapDisplayMode) => void
  onSelectRegion: (region: MapRegion) => void
  onStartGame?: (route: string) => void
  selectedDistrict?: string
}

const MODES: Array<{ id: MapDisplayMode; label: string; icon: React.ElementType; color: string }> = [
  { id: 'satellite', label: 'Satélite 3D', icon: Globe, color: 'text-emerald-400' },
  { id: 'terrain', label: 'Terreno', icon: Mountain, color: 'text-amber-400' },
  { id: 'tactical', label: 'Tático', icon: Crosshair, color: 'text-cyan-400' },
  { id: 'night', label: 'Noite', icon: Moon, color: 'text-indigo-400' },
]

const REGIONS: Array<{ id: MapRegion; label: string; icon: string }> = [
  { id: 'continente', label: 'Continente', icon: '🇵🇹' },
  { id: 'acores', label: 'Açores', icon: '🌊' },
  { id: 'madeira', label: 'Madeira', icon: '🌺' },
]

export function MapHUDHeader({
  engineState,
  activeMode,
  activeRegion,
  onSelectMode,
  onSelectRegion,
  onStartGame,
  selectedDistrict = 'Lisboa',
}: MapHUDHeaderProps) {
  return (
    <header className="relative z-30 w-full px-3 sm:px-6 pt-3 pb-1 select-none pointer-events-none">
      <div className="flex flex-col gap-2.5">
        {/* Top Primary Bar */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Brand & Status Indicator */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <Link
              href="/rankings"
              className="h-9 w-9 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors shadow-md"
              title="Voltar aos Rankings"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/30">
              <div className="flex items-center gap-1.5" suppressHydrationWarning>
                <span className="text-base leading-none">🇵🇹</span>
                <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-white">
                  PORTUGAL <span className="text-cyan-400">2150</span>
                </span>
              </div>
              <span suppressHydrationWarning className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-black text-emerald-300 uppercase tracking-widest">
                BUILD-ID: MAP2150-REAL-001
              </span>
            </div>

            <div className="hidden lg:block">
              <MapStatusBadge state={engineState} />
            </div>
          </div>

          {/* Region Fly-To Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-lg pointer-events-auto">
            {REGIONS.map((r) => {
              const isActive = activeRegion === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectRegion(r.id)}
                  className={cn(
                    'px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md shadow-cyan-500/25 scale-102'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="text-xs">{r.icon}</span>
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Play CTA */}
          <div className="hidden sm:flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                const route = `/jogar?distrito=${encodeURIComponent(selectedDistrict)}`
                if (onStartGame) onStartGame(route)
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-98"
            >
              <Swords className="w-3.5 h-3.5" />
              <span suppressHydrationWarning>Jogar em {selectedDistrict}</span>
            </button>
          </div>
        </div>

        {/* Secondary Bar: Mode Selector & Mobile Status */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pointer-events-auto">
          {/* Display Modes */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-white/15 backdrop-blur-md shadow-lg">
            {MODES.map((m) => {
              const isActive = activeMode === m.id
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={cn(
                    'px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'bg-white/15 text-white border border-white/30 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', isActive ? m.color : 'text-slate-400')} />
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile status indicator */}
          <div className="lg:hidden shrink-0">
            <MapStatusBadge state={engineState} />
          </div>
        </div>
      </div>
    </header>
  )
}
