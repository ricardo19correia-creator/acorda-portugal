'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flag, Crown, MapPin, ChevronRight, Sparkles, Trophy, ArrowRight } from 'lucide-react'
import { VALID_DISTRICTS, type ValidDistrict } from '@/data/districts'
import { subscribeRankings, computeDistrictStats, type RankingPlayer, type DistrictAggregateStat } from '@/lib/rankings'
import type { UserProfile } from '@/lib/game-data'

interface DistrictSectionProps {
  user: any
  profile: UserProfile | null
  onStartGame: (route: string) => void
}

export function DistrictSection({ user, profile, onStartGame }: DistrictSectionProps) {
  const router = useRouter()
  const [districtPlayers, setDistrictPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)

  // Distrito seguro do jogador
  const userDistrict = useMemo(() => {
    let d: string | null = null
    if (profile?.district && profile.district.trim() !== '') {
      d = profile.district.trim()
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_district')
      if (saved && saved.trim() !== '') d = saved.trim()
    }
    if (d && VALID_DISTRICTS.includes(d as ValidDistrict)) {
      return d
    }
    return null
  }, [profile?.district])

  // Subscrição aos rankings reais para calcular posição e XP do distrito
  useEffect(() => {
    const unsub = subscribeRankings('all', 'xp', (players) => {
      setDistrictPlayers(players)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Agregação dos distritos com dados 100% reais
  const { districtStat, topDistrictXp } = useMemo(() => {
    const statsMap = computeDistrictStats(districtPlayers)
    let topXp = 1
    statsMap.forEach((s) => {
      if (s.xp > topXp) topXp = s.xp
    })

    if (userDistrict && statsMap.has(userDistrict)) {
      return {
        districtStat: statsMap.get(userDistrict) || null,
        topDistrictXp: topXp,
      }
    }
    return { districtStat: null, topDistrictXp: topXp }
  }, [districtPlayers, userDistrict])

  const districtPosition = districtStat?.pos ? String(districtStat.pos).padStart(2, '0') : null
  const districtXp = districtStat?.xp ?? 0
  const progressPercent = Math.min(100, Math.max(5, Math.round((districtXp / (topDistrictXp || 1)) * 100)))

  return (
    <section
      aria-label="Representa o teu distrito"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full select-none"
    >
      {/* Header da Secção */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3 backdrop-blur-md">
          <Flag className="w-3.5 h-3.5" />
          <span>SOBERANIA TERRITORIAL</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          REPRESENTA O TEU DISTRITO.
        </h2>
        <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          O teu distrito não é apenas uma escolha no perfil. É o território que representas dentro do jogo.
        </p>
      </div>

      {/* Card Central de Território com Dados Reais */}
      <div className="max-w-3xl mx-auto">
        {user && userDistrict ? (
          /* Estado 1: Jogador Autenticado com Distrito Escolhido */
          <div className="group relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-amber-950/30 border-2 border-amber-500/50 hover:border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-2xl transition-all duration-300 overflow-hidden">
            {/* Brilho neon de canto */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Linha superior dourada */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Crown className="w-7 h-7 fill-amber-400/30" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                    DISTRITO REPRESENTADO
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-wide">
                    {userDistrict}
                  </h3>
                </div>
              </div>

              {/* Posição Nacional do Distrito */}
              {districtPosition && (
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-3xl sm:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-400 leading-none">
                    #{districtPosition}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
                    CLASSIFICAÇÃO NACIONAL
                  </span>
                </div>
              )}
            </div>

            {/* Barra de XP do Distrito */}
            <div className="py-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  XP DO DISTRITO
                </span>
                <span className="text-amber-300 font-bold">
                  {loading ? '...' : `${districtXp.toLocaleString('pt-PT')} XP`}
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="h-3 w-full rounded-full bg-slate-800/90 p-0.5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-1000 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* CTA do Distrito */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => onStartGame('/meu-distrito')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ENTRAR NO MEU DISTRITO</span>
                <ArrowRight className="w-4 h-4 font-black" />
              </button>
            </div>
          </div>
        ) : (
          /* Estado 2: Sem Distrito Selecionado ou Visitante */
          <div className="group relative rounded-3xl p-6 sm:p-10 bg-slate-900/85 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.3)] transition-all duration-300 text-center overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
              <MapPin className="w-8 h-8" />
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wide">
              AINDA NÃO ESCOLHESTE O TEU DISTRITO
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium leading-relaxed">
              Junta-te aos jogadores da tua terra natal. Cada vitória soma pontos diretos para a soberania do teu distrito no ranking nacional de Portugal.
            </p>

            <div className="mt-8 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => onStartGame('/meu-distrito')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-display font-black text-sm sm:text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ESCOLHER O MEU DISTRITO</span>
                <ArrowRight className="w-4 h-4 font-black" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
