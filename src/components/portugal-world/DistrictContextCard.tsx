'use client'

import React from 'react'
import Link from 'next/link'
import { X, Play, Users, Swords, Trophy, Sparkles } from 'lucide-react'
import type { DistrictItem } from '@/src/data/districts'

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

  return (
    <aside
      className="pointer-events-auto fixed sm:absolute z-30 inset-x-4 bottom-4 sm:bottom-auto sm:top-20 sm:right-6 sm:w-76 sm:inset-x-auto rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl text-white animate-slide-up isolate"
      style={{
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.18)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2.5 border-b border-white/10">
        <div>
          <h2 className="font-display text-xl font-black uppercase tracking-tight text-white">
            {district.name}
          </h2>
          <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            #{district.ranking} DISTRITO // {district.region}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-white/10 text-center">
        {/* Jogadores */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Users className="h-3 w-3 text-cyan-400" />
            <span>Jogadores</span>
          </div>
          <span className="font-mono text-sm font-black text-cyan-200">
            {formattedPlayers}
          </span>
        </div>

        {/* Arenas */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Swords className="h-3 w-3 text-purple-400" />
            <span>Arenas</span>
          </div>
          <span className="font-mono text-sm font-black text-purple-200">
            {district.arenasCount}
          </span>
        </div>

        {/* Score / Poder */}
        <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono uppercase text-slate-400 mb-0.5">
            <Trophy className="h-3 w-3 text-amber-400" />
            <span>Poder</span>
          </div>
          <span className="font-mono text-sm font-black text-amber-200">
            {formattedScore}
          </span>
        </div>
      </div>

      {/* Motto / Status */}
      {district.motto && (
        <p className="text-[11px] text-slate-300/85 italic py-2 line-clamp-1 border-b border-white/5">
          "{district.motto}"
        </p>
      )}

      {/* CTA Button */}
      <div className="pt-3">
        <Link
          href={`/jogar?district=${encodeURIComponent(district.slug)}`}
          onClick={() => onPlay?.(district)}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 font-display text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Play className="h-4 w-4 fill-current text-slate-950" />
          <span>Jogar em {district.name}</span>
        </Link>
      </div>
    </aside>
  )
}
