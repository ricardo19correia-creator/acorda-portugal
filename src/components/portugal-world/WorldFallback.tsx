'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, Play, RefreshCw } from 'lucide-react'
import { PortugalVectorFallback } from '@/components/portugal-map/PortugalVectorFallback'
import { useWorldState } from '@/src/game/world/WorldStateProvider'
import type { DistrictItem } from '@/src/data/districts'
import type { MapArenaPOI } from '@/components/portugal-map/types'

interface WorldFallbackProps {
  onRetry?: () => void
}

export function WorldFallback({ onRetry }: WorldFallbackProps) {
  const {
    districts,
    selectedDistrict,
    selectDistrict,
    selectArena,
    hoverDistrict,
  } = useWorldState()

  // Convert DistrictItem to DistrictWarTerritory format expected by vector fallback
  const fallbackTerritories = districts.map((d) => ({
    id: d.id,
    name: d.name,
    pos: d.ranking,
    power: d.score,
    dominantColor: d.dominantColor,
    leader: null,
    playerCount: d.players,
    path: '',
    centroid: [0, 0] as [number, number],
  }))

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" />
        <span>MODO TÁTICO 2D // FALLBACK WEBGL</span>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="absolute top-4 right-4 z-20 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Tentar 3D Novamente</span>
        </button>
      )}

      <div className="w-full h-full max-w-4xl max-h-[85vh]">
        <PortugalVectorFallback
          territories={fallbackTerritories as any}
          selectedDistrict={selectedDistrict?.name || 'Porto'}
          onSelectDistrict={(name) => selectDistrict(name)}
          onSelectArena={(arena) => selectArena(arena)}
          onHoverDistrict={(name) => {
            const found = districts.find((d) => d.name.toLowerCase() === name?.toLowerCase())
            hoverDistrict(found || null)
          }}
        />
      </div>
    </div>
  )
}
