'use client'

import React from 'react'
import { AlertTriangle, LogIn, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

interface SessionConflictModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export function SessionConflictModal({ isOpen, onConfirm }: SessionConflictModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-rose-500/40 bg-slate-900/95 p-6 sm:p-8 text-center shadow-2xl shadow-rose-950/50 backdrop-blur-xl">
        
        {/* Glow & Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Sessão Terminada
        </h2>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          A tua conta foi iniciada noutro dispositivo ou navegador. Por motivos de segurança e para garantir a integridade dos duelos,{' '}
          <strong className="text-rose-300">apenas é permitida uma sessão ativa de cada vez</strong>.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-95"
          >
            <LogIn className="w-4 h-4" /> Iniciar Sessão Novamente
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 font-mono">
          Acorda Portugal • Segurança de Conta
        </p>
      </div>
    </div>
  )
}

export default SessionConflictModal
