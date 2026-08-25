'use client'

import React, { useEffect } from 'react'
import { Trophy } from 'lucide-react'

export interface LevelUpModalProps {
  from: number
  to: number
  onClose: () => void
}

export function LevelUpModal({ from, to, onClose }: LevelUpModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-level-up-pop relative w-full max-w-sm overflow-hidden rounded-4xl border border-gold/50 bg-gradient-to-b from-card via-slate-900 to-background p-6 sm:p-8 text-center shadow-2xl shadow-gold/25 cursor-default"
      >
        <div className="sheen absolute inset-0 pointer-events-none" />
        <div className="animate-level-up-glow absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-gold/30 to-transparent pointer-events-none" />

        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(255,200,0,0.35)] animate-bounce">
          <Trophy className="h-9 w-9 text-gold drop-shadow-[0_0_15px_var(--gold)]" />
        </div>

        <span className="relative inline-block text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">
          EVOLUÇÃO NACIONAL
        </span>

        <h2 className="relative mt-1 font-display text-2xl font-black uppercase tracking-widest text-gold-gradient">
          Subida de Nível!
        </h2>

        <p className="relative mt-2 text-xs font-medium text-slate-300">
          Parabéns! Alcançaste uma nova patente de conhecimento.
        </p>

        <div className="relative my-5 flex items-center justify-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center shadow-inner">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Anterior</span>
            <span className="font-display text-3xl font-black text-slate-300">Nível {from}</span>
          </div>

          <span className="text-2xl text-gold font-bold animate-pulse">→</span>

          <div className="rounded-2xl border border-amber-500/50 bg-amber-500/15 px-4 py-2 text-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <span className="text-[10px] font-black uppercase text-amber-300 block">Novo</span>
            <span className="font-display text-3xl font-black text-amber-400">Nível {to}</span>
          </div>
        </div>

        {/* Botão de Destaque CONTINUAR */}
        <div className="flex flex-col items-center gap-4 mt-6 w-full relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer hover:shadow-amber-500/50"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  )
}

export default LevelUpModal
