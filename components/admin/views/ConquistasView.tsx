'use client'

import React from 'react'
import { Award, Trophy, Star, CheckCircle2 } from 'lucide-react'
import { ACHIEVEMENTS_LIST } from '@/data/achievements'

export function ConquistasView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <span>Catálogo de Conquistas Oficiais ({ACHIEVEMENTS_LIST.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Conquistas de maestria, progresso e feitos lendários desbloqueáveis pelos jogadores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS_LIST.map((ach) => (
          <div
            key={ach.id}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 text-lg">
                {ach.icon || '🏅'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +€{ach.reward.coins} Moedas
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">{ach.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{ach.description}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Recompensa</span>
              <span className="text-amber-400 font-mono font-bold">+€{ach.reward.coins || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
