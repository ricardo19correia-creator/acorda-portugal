'use client'

import React from 'react'
import Link from 'next/link'
import { X, Zap, MapPin, Award } from 'lucide-react'
import type { NexusEvent } from '@/lib/portugal-map-nexus-data'

interface EventContextCardProps {
  event: NexusEvent
  onClose: () => void
}

export function EventContextCard({ event, onClose }: EventContextCardProps) {
  return (
    <div className="pointer-events-auto absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 left-3 right-3 sm:right-auto sm:left-5 z-40 w-auto sm:w-88 rounded-3xl bg-slate-950/95 p-4 sm:p-5 border border-rose-500/40 shadow-2xl backdrop-blur-xl animate-slideUp select-none">
      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[9px] font-black uppercase tracking-wider text-rose-300 border border-rose-500/30">
                Evento Especial
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ⚡ Em Curso
              </span>
            </div>
            <h3 className="font-display text-sm sm:text-base font-black uppercase text-white truncate">
              {event.title}
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

      {/* Descrição & Dados Geográficos */}
      <div className="py-3 space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="font-bold text-white">{event.district}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">Território de Batalha</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Recompensa:</span>
          </div>
          <span className="font-mono text-xs font-black text-emerald-400">
            +{event.xpReward.toLocaleString('pt-PT')} XP
          </span>
        </div>
      </div>

      {/* Ação */}
      <div className="pt-2 border-t border-white/10">
        <Link
          href={`/jogar?district=${encodeURIComponent(event.district.toLowerCase())}&event=${encodeURIComponent(event.id)}`}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 transition-all shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>Participar no Evento</span>
        </Link>
      </div>
    </div>
  )
}
