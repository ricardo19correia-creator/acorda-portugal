'use client'

import React, { useState, useMemo } from 'react'
import { resolveArena, resolveArenaForGame, type CanonicalArena } from '@/src/data/arenaCatalog'
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
  aspectRatio?: number
  autoAspect?: boolean
  children?: React.ReactNode
}

/**
 * 🇵🇹 ACORDA PORTUGAL — MASTER ARENA RENDERER (SSOT)
 * Componente unificado e autoritativo de renderização visual das 50 Arenas Oficiais.
 * 
 * Regra Crítica:
 * - 100% da imagem da arena visível
 * - Nenhuma parte cortada
 * - Nenhum espaço vazio desnecessário / sem barras pretas ou brancas
 * - Nenhuma distorção ou imagem esticada/esmagada
 * - Nenhum efeito artificial para esconder problemas de enquadramento
 */
export function ArenaRenderer({
  arenaId,
  categorySlug,
  equippedArenaId,
  showBadge = false,
  className = '',
  aspectRatio,
  autoAspect = false,
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
            FALHA DE RESOLUÇÃO // MOTOR 2026
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

  const effectiveRatio = aspectRatio || (autoAspect ? arena.aspectRatio : undefined)

  // 2. Renderização Fiel, Íntegra e Adaptativa da Arte da Arena
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden select-none bg-slate-950',
        !effectiveRatio && 'h-full',
        className
      )}
      style={effectiveRatio ? { aspectRatio: effectiveRatio } : undefined}
    >
      {!imgError ? (
        <img
          src={encodeURI(arena.assetPath)}
          alt={arena.name}
          onError={() => {
            console.error(`[ArenaRenderer] Erro ao carregar asset da arena: ${arena.assetPath}`)
            setImgError(true)
          }}
          className="w-full h-full object-cover object-center pointer-events-none select-none block"
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

      {/* Badge HUD Opcional no Topo da Arena */}
      {showBadge && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md shadow-lg">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              {arena.name}
            </span>
            <span className="text-[9px] font-bold text-amber-300/80 uppercase">
              {'//'} {arena.rarity}
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
