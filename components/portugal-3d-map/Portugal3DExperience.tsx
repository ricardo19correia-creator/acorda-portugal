'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  PORTUGAL_GEO_DATA,
  type DistrictGeoItem,
} from '@/lib/portugal-geo-data'
import {
  DISTRICT_TACTICAL_COLORS,
  getDistrictColorInfo,
} from '@/components/portugal-map-interactive'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { DistrictTerritorySheet } from './DistrictTerritorySheet'
import { Portugal3DMapboxWrapper } from './Portugal3DMapboxWrapper'
import {
  Globe,
  Trophy,
  Swords,
  Flame,
  Crown,
  TrendingUp,
  Maximize2,
  Minimize2,
  Compass,
  RotateCcw,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Shield,
  Eye,
  Sliders,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type MapViewMode =
  | 'territorio'
  | 'ranking'
  | 'guerra'
  | 'atividade'
  | 'campeoes'
  | 'evolucao'

interface Portugal3DExperienceProps {
  className?: string
  territories: DistrictWarTerritory[]
  selectedDistrict: string
  onSelectDistrict: (districtName: string) => void
  onSelectPlayer?: (player: any) => void
  onStartGame?: (route: string) => void
}

export function Portugal3DExperience({
  className,
  territories,
  selectedDistrict,
  onSelectDistrict,
  onSelectPlayer,
  onStartGame,
}: Portugal3DExperienceProps) {
  const [engine, setEngine] = useState<'satellite_mapbox' | 'tactical_mesh'>('satellite_mapbox')
  const [viewMode, setViewMode] = useState<MapViewMode>('guerra')
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictWarTerritory | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [tilt, setTilt] = useState<number>(18) // 3D isometric tilt angle in degrees
  const [rotation, setRotation] = useState<number>(-4) // subtle 3D compass angle
  const [qualityMode, setQualityMode] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH')
  const [isCinematicIntro, setIsCinematicIntro] = useState<boolean>(true)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)

  // Desativar intro após 1.5s
  useEffect(() => {
    const timer = setTimeout(() => setIsCinematicIntro(false), 1600)
    return () => clearTimeout(timer)
  }, [])

  // Mapa rápido de territórios por nome
  const territoryMap = useMemo(() => {
    const map = new Map<string, DistrictWarTerritory>()
    for (const t of territories) {
      map.set(t.name.toLowerCase(), t)
    }
    return map
  }, [territories])

  // Território selecionado atual
  const activeTerritory = useMemo(() => {
    return (
      territoryMap.get(selectedDistrict.toLowerCase()) ||
      territories[0] ||
      null
    )
  }, [territoryMap, selectedDistrict, territories])

  // Encontrar o poder máximo para normalização de brilho
  const maxPower = useMemo(() => {
    return territories.reduce((max, t) => Math.max(max, t.power), 1)
  }, [territories])

  const maxXp = useMemo(() => {
    return territories.reduce((max, t) => Math.max(max, t.totalXp), 1)
  }, [territories])

  // Separar Continental de Ilhas
  const mainlandDistricts = useMemo(() => {
    return PORTUGAL_GEO_DATA.filter((d) => d.type === 'mainland')
  }, [])

  const handleDistrictClick = (name: string) => {
    onSelectDistrict(name)
    setIsSheetOpen(true)
    // Zoom cinematográfico ligeiro
    setZoomLevel(1.15)
  }

  const handleResetCamera = () => {
    setZoomLevel(1)
    setTilt(18)
    setRotation(-4)
    setIsSheetOpen(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Estilos dinâmicos do polígono dependendo do modo de visualização
  const getDistrictVisuals = (name: string, isSelected: boolean, isHovered: boolean) => {
    const t = territoryMap.get(name.toLowerCase())
    const colorInfo = getDistrictColorInfo(name)
    const baseColor = colorInfo.hex

    const powerRatio = t ? Math.min(1, Math.max(0, t.power / maxPower)) : 0
    const xpRatio = t ? Math.min(1, Math.max(0, t.totalXp / maxXp)) : 0

    if (isSelected) {
      return {
        fill: baseColor,
        fillOpacity: 0.95,
        stroke: '#ffffff',
        strokeWidth: 3,
        filter: `drop-shadow(0 0 24px ${baseColor}) drop-shadow(0 0 8px #ffffff)`,
      }
    }

    if (isHovered) {
      return {
        fill: baseColor,
        fillOpacity: 0.85,
        stroke: '#ffffff',
        strokeWidth: 2.2,
        filter: `drop-shadow(0 0 18px ${baseColor})`,
      }
    }

    if (viewMode === 'ranking') {
      // Heatmap de Rank: Top 3 super brilhantes
      const rank = t?.pos || 20
      const rankOpacity = rank <= 3 ? 0.9 : rank <= 8 ? 0.65 : 0.35
      return {
        fill: baseColor,
        fillOpacity: rankOpacity,
        stroke: baseColor,
        strokeOpacity: 0.9,
        strokeWidth: rank <= 3 ? 2 : 1.2,
        filter: rank <= 3 ? `drop-shadow(0 0 16px ${baseColor})` : undefined,
      }
    }

    if (viewMode === 'guerra') {
      // Intensidade baseada no poder territorial
      const baseOpacity = 0.25 + powerRatio * 0.65
      return {
        fill: baseColor,
        fillOpacity: baseOpacity,
        stroke: baseColor,
        strokeOpacity: 0.8 + powerRatio * 0.2,
        strokeWidth: powerRatio > 0.4 ? 1.8 : 1.1,
        filter: powerRatio > 0.3 ? `drop-shadow(0 0 ${Math.max(6, powerRatio * 16)}px ${baseColor})` : undefined,
      }
    }

    if (viewMode === 'atividade') {
      // Densidade de jogadores ativos
      const activeRatio = t ? Math.min(1, t.activePlayers / 10) : 0
      return {
        fill: baseColor,
        fillOpacity: 0.2 + activeRatio * 0.7,
        stroke: baseColor,
        strokeOpacity: 0.85,
        strokeWidth: 1.3,
        filter: activeRatio > 0 ? `drop-shadow(0 0 12px ${baseColor})` : undefined,
      }
    }

    if (viewMode === 'campeoes') {
      const hasKing = Boolean(t?.king)
      return {
        fill: baseColor,
        fillOpacity: hasKing ? 0.75 : 0.3,
        stroke: hasKing ? '#fbbf24' : baseColor,
        strokeOpacity: 0.9,
        strokeWidth: hasKing ? 2 : 1.1,
        filter: hasKing ? `drop-shadow(0 0 15px #fbbf24)` : undefined,
      }
    }

    // Default: Modo Território
    return {
      fill: baseColor,
      fillOpacity: 0.45,
      stroke: baseColor,
      strokeOpacity: 0.75,
      strokeWidth: 1.2,
      filter: undefined,
    }
  }

  if (engine === 'satellite_mapbox') {
    return (
      <div className="space-y-4">
        {/* Engine Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
              MOTOR 3D: GOOGLE EARTH ULTRA-REAL (MAPBOX DEM ELEVATION)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEngine('satellite_mapbox')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
                engine === 'satellite_mapbox'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              🛰️ Satélite 3D Real
            </button>
            <button
              onClick={() => setEngine('tactical_mesh')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer',
                engine === 'tactical_mesh'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              ⚡ Radar Isométrico
            </button>
          </div>
        </div>

        <Portugal3DMapboxWrapper
          className={className}
          territories={territories}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={onSelectDistrict}
          onStartGame={onStartGame}
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'relative w-full rounded-4xl border border-cyan-500/30 bg-slate-950 overflow-hidden shadow-2xl select-none flex flex-col',
        className
      )}
      style={{
        minHeight: '620px',
        background: 'radial-gradient(circle at 50% 30%, #031326 0%, #020617 80%, #000000 100%)',
      }}
    >
      {/* 3D Energy Grid & Holographic Scanline */}
      <div className="absolute inset-0 radar-grid opacity-30 pointer-events-none" />
      <div className="radar-scan-bar pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 border-b border-cyan-500/20 bg-slate-950/60 backdrop-blur-md">
        {/* Status Indicador */}
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] font-black uppercase font-mono tracking-widest text-cyan-400 block">
              PORTUGAL DIGITAL 2050 • TACTICAL 3D RADAR
            </span>
            <span className="text-xs font-bold text-slate-300">
              {territories.length} Territórios Conectados • Dados em Tempo Real
            </span>
          </div>
        </div>

        {/* Seletor de Modo de Visualização */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1.5 rounded-2xl bg-slate-900/90 border border-white/10 scrollbar-none">
          {[
            { id: 'guerra', label: '⚔️ Guerra dos Distritos', icon: Swords },
            { id: 'ranking', label: '🏆 Ranking', icon: Trophy },
            { id: 'campeoes', label: '👑 Campeões', icon: Crown },
            { id: 'atividade', label: '🔥 Atividade', icon: Flame },
            { id: 'territorio', label: '🌍 Território', icon: Globe },
            { id: 'evolucao', label: '📈 Evolução', icon: TrendingUp },
          ].map((m) => {
            const isActive = viewMode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id as MapViewMode)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-bold scale-102'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>

        {/* Controlos de Câmara & Qualidade */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Aproximar Zoom"
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="h-8 w-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Afastar Zoom"
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.15))}
            className="h-8 w-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Mudar para Satélite 3D (Google Earth)"
            onClick={() => setEngine('satellite_mapbox')}
            className="h-8 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900 cursor-pointer transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>🛰️ Satélite 3D</span>
          </button>
          <button
            type="button"
            title="Repor Câmara Inicial"
            onClick={handleResetCamera}
            className="h-8 px-2.5 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas / Vector Viewport */}
      <div
        className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden min-h-[500px]"
        style={{
          perspective: '1200px',
        }}
      >
        {/* Layer 3D Isometric Wrapper */}
        <div
          className={cn(
            'relative w-full max-w-[620px] transition-transform duration-700 ease-out flex items-center justify-center',
            isCinematicIntro && 'scale-90 opacity-60 translate-y-8'
          )}
          style={{
            transform: `scale(${zoomLevel}) rotateX(${tilt}deg) rotateZ(${rotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Sombra e Pedestal 3D Flutuante */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-25 pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
              transform: 'translateZ(-40px)',
            }}
          />

          {/* SVG Oficial de Portugal */}
          <svg
            viewBox="240 20 360 840"
            className="w-full h-auto max-h-[580px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] overflow-visible"
          >
            <defs>
              <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Polígonos dos 18 Distritos Continentais */}
            {mainlandDistricts.map((d) => {
              const t = territoryMap.get(d.name.toLowerCase())
              const isSelected = selectedDistrict.toLowerCase() === d.name.toLowerCase()
              const isHovered = hoveredDistrict?.name.toLowerCase() === d.name.toLowerCase()
              const style = getDistrictVisuals(d.name, isSelected, isHovered)

              return (
                <g key={d.name} className="cursor-pointer group">
                  <path
                    d={d.path}
                    fill={style.fill}
                    fillOpacity={style.fillOpacity}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    strokeOpacity={style.strokeOpacity}
                    style={{
                      filter: style.filter,
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onClick={() => handleDistrictClick(d.name)}
                    onMouseEnter={() => setHoveredDistrict(t || null)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                  />

                  {/* Marcadores Holográficos no Centro do Distrito */}
                  {d.centroid && (
                    <g
                      transform={`translate(${d.centroid[0]}, ${d.centroid[1]})`}
                      className="pointer-events-none"
                    >
                      {/* Marcador de Rei / Coroa */}
                      {viewMode === 'campeoes' && t?.king && (
                        <circle
                          r="6"
                          fill="#fbbf24"
                          className="animate-pulse"
                          filter="drop-shadow(0 0 8px #fbbf24)"
                        />
                      )}

                      {/* Rótulo Tático com Posição */}
                      {t && t.pos <= 5 && (
                        <text
                          y="-8"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          fontFamily="monospace"
                          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                        >
                          #{t.pos}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              )
            })}

            {/* SECTOR AÇORES (Quadrante Atlântico Superior) */}
            <g
              transform="translate(250, 40)"
              className="cursor-pointer group"
              onClick={() => handleDistrictClick('Açores')}
              onMouseEnter={() => setHoveredDistrict(territoryMap.get('açores') || null)}
              onMouseLeave={() => setHoveredDistrict(null)}
            >
              <rect
                x="-10"
                y="-10"
                width="110"
                height="75"
                rx="16"
                fill="#020617"
                fillOpacity="0.85"
                stroke={
                  selectedDistrict.toLowerCase().includes('açores')
                    ? '#14b8a6'
                    : 'rgba(20, 184, 166, 0.4)'
                }
                strokeWidth={selectedDistrict.toLowerCase().includes('açores') ? '2.5' : '1.2'}
                filter="drop-shadow(0 0 12px rgba(20,184,166,0.3))"
              />
              <text
                x="45"
                y="14"
                textAnchor="middle"
                fill="#14b8a6"
                fontSize="10"
                fontWeight="900"
                fontFamily="monospace"
              >
                🌊 AÇORES
              </text>
              <text
                x="45"
                y="30"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="700"
              >
                9 Ilhas • #{territoryMap.get('açores')?.pos || 8}
              </text>
              <text
                x="45"
                y="46"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontFamily="monospace"
              >
                {territoryMap.get('açores')?.powerFormatted || '0'} pts
              </text>
            </g>

            {/* SECTOR MADEIRA (Quadrante Atlântico Inferior) */}
            <g
              transform="translate(250, 720)"
              className="cursor-pointer group"
              onClick={() => handleDistrictClick('Madeira')}
              onMouseEnter={() => setHoveredDistrict(territoryMap.get('madeira') || null)}
              onMouseLeave={() => setHoveredDistrict(null)}
            >
              <rect
                x="-10"
                y="-10"
                width="110"
                height="75"
                rx="16"
                fill="#020617"
                fillOpacity="0.85"
                stroke={
                  selectedDistrict.toLowerCase() === 'madeira'
                    ? '#06b6d4'
                    : 'rgba(6, 182, 212, 0.4)'
                }
                strokeWidth={selectedDistrict.toLowerCase() === 'madeira' ? '2.5' : '1.2'}
                filter="drop-shadow(0 0 12px rgba(6,182,212,0.3))"
              />
              <text
                x="45"
                y="14"
                textAnchor="middle"
                fill="#06b6d4"
                fontSize="10"
                fontWeight="900"
                fontFamily="monospace"
              >
                🌊 MADEIRA
              </text>
              <text
                x="45"
                y="30"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8"
                fontWeight="700"
              >
                Arquipélago • #{territoryMap.get('madeira')?.pos || 9}
              </text>
              <text
                x="45"
                y="46"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="8"
                fontFamily="monospace"
              >
                {territoryMap.get('madeira')?.powerFormatted || '0'} pts
              </text>
            </g>
          </svg>
        </div>

        {/* Floating Tactical Tooltip HUD on Hover */}
        {hoveredDistrict && (
          <div
            className="absolute z-30 pointer-events-none rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl p-3.5 shadow-2xl text-white min-w-[200px] animate-in fade-in duration-150"
            style={{
              left: Math.min(mousePos.x + 20, (containerRef.current?.clientWidth || 400) - 220),
              top: Math.max(10, mousePos.y - 40),
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-2">
              <span className="font-display font-black text-sm text-white">
                {hoveredDistrict.name}
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono"
                style={{
                  backgroundColor: `${hoveredDistrict.accentColor}20`,
                  color: hoveredDistrict.accentColor,
                }}
              >
                #{hoveredDistrict.pos}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Força:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {hoveredDistrict.powerFormatted} pts
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Jogadores:</span>
                <span className="font-bold text-white">
                  {hoveredDistrict.activePlayers}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Rei:</span>
                <span className="font-bold text-amber-300 truncate max-w-[110px]">
                  {hoveredDistrict.king?.displayName || 'Trono Vago'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Painel Tático Deslizante Lateral / Bottom Sheet */}
      <DistrictTerritorySheet
        territory={activeTerritory}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSelectPlayer={onSelectPlayer}
        onStartGame={onStartGame}
      />
    </div>
  )
}
