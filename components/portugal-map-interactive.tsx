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

  // Find max XP to compute color intensity
  const maxXp = useMemo(() => {
    let max = 1
    districtStats.forEach((stat) => {
      if (stat.xp > max) max = stat.xp
    })
    return max
  }, [districtStats])

  const getDistrictColor = (name: string, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) {
      return {
        fill: 'rgba(0, 255, 136, 0.85)',
        stroke: '#00ff88',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0 0 14px rgba(0, 255, 136, 0.75))',
      }
    }

    if (isHovered) {
      return {
        fill: 'rgba(0, 255, 136, 0.5)',
        stroke: '#00ff88',
        strokeWidth: 2,
        filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))',
      }
    }

    const stat = districtStats.get(name)
    const xp = stat ? stat.xp : 0
    const ratio = Math.min(1, Math.max(0, xp / (maxXp || 1)))

    if (xp === 0) {
      return {
        fill: 'rgba(18, 28, 24, 0.55)',
        stroke: 'rgba(0, 255, 136, 0.18)',
        strokeWidth: 1,
      }
    }

    // Dynamic emerald green shading based on performance
    const opacity = 0.18 + ratio * 0.42
    return {
      fill: `rgba(0, 255, 136, ${opacity.toFixed(2)})`,
      stroke: 'rgba(0, 255, 136, 0.45)',
      strokeWidth: 1.2,
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

  return (
    <div
      className={cn('relative select-none w-full transition-all duration-300', className)}
      style={{
        filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.25))',
      }}
    >
      <svg
        viewBox="0 0 720 820"
        className="w-full h-auto block overflow-visible cursor-pointer"
        role="img"
        aria-label="Mapa competitivo interativo de Portugal com 18 distritos, Açores e Madeira"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <filter id="glow-selected" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background container glow */}
        <rect
          x="6"
          y="6"
          width="708"
          height="808"
          rx="28"
          fill="rgba(10, 18, 15, 0.5)"
          stroke="rgba(0, 255, 136, 0.12)"
          strokeWidth="1.2"
        />

        {/* Inset Box: Açores */}
        <g className="transition-opacity">
          <rect
            x="20"
            y="35"
            width="215"
            height="225"
            rx="18"
            fill="rgba(18, 24, 27, 0.75)"
            stroke="rgba(0, 255, 136, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text
            x="32"
            y="58"
            fill="#00ff88"
            fontSize="11"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontWeight="900"
            letterSpacing="0.15em"
          >
            AÇORES
          </text>
        </g>

        {/* Inset Box: Madeira */}
        <g className="transition-opacity">
          <rect
            x="20"
            y="545"
            width="215"
            height="215"
            rx="18"
            fill="rgba(18, 24, 27, 0.75)"
            stroke="rgba(0, 255, 136, 0.25)"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <text
            x="32"
            y="568"
            fill="#00ff88"
            fontSize="11"
            fontFamily="var(--font-display), system-ui, sans-serif"
            fontWeight="900"
            letterSpacing="0.15em"
          >
            MADEIRA
          </text>
        </g>

        {/* District Paths */}
        <g id="districts-layer">
          {PORTUGAL_GEO_DATA.map((district) => {
            const isSelected = selected === district.name
            const isHovered = hovered?.name === district.name
            const style = getDistrictColor(district.name, isSelected, isHovered)

            return (
              <path
                key={district.name}
                id={`map-district-${district.name.toLowerCase().replace(/\s+/g, '-')}`}
                d={district.path}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={isSelected ? 'url(#glow-selected)' : undefined}
                className={cn(
                  'transition-all duration-200 cursor-pointer outline-none focus-visible:stroke-primary focus-visible:stroke-2',
                  isSelected && 'brightness-125 z-20',
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

        {/* Map Legend */}
        <g transform="translate(32, 280)">
          <text
            x="0"
            y="0"
            fill="rgba(255,255,255,0.4)"
            fontSize="9"
            fontWeight="700"
            letterSpacing="0.12em"
            className="uppercase"
          >
            Intensidade XP
          </text>
          <defs>
            <linearGradient id="legend-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.24 0.03 160 / 0.6)" />
              <stop offset="50%" stopColor="oklch(0.48 0.12 150 / 0.6)" />
              <stop offset="100%" stopColor="oklch(0.76 0.19 150)" />
            </linearGradient>
          </defs>
          <rect x="0" y="8" width="120" height="6" rx="3" fill="url(#legend-gradient)" />
          <text x="0" y="24" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600">
            0 XP
          </text>
          <text x="120" y="24" textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="8" fontWeight="600">
            Líder
          </text>
        </g>
      </svg>

      {/* Floating Hover Tooltip (Desktop) */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 transition-all duration-75"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y - 12}px`,
          }}
        >
          <div className="rounded-2xl border border-primary/30 bg-background/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 text-center min-w-[140px]">
            <p className="font-display text-xs font-black uppercase tracking-wider text-primary">
              {hovered.name}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-foreground">
              {hoveredStat?.pos ? `${hoveredStat.pos}.º no país` : 'Sem classificação'}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 text-[0.68rem] text-muted-foreground">
              <span>{hoveredStat?.players ?? 0} {hoveredStat?.players === 1 ? 'jogador' : 'jogadores'}</span>
              <span>•</span>
              <span className="font-bold text-gold">{(hoveredStat?.xp ?? 0).toLocaleString('pt-PT')} XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
