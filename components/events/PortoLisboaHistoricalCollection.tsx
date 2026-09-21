'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Trophy, Crown, Medal, Award, Calendar, Coins, ArrowRight, Sparkles, Shield } from 'lucide-react'
import { PortoLisboaPrize3D, type TrophyPlacement, type TrophyTeamSide } from './PortoLisboaTrophy3D'
import { PortoLisboaPrizeModal, OFFICIAL_PORTO_LISBOA_PRIZES } from './PortoLisboaPrizeModal'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/lib/game-data'

export interface HistoricalConquestItem {
  eventId: string
  eventName: string
  eventYear: number
  placement: number
  team: 'porto' | 'lisboa' | null
  rewardName: string
  title: string
  acordas: number
  conqueredAt: string
}

interface PortoLisboaHistoricalCollectionProps {
  profile: UserProfile | null
  className?: string
}

export function PortoLisboaHistoricalCollection({
  profile,
  className,
}: PortoLisboaHistoricalCollectionProps) {
  const [selectedPlacement, setSelectedPlacement] = useState<TrophyPlacement | null>(null)
  const [selectedConquest, setSelectedConquest] = useState<HistoricalConquestItem | null>(null)

  // Extrair conquistas históricas do utilizador
  const conquests: HistoricalConquestItem[] = React.useMemo(() => {
    const list: HistoricalConquestItem[] = []

    // 1. Array explícito de conquistas históricas
    if (Array.isArray((profile as any)?.historical_conquests)) {
      for (const item of (profile as any).historical_conquests) {
        if (item && item.placement && item.placement <= 3) {
          list.push(item)
        }
      }
    }

    // 2. Fallback via event_rewards
    const eventRewards = (profile as any)?.event_rewards || {}
    const plReward =
      eventRewards['oficial_porto_vs_lisboa'] ||
      eventRewards['porto-vs-lisboa-2026'] ||
      eventRewards['porto-vs-lisboa']

    if (plReward && plReward.position && plReward.position <= 3) {
      const exists = list.some(
        (c) =>
          c.eventId === 'oficial_porto_vs_lisboa' &&
          c.placement === plReward.position
      )
      if (!exists) {
        const placement = plReward.position as 1 | 2 | 3
        const prizeInfo = OFFICIAL_PORTO_LISBOA_PRIZES[placement]
        list.push({
          eventId: 'oficial_porto_vs_lisboa',
          eventName: 'PORTO × LISBOA 2026',
          eventYear: 2026,
          placement,
          team: plReward.team || 'porto',
          rewardName: plReward.trophyName || prizeInfo.trophyName,
          title: plReward.title || prizeInfo.title,
          acordas: plReward.amount || prizeInfo.acordas,
          conqueredAt: plReward.claimedAt
            ? typeof plReward.claimedAt === 'string'
              ? plReward.claimedAt
              : new Date().toISOString()
            : new Date().toISOString(),
        })
      }
    }

    return list
  }, [profile])

  const hasHistoricalTrophies = conquests.length > 0

  const handleOpenModal = (conquest: HistoricalConquestItem) => {
    const p = Math.min(3, Math.max(1, conquest.placement)) as TrophyPlacement
    setSelectedPlacement(p)
    setSelectedConquest(conquest)
  }

  const handleInspectPreview = (placement: TrophyPlacement) => {
    setSelectedPlacement(placement)
    setSelectedConquest(null)
  }

  return (
    <div
      className={cn(
        'rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900/95 via-[#080d20]/95 to-slate-950 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 text-left relative overflow-hidden',
        className
      )}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho da Secção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>Coleção Histórica do Acorda Portugal</span>
          </div>

          <h3 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-white mt-1 flex items-center gap-2.5">
            <span>👑 TROFÉUS & CONQUISTAS OFICIAIS</span>
          </h3>

          <p className="text-xs text-slate-400 mt-0.5">
            Registo permanente dos títulos e troféus de topo alcançados nos grandes eventos competitivos do país.
          </p>
        </div>

        <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
          {hasHistoricalTrophies
            ? `${conquests.length} ${conquests.length === 1 ? 'Troféu Conquistado' : 'Troféus Conquistados'}`
            : 'Em Disputa Nacional'}
        </span>
      </div>

      {/* Seção 1: Troféus Efetivamente Conquistados pelo Jogador */}
      {hasHistoricalTrophies ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {conquests.map((conquest, idx) => {
            const placement = Math.min(3, Math.max(1, conquest.placement)) as TrophyPlacement
            const prizeInfo = OFFICIAL_PORTO_LISBOA_PRIZES[placement]
            const formattedDate = conquest.conqueredAt
              ? new Date(conquest.conqueredAt).toLocaleDateString('pt-PT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '2026'

            return (
              <div
                key={`${conquest.eventId}-${conquest.placement}-${idx}`}
                onClick={() => handleOpenModal(conquest)}
                className={cn(
                  'group relative rounded-2xl p-5 border shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1',
                  placement === 1
                    ? 'bg-gradient-to-b from-amber-950/60 via-slate-900/90 to-slate-950 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                    : placement === 2
                    ? 'bg-gradient-to-b from-slate-800/60 via-slate-900/90 to-slate-950 border-slate-300/60 shadow-[0_0_25px_rgba(226,232,240,0.2)]'
                    : 'bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 border-amber-700/60 shadow-[0_0_25px_rgba(217,119,6,0.2)]'
                )}
              >
                {/* Badge Superior da Conquista */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <span>🏆</span>
                    <span>CONQUISTADO</span>
                  </span>

                  <span className="text-[10px] font-black uppercase text-amber-300 font-mono">
                    {conquest.eventName} · {conquest.eventYear}
                  </span>
                </div>

                {/* Renderização 3D */}
                <div className="h-36 sm:h-40 flex items-center justify-center my-2">
                  <PortoLisboaPrize3D
                    placement={placement}
                    teamSide={conquest.team}
                    size="md"
                    interactive={false}
                  />
                </div>

                {/* Textos de Consagração */}
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {placement === 1 ? '🥇 1.º LUGAR' : placement === 2 ? '🥈 2.º LUGAR' : '🥉 3.º LUGAR'}
                  </span>

                  <h4 className="font-display text-base sm:text-lg font-black uppercase text-white group-hover:text-amber-300 transition-colors">
                    {conquest.title}
                  </h4>

                  <p className="text-[11px] font-bold text-slate-300">
                    {conquest.rewardName}
                  </p>
                </div>

                {/* Metadados Históricos Exigidos */}
                <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Lado Escolhido:</span>
                    <strong className="text-white">
                      {conquest.team === 'porto'
                        ? 'Porto 🔵'
                        : conquest.team === 'lisboa'
                        ? 'Lisboa 🔴'
                        : 'Portugal ⚔️'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Acordas Atribuídos:</span>
                    <strong className="text-amber-400 font-mono font-black">
                      {conquest.acordas.toLocaleString('pt-PT')}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Data de Conquista:</span>
                    <strong className="text-slate-300 font-mono">{formattedDate}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Seção 2: Quando o Jogador ainda não tem troféus oficiais finalizados */
        <div className="space-y-4 relative z-10">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-2xl">
                🏆
              </div>
              <div>
                <h4 className="font-display text-sm sm:text-base font-black uppercase text-white">
                  PORTO × LISBOA 2026 — PRÉMIOS EM DISPUTA
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Termina no Top 3 do evento atual para imortalizar o teu nome nesta vitrine com títulos míticos e até 50.000 Acordas.
                </p>
              </div>
            </div>

            <Link
              href="/eventos/porto-vs-lisboa"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition cursor-pointer shadow-lg shrink-0 flex items-center gap-1.5"
            >
              <span>Disputar Troféus</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Miniatura dos 3 Prémios em Disputa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((pos) => {
              const p = pos as TrophyPlacement
              const prize = OFFICIAL_PORTO_LISBOA_PRIZES[p]

              return (
                <div
                  key={pos}
                  onClick={() => handleInspectPreview(p)}
                  className="rounded-2xl bg-slate-900/60 border border-white/10 p-3.5 flex items-center gap-3 cursor-pointer hover:border-amber-400/50 transition group"
                >
                  <div className="h-14 w-12 shrink-0 flex items-center justify-center">
                    <PortoLisboaPrize3D placement={p} size="sm" interactive={false} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase text-amber-400">
                      {prize.rankLabel}
                    </span>
                    <p className="font-display text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                      {prize.title}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {prize.acordas.toLocaleString('pt-PT')} Acordas
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de Inspeção */}
      <PortoLisboaPrizeModal
        placement={selectedPlacement}
        teamSide={selectedConquest?.team || null}
        isConquered={Boolean(selectedConquest)}
        conqueredDate={
          selectedConquest?.conqueredAt
            ? new Date(selectedConquest.conqueredAt).toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : null
        }
        onClose={() => {
          setSelectedPlacement(null)
          setSelectedConquest(null)
        }}
      />
    </div>
  )
}
