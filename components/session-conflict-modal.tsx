'use client'

import React, { useEffect, useState } from 'react'
import { ShieldAlert, ArrowRight, Smartphone } from 'lucide-react'

export interface SessionConflictModalProps {
  isOpen?: boolean
  message?: string
  onConfirm?: () => void
}

export function SessionConflictModal({
  isOpen = false,
  message = 'A tua conta foi iniciada noutro dispositivo.',
  onConfirm,
}: SessionConflictModalProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onConfirm) {
            onConfirm()
          } else if (typeof window !== 'undefined') {
            window.location.href = '/entrar?reason=session_conflict'
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onConfirm])

  if (!isOpen) return null

  const handleAction = () => {
    if (onConfirm) {
      onConfirm()
    } else if (typeof window !== 'undefined') {
      window.location.href = '/entrar?reason=session_conflict'
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      {/* Luz ambiente de alerta */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-red-500/15 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border-2 border-amber-500/40 bg-slate-900/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Ícone Animado */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping opacity-60" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-amber-500/30 to-amber-600/10 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-inner">
            <Smartphone className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Textos Informativos */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Sessão Substituída
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-display">
            Sessão Ativa Noutro Dispositivo
          </h2>

          <p className="text-amber-200 text-sm font-semibold leading-relaxed">
            {message}
          </p>

          <p className="text-slate-400 text-xs leading-relaxed">
            Por motivos de segurança e integridade do jogo, uma conta só pode estar ativa num único dispositivo de cada vez. A sessão neste dispositivo foi terminada automaticamente.
          </p>
        </div>

        {/* Botão de Redirecionamento e Contador */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleAction}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Iniciar Sessão Neste Dispositivo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-500">
            A redirecionar automaticamente em <strong className="text-slate-300 font-mono">{countdown}s</strong>...
          </p>
        </div>
      </div>
    </div>
  )
}

export default SessionConflictModal
