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
  Users,
  Brain,
} from 'lucide-react'
import { PORTUGAL_DISTRICTS } from '@/data/districts'
import type { BotPlayerRecord, BotPopulationStatus, BotMatchSimulationResult } from '@/lib/bot-network/types'

interface ExtendedBotRecord extends BotPlayerRecord {
  intelligencePercent?: number
}

interface BotsViewProps {
  getIdToken: () => Promise<string | null>
}

export function BotsView({ getIdToken }: BotsViewProps) {
  const [bots, setBots] = useState<ExtendedBotRecord[]>([])
  const [population, setPopulation] = useState<BotPopulationStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [personalityFilter, setPersonalityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modais
  const [editingBot, setEditingBot] = useState<ExtendedBotRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [simBotA, setSimBotA] = useState<string>('')
  const [simBotB, setSimBotB] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<BotMatchSimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Form de edição
  const [editForm, setEditForm] = useState({
    displayName: '',
    district: '',
    level: 1,
    rating: 1000,
    intelligencePercent: 60,
    personality: 'NORMAL',
    difficulty: 'MEDIO',
    status: 'ACTIVE',
  })

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
      params.set('limit', '200')

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
    if (!confirm('Deseja gerar a rede de 125 bots V2 com identidades portuguesas autênticas e curva de 24h?')) return
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'generate_125' }),
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

  const handleToggleStatus = async (botId: string, currentStatus: string) => {
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

  const handleOpenEdit = (bot: ExtendedBotRecord) => {
    setEditingBot(bot)
    setEditForm({
      displayName: bot.displayName || '',
      district: bot.district || 'Lisboa',
      level: bot.level || 1,
      rating: bot.rating || 1000,
      intelligencePercent: bot.intelligencePercent || 60,
      personality: (bot as any).personality || 'NORMAL',
      difficulty: (bot as any).difficulty || 'MEDIO',
      status: bot.status || 'ACTIVE',
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBot) return

    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'update',
          botId: editingBot.id,
          botData: editForm,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast(`Bot ${editForm.displayName} atualizado com sucesso!`)
        setIsEditModalOpen(false)
        loadBots()
      } else {
        alert(data.error || 'Erro ao atualizar bot.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro na comunicação.')
    } finally {
      setIsSubmitting(false)
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

  const handleRestart24h = async () => {
    if (!confirm('Reiniciar o ciclo de 24 horas de ativação progressiva a partir do minuto 0?')) return
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
        showToast('Ciclo de 24 horas reiniciado com sucesso!')
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
        showToast('Duelo simulado com sucesso!')
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

      {/* PAINEL DE CONTROLO POPULACIONAL & PRESENCE */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Rede de Bots V2 • População Dinâmica
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
              Gestão de jogadores virtuais com identidades portuguesas autênticas, inteligência variável (1–99) e ativação progressiva.
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
              <span>Gerar Pool 125 Bots</span>
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
              onClick={handleRestart24h}
              title="Reiniciar Ciclo 24h"
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Linha do Tempo e Curva de 24 Horas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Ciclo de 24 Horas:{' '}
              <strong className="text-white">{population?.hoursElapsedSinceStart || 0}h / 24h decorridas</strong>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {population?.activeBots || 5} ativos agora / {population?.targetActiveByCurve || 5} alvo da curva ({population?.completionPercentage || 0}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-white/5 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-300 transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, population?.completionPercentage || 4))}%` }}
            />
          </div>
        </div>

        {/* Grade de 5 Métricas Chave */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">👤 Humanos Online</span>
            <span className="font-display font-black text-xl text-emerald-400">{population?.humanPlayersOnline || 1}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">⚔️ Partidas Ativas</span>
            <span className="font-display font-black text-xl text-amber-400">{population?.activeMatchesCount || 0}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">🤖 Bots Ativos</span>
            <span className="font-display font-black text-xl text-cyan-400">{population?.activeBots || 5}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Total na Pool</span>
            <span className="font-display font-black text-xl text-white">{population?.totalBotsInPool || 125}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Rating Médio / ELO</span>
            <span className="font-display font-black text-xl text-purple-400 font-mono">{population?.avgRating || 1240}</span>
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
            <option value="CASUAL">Casual (1-50%)</option>
            <option value="NORMAL">Normal (51-65%)</option>
            <option value="COMPETITIVO">Competitivo (66-75%)</option>
            <option value="ESPECIALISTA">Especialista (76-85%)</option>
            <option value="ELITE">Elite (86-99%)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all">🛡️ Todos os Estados</option>
            <option value="ACTIVE">✅ Ativos</option>
            <option value="INACTIVE">⚪ Inativos</option>
            <option value="IN_MATCH">⚔️ Em Partida</option>
            <option value="RETIRED">🛑 Reformados</option>
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
              <th className="px-5 py-3.5">Avatar & Jogador</th>
              <th className="px-4 py-3.5">Distrito</th>
              <th className="px-4 py-3.5">Nível / XP</th>
              <th className="px-4 py-3.5">Rating ELO</th>
              <th className="px-4 py-3.5">Inteligência</th>
              <th className="px-4 py-3.5">Personalidade</th>
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
                  <span>A carregar desafiantes virtuais...</span>
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
                const isRetired = b.status === 'RETIRED'

                return (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={b.avatar || '/images/avatars/camoes-2050.jpg'}
                          alt={b.displayName}
                          className="h-8 w-8 rounded-full border border-white/20 object-cover bg-slate-950"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-white truncate">{b.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">@{b.username} • #{b.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-300">📍 {b.district}</td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-400 font-mono">Nv.{b.level}</span>
                    </td>

                    <td className="px-4 py-3.5 font-bold font-mono text-amber-400">{b.rating} pts</td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Brain className="h-3 w-3 text-cyan-400" />
                        <span className="font-mono font-black text-cyan-300">{b.intelligencePercent || 60}%</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-300">{(b as any).personality || 'NORMAL'}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {((b.avgResponseTimeMs || 4000) / 1000).toFixed(1)}s
                    </td>

                    <td className="px-4 py-3.5">
                      {isRetired ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/10">
                          Reformado
                        </span>
                      ) : isInMatch ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Em Partida
                        </span>
                      ) : isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 text-[10px] font-bold cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Editar</span>
                        </button>

                        {!isRetired && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(b.id, b.status)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Pausar' : 'Ativar'}
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

      {/* MODAL: EDITAR BOT COMPLETO (PÚBLICO + PRIVADO) */}
      {isEditModalOpen && editingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={editingBot.avatar || '/images/avatars/camoes-2050.jpg'}
                  alt={editingBot.displayName}
                  className="h-10 w-10 rounded-full border border-white/20 object-cover bg-slate-950"
                />
                <div>
                  <h3 className="font-display font-black text-sm text-white">Editar Desafiante #{editingBot.id}</h3>
                  <span className="text-[10px] text-cyan-400 font-mono">Dados Públicos e Configuração Privada</span>
                </div>
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Nome de Apresentação:</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Distrito:</label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-bold"
                  >
                    {PORTUGAL_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Estado Operacional:</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-bold"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                    <option value="RETIRED">Reformado</option>
                  </select>
                </div>
              </div>

              {/* Slider de Inteligência (1 a 99) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    Percentagem de Inteligência:
                  </span>
                  <strong className="font-mono text-base text-cyan-400">{editForm.intelligencePercent}%</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={editForm.intelligencePercent}
                  onChange={(e) => setEditForm({ ...editForm, intelligencePercent: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  Determina a probabilidade base de acerto, tempo de hesitação e sensibilidade às categorias.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Nível (1–40):</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Rating ELO (800–2200):</label>
                  <input
                    type="number"
                    min="500"
                    max="3000"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider"
                >
                  {isSubmitting ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </form>
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
                      {b.displayName} (Nv.{b.level} • {b.intelligencePercent || 60}%)
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
                      {b.displayName} (Nv.{b.level} • {b.intelligencePercent || 60}%)
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
