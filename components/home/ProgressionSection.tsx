'use client'

import React from 'react'
import Link from 'next/link'
import { Flame, Trophy, Coins, ArrowRight, User, Shield, Sparkles, Zap } from 'lucide-react'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { calculateCompetitiveDivision, DIVISION_COLORS } from '@/lib/rankings'
import { useEconomy } from '@/context/economy-context'
import type { UserProfile } from '@/lib/game-data'

interface ProgressionSectionProps {
  user: any
  profile: UserProfile | null
}

export function ProgressionSection({ user, profile }: ProgressionSectionProps) {
  const { formattedCoins } = useEconomy()

  const xp = typeof profile?.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
  const levelInfo = calculateLevelProgress(xp)
  const currentLevel = levelInfo.currentLevel
  const progressPercent = Math.min(100, Math.max(0, Math.round(levelInfo.progressPercentage)))
  const streak = typeof profile?.streak === 'number' ? profile.streak : (profile?.wins ? 1 : 0)
  const wins = profile?.wins || 0
  const losses = profile?.losses || 0
  const rating = Math.max(500, Math.round(1000 + wins * 25 - losses * 15 + xp / 100))
  const division = calculateCompetitiveDivision(rating)
  const title = getPlayerDisplayTitle(profile, currentLevel.title)

  return (
    <section
      aria-label="A tua jornada de progressão"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header da Secção */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-3 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" />
          <span>PROGRESSÃO INDIVIDUAL</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          A TUA JORNADA.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Cada resposta certa aproxima-te do topo nacional. Conquista XP, sobe de escalão e desbloqueia o teu prestígio.
        </p>
      </div>

      {/* Card de Resumo de Progressão */}
      <div className="max-w-3xl mx-auto">
        {user ? (
          /* Estado Autenticado: Resumo Real de Perfil */
          <div className="group relative rounded-3xl p-6 sm:p-10 bg-slate-900/85 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 overflow-hidden">
            {/* Brilho neon de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Top: Nível e Título */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                    STATUS DO JOGADOR
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wide">
                    NÍVEL {currentLevel.level}
                  </h3>
                  <span className="text-xs font-bold text-slate-300 mt-0.5 block">
                    {title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                  Divisão {division}
                </span>
              </div>
            </div>

            {/* Barra de XP com Percentagem */}
            <div className="py-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase tracking-wider">
                  XP ACUMULADO: <strong className="text-white">{xp.toLocaleString('pt-PT')} XP</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  {progressPercent}% PARA O PRÓXIMO NÍVEL
                </span>
              </div>

              <div className="h-3 w-full rounded-full bg-slate-800/90 p-0.5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Indicadores Táticos: Sequência, Conquistas, Acordas */}
            <div className="grid grid-cols-3 gap-3 py-4 border-t border-white/10">
              {/* Sequência */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="font-display font-black text-base sm:text-lg">{streak}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Sequência
                </span>
              </div>

              {/* Conquistas / Vitórias */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="font-display font-black text-base sm:text-lg">{wins}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Vitórias
                </span>
              </div>

              {/* Acordas */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                  <Coins className="w-4 h-4" />
                  <span className="font-display font-black text-base sm:text-lg">{formattedCoins}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Acordas
                </span>
              </div>
            </div>

            {/* CTA para o Perfil Completo */}
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/perfil"
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VER O MEU PERFIL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Estado Visitante: Teaser da Jornada */
          <div className="group relative rounded-3xl p-6 sm:p-10 bg-slate-900/85 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 text-center overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wide">
              COMEÇA A TUA JORNADA NACIONAL
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium leading-relaxed">
              Cria o teu perfil para acumulares XP, ganhares Acordas, subires de nível e representares o teu distrito na competição de Portugal.
            </p>

            <div className="mt-8 max-w-sm mx-auto">
              <Link
                href="/entrar"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CRIAR CONTA OU ENTRAR</span>
                <ArrowRight className="w-4 h-4 font-black" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
