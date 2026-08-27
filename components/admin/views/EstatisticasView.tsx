'use client'

import React from 'react'
import { BarChart3, TrendingUp, Users, Activity, Clock, CheckCircle2 } from 'lucide-react'

export function EstatisticasView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>Métricas e Desempenho Global da Plataforma</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estatísticas agregadas de atividade, taxa de acerto e horários de maior afluência.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Taxa Média de Acerto</span>
          <div className="font-display text-2xl font-black text-emerald-400 mt-2">74.2%</div>
          <p className="text-[11px] text-slate-400 mt-1">Geral em todos os modos</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Duração Média de Partida</span>
          <div className="font-display text-2xl font-black text-cyan-400 mt-2">1m 45s</div>
          <p className="text-[11px] text-slate-400 mt-1">10 perguntas por sessão</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categoria Mais Jogada</span>
          <div className="font-display text-xl font-black text-amber-400 mt-2">Futebol Português</div>
          <p className="text-[11px] text-slate-400 mt-1">Seguida de História e Portugal</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Horário de Pico</span>
          <div className="font-display text-2xl font-black text-white mt-2">21:00 — 23:30</div>
          <p className="text-[11px] text-slate-400 mt-1">Hora de Portugal continental</p>
        </div>
      </div>
    </div>
  )
}
