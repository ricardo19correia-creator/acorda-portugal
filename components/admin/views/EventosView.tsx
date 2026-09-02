'use client'

import React from 'react'
import { Sparkles, Calendar, Flame, Trophy } from 'lucide-react'
import { EVENTS } from '@/lib/game-data'

export function EventosView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span>Eventos & Temporadas Competitivas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Eventos especiais temáticos por tempo limitado com bónus de recompensas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EVENTS.map((e, idx) => (
          <div
            key={idx}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                {e.tag}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">2x XP</span>
            </div>

            <h4 className="font-display font-black text-sm text-white">{e.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{e.timeLeft}</p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Recompensa</span>
              <span className="text-emerald-400 font-bold">{e.reward}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
