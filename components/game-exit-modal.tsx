'use client'

import React, { useState } from 'react'
import { LogOut, AlertTriangle, X, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GameExitControlProps {
  mode: '1v1' | 'solo'
  onConfirmExit: () => void | Promise<void>
  label?: string
  className?: string
}

/**
 * Botão discreto de saída / desistência com Modal de Confirmação Seguro
 */
export function GameExitControl({
  mode,
  onConfirmExit,
  label,
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
      {/* Botão de Saída Discreto no Cabeçalho */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'p-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900 hover:text-red-200 active:scale-95 transition cursor-pointer select-none z-30 shadow-sm flex items-center gap-1.5',
          className
        )}
        title="Desistir / Abandonar Partida"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {label && <span className="text-xs font-bold hidden sm:inline">{label}</span>}
      </button>

      {/* Modal de Confirmação de Desistência */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md rounded-3xl border border-red-500/40 bg-slate-950/95 p-6 shadow-2xl text-white backdrop-blur-xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar X */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 rounded-xl p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Ícone de Aviso e Título */}
            <div className="flex items-center gap-3 mb-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Desistir da Partida?
              </h3>
            </div>

            {/* Mensagem Explicativa */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {mode === '1v1'
                ? 'Ao sair, concederás a vitória imediata ao teu adversário por desistência.'
                : 'O teu progresso e pontos acumulados nesta sessão serão perdidos.'}
            </p>

            {/* Botões de Ação */}
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
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>{isExiting ? 'A sair...' : 'Sim, Abandonar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
