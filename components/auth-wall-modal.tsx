'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles, X, ArrowRight, Shield } from 'lucide-react'
import GoogleAuthButton from '@/components/google-auth-button'
import { setPostLoginRedirectTarget, sanitizeRedirectUrl } from '@/lib/auth'

interface AuthWallModalProps {
  isOpen: boolean
  onClose?: () => void
  targetUrl?: string
  title?: string
  description?: string
  subtitle?: string
}

/**
 * Modal flutuante de autenticação obrigatória para gameplay.
 * Apresentado quando um convidado clica num modo de jogo, categoria, duelo ou território.
 */
export function AuthWallModal({
  isOpen,
  onClose,
  targetUrl = '/jogar',
  title = 'INICIA SESSÃO PARA JOGAR',
  description = 'Cria ou inicia a tua conta para jogar, guardar XP e participar no Desafio Nacional.',
  subtitle = 'Precisas de iniciar sessão para entrar no jogo e guardar o teu progresso.',
}: AuthWallModalProps) {
  const router = useRouter()
  const safeTarget = sanitizeRedirectUrl(targetUrl, '/jogar')

  if (!isOpen) return null

  const handleGoToLogin = () => {
    setPostLoginRedirectTarget(safeTarget)
    if (onClose) onClose()
    router.push(`/entrar?redirect=${encodeURIComponent(safeTarget)}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl sm:rounded-4xl border border-emerald-500/40 bg-slate-900/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* Botão Fechar se onClose for fornecido */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Ícone de Destaque */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
          <Lock className="h-8 w-8 text-emerald-400" />
        </div>

        {/* Badge e Títulos */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-3 w-3" />
            <span>Gameplay Exclusivo</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {description}
          </p>

          <p className="text-[11px] text-amber-300/90 font-semibold">
            {subtitle}
          </p>
        </div>

        {/* Ações de Autenticação */}
        <div className="space-y-3 pt-2">
          {/* Botão Principal: Google 1-Click com target memorizado */}
          <GoogleAuthButton
            text="Continuar com o Google"
            redirectTarget={safeTarget}
            className="bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25 hover:border-emerald-400 shadow-lg shadow-emerald-500/15"
          />

          {/* Botão Oficial: INICIAR SESSÃO */}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/30 active:scale-98 transition cursor-pointer"
          >
            <span>INICIAR SESSÃO</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Rodapé informativo discreto */}
        <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-emerald-400/70" />
          <span>Sessão 100% segura • O teu progresso é preservado</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Ecrã incorporado em página inteira quando um visitante acede diretamente
 * a uma rota protegida de gameplay (/jogar?cat=..., /jogar/duelo, etc.).
 */
export function AuthWallView({
  targetUrl = '/jogar',
  title = 'INICIA SESSÃO PARA JOGAR',
  description = 'Cria ou inicia a tua conta para jogar, guardar XP e participar no Desafio Nacional.',
  subtitle = 'Precisas de iniciar sessão para entrar no jogo e guardar o teu progresso.',
}: {
  targetUrl?: string
  title?: string
  description?: string
  subtitle?: string
}) {
  const safeTarget = sanitizeRedirectUrl(targetUrl, '/jogar')

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-4 sm:p-6 text-center select-none">
      <div className="relative w-full max-w-md rounded-4xl border border-emerald-500/40 bg-slate-900/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.25)] backdrop-blur-2xl text-center space-y-6">
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />

        {/* Ícone */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-500/25">
          <Lock className="h-10 w-10 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span>🇵🇹</span>
            <span>Acorda Portugal</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {description}
          </p>

          <p className="text-xs text-amber-300 font-bold">
            {subtitle}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <GoogleAuthButton
            text="Continuar com o Google"
            redirectTarget={safeTarget}
            className="bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25 hover:border-emerald-400 shadow-lg shadow-emerald-500/15"
          />

          <Link
            href={`/entrar?redirect=${encodeURIComponent(safeTarget)}`}
            onClick={() => setPostLoginRedirectTarget(safeTarget)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/30 active:scale-98 transition cursor-pointer"
          >
            <span>INICIAR SESSÃO</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors pt-2"
          >
            <span>← Voltar à Página Inicial</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
