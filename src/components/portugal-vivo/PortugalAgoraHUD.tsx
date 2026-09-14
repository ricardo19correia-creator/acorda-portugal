'use client'

import React from 'react'
import {
  Users,
  Crosshair,
  Plus,
  Minus,
  RotateCcw,
  Compass,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapSector } from '@/src/game/world/PortugalSatelliteEngine'

interface PortugalAgoraHUDProps {
  onlineCount: number
  currentSector: MapSector
  onSelectSector: (sector: MapSector) => void
  onToggle3D: () => void
  onResetView: () => void
  onLocateMe: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  isLocating?: boolean
  geoNoticeText?: string | null
}

export function PortugalAgoraHUD({
  onlineCount,
  currentSector,
  onSelectSector,
  onToggle3D,
  onResetView,
  onLocateMe,
  onZoomIn,
  onZoomOut,
  isLocating,
  geoNoticeText,
}: PortugalAgoraHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden">
      {/* 1. TOPO: Branding Minimalista + Contador Real + Seletor de Território */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Bloco Título & Presença Real */}
        <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-slate-950/85 px-3.5 py-2 border border-emerald-500/20 backdrop-blur-xl shadow-2xl shadow-black/50 self-start">
          <div className="flex items-center gap-2">
            <span className="text-base">🇵🇹</span>
            <div className="flex flex-col">
              <span className="font-display text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-100">
                Acorda Portugal
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                Território Nacional
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/15" />

          <div className="flex items-center gap-1.5 font-mono">
            <div className="relative flex h-2 w-2">
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  onlineCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                )}
              />
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  onlineCount > 0 ? 'bg-emerald-500' : 'bg-slate-600'
                )}
              />
            </div>
            <span className="text-xs font-black text-white">{onlineCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Online
            </span>
          </div>
        </div>

        {/* Seletor de Território: Continente | Açores | Madeira */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectSector('continente')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
              currentSector === 'continente'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            )}
          >
            Continente
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('acores')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
              currentSector === 'acores'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            )}
          >
            Açores
          </button>
          <button
            type="button"
            onClick={() => onSelectSector('madeira')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
              currentSector === 'madeira'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            )}
          >
            Madeira
          </button>
        </div>
      </div>

      {/* 2. NOTIFICAÇÃO CONTEXTUAL DE GPS (Se ativa) */}
      {geoNoticeText && (
        <div className="pointer-events-auto self-center -mt-8 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-xl animate-bounce">
          {geoNoticeText}
        </div>
      )}

      {/* 3. CONTROLOS LATERAIS DIREITOS (Zoom, Localização, 3D, Reset) */}
      <div className="pointer-events-auto self-end flex flex-col gap-2 mb-16 sm:mb-6">
        <button
          type="button"
          onClick={onLocateMe}
          disabled={isLocating}
          className={cn(
            'flex h-11 sm:h-12 px-3.5 items-center justify-center gap-2 rounded-2xl border text-xs font-black uppercase tracking-wider backdrop-blur-xl shadow-2xl transition-all active:scale-95 cursor-pointer',
            isLocating
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-950/90 hover:bg-slate-900 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-emerald-500/10'
          )}
          title="📍 Minha Localização GPS"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          ) : (
            <Crosshair className="h-4 w-4 text-emerald-400" />
          )}
          <span className="hidden sm:inline">Minha Localização</span>
        </button>

        <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden self-end">
          <button
            type="button"
            onClick={onZoomIn}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 cursor-pointer"
            title="Aproximar (+)"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Afastar (-)"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-xl shadow-2xl overflow-hidden self-end">
          <button
            type="button"
            onClick={onToggle3D}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-colors border-b border-white/10 cursor-pointer"
            title="Perspectiva 3D"
          >
            <Compass className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onResetView}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Repor Visão Nacional"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
