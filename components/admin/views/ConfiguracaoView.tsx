'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Save, RefreshCw, Sliders, Shield } from 'lucide-react'

interface ConfiguracaoViewProps {
  getIdToken: () => Promise<string | null>
}

export function ConfiguracaoView({ getIdToken }: ConfiguracaoViewProps) {
  const [settings, setSettings] = useState<any>({
    multiplayerEnabled: true,
    botsEnabled: true,
    duelsEnabled: true,
    matchmakingEnabled: true,
    maintenanceMode: false,
    maintenanceMessage: 'O Acorda Portugal encontra-se em manutenção programada.',
    matchmakingInitialWindowSeconds: 5,
    matchmakingExpandedWindowSeconds: 10,
    botFallbackSeconds: 15,
    maxSimultaneousBots: 50,
    xpMultiplier: 1.0,
    coinRewardMultiplier: 1.0,
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) {
        setSettings(json.settings)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      })

      const json = await res.json()
      if (json.success) {
        showToast('Configurações globais gravadas com sucesso!')
      } else {
        alert(json.error || 'Erro ao gravar configurações.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro de comunicação.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-emerald-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
        <div>
          <h3 className="font-display text-base font-black uppercase text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-400" />
            <span>Parâmetros & Configurações Globais do Jogo</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Valores centralizados para janelas de matchmaking, tempos de fallback de bot e multiplicadores de recompensa.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Matchmaking & Fallback */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Janelas de Matchmaking</span>
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Tempo de Procura Inicial Humana (segundos):</label>
                <input
                  type="number"
                  value={settings.matchmakingInitialWindowSeconds || 5}
                  onChange={(e) => setSettings({ ...settings, matchmakingInitialWindowSeconds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Tempo de Procura Alargada (segundos):</label>
                <input
                  type="number"
                  value={settings.matchmakingExpandedWindowSeconds || 10}
                  onChange={(e) => setSettings({ ...settings, matchmakingExpandedWindowSeconds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Tempo Limite para Fallback com Bot (segundos):</label>
                <input
                  type="number"
                  value={settings.botFallbackSeconds || 15}
                  onChange={(e) => setSettings({ ...settings, botFallbackSeconds: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Multiplicadores & Economia */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-4">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Multiplicadores do Jogo</span>
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Multiplicador Global de XP:</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.xpMultiplier || 1.0}
                  onChange={(e) => setSettings({ ...settings, xpMultiplier: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Multiplicador Global de Recompensas de Moeda:</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.coinRewardMultiplier || 1.0}
                  onChange={(e) => setSettings({ ...settings, coinRewardMultiplier: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'A guardar...' : 'Guardar Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
