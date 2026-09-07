'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  Swords,
  MapPin,
  Flame,
  Sparkles,
  Play,
  Shield,
  ArrowRight,
} from 'lucide-react'
import type { MapArenaPOI } from './types'
import { getArenaRarityBadge } from '@/src/data/shopArenas'
import { cn } from '@/lib/utils'

export interface NexusArenaModalProps {
  arena: MapArenaPOI | null
  isOpen: boolean
  onClose: () => void
  onStartGame: (route: string) => void
}

export function NexusArenaModal({
  arena,
  isOpen,
  onClose,
  onStartGame,
}: NexusArenaModalProps) {
  const [imgError, setImgError] = useState(false)

  if (!isOpen || !arena) return null

  const rarityBadgeClass = getArenaRarityBadge(arena.rarity as any)
  const safeImageSrc = imgError || !arena.image ? '/arenas/praca-liberdade.jpg' : arena.image

  const handleEnterArena = () => {
    onStartGame(`/jogar?arena=${encodeURIComponent(arena.id)}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl text-white space-y-5 animate-scale-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer active:scale-95 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header Tag */}
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
            ARENA LUSITANA // 2150
          </span>
          <span className={cn('px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border', rarityBadgeClass)}>
            {arena.rarity}
          </span>
        </div>

        {/* Arena High-Res Image with verified safe fallback */}
        <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900">
          <Image
            src={safeImageSrc}
            alt={arena.name}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition-transform duration-700 hover:scale-105"
            onError={() => setImgError(true)}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

          {/* District Tag on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono text-xs font-black uppercase text-cyan-300">
              {arena.district}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            {arena.name}
          </h2>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {arena.description}
          </p>
        </div>

        {/* Tactical Intel Specs */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
              Categoria Tática
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 uppercase">
              {arena.category || 'Monumento Histórico'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
              Estado de Combate
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
              Disponível em Jogo
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleEnterArena}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
          >
            <Play className="h-4 w-4 fill-current text-slate-950" />
            <span>Entrar na Arena</span>
          </button>

          <Link
            href="/arenas"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all text-center"
          >
            <span>Ver Catálogo</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NexusArenaModal
