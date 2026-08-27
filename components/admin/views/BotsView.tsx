'use client'

import React, { useState, useEffect } from 'react'
import {
  Bot,
  Plus,
  Play,
  Pause,
  Power,
  RefreshCw,
  Edit3,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Search,
  Swords,
  Clock,
  Trophy,
  Shield,
  Activity,
  RotateCcw,
} from 'lucide-react'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import type { BotPlayerRecord, BotPopulationStatus, BotMatchSimulationResult } from '@/lib/bot-network/types'

interface BotsViewProps {
  getIdToken: () => Promise<string | null>
}

export function BotsView({ getIdToken }: BotsViewProps) {
  const [bots, setBots] = useState<BotPlayerRecord[]>([])
  const [population, setPopulation] = useState<BotPopulationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [personalityFilter, setPersonalityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modais
  const [selectedBot, setSelectedBot] = useState<BotPlayerRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [simBotA, setSimBotA] = useState<string>('')
  const [simBotB, setSimBotB] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<BotMatchSimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Ações em massa
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadBots = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (districtFilter !== 'all') params.set('district', districtFilter)
      if (personalityFilter !== 'all') params.set('personality', personalityFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('limit', '300')

      const res = await fetch(`/api/admin/bots?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setBots(data.bots || [])
        setPopulation(data.population || null)
        if (data.bots?.length >= 2 && !simBotA) {
          setSimBotA(data.bots[0].id)
          setSimBotB(data.bots[1].id)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar bots:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBots()
  }, [districtFilter, personalityFilter, statusFilter])

  const handleGeneratePool = async () => {
    if (!confirm('Deseja gerar a pool completa de 457 desafiantes (157 ativos imediatamente + 300 nas próximas 15h)?')) return
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'generate_pool' }),
      })

      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        loadBots()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (botId: string) => {
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'toggle_status', botId }),
      })

      const data = await res.json()
      if (data.success) {
        showToast('Estado do bot alterado!')
        loadBots()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handlePauseResumeNetwork = async (pause: boolean) => {
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots/population', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: pause ? 'pause_network' : 'resume_network' }),
      })

      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        loadBots()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRestart15h = async () => {
    if (!confirm('Reiniciar o ciclo de 15 horas a partir de agora (157 ativos + 300 progressivos)?')) return
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots/population', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'restart_24h_cycle' }),
      })

      const data = await res.json()
      if (data.success) {
        showToast('Ciclo de 15 horas reiniciado com sucesso!')
        loadBots()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRunSimulation = async () => {
    if (!simBotA || !simBotB) return
    setIsSimulating(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ botIdA: simBotA, botIdB: simBotB }),
      })

      const data = await res.json()
      if (data.success) {
        setSimulationResult(data.simulation)
        showToast('Partida Bot vs Bot simulada com sucesso!')
      } else {
        alert(data.error || 'Erro na simulação.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro na comunicação.')
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-cyan-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-cyan-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* PAINEL DE CONTROLO POPULACIONAL (157 ATIVOS AGORA + 300 EM 15H) */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Rede de 457 Bots (157 Ativos Imediatos + 300 em 15h)
              </span>
              {population?.isPaused && (
                <span className="text-xs font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">
                  ⏸️ Rede Pausada
                </span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-xl sm:text-2xl font-black uppercase text-white">
              Centro de Desafiantes Virtuais (isBot: true)
            </h2>
            <p className="text-xs text-slate-400">
              157 bots 100% ativos nos rankings, distritos e duelos 1v1 neste momento, com +300 bots a ativar gradualmente ao longo das próximas 15 horas.
            </p>
          </div>

          {/* Botões de Ação Master */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-300 transition-all cursor-pointer"
            >
              <Swords className="h-4 w-4 text-amber-400" />
              <span>Simulador Bot vs Bot</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePool}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Gerar Pool 457 Bots</span>
            </button>

            {population?.isPaused ? (
              <button
                type="button"
                onClick={() => handlePauseResumeNetwork(false)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Retomar Rede</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handlePauseResumeNetwork(true)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-2 text-xs font-bold cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pausar Rede</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestart15h}
              title="Reiniciar Ciclo 15h"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Linha do Tempo e Curva de 15 Horas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Ciclo de 15 Horas:{' '}
              <strong className="text-white">{population?.hoursElapsedSinceStart || 0}h / 15h decorridas</strong>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {population?.activeBots || 157} ativos agora / {population?.targetActiveByCurve || 157} alvo ({population?.completionPercentage || 0}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-white/5 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-300 transition-all duration-500"
              style={{ width: `${Math.max(34, Math.min(100, population?.completionPercentage || 34))}%` }}
            />
          </div>
        </div>

        {/* Grade de 4 Métricas Chave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Total na Pool</span>
            <span className="font-display font-black text-xl text-white">{population?.totalBotsInPool || 457} bots</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">🟢 157 Ativos Imediatos</span>
            <span className="font-display font-black text-xl text-emerald-400">{population?.activeBots || 157}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">🕒 +300 em 15h</span>
            <span className="font-display font-black text-xl text-cyan-300">+{population?.inactiveBots || 300} agendados</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Rating Médio / ELO</span>
            <span className="font-display font-black text-xl text-amber-400 font-mono">{population?.avgRating || 1280} pts</span>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS E PESQUISA DA TABELA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            loadBots()
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, username ou BOT_ID..."
            className="w-full rounded-2xl border border-white/15 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">📍 Todos os Distritos</option>
            {PORTUGAL_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={personalityFilter}
            onChange={(e) => setPersonalityFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">🧠 Todas as Personalidades</option>
            <option value="CASUAL">Casual (45-60%)</option>
            <option value="NORMAL">Normal (60-75%)</option>
            <option value="COMPETITIVO">Competitivo (70-85%)</option>
            <option value="ESPECIALISTA">Especialista (&gt;90% chave)</option>
            <option value="ELITE">Elite (80-92%)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">🛡️ Todos os Estados</option>
            <option value="ACTIVE">✅ Ativos (157+)</option>
            <option value="INACTIVE">⚪ Inativos (Agendados)</option>
            <option value="IN_MATCH">⚔️ Em Partida</option>
          </select>

          <button
            type="button"
            onClick={loadBots}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* TABELA COMPLETA DE BOTS */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 bg-slate-950/60 font-display text-[10px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3.5">Bot ID & Nome</th>
              <th className="px-4 py-3.5">Distrito</th>
              <th className="px-4 py-3.5">Nível / XP</th>
              <th className="px-4 py-3.5">Rating ELO</th>
              <th className="px-4 py-3.5">Personalidade</th>
              <th className="px-4 py-3.5">Precisão</th>
              <th className="px-4 py-3.5">Tempo Médio</th>
              <th className="px-4 py-3.5">Estado</th>
              <th className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  <span>A carregar rede de desafiantes virtuais...</span>
                </td>
              </tr>
            ) : bots.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Nenhum bot encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              bots.map((b) => {
                const isActive = b.status === 'ACTIVE'
                const isInMatch = b.status === 'IN_MATCH'

                return (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                          🤖
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white truncate">{b.displayName}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">#{b.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-300">📍 {b.district}</td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-400 font-mono">Nv.{b.level}</span>
                    </td>

                    <td className="px-4 py-3.5 font-bold font-mono text-amber-400">{b.rating} pts</td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-cyan-300">{b.personality}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-white font-bold">{b.accuracyPercentage}%</td>

                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {((b.avgResponseTimeMs || 4000) / 1000).toFixed(1)}s
                    </td>

                    <td className="px-4 py-3.5">
                      {isInMatch ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Em Partida
                        </span>
                      ) : isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Ativo (157)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
                          Agendado (15h)
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBot(b)
                            setIsDetailModalOpen(true)
                          }}
                          className="px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-[10px] font-bold cursor-pointer"
                        >
                          Perfil
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(b.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isActive ? 'Pausar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: PERFIL COMPLETO DO BOT */}
      {isDetailModalOpen && selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  🤖
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white">{selectedBot.displayName}</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">ID: {selectedBot.id} • isBot: true</span>
                </div>
              </div>
              <button type="button" onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Distrito</span>
                  <span className="font-bold text-white">📍 {selectedBot.district}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Personalidade</span>
                  <span className="font-bold text-cyan-300">{selectedBot.personality}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Nível & Rating</span>
                  <span className="font-bold text-emerald-400 font-mono">Nv.{selectedBot.level} ({selectedBot.rating} ELO)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block">Vitórias / Derrotas</span>
                  <span className="font-bold text-white font-mono">{selectedBot.wins}V / {selectedBot.losses}D</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Especializações (Categorias Fortes):</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedBot.strengths || []).map((s) => (
                    <span key={s} className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ★ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Vulnerabilidades (Categorias Fracas):</span>
                <div className="flex flex-wrap gap-1">
                  {(selectedBot.weaknesses || []).map((w) => (
                    <span key={w} className="text-[10px] font-bold text-red-300 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SIMULADOR DE PARTIDAS BOT VS BOT (QA) */}
      {isSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-display font-black text-sm uppercase">
                <Swords className="h-5 w-5" />
                <span>Simulador de Duelos Bot vs Bot (QA Engine)</span>
              </div>
              <button type="button" onClick={() => setIsSimulatorOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Desafiante A:</label>
                <select
                  value={simBotA}
                  onChange={(e) => setSimBotA(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-bold"
                >
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.displayName} (Nv.{b.level} • {b.personality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Desafiante B:</label>
                <select
                  value={simBotB}
                  onChange={(e) => setSimBotB(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-bold"
                >
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.displayName} (Nv.{b.level} • {b.personality})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSimulating ? 'A calcular 10 perguntas e decisões estocásticas...' : 'Iniciar Simulação de Duelo'}
            </button>

            {/* Resultado da Simulação */}
            {simulationResult && (
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs animate-in zoom-in-95">
                <div className="grid grid-cols-3 items-center text-center p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20">
                  <div>
                    <span className="font-bold text-white block">{simulationResult.botA.name}</span>
                    <span className="font-display font-black text-xl text-emerald-400">{simulationResult.botA.score} pts</span>
                    <span className="text-[10px] text-slate-400 font-mono">{simulationResult.botA.correctCount}/10 acertos</span>
                  </div>

                  <div className="font-display font-black text-amber-400 text-sm">
                    {simulationResult.winnerId ? 'VENCEDOR' : 'EMPATE'}
                    <span className="block text-[9px] text-slate-400 mt-1 font-mono">{simulationResult.durationSeconds}s totais</span>
                  </div>

                  <div>
                    <span className="font-bold text-white block">{simulationResult.botB.name}</span>
                    <span className="font-display font-black text-xl text-cyan-400">{simulationResult.botB.score} pts</span>
                    <span className="text-[10px] text-slate-400 font-mono">{simulationResult.botB.correctCount}/10 acertos</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {simulationResult.questionsSummary.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 text-[11px]">
                      <span className="text-slate-400 font-bold">P{idx + 1} ({q.category})</span>
                      <div className="flex items-center gap-4 font-mono">
                        <span className={q.botACorrect ? 'text-emerald-400' : 'text-red-400'}>
                          A: {q.botACorrect ? '✓' : '✗'} ({q.botATime}s)
                        </span>
                        <span className={q.botBCorrect ? 'text-cyan-400' : 'text-red-400'}>
                          B: {q.botBCorrect ? '✓' : '✗'} ({q.botBTime}s)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
