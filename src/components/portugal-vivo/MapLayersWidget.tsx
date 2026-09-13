'use client'

import React from 'react'
import { Check, X, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MapLayersState } from '@/src/game/world/PortugalSatelliteEngine'

interface MapLayersWidgetProps {
  layers: MapLayersState
  onToggleLayer: (layer: keyof MapLayersState) => void
  onClose: () => void
}

export function MapLayersWidget({
  layers,
  onToggleLayer,
  onClose,
}: MapLayersWidgetProps) {
  const layerOptions: Array<{ key: keyof MapLayersState; label: string; icon: string }> = [
    { key: 'players', label: 'Jogadores Online', icon: '🟢' },
    { key: 'hotspots', label: 'Hotspots de Atividade', icon: '🔥' },
    { key: 'districts', label: 'Territórios / Distritos', icon: '🗺️' },
    { key: 'cities', label: 'Cidades Oficiais', icon: '🏙️' },
    { key: 'events', label: 'Eventos Especiais', icon: '⚡' },
    { key: 'confrontations', label: 'Disputas Territoriais', icon: '⚔️' },
    { key: 'satellite', label: 'Satélite Natural', icon: '🛰️' },
    { key: 'terrain', label: 'Relevo / Topografia', icon: '🏔️' },
    { key: 'roads', label: 'Rede Viária', icon: '🛣️' },
  ]

  return (
    <div className="absolute top-16 right-3 sm:right-4 z-40 w-64 rounded-3xl bg-slate-950/90 border border-white/10 p-3 shadow-2xl backdrop-blur-xl animate-fadeIn select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-200">
          <Eye className="h-3.5 w-3.5 text-cyan-400" />
          <span>Camadas do Território</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        {layerOptions.map((opt) => {
          const isActive = layers[opt.key]
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggleLayer(opt.key)}
              className={cn(
                'w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-left',
                isActive
                  ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent'
              )}
            >
              <span className="flex items-center gap-2">
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </span>
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-md border text-[10px] transition-colors',
                  isActive
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'border-white/20 bg-black/40'
                )}
              >
                {isActive && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
