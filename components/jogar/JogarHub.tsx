'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Swords,
  Trophy,
  MapPin,
  Sparkles,
  Coins,
  Flame,
  Target,
  ShoppingBag,
  User as UserIcon,
  Award,
  Settings,
  LayoutGrid,
  Laugh,
  Eye,
  ArrowRight,
  ChevronRight,
  LogIn,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useEconomy } from '@/context/economy-context'
import { calculateLevelProgress } from '@/lib/progression'
import { MISSIONS } from '@/lib/game-data'
import { UserAvatar } from '@/components/UserAvatar'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { GlobalBackButton } from '@/components/navigation/GlobalBackButton'
import { safeRandomUUID, cn } from '@/lib/utils'

export interface JogarHubProps {
  onStartClassicMatch?: (gameId?: string) => void
}

export function JogarHub({ onStartClassicMatch }: JogarHubProps) {
  const router = useRouter()
  const { user, profile, authResolved } = useAuth()
  const { coins, formattedCoins } = useEconomy()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')

  // Progresso de Nível e XP calculado
  const userXp = profile?.xp || 0
  const levelProgress = calculateLevelProgress(userXp)
  const streakDays = profile?.streak || profile?.bestStreak || 0
  const highlightedMission = MISSIONS[0] || null

  const handleAction = (route: string, isMatchAction = false) => {
    if (!user) {
      setAuthWallTarget(route)
      setAuthWallOpen(true)
      return
    }

    if (isMatchAction && onStartClassicMatch && route.startsWith('/jogar?cat=desafio-nacional')) {
      const matchGameId = safeRandomUUID()
      onStartClassicMatch(matchGameId)
      return
    }

    router.push(route)
  }

  const handleStartClassic = () => {
    const gameId = safeRandomUUID()
    const target = `/jogar?cat=desafio-nacional&game=${gameId}`
    if (!user) {
      setAuthWallTarget(target)
      setAuthWallOpen(true)
      return
    }
    if (onStartClassicMatch) {
      onStartClassicMatch(gameId)
    } else {
      router.push(target)
    }
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-12 text-white select-none animate-fadeIn space-y-6 sm:space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <GlobalBackButton showAlways={true} fallbackUrl="/" />
        <Link
          href="/beta"
          title="Acorda Portugal — Versão Beta Pública"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-[10px] sm:text-xs font-mono text-slate-300 hover:border-amber-400/50 transition-colors shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-400">BETA PÚBLICO</span>
          <span className="text-white/30">·</span>
          <span className="text-slate-300">EM DESENVOLVIMENTO</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. CABEÇALHO COMPACTO                                                     */}
      {/* ========================================================================= */}
      <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-3.5 sm:p-5 shadow-xl transition-all">
        {user && !profile ? (
          <div className="flex items-center justify-between gap-3 sm:gap-4 animate-pulse">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="h-2 w-40 bg-slate-800/50 rounded" />
              </div>
            </div>
            <div className="h-9 w-20 bg-slate-800/40 rounded-xl" />
          </div>
        ) : (
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Jogador: Avatar + Nome + Nível + Barra XP */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href={user ? '/perfil' : '/entrar?redirect=/jogar'}
              className="relative shrink-0 active:scale-95 transition-transform"
              title={user ? 'Ver Perfil' : 'Iniciar Sessão'}
            >
              <UserAvatar
                profile={profile}
                size="sm"
                className="w-11 h-11 sm:w-13 sm:h-13 shadow-md"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-sm sm:text-base text-white truncate drop-shadow-sm">
                  {user ? (profile?.displayName || user.displayName || 'Jogador') : 'Jogador Convidado'}
                </span>

                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  NV. {levelProgress.currentLevel.level}
                </span>

                {user && (
                  <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 truncate">
                    {levelProgress.currentLevel.cleanTitle}
                  </span>
                )}
              </div>

              {/* Barra de XP compacta */}
              <div className="mt-1.5 flex items-center gap-2 max-w-xs sm:max-w-sm">
                <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${Math.max(4, Math.min(100, levelProgress.progressPercentage))}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                  {levelProgress.isMaxLevel ? (
                    'NÍVEL MÁX'
                  ) : (
                    `${levelProgress.xpIntoLevel.toLocaleString('pt-PT')} / ${levelProgress.xpNeededForLevel.toLocaleString('pt-PT')} XP`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Saldo de Acordas / Moedas & Botão de Sessão */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/loja"
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 shadow-sm transition-all active:scale-95"
              title="Loja de Acordas"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-xs sm:text-sm text-amber-300 leading-none">
                  {user ? (formattedCoins || coins.toLocaleString('pt-PT')) : '0'}
                </div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-amber-400/80 font-bold hidden sm:block">
                  Acordas
                </div>
              </div>
            </Link>

            {!user && authResolved && (
              <button
                type="button"
                onClick={() => {
                  setAuthWallTarget('/jogar')
                  setAuthWallOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Iniciar Sessão</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}
          </div>
        </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO PRINCIPAL — PALCO NACIONAL / JOGAR AGORA                         */}
      {/* ========================================================================= */}
      <section
        aria-label="Ação principal: Jogar Agora"
        className="relative overflow-hidden rounded-3xl sm:rounded-4xl border-2 border-amber-400/50 bg-gradient-to-b from-slate-950/90 via-blue-950/80 to-slate-950/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.2)] hover:border-amber-400/80 transition-all duration-300"
      >
        {/* Cantoneiras Heráldicas Douradas (Estilo Palco Game Show) */}
        <span className="pointer-events-none absolute top-3.5 left-3.5 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute top-3.5 right-3.5 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute bottom-3.5 left-3.5 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
        <span className="pointer-events-none absolute bottom-3.5 right-3.5 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-sm shadow-[0_0_10px_rgba(245,158,11,0.8)]" />

        {/* Glows volumétricos de holofotes de estúdio */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 via-cyan-500/10 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>EM TRANSMISSÃO • DESAFIO NACIONAL</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              ARENA NACIONAL
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow-sm">
              Entra no grande palco televisivo e responde às 10 perguntas cronometradas. Mostra o teu conhecimento sobre a história, cultura e geografia de Portugal!
            </p>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={handleStartClassic}
              className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-display font-black text-base sm:text-xl uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_55px_rgba(245,158,11,0.9)] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
              </div>
              <span>ENTRAR NO PALCO</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MODOS DE JOGO                                                          */}
      {/* ========================================================================= */}
      <section aria-label="Modos de Jogo" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
              MODOS DE JOGO
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Arenas Oficiais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: 🎯 CLÁSSICO */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleStartClassic}
            onKeyDown={(e) => e.key === 'Enter' && handleStartClassic()}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-emerald-400/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Principal
                </span>
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl uppercase text-white group-hover:text-emerald-300 transition-colors">
                CLÁSSICO
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                A experiência principal do Acorda Portugal. 10 perguntas cronometradas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="font-mono text-[11px] text-slate-400">Solo • 60s</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Entrar →
              </span>
            </div>
          </div>

          {/* Card 2: 🏆 MULTIPLAYER */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar/duelo')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar/duelo')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-amber-400/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Competitivo
                </span>
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl uppercase text-white group-hover:text-amber-300 transition-colors">
                MULTIPLAYER
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Entra numa partida com outros jogadores através do matchmaking nacional.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="font-mono text-[11px] text-slate-400">Matchmaking</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Jogar →
              </span>
            </div>
          </div>

          {/* Card 4: 🇵🇹 MEU DISTRITO */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/meu-distrito')}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/meu-distrito')}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/30 bg-slate-900/70 hover:bg-slate-900/90 hover:border-cyan-400/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Territorial
                </span>
                <span className="text-xl">🇵🇹</span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl uppercase text-white group-hover:text-cyan-300 transition-colors">
                MEU DISTRITO
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Representa o teu distrito. Conquista pontos para a Guerra dos Distritos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="font-mono text-[11px] text-slate-400">18 Distritos</span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Defender →
              </span>
            </div>
          </div>
        </div>

        {/* Modos Especiais Ativos (Compactos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* MODO MALUCO */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar?cat=modo-maluco', true)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar?cat=modo-maluco', true)}
            className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-rose-500/25 bg-slate-900/60 hover:bg-slate-900/80 hover:border-rose-400/50 backdrop-blur-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Laugh className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm uppercase text-white group-hover:text-rose-300 transition-colors">
                    Modo Maluco
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300">
                    Especial
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  Humor absurdo, armadilhas culturais e memes
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </div>

          {/* DESAFIO VISUAL */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleAction('/jogar?cat=desafio-visual', true)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('/jogar?cat=desafio-visual', true)}
            className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-blue-500/25 bg-slate-900/60 hover:bg-slate-900/80 hover:border-blue-400/50 backdrop-blur-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm uppercase text-white group-hover:text-blue-300 transition-colors">
                    Desafio Visual
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300">
                    Especial
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate mt-0.5">
                  Monumentos, bandeiras e património fotográfico
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACESSOS RÁPIDOS — EXPLORAR                                              */}
      {/* ========================================================================= */}
      <section aria-label="Acessos Rápidos" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-white">
            EXPLORAR
          </h2>
          <span className="text-xs font-mono text-slate-400">Atalhos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {/* Categorias */}
          <Link
            href="/categorias"
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-500/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-emerald-300 transition-colors">
                Categorias
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Por tema
              </span>
            </div>
          </Link>

          {/* Missões */}
          <Link
            href={user ? '/perfil#missoes' : '/entrar?redirect=/perfil'}
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-amber-500/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-amber-300 transition-colors">
                Missões
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Desafios diários
              </span>
            </div>
          </Link>

          {/* Ranking */}
          <Link
            href="/rankings"
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-gold/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-amber-300 transition-colors">
                Ranking
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Tabela nacional
              </span>
            </div>
          </Link>

          {/* Loja */}
          <Link
            href="/loja"
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-teal-500/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-teal-300 transition-colors">
                Loja
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Usa as Acordas
              </span>
            </div>
          </Link>

          {/* Perfil */}
          <Link
            href={user ? '/perfil' : '/entrar?redirect=/perfil'}
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-blue-500/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-blue-300 transition-colors">
                Perfil
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                O teu progresso
              </span>
            </div>
          </Link>

          {/* Conquistas */}
          <Link
            href="/conquistas"
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-indigo-500/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-indigo-300 transition-colors">
                Conquistas
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Troféus
              </span>
            </div>
          </Link>

          {/* Definições */}
          <Link
            href="/definicoes"
            className="group p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-400/40 backdrop-blur-xl transition-all flex flex-col justify-between select-none active:scale-95 col-span-2 sm:col-span-2 lg:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-700/30 text-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-black text-xs uppercase text-white block group-hover:text-slate-200 transition-colors">
                Definições
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                Preferências
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PEQUENO RESUMO DE PROGRESSO                                            */}
      {/* ========================================================================= */}
      <section
        aria-label="Resumo de Progresso"
        className="rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Indicador 1: Nível e XP */}
          <div className="flex items-center gap-3.5 pb-3 md:pb-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-display font-black text-lg shrink-0">
              {levelProgress.currentLevel.level}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Nível Atual
              </div>
              <div className="font-display font-black text-base text-white truncate">
                {levelProgress.currentLevel.cleanTitle}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {levelProgress.isMaxLevel ? (
                  'Patamar Máximo Alcançado'
                ) : (
                  `${levelProgress.xpRemaining.toLocaleString('pt-PT')} XP até Nível ${levelProgress.nextLevel?.level}`
                )}
              </div>
            </div>
          </div>

          {/* Indicador 2: Sequência / Streak */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:px-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                Sequência
              </div>
              <div className="font-display font-black text-base text-white">
                {streakDays} {streakDays === 1 ? 'Dia' : 'Dias'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {streakDays > 0 ? 'Mantém o ritmo diário!' : 'Joga hoje para começar!'}
              </div>
            </div>
          </div>

          {/* Indicador 3: Missão Diária Resumida */}
          <div className="flex items-center gap-3.5 pt-3 md:pt-0 md:pl-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                <span>Missão Diária</span>
                {highlightedMission && (
                  <span className="text-[10px] text-amber-300 font-black">
                    +{highlightedMission.reward}
                  </span>
                )}
              </div>
              <div className="font-display font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                {highlightedMission?.title || 'Completa 1 desafio hoje'}
              </div>
              {highlightedMission && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.round(
                          (highlightedMission.progress / highlightedMission.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {highlightedMission.progress}/{highlightedMission.total}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🔒 MODAL DE BLOQUEIO DE CONVIDADO / LOGIN OBRIGATÓRIO */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}
