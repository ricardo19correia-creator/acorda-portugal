'use client'

import React, { useState, useEffect } from 'react'
import { Target, Flame, Brain, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import {
  resolveDailyMissions,
  claimDailyMissionReward,
  getLisbonMidnightCountdown,
  type DailyMissionWithProgress,
} from '@/lib/daily-missions-service'
import { cn } from '@/lib/utils'

const ICONS = { target: Target, flame: Flame, brain: Brain, award: CheckCircle2, zap: Sparkles }

export function DailyMissions({ className }: { className?: string }) {
  const { user, profile } = useAuth()
  const [countdown, setCountdown] = useState<string>('')
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const missions: DailyMissionWithProgress[] = resolveDailyMissions(profile)

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getLisbonMidnightCountdown().formatted)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleClaim = async (missionId: string) => {
    if (!user) return
    setClaimingId(missionId)
    setFeedback(null)
    try {
      const res = await claimDailyMissionReward(user.uid, missionId)
      setFeedback(res.message)
      setTimeout(() => setFeedback(null), 5000)
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao reclamar a recompensa.')
      setTimeout(() => setFeedback(null), 4000)
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <div className={cn('rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-black uppercase text-white tracking-tight">Missões Diárias</h3>
          <p className="text-xs text-slate-400 mt-0.5">Progresso real baseado nas tuas partidas</p>
        </div>
        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-bold text-emerald-300">
          Renova em {countdown || '8h'}
        </span>
      </div>

      {feedback && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fadeIn">
          {feedback}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {missions.map((m) => {
          const Icon = ICONS[m.icon as keyof typeof ICONS] || Target
          const isClaiming = claimingId === m.id

          return (
            <li
              key={m.id}
              className={cn(
                'rounded-2xl border p-4 transition-all',
                m.isClaimed
                  ? 'border-white/5 bg-white/[0.02] opacity-80'
                  : m.isComplete
                  ? 'border-amber-400/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 bg-white/[0.04]'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={cn(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold',
                      m.isClaimed
                        ? 'bg-slate-800 text-slate-400'
                        : m.isComplete
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    )}
                  >
                    {m.isClaimed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{m.title}</p>
                    <p className="text-xs text-slate-400">
                      {user ? `${m.progress} / ${m.target}` : 'Inicia sessão para registar'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    +{m.xpReward} XP • +{m.coinsReward} €
                  </span>

                  {user && m.isComplete && !m.isClaimed && (
                    <button
                      type="button"
                      disabled={isClaiming}
                      onClick={() => handleClaim(m.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-md shadow-amber-400/30 cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {isClaiming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Reclamar</span>
                    </button>
                  )}

                  {m.isClaimed && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Recebida
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    m.isClaimed
                      ? 'bg-slate-600'
                      : m.isComplete
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  )}
                  style={{ width: `${user ? m.percentage : 0}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
