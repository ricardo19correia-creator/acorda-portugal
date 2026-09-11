'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useDistrictMapData,
  type DistrictMapItem,
} from '@/lib/district-map-data'
import { DistrictLayer } from './DistrictLayer'
import { useDistrictInteraction } from './DistrictInteraction'
import { DistrictStats } from './DistrictStats'
import { RankingOverlay } from './RankingOverlay'
import { DistrictTooltip } from './DistrictTooltip'
import {
  Home,
  Users,
  Trophy,
  RotateCcw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  RefreshCw,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'

import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'

export interface PortugalMapProps {
  initialDistrict?: string
  compact?: boolean
  showHUD?: boolean
  className?: string
  onSelectDistrict?: (district: DistrictMapItem | null) => void
}

export function PortugalMap({
  initialDistrict,
  compact = false,
  showHUD = true,
  className,
  onSelectDistrict: externalSelectDistrict,
}: PortugalMapProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')
  const rootRef = useRef<HTMLDivElement>(null)

  // 1. Dados em Tempo Real do Firestore
  const data = useDistrictMapData()

  // 2. Interações e Seleção
  const {
    selectedDistrict,
    hoveredDistrict,
    mousePosition,
    selectDistrict,
    hoverDistrict,
    clearSelection,
  } = useDistrictInteraction(data.territories, initialDistrict)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Detetar dispositivo touch para evitar tooltips de hover acidentais
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Propagar seleção externa
  const handleSelectDistrict = useCallback(
    (district: DistrictMapItem) => {
      selectDistrict(district)
      if (externalSelectDistrict) {
        externalSelectDistrict(district)
      }
    },
    [selectDistrict, externalSelectDistrict]
  )

  const handleCloseDetails = useCallback(() => {
    clearSelection()
    if (externalSelectDistrict) {
      externalSelectDistrict(null)
    }
  }, [clearSelection, externalSelectDistrict])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        rootRef.current?.requestFullscreen?.().catch(console.warn)
      } else {
        document.exitFullscreen?.().catch(console.warn)
      }
    } catch (e) {
      console.warn('[PortugalMap] Fullscreen error:', e)
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // 3. Estado de Erro Amigável
  if (data.error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center p-6 bg-slate-950 text-white select-none">
        <div className="max-w-md w-full p-6 rounded-3xl border border-rose-500/30 bg-slate-900/90 text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase text-white font-display">
            Aviso de Ligação ao Mapa
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.error}
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={data.refetch}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
            <Link
              href="/jogar"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold transition cursor-pointer active:scale-95"
            >
              Central
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. Estado de Carregamento Elegante
  if (data.loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-950 text-white select-none">
        <div className="relative w-16 h-16 mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-lg">
            🇵🇹
          </div>
        </div>
        <p className="font-mono text-xs text-cyan-300 font-bold uppercase tracking-widest animate-pulse">
          A carregar mapa oficial de Portugal...
        </p>
        <span className="text-[10px] text-slate-400 font-mono mt-1">
          18 Distritos • Açores • Madeira
        </span>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      data-map-component="PORTUGAL-MAP-NATIONAL"
      className={cn(
        'relative w-full h-full overflow-hidden select-none isolate flex flex-col bg-slate-950 text-white',
        compact ? 'min-h-[440px] rounded-3xl' : 'min-h-[100dvh] max-h-[100dvh]',
        className
      )}
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #061830 0%, #030e20 45%, #020814 80%, #01040a 100%)',
      }}
    >
      {/* Luz ambiente subtil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[15%] right-[25%] w-[450px] h-[550px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-teal-500/8 blur-[120px]" />
      </div>

      {/* CABEÇALHO HUD (Apenas se showHUD && !compact) */}
      {showHUD && !compact && (
        <header className="relative z-20 w-full px-3 sm:px-6 pt-3 sm:pt-4 flex flex-col gap-2 pointer-events-none shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Esquerda: Central & Título */}
            <div className="pointer-events-auto flex items-center gap-3">
              <Link
                href="/jogar"
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-slate-200 hover:text-white hover:bg-cyan-500/20 flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-xl"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">Central</span>
              </Link>

              <div>
                <h1 className="font-display text-base sm:text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                  <span className="text-lg">🇵🇹</span>
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                    PORTUGAL EM JOGO
                  </span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:block">
                  18 Distritos • Açores • Madeira • Mapa Nacional Oficial 2026
                </p>
              </div>
            </div>

            {/* Direita: Estatísticas Reais em Tempo Real */}
            <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
              <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shrink-0 shadow-md backdrop-blur-md">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>
                  <strong className="text-white font-bold">{data.totalNationalPlayers}</strong> JOGADORES
                </span>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 shrink-0 shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  {data.totalNationalOnline > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>
                  <strong className="text-white font-bold">{data.totalNationalOnline}</strong> ONLINE
                </span>
              </div>

              {/* Botão Fullscreen Desktop */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Sair de ecrã total' : 'Ecrã total'}
                className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer shrink-0 backdrop-blur-xl"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ÁREA CENTRAL DO MAPA SVG */}
      <main
        className="relative flex-1 w-full h-full flex items-center justify-center p-1 sm:p-4 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseDetails()
          }
        }}
      >
        <div className="relative w-full h-full max-w-[920px] flex items-center justify-center">
          <svg
            viewBox="0 0 690 820"
            className="w-full h-full max-h-[88vh] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-visible"
            role="region"
            aria-label="Mapa territorial interativo de Portugal com os 18 distritos continentais, Açores e Madeira"
          >
            <DistrictLayer
              territories={data.territories}
              selectedId={selectedDistrict?.id || null}
              hoveredId={hoveredDistrict?.id || null}
              onSelectDistrict={handleSelectDistrict}
              onHoverDistrict={hoverDistrict}
              viewMode="mapa"
            />
          </svg>
        </div>

        {/* OVERLAY DE CLASSIFICAÇÃO (Canto Superior Direito em Desktop / Recolhido em Mobile) */}
        {!compact && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 max-w-[280px] w-full hidden md:block">
            <RankingOverlay
              rankingList={data.rankingList}
              selectedId={selectedDistrict?.id || null}
              onSelectDistrict={handleSelectDistrict}
            />
          </div>
        )}

        {/* BOTÃO DE RESET/DESELECIONAR SE HOUVER DISTRITO SELECIONADO */}
        {selectedDistrict && (
          <button
            type="button"
            onClick={handleCloseDetails}
            className="absolute left-4 bottom-4 z-20 h-9 px-3 rounded-xl bg-slate-900/90 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-lg active:scale-95 backdrop-blur-xl"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ver Todo o Portugal</span>
          </button>
        )}
      </main>

      {/* TOOLTIP HOVER (Desktop apenas) */}
      {!isTouchDevice && hoveredDistrict && (
        <DistrictTooltip district={hoveredDistrict} mousePosition={mousePosition} />
      )}

      {/* PAINEL DE DETALHES DO DISTRITO SELECIONADO (Responsivo: Bottom Sheet em Mobile, Side Card em Desktop) */}
      <DistrictStats
        district={selectedDistrict}
        isOpen={Boolean(selectedDistrict)}
        onClose={handleCloseDetails}
        onPlayDistrict={(slug) => {
          const target = `/jogar?dist=${encodeURIComponent(slug)}&cat=o-meu-distrito`
          if (!user) {
            setAuthWallTarget(target)
            setAuthWallOpen(true)
            return
          }
          router.push(target)
        }}
      />

      {/* 🔒 MODAL DE BLOQUEIO DE CONVIDADO / LOGIN OBRIGATÓRIO */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}

export default PortugalMap
