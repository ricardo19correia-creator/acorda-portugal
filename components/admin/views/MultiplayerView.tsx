'use client'

import React, { useState, useEffect } from 'react'
import {
  Swords,
  Users,
  RefreshCw,
  Clock,
  Ban,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react'

interface MultiplayerViewProps {
  getIdToken: () => Promise<string | null>
}

export function MultiplayerView({ getIdToken }: MultiplayerViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDuel, setSelectedDuel] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadDuels = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/duels', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (e) {
      console.error('Erro ao obter dados de multiplayer:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDuels()
    const interval = setInterval(loadDuels, 6000)
    return () => clearInterval(interval)
  }, [])

  const handleForceCancel = async (duelId: string) => {
    if (!confirm(`Tem a certeza que deseja terminar forçadamente o duelo ${duelId}?`)) return

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/duels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'terminate_duel',
          duelId,
          reason: 'Terminado pelo Administrador no Centro de Controlo.',
        }),
      })

      const json = await res.json()
      if (json.success) {
        showToast(json.message || 'Duelo cancelado com sucesso.')
        loadDuels()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const activeDuels = data?.activeDuels || []
  const queueTickets = data?.queueTickets || []
  const recentFinishedGames = data?.recentFinishedGames || []

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-emerald-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Banner Multiplayer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Radio className="h-3 w-3 animate-pulse text-red-500" />
              Salas 1v1 em Tempo Real
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Monitorização de duelos ativos, progresso de perguntas, jogadores humanos vs bots e fila de matchmaking.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDuels}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Atualizar Duelos</span>
        </button>
      </div>

      {/* Grade de Duelos Ativos */}
      <div className="space-y-4">
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Swords className="h-4 w-4 text-amber-400" />
          <span>Duelos em Curso ({activeDuels.length})</span>
        </h3>

        {activeDuels.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center text-xs text-slate-400">
            <Swords className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <span>Nenhuma partida 1v1 ativa neste momento.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDuels.map((duel: any) => {
              const p1 = duel.player1 || {}
              const p2 = duel.player2 || {}

              return (
                <div
                  key={duel.id}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                      ID: {duel.id?.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {duel.status || 'PLAYING'}
                    </span>
                  </div>

                  {/* Confronto */}
                  <div className="grid grid-cols-11 items-center gap-2 text-center text-xs">
                    {/* Jogador 1 */}
                    <div className="col-span-5 flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 mb-1">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-white truncate max-w-full">{p1.displayName || 'Jogador 1'}</span>
                      <span className="text-[10px] text-slate-400">📍 {p1.district || 'Lisboa'}</span>
                      <span className="text-emerald-400 font-mono font-bold mt-1">{p1.score || 0} pts</span>
                    </div>

                    {/* VS */}
                    <div className="col-span-1 font-display font-black text-amber-400 text-sm">
                      VS
                    </div>

                    {/* Jogador 2 */}
                    <div className="col-span-5 flex flex-col items-center p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30 mb-1">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-white truncate max-w-full">
                        {p2.displayName || 'Jogador 2'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        📍 {p2.district || 'Portugal'}
                      </span>
                      <span className="text-cyan-400 font-mono font-bold mt-1">{p2.score || 0} pts</span>
                    </div>
                  </div>

                  {/* Informações da Sala */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                    <span>
                      Progresso: <strong className="text-white">{(duel.currentQuestionIndex || 0) + 1}/10</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleForceCancel(duel.id)}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Terminar Duelo</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fila de Matchmaking */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
        <h3 className="font-display text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>Fila de Espera de Matchmaking ({queueTickets.length})</span>
        </h3>

        {queueTickets.length === 0 ? (
          <p className="text-xs text-slate-400">A fila de espera está vazia no momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {queueTickets.map((t: any) => (
              <div key={t.id} className="p-3 rounded-2xl border border-white/5 bg-slate-950/60 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{t.playerName || t.userId?.slice(0, 8)}</span>
                  <span className="text-[10px] text-amber-400 font-mono">Rating: {t.rating || 1000}</span>
                </div>
                <span className="text-[10px] text-slate-400 block">📍 {t.district || 'Lisboa'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
