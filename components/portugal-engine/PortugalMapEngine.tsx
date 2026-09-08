'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { PortugalTerritory } from '@/lib/portugal-territories'
import { getTerritoryById, getTerritoryByName } from '@/lib/portugal-territories'
import type { PortugalCity } from '@/lib/portugal-cities-data'
import type { MapArenaPOI, MapSearchResult } from '@/components/portugal-map/types'
import { MapSearchBar } from '@/components/portugal-map/MapSearchBar'
import { DistrictDetailsPanel } from '@/components/portugal-map/DistrictDetailsPanel'
import { ArenaDetailsModal } from '@/components/portugal-map/ArenaDetailsModal'
import {
  usePortugalMapData,
  type PortugalMapDataState,
} from './PortugalMapData'
import {
  DISTRICT_VIBRANT_PALETTE,
  MAINLAND_CENTER_OFFSET,
  ACORES_INSET_TRANSFORM,
  MADEIRA_INSET_TRANSFORM,
  CAPITAL_LABEL_OFFSETS,
  PortugalMapDefs,
  PortugalBackgroundAtmosphere,
  type MapViewMode,
} from './PortugalMapLayers'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Home,
  Users,
  Shield,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PortugalMapEngineProps {
  initialDistrict?: string
  mode?: MapViewMode
  compact?: boolean
  showHUD?: boolean
  className?: string
  onSelectDistrict?: (territory: PortugalTerritory | null) => void
  onSelectArena?: (arena: MapArenaPOI) => void
}

export function PortugalMapEngine({
  initialDistrict,
  mode: initialMode = 'mapa',
  compact = false,
  showHUD = true,
  className,
  onSelectDistrict: externalSelectDistrict,
  onSelectArena: externalSelectArena,
}: PortugalMapEngineProps) {
  const router = useRouter()

  // 1. Dados em Tempo Real
  const data = usePortugalMapData()

  // 2. Estado de Interação
  const [viewMode, setViewMode] = useState<MapViewMode>(initialMode)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 3. Motor de Pan & Zoom
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 })
  const rootRef = useRef<HTMLDivElement>(null)

  // Sincronizar modo inicial quando alterado externamente
  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode)
    }
  }, [initialMode])

  // Detetar Mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Processar Distrito Inicial
  useEffect(() => {
    let raw = initialDistrict
    if (!raw && typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search)
      raw = search.get('district') || search.get('dist') || search.get('distrito') || undefined
    }
    if (raw) {
      const match = getTerritoryById(raw) || getTerritoryByName(raw)
      if (match) {
        setSelectedId(match.id)
      }
    }
  }, [initialDistrict])

  // Seleção e Deseleção
  const handleSelect = useCallback(
    (territory: PortugalTerritory) => {
      const nextId = selectedId === territory.id ? null : territory.id
      setSelectedId(nextId)
      if (externalSelectDistrict) {
        externalSelectDistrict(nextId ? territory : null)
      }
    },
    [selectedId, externalSelectDistrict]
  )

  const handleDeselect = useCallback(() => {
    setSelectedId(null)
    if (externalSelectDistrict) {
      externalSelectDistrict(null)
    }
  }, [externalSelectDistrict])

  // Focar câmara num distrito
  const handleFocusTerritory = useCallback((territory: PortugalTerritory) => {
    setSelectedId(territory.id)
    if (territory.type === 'island') {
      if (territory.id === 'acores') {
        setPan({ x: 180, y: 140 })
        setZoom(1.35)
      } else {
        setPan({ x: 180, y: -160 })
        setZoom(1.35)
      }
    } else if (territory.centroid) {
      // Centro continental está deslocado +30px em X e +20px em Y
      const targetPanX = (500 - (territory.centroid[0] + 30)) * 0.7
      const targetPanY = (430 - (territory.centroid[1] + 20)) * 0.7
      setPan({ x: targetPanX, y: targetPanY })
      setZoom(1.4)
    }
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    handleDeselect()
  }, [handleDeselect])

  // Pan por Arrastar
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [pan])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const maxPan = 600 * zoom
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.initialPanX + dx)),
      y: Math.max(-maxPan, Math.min(maxPan, dragStartRef.current.initialPanY + dy)),
    })
  }, [isDragging, zoom])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
    }
  }, [isDragging])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88
    setZoom((prev) => {
      const next = +(prev * zoomFactor).toFixed(2)
      return Math.max(0.8, Math.min(3.5, next))
    })
  }, [])

  // Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        if (rootRef.current?.requestFullscreen) {
          rootRef.current.requestFullscreen().catch(console.warn)
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(console.warn)
        }
      }
    } catch (e) {
      console.warn('[PortugalMapEngine] Erro fullscreen:', e)
    }
  }, [])

  useEffect(() => {
    const handleFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFs)
    return () => document.removeEventListener('fullscreenchange', handleFs)
  }, [])

  // Pesquisa
  const handleSearchResult = useCallback(
    (res: MapSearchResult) => {
      if (res.type === 'district') {
        const match = getTerritoryByName(res.title) || getTerritoryById(res.id.replace('district_', ''))
        if (match) {
          handleFocusTerritory(match)
        }
      } else if (res.type === 'arena' && res.metadata) {
        const arena = res.metadata as MapArenaPOI
        const distMatch = getTerritoryByName(arena.district)
        if (distMatch) {
          handleFocusTerritory(distMatch)
        }
        setSelectedArena(arena)
        if (externalSelectArena) {
          externalSelectArena(arena)
        }
      }
    },
    [handleFocusTerritory, externalSelectArena]
  )

  // Território atualmente selecionado
  const selectedTerritory = useMemo(() => {
    return selectedId ? getTerritoryById(selectedId) || null : null
  }, [selectedId])

  const selectedWarTerritory = useMemo(() => {
    if (!selectedTerritory) return null
    return (
      data.territoryMap.get(selectedTerritory.id.toLowerCase()) ||
      data.territoryMap.get(selectedTerritory.name.toLowerCase()) ||
      null
    )
  }, [selectedTerritory, data.territoryMap])

  // Visual Styling Computado para Cada Distrito (Cores Sempre Vivas e Saturadas)
  const getDistrictVisuals = useCallback(
    (t: PortugalTerritory) => {
      const isSelected = selectedId === t.id
      const isHovered = hoveredId === t.id
      const palette = DISTRICT_VIBRANT_PALETTE[t.id] || {
        gradientStart: '#06b6d4',
        gradientEnd: '#0e7490',
        border: '#22d3ee',
        glow: 'rgba(6, 182, 212, 0.65)',
        badgeText: '#ffffff',
      }

      const war = data.territoryMap.get(t.id.toLowerCase()) || data.territoryMap.get(t.name.toLowerCase())
      const rank = war?.pos || 20
      const online = data.districtOnlineCounts[t.id.toLowerCase()] || data.districtOnlineCounts[t.name.toLowerCase()] || 0

      // Selecionado: Ciano Brilhante Neon
      if (isSelected) {
        return {
          fill: 'url(#grad-selected-surge)',
          fillOpacity: 1.0,
          stroke: '#ffffff',
          strokeWidth: 3.5,
          filter: 'url(#selection-glow)',
          rank,
          online,
          palette,
        }
      }

      // Hover: Saturação Intensa
      if (isHovered) {
        return {
          fill: `url(#grad-${t.id})`,
          fillOpacity: 1.0,
          stroke: '#ffffff',
          strokeWidth: 2.8,
          filter: 'url(#laser-glow)',
          rank,
          online,
          palette,
        }
      }

      // Modo Ranking: Pódio Destacado, mas o mapa NUNCA fica cinzento!
      if (viewMode === 'ranking') {
        if (rank === 1) {
          return {
            fill: 'url(#grad-podium-gold)',
            fillOpacity: 0.98,
            stroke: '#fef08a',
            strokeWidth: 2.8,
            filter: 'url(#laser-glow)',
            rank,
            online,
            palette,
          }
        }
        if (rank === 2) {
          return {
            fill: 'url(#grad-podium-silver)',
            fillOpacity: 0.96,
            stroke: '#ffffff',
            strokeWidth: 2.4,
            filter: undefined,
            rank,
            online,
            palette,
          }
        }
        if (rank === 3) {
          return {
            fill: 'url(#grad-podium-bronze)',
            fillOpacity: 0.96,
            stroke: '#fdba74',
            strokeWidth: 2.4,
            filter: undefined,
            rank,
            online,
            palette,
          }
        }
      }

      // Padrão / Atividade / Jogadores: Cor Saturada do Distrito com Fronteira Branca Nítida
      return {
        fill: `url(#grad-${t.id})`,
        fillOpacity: 0.94,
        stroke: '#ffffff',
        strokeWidth: 1.8,
        filter: undefined,
        rank,
        online,
        palette,
      }
    },
    [selectedId, hoveredId, viewMode, data.territoryMap, data.districtOnlineCounts]
  )

  return (
    <div
      ref={rootRef}
      data-debug-map="REAL-MAP"
      data-map-engine="PORTUGAL-MAP-ENGINE-V2"
      className={cn(
        'relative w-full h-full overflow-hidden select-none isolate flex flex-col',
        compact ? 'min-h-[480px] rounded-3xl' : 'min-h-[100dvh] max-h-[100dvh]',
        className
      )}
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #082142 0%, #031329 45%, #020b18 80%, #01060f 100%)',
        border: '5px solid magenta',
        boxSizing: 'border-box',
      }}
    >
      {/* BANNER TEMPORÁRIO DE VALIDAÇÃO VISUAL */}
      <div
        id="map-engine-v2-verification-banner"
        className="relative z-50 w-full py-2 px-4 bg-fuchsia-600 text-white font-mono font-black text-center text-sm sm:text-base tracking-widest shadow-2xl border-b-2 border-white flex items-center justify-center gap-2 select-text shrink-0"
        style={{ backgroundColor: '#d946ef', color: '#ffffff', fontWeight: 900 }}
      >
        <span>🚨</span>
        <span>PORTUGAL MAP ENGINE V2 — LIVE</span>
        <span>🚨</span>
      </div>

      {/* 1. LUZES DE AMBIENTE ATLÂNTICAS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[30%] w-[520px] h-[650px] rounded-full bg-cyan-500/12 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[8%] w-[420px] h-[420px] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      {/* 2. CABEÇALHO HUD (Visível apenas se showHUD && !compact) */}
      {showHUD && !compact && (
        <header className="relative z-30 w-full px-4 sm:px-6 pt-3 sm:pt-4 flex flex-col gap-2.5 pointer-events-none">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Esquerda: Identidade & Regresso */}
            <div className="pointer-events-auto flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <Link
                href="/jogar"
                className="h-10 px-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-slate-200 hover:text-white hover:bg-cyan-500/15 flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-xl"
              >
                <Home className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Central</span>
              </Link>

              <div>
                <h1 className="font-display text-lg sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                  <span className="text-xl">🇵🇹</span>
                  <span className="bg-gradient-to-r from-white via-cyan-100 to-emerald-300 bg-clip-text text-transparent">
                    PORTUGAL EM JOGO
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  18 Distritos • Açores • Madeira • Geometria Oficial
                </p>
              </div>
            </div>

            {/* Centro: Modos do Mapa */}
            <nav
              aria-label="Modos do mapa"
              className="pointer-events-auto flex items-center bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-1 backdrop-blur-2xl shadow-xl"
            >
              {[
                { id: 'mapa', label: '🗺️ Mapa' },
                { id: 'ranking', label: '🏆 Ranking' },
                { id: 'atividade', label: '⚡ Atividade' },
                { id: 'jogadores', label: '👥 Jogadores' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id as MapViewMode)}
                  className={cn(
                    'px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer',
                    viewMode === m.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg scale-102 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </nav>

            {/* Direita: Pesquisa & Ecrã Total */}
            <div className="pointer-events-auto flex items-center gap-2 w-full md:w-auto justify-end">
              <MapSearchBar onSelectResult={handleSearchResult} className="w-full sm:w-[220px]" />
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="h-10 px-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all flex items-center justify-center shadow-lg cursor-pointer shrink-0 backdrop-blur-xl"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 3. BARRA DE ESTATÍSTICAS REAIS */}
      <div className="relative z-20 px-4 py-1 flex items-center gap-2 overflow-x-auto scrollbar-none pointer-events-none">
        <div className="pointer-events-auto px-3 py-1 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center gap-2 shrink-0 shadow-md backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="font-bold">18 DISTRITOS + 2 REGIÕES</span>
        </div>

        <div className="pointer-events-auto px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-[11px] font-mono text-slate-300 flex items-center gap-2 shrink-0 shadow-md backdrop-blur-md">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            <strong className="text-white font-bold">{data.nationalPlayers.length}</strong> JOGADORES REGISTADOS
          </span>
        </div>

        <div className="pointer-events-auto px-3 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-2 shrink-0 shadow-md backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            {data.activeHumanPlayers.humanOnline > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>
            <strong className="text-white font-bold">{data.activeHumanPlayers.humanOnline}</strong> ONLINE AGORA
          </span>
        </div>
      </div>

      {/* 4. CANVAS SVG PRINCIPAL (DRAG & ZOOM ENGINE) */}
      <main
        className={cn(
          'relative flex-1 w-full h-full flex items-center justify-center overflow-hidden',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleDeselect()
          }
        }}
      >
        <div
          className="relative w-full h-full max-w-[1200px] flex items-center justify-center transition-transform duration-75 ease-out select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
          }}
        >
          <svg
            data-debug-map="REAL-MAP"
            viewBox="0 0 1000 860"
            className="w-full h-full max-h-[92vh] overflow-visible drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
          >
            {/* Definições de Gradientes e Filtros */}
            <PortugalMapDefs territories={data.territories} />

            {/* Fundo Atmosférico do Atlântico */}
            <PortugalBackgroundAtmosphere viewBoxWidth={1000} viewBoxHeight={860} />

            {/* ========================================================= */}
            {/* 4.1. INSET DOS AÇORES (TOP-LEFT, ILHAS AMPLIADAS E NÍTIDAS) */}
            {/* ========================================================= */}
            <g
              id="inset-acores"
              className="cursor-pointer group"
              onClick={() => {
                const ac = getTerritoryById('acores')
                if (ac) handleSelect(ac)
              }}
            >
              <rect
                x="25"
                y="45"
                width="255"
                height="255"
                rx="18"
                fill="url(#inset-tactical-glass)"
                stroke={selectedId === 'acores' ? '#22d3ee' : hoveredId === 'acores' ? '#38bdf8' : 'rgba(14, 165, 233, 0.4)'}
                strokeWidth={selectedId === 'acores' ? 2.8 : 1.6}
                style={{
                  filter: selectedId === 'acores' ? 'drop-shadow(0 0 18px rgba(6,182,212,0.7))' : undefined,
                  transition: 'all 0.2s ease',
                }}
              />

              {/* Cantos Táticos Neon */}
              <path d="M 32,62 L 32,52 L 42,52" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 273,62 L 273,52 L 263,52" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 32,283 L 32,293 L 42,293" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 273,283 L 273,293 L 263,293" fill="none" stroke="#22d3ee" strokeWidth="2" />

              {/* Header Açores */}
              <text x="42" y="72" fill="#22d3ee" fontSize="10.5" fontWeight="900" fontFamily="monospace" letterSpacing="1.2">
                🌊 AÇORES // 9 ILHAS
              </text>
              <text x="42" y="86" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                SETOR ATLÂNTICO OCIDENTAL
              </text>

              {/* Geometria das Ilhas dos Açores */}
              {(() => {
                const t = getTerritoryById('acores')
                if (!t) return null
                const visuals = getDistrictVisuals(t)
                const online = data.districtOnlineCounts['acores'] || 0

                return (
                  <g
                    transform={ACORES_INSET_TRANSFORM}
                    onMouseEnter={() => setHoveredId('acores')}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <path
                      d={t.path}
                      fill={visuals.fill}
                      fillOpacity={visuals.fillOpacity}
                      stroke={visuals.stroke}
                      strokeWidth={visuals.strokeWidth}
                      style={{
                        filter: visuals.filter,
                        transition: 'all 0.18s ease',
                      }}
                    />
                  </g>
                )
              })()}

              {/* Rótulo e Marcador de Ponta Delgada */}
              <g className="pointer-events-none font-mono text-[9px] font-bold">
                <g transform="translate(210, 255)">
                  <circle r="4" fill="#34d399" stroke="#022c22" strokeWidth="1.2" />
                  {(data.districtOnlineCounts['acores'] || 0) > 0 && (
                    <circle r="7" fill="#10b981" opacity="0.6" className="animate-ping" />
                  )}
                  <text x="-8" y="3" textAnchor="end" fill="#ffffff" fontSize="9.5" fontWeight="900">
                    Ponta Delgada {(data.districtOnlineCounts['acores'] || 0) > 0 ? `● ${data.districtOnlineCounts['acores']}` : ''}
                  </text>
                </g>
              </g>
            </g>

            {/* ========================================================= */}
            {/* 4.2. INSET DA MADEIRA (BOTTOM-LEFT, MADEIRA & PORTO SANTO) */}
            {/* ========================================================= */}
            <g
              id="inset-madeira"
              className="cursor-pointer group"
              onClick={() => {
                const md = getTerritoryById('madeira')
                if (md) handleSelect(md)
              }}
            >
              <rect
                x="25"
                y="535"
                width="255"
                height="275"
                rx="18"
                fill="url(#inset-tactical-glass)"
                stroke={selectedId === 'madeira' ? '#22d3ee' : hoveredId === 'madeira' ? '#38bdf8' : 'rgba(14, 165, 233, 0.4)'}
                strokeWidth={selectedId === 'madeira' ? 2.8 : 1.6}
                style={{
                  filter: selectedId === 'madeira' ? 'drop-shadow(0 0 18px rgba(6,182,212,0.7))' : undefined,
                  transition: 'all 0.2s ease',
                }}
              />

              {/* Cantos Táticos Neon */}
              <path d="M 32,552 L 32,542 L 42,542" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 273,552 L 273,542 L 263,542" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 32,793 L 32,803 L 42,803" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 273,793 L 273,803 L 263,803" fill="none" stroke="#22d3ee" strokeWidth="2" />

              {/* Header Madeira */}
              <text x="42" y="562" fill="#22d3ee" fontSize="10.5" fontWeight="900" fontFamily="monospace" letterSpacing="1.2">
                🌺 MADEIRA & PORTO SANTO
              </text>
              <text x="42" y="576" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                SETOR AUSTRAL ATLÂNTICO
              </text>

              {/* Geometria das Ilhas da Madeira */}
              {(() => {
                const t = getTerritoryById('madeira')
                if (!t) return null
                const visuals = getDistrictVisuals(t)

                return (
                  <g
                    transform={MADEIRA_INSET_TRANSFORM}
                    onMouseEnter={() => setHoveredId('madeira')}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <path
                      d={t.path}
                      fill={visuals.fill}
                      fillOpacity={visuals.fillOpacity}
                      stroke={visuals.stroke}
                      strokeWidth={visuals.strokeWidth}
                      style={{
                        filter: visuals.filter,
                        transition: 'all 0.18s ease',
                      }}
                    />
                  </g>
                )
              })()}

              {/* Rótulo e Marcador do Funchal */}
              <g className="pointer-events-none font-mono text-[9px] font-bold">
                <text x="210" y="655" fill="#94a3b8" textAnchor="middle">Porto Santo</text>
                <g transform="translate(140, 750)">
                  <circle r="4" fill="#34d399" stroke="#022c22" strokeWidth="1.2" />
                  {(data.districtOnlineCounts['madeira'] || 0) > 0 && (
                    <circle r="7" fill="#10b981" opacity="0.6" className="animate-ping" />
                  )}
                  <text x="8" y="3.5" fill="#ffffff" fontSize="9.5" fontWeight="900">
                    Funchal {(data.districtOnlineCounts['madeira'] || 0) > 0 ? `● ${data.districtOnlineCounts['madeira']}` : ''}
                  </text>
                </g>
              </g>
            </g>

            {/* ========================================================= */}
            {/* 4.3. PORTUGAL CONTINENTAL (18 DISTRITOS CENTRADOS E GRANDES) */}
            {/* ========================================================= */}
            <g transform={MAINLAND_CENTER_OFFSET}>
              {/* Aura Costeira de Portugal Continental */}
              <g className="pointer-events-none opacity-40">
                {data.mainlandTerritories.map((t) => (
                  <path
                    key={`aura-${t.id}`}
                    d={t.path}
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.35)"
                    strokeWidth={14}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </g>

              {/* Os 18 Distritos Continentais com Cores Saturadas Vivas */}
              {data.mainlandTerritories.map((t) => {
                const visuals = getDistrictVisuals(t)

                return (
                  <g
                    key={t.id}
                    id={`territory-${t.id}`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(t)
                    }}
                    onMouseEnter={() => setHoveredId(t.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <path
                      d={t.path}
                      fill={visuals.fill}
                      fillOpacity={visuals.fillOpacity}
                      stroke={visuals.stroke}
                      strokeWidth={visuals.strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{
                        filter: visuals.filter,
                        transition: 'all 0.16s ease-out',
                      }}
                    />

                    {/* Pulso de Atividade Real se Jogadores > 0 */}
                    {visuals.online > 0 && t.centroid && (
                      <g transform={`translate(${t.centroid[0]}, ${t.centroid[1]})`} className="pointer-events-none">
                        <circle r="12" fill="#10b981" opacity="0.4" className="animate-ping" />
                        <circle r="5" fill="#34d399" stroke="#022c22" strokeWidth="1.2" />
                      </g>
                    )}

                    {/* Badge de Posição / Ranking Territorial */}
                    {t.centroid && (
                      <g
                        transform={`translate(${t.centroid[0]}, ${t.centroid[1] - 4})`}
                        className="pointer-events-none transition-transform duration-200 group-hover:scale-110"
                      >
                        <rect
                          x="-14"
                          y="-8"
                          width="28"
                          height="16"
                          rx="8"
                          fill="rgba(2, 6, 23, 0.85)"
                          stroke={visuals.stroke}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill={visuals.palette.badgeText}
                          fontSize="8.5"
                          fontWeight="900"
                          fontFamily="monospace"
                        >
                          #{visuals.rank}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

              {/* Capitais e Rótulos Canónicos de Portugal */}
              <g className="pointer-events-none">
                {data.cities.filter((c) => c.isCapital).map((city) => {
                  const offset = CAPITAL_LABEL_OFFSETS[city.districtId] || {
                    label: city.name.toUpperCase(),
                    dx: 0,
                    dy: -10,
                    anchor: 'middle' as const,
                  }
                  const isHovered = hoveredId === city.districtId
                  const isSelected = selectedId === city.districtId

                  return (
                    <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                      {/* Ponto da Cidade Capital */}
                      <circle
                        r="3.5"
                        fill="#ffffff"
                        stroke="#020617"
                        strokeWidth="1.6"
                        className={cn(isHovered || isSelected ? 'scale-125' : '')}
                      />

                      {/* Rótulo da Capital sem Sobreposição */}
                      <text
                        x={offset.dx}
                        y={offset.dy}
                        textAnchor={offset.anchor}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="900"
                        fontFamily="var(--font-mono), monospace"
                        letterSpacing="0.08em"
                        style={{
                          textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 0 3px #020617',
                        }}
                      >
                        {offset.label}
                      </text>
                    </g>
                  )
                })}
              </g>
            </g>
          </svg>
        </div>
      </main>

      {/* 5. CONTROLOS FLUTUANTES (ZOOM & RESET) */}
      <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3.5, +(z * 1.2).toFixed(2)))}
          title="Aumentar Zoom"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all flex items-center justify-center shadow-xl cursor-pointer backdrop-blur-xl"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.8, +(z / 1.2).toFixed(2)))}
          title="Diminuir Zoom"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all flex items-center justify-center shadow-xl cursor-pointer backdrop-blur-xl"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Centralizar Portugal"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all flex items-center justify-center shadow-xl cursor-pointer backdrop-blur-xl"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 6. PAINEL DE DETALHES DO DISTRITO SELECIONADO */}
      {selectedTerritory && (
        <DistrictDetailsPanel
          territory={selectedWarTerritory}
          districtName={selectedTerritory.name}
          isOpen={Boolean(selectedTerritory)}
          onClose={handleDeselect}
          onPlayDistrict={(slug) => {
            router.push(`/jogar?dist=${encodeURIComponent(slug)}&cat=o-meu-distrito`)
          }}
        />
      )}

      {/* 7. MODAL DE DETALHES DA ARENA SELECIONADA */}
      {selectedArena && (
        <ArenaDetailsModal
          arena={selectedArena}
          isOpen={Boolean(selectedArena)}
          onClose={() => setSelectedArena(null)}
          onStartGame={(route) => {
            router.push(route)
          }}
        />
      )}
    </div>
  )
}

export default PortugalMapEngine
