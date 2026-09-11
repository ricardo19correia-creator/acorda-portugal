'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Settings,
  Film,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Smartphone,
  Shield,
  FileText,
  LogOut,
  User,
  CheckCircle2,
  Trash2,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useBackgroundVideoSettings } from '@/lib/video-background-settings'
import { performLogout } from '@/lib/auth-helpers'
import { AppBackground } from '@/components/AppBackground'
import { cn } from '@/lib/utils'

export default function DefinicoesPage() {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()
  const { isVideoEnabled, setVideoEnabled } = useBackgroundVideoSettings()

  // Configurações locais persistidas
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [voicesEnabled, setVoicesEnabled] = useState(true)
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sfx = localStorage.getItem('ap_sfx_enabled')
      if (sfx !== null) setSfxEnabled(sfx === 'true')

      const voices = localStorage.getItem('ap_voices_enabled')
      if (voices !== null) setVoicesEnabled(voices === 'true')

      const haptics = localStorage.getItem('ap_haptics_enabled')
      if (haptics !== null) setHapticsEnabled(haptics === 'true')

      const motion = localStorage.getItem('ap_reduced_motion')
      if (motion !== null) setReducedMotion(motion === 'true')
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleSfx = () => {
    const next = !sfxEnabled
    setSfxEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ap_sfx_enabled', String(next))
    }
    showToast(next ? 'Efeitos sonoros ativados' : 'Efeitos sonoros desativados')
  }

  const toggleVoices = () => {
    const next = !voicesEnabled
    setVoicesEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ap_voices_enabled', String(next))
    }
    showToast(next ? 'Locuções de voz ativadas' : 'Locuções de voz desativadas')
  }

  const toggleHaptics = () => {
    const next = !hapticsEnabled
    setHapticsEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ap_haptics_enabled', String(next))
      if (next && 'vibrate' in navigator) {
        try { navigator.vibrate(50) } catch {}
      }
    }
    showToast(next ? 'Vibração ativada' : 'Vibração desativada')
  }

  const toggleReducedMotion = () => {
    const next = !reducedMotion
    setReducedMotion(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('ap_reduced_motion', String(next))
    }
    showToast(next ? 'Movimento reduzido ativado' : 'Transições normais ativadas')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await performLogout('/')
    } catch {
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      // Manter credenciais base, limpar caches voláteis
      const keysToKeep = ['user_display_name', 'user_district', 'equipped_avatar_id', 'ap_sfx_enabled']
      const saved: Record<string, string> = {}
      keysToKeep.forEach(k => {
        const v = localStorage.getItem(k)
        if (v) saved[k] = v
      })
      localStorage.clear()
      sessionStorage.clear()
      Object.entries(saved).forEach(([k, v]) => localStorage.setItem(k, v))
      showToast('Cache local reiniciada!')
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <AppBackground />

      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 relative z-10">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </Link>

        {toastMessage && (
          <div className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-xl border border-emerald-400 animate-fade-in">
            {toastMessage}
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all shadow-md"
        >
          <span>Lobby Principal</span>
        </Link>
      </div>

      {/* Hero Title */}
      <div className="w-full max-w-4xl mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
              Definições do Jogo
            </h1>
            <p className="text-xs text-slate-400">
              Personaliza a tua experiência visual, preferências sonoras e gere a tua conta.
            </p>
          </div>
        </div>
      </div>

      {/* Configurações em Blocos */}
      <div className="w-full max-w-4xl space-y-6 relative z-10 pb-16">
        {/* 1. Visual & Desempenho */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Film className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">Visual &amp; Desempenho</h2>
              <p className="text-xs text-slate-400">Controla os efeitos gráficos e o consumo de recursos.</p>
            </div>
          </div>

          {/* Toggle Vídeo */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                Vídeo de Fundo Global
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.2 rounded-md">
                  HD
                </span>
              </span>
              <p className="text-xs text-slate-400">
                Apresenta vídeo cinematográfico de fundo. Desativa se preferires máxima poupança de bateria.
              </p>
            </div>
            <button
              onClick={() => {
                setVideoEnabled(!isVideoEnabled)
                showToast(!isVideoEnabled ? 'Vídeo de fundo ativado' : 'Vídeo de fundo desativado')
              }}
              className={cn(
                'cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                isVideoEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {isVideoEnabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Toggle Redução de Movimento */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-white">Reduzir Animações</span>
              <p className="text-xs text-slate-400">
                Minimiza transições complexas e rotações para um desempenho mais suave em equipamentos mais antigos.
              </p>
            </div>
            <button
              onClick={toggleReducedMotion}
              className={cn(
                'cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                reducedMotion
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {reducedMotion ? 'Ativado' : 'Desativado'}
            </button>
          </div>
        </div>

        {/* 2. Áudio & Sons */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">Áudio &amp; Efeitos Sonoros</h2>
              <p className="text-xs text-slate-400">Efeitos acústicos de resposta, apitos e comemorações.</p>
            </div>
          </div>

          {/* Toggle Efeitos Sonoros */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-white">Efeitos Sonoros (SFX)</span>
              <p className="text-xs text-slate-400">
                Sons de clique, temporizador, resposta correta/incorreta e apitos de árbitro.
              </p>
            </div>
            <button
              onClick={toggleSfx}
              className={cn(
                'cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                sfxEnabled
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {sfxEnabled ? 'Ligados' : 'Desligados'}
            </button>
          </div>

          {/* Toggle Vozes & Locuções */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-white">Locução de Voz Portuguesa</span>
              <p className="text-xs text-slate-400">
                Comentários procedurais e frases expressivas tugas durante as batalhas.
              </p>
            </div>
            <button
              onClick={toggleVoices}
              className={cn(
                'cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                voicesEnabled
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {voicesEnabled ? 'Ligadas' : 'Desligadas'}
            </button>
          </div>
        </div>

        {/* 3. Dispositivo & Háptica */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Dispositivo &amp; Háptica</h2>
              <p className="text-xs text-slate-400">Vibração e resposta ao toque em smartphones e tablets.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-bold text-white">Resposta Háptica (Vibração)</span>
              <p className="text-xs text-slate-400">
                Vibração tátil ao selecionar respostas ou ao receber alertas de tempo crítico.
              </p>
            </div>
            <button
              onClick={toggleHaptics}
              className={cn(
                'cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
                hapticsEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              )}
            >
              {hapticsEnabled ? 'Ativada' : 'Desativada'}
            </button>
          </div>
        </div>

        {/* 4. Conta & Sessão */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <User className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-white">Conta de Utilizador</h2>
              <p className="text-xs text-slate-400">Gere a tua sessão e dados de jogador.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Nome de Jogador:</span>
              <span className="font-bold text-white">{profile?.displayName || user?.displayName || 'Não definido'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Email da Conta:</span>
              <span className="font-mono text-slate-300">{user?.email || 'Sessão anónima/convidado'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Distrito Representado:</span>
              <span className="font-bold text-emerald-400">{profile?.district || 'Portugal'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">ID Único de Jogador:</span>
              <span className="font-mono text-slate-500">{user?.uid ? user.uid.slice(0, 16) + '...' : '-'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/perfil"
              className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition shadow-md"
            >
              Editar Perfil Completo
            </Link>

            <button
              onClick={handleClearCache}
              className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition"
            >
              Limpar Cache Local
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer px-4 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/40 transition shadow-md flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'A Sair...' : 'Terminar Sessão'}</span>
            </button>
          </div>
        </div>

        {/* 5. Legal & Versão */}
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Transparência &amp; Legal</h2>
              <p className="text-[11px] text-slate-500">Termos, privacidade e proteção dos teus dados.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <Link href="/termos" className="hover:text-emerald-400 flex items-center gap-1 transition">
              <FileText className="w-3.5 h-3.5" />
              <span>Termos de Serviço</span>
            </Link>
            <Link href="/privacidade" className="hover:text-emerald-400 flex items-center gap-1 transition">
              <Shield className="w-3.5 h-3.5" />
              <span>Política de Privacidade</span>
            </Link>
          </div>

          <div className="pt-2 text-[11px] text-slate-600 font-mono">
            Acorda Portugal — Edição de Soberania Nacional • v2.4.0
          </div>
        </div>
      </div>
    </div>
  )
}
