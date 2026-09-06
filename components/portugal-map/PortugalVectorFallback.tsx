'use client'

import React, { useState, useMemo } from 'react'
import { PORTUGAL_GEO_DATA, type DistrictGeoItem } from '@/lib/portugal-geo-data'
import { getDistrictColorInfo } from '@/components/portugal-map-interactive'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { DistrictWarTerritory } from '@/lib/district-war'
import type { MapArenaPOI } from './types'
import { Shield, ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortugalVectorFallbackProps {
  territories: DistrictWarTerritory[]
  selectedDistrict: string
  onSelectDistrict: (districtName: string) => void
  onSelectArena?: (arena: MapArenaPOI) => void
  onHoverDistrict?: (districtName: string | null) => void
  className?: string
}

// Tactical 2-letter codes for districts
const DISTRICT_CODES: Record<string, string> = {
  'Lisboa': 'LX',
  'Porto': 'PR',
  'Braga': 'BG',
  'Vila Real': 'VR',
  'Coimbra': 'CB',
  'Faro': 'FR',
  'Aveiro': 'AV',
  'Setúbal': 'ST',
  'Viseu': 'VS',
  'Leiria': 'LR',
  'Santarém': 'SN',
  'Viana do Castelo': 'VC',
  'Bragança': 'BR',
  'Guarda': 'GD',
  'Castelo Branco': 'CB',
  'Évora': 'EV',
  'Beja': 'BJ',
  'Portalegre': 'PT',
  'Açores': 'AO',
  'Madeira': 'MD',
}

/**
 * Linear projection from WGS84 coordinates to the Portugal SVG coordinate system
 * Lat: 37.0 to 42.0 -> y: 786 to 127
 * Lng: -9.5 to -6.5 -> x: 270 to 600
 */
function projectToSvg(lng: number, lat: number): [number, number] {
  const minLat = 37.0
  const maxLat = 42.0
  const minLng = -9.55
  const maxLng = -6.5

  const yMin = 786
  const yMax = 127
  const xMin = 270
  const xMax = 600

  const y = yMin + ((lat - minLat) / (maxLat - minLat)) * (yMax - yMin)
  const x = xMin + ((lng - minLng) / (maxLng - minLng)) * (xMax - xMin)

  return [x, y]
}

export function PortugalVectorFallback({
  territories,
  selectedDistrict,
  onSelectDistrict,
  onSelectArena,
  onHoverDistrict,
  className,
}: PortugalVectorFallbackProps) {
  const [zoom, setZoom] = useState(1)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [hoveredArena, setHoveredArena] = useState<MapArenaPOI | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  const territoryMap = useMemo(() => {
    const map = new Map<string, DistrictWarTerritory>()
    for (const t of territories) {
      map.set(t.name.toLowerCase(), t)
    }
    return map
  }, [territories])

  const mainlandDistricts = useMemo(() => {
    return PORTUGAL_GEO_DATA.filter((d) => d.type === 'mainland')
  }, [])

  const handleHover = (name: string | null) => {
    setHoveredDistrict(name)
    if (onHoverDistrict) {
      onHoverDistrict(name)
    }
  }

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 select-none isolate',
        className
      )}
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #051428 0%, #020914 60%, #01040a 100%)',
      }}
    >
      {/* 1. CYBERNETIC SCI-FI GRID OVERLAY */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      )}

      {/* 2. RADAR SWEEP ANIMATION */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[850px] h-[850px] rounded-full border border-cyan-500/10 animate-spin-slow opacity-40" />
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/15" />
        <div className="w-[350px] h-[350px] rounded-full border border-dashed border-cyan-500/20" />
      </div>

      {/* 3. TOP TACTICAL TELEMETRY BANNER */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-950/85 border border-cyan-500/40 backdrop-blur-md shadow-2xl flex items-center gap-2.5 text-cyan-300 text-xs font-mono">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-black tracking-widest text-[10px] sm:text-xs uppercase">
          COMANDO HOLOGRÁFICO // MAP2150-V2
        </span>
        <span className="text-[10px] text-emerald-400 hidden sm:inline">
          • 18 DISTRITOS SOBERANOS • {OFFICIAL_MAP_ARENAS.length} ARENAS
        </span>
      </div>

      {/* 4. MAIN MONUMENTAL VECTOR CANVAS CONTAINER */}
      <div
        className="relative w-full max-w-[760px] h-full flex items-center justify-center p-2 sm:p-6 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        <svg
          viewBox="200 10 440 860"
          className="w-full h-auto max-h-[85vh] drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-visible"
        >
          <defs>
            {/* Neon Glow Filter */}
            <filter id="hologram-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* High Intensity Beacon Glow */}
            <filter id="beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* District Neon Gradients */}
            <linearGradient id="selected-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.75" />
            </linearGradient>

            <linearGradient id="hover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* 4.1. 18 MAINLAND DISTRICTS (POLYGONS + NEON CONTOURS) */}
          {mainlandDistricts.map((d) => {
            const isSelected = selectedDistrict.toLowerCase() === d.name.toLowerCase()
            const isHovered = hoveredDistrict?.toLowerCase() === d.name.toLowerCase()
            const colorInfo = getDistrictColorInfo(d.name)
            const baseColor = colorInfo.hex
            const territory = territoryMap.get(d.name.toLowerCase())
            const rankPos = territory?.pos || 10
            const isTop3 = rankPos <= 3
            const code = DISTRICT_CODES[d.name] || d.name.substring(0, 2).toUpperCase()

            return (
              <g
                key={d.name}
                className="cursor-pointer group transition-all duration-200"
                onClick={() => onSelectDistrict(d.name)}
                onMouseEnter={() => handleHover(d.name)}
                onMouseLeave={() => handleHover(null)}
              >
                {/* Outer Glow Path on Hover/Select */}
                {(isSelected || isHovered) && (
                  <path
                    d={d.path}
                    fill="none"
                    stroke={isSelected ? '#22d3ee' : '#34d399'}
                    strokeWidth={isSelected ? 6 : 4}
                    opacity={0.7}
                    filter="url(#hologram-glow)"
                  />
                )}

                {/* Primary District Territory Body */}
                <path
                  d={d.path}
                  fill={isSelected ? 'url(#selected-grad)' : isHovered ? 'url(#hover-grad)' : baseColor}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.4}
                  stroke={isSelected ? '#ffffff' : isHovered ? '#34d399' : baseColor}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                  style={{
                    filter: isSelected
                      ? `drop-shadow(0 0 16px ${baseColor})`
                      : isHovered
                      ? `drop-shadow(0 0 10px ${baseColor})`
                      : undefined,
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Tactical Centroid Node: Capital Beacon & Rank Badge */}
                {d.centroid && (
                  <g transform={`translate(${d.centroid[0]}, ${d.centroid[1]})`}>
                    {/* Pulsing Beacon Halo */}
                    <circle
                      r={isSelected ? 7 : isHovered ? 6 : 4}
                      fill={isSelected ? '#22d3ee' : isTop3 ? '#f59e0b' : '#38bdf8'}
                      opacity={isSelected || isHovered ? 0.9 : 0.7}
                      className={isSelected || isHovered ? 'animate-ping' : ''}
                    />
                    <circle
                      r={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                      fill="#ffffff"
                    />

                    {/* Centroid Tactical Badge */}
                    <g
                      transform="translate(0, -12)"
                      className={cn(
                        'transition-transform duration-200 pointer-events-none',
                        isSelected || isHovered ? 'scale-125' : 'scale-90'
                      )}
                    >
                      <rect
                        x="-20"
                        y="-8"
                        width="40"
                        height="14"
                        rx="4"
                        fill="#020617"
                        fillOpacity="0.9"
                        stroke={isSelected ? '#22d3ee' : isTop3 ? '#f59e0b' : 'rgba(255,255,255,0.3)'}
                        strokeWidth={isSelected ? 1.5 : 1}
                      />
                      <text
                        x="0"
                        y="2.5"
                        textAnchor="middle"
                        fill={isSelected ? '#22d3ee' : isTop3 ? '#f59e0b' : '#ffffff'}
                        fontSize="8"
                        fontWeight="900"
                        fontFamily="monospace"
                      >
                        {code} #{rankPos}
                      </text>
                    </g>
                  </g>
                )}
              </g>
            )
          })}

          {/* 4.2. ARENAS POIS ON THE VECTOR MAP */}
          {OFFICIAL_MAP_ARENAS.map((arena) => {
            const [x, y] = projectToSvg(arena.coordinates[0], arena.coordinates[1])
            const isVip = arena.rarity === 'VIP'
            const isLegendary = arena.rarity === 'Lendária'
            const isHovered = hoveredArena?.id === arena.id

            return (
              <g
                key={arena.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation()
                  if (onSelectArena) onSelectArena(arena)
                }}
                onMouseEnter={() => setHoveredArena(arena)}
                onMouseLeave={() => setHoveredArena(null)}
              >
                {/* Radar Ring Ping */}
                <circle
                  r={isHovered ? 14 : isVip ? 10 : 7}
                  fill="none"
                  stroke={isVip ? '#f59e0b' : isLegendary ? '#a855f7' : '#06b6d4'}
                  strokeWidth="1.5"
                  opacity={isHovered ? 0.9 : 0.6}
                  className="animate-ping"
                />

                {/* Beacon Diamond Shape */}
                <polygon
                  points="0,-6 6,0 0,6 -6,0"
                  fill={isVip ? '#f59e0b' : isLegendary ? '#a855f7' : '#06b6d4'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  filter="url(#beacon-glow)"
                />

                {/* Hover Tooltip on Map */}
                {isHovered && (
                  <g transform="translate(0, -18)" className="pointer-events-none animate-in fade-in zoom-in-90 duration-150">
                    <rect
                      x="-55"
                      y="-16"
                      width="110"
                      height="20"
                      rx="6"
                      fill="#020617"
                      fillOpacity="0.95"
                      stroke={isVip ? '#f59e0b' : '#06b6d4'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="900"
                      fontFamily="monospace"
                    >
                      {arena.name.length > 18 ? `${arena.name.substring(0, 16)}...` : arena.name}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* 4.3. AÇORES HOLOGRAPHIC STRATEGIC POST */}
          <g
            transform="translate(225, 45)"
            className="cursor-pointer group"
            onClick={() => onSelectDistrict('Açores')}
            onMouseEnter={() => handleHover('Açores')}
            onMouseLeave={() => handleHover(null)}
          >
            <rect
              x="-8"
              y="-8"
              width="130"
              height="80"
              rx="18"
              fill="#020617"
              fillOpacity="0.9"
              stroke={selectedDistrict.toLowerCase().includes('açores') ? '#14b8a6' : 'rgba(20, 184, 166, 0.45)'}
              strokeWidth={selectedDistrict.toLowerCase().includes('açores') ? '2.5' : '1.5'}
              style={{
                filter: selectedDistrict.toLowerCase().includes('açores')
                  ? 'drop-shadow(0 0 15px rgba(20, 184, 166, 0.4))'
                  : undefined,
              }}
            />
            <circle cx="15" cy="18" r="4" fill="#14b8a6" className="animate-ping" />
            <circle cx="15" cy="18" r="2.5" fill="#ffffff" />
            <text x="30" y="21" fill="#14b8a6" fontSize="10" fontWeight="900" fontFamily="monospace">
              🌊 AÇORES // AO-19
            </text>
            <text x="12" y="42" fill="#ffffff" fontSize="9" fontWeight="800">
              Rank #{territoryMap.get('açores')?.pos || 8} • 9 Ilhas
            </text>
            <text x="12" y="58" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              Poder: {territoryMap.get('açores')?.powerFormatted || '0'} pts
            </text>
          </g>

          {/* 4.4. MADEIRA HOLOGRAPHIC STRATEGIC POST */}
          <g
            transform="translate(225, 735)"
            className="cursor-pointer group"
            onClick={() => onSelectDistrict('Madeira')}
            onMouseEnter={() => handleHover('Madeira')}
            onMouseLeave={() => handleHover(null)}
          >
            <rect
              x="-8"
              y="-8"
              width="130"
              height="80"
              rx="18"
              fill="#020617"
              fillOpacity="0.9"
              stroke={selectedDistrict.toLowerCase() === 'madeira' ? '#06b6d4' : 'rgba(6, 182, 212, 0.45)'}
              strokeWidth={selectedDistrict.toLowerCase() === 'madeira' ? '2.5' : '1.5'}
              style={{
                filter: selectedDistrict.toLowerCase() === 'madeira'
                  ? 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.4))'
                  : undefined,
              }}
            />
            <circle cx="15" cy="18" r="4" fill="#06b6d4" className="animate-ping" />
            <circle cx="15" cy="18" r="2.5" fill="#ffffff" />
            <text x="30" y="21" fill="#06b6d4" fontSize="10" fontWeight="900" fontFamily="monospace">
              🌺 MADEIRA // MD-20
            </text>
            <text x="12" y="42" fill="#ffffff" fontSize="9" fontWeight="800">
              Rank #{territoryMap.get('madeira')?.pos || 9} • Arquipélago
            </text>
            <text x="12" y="58" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              Poder: {territoryMap.get('madeira')?.powerFormatted || '0'} pts
            </text>
          </g>
        </svg>
      </div>

      {/* 5. TACTICAL CANVAS CONTROLS */}
      <div className="absolute right-4 bottom-8 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.7, z + 0.15))}
          title="Aproximar (+)"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-white flex items-center justify-center hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.75, z - 0.15))}
          title="Afastar (-)"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-white flex items-center justify-center hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          title="Centrar Portugal"
          className="h-10 w-10 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-white flex items-center justify-center hover:bg-cyan-500/20 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          title={showGrid ? 'Ocultar Grade Tática' : 'Mostrar Grade Tática'}
          className={cn(
            'h-10 w-10 rounded-2xl border transition-all cursor-pointer flex items-center justify-center shadow-lg',
            showGrid
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-slate-900/90 border-white/20 text-slate-400'
          )}
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* 6. CORNER TACTICAL TELEMETRY FOOTER */}
      <div className="absolute bottom-2 left-3 z-20 pointer-events-none opacity-80 font-mono text-[9px] text-cyan-400/90 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
        PORTUGAL MAP 2150 // MAP2150-V2 • SISTEMA DE COMANDO HOLOGRÁFICO
      </div>
    </div>
  )
}
