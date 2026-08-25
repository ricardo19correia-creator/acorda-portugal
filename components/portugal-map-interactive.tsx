'use client'

import React, { useState, useMemo } from 'react'
import { PORTUGAL_GEO_DATA, type DistrictGeoItem } from '@/lib/portugal-geo-data'
import { cn } from '@/lib/utils'

export type DistrictStatItem = {
  name: string
  pos: number
  players: number
  xp: number
}

export const DISTRICT_TACTICAL_COLORS: Record<string, { hex: string; name: string; tag: string }> = {
  'Porto': { hex: '#06b6d4', name: 'Porto', tag: 'Ciano Neon' },
  'Lisboa': { hex: '#f59e0b', name: 'Lisboa', tag: 'Dourado Âmbar' },
  'Braga': { hex: '#10b981', name: 'Braga', tag: 'Esmeralda' },
  'Aveiro': { hex: '#a855f7', name: 'Aveiro', tag: 'Violeta' },
  'Coimbra': { hex: '#3b82f6', name: 'Coimbra', tag: 'Azul Royal' },
  'Faro': { hex: '#ef4444', name: 'Faro', tag: 'Vermelho Escarlate' },
  'Vila Real': { hex: '#eab308', name: 'Vila Real', tag: 'Ouro Vibrante' },
  'Açores': { hex: '#14b8a6', name: 'Açores', tag: 'Turquesa Intenso' },
  'Madeira': { hex: '#06b6d4', name: 'Madeira', tag: 'Turquesa Oceano' },
  'Viana do Castelo': { hex: '#6366f1', name: 'Viana do Castelo', tag: 'Índigo Elétrico' },
  'Bragança': { hex: '#f97316', name: 'Bragança', tag: 'Laranja Solar' },
  'Viseu': { hex: '#84cc16', name: 'Viseu', tag: 'Lima Neon' },
  'Guarda': { hex: '#ec4899', name: 'Guarda', tag: 'Rosa Fúcsia' },
  'Castelo Branco': { hex: '#0ea5e9', name: 'Castelo Branco', tag: 'Azul Celeste' },
  'Leiria': { hex: '#d946ef', name: 'Leiria', tag: 'Roxo Magenta' },
  'Santarém': { hex: '#2dd4bf', name: 'Santarém', tag: 'Verde Menta' },
  'Portalegre': { hex: '#facc15', name: 'Portalegre', tag: 'Amarelo Cyber' },
  'Évora': { hex: '#f43f5e', name: 'Évora', tag: 'Carmim Vivo' },
  'Setúbal': { hex: '#0284c7', name: 'Setúbal', tag: 'Azul Oceano' },
  'Beja': { hex: '#fb923c', name: 'Beja', tag: 'Cobre Dourado' },
}

export function getDistrictColorInfo(name: string) {
  return DISTRICT_TACTICAL_COLORS[name] || { hex: '#06b6d4', name, tag: 'Tático' }
}

export function PortugalMapInteractive({
  className,
  selected,
  onSelect,
  districtStats,
}: {
  className?: string
  selected: string
  onSelect: (name: string) => void
  districtStats: Map<string, DistrictStatItem>
}) {
  const [hovered, setHovered] = useState<DistrictGeoItem | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Encontrar o XP máximo para normalizar o Heatmap Neon
  const maxXp = useMemo(() => {
    let max = 1
    districtStats.forEach((stat) => {
      if (stat.xp > max) max = stat.xp
    })
    return max
  }, [districtStats])

  const getDistrictStyle = (name: string, isSelected: boolean, isHovered: boolean) => {
    const colorInfo = getDistrictColorInfo(name)
    const stat = districtStats.get(name)
    const xp = stat ? stat.xp : 0
    const ratio = Math.min(1, Math.max(0, xp / (maxXp || 1)))

    if (isSelected) {
      return {
        fill: colorInfo.hex,
        fillOpacity: 0.9,
        stroke: '#ffffff',
        strokeWidth: 2.5,
        filter: `drop-shadow(0 0 20px ${colorInfo.hex}) drop-shadow(0 0 8px #ffffff)`,
        glowColor: colorInfo.hex,
      }
    }

    if (isHovered) {
      return {
        fill: colorInfo.hex,
        fillOpacity: 0.75,
        stroke: '#ffffff',
        strokeWidth: 2,
        filter: `drop-shadow(0 0 16px ${colorInfo.hex})`,
        glowColor: colorInfo.hex,
      }
    }

    // Heatmap dinâmico baseado no XP da região
    const baseOpacity = xp === 0 ? 0.22 : 0.35 + ratio * 0.45
    const strokeOpacity = xp === 0 ? 0.45 : 0.75 + ratio * 0.25

    return {
      fill: colorInfo.hex,
      fillOpacity: baseOpacity,
      stroke: colorInfo.hex,
      strokeOpacity: strokeOpacity,
      strokeWidth: xp > 0 ? 1.4 : 1,
      filter: xp > 0 ? `drop-shadow(0 0 ${Math.max(4, ratio * 12)}px ${colorInfo.hex})` : undefined,
      glowColor: colorInfo.hex,
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const hoveredStat = hovered ? districtStats.get(hovered.name) : null
  const hoveredColorInfo = hovered ? getDistrictColorInfo(hovered.name) : null

  return (
    <div
      className={cn(
        'radar-screen radar-grid rounded-3xl p-3 sm:p-4 select-none w-full relative overflow-hidden transition-all duration-500 shadow-2xl border border-cyan-500/30',
        className
      )}
    >
      {/* Linha de Scanner Holográfica em Varredura Contínua */}
      <div className="radar-scan-bar" />

      {/* Mira Tática / Crosshairs HUD nos Cantos */}
      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest z-10">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span>RADAR TÁTICO // SCAN ATIVO</span>
      </div>

      <div className="pointer-events-none absolute top-3 right-3 text-[9px] font-mono text-cyan-400/60 uppercase tracking-wider z-10 hidden sm:block">
        PORTUGAL • 20 REGIÕES
      </div>

      <svg
        viewBox="0 0 720 820"
        className="w-full h-auto block overflow-visible cursor-pointer relative z-10"
        role="img"
        aria-label="Mapa Tático Holográfico de Portugal com 18 distritos, Açores e Madeira"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          {/* Filtros de Glow Neon */}
          <filter id="tactical-glow-selected" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Padrão de Grelha Tática SVG */}
          <pattern id="tactical-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Fundo do Radar SVG com Grelha */}
        <rect
          x="6"
          y="6"
          width="708"
          height="808"
          rx="24"
          fill="url(#tactical-grid-pattern)"
          stroke="rgba(6, 182, 212, 0.2)"
          strokeWidth="1.2"
        />

        {/* Círculos Concêntricos de Radar Tático */}
        <g className="pointer-events-none opacity-20 stroke-cyan-400" strokeWidth="0.8" fill="none">
          <circle cx="440" cy="400" r="100" strokeDasharray="4 4" />
          <circle cx="440" cy="400" r="220" strokeDasharray="6 6" />
          <circle cx="440" cy="400" r="340" strokeDasharray="8 8" />
          <line x1="100" y1="400" x2="700" y2="400" strokeDasharray="3 3" />
          <line x1="440" y1="50" x2="440" y2="780" strokeDasharray="3 3" />
        </g>

        {/* ========================================================= */}
        {/* CAIXA HOLOGRÁFICA: AÇORES (SETOR ATLÂNTICO NORTE) */}
        {/* ========================================================= */}
        <g className="transition-all duration-300">
          {/* Caixa com Chanfro Tático HUD */}
          <rect
            x="20"
            y="35"
            width="215"
            height="225"
            rx="16"
            fill="rgba(15, 23, 42, 0.85)"
            stroke={selected === 'Açores' ? '#14b8a6' : 'rgba(20, 184, 166, 0.4)'}
            strokeWidth={selected === 'Açores' ? '2.5' : '1.2'}
            strokeDasharray={selected === 'Açores' ? 'none' : '6 4'}
            filter={selected === 'Açores' ? 'drop-shadow(0 0 15px rgba(20, 184, 166, 0.6))' : undefined}
          />
          <path
            d="M20 47 L32 35 M223 35 L235 47 M20 248 L32 260 M223 260 L235 248"
            stroke="rgba(20, 184, 166, 0.8)"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="34"
            y="58"
            fill="#14b8a6"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
            fontWeight="900"
            letterSpacing="0.15em"
          >
            [01] AÇORES // 9 ILHAS
          </text>
          <text
            x="34"
            y="70"
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="8"
            fontFamily="var(--font-mono), monospace"
          >
            SETOR OCIDENTAL
          </text>
        </g>

        {/* ========================================================= */}
        {/* CAIXA HOLOGRÁFICA: MADEIRA (SETOR ATLÂNTICO SUL) */}
        {/* ========================================================= */}
        <g className="transition-all duration-300">
          {/* Caixa com Chanfro Tático HUD */}
          <rect
            x="20"
            y="545"
            width="215"
            height="215"
            rx="16"
            fill="rgba(15, 23, 42, 0.85)"
            stroke={selected === 'Madeira' ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)'}
            strokeWidth={selected === 'Madeira' ? '2.5' : '1.2'}
            strokeDasharray={selected === 'Madeira' ? 'none' : '6 4'}
            filter={selected === 'Madeira' ? 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.6))' : undefined}
          />
          <path
            d="M20 557 L32 545 M223 545 L235 557 M20 748 L32 760 M223 760 L235 748"
            stroke="rgba(6, 182, 212, 0.8)"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="34"
            y="568"
            fill="#06b6d4"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
            fontWeight="900"
            letterSpacing="0.15em"
          >
            [02] MADEIRA &amp; PORTO SANTO
          </text>
          <text
            x="34"
            y="580"
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="8"
            fontFamily="var(--font-mono), monospace"
          >
            SETOR AUSTRAL
          </text>
        </g>

        {/* ========================================================= */}
        {/* CAMADA DE DISTRITOS COM CORES VIVAS E HEATMAP NEON */}
        {/* ========================================================= */}
        <g id="districts-tactical-layer">
          {PORTUGAL_GEO_DATA.map((district) => {
            const isSelected = selected.toLowerCase() === district.name.toLowerCase()
            const isHovered = hovered?.name.toLowerCase() === district.name.toLowerCase()
            const style = getDistrictStyle(district.name, isSelected, isHovered)

            return (
              <path
                key={district.name}
                id={`map-tactical-district-${district.name.toLowerCase().replace(/\s+/g, '-')}`}
                d={district.path}
                fill={style.fill}
                fillOpacity={style.fillOpacity}
                stroke={style.stroke}
                strokeOpacity={style.strokeOpacity ?? 1}
                strokeWidth={style.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={style.filter}
                style={{
                  '--district-glow': style.glowColor,
                  transformOrigin: `${district.centroid[0]}px ${district.centroid[1]}px`,
                } as React.CSSProperties}
                className={cn(
                  'transition-all duration-300 cursor-pointer outline-none',
                  isHovered && 'scale-105 brightness-125 z-30',
                  isSelected && 'brightness-135 z-40 animate-[territory-pulse_2s_infinite]'
                )}
                role="button"
                tabIndex={0}
                aria-label={`Distrito de ${district.name}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(district.name)}
                onMouseEnter={() => setHovered(district)}
                onFocus={() => {
                  setHovered(district)
                  setMousePos({ x: district.centroid[0], y: district.centroid[1] })
                }}
                onBlur={() => setHovered(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(district.name)
                  }
                }}
              />
            )
          })}
        </g>

        {/* ========================================================= */}
        {/* LEGENDA HOLOGRÁFICA DO RADAR */}
        {/* ========================================================= */}
        <g transform="translate(32, 285)">
          <text
            x="0"
            y="0"
            fill="rgba(6, 182, 212, 0.8)"
            fontSize="9"
            fontFamily="var(--font-mono), monospace"
            fontWeight="900"
            letterSpacing="0.15em"
          >
            HEATMAP // INTENSIDADE XP
          </text>
          <defs>
            <linearGradient id="tactical-legend-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
              <stop offset="50%" stopColor="rgba(245, 158, 11, 0.7)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 1)" />
            </linearGradient>
          </defs>
          <rect x="0" y="8" width="130" height="6" rx="3" fill="url(#tactical-legend-gradient)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <text x="0" y="24" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="var(--font-mono), monospace" fontWeight="700">
            0 XP
          </text>
          <text x="130" y="24" textAnchor="end" fill="#f59e0b" fontSize="8" fontFamily="var(--font-mono), monospace" fontWeight="900">
            LÍDER NACIONAL
          </text>
        </g>
      </svg>

      {/* Floating Hover Tooltip Holográfico */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-40 transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-75"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 14}px`,
          }}
        >
          <div
            className="rounded-2xl border bg-slate-950/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/15 text-center min-w-[150px] animate-in zoom-in-95 duration-100"
            style={{
              borderColor: hoveredColorInfo?.hex || '#06b6d4',
              boxShadow: `0 0 20px ${hoveredColorInfo?.hex}50`,
            }}
          >
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: hoveredColorInfo?.hex || '#06b6d4' }}
              />
              <p
                className="font-display text-xs font-black uppercase tracking-wider"
                style={{ color: hoveredColorInfo?.hex || '#06b6d4' }}
              >
                {hovered.name}
              </p>
            </div>
            <p className="mt-0.5 text-sm font-black text-white">
              {hoveredStat?.pos ? `#${hoveredStat.pos} no País` : 'Sem classificação'}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{hoveredStat?.players ?? 0} {hoveredStat?.players === 1 ? 'jogador' : 'jogadores'}</span>
              <span>•</span>
              <span className="font-bold text-amber-400">{(hoveredStat?.xp ?? 0).toLocaleString('pt-PT')} XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
