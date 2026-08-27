'use client'

import React from 'react'
import { ShieldCheck, Lock, Key, Users, Eye, FileCheck } from 'lucide-react'
import type { AdminUserRecord } from '@/lib/admin-auth'

interface SegurancaViewProps {
  adminUser: AdminUserRecord | null
}

export function SegurancaView({ adminUser }: SegurancaViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Segurança & Autorização Server-Side</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Estado da blindagem criptográfica e privilégios da conta administradora.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Sessão Administrativa Atual</span>
          </h4>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">UID:</span>
              <span className="font-mono text-emerald-400 font-bold">{adminUser?.uid || '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Email:</span>
              <span className="font-bold text-white">{adminUser?.email || '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Cargo:</span>
              <span className="font-black text-amber-400 uppercase">
                {adminUser?.role === 'owner' ? '👑 PROPRIETÁRIO OFICIAL' : '🛡️ ADMINISTRADOR'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Estado da Chave:</span>
              <span className="font-bold text-emerald-400">VERIFICADO (JWT CRIPTOGRÁFICO)</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-cyan-400" />
            <span>Defesas do Firestore & Regras de Acesso</span>
          </h4>

          <div className="space-y-2 text-slate-300">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Todas as mutações de base de dados administrativas estão bloqueadas pelo <strong className="text-white">Firestore Security Rules</strong> para clientes normais.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-[10px] text-emerald-300 space-y-1">
              <div>✓ adminUsers/* (Apenas Admin/Owner)</div>
              <div>✓ adminAuditLogs/* (Append-only estrito)</div>
              <div>✓ adminSettings/* (Apenas Admin/Owner)</div>
              <div>✓ botPlayers/* (Apenas Admin/Owner)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
