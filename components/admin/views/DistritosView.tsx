'use client'

import React from 'react'
import { MapPin, Users, Trophy, Flame } from 'lucide-react'
import { PORTUGAL_DISTRICTS } from '@/data/districts'

export function DistritosView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <span>18 Distritos de Portugal Continental + Ilhas</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitorização territorial do Desafio Nacional e batalha de distritos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PORTUGAL_DISTRICTS.map((d, i) => (
          <div
            key={d}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-2 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm text-white group-hover:text-emerald-400 transition-colors">
                📍 {d}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">#{i + 1}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
              <span className="text-slate-400">Território Oficial</span>
              <span className="font-black text-emerald-400 text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">
                ATIVO
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
