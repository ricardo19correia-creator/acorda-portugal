'use client'

import React, { useState } from 'react'
import { AlertOctagon, AlertTriangle, Power, Swords, Bot, ShieldAlert, CheckCircle2, X } from 'lucide-react'

interface EmergenciaViewProps {
  getIdToken: () => Promise<string | null>
}

export function EmergenciaView({ getIdToken }: EmergenciaViewProps) {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null)
  const [modalTitle, setModalTitle] = useState('')
  const [modalDescription, setModalDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleTriggerEmergency = async () => {
    if (!activeModalAction) return
    setIsSubmitting(true)

    try {
      const token = await getIdToken()
      if (!token) return

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emergencyAction: activeModalAction }),
      })

      const json = await res.json()
      if (json.success) {
        showToast(json.message || 'Ação de emergência executada com sucesso!')
        setActiveModalAction(null)
      } else {
        alert(json.error || 'Erro ao executar ação de emergência.')
      }
    } catch (e: any) {
      alert(e.message || 'Erro de comunicação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const promptAction = (action: string, title: string, desc: string) => {
    setActiveModalAction(action)
    setModalTitle(title)
    setModalDescription(desc)
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-50 rounded-2xl border border-red-500/40 bg-slate-950 px-5 py-3 text-xs font-black text-red-300 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Banner de Aviso de Emergência */}
      <div className="rounded-3xl border border-red-500/40 bg-red-950/40 p-6 shadow-2xl backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2 text-red-400 font-display font-black text-sm uppercase tracking-wider">
          <AlertOctagon className="h-5 w-5" />
          <span>PAINEL DE INTERRUPÇÃO DE EMERGÊNCIA (KILL-SWITCHES)</span>
        </div>
        <p className="text-xs text-red-200/80 leading-relaxed">
          Estas ações afetam imediatamente a infraestrutura pública do jogo. Utilize apenas em caso de incidente crítico, sobrecarga anómala ou manutenção urgente de segurança.
        </p>
      </div>

      {/* Grade de Interruptores Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Kill Switch: Desligar Multiplayer */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-400" />
              <span>Desligar Duelos 1v1</span>
            </h4>
            <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              Crítico
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Bloqueia a criação de novas salas de duelo 1v1 e encerra a fila de matchmaking temporariamente.
          </p>
          <button
            type="button"
            onClick={() =>
              promptAction(
                'KILL_MULTIPLAYER',
                'Desligar Duelos 1v1?',
                'Isto impedirá que os jogadores iniciem novas partidas de multiplayer 1v1 até ser reativado.'
              )
            }
            className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold border border-red-500/40 transition-all cursor-pointer"
          >
            Interromper Multiplayer
          </button>
        </div>

        {/* Kill Switch: Desligar Bots */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>Desativar Bots do Matchmaking</span>
            </h4>
            <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Matchmaking
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Impede que desafiantes virtuais entrem na fila de partidas automáticas.
          </p>
          <button
            type="button"
            onClick={() =>
              promptAction(
                'KILL_BOTS',
                'Desativar Todos os Bots?',
                'Os jogadores apenas poderão ser emparelhados com outros jogadores humanos.'
              )
            }
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold border border-cyan-500/40 transition-all cursor-pointer"
          >
            Interromper Bots Virtuais
          </button>
        </div>

        {/* Kill Switch: Modo de Manutenção Global */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Ativar Modo de Manutenção</span>
            </h4>
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Bloqueio Global
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Apresenta um aviso de manutenção no jogo público, impedindo novas partidas.
          </p>
          <button
            type="button"
            onClick={() =>
              promptAction(
                'ENABLE_MAINTENANCE',
                'Ativar Modo de Manutenção Global?',
                'O jogo apresentará um ecrã de manutenção aos utilizadores.'
              )
            }
            className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold border border-amber-500/40 transition-all cursor-pointer"
          >
            Ativar Manutenção
          </button>
        </div>

        {/* Restauração Global */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-sm text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Restaurar Todos os Serviços</span>
            </h4>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Normalidade
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Reativa multiplayer, bots, matchmaking e desativa o modo de manutenção.
          </p>
          <button
            type="button"
            onClick={() =>
              promptAction(
                'RESTORE_ALL',
                'Restaurar Todos os Serviços?',
                'Isto irá repor o funcionamento normal e 100% operacional de todas as funcionalidades.'
              )
            }
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Restaurar Serviços (100% OK)
          </button>
        </div>
      </div>

      {/* Modal de Confirmação Crítica */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-black uppercase text-white">{modalTitle}</h3>
            </div>

            <p className="text-xs text-slate-300">{modalDescription}</p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveModalAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTriggerEmergency}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'A executar...' : 'Confirmar Ação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
