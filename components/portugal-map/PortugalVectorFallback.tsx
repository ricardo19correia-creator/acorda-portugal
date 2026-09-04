'use client'

import React, { useState, useMemo } from 'react'
import { PORTUGAL_GEO_DATA } from '@/lib/portugal-geo-data'
import { getDistrictColorInfo } from '@/components/portugal-map-interactive'
import type { DistrictWarTerritory } from '@/lib/district-war'
import { Shield, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortugalVectorFallbackProps {
  territories: DistrictWarTerritory[]
  selectedDistrict: string
  onSelectDistrict: (districtName: string) => void
  className?: string
}

export function PortugalVectorFallback({
  territories,
  selectedDistrict,
  onSelectDistrict,
  className,
}: PortugalVectorFallbackProps) {
  const [zoom, setZoom] = useState(1)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

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

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-950 select-none',
        className
      )}
      style={{
        background: 'radial-gradient(circle at 50% 40%, #081d36 0%, #030a17 70%, #01040a 100%)',
      }}
    >
      {/* Fallback Notice Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-lg flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span>Modo 3D indisponível neste dispositivo — Modo Vetorial Ativo</span>
      </div>

      {/* Vector Canvas Container */}
      <div
        className="relative w-full max-w-[620px] transition-transform duration-300 ease-out flex items-center justify-center p-4"
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        <svg
          viewBox="240 20 360 840"
          className="w-full h-auto max-h-[85vh] drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)] overflow-visible"
        >
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 18 Mainland Districts */}
          {mainlandDistricts.map((d) => {
            const isSelected = selectedDistrict.toLowerCase() === d.name.toLowerCase()
            const isHovered = hoveredDistrict?.toLowerCase() === d.name.toLowerCase()
            const colorInfo = getDistrictColorInfo(d.name)
            const baseColor = colorInfo.hex

            return (
              <g key={d.name} className="cursor-pointer group">
                <path
                  d={d.path}
                  fill={baseColor}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.45}
                  stroke={isSelected ? '#ffffff' : baseColor}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                  style={{
                    filter: isSelected
                      ? `drop-shadow(0 0 16px ${baseColor})`
                      : isHovered
                      ? `drop-shadow(0 0 10px ${baseColor})`
                      : undefined,
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => onSelectDistrict(d.name)}
                  onMouseEnter={() => setHoveredDistrict(d.name)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
              </g>
            )
          })}

          {/* Açores Box */}
          <g
            transform="translate(250, 40)"
            className="cursor-pointer"
            onClick={() => onSelectDistrict('Açores')}
            onMouseEnter={() => setHoveredDistrict('Açores')}
            onMouseLeave={() => setHoveredDistrict(null)}
          >
            <rect
              x="-10"
              y="-10"
              width="110"
              height="75"
              rx="16"
              fill="#020617"
              fillOpacity="0.9"
              stroke={selectedDistrict.toLowerCase().includes('açores') ? '#14b8a6' : 'rgba(20, 184, 166, 0.4)'}
              strokeWidth={selectedDistrict.toLowerCase().includes('açores') ? '2.5' : '1.2'}
            />
            <text x="45" y="18" textAnchor="middle" fill="#14b8a6" fontSize="10" fontWeight="900" fontFamily="monospace">
              🌊 AÇORES
            </text>
            <text x="45" y="34" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">
              #{territoryMap.get('açores')?.pos || 8} • 9 Ilhas
            </text>
            <text x="45" y="48" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {territoryMap.get('açores')?.powerFormatted || '0'} pts
            </text>
          </g>

          {/* Madeira Box */}
          <g
            transform="translate(250, 720)"
            className="cursor-pointer"
            onClick={() => onSelectDistrict('Madeira')}
            onMouseEnter={() => setHoveredDistrict('Madeira')}
            onMouseLeave={() => setHoveredDistrict(null)}
          >
            <rect
              x="-10"
              y="-10"
              width="110"
              height="75"
              rx="16"
              fill="#020617"
              fillOpacity="0.9"
              stroke={selectedDistrict.toLowerCase() === 'madeira' ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)'}
              strokeWidth={selectedDistrict.toLowerCase() === 'madeira' ? '2.5' : '1.2'}
            />
            <text x="45" y="18" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="900" fontFamily="monospace">
              🌺 MADEIRA
            </text>
            <text x="45" y="34" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">
              #{territoryMap.get('madeira')?.pos || 9} • Arquipélago
            </text>
            <text x="45" y="48" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              {territoryMap.get('madeira')?.powerFormatted || '0'} pts
            </text>
          </g>
        </svg>
      </div>

      {/* Vector Map Zoom Controls */}
      <div className="absolute right-4 bottom-8 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
          className="h-9 w-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
          className="h-9 w-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="h-9 w-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
