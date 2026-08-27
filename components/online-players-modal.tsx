'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, Activity, Swords, Trophy, MapPin, Sparkles, Shield, Clock } from 'lucide-react'
import { usePresence } from '@/components/presence-provider'
import { getLisbonActivitySchedule } from '@/lib/activity-schedule'
import { cn } from '@/lib/utils'

interface OnlinePlayersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnlinePlayersModal({ isOpen, onClose }: OnlinePlayersModalProps) {
  const { onlineCount, duelCount, playingCount, activeUsers } = usePresence()
  const [schedule, setSchedule] = useState(() => getLisbonActivitySchedule(new Date(), duelCount + playingCount))

  // Atualizar informação horária a cada 30 segundos
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setSchedule(getLisbonActivitySchedule(new Date(), duelCount + playingCount))
    }, 30_000)
    return () => clearInterval(interval)
  }, [isOpen, duelCount, playingCount])

  // Fechar com tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const activeMatches = duelCount + playingCount

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="online-players-title"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/15 bg-slate-950 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {onlineCount} {onlineCount === 1 ? 'Pessoa Online' : 'Pessoas Online'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                <span>{schedule.phaseIcon}</span>
                <span>{schedule.badgeLabel}</span>
              </span>
            </div>

            <h2 id="online-players-title" className="font-display text-lg sm:text-xl font-black uppercase text-white">
              Jogadores em Tempo Real
            </h2>
            <p className="text-[11px] text-slate-400">
              Presença humana verificada em direto em Portugal ({schedule.timeStringLisbon} • Europe/Lisbon).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Métricas e Contexto de Atividade 24h */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              Humanos Conectados
            </span>
            <span className="font-display font-black text-lg text-emerald-400">{onlineCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase font-bold flex items-center gap-1">
              <Swords className="h-3.5 w-3.5 text-amber-400" />
              Partidas em Curso
            </span>
            <span className="font-display font-black text-lg text-amber-400">{activeMatches}</span>
          </div>
        </div>

        {/* Descrição da Fase Horária */}
        <div className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
          <Clock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block">{schedule.phaseName} ({schedule.timeStringLisbon})</strong>
            <span className="text-slate-400">{schedule.description}</span>
          </div>
        </div>

        {/* Lista de Utilizadores Ativos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Quem está online agora ({activeUsers.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Humanos Reais</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {activeUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                A carregar jogadores ativos em Portugal...
              </div>
            ) : (
              activeUsers.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs',
                    u.isCurrentUser
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={u.photoURL || '/images/avatars/camoes-2050.jpg'}
                        alt={u.username}
                        className="h-8 w-8 rounded-full border border-white/10 object-cover bg-slate-900"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/images/avatars/camoes-2050.jpg'
                        }}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate text-xs">{u.username}</span>
                        {u.isCurrentUser && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                            Tu
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {u.district} • Nv.{u.level || 1}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-slate-300 shrink-0 ml-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    {u.activityLabel}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-400" />
            Contador estrito • Zero bots incluídos
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
