'use client'

import React from 'react'
import { Target, Flame, Brain, Award, Sparkles } from 'lucide-react'
import { MISSIONS } from '@/lib/game-data'

export function MissoesView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            <span>Missões Diárias & Semanais</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuração de requisitos, metas e recompensas de XP/Moedas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MISSIONS.map((m, i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                <Target className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {m.reward}
              </span>
            </div>

            <h4 className="font-bold text-sm text-white">{m.title}</h4>
            <p className="text-xs text-slate-400">Meta: {m.total} ações no jogo</p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estado</span>
              <span className="text-emerald-400 font-bold">Ativa</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
