'use client'

import React, { useState, useEffect } from 'react'
import { Coins, TrendingUp, RefreshCw, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface EconomiaViewProps {
  getIdToken: () => Promise<string | null>
}

export function EconomiaView({ getIdToken }: EconomiaViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [targetUid, setTargetUid] = useState('')
  const [amount, setAmount] = useState<number>(500)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadEconomy = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/economy', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json.economy)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEconomy()
  }, [])

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetUid) return
    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/economy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUid,
          amount,
          reason: reason || 'Injeção manual administrativa',
        }),
      })

      const json = await res.json()
      if (json.success) {
        showToast(json.message || 'Moedas ajustadas com sucesso!')
        setTargetUid('')
        setReason('')
        loadEconomy()
      } else {
        alert(json.error || 'Erro ao ajustar moedas.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro de comunicação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-amber-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-amber-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Visão Geral da Economia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Moedas em Circulação</span>
          <div className="font-display text-2xl font-black text-amber-400 mt-2">
            €{(data?.totalCirculatingCoinsSample || 0).toLocaleString('pt-PT')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Amostra de carteiras ativas</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recompensa Base por Vitória</span>
          <div className="font-display text-2xl font-black text-emerald-400 mt-2">
            €50 Moedas
          </div>
          <p className="text-[11px] text-slate-400 mt-1">+ Bónus por sequência de acertos</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transações Registadas</span>
          <div className="font-display text-2xl font-black text-cyan-400 mt-2">
            {data?.recentTransactions?.length || 0} recentes
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Registo append-only no Firestore</p>
        </div>
      </div>

      {/* Formulário de Injeção / Débito de Moedas */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-400" />
          <span>Injeção / Ajuste Manual de Saldo (€ Acorda)</span>
        </h3>

        <form onSubmit={handleAdjustCoins} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-400">UID do Jogador:</label>
            <input
              type="text"
              required
              value={targetUid}
              onChange={(e) => setTargetUid(e.target.value)}
              placeholder="Ex: u8Yw... ou UID do Firebase"
              className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-400">Quantidade (€):</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-400">Motivo (Audit Log):</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Recompensa de torneio nacional..."
              className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'A processar...' : 'Aplicar Ajuste'}
            </button>
          </div>
        </form>
      </div>

      {/* Histórico de Transações */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
          Transações Recentes da Economia
        </h3>

        <div className="space-y-2">
          {(data?.recentTransactions || []).length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma transação recente encontrada.</p>
          ) : (
            data.recentTransactions.map((tx: any, idx: number) => (
              <div
                key={tx.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-slate-950/60 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{tx.type || 'TRANSAÇÃO'}</span>
                  <span className="text-[10px] text-slate-400 font-mono">UID: {tx.userId?.slice(0, 10)}... • {tx.reason || 'Sem motivo'}</span>
                </div>
                <span className="font-bold font-mono text-amber-400 text-sm">
                  +€{tx.amount || 0}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
