'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Crown, Medal, ArrowRight, Sparkles, MapPin } from 'lucide-react'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { UserAvatar } from '@/components/ui/UserAvatar'

export function RankingPreviewSection() {
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeRankings('all', 'xp', (data) => {
      setPlayers(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const top3 = players.slice(0, 3)
  const runnersUp = players.slice(3, 5)

  // Reordenação de pódio clássica de videojogo para desktop: [2º, 1º, 3º]
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <section
      aria-label="Resumo do ranking nacional"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header da Secção */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 mb-3 backdrop-blur-md">
          <Trophy className="w-3.5 h-3.5" />
          <span>LIGA NACIONAL • TEMPORADA 01</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          QUEM ESTÁ NO TOPO?
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Os líderes incontestados do conhecimento de Portugal. Posições atualizadas em tempo real.
        </p>
      </div>

      {loading ? (
        /* Skeleton Loading */
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-900/60 border border-white/10" />
          ))}
        </div>
      ) : top3.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pódio dos 3 Melhores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
            {podiumOrder.map((player) => {
              if (!player) return null
              const isFirst = player.pos === 1 || player.uid === top3[0]?.uid
              const isSecond = player.pos === 2 || player.uid === top3[1]?.uid
              const isThird = player.pos === 3 || player.uid === top3[2]?.uid

              const cardBorder = isFirst
                ? 'border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 sm:-translate-y-3'
                : isSecond
                ? 'border border-slate-300/40 shadow-lg bg-slate-900/80'
                : 'border border-amber-700/40 shadow-lg bg-slate-900/80'

              const rankBadge = isFirst
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                : isSecond
                ? 'bg-slate-300 text-slate-950 shadow-md'
                : 'bg-amber-700 text-white shadow-md'

              return (
                <div
                  key={player.uid}
                  className={`relative rounded-3xl p-6 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-between ${cardBorder}`}
                >
                  {/* Coroa ou Medalha de Posição */}
                  <div className="flex items-center justify-center mb-3">
                    {isFirst ? (
                      <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shadow-inner">
                        <Crown className="w-6 h-6 fill-amber-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 text-slate-300 flex items-center justify-center">
                        <Medal className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Avatar do Jogador */}
                  <div className="mb-4 relative">
                    <UserAvatar
                      src={player.photoURL}
                      activeFrame={player.equippedFrame}
                      size="md"
                      alt={player.displayName}
                    />
                    <span
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-black font-mono uppercase tracking-wider ${rankBadge}`}
                    >
                      #{player.pos || (isFirst ? 1 : isSecond ? 2 : 3)}
                    </span>
                  </div>

                  {/* Nome e Distrito */}
                  <h3 className="font-display font-black text-base sm:text-lg uppercase text-white tracking-wide truncate max-w-full">
                    {player.displayName}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-xs font-mono text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{player.district}</span>
                  </div>

                  {/* XP */}
                  <div className="mt-4 pt-3 border-t border-white/10 w-full text-center">
                    <span className="font-display font-black text-sm sm:text-base text-amber-300">
                      {player.xp.toLocaleString('pt-PT')} XP
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Nível {player.level}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Posições 4 e 5 em Linhas Táticas */}
          {runnersUp.length > 0 && (
            <div className="space-y-2 pt-2">
              {runnersUp.map((player) => (
                <div
                  key={player.uid}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-center font-display font-black text-sm text-slate-400">
                      #{player.pos || 4}
                    </span>
                    <UserAvatar
                      src={player.photoURL}
                      activeFrame={player.equippedFrame}
                      size="xs"
                      alt={player.displayName}
                    />
                    <div className="min-w-0">
                      <span className="font-display font-bold text-sm text-white block truncate">
                        {player.displayName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {player.district}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 block">
                      {player.xp.toLocaleString('pt-PT')} XP
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Nível {player.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Caso a base ainda não tenha jogadores carregados */
        <div className="text-center py-10 rounded-3xl bg-slate-900/60 border border-white/10 max-w-xl mx-auto p-6">
          <p className="text-sm text-slate-300">A carregar classificação nacional oficial...</p>
        </div>
      )}

      {/* CTA para o Ranking Completo */}
      <div className="mt-10 text-center">
        <Link
          href="/rankings"
          className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-yellow-500/40 hover:border-yellow-400 text-yellow-300 hover:text-white font-display font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-200 cursor-pointer"
        >
          <span>VER RANKING COMPLETO</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
