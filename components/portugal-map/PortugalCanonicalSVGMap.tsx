'use client'

import React, { useMemo, useState } from 'react'
import { DISTRICT_MAP, type DistrictMapEntry } from '@/lib/district-map'
import { PORTUGAL_GEO_DATA, type DistrictGeoItem } from '@/lib/portugal-geo-data'
import { getDistrictColorInfo } from '@/components/portugal-map-interactive'
import { OFFICIAL_MAP_ARENAS } from '@/lib/map-arena-registry'
import type { DistrictWarTerritory } from '@/lib/district-war'
import type { MapArenaPOI, MapDisplayMode, MapRegion } from './types'
import { cn } from '@/lib/utils'

export interface PortugalCanonicalSVGMapProps {
  selectedDistrict: string
  hoveredDistrict: string | null
  activeRegion: MapRegion
  activeMode: MapDisplayMode
  showArenas: boolean
  zoom: number
  is3D: boolean
  territories: DistrictWarTerritory[]
  onSelectDistrict: (districtName: string) => void
  onHoverDistrict: (districtName: string | null) => void
  onSelectArena?: (arena: MapArenaPOI) => void
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
 * Linear projection from WGS84 coordinates to Portugal SVG coordinate system
 * Lat: 37.0 to 42.0 -> y: 786 to 127
 * Lng: -9.55 to -6.5 -> x: 270 to 600
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

export function PortugalCanonicalSVGMap({
  selectedDistrict,
  hoveredDistrict,
  activeRegion,
  activeMode,
  showArenas,
  zoom,
  is3D,
  territories,
  onSelectDistrict,
  onHoverDistrict,
  onSelectArena,
  className,
}: PortugalCanonicalSVGMapProps) {
  const [hoveredArena, setHoveredArena] = useState<MapArenaPOI | null>(null)

  // Map of territory rankings keyed by lowercase name
  const territoryMap = useMemo(() => {
    const map = new Map<string, DistrictWarTerritory>()
    for (const t of territories) {
      map.set(t.name.toLowerCase(), t)
    }
    return map
  }, [territories])

  // Geo data mapping keyed by lowercase name
  const geoDataMap = useMemo(() => {
    const map = new Map<string, DistrictGeoItem>()
    for (const g of PORTUGAL_GEO_DATA) {
      map.set(g.name.toLowerCase(), g)
    }
    return map
  }, [])

  // Mainland districts from canonical DISTRICT_MAP
  const mainlandEntries = useMemo(() => {
    return DISTRICT_MAP.filter((d) => d.slug !== 'acores' && d.slug !== 'madeira')
  }, [])

  // Island entries
  const acoresEntry = useMemo(() => DISTRICT_MAP.find((d) => d.slug === 'acores'), [])
  const madeiraEntry = useMemo(() => DISTRICT_MAP.find((d) => d.slug === 'madeira'), [])

  const isAcoresSelected = selectedDistrict.toLowerCase().includes('açores') || selectedDistrict.toLowerCase().includes('acores')
  const isAcoresHovered = hoveredDistrict?.toLowerCase().includes('açores') || hoveredDistrict?.toLowerCase().includes('acores')
  const acoresTerritory = territoryMap.get('açores') || territoryMap.get('acores')

  const isMadeiraSelected = selectedDistrict.toLowerCase().includes('madeira')
  const isMadeiraHovered = hoveredDistrict?.toLowerCase().includes('madeira')
  const madeiraTerritory = territoryMap.get('madeira')

  // Theme styles based on activeMode
  const modeStyles = useMemo(() => {
    switch (activeMode) {
      case 'hologram':
        return {
          bg: 'radial-gradient(ellipse at 50% 45%, #031e2b 0%, #011119 55%, #01080d 100%)',
          gridStroke: 'rgba(6, 182, 212, 0.18)',
          radarOpacity: 0.35,
          defaultFillOpacity: 0.35,
          selectedFill: '#06b6d4',
          selectedStroke: '#22d3ee',
          badgeText: 'text-cyan-300',
        }
      case 'tactical':
        return {
          bg: 'radial-gradient(ellipse at 50% 45%, #18181b 0%, #09090b 60%, #000000 100%)',
          gridStroke: 'rgba(245, 158, 11, 0.12)',
          radarOpacity: 0.2,
          defaultFillOpacity: 0.45,
          selectedFill: '#f59e0b',
          selectedStroke: '#fbbf24',
          badgeText: 'text-amber-300',
        }
      case 'terrain':
        return {
          bg: 'radial-gradient(ellipse at 50% 45%, #0d2818 0%, #05150c 60%, #020a05 100%)',
          gridStroke: 'rgba(16, 185, 129, 0.14)',
          radarOpacity: 0.25,
          defaultFillOpacity: 0.4,
          selectedFill: '#10b981',
          selectedStroke: '#34d399',
          badgeText: 'text-emerald-300',
        }
      case 'night':
        return {
          bg: 'radial-gradient(ellipse at 50% 45%, #130a2a 0%, #080315 60%, #020108 100%)',
          gridStroke: 'rgba(168, 85, 247, 0.15)',
          radarOpacity: 0.3,
          defaultFillOpacity: 0.3,
          selectedFill: '#a855f7',
          selectedStroke: '#c084fc',
          badgeText: 'text-purple-300',
        }
      case 'satellite':
      default:
        return {
          bg: 'radial-gradient(ellipse at 50% 45%, #07192f 0%, #030b17 60%, #01040a 100%)',
          gridStroke: 'rgba(6, 182, 212, 0.12)',
          radarOpacity: 0.25,
          defaultFillOpacity: 0.4,
          selectedFill: '#06b6d4',
          selectedStroke: '#ffffff',
          badgeText: 'text-cyan-300',
        }
    }
  }, [activeMode])

  // Camera region offset transform
  const regionTransform = useMemo(() => {
    if (activeRegion === 'acores') {
      return 'translate(140px, 160px) scale(1.6)'
    }
    if (activeRegion === 'madeira') {
      return 'translate(140px, -200px) scale(1.6)'
    }
    return 'translate(0px, 0px) scale(1)'
  }, [activeRegion])

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 select-none isolate',
        className
      )}
      style={{ background: modeStyles.bg }}
    >
      {/* 1. Tactical Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${modeStyles.gridStroke} 1px, transparent 1px),
              linear-gradient(to bottom, ${modeStyles.gridStroke} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* 2. Concentric Radar Rings */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
        style={{ opacity: modeStyles.radarOpacity }}
      >
        <div className="w-[840px] h-[840px] rounded-full border border-cyan-500/10 animate-spin-slow" />
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/15" />
        <div className="w-[360px] h-[360px] rounded-full border border-dashed border-cyan-500/20" />
      </div>

      {/* 3. Main Transform Container (Zoom, Pitch 3D & Region Pan) */}
      <div
        className="relative w-full max-w-[800px] h-full flex items-center justify-center p-2 sm:p-6 transition-all duration-500 ease-out"
        style={{
          transform: `scale(${zoom}) ${is3D ? 'perspective(1200px) rotateX(18deg)' : ''}`,
          transformOrigin: '50% 50%',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
          style={{ transform: regionTransform, transformOrigin: '50% 50%' }}
        >
          <svg
            viewBox="0 0 720 860"
            className="w-full h-auto max-h-[85vh] drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-visible"
            role="img"
            aria-label="Mapa Canónico e Interativo de Portugal (18 Distritos, Açores e Madeira)"
          >
            <defs>
              {/* Glow Filters */}
              <filter id="svg-canonical-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="svg-beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Dynamic Gradients */}
              <linearGradient id="canonical-selected-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={modeStyles.selectedFill} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="canonical-hover-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.65" />
              </linearGradient>
            </defs>

            {/* ================================================================= */}
            {/* 4.1. REGIÃO AUTÓNOMA DOS AÇORES (9 ILHAS NÍTIDAS + CAIXA TÁTICA) */}
            {/* ================================================================= */}
            <g
              id={acoresEntry?.svgId || 'district-acores'}
              className="cursor-pointer group transition-all duration-300"
              role="button"
              tabIndex={0}
              aria-label="Região Autónoma dos Açores (9 Ilhas)"
              aria-pressed={isAcoresSelected}
              onClick={() => onSelectDistrict('Açores')}
              onMouseEnter={() => onHoverDistrict('Açores')}
              onMouseLeave={() => onHoverDistrict(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDistrict('Açores')
                }
              }}
            >
              {/* Caixa Tática de Enquadramento */}
              <rect
                x="20"
                y="35"
                width="220"
                height="235"
                rx="18"
                fill="#020617"
                fillOpacity="0.88"
                stroke={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : 'rgba(20, 184, 166, 0.4)'}
                strokeWidth={isAcoresSelected ? '2.8' : isAcoresHovered ? '2' : '1.2'}
                strokeDasharray={isAcoresSelected ? 'none' : '5 4'}
                filter={
                  isAcoresSelected
                    ? 'drop-shadow(0 0 20px rgba(20, 184, 166, 0.6))'
                    : isAcoresHovered
                    ? 'drop-shadow(0 0 12px rgba(20, 184, 166, 0.4))'
                    : undefined
                }
              />

              {/* Cantos Táticos Chanfrados */}
              <path
                d="M20 50 L35 35 M225 35 L240 50 M20 255 L35 270 M225 270 L240 255"
                stroke="#14b8a6"
                strokeWidth="1.8"
                fill="none"
              />

              {/* Cabeçalho da Caixa Açores */}
              <text
                x="34"
                y="58"
                fill="#14b8a6"
                fontSize="11"
                fontWeight="900"
                fontFamily="monospace"
                letterSpacing="0.08em"
              >
                🌊 [01] AÇORES (9 ILHAS)
              </text>
              <text
                x="34"
                y="72"
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                Rank #{acoresTerritory?.pos || 8} • Poder: {acoresTerritory?.powerFormatted || '0'} pts
              </text>

              {/* As 9 Ilhas dos Açores */}
              <g
                style={{
                  filter: isAcoresSelected ? 'drop-shadow(0 0 10px #14b8a6)' : undefined,
                }}
              >
                {/* 1. Corvo */}
                <path
                  d="M58,64 C62,58 70,60 69,69 C67,75 60,75 57,69 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.5"
                />
                <text x="50" y="58" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">Corvo</text>

                {/* 2. Flores */}
                <path
                  d="M48,84 C54,76 66,78 65,92 C64,105 53,108 47,98 C43,91 44,85 48,84 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.5"
                />
                <text x="32" y="96" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">Flores</text>

                {/* 3. Graciosa */}
                <path
                  d="M106,94 C111,86 123,88 124,96 C123,104 113,108 107,102 C104,98 104,96 106,94 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.5"
                />
                <text x="100" y="86" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">Graciosa</text>

                {/* 4. Terceira */}
                <path
                  d="M148,114 C158,102 180,106 182,120 C180,133 162,136 152,128 C146,122 146,116 148,114 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.8"
                />
                <text x="156" y="102" fill="rgba(20, 184, 166, 0.95)" fontSize="7.5" fontFamily="monospace" fontWeight="bold">Terceira</text>

                {/* 5. São Jorge */}
                <path
                  d="M102,124 C112,116 138,112 152,116 C150,122 126,128 108,130 C102,128 100,126 102,124 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.6"
                />
                <text x="96" y="116" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">S. Jorge</text>

                {/* 6. Faial */}
                <path
                  d="M82,136 C88,128 102,130 104,140 C102,150 90,154 82,146 C79,141 79,138 82,136 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.6"
                />
                <text x="64" y="142" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">Faial</text>

                {/* 7. Pico */}
                <path
                  d="M105,145 C116,135 140,140 148,150 C144,160 120,164 108,156 C103,152 102,148 105,145 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.8"
                />
                <text x="124" y="166" fill="rgba(20, 184, 166, 0.95)" fontSize="7.5" fontFamily="monospace" fontWeight="bold">Pico</text>

                {/* 8. São Miguel */}
                <path
                  d="M152,180 C166,166 200,164 218,172 C220,184 196,194 168,192 C156,189 150,185 152,180 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="2"
                />
                <text x="165" y="202" fill="rgba(20, 184, 166, 0.95)" fontSize="8" fontFamily="monospace" fontWeight="bold">São Miguel</text>

                {/* 9. Santa Maria */}
                <path
                  d="M198,218 C206,210 220,214 220,224 C218,234 206,236 200,229 C196,224 196,220 198,218 Z"
                  fill={isAcoresSelected ? '#14b8a6' : isAcoresHovered ? '#2dd4bf' : '#0d9488'}
                  fillOpacity={isAcoresSelected ? 0.95 : 0.75}
                  stroke={isAcoresSelected ? '#ffffff' : '#14b8a6'}
                  strokeWidth="1.6"
                />
                <text x="180" y="244" fill="rgba(20, 184, 166, 0.85)" fontSize="7" fontFamily="monospace" fontWeight="bold">Santa Maria</text>
              </g>

              {/* Beacon Central dos Açores */}
              <circle cx="150" cy="145" r={isAcoresSelected ? 6 : 4} fill="#14b8a6" className="animate-ping" opacity={0.8} />
              <circle cx="150" cy="145" r="3" fill="#ffffff" />
            </g>

            {/* =================================================================== */}
            {/* 4.2. REGIÃO AUTÓNOMA DA MADEIRA (ARQUIPÉLAGO COMPLETO + CAIXA HUD) */}
            {/* =================================================================== */}
            <g
              id={madeiraEntry?.svgId || 'district-madeira'}
              className="cursor-pointer group transition-all duration-300"
              role="button"
              tabIndex={0}
              aria-label="Região Autónoma da Madeira e Porto Santo"
              aria-pressed={isMadeiraSelected}
              onClick={() => onSelectDistrict('Madeira')}
              onMouseEnter={() => onHoverDistrict('Madeira')}
              onMouseLeave={() => onHoverDistrict(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectDistrict('Madeira')
                }
              }}
            >
              {/* Caixa Tática de Enquadramento */}
              <rect
                x="20"
                y="545"
                width="220"
                height="235"
                rx="18"
                fill="#020617"
                fillOpacity="0.88"
                stroke={isMadeiraSelected ? '#06b6d4' : isMadeiraHovered ? '#38bdf8' : 'rgba(6, 182, 212, 0.4)'}
                strokeWidth={isMadeiraSelected ? '2.8' : isMadeiraHovered ? '2' : '1.2'}
                strokeDasharray={isMadeiraSelected ? 'none' : '5 4'}
                filter={
                  isMadeiraSelected
                    ? 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.6))'
                    : isMadeiraHovered
                    ? 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))'
                    : undefined
                }
              />

              {/* Cantos Táticos Chanfrados */}
              <path
                d="M20 560 L35 545 M225 545 L240 560 M20 765 L35 780 M225 780 L240 765"
                stroke="#06b6d4"
                strokeWidth="1.8"
                fill="none"
              />

              {/* Cabeçalho da Caixa Madeira */}
              <text
                x="34"
                y="568"
                fill="#06b6d4"
                fontSize="11"
                fontWeight="900"
                fontFamily="monospace"
                letterSpacing="0.08em"
              >
                🌺 [02] MADEIRA &amp; PORTO SANTO
              </text>
              <text
                x="34"
                y="582"
                fill="rgba(255, 255, 255, 0.7)"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                Rank #{madeiraTerritory?.pos || 9} • Poder: {madeiraTerritory?.powerFormatted || '0'} pts
              </text>

              {/* Ilhas da Madeira */}
              <g
                style={{
                  filter: isMadeiraSelected ? 'drop-shadow(0 0 10px #06b6d4)' : undefined,
                }}
              >
                {/* 1. Ilha da Madeira Principal */}
                <path
                  d="M45,652 C52,638 86,628 126,628 C158,629 184,640 186,649 C188,653 176,660 162,658 C150,666 122,678 84,678 C58,676 44,664 45,652 Z"
                  fill={isMadeiraSelected ? '#06b6d4' : isMadeiraHovered ? '#38bdf8' : '#0891b2'}
                  fillOpacity={isMadeiraSelected ? 0.95 : 0.75}
                  stroke={isMadeiraSelected ? '#ffffff' : '#06b6d4'}
                  strokeWidth="2.2"
                />
                <text x="80" y="660" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="900">ILHA DA MADEIRA</text>
                <text x="96" y="688" fill="rgba(6, 182, 212, 0.9)" fontSize="7.5" fontFamily="monospace" fontWeight="bold">Funchal</text>

                {/* 2. Porto Santo */}
                <path
                  d="M172,588 C182,576 200,580 202,594 C198,606 182,610 174,600 C170,594 170,590 172,588 Z"
                  fill={isMadeiraSelected ? '#06b6d4' : isMadeiraHovered ? '#38bdf8' : '#0891b2'}
                  fillOpacity={isMadeiraSelected ? 0.95 : 0.75}
                  stroke={isMadeiraSelected ? '#ffffff' : '#06b6d4'}
                  strokeWidth="1.8"
                />
                <text x="154" y="582" fill="rgba(6, 182, 212, 0.95)" fontSize="8" fontFamily="monospace" fontWeight="bold">Porto Santo</text>

                {/* 3. Desertas */}
                <path
                  d="M184,698 C188,694 194,702 192,716 C190,730 184,736 182,732 C180,726 182,704 184,698 Z"
                  fill={isMadeiraSelected ? '#06b6d4' : isMadeiraHovered ? '#38bdf8' : '#0891b2'}
                  fillOpacity={isMadeiraSelected ? 0.95 : 0.75}
                  stroke={isMadeiraSelected ? '#ffffff' : '#06b6d4'}
                  strokeWidth="1.6"
                />
                <text x="160" y="748" fill="rgba(6, 182, 212, 0.85)" fontSize="7.5" fontFamily="monospace" fontWeight="bold">Desertas</text>
              </g>

              {/* Beacon Central da Madeira */}
              <circle cx="115" cy="653" r={isMadeiraSelected ? 6 : 4} fill="#06b6d4" className="animate-ping" opacity={0.8} />
              <circle cx="115" cy="653" r="3" fill="#ffffff" />
            </g>

            {/* ================================================================= */}
            {/* 4.3. 18 DISTRITOS CONTINENTAIS DE PORTUGAL (CANONICAL SVG PATHS)   */}
            {/* ================================================================= */}
            <g id="canonical-mainland-layer">
              {mainlandEntries.map((entry) => {
                const geoItem = geoDataMap.get(entry.name.toLowerCase())
                if (!geoItem) return null

                const isSelected = selectedDistrict.toLowerCase() === entry.name.toLowerCase()
                const isHovered = hoveredDistrict?.toLowerCase() === entry.name.toLowerCase()
                const colorInfo = getDistrictColorInfo(entry.name)
                const baseColor = colorInfo.hex
                const territory = territoryMap.get(entry.name.toLowerCase())
                const rankPos = territory?.pos || 10
                const isTop3 = rankPos <= 3
                const code = DISTRICT_CODES[entry.name] || entry.name.substring(0, 2).toUpperCase()

                return (
                  <g
                    key={entry.slug}
                    id={entry.svgId}
                    className="cursor-pointer group transition-all duration-200 outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`Distrito de ${entry.name}`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectDistrict(entry.name)}
                    onMouseEnter={() => onHoverDistrict(entry.name)}
                    onMouseLeave={() => onHoverDistrict(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectDistrict(entry.name)
                      }
                    }}
                  >
                    {/* Outer Glow Path on Hover/Select */}
                    {(isSelected || isHovered) && (
                      <path
                        d={geoItem.path}
                        fill="none"
                        stroke={isSelected ? modeStyles.selectedStroke : '#34d399'}
                        strokeWidth={isSelected ? 6 : 4}
                        opacity={0.7}
                        filter="url(#svg-canonical-glow)"
                      />
                    )}

                    {/* Primary District Body */}
                    <path
                      d={geoItem.path}
                      fill={
                        isSelected
                          ? 'url(#canonical-selected-grad)'
                          : isHovered
                          ? 'url(#canonical-hover-grad)'
                          : baseColor
                      }
                      fillOpacity={
                        isSelected ? 0.95 : isHovered ? 0.8 : modeStyles.defaultFillOpacity
                      }
                      stroke={isSelected ? '#ffffff' : isHovered ? '#34d399' : baseColor}
                      strokeWidth={isSelected ? 2.8 : isHovered ? 2 : 1.2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{
                        filter: isSelected
                          ? `drop-shadow(0 0 16px ${baseColor})`
                          : isHovered
                          ? `drop-shadow(0 0 10px ${baseColor})`
                          : undefined,
                        transition: 'all 0.2s ease',
                      }}
                    />

                    {/* Centroid Node: Beacon & Rank Badge */}
                    {geoItem.centroid && (
                      <g transform={`translate(${geoItem.centroid[0]}, ${geoItem.centroid[1]})`}>
                        {/* Pulsing Beacon Halo */}
                        <circle
                          r={isSelected ? 7 : isHovered ? 6 : 4}
                          fill={isSelected ? '#22d3ee' : isTop3 ? '#f59e0b' : '#38bdf8'}
                          opacity={isSelected || isHovered ? 0.9 : 0.65}
                          className={isSelected || isHovered ? 'animate-ping' : ''}
                        />
                        <circle
                          r={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                          fill="#ffffff"
                        />

                        {/* Centroid Tactical Badge */}
                        <g
                          transform="translate(0, -13)"
                          className={cn(
                            'transition-transform duration-200 pointer-events-none',
                            isSelected || isHovered ? 'scale-125 z-40' : 'scale-90'
                          )}
                        >
                          <rect
                            x="-22"
                            y="-8"
                            width="44"
                            height="15"
                            rx="4"
                            fill="#020617"
                            fillOpacity="0.92"
                            stroke={
                              isSelected ? '#22d3ee' : isTop3 ? '#f59e0b' : 'rgba(255,255,255,0.3)'
                            }
                            strokeWidth={isSelected ? 1.6 : 1}
                          />
                          <text
                            x="0"
                            y="3"
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
            </g>

            {/* ================================================================= */}
            {/* 4.4. ARENAS OFICIAIS (POIS INTERATIVOS NO MAPA SVG)               */}
            {/* ================================================================= */}
            {showArenas && (
              <g id="canonical-arenas-layer">
                {OFFICIAL_MAP_ARENAS.map((arena) => {
                  const [x, y] = projectToSvg(arena.coordinates[0], arena.coordinates[1])
                  const isVip = (arena.rarity as string) === 'VIP'
                  const isLegendary = (arena.rarity as string) === 'Lendária'
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
                      {/* Radar Ping Halo */}
                      <circle
                        r={isHovered ? 14 : isVip ? 10 : 7}
                        fill="none"
                        stroke={isVip ? '#f59e0b' : isLegendary ? '#a855f7' : '#06b6d4'}
                        strokeWidth="1.5"
                        opacity={isHovered ? 0.9 : 0.6}
                        className="animate-ping"
                      />

                      {/* Beacon Diamond Marker */}
                      <polygon
                        points="0,-6 6,0 0,6 -6,0"
                        fill={isVip ? '#f59e0b' : isLegendary ? '#a855f7' : '#06b6d4'}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2 : 1}
                        filter="url(#svg-beacon-glow)"
                      />

                      {/* Hover Tooltip */}
                      {isHovered && (
                        <g transform="translate(0, -18)" className="pointer-events-none animate-in fade-in zoom-in-90 duration-150">
                          <rect
                            x="-60"
                            y="-16"
                            width="120"
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
                            {arena.name.length > 20 ? `${arena.name.substring(0, 18)}...` : arena.name}
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* 5. Production Watermark Badge */}
      <div
        suppressHydrationWarning
        className="absolute bottom-2 left-3 z-20 pointer-events-none opacity-80 font-mono text-[9px] text-cyan-400/90 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-cyan-500/30 backdrop-blur-sm"
      >
        PORTUGAL MAP 2150 // MAP2150-CANONICAL-V1 • SISTEMA SOBERANO NACIONAL
      </div>
    </div>
  )
}

export default PortugalCanonicalSVGMap
