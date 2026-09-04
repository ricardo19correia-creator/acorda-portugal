'use client'

import React, { useState, useMemo } from 'react'
import { resolveArena, resolveArenaForGame, type CanonicalArena } from '@/src/data/arenaCatalog'
import { SupremeArenaAtmosphere } from '@/components/SupremeArenaAtmosphere'
import { AlertTriangle, Crown, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ArenaRendererProps {
  arenaId?: string | null
  categorySlug?: string | null
  equippedArenaId?: string | null
  streak?: number
  burstTrigger?: 'correct' | 'wrong' | null
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  showAtmosphere?: boolean
  showLighting?: boolean
  showBadge?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * 🇵🇹 ACORDA PORTUGAL — MASTER ARENA RENDERER (SSOT)
 * Componente unificado e autoritativo de renderização visual de Arenas de Jogo e Previews da Loja.
 * 
 * Regra Absoluta:
 * NUNCA recorre silenciosamente a Palácio Nacional.
 * Se a arena for inválida, exibe 'ARENA NÃO DEFINIDA'.
 */
export function ArenaRenderer({
  arenaId,
  categorySlug,
  equippedArenaId,
  burstTrigger = null,
  quality = 'ultra',
  showAtmosphere = true,
  showLighting = true,
  showBadge = false,
  className = '',
  children,
}: ArenaRendererProps) {
  const [imgError, setImgError] = useState(false)

  // Resolução determinística da arena
  const resolution = useMemo(() => {
    return resolveArenaForGame({ arenaId, categorySlug, equippedArenaId })
  }, [arenaId, categorySlug, equippedArenaId])

  const arena = resolution.arena
  const hasError = Boolean(resolution.error) || (!arena && Boolean(arenaId))

  // 1. Tratamento de Erro Explícito: "ARENA NÃO DEFINIDA" (Fail Loudly)
  if (hasError || !arena) {
    return (
      <div
        className={cn(
          'relative w-full h-full min-h-[320px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-rose-500/50 rounded-2xl overflow-hidden',
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-400 mb-1">
            FALHA DE RESOLUÇÃO // MOTOR 2150
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2 font-display">
            ARENA NÃO DEFINIDA
          </h2>
          <p className="text-xs text-slate-300 font-mono bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 mb-4 break-all">
            {resolution.error || `ID NÃO ENCONTRADO NO CATÁLOGO SSOT: "${arenaId}"`}
          </p>
          <span className="text-[10px] text-slate-400">
            A arena solicitada não existe ou o parâmetro da rota está incorreto.
          </span>
        </div>
      </div>
    )
  }

  // 2. Renderização Autoritativa da Arena Selecionada
  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden select-none isolate',
        className
      )}
      style={{
        backgroundColor: arena.lightingProfile?.ambientColor || '#09090b',
      }}
    >
      {/* 2.1 Camada Base de Background Visual (SVG ou Raster WebP/JPG) */}
      {!imgError ? (
        <img
          src={arena.assetPath}
          alt={arena.name}
          onError={() => {
            console.error(`[ArenaRenderer] Erro ao carregar asset da arena: ${arena.assetPath}`)
            setImgError(true)
          }}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 will-change-transform"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
          <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-400">
            ARTE INDISPONÍVEL // {arena.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Asset: {arena.assetPath}
          </span>
        </div>
      )}

      {/* 2.2 Camada de Iluminação Volumétrica e Feixes Focalizados */}
      {showLighting && arena.lightingProfile && (
        <>
          {/* Brilho Primário e Secundário de Ambiência */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${arena.lightingProfile.primaryGlow} 0%, ${arena.lightingProfile.secondaryGlow} 40%, transparent 80%)`,
            }}
          />

          {/* Feixe de Holofote / Spotlight Focal se configurado */}
          {arena.lightingProfile.spotlightBeam && arena.lightingProfile.spotlightBeam !== 'none' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-60 mix-blend-overlay transition-opacity duration-700"
              style={{
                background: arena.lightingProfile.spotlightBeam,
              }}
            />
          )}

          {/* Vignette de Contraste Cinematográfico para Leitura de Quiz */}
          <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-black/20 to-black/85" />
        </>
      )}

      {/* 2.3 Camada de Partículas e Atmosfera Viva */}
      {showAtmosphere && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <SupremeArenaAtmosphere
            effectType={arena.effects}
            quality={quality}
            burstTrigger={burstTrigger}
          />
        </div>
      )}

      {/* 2.4 Badge HUD Opcional no Topo da Arena */}
      {showBadge && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md shadow-lg">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {arena.name}
            </span>
            <span className="text-[9px] font-bold text-amber-300/80 uppercase">
              // {arena.rarity}
            </span>
          </div>
        </div>
      )}

      {/* 2.5 Conteúdo Filho (ex: UI de Quiz, HUD de Duelo, Controles) */}
      {children && <div className="relative z-20 w-full h-full">{children}</div>}
    </div>
  )
}

export default ArenaRenderer
