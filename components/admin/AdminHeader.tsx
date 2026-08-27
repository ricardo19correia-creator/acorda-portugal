'use client'

import React from 'react'
import {
  Menu,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Radio,
  ExternalLink,
} from 'lucide-react'
import type { AdminUserRecord } from '@/lib/admin-auth'

interface AdminHeaderProps {
  adminUser: AdminUserRecord | null
  onToggleSidebar: () => void
  onRefreshData: () => void
  isRefreshing?: boolean
  isEmergencyActive?: boolean
  activeModuleName?: string
}

export function AdminHeader({
  adminUser,
  onToggleSidebar,
  onRefreshData,
  isRefreshing = false,
  isEmergencyActive = false,
  activeModuleName = 'Dashboard',
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 sm:px-6 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          title="Alternar Barra Lateral"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-white">
            {activeModuleName}
          </h1>

          {isEmergencyActive && (
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400 animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              <span>Modo de Emergência Ativo</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Indicador de Conexão com Servidor em Tempo Real */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          </span>
          <span>Cockpit Conectado</span>
        </div>

        {/* Botão de Atualização Rápida */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          title="Atualizar Dados"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Badge do Administrador Conectado */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 text-slate-950 font-black text-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="font-bold text-xs text-white leading-none">
              {adminUser?.displayName || 'Proprietário'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 leading-none mt-0.5">
              {adminUser?.role === 'owner' ? '👑 PROPRIETÁRIO' : '🛡️ ADMIN'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
