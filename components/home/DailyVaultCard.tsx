'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Unlock, Flame, Sparkles, Clock, ArrowRight, Shield } from 'lucide-react'
import { fetchVaultStatus, formatCooldownTime, type VaultStatusResponse } from '@/lib/vault-service'
import { cn } from '@/lib/utils'

interface DailyVaultCardProps {
  className?: string
  onOpenVaultModal?: () => void
}

export function DailyVaultCard({ className, onOpenVaultModal }: DailyVaultCardProps) {
  const router = useRouter()
  const [status, setStatus] = useState<VaultStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cooldownMs, setCooldownMs] = useState(0)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      const data = await fetchVaultStatus()
      if (!isMounted) return
      setIsLoading(false)
      if (data && data.success) {
        setStatus(data)
        setCooldownMs(data.cooldownRemainingMs || 0)
      }
    }

    load()

    const handleVaultUpdated = () => {
      load()
    }

    window.addEventListener('vault_updated', handleVaultUpdated)
    window.addEventListener('focus', load)

    return () => {
      isMounted = false
      window.removeEventListener('vault_updated', handleVaultUpdated)
      window.removeEventListener('focus', load)
    }
  }, [])

  // Atualização em tempo real do cooldown regressivo
  useEffect(() => {
    if (!status || status.canClaim || cooldownMs <= 0) return

    const timer = setInterval(() => {
      setCooldownMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer)
          fetchVaultStatus().then((d) => {
            if (d && d.success) {
              setStatus(d)
              setCooldownMs(d.cooldownRemainingMs || 0)
            }
          })
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status, cooldownMs])

  const canClaim = status?.canClaim ?? false
  const streak = status?.currentStreak ?? 0

  const handleClick = (e: React.MouseEvent) => {
    if (onOpenVaultModal) {
      e.preventDefault()
      onOpenVaultModal()
    } else {
      router.push('/cofre')
    }
  }

  return (
    <section
      aria-label="Cofre Diário"
      className={cn('w-full max-w-3xl mx-auto px-4 my-3 select-none', className)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border backdrop-blur-xl p-3.5 sm:p-4 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.5)]',
          canClaim
            ? 'border-emerald-500/40 bg-gradient-to-r from-slate-950/90 via-emerald-950/30 to-slate-950/90 hover:border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
            : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
        )}
      >
        {/* Glow de fundo */}
        {canClaim && (
          <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />
        )}

        <div className="relative flex items-center justify-between gap-3">
          {/* Lado Esquerdo: Ícone + Título + Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-all',
                canClaim
                  ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              )}
            >
              {canClaim ? (
                <>
                  <span className="absolute h-9 w-9 rounded-xl bg-emerald-400/20 animate-ping opacity-60" />
                  <Unlock className="relative h-5 w-5 text-emerald-400" />
                </>
              ) : (
                <Lock className="h-5 w-5 text-slate-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-white tracking-wide">
                  COFRE DIÁRIO
                </span>
                {canClaim && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black text-emerald-300 uppercase tracking-wider animate-pulse">
                    DISPONÍVEL
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-xs">
                {streak > 0 && (
                  <span className="font-bold text-orange-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                    <span>{streak} {streak === 1 ? 'dia' : 'dias'} de streak</span>
                  </span>
                )}

                {!canClaim && cooldownMs > 0 && (
                  <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Próximo em: <strong className="text-amber-300 font-semibold">{formatCooldownTime(cooldownMs, false)}</strong></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Ação Rápida */}
          <div className="shrink-0">
            {canClaim ? (
              <Link
                href="/cofre"
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer border border-emerald-300/40"
              >
                <span>ABRIR</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </Link>
            ) : (
              <Link
                href="/cofre"
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span>DETALHES</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
