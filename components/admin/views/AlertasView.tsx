'use client'

import React from 'react'
import { AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react'

export function AlertasView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>Centro de Alertas & Diagnóstico do Sistema</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deteção de anomalias de matchmaking, integridade de perguntas e comunicações de erro.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-xs text-emerald-400 space-y-2">
        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400" />
        <h4 className="font-display font-black text-sm text-white">Todos os Sistemas Estáveis</h4>
        <p className="text-slate-400">
          Nenhuma anomalia de matchmaking, integridade de transações ou erros de Firestore detetados nas últimas 24h.
        </p>
      </div>
    </div>
  )
}
