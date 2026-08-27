'use client'

import React, { useState, useEffect } from 'react'
import { FileText, RefreshCw, Clock, User, CheckCircle2, Shield } from 'lucide-react'

interface AuditoriaViewProps {
  getIdToken: () => Promise<string | null>
}

export function AuditoriaView({ getIdToken }: AuditoriaViewProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/audit?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setLogs(json.logs || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>Trilho Imutável de Auditoria (Admin Audit Log)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Registo criptograficamente rastreável de todas as ações executadas no Centro de Controlo.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 bg-slate-950/60 font-display text-[10px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Ação</th>
              <th className="px-4 py-3.5">Administrador</th>
              <th className="px-4 py-3.5">Entidade</th>
              <th className="px-4 py-3.5">Detalhes da Operação</th>
              <th className="px-4 py-3.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                  <span>A carregar registos de auditoria...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Nenhuma ação administrativa recente registada no log.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[11px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">
                    {l.adminEmail || l.adminUid?.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                    {l.entity}:{l.entityId}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{l.details || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {l.status || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
