'use client'

import React from 'react'
import {
  Users,
  MapPin,
  Swords,
  Zap,
  Layers,
  Compass,
  Radar,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapSector } from '@/src/game/world/PortugalSatelliteEngine'

interface PortugalAgoraHUDProps {
  onlineCount: number
  activeDistrictsCount: number
  confrontationsCount: number
  eventsCount: number
  currentSector: MapSector
  onSelectSector: (sector: MapSector) => void
  onToggleLayers: () => void
  onToggle3D: () => void
  onResetView: () => void
  onTriggerScan: () => void
  isScanning: boolean
}

export function PortugalAgoraHUD({
  onlineCount,
  activeDistrictsCount,
  confrontationsCount,
  eventsCount,
  currentSector,
  onSelectSector,
  onToggleLayers,
  onToggle3D,
  onResetView,
  onTriggerScan,
  isScanning,
}: PortugalAgoraHUDProps) {
  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex flex-col gap-2 p-3 sm:p-4 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Bloco 1: PORTUGAL AGORA — Métricas 100% Reais */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 rounded-2xl bg-slate-950/80 px-3 py-2 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  onlineCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-2.5 w-2.5 rounded-full',
                  onlineCount > 0 ? 'bg-emerald-500' : 'bg-slate-600'
                )}
              />
            </div>
            <span className="font-display text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-200">
              Portugal Agora
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Jogadores Online */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold text-white font-mono">{onlineCount}</span>
            <span className="hidden sm:inline text-slate-400">online</span>
          </div>

          <div className="h-3.5 w-px bg-white/15" />

          {/* Distritos Ativos */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold text-white font-mono">{activeDistrictsCount}</span>
            <span className="hidden sm:inline text-slate-400">distritos</span>
          </div>

          {/* Confrontos (Apenas se > 0) */}
          {confrontationsCount > 0 && (
            <>
              <div className="h-3.5 w-px bg-white/15" />
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-amber-300">
                <Swords className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-bold font-mono">{confrontationsCount}</span>
                <span className="hidden sm:inline">disputas</span>
              </div>
            </>
          )}

          {/* Eventos Ativos */}
          {eventsCount > 0 && (
            <>
              <div className="h-3.5 w-px bg-white/15" />
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-rose-300">
                <Zap className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-bold font-mono">{eventsCount}</span>
                <span className="hidden md:inline">eventos</span>
              </div>
            </>
          )}
        </div>

        {/* Bloco 2: Seletor Rápido de Arquipélagos (Continente / Açores / Madeira) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1 rounded-2xl bg-slate-950/80 p-1 border border-white/10 backdrop-blur-md shadow-2xl">
          <button
            type="button"
            onClick={() => onSelectSector('continente')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              currentSector === 'continente'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-white/10'
            )}
          >
            🇵🇹 Continente
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('acores')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              currentSector === 'acores'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-white/10'
            )}
          >
            🌊 Açores
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('madeira')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              currentSector === 'madeira'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:bg-white/10'
            )}
          >
            🌺 Madeira
          </button>
        </div>

        {/* Bloco 3: Botões de Ação Tática (Scan, Camadas, 3D, Reset) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Scan Territorial */}
          <button
            type="button"
            onClick={onTriggerScan}
            disabled={isScanning}
            title="Executar Scan Territorial"
            className={cn(
              'flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold transition-all shadow-2xl backdrop-blur-md border cursor-pointer',
              isScanning
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30 hover:bg-cyan-950/50 hover:border-cyan-400'
            )}
          >
            <Radar className={cn('h-3.5 w-3.5', isScanning && 'animate-spin')} />
            <span className="hidden sm:inline">Scan Territorial</span>
          </button>

          {/* Camadas */}
          <button
            type="button"
            onClick={onToggleLayers}
            title="Configurar Camadas do Mapa"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Modo 3D / Orbital */}
          <button
            type="button"
            onClick={onToggle3D}
            title="Alternar Perspetiva 2D/3D"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Compass className="h-4 w-4" />
          </button>

          {/* Reset Overview */}
          <button
            type="button"
            onClick={onResetView}
            title="Repor Visão Nacional"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Seletor Mobile de Arquipélagos */}
      <div className="pointer-events-auto flex md:hidden self-center items-center gap-1 rounded-2xl bg-slate-950/80 p-1 border border-white/10 backdrop-blur-md shadow-xl">
        <button
          type="button"
          onClick={() => onSelectSector('continente')}
          className={cn(
            'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all',
            currentSector === 'continente'
              ? 'bg-cyan-500 text-slate-950 font-black'
              : 'text-slate-300'
          )}
        >
          🇵🇹 Continente
        </button>
        <button
          type="button"
          onClick={() => onSelectSector('acores')}
          className={cn(
            'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all',
            currentSector === 'acores'
              ? 'bg-cyan-500 text-slate-950 font-black'
              : 'text-slate-300'
          )}
        >
          🌊 Açores
        </button>
        <button
          type="button"
          onClick={() => onSelectSector('madeira')}
          className={cn(
            'px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all',
            currentSector === 'madeira'
              ? 'bg-cyan-500 text-slate-950 font-black'
              : 'text-slate-300'
          )}
        >
          🌺 Madeira
        </button>
      </div>
    </div>
  )
}
