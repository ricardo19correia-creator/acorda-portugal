'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { X, Play, Users, Swords, Trophy, Crown, Sparkles, ChevronRight } from 'lucide-react'
import { type DistrictItem, CANONICAL_ARENAS } from '@/src/data/districts'

interface DistrictContextCardProps {
  district: DistrictItem | null
  onClose: () => void
  onPlay?: (district: DistrictItem) => void
}

export function DistrictContextCard({
  district,
  onClose,
  onPlay,
}: DistrictContextCardProps) {
  if (!district) return null

  const formattedPlayers = district.players >= 1000
    ? `${(district.players / 1000).toFixed(1)}k`
    : district.players.toLocaleString('pt-PT')

  const formattedScore = district.score >= 1000
    ? `${(district.score / 1000).toFixed(1)}k`
    : district.score.toString()

  const districtArenas = useMemo(() => {
    if (!district) return []
    const dName = district.name.toLowerCase()
    const cName = district.canonicalName.toLowerCase()
    return CANONICAL_ARENAS.filter((a) => {
      const aDist = (a.district || '').toLowerCase()
      return aDist === dName || aDist === cName
    })
  }, [district])

  return (
    <aside
      aria-label={`Informação de ${district.name}`}
      className="pointer-events-auto fixed sm:absolute z-30 inset-x-3 bottom-3 sm:bottom-auto sm:top-20 sm:right-6 sm:w-84 sm:inset-x-auto max-h-[55vh] sm:max-h-[82vh] overflow-y-auto rounded-3xl border border-cyan-500/30 bg-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl text-white animate-slide-up isolate custom-scrollbar"
      style={{
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.22), 0 20px 40px rgba(0,0,0,0.85)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Glow Superior */}
      <div
        className="absolute top-0 inset-x-0 h-24 opacity-25 blur-2xl pointer-events-none"
        style={{ backgroundColor: district.dominantColor || '#00e5ff' }}
      />

      {/* Mobile Swipe / Drag Hint */}
      <div className="sm:hidden w-10 h-1 rounded-full bg-white/25 mx-auto mb-2.5" />

      {/* Header */}
      <div className="relative flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: district.dominantColor || '#00e5ff' }}
            />
            <span className="font-mono text-[10px] font-black text-cyan-400 uppercase tracking-widest">
              #{district.ranking} DISTRITO // {district.region.toUpperCase()}
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
            {district.name}
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Capital: <strong className="text-slate-200">{district.capital}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel do distrito"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-white/10 text-center">
        {/* Jogadores Reais */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Users className="h-3 w-3 text-cyan-400" />
            <span>Jogadores</span>
          </div>
          <span className="font-mono text-base font-black text-cyan-200">
            {formattedPlayers}
          </span>
        </div>

        {/* Arenas */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Swords className="h-3 w-3 text-purple-400" />
            <span>Arenas</span>
          </div>
          <span className="font-mono text-base font-black text-purple-200">
            {district.arenasCount}
          </span>
        </div>

        {/* Score / Poder */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Poder</span>
          </div>
          <span className="font-mono text-base font-black text-amber-200">
            {formattedScore}
          </span>
        </div>
      </div>

      {/* Motto / Description */}
      {district.motto && (
        <div className="py-2.5 border-b border-white/10">
          <p className="text-xs text-cyan-100/90 italic font-medium leading-relaxed">
            "{district.motto}"
          </p>
        </div>
      )}

      {/* Arenas do Território */}
      {districtArenas.length > 0 && (
        <div className="py-3 border-b border-white/10 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span>Arenas Nacionais ({districtArenas.length})</span>
            <Link
              href={`/arenas?district=${encodeURIComponent(district.slug)}`}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center"
            >
              <span>Ver todas</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
            {districtArenas.slice(0, 3).map((arena) => {
              const isVip =
                (arena.rarity as string) === 'VIP' ||
                arena.rarity === 'Exclusiva' ||
                Boolean((arena as any).category?.startsWith('vip_'))
              return (
                <Link
                  key={arena.id}
                  href={`/jogar?arena=${encodeURIComponent(arena.id)}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 truncate">
                    {isVip ? (
                      <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {arena.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 ml-1.5">
                    {arena.rarity}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="pt-3.5 space-y-2">
        <Link
          href={`/jogar?dist=${encodeURIComponent(district.slug)}&cat=o-meu-distrito`}
          onClick={() => onPlay?.(district)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 font-display text-xs font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Play className="h-4 w-4 fill-current text-slate-950" />
          <span>Jogar em {district.name}</span>
        </Link>

        <Link
          href={`/rankings?district=${encodeURIComponent(district.name)}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span>Classificação do Distrito</span>
        </Link>
      </div>
    </aside>
  )
}
