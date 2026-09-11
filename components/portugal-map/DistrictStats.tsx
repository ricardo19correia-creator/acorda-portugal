'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { DistrictMapItem } from '@/lib/district-map-data'
import {
  X,
  Trophy,
  Users,
  Zap,
  Crown,
  TrendingUp,
  ChevronRight,
  Play,
  MapPin,
  Flame,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DistrictStatsProps {
  district: DistrictMapItem | null
  isOpen: boolean
  onClose: () => void
  onPlayDistrict?: (slug: string) => void
  className?: string
}

export function DistrictStats({
  district,
  isOpen,
  onClose,
  onPlayDistrict,
  className,
}: DistrictStatsProps) {
  const router = useRouter()

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !district) return null

  const handleActionClick = () => {
    if (onPlayDistrict) {
      onPlayDistrict(district.slug)
    } else {
      router.push(`/jogar?dist=${encodeURIComponent(district.slug)}&cat=o-meu-distrito`)
    }
  }

  const isPodium = district.pos <= 3

  return (
    <>
      {/* Backdrop para Mobile Portrait (permite fechar com toque fora) */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 sm:hidden transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel do Distrito Responsivo:
          - Mobile Portrait: Bottom Sheet (max-h-[55vh], sobreposto na base com handle de arrasto)
          - Mobile Landscape: Painel lateral direito compacto (w-[270px] a w-[300px])
          - Desktop: Painel lateral elegante acoplado à direita (w-[340px] a w-[370px])
      */}
      <aside
        role="dialog"
        aria-label={`Painel do Distrito ${district.name}`}
        aria-modal="true"
        className={cn(
          'fixed z-40 text-white select-none shadow-2xl',
          // Mobile Portrait (abaixo de 640px)
          'inset-x-0 bottom-0 rounded-t-3xl border-t border-x border-cyan-500/30 bg-slate-950/95 max-h-[55vh] overflow-y-auto pb-safe',
          // Mobile Landscape (Right Side Panel)
          'landscape:inset-x-auto landscape:right-2 landscape:top-2 landscape:bottom-2 landscape:w-[290px] landscape:max-h-[calc(100dvh-1rem)] landscape:rounded-2xl landscape:border landscape:border-cyan-500/35 landscape:p-3 landscape:gap-2.5 landscape:overflow-y-auto',
          // Tablets/Desktop (sm e superior)
          'sm:inset-x-auto sm:right-4 sm:top-20 sm:bottom-auto sm:w-[320px] md:w-[340px] lg:w-[360px] sm:max-h-[calc(100dvh-100px)] sm:rounded-3xl sm:border sm:border-cyan-500/35',
          'backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-3.5',
          'animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-right-6 duration-200 ease-out',
          className
        )}
        style={{
          boxShadow:
            district.pos === 1
              ? '0 0 35px rgba(245, 158, 11, 0.25), 0 20px 40px rgba(0,0,0,0.95)'
              : '0 0 30px rgba(6, 182, 212, 0.2), 0 20px 40px rgba(0,0,0,0.95)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Swipe Handle (oculto em landscape) */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto sm:hidden landscape:hidden shrink-0" />

        {/* 1. TOPO: Nome do Distrito & Classificação Nacional */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl shrink-0">
                {district.type === 'island' ? '🌊' : '🇵🇹'}
              </span>
              <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-tight truncate">
                {district.name}
              </h2>
            </div>

            <p className="text-[11px] text-slate-400 font-medium line-clamp-1 italic">
              &ldquo;{district.motto}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fechar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel do distrito"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. DESTAQUE DO RANKING NACIONAL (#X) */}
        <div
          className={cn(
            'flex items-center justify-between p-3 rounded-2xl border transition-all',
            district.pos === 1
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10'
              : district.pos === 2
                ? 'bg-slate-200/10 border-slate-300/30 text-slate-100'
                : district.pos === 3
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-200'
                  : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-200'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner',
                district.pos === 1
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : district.pos <= 3
                    ? 'bg-white/20 text-white'
                    : 'bg-cyan-500/20 text-cyan-300'
              )}
            >
              <Trophy className="w-4 h-4" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Classificação Nacional
              </span>
              <span className="font-display text-base font-black tracking-tight text-white flex items-center gap-1.5">
                {district.pos === 1 && '👑'} #{district.pos} Nacional
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Poder Territorial
            </span>
            <span className="font-mono text-xs font-black text-white">
              {district.powerFormatted}
            </span>
          </div>
        </div>

        {/* 3. ESTATÍSTICAS REAIS DO JOGO */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {/* Jogadores */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              Jogadores
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <strong className="text-sm font-black text-white">
                {district.activePlayers}
              </strong>
              {district.onlineNow > 0 && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {district.onlineNow} on
                </span>
              )}
            </div>
          </div>

          {/* XP Total */}
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              XP Total
            </span>
            <div className="mt-1">
              <strong className="text-sm font-black text-amber-300">
                {district.totalXp.toLocaleString('pt-PT')}
              </strong>
            </div>
          </div>
        </div>

        {/* 4. LÍDER DO DISTRITO (REI TERRITORIAL) */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Líder do Distrito
              </span>
              <span className="font-display text-xs font-bold text-white truncate block">
                {district.king ? district.king.displayName : 'A aguardar primeiro líder'}
              </span>
            </div>
          </div>

          {district.king && (
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                Nível {district.king.level}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {district.king.xp.toLocaleString('pt-PT')} XP
              </span>
            </div>
          )}
        </div>

        {/* 5. NÍVEL DE ATIVIDADE */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Atividade Territorial:
          </span>
          <span
            className={cn(
              'font-black flex items-center gap-1',
              district.activityLevel === 'Alta'
                ? 'text-emerald-400'
                : district.activityLevel === 'Média'
                  ? 'text-cyan-400'
                  : 'text-slate-300'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                district.activityLevel === 'Alta'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : district.activityLevel === 'Média'
                    ? 'bg-cyan-400'
                    : 'bg-slate-400'
              )}
            />
            {district.activityLevel}
          </span>
        </div>

        {/* 6. BOTÃO DE AÇÃO PRINCIPAL: VER DISTRITO / JOGAR */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 mt-auto">
          <button
            type="button"
            onClick={handleActionClick}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition cursor-pointer active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Ver Distrito</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </button>

          <Link
            href={`/rankings?district=${encodeURIComponent(district.name)}`}
            className="inline-flex items-center justify-center h-11 px-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs font-bold transition cursor-pointer active:scale-95"
          >
            <span>Classificação</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
