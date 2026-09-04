'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, MapPin, Swords, ExternalLink } from 'lucide-react'
import type { MapArenaPOI } from './types'
import { cn } from '@/lib/utils'

interface ArenaDetailsModalProps {
  arena: MapArenaPOI | null
  isOpen: boolean
  onClose: () => void
  onStartGame?: (route: string) => void
}

export function ArenaDetailsModal({
  arena,
  isOpen,
  onClose,
  onStartGame,
}: ArenaDetailsModalProps) {
  if (!isOpen || !arena) return null

  const rarityColor =
    arena.rarity === 'VIP' || arena.rarity === 'Exclusiva'
      ? 'from-amber-500 to-yellow-300 text-amber-950 border-amber-400'
      : arena.rarity === 'Lendária'
      ? 'from-amber-500 to-orange-500 text-slate-950 border-amber-400'
      : arena.rarity === 'Épica'
      ? 'from-purple-500 to-indigo-500 text-white border-purple-400'
      : arena.rarity === 'Rara'
      ? 'from-blue-500 to-cyan-500 text-white border-cyan-400'
      : 'from-slate-600 to-slate-500 text-white border-slate-400'

  const handlePlay = () => {
    const route = `/jogar?distrito=${encodeURIComponent(arena.district)}`
    if (onStartGame) {
      onStartGame(route)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-white/20 p-5 sm:p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.25), 0 25px 50px rgba(0,0,0,0.9)',
        }}
      >
        {/* Glow de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-xl bg-slate-900/80 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Arena Image Preview */}
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/15 bg-slate-900 mb-4 group">
          <Image
            src={arena.image}
            alt={arena.name}
            fill
            sizes="(max-width: 640px) 100vw, 500px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Rarity & District Badges */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className={cn(
                'px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r shadow-lg border',
                rarityColor
              )}
            >
              ★ ARENA {arena.rarity.toUpperCase()}
            </span>

            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold text-white bg-slate-950/80 border border-white/20 backdrop-blur-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {arena.district}
            </span>
          </div>
        </div>

        {/* Arena Title & Description */}
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-black text-white tracking-tight">
            {arena.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {arena.description}
          </p>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-1">
            <span>Coordenadas:</span>
            <span className="text-cyan-400">
              {arena.coordinates[1].toFixed(4)}°N, {Math.abs(arena.coordinates[0]).toFixed(4)}°W
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
          <button
            type="button"
            onClick={handlePlay}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Swords className="w-4 h-4" />
            <span>Jogar nesta Arena</span>
          </button>

          <Link
            href="/loja"
            className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-900 border border-white/15 hover:border-white/30 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors hover:bg-slate-800"
          >
            <span>Ver Coleção</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  )
}
