'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Users,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Coins,
  Edit3,
  RefreshCw,
  Trophy,
  Filter,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react'
import { VALID_DISTRICTS } from '@/data/districts'
import { cn } from '@/lib/utils'

interface JogadoresViewProps {
  getIdToken: () => Promise<string | null>
}

export function JogadoresView({ getIdToken }: JogadoresViewProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modais de Ação
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null)
  const [actionModalType, setActionModalType] = useState<'ban' | 'suspend' | 'coins' | 'edit' | null>(null)
  const [modalReason, setModalReason] = useState('')
  const [coinAmount, setCoinAmount] = useState<number>(100)
  const [editLevel, setEditLevel] = useState<number>(1)
  const [editXp, setEditXp] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadPlayers = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (districtFilter !== 'all') params.set('district', districtFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/players?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPlayers(data.players || [])
      }
    } catch (e) {
      console.error('Erro ao carregar jogadores:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlayers()
  }, [districtFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadPlayers()
  }

  const handleExecuteAction = async () => {
    if (!selectedPlayer || !actionModalType) return
    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) return

      let payload: any = {
        action: actionModalType,
        targetUid: selectedPlayer.uid,
        data: {},
      }

      if (actionModalType === 'ban') {
        payload.data.reason = modalReason || 'Violou as regras da comunidade.'
      } else if (actionModalType === 'suspend') {
        payload.data.reason = modalReason || 'Suspensão preventiva temporária.'
      } else if (actionModalType === 'coins') {
        payload.action = 'adjust_coins'
        payload.data.amount = coinAmount
        payload.data.reason = modalReason || 'Ajuste administrativo'
      } else if (actionModalType === 'edit') {
        payload.action = 'update_stats'
        payload.data.level = editLevel
        payload.data.xp = editXp
      }

      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        showToast(data.message || 'Ação executada com sucesso!')
        setActionModalType(null)
        setSelectedPlayer(null)
        loadPlayers()
      } else {
        alert(data.error || 'Erro ao executar ação.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao comunicar com o servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRestore = async (player: any) => {
    if (!confirm(`Restaurar a conta do jogador ${player.displayName || player.uid}?`)) return

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'restore',
          targetUid: player.uid,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast('Conta do jogador restaurada com sucesso!')
        loadPlayers()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-emerald-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, username, email ou UID..."
            className="w-full rounded-2xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro por Distrito */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">📍 Todos os Distritos</option>
            {VALID_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="all">🛡️ Todos os Estados</option>
            <option value="ACTIVE">✅ Ativos</option>
            <option value="SUSPENDED">⏳ Suspensos</option>
            <option value="BANNED">🚫 Banidos</option>
          </select>

          <button
            type="button"
            onClick={loadPlayers}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabela de Jogadores */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 bg-slate-950/60 font-display text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Jogador</th>
                <th className="px-4 py-3.5">Distrito</th>
                <th className="px-4 py-3.5">Nível / XP</th>
                <th className="px-4 py-3.5">Saldo (€)</th>
                <th className="px-4 py-3.5">V / D</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    <span>A carregar jogadores...</span>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum jogador encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                players.map((p) => {
                  const isBanned = p.banned || p.accountStatus === 'BANNED'
                  const isSuspended = p.suspended || p.accountStatus === 'SUSPENDED'

                  return (
                    <tr key={p.uid} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            {p.displayName?.[0]?.toUpperCase() || 'J'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-white truncate">{p.displayName || 'Jogador Anónimo'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{p.username || p.uid?.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-300">📍 {p.district || 'Não def.'}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-emerald-400">Nível {p.level || 1}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{(p.xp || 0).toLocaleString()} XP</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-bold font-mono text-amber-400">
                        €{(p.coins || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <span className="text-emerald-400">{p.wins || p.stats?.wins || 0}V</span> /{' '}
                        <span className="text-red-400">{p.losses || p.stats?.losses || 0}D</span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-white font-mono">
                        {p.rating || p.elo || 1000}
                      </td>

                      <td className="px-4 py-3.5">
                        {isBanned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                            Banido
                          </span>
                        ) : isSuspended ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            Suspenso
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ativo
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ajustar Moedas */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlayer(p)
                              setActionModalType('coins')
                            }}
                            className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                            title="Ajustar Moedas"
                          >
                            <Coins className="h-3.5 w-3.5" />
                          </button>

                          {/* Editar Stats */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlayer(p)
                              setEditLevel(p.level || 1)
                              setEditXp(p.xp || 0)
                              setActionModalType('edit')
                            }}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
                            title="Editar Nível/XP"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Banir / Suspender / Restaurar */}
                          {isBanned || isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(p)}
                              className="px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                            >
                              Restaurar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPlayer(p)
                                setActionModalType('ban')
                              }}
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Banir Jogador"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ação Administrativa */}
      {actionModalType && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                {actionModalType === 'ban' && '🚫 Banir Jogador'}
                {actionModalType === 'suspend' && '⏳ Suspender Jogador'}
                {actionModalType === 'coins' && '💰 Ajustar Saldo (€ Acorda)'}
                {actionModalType === 'edit' && '✏️ Editar Nível & XP'}
              </h3>
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <p>
                Alvo:{' '}
                <strong className="text-emerald-400">
                  {selectedPlayer.displayName || selectedPlayer.uid}
                </strong>
              </p>

              {actionModalType === 'coins' && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-400">Quantidade de Moedas (positivo para somar, negativo para subtrair):</label>
                  <input
                    type="number"
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white font-mono"
                  />
                </div>
              )}

              {actionModalType === 'edit' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Nível:</label>
                    <input
                      type="number"
                      value={editLevel}
                      onChange={(e) => setEditLevel(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">XP Total:</label>
                    <input
                      type="number"
                      value={editXp}
                      onChange={(e) => setEditXp(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {(actionModalType === 'ban' || actionModalType === 'suspend' || actionModalType === 'coins') && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Motivo da Ação (Audit Log):</label>
                  <input
                    type="text"
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Ex: Fraude de pontuação, comportamento tóxico, recompensa de evento..."
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'A processar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
