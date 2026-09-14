'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { X, Play, Trophy, Users, MapPin } from 'lucide-react'
import type { PortugalVivoDistrict } from '@/src/hooks/usePortugalVivoData'

interface DistrictActionPanelProps {
  district: PortugalVivoDistrict
  onClose: () => void
}

export function DistrictActionPanel({
  district,
  onClose,
}: DistrictActionPanelProps) {
  const router = useRouter()

  const handlePlay = () => {
    router.push(`/jogar?district=${encodeURIComponent(district.slug)}&play=true`)
  }

  return (
    <div className="pointer-events-auto absolute bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:right-auto sm:left-6 z-40 w-auto sm:w-80 rounded-3xl bg-slate-950/92 p-4 sm:p-5 border border-emerald-500/30 shadow-2xl backdrop-blur-xl select-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Topo do Painel */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            <MapPin className="h-3 w-3" />
            <span>{district.region}</span>
          </div>

          <h2 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-white truncate">
            {district.name}
          </h2>

          {district.motto && (
            <p className="text-[11px] text-slate-300 italic line-clamp-1">
              &ldquo;{district.motto}&rdquo;
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Métricas Estritamente Reais */}
      <div className="grid grid-cols-2 gap-2 my-3">
        {/* Jogadores Online (100% Real) */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Users className="h-3 w-3 text-emerald-400" />
            <span>Online</span>
          </div>
          <span className="mt-1 font-mono text-base sm:text-lg font-black text-emerald-400">
            {district.onlineNow}
          </span>
          <span className="text-[9px] text-slate-400">
            {district.onlineNow === 1 ? 'jogador agora' : 'jogadores agora'}
          </span>
        </div>

        {/* Posição no Ranking Nacional */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Ranking</span>
          </div>
          <span className="mt-1 font-mono text-base sm:text-lg font-black text-white">
            #{district.pos || 1}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {district.totalXp >= 1000 ? `${(district.totalXp / 1000).toFixed(1)}k XP` : `${district.totalXp || 0} XP`}
          </span>
        </div>
      </div>

      {/* Ação: Jogar pelo Território */}
      <button
        type="button"
        onClick={handlePlay}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
      >
        <Play className="h-3.5 w-3.5 fill-current" />
        <span>Jogar por {district.name}</span>
      </button>
    </div>
  )
}
