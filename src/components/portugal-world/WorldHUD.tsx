'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Crosshair,
  Layers,
  Check,
  ChevronDown,
  Shield,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { DISTRICTS_LIST, type DistrictItem } from '@/src/data/districts'
import type { WorldSector, WorldLayersConfig } from '@/src/game/world/WorldState'
import { cn } from '@/lib/utils'

interface WorldHUDProps {
  activeSector: WorldSector
  onSelectSector: (sector: WorldSector) => void
  onSelectDistrict: (district: DistrictItem) => void
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  layers: WorldLayersConfig
  onToggleLayer: (layerKey: keyof WorldLayersConfig) => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function WorldHUD({
  activeSector,
  onSelectSector,
  onSelectDistrict,
  onReset,
  onZoomIn,
  onZoomOut,
  layers,
  onToggleLayer,
  isFullscreen,
  onToggleFullscreen,
}: WorldHUDProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [layersOpen, setLayersOpen] = useState(false)

  const filteredDistricts = searchQuery.trim()
    ? DISTRICTS_LIST.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.capital.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const LAYER_KEYS: { key: keyof WorldLayersConfig; label: string }[] = [
    { key: 'territorios', label: 'Territórios' },
    { key: 'cidades', label: 'Cidades' },
    { key: 'arenas', label: 'Arenas' },
    { key: 'landmarks', label: 'Landmarks' },
    { key: 'eventos', label: 'Eventos' },
    { key: 'ranking', label: 'Ranking Nacional' },
    { key: 'conexoes', label: 'Rede & Rios' },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 select-none isolate">
      {/* 1. TOP HEADER */}
      <header className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-cyan-500/20 bg-slate-950/80 px-3 py-2 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-xl">
        {/* Left: Brand & Return */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Voltar ao Início"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ACORDA PORTUGAL
              </span>
            </div>
            <h1 className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-100">
              MUNDO // 2150
            </h1>
          </div>
        </div>

        {/* Center: Sector Selector */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => onSelectSector('continente')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer',
              activeSector === 'continente'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Continente
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('acores')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer',
              activeSector === 'acores'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Açores
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('madeira')}
            className={cn(
              'px-3 py-1 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer',
              activeSector === 'madeira'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Madeira
          </button>
        </div>

        {/* Right: Quick Search & Layers */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border transition-all cursor-pointer active:scale-95',
                searchOpen
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              )}
              title="Pesquisar Distrito ou Cidade"
            >
              <Search className="h-4 w-4" />
            </button>

            {searchOpen && (
              <div className="absolute top-12 right-0 w-64 rounded-2xl border border-white/15 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-2xl">
                <input
                  type="text"
                  placeholder="Pesquisar território..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-500/50"
                />
                {filteredDistricts.length > 0 ? (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {filteredDistricts.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          onSelectDistrict(d)
                          setSearchOpen(false)
                          setSearchQuery('')
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-cyan-500/15 hover:text-cyan-300 transition-colors flex items-center justify-between"
                      >
                        <span className="font-bold text-white">{d.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">#{d.ranking}</span>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="text-[11px] text-slate-400 text-center py-2">Nenhum território encontrado</p>
                ) : null}
              </div>
            )}
          </div>

          {/* Central de Comando Button */}
          <Link
            href="/jogar"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/10"
            title="Abrir Central de Comando"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Central de Comando</span>
          </Link>

          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer active:scale-95"
              title={isFullscreen ? 'Sair do Ecrã Total' : 'Explorar em Ecrã Total'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
              )}
              <span className="hidden lg:inline">{isFullscreen ? 'Minimizar' : 'Ecrã Total'}</span>
            </button>
          )}

          {/* Layers Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLayersOpen(!layersOpen)}
              className={cn(
                'flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all cursor-pointer active:scale-95',
                layersOpen
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              )}
            >
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Camadas</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {layersOpen && (
              <div className="absolute top-12 right-0 w-48 rounded-2xl border border-white/15 bg-slate-950/95 p-2.5 shadow-2xl backdrop-blur-2xl space-y-1">
                {LAYER_KEYS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggleLayer(key)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className={layers[key] ? 'text-white font-medium' : 'text-slate-400'}>
                      {label}
                    </span>
                    {layers[key] && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BOTTOM FLOATING CONTROLS */}
      <footer className="flex items-end justify-between">
        {/* Mobile Sector Selector */}
        <div className="md:hidden pointer-events-auto flex items-center p-1 rounded-xl bg-slate-950/85 border border-white/10 text-[10px] backdrop-blur-md">
          <button
            type="button"
            onClick={() => onSelectSector('continente')}
            className={cn(
              'px-2 py-1 rounded-lg font-mono font-bold uppercase transition-all',
              activeSector === 'continente' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
            )}
          >
            Cont.
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('acores')}
            className={cn(
              'px-2 py-1 rounded-lg font-mono font-bold uppercase transition-all',
              activeSector === 'acores' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
            )}
          >
            Açores
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('madeira')}
            className={cn(
              'px-2 py-1 rounded-lg font-mono font-bold uppercase transition-all',
              activeSector === 'madeira' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
            )}
          >
            Madeira
          </button>
        </div>

        {/* Map Control Buttons */}
        <div className="pointer-events-auto flex flex-col items-center gap-1.5 ml-auto">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/85 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-900 transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
              title={isFullscreen ? 'Sair do Ecrã Total' : 'Explorar em Ecrã Total'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-cyan-400" />
              ) : (
                <Maximize2 className="h-4 w-4 text-cyan-400" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onReset}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/85 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-900 transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
            title="Recentrar Portugal"
          >
            <Crosshair className="h-4 w-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/85 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-900 transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
            title="Aproximar Zoom"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/85 border border-white/15 text-slate-300 hover:text-white hover:bg-slate-900 transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
            title="Afastar Zoom"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}
