'use client'

import React from 'react'
import type { MapEngineState } from './types'
import { cn } from '@/lib/utils'
import { Globe, Radio, Shield, Mountain } from 'lucide-react'

interface MapStatusBadgeProps {
  state: MapEngineState
  className?: string
}

export function MapStatusBadge({ state, className }: MapStatusBadgeProps) {
  const getStatusInfo = () => {
    if (!state.isReady) {
      return {
        label: 'A CALIBRAR MOTOR 3D...',
        sub: 'A carregar terreno e satélite',
        color: 'text-amber-400',
        dot: 'bg-amber-400',
        icon: Globe,
      }
    }

    if (!state.is3DSupported) {
      return {
        label: 'MODO VETORIAL — ATIVO',
        sub: 'WebGL desativado ou incompatível',
        color: 'text-cyan-400',
        dot: 'bg-cyan-400',
        icon: Shield,
      }
    }

    if (state.activeMode === 'satellite') {
      return {
        label: state.isTerrainActive ? 'SATÉLITE 3D — ONLINE' : 'SATÉLITE — ONLINE',
        sub: state.isUsingFallbackImagery
          ? 'Satélite Alta Resolução // Aberto'
          : 'Satélite Alta Resolução // Mapbox',
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
        icon: Globe,
      }
    }

    if (state.activeMode === 'terrain') {
      return {
        label: 'RELEVO TOPOGRÁFICO — ONLINE',
        sub: 'Elevação DEM ativa',
        color: 'text-amber-300',
        dot: 'bg-amber-400',
        icon: Mountain,
      }
    }

    if (state.activeMode === 'tactical') {
      return {
        label: 'GRELHA TÁTICA 2150 — ATIVA',
        sub: 'Dados distritais em tempo real',
        color: 'text-cyan-400',
        dot: 'bg-cyan-400',
        icon: Radio,
      }
    }

    // night
    return {
      label: 'ÓRBITA NOTURNA — ONLINE',
      sub: 'Iluminação urbana nacional',
      color: 'text-indigo-400',
      dot: 'bg-indigo-400',
      icon: Globe,
    }
  }

  const info = getStatusInfo()
  const Icon = info.icon

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md shadow-lg transition-all',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            info.dot
          )}
        />
        <span className={cn('relative inline-flex rounded-full h-2 w-2', info.dot)} />
      </span>

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-mono text-[9px] font-black uppercase tracking-wider',
            info.color
          )}
        >
          {info.label}
        </span>
        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[170px] sm:max-w-none">
          {info.sub}
        </span>
      </div>
    </div>
  )
}
