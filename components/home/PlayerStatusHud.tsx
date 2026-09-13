'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Flame, MapPin, Coins, Zap, LogIn } from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { calculateLevelProgress } from '@/lib/progression'
import { useEconomy } from '@/context/economy-context'
import type { UserProfile } from '@/lib/game-data'

interface PlayerStatusHudProps {
  user: any
  profile: UserProfile | null
  onOpenAuth?: () => void
}

export function PlayerStatusHud({ user, profile, onOpenAuth }: PlayerStatusHudProps) {
  const { formattedCoins } = useEconomy()

  // 1. Estado Autenticado: HUD Compacto de Jogo
  if (user) {
    const xp = typeof profile?.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
    const levelInfo = calculateLevelProgress(xp)
    const level = profile?.level || levelInfo.currentLevel.level || 1
    const district = (profile?.district || 'Portugal').trim()
    const streak = typeof profile?.streak === 'number' ? profile.streak : 0
    const displayName = profile?.displayName || user?.displayName || 'Jogador'
    const formattedXp = new Intl.NumberFormat('pt-PT').format(xp)

    return (
      <section
        aria-label="Estado do Jogador"
        className="w-full max-w-3xl mx-auto px-4 mt-2 mb-8 select-none"
      >
        <div className="relative rounded-2xl bg-slate-950/70 border border-emerald-500/25 backdrop-blur-xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all hover:border-emerald-500/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Bloco Esquerda: Avatar + Identificação */}
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              <div className="shrink-0">
                <UserAvatar
                  profile={profile}
                  src={profile?.photoURL || user?.photoURL}
                  size="sm"
                  isCurrentUser
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display font-black text-sm sm:text-base text-white">
                    {displayName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                    {district}
                  </span>
                </div>

                {/* Métricas Compactas em Linha */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-1">
                  <span className="font-bold text-emerald-400">
                    NÍVEL {level}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono text-slate-300 font-medium">
                    {formattedXp} XP
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    {formattedCoins}
                  </span>
                  {streak > 0 && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="font-bold text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {streak}d
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bloco Direita: Ligação Discreta para o Perfil */}
            <div className="shrink-0 w-full sm:w-auto text-right">
              <Link
                href="/perfil"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-emerald-300 transition-all cursor-pointer w-full sm:w-auto"
              >
                <span>VER PERFIL</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 2. Estado Não Autenticado: Área Pequena e Elegante
  return (
    <section
      aria-label="Aviso de Entrada"
      className="w-full max-w-xl mx-auto px-4 mt-2 mb-8 select-none"
    >
      <div className="rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <p className="text-xs sm:text-sm text-slate-300 font-medium text-center sm:text-left">
          Entra no Acorda Portugal para guardar o teu progresso.
        </p>

        <Link
          href="/entrar"
          onClick={(e) => {
            if (onOpenAuth) {
              e.preventDefault()
              onOpenAuth()
            }
          }}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-white/10 hover:bg-emerald-500/20 border border-white/20 hover:border-emerald-400/50 text-white hover:text-emerald-300 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <LogIn className="w-3.5 h-3.5 text-emerald-400" />
          <span>ENTRAR</span>
        </Link>
      </div>
    </section>
  )
}
