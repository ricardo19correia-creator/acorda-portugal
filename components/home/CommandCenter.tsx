'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Swords,
  Trophy,
  Flame,
  Shield,
  MapPin,
  Crown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShoppingBag,
  Target,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { calculateCompetitiveDivision, DIVISION_COLORS } from '@/lib/rankings'
import type { UserProfile } from '@/types'
import { cn } from '@/lib/utils'

interface CommandCenterProps {
  user: any
  profile: UserProfile | null
  nationalRank?: number | null
  districtRank?: number | null
  districtKing?: string | null
  onStartGame: (route: string) => void
}

export function CommandCenter({
  user,
  profile,
  nationalRank,
  districtRank,
  districtKing,
  onStartGame,
}: CommandCenterProps) {
  const router = useRouter()

  const xp = typeof profile?.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
  const levelInfo = calculateLevelProgress(xp)
  const currentLevel = levelInfo.currentLevel
  const nextLevel = levelInfo.nextLevel
  const progressPercent = Math.min(100, Math.max(0, Math.round(levelInfo.progressPercentage)))
  const xpNeeded = levelInfo.xpRemaining

  const userDistrict = (profile?.district || 'Portugal').trim()
  const wins = profile?.wins || 0
  const losses = profile?.losses || 0
  const rating = Math.max(500, Math.round(1000 + wins * 25 - losses * 15 + xp / 100))
  const division = calculateCompetitiveDivision(rating)
  const divColor = DIVISION_COLORS[division] || DIVISION_COLORS['Bronze']
  const title = getPlayerDisplayTitle(profile, currentLevel.title)
  const streak = typeof profile?.streak === 'number' ? profile.streak : wins > 0 ? Math.min(wins, 5) : 1
  const coins = profile?.virtualMoney ?? (profile as any)?.coins ?? (xp * 2)

  const displayName = profile?.displayName || user?.displayName || 'Jogador'

  // Saudação de acordo com a hora local portuguesa
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 20) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 lg:px-8">
      {/* CARD PRINCIPAL: COMMAND CENTER PESSOAL 2150 */}
      <div className="command-center-hud rounded-4xl p-6 sm:p-8 lg:p-10 border border-cyan-500/30 overflow-hidden relative shadow-2xl">
        {/* Luzes dinâmicas de energia */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Header do Jogador */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-5">
            <UserAvatar
              src={profile?.photoURL || user?.photoURL}
              activeFrame={(profile as any)?.equippedFrame}
              equippedFrame={(profile as any)?.equippedFrame}
              size="xl"
              rank={nationalRank || undefined}
              isCurrentUser
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="tactical-node-badge">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  STATUS: OPERACIONAL
                </span>
                <span className={cn('text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-md border', divColor.bg, divColor.text, divColor.border)}>
                  ⚔️ {division} ({rating} Elo)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display mt-1">
                {greeting}, {displayName} 🇵🇹
              </h2>

              <p className="text-xs sm:text-sm text-cyan-300 font-semibold mt-0.5">
                «{title}» • Nível {currentLevel.level}
              </p>
            </div>
          </div>

          {/* Saldo de Moedas & Streak */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Saldo de Moedas */}
            <Link
              href="/loja"
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 transition-all group"
            >
              <span className="text-lg">🪙</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-300 block font-mono">
                  Acordas Virtuais
                </span>
                <span className="text-sm sm:text-base font-black text-amber-400 font-mono group-hover:scale-105 transition-transform block">
                  {coins.toLocaleString('pt-PT')}
                </span>
              </div>
            </Link>

            {/* Streak Diário */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <Flame className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-300 block font-mono">
                  Streak Ativo
                </span>
                <span className="text-sm sm:text-base font-black text-rose-400 font-mono block">
                  {streak} {streak === 1 ? 'Dia' : 'Dias'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de Nível & XP */}
        <div className="my-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              Progresso para Nível {nextLevel ? nextLevel.level : currentLevel.level + 1}
            </span>
            <span className="text-cyan-400 font-black">
              {progressPercent}% ({xpNeeded > 0 ? `Faltam ${xpNeeded.toLocaleString('pt-PT')} XP` : 'Nível Máximo'})
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Grid Tático de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
            <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Ranking Nacional
            </span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              #{nationalRank || 1}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
            <MapPin className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              {userDistrict}
            </span>
            <span className="text-base sm:text-lg font-black text-cyan-300 font-mono">
              #{districtRank || 1}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
            <Swords className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Vitórias 1v1
            </span>
            <span className="text-base sm:text-lg font-black text-purple-300 font-mono">
              {wins}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10">
            <Crown className="w-4 h-4 text-amber-300 mx-auto mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Rei de {userDistrict}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono truncate block">
              {districtKing || 'Trono Aberto'}
            </span>
          </div>
        </div>

        {/* Ações de Comando Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Ação Primária: Quiz Principal */}
          <button
            type="button"
            onClick={() => onStartGame('/jogar')}
            className="button-game-gold rounded-2xl py-4 px-6 font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl hover:scale-102 transition-transform cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Jogar Agora</span>
          </button>

          {/* Duelo 1v1 */}
          <button
            type="button"
            onClick={() => onStartGame('/jogar/duelo')}
            className="btn-mech-purple rounded-2xl py-4 px-6 font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl hover:scale-102 transition-transform cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            <span>Duelo 1v1 Rápido</span>
          </button>

          {/* Explorar Mapa / Conquistar Território */}
          <Link
            href="/portugal-mapa"
            className="rounded-2xl py-4 px-6 bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 hover:text-white font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Mapa de Portugal 3D</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
