'use client'

import React, { useState } from 'react'
import { Gift, X, Check, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  DAILY_REWARDS_SCHEDULE,
  evaluateDailyRewardStatus,
  claimDailyReward,
  type DailyRewardItem,
} from '@/lib/daily-reward'
import { useAuth } from '@/components/auth-provider'

export interface DailyRewardModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DailyRewardModal({ isOpen, onClose }: DailyRewardModalProps) {
  const { user, profile, updateProfileLocally } = useAuth()
  const [claiming, setClaiming] = useState(false)
  const [claimedReward, setClaimedReward] = useState<DailyRewardItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const status = evaluateDailyRewardStatus(profile)
  const currentDay = status.currentDay
  const canClaim = status.canClaim

  const handleClaim = async () => {
    if (!user?.uid || !canClaim || claiming) return
    setClaiming(true)
    setError(null)

    try {
      const res = await claimDailyReward(user.uid)
      if (res.success && res.reward) {
        setClaimedReward(res.reward)
        if (updateProfileLocally && res.newTotalXp !== undefined && res.newTotalCoins !== undefined) {
          updateProfileLocally({
            xp: res.newTotalXp,
            coins: res.newTotalCoins,
            euros: res.newTotalCoins,
            level: res.newLevel,
          })
        }
      } else if (res.alreadyClaimed) {
        setError('Já reclamaste a tua recompensa hoje! Volta amanhã.')
      } else {
        setError(res.error || 'Não foi possível reclamar a recompensa.')
      }
    } catch (err: any) {
      setError(err?.message || 'Falha de comunicação com o servidor.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-4xl border border-white/15 bg-slate-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-center">
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Ícone de Destaque */}
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-pop">
          <Gift className="h-8 w-8" />
        </div>

        <div className="mt-4 space-y-1">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/30">
            Retenção Diária
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Recompensa Diária
          </h2>
          <p className="text-xs text-muted-foreground">
            Entra todos os dias para acumulares moedas, XP e ajudas exclusivas.
          </p>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {claimedReward ? (
          <div className="my-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-pop">
            <div className="text-3xl">{claimedReward.icon}</div>
            <p className="font-display text-lg font-black text-emerald-300">
              Recompensa Reclamada!
            </p>
            <p className="text-xs text-white font-bold">{claimedReward.rewardText}</p>
            <p className="text-[11px] text-slate-400">{claimedReward.description}</p>
          </div>
        ) : (
          /* Grelha dos 7 Dias */
          <div className="my-6 grid grid-cols-4 sm:grid-cols-7 gap-2 text-left">
            {DAILY_REWARDS_SCHEDULE.map((item) => {
              const isPast = !canClaim ? item.day <= currentDay : item.day < currentDay
              const isCurrent = item.day === currentDay && canClaim
              const isFuture = item.day > currentDay

              return (
                <div
                  key={item.day}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-500/20 text-white ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20 scale-105'
                      : isPast
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-400 opacity-80'
                        : 'border-white/5 bg-white/[0.02] text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    {item.label}
                  </span>

                  <div className="my-1 text-xl sm:text-2xl">
                    {isPast ? '✅' : item.icon}
                  </div>

                  <span className="text-[9px] font-bold leading-tight line-clamp-1">
                    {item.rewardText}
                  </span>

                  {isCurrent && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[8px] font-black uppercase">
                      Hoje
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Botão de Ação */}
        {!claimedReward && (
          <button
            type="button"
            onClick={handleClaim}
            disabled={!canClaim || claiming}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-display text-sm sm:text-base font-black uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:cursor-not-allowed cursor-pointer"
          >
            {claiming
              ? 'A resgatar...'
              : canClaim
                ? `Reclamar Recompensa do Dia ${currentDay} →`
                : 'Volta Amanhã para Mais'}
          </button>
        )}

        {claimedReward && (
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-display text-sm font-black uppercase tracking-wider transition cursor-pointer"
          >
            Continuar a Jogar
          </button>
        )}
      </div>
    </div>
  )
}
