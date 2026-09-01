'use client'

import React, { useEffect } from 'react'
import { X, Flame, Swords, Compass, MapPin, Shield } from 'lucide-react'
import type { RealPlayerPresence } from '@/lib/real-presence'
import { cn } from '@/lib/utils'

interface LivePlayersModalProps {
  isOpen: boolean
  onClose: () => void
  players: RealPlayerPresence[]
  currentUid?: string
}

export function LivePlayersModal({
  isOpen,
  onClose,
  players,
  currentUid,
}: LivePlayersModalProps) {
  // Fechar com tecla ESC
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-live-players-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Backdrop com blur moderno */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 flex flex-col max-h-[85vh] w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] backdrop-blur-xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>
            <div>
              <h2
                id="modal-live-players-title"
                className="font-display text-lg sm:text-xl font-black uppercase tracking-wider text-white"
              >
                Jogadores Online Agora
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {players.length} {players.length === 1 ? 'jogador humano ativo' : 'jogadores humanos ativos'} em Portugal 🇵🇹
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de Jogadores com Scroll */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[55vh]">
          {players.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm font-medium">
              <p>Nenhum outro jogador online neste momento.</p>
              <p className="text-xs mt-1 text-slate-500">Sê o primeiro a entrar e desafiar Portugal!</p>
            </div>
          ) : (
            players.map((player) => {
              const isMe = currentUid && player.userId === currentUid
              return (
                <div
                  key={player.userId}
                  className={cn(
                    'flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200',
                    isMe
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                  )}
                >
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {/* Imagem do Avatar */}
                      <img
                        src={player.photoURL || '/images/avatars/camoes-2050.jpg'}
                        alt={player.displayName}
                        className="h-11 w-11 rounded-full object-cover border-2 border-emerald-400/50 bg-slate-800"
                        onError={(e) => {
                          // Fallback gracioso caso a imagem quebre
                          (e.target as HTMLImageElement).src = '/images/avatars/camoes-2050.jpg'
                        }}
                      />
                      {/* Ponto indicador no avatar */}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-[0_0_6px_#10b981]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-white truncate">
                          {player.displayName}
                        </span>
                        {isMe && (
                          <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                            Tu
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                          <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                          {player.district}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-300">
                          <Shield className="h-2.5 w-2.5" />
                          Nv. {player.level || 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Estado da Atividade */}
                  <div className="shrink-0">
                    {player.activity === 'playing' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        <span className="hidden sm:inline">A responder</span>
                      </span>
                    ) : player.activity === 'duel' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        <Swords className="h-3.5 w-3.5 text-purple-400" />
                        <span className="hidden sm:inline">Em Duelo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Compass className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Online</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
          <span>Apenas jogadores reais com conta ativa</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}