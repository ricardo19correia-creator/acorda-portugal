'use client'

import React from 'react'
import { Check, X, Loader2, Sparkles } from 'lucide-react'
import { AidMetadata } from '@/lib/aid-service'
import { cn } from '@/lib/utils'

export interface AidPreviewModalProps {
  aid: AidMetadata | null
  stock: number
  isOpen: boolean
  isProcessing: boolean
  onConfirm: () => void
  onClose: () => void
}

export function AidPreviewModal({
  aid,
  stock,
  isOpen,
  isProcessing,
  onConfirm,
  onClose,
}: AidPreviewModalProps) {
  if (!isOpen || !aid) return null

  const hasStock = stock > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aid-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl text-white animate-in zoom-in-95 duration-200 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar X */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ilustração / Imagem Oficial da Ajuda */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3 flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-950/80 border border-slate-700/50 p-2 shadow-inner overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 blur-xl pointer-events-none"
            style={{
              background:
                aid.type === '5050'
                  ? 'radial-gradient(circle, #06b6d4 0%, transparent 70%)'
                  : aid.type === 'publicVote'
                    ? 'radial-gradient(circle, #a855f7 0%, transparent 70%)'
                    : 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            }}
          />
          <img
            src={aid.image}
            alt={aid.name}
            className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Nome da Ajuda & Ícone */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-lg">{aid.icon}</span>
          <h2 id="aid-modal-title" className="text-lg sm:text-xl font-black text-white tracking-wide">
            {aid.shortName}
          </h2>
        </div>

        {/* Explicação Pedagógica Clara */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[280px] mb-3">
          {aid.description}
        </p>

        {/* Contador de Stock */}
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold">
          <span className="text-slate-400">Tens disponíveis:</span>
          <span
            className={cn(
              'font-black font-mono',
              hasStock ? 'text-amber-300' : 'text-rose-400',
            )}
          >
            {stock} {stock === 1 ? 'utilização' : 'utilizações'}
          </span>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!hasStock || isProcessing}
            onClick={onConfirm}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer',
              hasStock && !isProcessing
                ? aid.type === '5050'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                  : aid.type === 'publicVote'
                    ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/25'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/25'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed select-none opacity-60',
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>A aplicar...</span>
              </>
            ) : hasStock ? (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>USAR</span>
              </>
            ) : (
              <span>SEM STOCK</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
