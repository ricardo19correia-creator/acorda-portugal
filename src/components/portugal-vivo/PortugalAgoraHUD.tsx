'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  MapPin,
  Swords,
  Zap,
  Layers,
  Compass,
  Radar,
  RotateCcw,
  Crosshair,
  Search,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapSector } from '@/src/game/world/PortugalSatelliteEngine'
import type { LivePulseMessage } from '@/src/hooks/usePortugalVivoData'
import { MapSearchBar, type SearchResultItem } from './MapSearchBar'

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
  onLocateMe: () => void
  onSelectSearchResult: (result: SearchResultItem) => void
  isScanning: boolean
  scanResultText?: string | null
  isLocating?: boolean
  livePulseMessages?: LivePulseMessage[]
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
  onLocateMe,
  onSelectSearchResult,
  isScanning,
  scanResultText,
  isLocating,
  livePulseMessages = [],
}: PortugalAgoraHUDProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [pulseIndex, setPulseIndex] = useState(0)

  // Rotação suave do feed contextual "O que está a acontecer"
  useEffect(() => {
    if (!livePulseMessages || livePulseMessages.length <= 1) return
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % livePulseMessages.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [livePulseMessages])

  const currentPulse = livePulseMessages[pulseIndex] || livePulseMessages[0]

  return (
    <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 flex flex-col gap-2 p-3 sm:p-4 select-none">
      <div className="flex items-center justify-between gap-2">
        {/* Bloco 1: PORTUGAL AGORA — 4 Métricas Estritamente Reais (ZERO MOCK DATA) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 rounded-2xl bg-slate-950/85 px-3 py-2 border border-white/10 backdrop-blur-md shadow-2xl overflow-x-auto scrollbar-none max-w-full">
          <div className="flex items-center gap-2 shrink-0">
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

          <div className="h-3.5 w-px bg-white/15 shrink-0" />

          {/* 1. Jogadores Online */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-300 shrink-0">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-bold text-white font-mono">{onlineCount}</span>
            <span className="hidden sm:inline text-slate-400">online</span>
          </div>

          <div className="h-3.5 w-px bg-white/15 shrink-0" />

          {/* 2. Distritos Ativos */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-300 shrink-0">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold text-white font-mono">{activeDistrictsCount}</span>
            <span className="hidden sm:inline text-slate-400">
              {activeDistrictsCount === 1 ? 'distrito' : 'distritos'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/15 shrink-0" />

          {/* 3. Disputas Reais (sempre exibido, 0 se vazio) */}
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] sm:text-xs font-medium shrink-0',
              confrontationsCount > 0 ? 'text-amber-300' : 'text-slate-400'
            )}
          >
            <Swords
              className={cn(
                'h-3.5 w-3.5',
                confrontationsCount > 0 ? 'text-amber-400' : 'text-slate-500'
              )}
            />
            <span className="font-bold font-mono text-white">{confrontationsCount}</span>
            <span className="hidden md:inline">
              {confrontationsCount === 1 ? 'disputa' : 'disputas'}
            </span>
          </div>

          <div className="h-3.5 w-px bg-white/15 shrink-0" />

          {/* 4. Eventos Reais (sempre exibido, 0 se vazio) */}
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] sm:text-xs font-medium shrink-0',
              eventsCount > 0 ? 'text-rose-300' : 'text-slate-400'
            )}
          >
            <Zap
              className={cn(
                'h-3.5 w-3.5',
                eventsCount > 0 ? 'text-rose-400' : 'text-slate-500'
              )}
            />
            <span className="font-bold font-mono text-white">{eventsCount}</span>
            <span className="hidden md:inline">
              {eventsCount === 1 ? 'evento' : 'eventos'}
            </span>
          </div>
        </div>

        {/* Bloco 2: Seletor Rápido de Arquipélagos (Desktop) */}
        <div className="pointer-events-auto hidden lg:flex items-center gap-1 rounded-2xl bg-slate-950/80 p-1 border border-white/10 backdrop-blur-md shadow-2xl">
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

        {/* Bloco 3: Botões de Ação Tática */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Botão de Pesquisa Instantânea */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            title="Pesquisar território ou cidade"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-2xl border backdrop-blur-md shadow-2xl transition-colors cursor-pointer',
              searchOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-950/80 text-slate-200 border-white/10 hover:bg-white/10'
            )}
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Botão "Minha Localização" */}
          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            title="Localizar a minha posição no mapa"
            className={cn(
              'flex items-center gap-1.5 rounded-2xl px-2.5 sm:px-3 py-2 text-xs font-bold transition-all shadow-2xl backdrop-blur-md border cursor-pointer',
              isLocating
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                : 'bg-slate-950/80 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/40 hover:border-emerald-400'
            )}
          >
            <Crosshair className={cn('h-3.5 w-3.5', isLocating && 'animate-spin')} />
            <span className="hidden sm:inline">Minha Posição</span>
          </button>

          {/* Scan Territorial */}
          <button
            type="button"
            onClick={onTriggerScan}
            disabled={isScanning}
            title="Executar Scan Territorial"
            className={cn(
              'flex items-center gap-1.5 rounded-2xl px-2.5 sm:px-3 py-2 text-xs font-bold transition-all shadow-2xl backdrop-blur-md border cursor-pointer',
              isScanning
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30 hover:bg-cyan-950/40 hover:border-cyan-400'
            )}
          >
            <Radar className={cn('h-3.5 w-3.5', isScanning && 'animate-spin')} />
            <span className="hidden md:inline">Scan Territorial</span>
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
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950/80 text-slate-200 border border-white/10 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-pointer"
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

      {/* Feed Contextual em Tempo Real "O Que Está a Acontecer" (ZERO MOCK DATA) */}
      {currentPulse && (
        <div className="pointer-events-auto self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/85 border border-white/10 text-xs shadow-xl backdrop-blur-md animate-fadeIn">
          <Activity className="h-3.5 w-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Em Direto:
          </span>
          <span className={cn('text-xs font-medium truncate max-w-[280px] sm:max-w-lg', currentPulse.color)}>
            {currentPulse.icon} {currentPulse.text}
          </span>
        </div>
      )}

      {/* Barra de Pesquisa Expansível */}
      {searchOpen && (
        <div className="pointer-events-auto self-start w-full sm:w-80 mt-1 animate-fadeIn">
          <MapSearchBar
            onSelectResult={(item) => {
              onSelectSearchResult(item)
              setSearchOpen(false)
            }}
            onClose={() => setSearchOpen(false)}
          />
        </div>
      )}

      {/* Banner de Resultado do Scan Territorial */}
      {scanResultText && (
        <div className="pointer-events-auto self-center sm:self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-2xl backdrop-blur-xl animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{scanResultText}</span>
        </div>
      )}

      {/* Seletor Mobile / Tablet de Arquipélagos */}
      <div className="pointer-events-auto flex lg:hidden self-center items-center gap-1 rounded-2xl bg-slate-950/80 p-1 border border-white/10 backdrop-blur-md shadow-xl mt-0.5">
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
