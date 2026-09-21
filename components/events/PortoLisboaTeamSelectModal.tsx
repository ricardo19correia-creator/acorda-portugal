'use client'

import React, { useState } from 'react'
import {
  Swords,
  Shield,
  CheckCircle2,
  AlertCircle,
  Users,
  Trophy,
  Sparkles,
  ChevronRight,
  Flame,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventTeamId, OfficialEventTeams } from '@/lib/events-service'
import { useAuth } from '@/components/auth-provider'

export interface PortoLisboaTeamSelectModalProps {
  isOpen: boolean
  onClose?: () => void
  onSuccess?: (chosenTeam: EventTeamId) => void
  onTeamSelected?: (chosenTeam: EventTeamId) => void
  teams?: OfficialEventTeams
  portoStats?: {
    points: number
    playerCount: number
    name?: string
    club?: string
    city?: string
  }
  lisboaStats?: {
    points: number
    playerCount: number
    name?: string
    club?: string
    city?: string
  }
}

export function PortoLisboaTeamSelectModal({
  isOpen,
  onClose,
  onSuccess,
  onTeamSelected,
  teams,
  portoStats: propPortoStats,
  lisboaStats: propLisboaStats,
}: PortoLisboaTeamSelectModalProps) {
  const { user } = useAuth()
  const [selectedPendingTeam, setSelectedPendingTeam] = useState<EventTeamId | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const portoStats = propPortoStats || teams?.porto || {
    points: 0,
    playerCount: 0,
    name: 'Equipa Porto',
    club: 'FC Porto',
    city: 'Porto',
  }

  const lisboaStats = propLisboaStats || teams?.lisboa || {
    points: 0,
    playerCount: 0,
    name: 'Equipa Lisboa',
    club: 'SL Benfica',
    city: 'Lisboa',
  }

  const notifyChosen = (team: EventTeamId) => {
    if (typeof onTeamSelected === 'function') {
      try {
        onTeamSelected(team)
      } catch (err) {
        console.error('[SELECT_TEAM_NOTIFY_ERROR] onTeamSelected:', err)
      }
    }
    if (typeof onSuccess === 'function') {
      try {
        onSuccess(team)
      } catch (err) {
        console.error('[SELECT_TEAM_NOTIFY_ERROR] onSuccess:', err)
      }
    }
  }

  const handleSelectSide = (team: EventTeamId) => {
    setErrorMsg(null)
    setSelectedPendingTeam(team)
    setIsConfirming(true)
  }

  const handleCancelConfirmation = () => {
    setIsConfirming(false)
    setSelectedPendingTeam(null)
    setErrorMsg(null)
  }

  const handleConfirmChoice = async () => {
    if (!selectedPendingTeam || !user || submitting) return
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/events/select-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          eventId: 'porto-lisboa-duelo',
          team: selectedPendingTeam,
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok && data?.success) {
        notifyChosen(data.team || selectedPendingTeam)
      } else if (data?.alreadyChosen || (data?.alreadySet && data?.team === selectedPendingTeam)) {
        notifyChosen(data.team || selectedPendingTeam)
      } else {
        setErrorMsg(
          data?.error ||
            'Não foi possível registar a tua equipa no momento. Tenta novamente.'
        )
      }
    } catch (err: any) {
      console.error('[SELECT_TEAM_ERROR]', err)
      setErrorMsg('Erro de comunicação com o servidor. Tenta novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#02050e]/92 backdrop-blur-xl overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#050b1d]/98 via-[#030713]/98 to-[#020409] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Glows de Ambiente Dual */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />

        {/* Linha Néon Superior Chanfrada */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-400 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

        {/* Botão Fechar se facultativo */}
        {onClose && !submitting && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-4 sm:p-8 space-y-6">
          {/* Cabeçalho Monumental */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-950/80 border border-amber-500/30 px-3.5 py-1 shadow-inner">
              <Swords className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                O Grande Duelo — Escolha de Lado
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              ESCOLHE O TEU LADO
            </h2>

            <div className="flex items-center justify-center gap-2 font-display text-lg sm:text-2xl font-black uppercase tracking-wider">
              <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                PORTO
              </span>
              <span className="text-amber-400">⚔</span>
              <span className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
                LISBOA
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Antes de entrares no Grande Duelo, tens de jurar lealdade a uma das equipas.
              Os teus pontos em cada partida vão somar diretamente para a vitória do teu lado!
            </p>
          </div>

          {/* Mensagem de Erro se houver */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold text-center flex items-center justify-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Painel Central com os 2 Lados do Confronto */}
          <div className="relative grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch">
            {/* LADO AZUL: EQUIPA PORTO */}
            <div className="md:col-span-5 rounded-3xl border-2 border-blue-500/40 bg-gradient-to-b from-blue-950/60 via-slate-950/90 to-slate-950 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-[0_0_35px_rgba(37,99,235,0.25)] relative overflow-hidden group hover:border-blue-400 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="space-y-3 relative z-10 text-left">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-inner">
                    🔵 EQUIPA PORTO
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    A INVICTA
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-blue-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
                    Porto & FC Porto
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    A fibra cívica do Norte, o rio Douro e a glória europeia de Viena, Sevilha e Gelsenkirchen.
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/25 bg-blue-950/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      Jogadores no Lado
                    </span>
                    <span className="font-display text-sm font-black text-blue-300">
                      {portoStats.playerCount.toLocaleString('pt-PT')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      Pontos Acumulados
                    </span>
                    <span className="font-display text-sm font-black text-amber-300">
                      {portoStats.points.toLocaleString('pt-PT')} pts
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-blue-500/20 text-[11px] text-blue-200/90 italic font-semibold">
                  &ldquo;Representa o Norte. Entra no duelo.&rdquo;
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectSide('porto')}
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl font-display text-sm sm:text-base font-black uppercase tracking-wider text-white bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <span>JOGAR PELO PORTO 🔵</span>
                <ChevronRight className="h-4 w-4 text-blue-200" />
              </button>
            </div>

            {/* CENTRO: VS HERÁLDICO */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-auto py-2 relative">
              <div className="relative flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 via-slate-950 to-rose-600 border border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <Swords className="h-7 w-7 text-amber-300" />
              </div>
              <span className="font-display text-xs font-black uppercase tracking-widest text-amber-400 mt-2">
                VS
              </span>
            </div>

            {/* LADO VERMELHO: EQUIPA LISBOA */}
            <div className="md:col-span-5 rounded-3xl border-2 border-rose-500/40 bg-gradient-to-b from-rose-950/60 via-slate-950/90 to-slate-950 p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-[0_0_35px_rgba(225,29,72,0.25)] relative overflow-hidden group hover:border-rose-400 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-2xl rounded-full pointer-events-none" />

              <div className="space-y-3 relative z-10 text-left">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-inner">
                    🔴 EQUIPA LISBOA
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                    A CAPITAL
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]">
                    Lisboa & SL Benfica
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    As colinas do Tejo, a reconstrução pombalina de 1755 e o bicampeonato europeu de Eusébio e Coluna.
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-500/25 bg-rose-950/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-rose-400" />
                      Jogadores no Lado
                    </span>
                    <span className="font-display text-sm font-black text-rose-300">
                      {lisboaStats.playerCount.toLocaleString('pt-PT')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      Pontos Acumulados
                    </span>
                    <span className="font-display text-sm font-black text-amber-300">
                      {lisboaStats.points.toLocaleString('pt-PT')} pts
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/70 border border-rose-500/20 text-[11px] text-rose-200/90 italic font-semibold">
                  &ldquo;Representa a Capital. Entra no duelo.&rdquo;
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectSide('lisboa')}
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-2xl font-display text-sm sm:text-base font-black uppercase tracking-wider text-white bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <span>JOGAR POR LISBOA 🔴</span>
                <ChevronRight className="h-4 w-4 text-rose-200" />
              </button>
            </div>
          </div>

          {/* Caixa de Confirmação Autoritativa (Evitar Trocas Não Intencionais) */}
          {isConfirming && selectedPendingTeam && (
            <div className="rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 p-5 sm:p-6 text-center space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pop">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>Confirmação Definitiva de Lealdade</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                  Tens a certeza que queres representar a{' '}
                  <span
                    className={
                      selectedPendingTeam === 'porto'
                        ? 'text-blue-400'
                        : 'text-rose-400'
                    }
                  >
                    Equipa {selectedPendingTeam === 'porto' ? 'Porto 🔵' : 'Lisboa 🔴'}
                  </span>
                  ?
                </h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  Esta escolha ficará gravada na tua conta no servidor e não poderá ser alterada durante o Grande Duelo para manter a competição limpa e justa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelConfirmation}
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/20 bg-slate-900 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Voltar Atrás
                </button>

                <button
                  type="button"
                  onClick={handleConfirmChoice}
                  disabled={submitting}
                  className={cn(
                    'w-full sm:w-auto px-8 py-3.5 rounded-xl font-display text-sm font-black uppercase tracking-wider text-white shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2',
                    selectedPendingTeam === 'porto'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(37,99,235,0.6)]'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_25px_rgba(225,29,72,0.6)]'
                  )}
                >
                  {submitting ? (
                    <span>A Gravar Lealdade...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Confirmar e Entrar no Grande Duelo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
