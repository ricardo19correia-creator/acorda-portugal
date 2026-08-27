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
} from 'lucide-react'
import { MAIN_CATEGORIES } from '@/lib/categories-data'
import { VALID_DISTRICTS } from '@/data/districts'

interface BotsViewProps {
  getIdToken: () => Promise<string | null>
}

export function BotsView({ getIdToken }: BotsViewProps) {
  const [bots, setBots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBot, setSelectedBot] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isMassConfirmOpen, setIsMassConfirmOpen] = useState(false)
  const [massTargetStatus, setMassTargetStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Formulário de Criação/Edição
  const [formName, setFormName] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formDistrict, setFormDistrict] = useState('Lisboa')
  const [formLevel, setFormLevel] = useState<number>(10)
  const [formAccuracy, setFormAccuracy] = useState<number>(75)
  const [formResponseTimeMs, setFormResponseTimeMs] = useState<number>(3500)
  const [formPersonality, setFormPersonality] = useState<'CASUAL' | 'NORMAL' | 'COMPETITIVO' | 'ESPECIALISTA' | 'ELITE'>('NORMAL')
  const [formDifficulty, setFormDifficulty] = useState<'FACIL' | 'MEDIO' | 'DIFICIL' | 'MESTRE'>('MEDIO')
  const [formStrongCats, setFormStrongCats] = useState<string[]>(['portugal'])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadBots = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setBots(data.bots || [])
      }
    } catch (e) {
      console.error('Erro ao carregar bots:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBots()
  }, [])

  const handleToggleStatus = async (botId: string) => {
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'toggle_status',
          botId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast('Estado do bot atualizado!')
        loadBots()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleMassToggle = async () => {
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'mass_status',
          massStatus: massTargetStatus,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast(data.message)
        setIsMassConfirmOpen(false)
        loadBots()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveBot = async () => {
    setIsSubmitting(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const payload = {
        action: selectedBot ? 'update' : 'create',
        botId: selectedBot ? selectedBot.id : undefined,
        botData: {
          name: formName,
          username: formUsername,
          district: formDistrict,
          level: formLevel,
          accuracyPercentage: formAccuracy,
          avgResponseTimeMs: formResponseTimeMs,
          personality: formPersonality,
          difficulty: formDifficulty,
          strongCategories: formStrongCats,
        },
      }

      const res = await fetch('/api/admin/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success) {
        showToast(selectedBot ? 'Bot atualizado com sucesso!' : 'Novo Bot criado com sucesso!')
        setIsEditModalOpen(false)
        setSelectedBot(null)
        loadBots()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateModal = () => {
    setSelectedBot(null)
    setFormName('Novo_Desafiante')
    setFormUsername(`bot_${Date.now().toString().slice(-4)}`)
    setFormDistrict('Lisboa')
    setFormLevel(12)
    setFormAccuracy(70)
    setFormResponseTimeMs(4000)
    setFormPersonality('NORMAL')
    setFormDifficulty('MEDIO')
    setFormStrongCats(['portugal', 'historia'])
    setIsEditModalOpen(true)
  }

  const openEditModal = (bot: any) => {
    setSelectedBot(bot)
    setFormName(bot.name || '')
    setFormUsername(bot.username || '')
    setFormDistrict(bot.district || 'Lisboa')
    setFormLevel(bot.level || 10)
    setFormAccuracy(bot.accuracyPercentage || 70)
    setFormResponseTimeMs(bot.avgResponseTimeMs || 4000)
    setFormPersonality(bot.personality || 'NORMAL')
    setFormDifficulty(bot.difficulty || 'MEDIO')
    setFormStrongCats(bot.strongCategories || ['portugal'])
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-cyan-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-cyan-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Banner de Gestão de Bots */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
              🤖 Desafiantes Virtuais (isBot: true)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Pool de desafiantes automáticos para garantir partidas instantâneas quando não houver humanos na fila.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Bot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMassTargetStatus('ACTIVE')
              setIsMassConfirmOpen(true)
            }}
            className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Ativar Todos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMassTargetStatus('INACTIVE')
              setIsMassConfirmOpen(true)
            }}
            className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-2 text-xs font-bold text-red-400 transition-all cursor-pointer"
          >
            <Pause className="h-3.5 w-3.5" />
            <span>Desativar Todos</span>
          </button>
        </div>
      </div>

      {/* Grade de Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-cyan-400" />
            <span>A carregar bots do sistema...</span>
          </div>
        ) : (
          bots.map((b) => {
            const isActive = b.status === 'ACTIVE'

            return (
              <div
                key={b.id}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md space-y-4 hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm text-white">{b.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">@{b.username} • 📍 {b.district}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : 'text-slate-400 bg-white/5 border-white/10'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Métricas de Inteligência e Personalidade */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Personalidade</span>
                    <span className="font-bold text-cyan-300">{b.personality || 'NORMAL'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Precisão / Erro</span>
                    <span className="font-bold text-amber-300 font-mono">{b.accuracyPercentage || 70}% acerto</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Tempo de Resposta</span>
                    <span className="font-bold text-white font-mono">{((b.avgResponseTimeMs || 4000) / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Nível / Rating</span>
                    <span className="font-bold text-emerald-400 font-mono">Nv.{b.level} ({b.rating} pts)</span>
                  </div>
                </div>

                {/* Categorias Fortes */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Categorias Fortes:</span>
                  <div className="flex flex-wrap gap-1">
                    {(b.strongCategories || []).map((cat: string) => (
                      <span key={cat} className="text-[9px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Configurar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(b.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    }`}
                  >
                    {isActive ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de Criação / Edição de Bot */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                {selectedBot ? `🤖 Configurar Bot: ${selectedBot.name}` : '🤖 Criar Novo Desafiante Virtual'}
              </h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Nome:</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Username:</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Distrito:</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    {VALID_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Personalidade:</label>
                  <select
                    value={formPersonality}
                    onChange={(e) => setFormPersonality(e.target.value as any)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-xs text-white"
                  >
                    <option value="CASUAL">Casual (Mais lento, mais erros)</option>
                    <option value="NORMAL">Normal (Equilibrado)</option>
                    <option value="COMPETITIVO">Competitivo (Rápido, acertos altos)</option>
                    <option value="ESPECIALISTA">Especialista (Forte em categorias chave)</option>
                    <option value="ELITE">Elite (Mestre nacional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Nível:</label>
                  <input
                    type="number"
                    value={formLevel}
                    onChange={(e) => setFormLevel(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Taxa de Acerto (%):</label>
                  <input
                    type="number"
                    min={30}
                    max={98}
                    value={formAccuracy}
                    onChange={(e) => setFormAccuracy(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Tempo Médio (ms):</label>
                  <input
                    type="number"
                    step={200}
                    value={formResponseTimeMs}
                    onChange={(e) => setFormResponseTimeMs(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveBot}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'A guardar...' : 'Guardar Bot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação em Massa */}
      {isMassConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-black uppercase text-white">
                {massTargetStatus === 'ACTIVE' ? 'Ativar Todos os Bots?' : 'Desativar Todos os Bots?'}
              </h3>
            </div>

            <p className="text-xs text-slate-300">
              Esta ação irá alterar o estado de toda a pool de desafiantes virtuais simultaneamente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsMassConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleMassToggle}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? 'A aplicar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
