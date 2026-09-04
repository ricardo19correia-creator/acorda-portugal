'use client'

import React from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapControlsClusterProps {
  is3D: boolean
  isFullscreen: boolean
  showArenas: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetPortugal: () => void
  onToggle3D: () => void
  onToggleFullscreen: () => void
  onToggleArenas: () => void
  className?: string
}

export function MapControlsCluster({
  is3D,
  isFullscreen,
  showArenas,
  onZoomIn,
  onZoomOut,
  onResetPortugal,
  onToggle3D,
  onToggleFullscreen,
  onToggleArenas,
  className,
}: MapControlsClusterProps) {
  return (
    <div
      className={cn(
        'absolute right-3 sm:right-6 top-32 sm:top-28 z-30 flex flex-col gap-2 pointer-events-auto',
        className
      )}
    >
      {/* Zoom In & Out */}
      <div className="flex flex-col rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={onZoomIn}
          title="Aproximar (+)"
          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors border-b border-white/10 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          title="Afastar (-)"
          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Reset to Portugal view */}
      <button
        type="button"
        onClick={onResetPortugal}
        title="Centrar Portugal"
        className="h-10 w-10 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* 3D Pitch toggle */}
      <button
        type="button"
        onClick={onToggle3D}
        title={is3D ? 'Vista 2D (Zenital)' : 'Vista 3D (Perspetiva)'}
        className={cn(
          'h-10 w-10 rounded-2xl border backdrop-blur-md shadow-xl flex items-center justify-center transition-all cursor-pointer font-mono text-xs font-black',
          is3D
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            : 'bg-slate-950/85 border-white/15 text-slate-400 hover:text-white hover:border-white/30'
        )}
      >
        <span>3D</span>
      </button>

      {/* Toggle Arena Markers */}
      <button
        type="button"
        onClick={onToggleArenas}
        title={showArenas ? 'Ocultar Arenas' : 'Mostrar Arenas'}
        className={cn(
          'h-10 w-10 rounded-2xl border backdrop-blur-md shadow-xl flex items-center justify-center transition-all cursor-pointer',
          showArenas
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            : 'bg-slate-950/85 border-white/15 text-slate-400 hover:text-white hover:border-white/30'
        )}
      >
        <MapPin className="w-4 h-4" />
      </button>

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Sair de Ecrã Inteiro' : 'Ecrã Inteiro'}
        className="h-10 w-10 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl flex items-center justify-center text-slate-300 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
