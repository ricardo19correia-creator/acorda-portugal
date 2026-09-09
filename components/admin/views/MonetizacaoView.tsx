'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Coins,
  Package,
} from 'lucide-react'

interface MonetizacaoViewProps {
  getIdToken: () => Promise<string | null>
}

export function MonetizacaoView({ getIdToken }: MonetizacaoViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/monetization', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json.metrics)
      } else {
        showToast(json.error || 'Erro ao carregar dados.')
      }
    } catch (e: any) {
      console.error(e)
      showToast('Falha na comunicação com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-amber-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-amber-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Header com botão de atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            <span>Monetização & Google Play Billing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas oficiais de compras in-app, Acordas concedidas e validações em tempo real.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Compras */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Compras</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-black text-white">
            {data?.totalCompras ?? 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {data?.comprasProcessadas ?? 0} concluídas com sucesso
          </p>
        </div>

        {/* Acordas Vendidas */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Acordas Concedidas</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-display text-2xl font-black text-amber-400">
            🟡 {(data?.acordasVendidas || 0).toLocaleString('pt-PT')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Moeda virtual entregue via transação</p>
        </div>

        {/* Receita Reportada */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Receita Reportada</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-black text-emerald-400">
            €{(data?.receitaReportada || 0).toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Google Play Store bruto</p>
        </div>

        {/* Produto Mais Vendido */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Mais Vendido</span>
            <Package className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="font-display text-base font-black text-cyan-400 truncate">
            {data?.produtoMaisVendido || 'Nenhum'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Produto com maior procura</p>
        </div>
      </div>

      {/* Estados Secundários */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Compras Pendentes</span>
            <div className="text-lg font-black text-white">{data?.comprasPendentes ?? 0}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Erros / Canceladas</span>
            <div className="text-lg font-black text-white">{data?.comprasComErro ?? 0}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Proteção Anti-Duplicação</span>
            <div className="text-lg font-black text-emerald-400">Ativa (Idempotente)</div>
          </div>
        </div>
      </div>

      {/* Tabela de Transações Recentes */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
          Últimas Transações Google Play Billing
        </h3>

        {(!data?.recentPurchases || data.recentPurchases.length === 0) ? (
          <div className="py-12 text-center text-xs text-slate-500 font-bold">
            Ainda não foram registadas transações do Google Play.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Data</th>
                  <th className="pb-3 px-3">Produto</th>
                  <th className="pb-3 px-3">Acordas</th>
                  <th className="pb-3 px-3">Valor</th>
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Purchase Token (Ofuscado)</th>
                  <th className="pb-3 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {data.recentPurchases.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 text-slate-300 font-sans">{tx.date}</td>
                    <td className="py-3 px-3 font-bold text-white font-sans">{tx.productName}</td>
                    <td className="py-3 px-3 text-amber-400 font-bold font-sans">
                      +{tx.acordasGranted?.toLocaleString('pt-PT')}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">€{tx.priceEur}</td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">{tx.orderId}</td>
                    <td className="py-3 px-3 text-slate-500">{tx.maskedToken}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluída
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
