'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Globe } from 'lucide-react'

// 1. ELIMINAR SSR DO MAPBOX:
// O componente do mapa é importado exclusivamente via dynamic com { ssr: false }.
// Nenhuma lógica, canvas ou árvore do Mapbox é executada no servidor.
const PortugalMapComponent = dynamic(
  () =>
    import('@/components/portugal-map/PortugalMapComponent').then(
      (mod) => mod.PortugalMapComponent
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative w-full h-[100dvh] min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
        suppressHydrationWarning
      >
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto" />
        </div>
        <span
          className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400"
          suppressHydrationWarning
        >
          A CARREGAR MAPA NACIONAL // PORTUGAL 2150
        </span>
        <span
          className="text-[10px] font-mono text-emerald-400/90 mt-2 uppercase tracking-widest"
          suppressHydrationWarning
        >
          BUILD-ID: MAP2150-REAL-001
        </span>
      </div>
    ),
  }
)

export default function PortugalMapaPage() {
  return <PortugalMapComponent />
}
