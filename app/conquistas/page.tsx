'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Trophy,
  Award,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  Flame,
  Swords,
  Coins,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { ACHIEVEMENTS_LIST, type AchievementItem, type AchievementCategory } from '@/data/achievements'
import { AppBackground } from '@/components/AppBackground'
import { cn } from '@/lib/utils'

export default function ConquistasPage() {
  const { user, profile } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('todas')

  const claimedAchievements = (profile as any)?.claimedAchievements || {}
  const userLevel = profile?.level ?? 1
  const userCoins = profile?.coins ?? profile?.euros ?? 0

  const userAchievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.map((ach) => {
      let progress = 0
      switch (ach.statKey) {
        case 'gamesPlayed':
          progress = profile?.gamesPlayed ?? 0
          break
        case 'questionsAnswered':
          progress = profile?.questionsAnswered ?? (profile?.totalQuestions ?? 0)
          break
        case 'level':
          progress = userLevel
          break
        case 'duelsWon':
          progress = (profile as any)?.stats?.duelsWon ?? (profile?.wins ?? 0)
          break
        case 'bestStreak':
          progress = profile?.bestStreak ?? 0
          break
        case 'coins':
          progress = userCoins
          break
        default:
          progress = 0
      }

      const isCompleted = progress >= ach.maxProgress
      const isClaimed = Boolean(claimedAchievements[ach.id])
      const canClaim = isCompleted && !isClaimed

      return {
        ...ach,
        currentProgress: Math.min(progress, ach.maxProgress),
        isCompleted,
        isClaimed,
        canClaim,
      }
    })
  }, [profile, userLevel, userCoins, claimedAchievements])

  const totalCount = userAchievements.length
  const completedCount = userAchievements.filter((a) => a.isCompleted).length
  const claimableCount = userAchievements.filter((a) => a.canClaim).length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'todas') return userAchievements
    return userAchievements.filter((a) => a.category === selectedCategory)
  }, [userAchievements, selectedCategory])

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <AppBackground />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby Principal</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/perfil?tab=conquistas"
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-sm font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Reclamar no Perfil</span>
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="w-full max-w-5xl mb-8 p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Quadro Nacional de Prestígio
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
              Conquistas de Portugal
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Supera os marcos do conhecimento nacional, acumula títulos históricos, ganha Acordas e desbloqueia molduras exclusivas.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-sm font-black text-amber-300 font-mono block">
              {completedCount} / {totalCount} Concluídas ({progressPercentage}%)
            </span>
            {claimableCount > 0 ? (
              <p className="text-xs font-black text-emerald-400 flex items-center sm:justify-end gap-1 mt-1 animate-pulse">
                <Gift className="w-3.5 h-3.5" /> {claimableCount} {claimableCount === 1 ? 'Recompensa pronta' : 'Recompensas prontas'}!
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-0.5">Continua a jogar para desbloquear mais</p>
            )}
          </div>
        </div>

        {/* Global Gold Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800 p-0.5 overflow-hidden shadow-inner relative z-10 mb-5">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/80 relative z-10">
          {[
            { id: 'todas', label: 'Todas' },
            { id: 'geral', label: 'Geral' },
            { id: 'duelos', label: 'Duelos 1v1' },
            { id: 'sequencias', label: 'Sequências' },
            { id: 'categorias', label: 'Categorias' },
            { id: 'distritos', label: 'Distritos' },
            { id: 'economia', label: 'Economia' },
            { id: 'maluco', label: 'Modo Maluco' },
            { id: 'especiais', label: 'Especiais' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedCategory(f.id as AchievementCategory)}
              className={cn(
                'cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                selectedCategory === f.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pb-16">
        {filteredAchievements.map((ach) => {
          const percent = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100))

          return (
            <div
              key={ach.id}
              className={cn(
                'p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md flex flex-col justify-between',
                ach.isClaimed
                  ? 'bg-slate-900/60 border-slate-800 opacity-75'
                  : ach.isCompleted
                  ? 'bg-slate-900/95 border-amber-500/60 shadow-xl shadow-amber-950/30'
                  : 'bg-slate-950/70 border-slate-800/80'
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-inner shrink-0',
                        ach.isCompleted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                      )}
                    >
                      {ach.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{ach.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  {ach.isClaimed ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Reclamada
                    </span>
                  ) : ach.isCompleted ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 uppercase shrink-0 animate-pulse">
                      Completa
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1 shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Bloqueada
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 mb-1">
                    <span>Progresso</span>
                    <span className={ach.isCompleted ? 'text-amber-400 font-black' : 'text-slate-300'}>
                      {ach.currentProgress} / {ach.maxProgress} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        ach.isCompleted
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-slate-700'
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Rewards & CTA */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recompensa:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    🪙 +{ach.rewardCoins} Acordas
                  </span>
                  {ach.rewardTitle && (
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-md">
                      « {ach.rewardTitle} »
                    </span>
                  )}
                </div>

                {ach.canClaim ? (
                  <Link
                    href="/perfil?tab=conquistas"
                    className="cursor-pointer text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-xl transition shadow-md flex items-center gap-1 active:scale-95"
                  >
                    <Gift className="w-3.5 h-3.5" /> Reclamar
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
