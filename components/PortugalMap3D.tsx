'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  PORTUGAL_GEO_DATA,
  ACORES_DETAILED_PATH,
  MADEIRA_DETAILED_PATH,
  type DistrictGeoItem,
} from '@/lib/portugal-geo-data'
import { Trophy, Flame, Sparkles, MapPin, Users, Zap, Compass, Play, Shield, Navigation } from 'lucide-react'
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
  terrainGradientId: string
  from: string
  mid: string
  to: string
  accent: string
  glowColor: string
  name: string
  label: string
  fontSize: string
}

export const DISTRICT_TERRAIN_THEMES: Record<string, DistrictTheme> = {
  'Viana do Castelo': {
    gradientId: 'grad-viana',
    terrainGradientId: 'terrain-viana',
    from: '#064e3b',
    mid: '#047857',
    to: '#10b981',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Viana do Castelo',
    label: 'Alto Minho',
    fontSize: '8.5px',
  },
  'Braga': {
    gradientId: 'grad-braga',
    terrainGradientId: 'terrain-braga',
    from: '#4c1d95',
    mid: '#6d28d9',
    to: '#8b5cf6',
    accent: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.95)',
    name: 'Braga',
    label: 'Minho',
    fontSize: '9.5px',
  },
  'Porto': {
    gradientId: 'grad-porto',
    terrainGradientId: 'terrain-porto',
    from: '#1e3a8a',
    mid: '#1d4ed8',
    to: '#3b82f6',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Porto',
    label: 'Grande Porto',
    fontSize: '9px',
  },
  'Vila Real': {
    gradientId: 'grad-vilareal',
    terrainGradientId: 'terrain-vilareal',
    from: '#78350f',
    mid: '#b45309',
    to: '#f59e0b',
    accent: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    name: 'Vila Real',
    label: 'Trás-os-Montes',
    fontSize: '10px',
  },
  'Bragança': {
    gradientId: 'grad-braganca',
    terrainGradientId: 'terrain-braganca',
    from: '#7f1d1d',
    mid: '#991b1b',
    to: '#ef4444',
    accent: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.95)',
    name: 'Bragança',
    label: 'Nordeste Transmontano',
    fontSize: '11px',
  },
  'Aveiro': {
    gradientId: 'grad-aveiro',
    terrainGradientId: 'terrain-aveiro',
    from: '#164e63',
    mid: '#0e7490',
    to: '#06b6d4',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Aveiro',
    label: 'Ria & Costa',
    fontSize: '9.5px',
  },
  'Viseu': {
    gradientId: 'grad-viseu',
    terrainGradientId: 'terrain-viseu',
    from: '#312e81',
    mid: '#4338ca',
    to: '#6366f1',
    accent: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.95)',
    name: 'Viseu',
    label: 'Beira Alta',
    fontSize: '10.5px',
  },
  'Guarda': {
    gradientId: 'grad-guarda',
    terrainGradientId: 'terrain-guarda',
    from: '#064e3b',
    mid: '#047857',
    to: '#059669',
    accent: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.95)',
    name: 'Guarda',
    label: 'Serra da Estrela',
    fontSize: '10.5px',
  },
  'Coimbra': {
    gradientId: 'grad-coimbra',
    terrainGradientId: 'terrain-coimbra',
    from: '#172554',
    mid: '#1e3a8a',
    to: '#2563eb',
    accent: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.95)',
    name: 'Coimbra',
    label: 'Região Centro',
    fontSize: '10px',
  },
  'Castelo Branco': {
    gradientId: 'grad-castelobranco',
    terrainGradientId: 'terrain-castelobranco',
    from: '#713f12',
    mid: '#92400e',
    to: '#d97706',
    accent: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    name: 'Castelo Branco',
    label: 'Beira Baixa',
    fontSize: '9.5px',
  },
  'Leiria': {
    gradientId: 'grad-leiria',
    terrainGradientId: 'terrain-leiria',
    from: '#134e4a',
    mid: '#0f766e',
    to: '#14b8a6',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Leiria',
    label: 'Costa de Prata',
    fontSize: '9.5px',
  },
  'Santarém': {
    gradientId: 'grad-santarem',
    terrainGradientId: 'terrain-santarem',
    from: '#713f12',
    mid: '#854d0e',
    to: '#ca8a04',
    accent: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.95)',
    name: 'Santarém',
    label: 'Ribatejo',
    fontSize: '10.5px',
  },
  'Lisboa': {
    gradientId: 'grad-lisboa',
    terrainGradientId: 'terrain-lisboa',
    from: '#881337',
    mid: '#9f1239',
    to: '#f43f5e',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Lisboa',
    label: 'Capital & Tejo',
    fontSize: '9px',
  },
  'Portalegre': {
    gradientId: 'grad-portalegre',
    terrainGradientId: 'terrain-portalegre',
    from: '#3b0764',
    mid: '#581c87',
    to: '#9333ea',
    accent: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.95)',
    name: 'Portalegre',
    label: 'Alto Alentejo',
    fontSize: '10px',
  },
  'Setúbal': {
    gradientId: 'grad-setubal',
    terrainGradientId: 'terrain-setubal',
    from: '#083344',
    mid: '#155e75',
    to: '#0284c7',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Setúbal',
    label: 'Arrábida & Sado',
    fontSize: '9.5px',
  },
  'Évora': {
    gradientId: 'grad-evora',
    terrainGradientId: 'terrain-evora',
    from: '#422006',
    mid: '#713f12',
    to: '#eab308',
    accent: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.95)',
    name: 'Évora',
    label: 'Alentejo Central',
    fontSize: '11px',
  },
  'Beja': {
    gradientId: 'grad-beja',
    terrainGradientId: 'terrain-beja',
    from: '#431407',
    mid: '#7c2d12',
    to: '#ea580c',
    accent: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.95)',
    name: 'Beja',
    label: 'Planície Alentejana',
    fontSize: '12px',
  },
  'Faro': {
    gradientId: 'grad-faro',
    terrainGradientId: 'terrain-faro',
    from: '#431407',
    mid: '#9a3412',
    to: '#f97316',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Faro',
    label: 'Algarve',
    fontSize: '11px',
  },
  'Açores': {
    gradientId: 'grad-acores',
    terrainGradientId: 'terrain-acores',
    from: '#082f49',
    mid: '#0369a1',
    to: '#06b6d4',
    accent: '#00f2ff',
    glowColor: 'rgba(0, 242, 255, 0.95)',
    name: 'Açores',
    label: '9 Ilhas Vulcânicas',
    fontSize: '11px',
  },
  'Madeira': {
    gradientId: 'grad-madeira',
    terrainGradientId: 'terrain-madeira',
    from: '#4c0519',
    mid: '#9f1239',
    to: '#fb7185',
    accent: '#fda4af',
    glowColor: 'rgba(251, 113, 133, 0.95)',
    name: 'Madeira',
    label: 'Madeira & Porto Santo',
    fontSize: '11px',
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
  const { profile } = useAuth()
  const { activeUsers } = usePresence()

  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    initialSelected || profile?.district || 'Lisboa',
  )
  const [districtData, setDistrictData] = useState<Map<string, DistrictStat>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // 3D Isometric dynamic mouse tilt (perspetiva suave)
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

    const rotX = 12 - (y / rect.height) * 8
    const rotY = -8 + (x / rect.width) * 10

    setTilt({
      rotateX: Math.max(4, Math.min(20, rotX)),
      rotateY: Math.max(-16, Math.min(4, rotY)),
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
  const activeTheme = DISTRICT_TERRAIN_THEMES[activeHoverOrSelected] || DISTRICT_TERRAIN_THEMES['Lisboa']

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
      {/* 3D ISOMETRIC VECTOR BOARD WITH TERRAIN RELIEF */}
      <div
        className="relative w-full aspect-[0.88/1] sm:aspect-[0.98/1] max-w-4xl flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{
          perspective: '1000px',
        }}
      >
        {/* Futuristic Cyber Radar Grid Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
        <div className="pointer-events-none absolute inset-[20%] rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* 3D Rotated Isometric Scene (preserve-3d) */}
        <div
          className="relative z-10 w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {/* MAIN VECTOR SVG WITH OFFICIAL BORDERS */}
          <svg
            viewBox="0 0 800 900"
            className="w-full h-full filter drop-shadow-[0_30px_45px_rgba(0,0,0,0.9)] overflow-visible"
            role="img"
            aria-label="Mapa Geográfico Oficial 3D de Portugal e Ilhas com Relevo Topográfico"
          >
            <defs>
              {/* Topographic Relief Shading & Sun Simulation (Directional Lighting 315°) */}
              <filter id="terrain-elevation-relief" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.8" />
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting
                  in="blur"
                  surfaceScale="4"
                  specularConstant="0.8"
                  specularExponent="18"
                  lightingColor="#ffffff"
                  result="specOut"
                >
                  <fePointLight x="150" y="80" z="220" />
                </feSpecularLighting>
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0" />
              </filter>

              {/* Dynamic Theme Gradients with Topographic Depth */}
              {Object.values(DISTRICT_TERRAIN_THEMES).map((t) => (
                <g key={`def-${t.gradientId}`}>
                  {/* Surface Elevation Gradient */}
                  <linearGradient id={t.gradientId} x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor={t.to} stopOpacity="0.95" />
                    <stop offset="50%" stopColor={t.mid} stopOpacity="0.90" />
                    <stop offset="100%" stopColor={t.from} stopOpacity="0.98" />
                  </linearGradient>

                  {/* Topographic Bevel Lighting */}
                  <linearGradient id={t.terrainGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop offset="40%" stopColor="transparent" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
                  </linearGradient>
                </g>
              ))}

              {/* High-intensity Neon Cyan Glow */}
              <filter id="neon-cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#00f2ff" floodOpacity="0.9" />
                <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#00f2ff" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* LAYER 1: Deep Volumetric Shadow (3D Extrusion Foundation) */}
            <g id="layer-3d-extrusion-shadow" transform="translate(8, 24)" className="opacity-90 pointer-events-none">
              {PORTUGAL_GEO_DATA.map((d) => (
                <path
                  key={`shadow-${d.name}`}
                  d={d.path}
                  fill="#030805"
                  stroke="#081812"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              ))}
            </g>

            {/* LAYER 2: 3D Topographic Terrain Rim (Mid Elevation) */}
            <g id="layer-3d-mid-terrain" transform="translate(4, 12)" className="opacity-95 pointer-events-none">
              {PORTUGAL_GEO_DATA.map((d) => {
                const theme = DISTRICT_TERRAIN_THEMES[d.name] || DISTRICT_TERRAIN_THEMES['Lisboa']
                return (
                  <path
                    key={`mid-${d.name}`}
                    d={d.path}
                    fill={theme.from}
                    fillOpacity="0.7"
                    stroke="#00f2ff"
                    strokeOpacity="0.3"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                )
              })}
            </g>

            {/* LAYER 3: OFFICIAL 18 MAINLAND DISTRICTS (Accurate Topographic Surface) */}
            <g id="layer-3d-official-surface">
              {PORTUGAL_GEO_DATA.map((d) => {
                const isHovered = hoveredDistrict === d.name
                const isSelected = selectedDistrict === d.name
                const isPlayerDistrict = profile?.district === d.name
                const theme = DISTRICT_TERRAIN_THEMES[d.name] || DISTRICT_TERRAIN_THEMES['Lisboa']
                const onlineCount = districtOnlineCounts[d.name] || 0

                return (
                  <g
                    key={`district-${d.name}`}
                    onClick={() => handleDistrictClick(d.name)}
                    onMouseEnter={() => setHoveredDistrict(d.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className="cursor-pointer transition-all duration-300 outline-none group"
                  >
                    {/* District Real Shape Path */}
                    <path
                      d={d.path}
                      fill={`url(#${theme.gradientId})`}
                      stroke={
                        isSelected
                          ? '#ffffff'
                          : isHovered
                            ? '#00f2ff'
                            : isPlayerDistrict
                              ? '#34d399'
                              : 'rgba(0, 242, 255, 0.45)'
                      }
                      strokeWidth={isSelected ? 3.0 : isHovered ? 2.4 : 1.2}
                      strokeLinejoin="round"
                      filter={isHovered ? 'url(#neon-cyan-glow)' : 'url(#terrain-elevation-relief)'}
                      className={cn(
                        'transition-all duration-300',
                        isHovered && 'brightness-125',
                        isSelected && 'brightness-135',
                      )}
                      style={{
                        transformOrigin: `${d.centroid[0]}px ${d.centroid[1]}px`,
                        transform: isHovered
                          ? 'scale(1.025) translateZ(14px)'
                          : isSelected
                            ? 'scale(1.015) translateZ(8px)'
                            : 'none',
                        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease',
                      }}
                    />

                    {/* Shading Overlay for Relief Simulation */}
                    <path
                      d={d.path}
                      fill={`url(#${theme.terrainGradientId})`}
                      pointerEvents="none"
                      className="opacity-70"
                    />

                    {/* Capital Beacon Pulse Indicator */}
                    {onlineCount > 0 && (
                      <g transform={`translate(${d.centroid[0]}, ${d.centroid[1] - 8})`}>
                        <circle r="9" fill="#10b981" opacity="0.45" className="animate-ping" />
                        <circle r="4" fill="#34d399" stroke="#ffffff" strokeWidth="1.2" />
                      </g>
                    )}

                    {/* Centered District Name (Automatic font-size per district) */}
                    <text
                      x={d.centroid[0]}
                      y={d.centroid[1] + (onlineCount > 0 ? 8 : 2)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                      style={{ fontSize: theme.fontSize }}
                      className={cn(
                        'font-display font-black uppercase tracking-wider select-none',
                        isSelected
                          ? 'fill-gold drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)] scale-110'
                          : isHovered
                            ? 'fill-cyan-200 drop-shadow-[0_2px_6px_rgba(0,242,255,0.8)]'
                            : 'fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]',
                      )}
                    >
                      {d.name}
                    </text>

                    {/* Mini Online Badge */}
                    {onlineCount > 0 && (
                      <g transform={`translate(${d.centroid[0]}, ${d.centroid[1] + 19})`}>
                        <rect
                          x="-22"
                          y="-6.5"
                          width="44"
                          height="13"
                          rx="6.5"
                          fill="rgba(5, 20, 15, 0.90)"
                          stroke="rgba(0, 242, 255, 0.75)"
                          strokeWidth="1"
                        />
                        <circle cx="-13" cy="0" r="2.2" fill="#34d399" className="animate-pulse" />
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

        {/* ========================================================================= */}
        {/* ENLARGED 2.5X+ HOLOGRAPHIC GLASS INSET: AÇORES (9 ILHAS VULCÂNICAS) */}
        {/* ========================================================================= */}
        <div
          onClick={() => handleDistrictClick('Açores')}
          onMouseEnter={() => setHoveredDistrict('Açores')}
          onMouseLeave={() => setHoveredDistrict(null)}
          className={cn(
            'absolute top-2 left-2 sm:left-4 z-20 w-44 sm:w-64 rounded-3xl border p-3.5 sm:p-4.5 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-2xl',
            selectedDistrict === 'Açores' || hoveredDistrict === 'Açores'
              ? 'border-cyan-400 bg-slate-900/90 shadow-[0_0_30px_rgba(0,242,255,0.4)] scale-105'
              : 'border-cyan-500/35 bg-slate-950/80 hover:border-cyan-400/70 hover:bg-slate-900/85',
          )}
        >
          {/* Header Card */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-cyan-500/25">
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-cyan-400" />
                <span>Açores</span>
              </span>
              <span className="text-[9px] text-cyan-400/80 font-bold block">
                9 Ilhas do Arquipélago
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[9px] font-black text-emerald-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {districtOnlineCounts['Açores'] || 0} Online
            </span>
          </div>

          {/* High-Definition 9 Islands Vector Shape */}
          <div className="w-full h-20 sm:h-28 flex items-center justify-center">
            <svg viewBox="0 0 320 180" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(0,242,255,0.45)]">
              <path
                d={ACORES_DETAILED_PATH}
                fill="url(#grad-acores)"
                stroke="#00f2ff"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ENLARGED 2.5X+ HOLOGRAPHIC GLASS INSET: MADEIRA & PORTO SANTO */}
        {/* ========================================================================= */}
        <div
          onClick={() => handleDistrictClick('Madeira')}
          onMouseEnter={() => setHoveredDistrict('Madeira')}
          onMouseLeave={() => setHoveredDistrict(null)}
          className={cn(
            'absolute bottom-2 left-2 sm:left-4 z-20 w-44 sm:w-64 rounded-3xl border p-3.5 sm:p-4.5 backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-2xl',
            selectedDistrict === 'Madeira' || hoveredDistrict === 'Madeira'
              ? 'border-rose-400 bg-slate-900/90 shadow-[0_0_30px_rgba(251,113,133,0.4)] scale-105'
              : 'border-rose-500/35 bg-slate-950/80 hover:border-rose-400/70 hover:bg-slate-900/85',
          )}
        >
          {/* Header Card */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-rose-500/25">
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-rose-400" />
                <span>Madeira</span>
              </span>
              <span className="text-[9px] text-rose-400/80 font-bold block">
                Madeira & Porto Santo
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[9px] font-black text-emerald-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {districtOnlineCounts['Madeira'] || 0} Online
            </span>
          </div>

          {/* High-Definition Madeira Archipelago Vector Shape */}
          <div className="w-full h-20 sm:h-28 flex items-center justify-center">
            <svg viewBox="0 0 320 180" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(251,113,133,0.45)]">
              <path
                d={MADEIRA_DETAILED_PATH}
                fill="url(#grad-madeira)"
                stroke="#fb7185"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* FLOATING CYBERPUNK HUD TOOLTIP & QUICK ACTION */}
      <div className="mt-4 w-full max-w-xl animate-rise">
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 p-4 sm:p-5 backdrop-blur-2xl shadow-2xl shadow-black/80">
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
