'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Play, Swords, Shield, Crown } from 'lucide-react'
import type { MapArenaPOI } from '@/components/portugal-map/types'

interface ArenaContextCardProps {
  arena: MapArenaPOI | null
  onClose: () => void
}

export function ArenaContextCard({ arena, onClose }: ArenaContextCardProps) {
  if (!arena) return null

  const isVip =
    (arena.rarity as string) === 'VIP' ||
    arena.rarity === 'Exclusiva' ||
    Boolean((arena as any).category?.startsWith('vip_'))

  return (
    <aside
      className="pointer-events-auto fixed sm:absolute z-30 inset-x-4 bottom-4 sm:bottom-auto sm:top-20 sm:right-6 sm:w-80 sm:inset-x-auto rounded-2xl border border-amber-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl text-white animate-slide-up isolate"
      style={{
        boxShadow: isVip ? '0 0 35px rgba(245, 158, 11, 0.25)' : '0 0 35px rgba(6, 182, 212, 0.18)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5">
            {isVip && <Crown className="h-3.5 w-3.5 text-amber-400" />}
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-400">
              ARENA DE COMBATE // {arena.rarity}
            </span>
          </div>
          <h2 className="font-display text-lg font-black uppercase tracking-tight text-white mt-0.5">
            {arena.name}
          </h2>
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

      {/* Image Preview */}
      {arena.image && (
        <div className="relative w-full h-32 my-3 rounded-xl overflow-hidden border border-white/10 bg-slate-900">
          <Image
            src={arena.image}
            alt={arena.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-bold">
            {arena.district}
          </span>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <Link
          href={`/jogar?arena=${encodeURIComponent(arena.id)}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 font-display text-xs font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
        >
          <Play className="h-4 w-4 fill-current text-slate-950" />
          <span>Entrar na Arena</span>
        </Link>
      </div>
    </aside>
  )
}
