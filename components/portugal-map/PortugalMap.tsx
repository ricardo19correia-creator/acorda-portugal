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
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
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
  const stageRef = useRef<HTMLDivElement>(null)

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

  // 3. ESTADO DA CÂMARA TÁTICA 3D & NAVEGAÇÃO INTERATIVA
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [is3D, setIs3D] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Rastreio de Gestos (Arrasto & Pinch-to-Zoom)
  const isDraggingRef = useRef(false)
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragDistanceRef = useRef(0)
  const pinchStartDistRef = useRef<number | null>(null)
  const pinchStartZoomRef = useRef<number>(1)

  // Detetar dispositivo touch
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

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

  // =========================================================
  // 4. CÁLCULO INTELIGENTE DE CÂMARA: ENQUADRAMENTO ANTI-OBSTRUÇÃO
  // =========================================================
  const focusOnDistrict = useCallback((district: DistrictMapItem) => {
    if (!district || !district.centroid) return

    const [cx, cy] = district.centroid
    const stage = stageRef.current
    const width = stage?.clientWidth || window.innerWidth
    const height = stage?.clientHeight || window.innerHeight

    const isMobilePortrait = width < 640 && height > width
    const isLandscape = height < 520 && width > height
    const isTablet = width >= 640 && width < 1024
    const isDesktop = width >= 1024

    // Escala alvo confortável
    const targetZoom = isMobilePortrait ? 2.1 : isLandscape ? 1.5 : isTablet ? 1.8 : 1.7

    // Centro do SVG original (viewBox 0 0 690 820)
    const svgCenterX = 345
    const svgCenterY = 410

    // Deslocamento do centroide face ao centro do SVG
    // Multiplicado pela relação entre o tamanho renderizado e as coordenadas SVG
    const svgRenderScale = Math.min(width / 690, height / 820)
    const deltaX = (svgCenterX - cx) * svgRenderScale * targetZoom
    const deltaY = (svgCenterY - cy) * svgRenderScale * targetZoom

    // Offset específico por viewport para garantir que o painel NUNCA cobre o distrito:
    let viewportOffsetY = 0
    let viewportOffsetX = 0

    if (isMobilePortrait) {
      // No Mobile, o painel ocupa os ~40% inferiores do ecrã.
      // Posicionamos o distrito no terço superior (~32% do ecrã), deslocando o mapa para CIMA (-height * 0.18):
      viewportOffsetY = -Math.round(height * 0.16)
      viewportOffsetX = 0
    } else if (isLandscape) {
      // Em Landscape, o painel está à direita (~290px).
      // Deslocamos o distrito para a esquerda:
      viewportOffsetX = -Math.round(width * 0.15)
      viewportOffsetY = 0
    } else if (isDesktop) {
      // No Desktop, o painel de detalhes está à direita (~360px).
      // Deslocamos o distrito suavemente para a esquerda (~15% do ecrã):
      viewportOffsetX = -Math.round(width * 0.12)
      viewportOffsetY = 0
    }

    setIsTransitioning(true)
    setZoom(targetZoom)
    setPan({
      x: deltaX + viewportOffsetX,
      y: deltaY + viewportOffsetY,
    })

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 850)
    return () => clearTimeout(timer)
  }, [])

  // Restabelecer visualização global de Portugal
  const resetCamera = useCallback(() => {
    setIsTransitioning(true)
    setZoom(1.0)
    setPan({ x: 0, y: 0 })

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 850)
    return () => clearTimeout(timer)
  }, [])

  // Propagar seleção externa e acionar câmara inteligente
  const handleSelectDistrict = useCallback(
    (district: DistrictMapItem) => {
      selectDistrict(district)
      focusOnDistrict(district)
      if (externalSelectDistrict) {
        externalSelectDistrict(district)
      }
    },
    [selectDistrict, focusOnDistrict, externalSelectDistrict]
  )

  const handleCloseDetails = useCallback(() => {
    clearSelection()
    resetCamera()
    if (externalSelectDistrict) {
      externalSelectDistrict(null)
    }
  }, [clearSelection, resetCamera, externalSelectDistrict])

  // Se houver distrito inicial, focar automaticamente
  useEffect(() => {
    if (initialDistrict && data.territories.length > 0) {
      const match = data.territoryMap.get(initialDistrict.toLowerCase())
      if (match) {
        handleSelectDistrict(match)
      }
    }
  }, [initialDistrict, data.territories, data.territoryMap, handleSelectDistrict])

  // =========================================================
  // 5. MANIPULADORES DE GESTOS (TOUCH & MOUSE DRAG / WHEEL ZOOM)
  // =========================================================
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    isDraggingRef.current = true
    dragDistanceRef.current = 0
    startPointerRef.current = { x: e.clientX, y: e.clientY }
    startPanRef.current = { ...pan }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = e.clientX - startPointerRef.current.x
    const dy = e.clientY - startPointerRef.current.y
    dragDistanceRef.current = Math.hypot(dx, dy)

    if (dragDistanceRef.current > 4) {
      setIsTransitioning(false)
      setPan({
        x: startPanRef.current.x + dx,
        y: startPanRef.current.y + dy,
      })
    }
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  // Zoom via Roda do Rato
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setIsTransitioning(false)
    const factor = e.deltaY < 0 ? 1.15 : 0.88
    setZoom((prev) => Math.min(3.5, Math.max(0.75, +(prev * factor).toFixed(3))))
  }

  // Touch Gestures: Pinch-to-Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      pinchStartDistRef.current = dist
      pinchStartZoomRef.current = zoom
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const ratio = dist / pinchStartDistRef.current
      setIsTransitioning(false)
      setZoom(
        Math.min(3.5, Math.max(0.75, +(pinchStartZoomRef.current * ratio).toFixed(3)))
      )
    }
  }

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null
  }

  // Controlo Manual de Zoom
  const zoomIn = () => {
    setIsTransitioning(true)
    setZoom((z) => Math.min(3.5, +(z * 1.25).toFixed(2)))
  }

  const zoomOut = () => {
    setIsTransitioning(true)
    setZoom((z) => Math.max(0.75, +(z / 1.25).toFixed(2)))
  }

  const toggle3D = () => {
    setIs3D((prev) => !prev)
  }

  // 6. ESTADO DE ERRO AMIGÁVEL
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

  // 7. ESTADO DE CARREGAMENTO ELEGANTE
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
          A carregar território digital de Portugal...
        </p>
        <span className="text-[10px] text-slate-400 font-mono mt-1">
          18 Distritos • Açores • Madeira • 2026
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
          'radial-gradient(ellipse at 50% 45%, #0e2036 0%, #071324 45%, #040c18 80%, #02060e 100%)',
      }}
    >
      {/* Grade Cibernética Tática de Baixa Intensidade */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      {/* Luz ambiente subtil */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[10%] right-[20%] w-[520px] h-[580px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[8%] w-[420px] h-[420px] rounded-full bg-emerald-500/8 blur-[130px]" />
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
                <h1 className="font-display text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                  <span className="text-base">🇵🇹</span>
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                    PORTUGAL // TERRITÓRIO 2026
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  18 Distritos • Açores • Madeira • Mapa Tático Oficial
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

      {/* ========================================================= */}
      {/* 8. ÁREA CENTRAL DO MAPA TÁTICO (CÂMARA DINÂMICA 3D) */}
      {/* ========================================================= */}
      <main
        ref={stageRef}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Deselecionar apenas se o utilizador clicou no fundo sem arrastar
          if (dragDistanceRef.current < 6 && e.target === e.currentTarget) {
            handleCloseDetails()
          }
        }}
        style={{
          perspective: is3D ? '1200px' : 'none',
        }}
      >
        {/* Contentor com Transformação Dinâmica de Câmara (Pan + Zoom + Pitch 3D) */}
        <div
          className="relative w-full h-full max-w-[960px] flex items-center justify-center select-none"
          style={{
            transform: `
              translate3d(${pan.x}px, ${pan.y}px, 0)
              scale(${zoom})
              rotateX(${is3D ? '30deg' : '0deg'})
              rotateZ(${is3D ? '-4deg' : '0deg'})
            `,
            transformOrigin: '50% 50%',
            transition: isTransitioning
              ? 'transform 850ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
            willChange: 'transform',
          }}
        >
          <svg
            viewBox="0 0 690 820"
            className="w-full h-full max-h-[86vh] object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.95)] overflow-visible"
            role="region"
            aria-label="Mapa territorial interativo 3D de Portugal com 18 distritos continentais, Açores e Madeira"
          >
            <DistrictLayer
              territories={data.territories}
              selectedId={selectedDistrict?.id || null}
              hoveredId={hoveredDistrict?.id || null}
              showAllMarkers={zoom >= 1.7}
              onSelectDistrict={handleSelectDistrict}
              onHoverDistrict={hoverDistrict}
              viewMode="mapa"
            />
          </svg>
        </div>

        {/* OVERLAY DE CLASSIFICAÇÃO (Canto Superior Direito em Desktop) */}
        {!compact && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 max-w-[280px] w-full hidden lg:block pointer-events-auto">
            <RankingOverlay
              rankingList={data.rankingList}
              selectedId={selectedDistrict?.id || null}
              onSelectDistrict={handleSelectDistrict}
            />
          </div>
        )}

        {/* BOTÃO FLUTUANTE DE RESET / VER TODO O PORTUGAL */}
        {selectedDistrict && (
          <button
            type="button"
            onClick={handleCloseDetails}
            className="absolute left-4 bottom-4 z-30 h-9 px-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-500/20 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-xl active:scale-95 backdrop-blur-xl pointer-events-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ver Todo o Portugal</span>
          </button>
        )}

        {/* ========================================================= */}
        {/* 9. CONTROLOS TÁTICOS FLUTUANTES (ZOOM, 3D, RESET) */}
        {/* ========================================================= */}
        <div className="absolute right-3 sm:right-4 bottom-4 z-20 flex flex-col gap-2 pointer-events-auto">
          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            title="Aproximar (+)"
            aria-label="Aproximar zoom"
            className="h-9 w-9 rounded-xl bg-slate-900/90 border border-white/15 text-slate-200 hover:text-white hover:bg-cyan-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-xl"
          >
            <ZoomIn className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            title="Afastar (-)"
            aria-label="Afastar zoom"
            className="h-9 w-9 rounded-xl bg-slate-900/90 border border-white/15 text-slate-200 hover:text-white hover:bg-cyan-500/20 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-xl"
          >
            <ZoomOut className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Alternar Vista 3D / 2D */}
          <button
            type="button"
            onClick={toggle3D}
            title={is3D ? 'Mudar para Vista 2D' : 'Mudar para Vista 3D Isométrica'}
            aria-label="Alternar vista 3D ou 2D"
            className={cn(
              'h-9 w-9 rounded-xl border text-[11px] font-mono font-black transition flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-xl active:scale-95',
              is3D
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/90 border-white/15 text-slate-400 hover:text-white'
            )}
          >
            <span>3D</span>
          </button>

          {/* Reset Overview */}
          <button
            type="button"
            onClick={resetCamera}
            title="Centrar Portugal"
            aria-label="Centrar mapa de Portugal"
            className="h-9 w-9 rounded-xl bg-slate-900/90 border border-white/15 text-slate-200 hover:text-cyan-400 hover:bg-white/10 active:scale-95 transition flex items-center justify-center cursor-pointer shadow-lg backdrop-blur-xl"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </main>

      {/* TOOLTIP HOVER (Desktop apenas) */}
      {!isTouchDevice && hoveredDistrict && (
        <DistrictTooltip district={hoveredDistrict} mousePosition={mousePosition} />
      )}

      {/* PAINEL DE DETALHES DO DISTRITO SELECIONADO (Responsivo: Bottom Sheet Compacto em Mobile, Side Card em Desktop) */}
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

