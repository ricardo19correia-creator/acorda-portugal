'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PORTUGAL_GEO_DATA,
  type DistrictGeoItem,
} from '@/lib/portugal-geo-data'
import { Trophy, Flame, Sparkles, MapPin, Users, Zap, Compass, Play, Shield } from 'lucide-react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { usePresence } from '@/components/presence-provider'
import { cn } from '@/lib/utils'

export type DistrictStat = {
  name: string
  pos: number
  players: number
  xp: number
}

export type DistrictTheme = {
  gradientId: string
  from: string
  to: string
  accent: string
  glowColor: string
  name: string
  label: string
}

export const DISTRICT_THEMES_3D: Record<string, DistrictTheme> = {
  'Viana do Castelo': {
    gradientId: 'grad3d-viana',
    from: '#065f46',
    to: '#10b981',
    accent: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.9)',
    name: 'Viana do Castelo',
    label: 'Alto Minho',
  },
  'Braga': {
    gradientId: 'grad3d-braga',
    from: '#6d28d9',
    to: '#8b5cf6',
    accent: '#c084fc',
    glowColor: 'rgba(139, 92, 246, 0.9)',
    name: 'Braga',
    label: 'Minho',
  },
  'Porto': {
    gradientId: 'grad3d-porto',
    from: '#1e40af',
    to: '#3b82f6',
    accent: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.95)',
    name: 'Porto',
    label: 'Grande Porto',
  },
  'Vila Real': {
    gradientId: 'grad3d-vilareal',
    from: '#b45309',
    to: '#f59e0b',
    accent: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.9)',
    name: 'Vila Real',
    label: 'Trás-os-Montes',
  },
  'Bragança': {
    gradientId: 'grad3d-braganca',
    from: '#991b1b',
    to: '#ef4444',
    accent: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    name: 'Bragança',
    label: 'Nordeste',
  },
  'Aveiro': {
    gradientId: 'grad3d-aveiro',
    from: '#0e7490',
    to: '#06b6d4',
    accent: '#67e8f9',
    glowColor: 'rgba(6, 182, 212, 0.9)',
    name: 'Aveiro',
    label: 'Ria & Costa',
  },
  'Viseu': {
    gradientId: 'grad3d-viseu',
    from: '#4338ca',
    to: '#6366f1',
    accent: '#a5b4fc',
    glowColor: 'rgba(99, 102, 241, 0.9)',
    name: 'Viseu',
    label: 'Beira Alta',
  },
  'Guarda': {
    gradientId: 'grad3d-guarda',
    from: '#047857',
    to: '#059669',
    accent: '#6ee7b7',
    glowColor: 'rgba(5, 150, 105, 0.9)',
    name: 'Guarda',
    label: 'Serra da Estrela',
  },
  'Coimbra': {
    gradientId: 'grad3d-coimbra',
    from: '#1e3a8a',
    to: '#2563eb',
    accent: '#93c5fd',
    glowColor: 'rgba(37, 99, 235, 0.9)',
    name: 'Coimbra',
    label: 'Centro',
  },
  'Castelo Branco': {
    gradientId: 'grad3d-castelobranco',
    from: '#92400e',
    to: '#d97706',
    accent: '#fde68a',
    glowColor: 'rgba(217, 119, 6, 0.9)',
    name: 'Castelo Branco',
    label: 'Beira Baixa',
  },
  'Leiria': {
    gradientId: 'grad3d-leiria',
    from: '#0f766e',
    to: '#14b8a6',
    accent: '#5eead4',
    glowColor: 'rgba(20, 184, 166, 0.9)',
    name: 'Leiria',
    label: 'Costa de Prata',
  },
  'Santarém': {
    gradientId: 'grad3d-santarem',
    from: '#854d0e',
    to: '#ca8a04',
    accent: '#fef08a',
    glowColor: 'rgba(202, 138, 4, 0.9)',
    name: 'Santarém',
    label: 'Ribatejo',
  },
  'Lisboa': {
    gradientId: 'grad3d-lisboa',
    from: '#b91c1c',
    to: '#f43f5e',
    accent: '#fda4af',
    glowColor: 'rgba(244, 63, 94, 0.95)',
    name: 'Lisboa',
    label: 'Capital',
  },
  'Portalegre': {
    gradientId: 'grad3d-portalegre',
    from: '#581c87',
    to: '#9333ea',
    accent: '#d8b4fe',
    glowColor: 'rgba(147, 51, 234, 0.9)',
    name: 'Portalegre',
    label: 'Alto Alentejo',
  },
  'Setúbal': {
    gradientId: 'grad3d-setubal',
    from: '#155e75',
    to: '#0284c7',
    accent: '#38bdf8',
    glowColor: 'rgba(2, 132, 199, 0.95)',
    name: 'Setúbal',
    label: 'Arrábida & Sado',
  },
  'Évora': {
    gradientId: 'grad3d-evora',
    from: '#713f12',
    to: '#eab308',
    accent: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.9)',
    name: 'Évora',
    label: 'Alentejo Central',
  },
  'Beja': {
    gradientId: 'grad3d-beja',
    from: '#7c2d12',
    to: '#ea580c',
    accent: '#fdba74',
    glowColor: 'rgba(234, 88, 12, 0.9)',
    name: 'Beja',
    label: 'Baixo Alentejo',
  },
  'Faro': {
    gradientId: 'grad3d-faro',
    from: '#c2410c',
    to: '#f97316',
    accent: '#fed7aa',
    glowColor: 'rgba(249, 115, 22, 0.95)',
    name: 'Faro',
    label: 'Algarve',
  },
  'Açores': {
    gradientId: 'grad3d-acores',
    from: '#1e3a8a',
    to: '#06b6d4',
    accent: '#67e8f9',
    glowColor: 'rgba(6, 182, 212, 0.95)',
    name: 'Açores',
    label: 'Atlântico',
  },
  'Madeira': {
    gradientId: 'grad3d-madeira',
    from: '#be123c',
    to: '#fb7185',
    accent: '#fecdd3',
    glowColor: 'rgba(251, 113, 133, 0.95)',
    name: 'Madeira',
    label: 'Pérola do Atlântico',
  },
}

export function PortugalMap3D({
  className = '',
  selectedDistrict: initialSelected,
  onSelectDistrict,
}: {
  className?: string
  selectedDistrict?: string | null
  onSelectDistrict?: (name: string) => void
}) {
  const router = useRouter()
  const { profile } = useAuth()
  const { activeUsers } = usePresence()

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    initialSelected || profile?.district || 'Lisboa',
  )
  const [districtData, setDistrictData] = useState<Map<string, DistrictStat>>(new Map())
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 3D Isometric dynamic mouse tilt
  const [tilt, setTilt] = useState({ rotateX: 12, rotateY: -8 })

  // Real-time online counts per district
  const districtOnlineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeUsers.forEach((u) => {
      if (u.district) {
        const d = u.district.trim()
        counts[d] = (counts[d] || 0) + 1
      }
    })
    return counts
  }, [activeUsers])

  // Split mainland vs island data
  const mainlandDistricts = useMemo(() => {
    return PORTUGAL_GEO_DATA.filter((d) => d.type === 'mainland')
  }, [])

  const acoresDistrict = useMemo(() => {
    return PORTUGAL_GEO_DATA.find((d) => d.name === 'Açores')
  }, [])

  const madeiraDistrict = useMemo(() => {
    return PORTUGAL_GEO_DATA.find((d) => d.name === 'Madeira')
  }, [])

  // Sync real rankings from Firestore
  useEffect(() => {
    const q = query(collection(db, 'publicProfiles'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const statsMap = new Map<string, { xp: number; players: number }>()

        snapshot.forEach((doc) => {
          const data = doc.data()
          const district = data.district?.trim()
          if (!district) return

          const current = statsMap.get(district) || { xp: 0, players: 0 }
          statsMap.set(district, {
            xp: current.xp + (data.xp || 0),
            players: current.players + 1,
          })
        })

        const sorted = Array.from(statsMap.entries()).sort((a, b) => b[1].xp - a[1].xp)
        const finalMap = new Map<string, DistrictStat>()

        sorted.forEach(([name, val], idx) => {
          finalMap.set(name, {
            name,
            pos: idx + 1,
            players: val.players,
            xp: val.xp,
          })
        })

        setDistrictData(finalMap)
      },
      (err) => {
        console.warn('Erro ao carregar rankings do mapa:', err)
      },
    )

    return () => unsubscribe()
  }, [])

  // Handle Mouse Tilt Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    const rotX = 12 - (y / rect.height) * 10
    const rotY = -8 + (x / rect.width) * 12

    setTilt({
      rotateX: Math.max(2, Math.min(22, rotX)),
      rotateY: Math.max(-18, Math.min(6, rotY)),
    })
  }

  const handleMouseLeave = () => {
    setTilt({ rotateX: 12, rotateY: -8 })
    setHoveredDistrict(null)
  }

  const handleDistrictClick = (name: string) => {
    setSelectedDistrict(name)
    onSelectDistrict?.(name)
  }

  const activeHoverOrSelected = hoveredDistrict || selectedDistrict || 'Lisboa'
  const activeStat = districtData.get(activeHoverOrSelected)
  const activeOnline = districtOnlineCounts[activeHoverOrSelected] || 0
  const activeTheme = DISTRICT_THEMES_3D[activeHoverOrSelected] || DISTRICT_THEMES_3D['Lisboa']

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative w-full select-none flex flex-col items-center justify-center p-2 sm:p-4',
        className,
      )}
    >
      {/* 3D ISOMETRIC VECTOR BOARD */}
      <div
        className="relative w-full aspect-[0.92/1] sm:aspect-[1.05/1] max-w-3xl flex items-center justify-center transition-transform duration-200 ease-out will-change-transform"
        style={{
          perspective: '1000px',
        }}
      >
        {/* Holographic Cyber Grid Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-emerald-500/10 blur-[90px] animate-pulse" />
        <div className="pointer-events-none absolute inset-[15%] rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* 3D Rotated Isometric Scene */}
        <div
          className="relative z-10 w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {/* MAIN VECTOR SVG */}
          <svg
            viewBox="0 0 760 850"
            className="w-full h-full filter drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] overflow-visible"
            role="img"
            aria-label="Mapa 3D Interativo de Portugal e Ilhas com presença em direto"
          >
            <defs>
              {/* Dynamic Theme Gradients */}
              {Object.values(DISTRICT_THEMES_3D).map((t) => (
                <linearGradient
                  key={t.gradientId}
                  id={t.gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={t.from} stopOpacity="0.92" />
                  <stop offset="100%" stopColor={t.to} stopOpacity="1" />
                </linearGradient>
              ))}

              {/* Special Glow Filter */}
              <filter id="neon-district-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* BASE LAYER: Depth Extrusion Shadow */}
            <g id="layer-3d-shadow" transform="translate(6, 18)" className="opacity-80 pointer-events-none">
              {mainlandDistricts.map((d) => (
                <path
                  key={`shadow-${d.name}`}
                  d={d.path}
                  fill="#030805"
                  stroke="#0f261d"
                  strokeWidth="2.5"
                />
              ))}
            </g>

            {/* INTERACTIVE MAINLAND DISTRICTS */}
            <g id="layer-3d-mainland">
              {mainlandDistricts.map((d) => {
                const isHovered = hoveredDistrict === d.name
                const isSelected = selectedDistrict === d.name
                const isPlayerDistrict = profile?.district === d.name
                const theme = DISTRICT_THEMES_3D[d.name] || DISTRICT_THEMES_3D['Lisboa']
                const onlineCount = districtOnlineCounts[d.name] || 0

                return (
                  <g
                    key={`district-${d.name}`}
                    onClick={() => handleDistrictClick(d.name)}
                    onMouseEnter={(e) => {
                      setHoveredDistrict(d.name)
                      const rect = e.currentTarget.getBoundingClientRect()
                      if (containerRef.current) {
                        const parentRect = containerRef.current.getBoundingClientRect()
                        setTooltipPos({
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top,
                        })
                      }
                    }}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className="cursor-pointer transition-all duration-300 outline-none"
                  >
                    {/* Interactive Path */}
                    <path
                      d={d.path}
                      fill={`url(#${theme.gradientId})`}
                      stroke={
                        isSelected
                          ? '#ffffff'
                          : isHovered
                            ? theme.accent
                            : isPlayerDistrict
                              ? '#34d399'
                              : 'rgba(255, 255, 255, 0.4)'
                      }
                      strokeWidth={isSelected ? 3.2 : isHovered ? 2.6 : 1.4}
                      className={cn(
                        'transition-all duration-300',
                        isHovered && 'brightness-125 [filter:url(#neon-district-glow)]',
                        isSelected && 'brightness-135',
                      )}
                      style={{
                        transformOrigin: `${d.centroid[0]}px ${d.centroid[1]}px`,
                        transform: isHovered
                          ? 'scale(1.03) translateZ(12px)'
                          : isSelected
                            ? 'scale(1.02) translateZ(8px)'
                            : 'none',
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease',
                      }}
                    />

                    {/* District Capital Live Radar Beacon */}
                    {onlineCount > 0 && (
                      <g transform={`translate(${d.centroid[0]}, ${d.centroid[1] - 8})`}>
                        <circle r="8" fill="#10b981" opacity="0.4" className="animate-ping" />
                        <circle r="4" fill="#34d399" stroke="#ffffff" strokeWidth="1.2" />
                      </g>
                    )}

                    {/* Centered District Label */}
                    <text
                      x={d.centroid[0]}
                      y={d.centroid[1] + (onlineCount > 0 ? 8 : 2)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                      className={cn(
                        'fill-white font-display text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
                        isSelected ? 'fill-gold font-extrabold scale-110' : 'fill-white/95',
                      )}
                    >
                      {d.name}
                    </text>

                    {/* Live Online Badge Pill directly in District */}
                    {onlineCount > 0 && (
                      <g transform={`translate(${d.centroid[0]}, ${d.centroid[1] + 19})`}>
                        <rect
                          x="-22"
                          y="-7"
                          width="44"
                          height="14"
                          rx="7"
                          fill="rgba(5, 20, 15, 0.85)"
                          stroke="rgba(52, 211, 153, 0.7)"
                          strokeWidth="1"
                        />
                        <circle cx="-14" cy="0" r="2.5" fill="#34d399" className="animate-pulse" />
                        <text
                          x="3"
                          y="0.5"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="fill-emerald-300 font-display text-[7.5px] font-black tracking-tight"
                        >
                          {onlineCount} ON
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* ISLAND 1: AÇORES HOLOGRAPHIC GLASS BOX */}
        {acoresDistrict && (
          <div
            onClick={() => handleDistrictClick('Açores')}
            onMouseEnter={() => setHoveredDistrict('Açores')}
            onMouseLeave={() => setHoveredDistrict(null)}
            className={cn(
              'absolute top-4 left-3 sm:left-6 z-20 rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-xl',
              selectedDistrict === 'Açores' || hoveredDistrict === 'Açores'
                ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-105'
                : 'border-cyan-500/30 bg-slate-950/60 hover:border-cyan-400/60 hover:bg-slate-900/70',
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <span>🌊 Açores</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[8.5px] font-black text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {districtOnlineCounts['Açores'] || 0} Online
              </span>
            </div>
            <div className="w-24 sm:w-32 h-14 sm:h-18">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <path
                  d={acoresDistrict.path}
                  fill="url(#grad3d-acores)"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                />
              </svg>
            </div>
          </div>
        )}

        {/* ISLAND 2: MADEIRA HOLOGRAPHIC GLASS BOX */}
        {madeiraDistrict && (
          <div
            onClick={() => handleDistrictClick('Madeira')}
            onMouseEnter={() => setHoveredDistrict('Madeira')}
            onMouseLeave={() => setHoveredDistrict(null)}
            className={cn(
              'absolute bottom-4 left-3 sm:left-6 z-20 rounded-2xl border p-2.5 sm:p-3.5 backdrop-blur-md transition-all duration-300 cursor-pointer shadow-xl',
              selectedDistrict === 'Madeira' || hoveredDistrict === 'Madeira'
                ? 'border-rose-400 bg-rose-950/70 shadow-[0_0_25px_rgba(251,113,133,0.35)] scale-105'
                : 'border-rose-500/30 bg-slate-950/60 hover:border-rose-400/60 hover:bg-slate-900/70',
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <span>🌺 Madeira</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[8.5px] font-black text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {districtOnlineCounts['Madeira'] || 0} Online
              </span>
            </div>
            <div className="w-24 sm:w-32 h-14 sm:h-18">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <path
                  d={madeiraDistrict.path}
                  fill="url(#grad3d-madeira)"
                  stroke="#fb7185"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CYBERPUNK HUD TOOLTIP & QUICK ACTION */}
      <div className="mt-4 w-full max-w-xl animate-rise">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/90 p-4 sm:p-5 backdrop-blur-2xl shadow-2xl shadow-black/80">
          {/* Top Neon Accent Bar */}
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background: `linear-gradient(to right, transparent, ${activeTheme.accent}, transparent)`,
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left Info: District, Rank, XP */}
            <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-xl shadow-md"
                style={{
                  backgroundColor: `${activeTheme.from}40`,
                  borderColor: activeTheme.accent,
                }}
              >
                📍
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-black uppercase tracking-wide text-foreground truncate">
                    {activeHoverOrSelected}
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    🟢 {activeOnline} Online
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                  <span>🏆 Rank #{activeStat?.pos || '-'}</span>
                  <span>•</span>
                  <span>⚡ {(activeStat?.xp || 0).toLocaleString('pt-PT')} XP Total</span>
                </p>
              </div>
            </div>

            {/* Right Action: Quick Play Button */}
            <Link
              href={`/jogar?cat=desafio-distrito&district=${encodeURIComponent(activeHoverOrSelected)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 px-5 py-3 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-primary-foreground shadow-[0_0_20px_rgba(0,255,162,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Jogar por este Distrito</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortugalMap3D
