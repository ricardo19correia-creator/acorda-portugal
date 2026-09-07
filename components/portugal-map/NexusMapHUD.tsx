'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Layers,
  Check,
  ChevronDown,
  X,
  ArrowLeft,
  Crosshair,
  Sparkles,
} from 'lucide-react'
import type { MapLayersState } from './PortugalNexus3DEngine'
import type { MapDisplayMode, MapRegion } from './types'
import { cn } from '@/lib/utils'

export interface NexusMapHUDProps {
  activeRegion: MapRegion
  onSelectRegion: (region: MapRegion) => void
  activeMode: MapDisplayMode
  onSelectMode: (mode: MapDisplayMode) => void
  isCinematic: boolean
  onToggleCinematic: () => void
  layers: MapLayersState
  onToggleLayer: (layerKey: keyof MapLayersState) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetPortugal: () => void
  onStartGame: (route: string) => void
  selectedDistrict: string
  isTerritorySynchronized?: boolean
}

export function NexusMapHUD({
  activeRegion,
  onSelectRegion,
  isCinematic,
  layers,
  onToggleLayer,
  onResetPortugal,
  selectedDistrict,
  isTerritorySynchronized,
}: NexusMapHUDProps) {
  const [isLayersOpen, setIsLayersOpen] = useState(false)

  // 17. CAMADAS: Território, Cidades, Arenas, Landmarks, Eventos, Ranking
  const LAYER_ITEMS: { key: keyof MapLayersState; label: string }[] = [
    { key: 'territorios', label: 'Território' },
    { key: 'cidades', label: 'Cidades' },
    { key: 'arenas', label: 'Arenas' },
    { key: 'landmarks', label: 'Landmarks' },
    { key: 'eventos', label: 'Eventos' },
    { key: 'ranking', label: 'Ranking' },
  ]

  // If in Cinematic Mode, hide HUD completely
  if (isCinematic) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 select-none isolate">
      {/* 1. TOP MINIMALIST HUD */}
      <header className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-3 py-2.5 sm:px-4 sm:py-3 shadow-2xl backdrop-blur-xl">
        {/* Left: Brand / Return */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ACORDA PORTUGAL
              </span>
            </div>
            <h1 className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-100">
              PORTUGAL // 2150
            </h1>
          </div>
        </div>

        {/* Center/Right: Sector Switcher (CONTINENTE | AÇORES | MADEIRA) & CAMADAS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sector Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onSelectRegion('continente')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-bold uppercase transition-all cursor-pointer',
                activeRegion === 'continente'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Continente
            </button>
            <button
              type="button"
              onClick={() => onSelectRegion('acores')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-bold uppercase transition-all cursor-pointer',
                activeRegion === 'acores'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Açores
            </button>
            <button
              type="button"
              onClick={() => onSelectRegion('madeira')}
              className={cn(
                'px-2.5 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs font-bold uppercase transition-all cursor-pointer',
                activeRegion === 'madeira'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Madeira
            </button>
          </div>

          {/* 17. CAMADAS Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLayersOpen(!isLayersOpen)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
                isLayersOpen
                  ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-900/90 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
              )}
              title="Gerir Camadas"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Camadas</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', isLayersOpen && 'rotate-180')} />
            </button>

            {isLayersOpen && (
              <div className="absolute top-12 right-0 w-48 rounded-2xl border border-cyan-500/30 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl space-y-1 z-50">
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 mb-1">
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    CAMADAS
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLayersOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {LAYER_ITEMS.map((item) => {
                  const isActive = layers[item.key]
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onToggleLayer(item.key)}
                      className={cn(
                        'flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer',
                        isActive
                          ? 'text-cyan-300 font-bold bg-cyan-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span>{item.label}</span>
                      <div
                        className={cn(
                          'flex h-3.5 w-3.5 items-center justify-center rounded border transition-all',
                          isActive ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-white/20'
                        )}
                      >
                        {isActive && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. PULSO TERRITORIAL BANNER (When territory is synchronized) */}
      {isTerritorySynchronized && (
        <div className="pointer-events-none mx-auto flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-950/90 px-4 py-1.5 shadow-2xl backdrop-blur-xl animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
          <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-300">
            PULSO // TERRITÓRIO SINCRONIZADO: {selectedDistrict}
          </span>
        </div>
      )}

      {/* 3. BOTTOM CORNER CONTROLS */}
      <footer className="pointer-events-auto flex items-center justify-end gap-2 pt-2">
        {/* ⌖ CENTRAR */}
        <button
          type="button"
          onClick={onResetPortugal}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-black uppercase tracking-wider shadow-xl backdrop-blur-xl transition-all active:scale-95 cursor-pointer"
          title="Centrar Portugal"
        >
          <Crosshair className="h-4 w-4" />
          <span>⌖ CENTRAR</span>
        </button>
      </footer>
    </div>
  )
}

export default NexusMapHUD
