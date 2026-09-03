'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Globe, Loader2 } from 'lucide-react'

// Import dinâmico do mapa 3D com SSR desativado para garantir compatibilidade WebGL / Next.js
const Portugal3DMapboxViewDynamic = dynamic(
  () =>
    import('./Portugal3DMapboxView').then((mod) => mod.Portugal3DMapboxView),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[640px] sm:h-[720px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
          <Globe className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest">
          A INICIALIZAR RADAR 3D // PORTUGAL 2150
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          A carregar malha de relevo real da Serra da Estrela, Gerês e imagens de satélite de alta definição...
        </p>
      </div>
    ),
  }
)

export function Portugal3DMapboxWrapper(props: any) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-full h-[640px] sm:h-[720px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
          <Globe className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest">
          PORTUGAL 3D // A PREPARAR MOTORES
        </h3>
      </div>
    )
  }

  return <Portugal3DMapboxViewDynamic {...props} />
}
