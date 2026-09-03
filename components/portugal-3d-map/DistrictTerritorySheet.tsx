'use client'

import React from 'react'
import Link from 'next/link'
import {
  Crown,
  Trophy,
  Users,
  Swords,
  Flame,
  Play,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Shield,
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { cn } from '@/lib/utils'

interface DistrictTerritorySheetProps {
  territory: DistrictWarTerritory | null
  isOpen: boolean
  onClose: () => void
  onSelectPlayer?: (player: any) => void
  onStartGame?: (route: string) => void
}

export function DistrictTerritorySheet({
  territory,
  isOpen,
  onClose,
  onSelectPlayer,
  onStartGame,
}: DistrictTerritorySheetProps) {
  if (!isOpen || !territory) return null

  const trendIcon =
    territory.trend === 'up' ? (
      <span className="flex items-center text-xs font-black text-emerald-400">
        <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{territory.trendDelta || 1}
      </span>
    ) : territory.trend === 'down' ? (
      <span className="flex items-center text-xs font-black text-rose-400">
        <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {territory.trendDelta}
      </span>
    ) : (
      <span className="flex items-center text-xs font-bold text-slate-400">
        <Minus className="w-3.5 h-3.5 mr-0.5" /> Estável
      </span>
    )

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 sm:absolute sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] p-3 sm:p-5 pointer-events-none">
      <div
        className={cn(
          'w-full h-auto max-h-[85vh] sm:max-h-full overflow-y-auto rounded-3xl border bg-slate-950/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-white pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-right-6 border-cyan-500/40'
        )}
        style={{
          boxShadow: `0 0 35px ${territory.accentColor}30, 0 20px 40px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Glow Superior */}
        <div
          className="absolute top-0 inset-x-0 h-32 opacity-25 blur-2xl pointer-events-none"
          style={{ backgroundColor: territory.accentColor }}
        />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full animate-ping"
                style={{ backgroundColor: territory.accentColor }}
              />
              <span
                className="text-[10px] font-black uppercase font-mono tracking-widest"
                style={{ color: territory.accentColor }}
              >
                {territory.tacticalTag}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
              {territory.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lema & Badge de Posição */}
        <div className="relative my-3.5 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-slate-300 font-medium italic truncate max-w-[240px]">
            «{territory.motto}»
          </span>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono border"
              style={{
                backgroundColor: `${territory.accentColor}20`,
                borderColor: `${territory.accentColor}60`,
                color: territory.accentColor,
              }}
            >
              #{territory.pos} no País
            </span>
            {trendIcon}
          </div>
        </div>

        {/* Barra de Domínio Territorial */}
        <div className="relative my-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" /> Força Territorial
            </span>
            <span
              className="font-black text-sm font-mono"
              style={{ color: territory.accentColor }}
            >
              {territory.power.toLocaleString('pt-PT')} pts ({territory.dominancePercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                backgroundColor: territory.accentColor,
                width: `${Math.min(100, Math.max(3, territory.dominancePercentage))}%`,
                boxShadow: `0 0 12px ${territory.accentColor}`,
              }}
            />
          </div>
        </div>

        {/* Cartão do Rei do Território */}
        <div className="relative my-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1.5">
            👑 Soberano Atual do Distrito
          </span>
          {territory.king ? (
            <div
              onClick={() => onSelectPlayer && onSelectPlayer(territory.king)}
              className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 p-3.5 flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-400 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <Crown className="h-4 w-4 text-amber-400 absolute -top-2.5 left-1/2 -translate-x-1/2 fill-amber-400 animate-bounce" />
                  <UserAvatar
                    src={territory.king.photoURL}
                    activeFrame={territory.king.equippedFrame}
                    equippedFrame={territory.king.equippedFrame}
                    size="md"
                  />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-white truncate block group-hover:text-amber-300 transition-colors">
                    {territory.king.displayName}
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium">
                    Nível {territory.king.level} • {territory.king.title}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-amber-400 font-mono block">
                  {territory.king.xp.toLocaleString('pt-PT')} XP
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400">Líder</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400/50" />
                <span className="text-xs text-slate-400">Trono vago. Conquista esta região!</span>
              </div>
            </div>
          )}
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2.5">
            <Users className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">Jogadores</span>
            <span className="text-sm font-black text-white font-mono">
              {territory.activePlayers}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2.5">
            <Swords className="w-3.5 h-3.5 text-purple-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">Vitórias 1v1</span>
            <span className="text-sm font-black text-purple-300 font-mono">
              {territory.totalDuelWins}
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-2.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
            <span className="text-[10px] text-slate-400 block font-bold">XP Coletivo</span>
            <span className="text-xs font-black text-amber-300 font-mono truncate block">
              {territory.totalXp.toLocaleString('pt-PT')}
            </span>
          </div>
        </div>

        {/* Top 5 Contribuidores */}
        {territory.topContributors && territory.topContributors.length > 0 && (
          <div className="my-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
              🛡️ Elite de {territory.name} (Top Guardiões)
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {territory.topContributors.map((c, i) => (
                <div
                  key={c.uid}
                  onClick={() => onSelectPlayer && onSelectPlayer(c)}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400 text-[10px] font-bold w-4">
                      #{i + 1}
                    </span>
                    <UserAvatar
                      src={c.photoURL}
                      activeFrame={c.equippedFrame}
                      equippedFrame={c.equippedFrame}
                      size="sm"
                    />
                    <span className="font-bold text-white truncate max-w-[130px]">
                      {c.displayName}
                    </span>
                  </div>

                  <span className="font-mono text-cyan-400 font-bold text-[11px] shrink-0">
                    {c.xp.toLocaleString('pt-PT')} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ação Primária: Jogar & Defender */}
        <div className="pt-2 mt-4 border-t border-white/10 flex gap-2">
          <button
            type="button"
            onClick={() =>
              onStartGame
                ? onStartGame(`/jogar?distrito=${encodeURIComponent(territory.name)}`)
                : null
            }
            className="flex-1 button-game-gold rounded-2xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102 transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Defender {territory.name}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
