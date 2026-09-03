'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Globe } from 'lucide-react'

function MapSkeleton() {
  return (
    <div className="relative w-full h-[640px] sm:h-[720px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <Globe className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto" />
      </div>
      <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400">
        PORTUGAL 3D // REAL-TIME SATELLITE
      </span>
      <span className="text-[11px] text-slate-400 mt-1 font-mono">
        A carregar relevo da Serra da Estrela e Gerês...
      </span>
    </div>
  )
}

// Import dinâmico com SSR desativado para garantir isolamento total de WebGL
const Portugal3DMapboxView = dynamic(
  () =>
    import('./Portugal3DMapboxView').then((mod) => mod.Portugal3DMapboxView),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
)

export function Portugal3DMapboxWrapper(props: any) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <MapSkeleton />
  }

  return <Portugal3DMapboxView {...props} />
}
