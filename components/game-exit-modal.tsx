'use client'

import React, { useState } from 'react'
import { ArrowLeft, LogOut, AlertTriangle, X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GameExitControlProps {
  mode: '1v1' | 'solo'
  onConfirmExit: () => void | Promise<void>
  label?: string
  className?: string
}

/**
 * Botão "Voltar" / "Sair da Partida" com Modal Elegante de Confirmação
 * Estilo visual:
 * - background: rgba(255, 255, 255, 0.08);
 * - border: 1px solid rgba(255, 255, 255, 0.15);
 * - backdrop-filter: blur(8px);
 * - border-radius: 10px; padding: 8px 14px;
 * - hover com tom avermelhado de aviso.
 */
export function GameExitControl({
  mode,
  onConfirmExit,
  label = 'Sair',
  className,
}: GameExitControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  const handleConfirm = async () => {
    setIsExiting(true)
    try {
      await onConfirmExit()
    } finally {
      setIsExiting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Botão de Saída no Header do Tabuleiro */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-sm',
          'hover:text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10 hover:shadow-rose-500/10',
          className
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '8px 14px',
        }}
        title="Sair da partida"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>{label}</span>
      </button>

      {/* Modal de Confirmação Elegante */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-rose-500/40 p-6 sm:p-7 shadow-2xl text-white animate-in zoom-in-95 duration-200"
            style={{
              background: 'rgba(18, 24, 27, 0.98)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 25px rgba(244, 63, 94, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-xl p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Warning Icon & Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Queres mesmo sair da partida?
              </h3>
            </div>

            {/* Explanatory Message */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 pl-1">
              {mode === '1v1'
                ? 'Se saíres agora, a vitória será atribuída ao adversário e perderás a partida.'
                : 'O teu progresso nesta ronda será perdido.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 text-emerald-400" />
                <span>Continuar a Jogar</span>
              </button>

              <button
                type="button"
                disabled={isExiting}
                onClick={handleConfirm}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isExiting ? 'A sair...' : 'Confirmar e Sair'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
