'use client'

import React from 'react'
import Link from 'next/link'
import { X, Swords, MapPin, Zap, ExternalLink } from 'lucide-react'
import type { ActiveConfrontation } from '@/src/hooks/usePortugalVivoData'

interface DisputeContextCardProps {
  dispute: ActiveConfrontation
  onClose: () => void
}

export function DisputeContextCard({ dispute, onClose }: DisputeContextCardProps) {
  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:right-auto sm:left-5 z-40 w-auto sm:w-88 rounded-3xl bg-slate-950/95 p-4 sm:p-5 border border-amber-500/40 shadow-2xl backdrop-blur-xl animate-slideUp select-none">
      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Swords className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
                Disputa Territorial
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">
                ⚔ Em Direto
              </span>
            </div>
            <h3 className="font-display text-sm sm:text-base font-black uppercase text-white truncate">
              {dispute.districtA} vs {dispute.districtB}
            </h3>
          </div>
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

      {/* Comparação dos Territórios em Combate */}
      <div className="py-3 space-y-3 text-xs text-slate-300">
        <div className="grid grid-cols-2 gap-2">
          {/* Território A */}
          <div className="flex flex-col items-center rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
            <span className="font-display text-xs font-black uppercase text-white truncate max-w-[110px]">
              {dispute.districtA}
            </span>
            <div className="flex items-center gap-1 mt-1 font-mono text-xs font-bold text-amber-400">
              <Zap className="h-3 w-3" />
              <span>{dispute.powerFormattedA} Poder</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 font-mono">
              {dispute.onlineA} online
            </span>
          </div>

          {/* Território B */}
          <div className="flex flex-col items-center rounded-2xl bg-white/5 p-2.5 border border-white/5 text-center">
            <span className="font-display text-xs font-black uppercase text-white truncate max-w-[110px]">
              {dispute.districtB}
            </span>
            <div className="flex items-center gap-1 mt-1 font-mono text-xs font-bold text-cyan-400">
              <Zap className="h-3 w-3" />
              <span>{dispute.powerFormattedB} Poder</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-0.5 font-mono">
              {dispute.onlineB} online
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 border border-amber-500/20 text-[11px]">
          <span className="text-amber-300 font-medium">Vantagem territorial:</span>
          <span className="font-mono font-black text-white">
            {dispute.leaderName} (+{dispute.gapPower} pts)
          </span>
        </div>
      </div>

      {/* Ação */}
      <div className="pt-2 border-t border-white/10">
        <Link
          href={`/jogar/duelo?district=${encodeURIComponent(dispute.slugA)}`}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
        >
          <Swords className="h-3.5 w-3.5" />
          <span>Defender Território</span>
        </Link>
      </div>
    </div>
  )
}
