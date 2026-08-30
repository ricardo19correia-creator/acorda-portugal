'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  PORTUGAL_GEO_DATA,
  type DistrictGeoItem,
} from '@/lib/portugal-geo-data'
import { Trophy, Flame, Sparkles, MapPin, Coins, Crown, Users, Zap, Compass, Shield } from 'lucide-react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { usePresence } from '@/components/presence-provider'
import { calculateLevelProgress } from '@/lib/progression'
import { cn } from '@/lib/utils'
import { subscribeRankings, computeDistrictStats } from '@/lib/rankings'

export type HeroDistrictStat = {
  name: string
  pos: number
  players: number
  xp: number
}

const ALL_20_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

export type DistrictTheme = {
  gradientId: string
  from: string
  to: string
  accent: string
  glowColor: string
  name: string
  label: string
}

export const DISTRICT_THEMES: Record<string, DistrictTheme> = {
  'Viana do Castelo': {
    gradientId: 'grad-viana',
    from: '#059669',
    to: '#10b981',
    accent: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    name: 'Viana do Castelo',
    label: 'Alto Minho',
  },
  'Braga': {
    gradientId: 'grad-braga',
    from: '#7c3aed',
    to: '#8b5cf6',
    accent: '#c084fc',
    glowColor: 'rgba(139, 92, 246, 0.85)',
    name: 'Braga',
    label: 'Minho',
  },
  'Porto': {
    gradientId: 'grad-porto',
    from: '#1d4ed8',
    to: '#3b82f6',
    accent: '#60a5fa',
    glowColor: 'rgba(59, 130, 246, 0.9)',
    name: 'Porto',
    label: 'Grande Porto',
  },
  'Vila Real': {
    gradientId: 'grad-vilareal',
    from: '#d97706',
    to: '#f59e0b',
    accent: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.9)',
    name: 'Vila Real',
    label: 'Trás-os-Montes',
  },
  'Bragança': {
    gradientId: 'grad-braganca',
    from: '#b91c1c',
    to: '#ef4444',
    accent: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    name: 'Bragança',
    label: 'Nordeste',
  },
  'Aveiro': {
    gradientId: 'grad-aveiro',
    from: '#0891b2',
    to: '#06b6d4',
    accent: '#67e8f9',
    glowColor: 'rgba(6, 182, 212, 0.9)',
    name: 'Aveiro',
    label: 'Ria & Costa',
  },
  'Viseu': {
    gradientId: 'grad-viseu',
    from: '#4f46e5',
    to: '#6366f1',
    accent: '#a5b4fc',
    glowColor: 'rgba(99, 102, 241, 0.9)',
    name: 'Viseu',
    label: 'Beira Alta',
  },
  'Guarda': {
    gradientId: 'grad-guarda',
    from: '#ea580c',
    to: '#f97316',
    accent: '#fdba74',
    glowColor: 'rgba(249, 115, 22, 0.9)',
    name: 'Guarda',
    label: 'Serra da Estrela',
  },
  'Coimbra': {
    gradientId: 'grad-coimbra',
    from: '#65a30d',
    to: '#84cc16',
    accent: '#bef264',
    glowColor: 'rgba(132, 204, 22, 0.9)',
    name: 'Coimbra',
    label: 'Centro',
  },
  'Castelo Branco': {
    gradientId: 'grad-castelobranco',
    from: '#0284c7',
    to: '#0ea5e9',
    accent: '#7dd3fc',
    glowColor: 'rgba(14, 165, 233, 0.9)',
    name: 'Castelo Branco',
    label: 'Beira Baixa',
  },
  'Leiria': {
    gradientId: 'grad-leiria',
    from: '#0d9488',
    to: '#14b8a6',
    accent: '#5eead4',
    glowColor: 'rgba(20, 184, 166, 0.9)',
    name: 'Leiria',
    label: 'Oeste Litoral',
  },
  'Santarém': {
    gradientId: 'grad-santarem',
    from: '#c026d3',
    to: '#d946ef',
    accent: '#f0abfc',
    glowColor: 'rgba(217, 70, 239, 0.9)',
    name: 'Santarém',
    label: 'Ribatejo',
  },
  'Lisboa': {
    gradientId: 'grad-lisboa',
    from: '#ca8a04',
    to: '#eab308',
    accent: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.95)',
    name: 'Lisboa',
    label: 'Capital',
  },
  'Portalegre': {
    gradientId: 'grad-portalegre',
    from: '#16a34a',
    to: '#22c55e',
    accent: '#86efac',
    glowColor: 'rgba(34, 197, 94, 0.9)',
    name: 'Portalegre',
    label: 'Alto Alentejo',
  },
  'Setúbal': {
    gradientId: 'grad-setubal',
    from: '#2563eb',
    to: '#3b82f6',
    accent: '#93c5fd',
    glowColor: 'rgba(59, 130, 246, 0.9)',
    name: 'Setúbal',
    label: 'Península',
  },
  'Évora': {
    gradientId: 'grad-evora',
    from: '#e11d48',
    to: '#f43f5e',
    accent: '#fda4af',
    glowColor: 'rgba(244, 63, 94, 0.9)',
    name: 'Évora',
    label: 'Alentejo Central',
  },
  'Beja': {
    gradientId: 'grad-beja',
    from: '#c2410c',
    to: '#ea580c',
    accent: '#fdba74',
    glowColor: 'rgba(234, 88, 12, 0.9)',
    name: 'Beja',
    label: 'Baixo Alentejo',
  },
  'Faro': {
    gradientId: 'grad-faro',
    from: '#059669',
    to: '#0d9488',
    accent: '#6ee7b7',
    glowColor: 'rgba(13, 148, 136, 0.9)',
    name: 'Faro',
    label: 'Algarve',
  },
  'Açores': {
    gradientId: 'grad-acores',
    from: '#0284c7',
    to: '#06b6d4',
    accent: '#67e8f9',
    glowColor: 'rgba(6, 182, 212, 0.95)',
    name: 'Açores',
    label: 'Região Autónoma',
  },
  'Madeira': {
    gradientId: 'grad-madeira',
    from: '#16a34a',
    to: '#22c55e',
    accent: '#86efac',
    glowColor: 'rgba(34, 197, 94, 0.95)',
    name: 'Madeira',
    label: 'Região Autónoma',
  },
}

export function PortugalHeroMap() {
  const { user, profile } = useAuth()
  const { districtDistribution, activeUsers, onlineCount } = usePresence()

  const districtOnlineCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of ALL_20_DISTRICTS) {
      counts[d] = districtDistribution[d]?.total || 0
    }
    return counts
  }, [districtDistribution])

  const [districtData, setDistrictData] = useState<Map<string, HeroDistrictStat>>(new Map())
  const [topPlayer, setTopPlayer] = useState<{ name: string; xp: number; level: number } | null>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => profile?.district || 'Lisboa')
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 12, rotateY: -2 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen to unified publicProfiles and botPlayers for real district statistics
  useEffect(() => {
    const unsubscribe = subscribeRankings(
      'all',
      'xp',
      (allPlayers) => {
        // 1. Integrar jogador atual autenticado se ainda não constar na lista
        let unifiedList = [...allPlayers]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasUser = unifiedList.some((p) => p.uid === user.uid)
          if (!hasUser) {
            unifiedList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || undefined,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              region: userDistrict,
              title: profile.equippedTitle || calculateLevelProgress(userXp).currentLevel.title,
              playerType: 'human',
              isNpc: false,
            })
          }
        }

        // 2. Definir Top Player Geral
        const top = unifiedList[0]
          ? {
              name: unifiedList[0].displayName,
              xp: unifiedList[0].xp,
              level: unifiedList[0].level,
            }
          : null
        setTopPlayer(top)

        // 3. Agregação Distrital Exata:
        // XP_Distrito = SUM(publicProfiles.xp) + SUM(botPlayers.xp)
        // Jogadores_Distrito = COUNT(humanos) + COUNT(bots)
        const statsMap = computeDistrictStats(unifiedList)
        const heroStatsMap = new Map<string, HeroDistrictStat>()

        statsMap.forEach((stat, districtName) => {
          heroStatsMap.set(districtName, {
            name: districtName,
            pos: stat.pos,
            players: stat.players,
            xp: stat.xp,
          })
        })

        setDistrictData(heroStatsMap)
      },
      500
    )

    return () => unsubscribe()
  }, [user?.uid, profile])

  // Identify top leading district
  const leadingDistrict = useMemo(() => {
    let topName = 'Lisboa'
    let maxRank = 999
    districtData.forEach((stat) => {
      if (stat.pos < maxRank) {
        maxRank = stat.pos
        topName = stat.name
      }
    })
    return { name: topName, stat: districtData.get(topName) }
  }, [districtData])

  const userDistrictName = useMemo(() => {
    return profile?.district || 'Vila Real'
  }, [profile])

  const userDistrictStat = useMemo(() => {
    return districtData.get(userDistrictName) || { name: userDistrictName, pos: 7, players: 0, xp: 0 }
  }, [districtData, userDistrictName])

  const activeDistrictStat = useMemo(() => {
    const target = hoveredDistrict || selectedDistrict || userDistrictName
    return districtData.get(target) || { name: target, pos: 1, players: 0, xp: 0 }
  }, [hoveredDistrict, selectedDistrict, userDistrictName, districtData])

  const mainlandDistricts = useMemo(
    () => PORTUGAL_GEO_DATA.filter((d) => d.type === 'mainland'),
    [],
  )
  const acoresDistrict = useMemo(
    () => PORTUGAL_GEO_DATA.find((d) => d.name === 'Açores'),
    [],
  )
  const madeiraDistrict = useMemo(
    () => PORTUGAL_GEO_DATA.find((d) => d.name === 'Madeira'),
    [],
  )

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y })

    // Subtle 3D gyroscope tilt
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const deltaX = (x - centerX) / centerX
    const deltaY = (y - centerY) / centerY

    setTilt({
      rotateX: 12 - deltaY * 6,
      rotateY: -2 + deltaX * 6,
    })
  }

  const handleMouseLeave = () => {
    setHoveredDistrict(null)
    setTilt({ rotateX: 12, rotateY: -2 })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center select-none"
    >
      {/* ========================================================= */}
      {/* 3D HOLOGRAPHIC STAGE CONTAINER */}
      {/* ========================================================= */}
      <div className="relative w-full aspect-[0.96/1] sm:aspect-[1.02/1] flex items-center justify-center [perspective:1400px]">
        {/* Gaming Ambient Background Glows */}
        <div className="pointer-events-none absolute inset-[10%] rounded-full bg-primary/25 blur-[100px] animate-pulse-glow" />
        <div className="pointer-events-none absolute inset-[22%] rounded-full bg-gold/18 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-60 w-60 rounded-full bg-flag-red/20 blur-[100px]" />

        {/* 3D Holo Floor Grid Underneath */}
        <div
          className="pointer-events-none absolute inset-x-6 bottom-4 h-64 opacity-40 transition-transform duration-500 ease-out"
          style={{
            transform: `rotateX(${tilt.rotateX + 45}deg) rotateY(${tilt.rotateY}deg) translateZ(-60px)`,
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 162, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 162, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          }}
        />

        {/* Tactical Holographic Orbit Rings */}
        <div className="pointer-events-none absolute inset-2 rounded-full border border-primary/20 animate-spin-slow opacity-40" />
        <div className="pointer-events-none absolute inset-12 rounded-full border border-dashed border-gold/25 animate-spin-reverse opacity-35" />

        {/* ========================================================= */}
        {/* 3D VIDEO-GAME VECTOR MAP SVG */}
        {/* ========================================================= */}
        <div
          className="relative z-10 w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) rotateZ(-1deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            viewBox="0 0 760 850"
            className="w-full h-full filter drop-shadow-[0_30px_50px_rgba(0,0,0,0.85)]"
          >
            <defs>
              {/* Vibrant Video-Game Gradients for Each District */}
              {Object.values(DISTRICT_THEMES).map((t) => (
                <linearGradient key={t.gradientId} id={t.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={t.from} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={t.to} stopOpacity="1" />
                </linearGradient>
              ))}

              {/* Special Glow Filters */}
              <filter id="game-glow-hover" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#ffffff" floodOpacity="0.95" />
              </filter>
              <filter id="game-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#fbbf24" floodOpacity="0.95" />
              </filter>
              <filter id="game-glow-player" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#34d399" floodOpacity="0.95" />
              </filter>

              {/* 3D Extrusion Shadow Gradients */}
              <linearGradient id="extrusion-depth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0b1712" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030805" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* LAYER 0: MECHATRONIC CYBERNETIC CIRCUITS & DATA CONDUITS */}
            <g id="layer-mechatronic-base" className="pointer-events-none opacity-60">
              {/* Sci-Fi Data Bus Lines between Hubs */}
              <path
                d="M 236 138 L 472 135 L 536 295 L 360 495 L 398 720"
                fill="none"
                stroke="#00ffa2"
                strokeWidth="1.2"
                strokeDasharray="4 8"
                strokeOpacity="0.5"
              />
              <path
                d="M 136 138 L 472 135 M 116 630 L 360 495"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeDasharray="3 6"
                strokeOpacity="0.4"
              />
              {/* Cybernetic Docking Clamps / Base Plate */}
              <rect
                x="320"
                y="805"
                width="160"
                height="12"
                rx="6"
                fill="#030805"
                stroke="rgba(0, 255, 162, 0.4)"
                strokeWidth="1.5"
              />
              <circle cx="340" cy="811" r="3" fill="#00ffa2" />
              <circle cx="460" cy="811" r="3" fill="#00ffa2" />
            </g>

            {/* LAYER 1: 3D EXTRUSION BASE LAYER (Deep Volumetric Shadow & Bevel) */}
            <g id="layer-3d-extrusion-deep" transform="translate(8, 26)" className="opacity-90 pointer-events-none">
              {mainlandDistricts.map((district) => (
                <path
                  key={`deep-${district.name}`}
                  d={district.path}
                  fill="#030805"
                  stroke="#0f261d"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              ))}
            </g>

            {/* LAYER 2: 3D EXTRUSION MID LAYER (Volume Rim) */}
            <g id="layer-3d-extrusion-mid" transform="translate(4, 13)" className="opacity-95 pointer-events-none">
              {mainlandDistricts.map((district) => {
                const theme = DISTRICT_THEMES[district.name] || DISTRICT_THEMES['Lisboa']
                return (
                  <path
                    key={`mid-${district.name}`}
                    d={district.path}
                    fill={theme.from}
                    fillOpacity="0.4"
                    stroke={theme.to}
                    strokeOpacity="0.6"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                )
              })}
            </g>

            {/* LAYER 3: TOP INTERACTIVE GAME SURFACE (18 Colorful Vibrant Districts) */}
            <g id="layer-3d-surface">
              {mainlandDistricts.map((district) => {
                const isHovered = hoveredDistrict === district.name
                const isSelected = selectedDistrict === district.name
                const isPlayer = userDistrictName === district.name
                const stat = districtData.get(district.name)
                const isTop1 = (stat && stat.pos === 1) || (!stat && district.name === leadingDistrict.name)

                const theme = DISTRICT_THEMES[district.name] || DISTRICT_THEMES['Lisboa']

                let fill = `url(#${theme.gradientId})`
                let stroke = 'rgba(255, 255, 255, 0.45)'
                let strokeWidth = 1.6
                let filter = undefined
                let transform = undefined

                if (isHovered) {
                  stroke = '#ffffff'
                  strokeWidth = 3.2
                  filter = 'url(#game-glow-hover)'
                  transform = 'translate(-3, -8) scale(1.02)'
                } else if (isTop1) {
                  stroke = '#fde047'
                  strokeWidth = 2.8
                  filter = 'url(#game-glow-gold)'
                } else if (isPlayer) {
                  stroke = '#34d399'
                  strokeWidth = 2.6
                  filter = 'url(#game-glow-player)'
                } else if (isSelected) {
                  stroke = '#ffffff'
                  strokeWidth = 2.4
                  transform = 'translate(-2, -5)'
                }

                return (
                  <g
                    key={district.name}
                    transform={transform}
                    style={{
                      transformOrigin: `${district.centroid[0]}px ${district.centroid[1]}px`,
                    }}
                    className="transition-all duration-200 cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setHoveredDistrict(district.name)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    onClick={() => setSelectedDistrict(district.name)}
                  >
                    <path
                      d={district.path}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={filter}
                      className={cn(
                        'transition-all duration-200',
                        isHovered && 'brightness-125 saturate-125',
                      )}
                    />
                  </g>
                )
              })}
            </g>

            {/* LAYER 3.5: ACCURATE COMPACT DISTRICT LABELS & LIVE ONLINE PRESENCE INDICATORS */}
            <g id="layer-district-labels" className="pointer-events-none">
              {mainlandDistricts.map((district) => {
                const onlineCount = districtOnlineCounts[district.name] || 0
                return (
                  <g
                    key={`label-${district.name}`}
                    transform={`translate(${district.centroid[0]}, ${district.centroid[1]})`}
                  >
                    {/* Live Online Pulsing Radar Dot */}
                    {onlineCount > 0 && (
                      <g transform="translate(0, -9)">
                        <circle r="7" fill="#10b981" opacity="0.45" className="animate-ping" />
                        <circle r="3" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
                      </g>
                    )}
                    {/* Compact Clean District Name */}
                    <text
                      x="0"
                      y={onlineCount > 0 ? 6 : 1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-display text-[8px] sm:text-[9px] font-bold fill-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] select-none uppercase tracking-wider"
                    >
                      {district.name}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* ========================================================= */}
            {/* 3D SATELLITE PODS: AÇORES & MADEIRA (Gaming Radar Platforms) */}
            {/* ========================================================= */}
            {/* AÇORES POD (Northwest) */}
            {acoresDistrict && (
              <g
                id="holo-acores-pod"
                className="cursor-pointer pointer-events-auto transition-all duration-200"
                onMouseEnter={() => setHoveredDistrict('Açores')}
                onMouseLeave={() => setHoveredDistrict(null)}
                onClick={() => setSelectedDistrict('Açores')}
              >
                {/* Pod 3D Base Shadow */}
                <rect
                  x="20"
                  y="68"
                  width="220"
                  height="160"
                  rx="20"
                  fill="#030805"
                  className="pointer-events-none opacity-80"
                />
                {/* Pod Main Plate */}
                <rect
                  x="16"
                  y="58"
                  width="220"
                  height="160"
                  rx="20"
                  fill="rgba(10, 25, 35, 0.85)"
                  stroke={
                    hoveredDistrict === 'Açores' || selectedDistrict === 'Açores'
                      ? '#38bdf8'
                      : userDistrictName === 'Açores'
                        ? '#34d399'
                        : 'rgba(56, 189, 248, 0.5)'
                  }
                  strokeWidth="1.8"
                  filter={
                    hoveredDistrict === 'Açores' || selectedDistrict === 'Açores'
                      ? 'url(#game-glow-hover)'
                      : userDistrictName === 'Açores'
                        ? 'url(#game-glow-player)'
                        : undefined
                  }
                  className="backdrop-blur-md transition-all duration-200"
                />
                <text
                  x="34"
                  y="84"
                  fill="#38bdf8"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="2.5"
                >
                  AÇORES
                </text>
                <text
                  x="34"
                  y="98"
                  fill="rgba(255, 255, 255, 0.65)"
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1"
                >
                  9 ILHAS • REG. AUTÓNOMA
                </text>

                {/* Online Indicator Badge */}
                <g transform="translate(180, 80)">
                  <rect
                    x="-32"
                    y="-9"
                    width="64"
                    height="18"
                    rx="9"
                    fill="rgba(56, 189, 248, 0.2)"
                    stroke="rgba(56, 189, 248, 0.6)"
                    strokeWidth="1"
                  />
                  <circle cx="-20" cy="0" r="2.5" fill="#34d399" className="animate-pulse" />
                  <text
                    x="5"
                    y="0.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#38bdf8"
                    fontSize="8.5"
                    fontWeight="800"
                  >
                    {districtOnlineCounts['Açores'] || 0} Online
                  </text>
                </g>

                {/* 100% Centered 9 Islands without Overflow */}
                <g
                  transform="translate(120, 150) scale(0.85) translate(-152, -149)"
                  className={cn(
                    'transition-all duration-200',
                    hoveredDistrict === 'Açores' && 'brightness-125 saturate-125',
                  )}
                >
                  <path
                    d={acoresDistrict.path}
                    fill="url(#grad-acores)"
                    stroke={
                      hoveredDistrict === 'Açores' || selectedDistrict === 'Açores'
                        ? '#ffffff'
                        : userDistrictName === 'Açores'
                          ? '#34d399'
                          : 'rgba(255, 255, 255, 0.7)'
                    }
                    strokeWidth="1.6"
                    filter={hoveredDistrict === 'Açores' ? 'url(#game-glow-hover)' : undefined}
                    className="transition-all duration-200"
                  />
                </g>
              </g>
            )}

            {/* MADEIRA POD (Southwest) */}
            {madeiraDistrict && (
              <g
                id="holo-madeira-pod"
                className="cursor-pointer pointer-events-auto transition-all duration-200"
                onMouseEnter={() => setHoveredDistrict('Madeira')}
                onMouseLeave={() => setHoveredDistrict(null)}
                onClick={() => setSelectedDistrict('Madeira')}
              >
                {/* Pod 3D Base Shadow */}
                <rect
                  x="20"
                  y="525"
                  width="200"
                  height="235"
                  rx="20"
                  fill="#030805"
                  className="pointer-events-none opacity-80"
                />
                {/* Pod Main Plate */}
                <rect
                  x="16"
                  y="515"
                  width="200"
                  height="235"
                  rx="20"
                  fill="rgba(10, 30, 20, 0.85)"
                  stroke={
                    hoveredDistrict === 'Madeira' || selectedDistrict === 'Madeira'
                      ? '#4ade80'
                      : userDistrictName === 'Madeira'
                        ? '#34d399'
                        : 'rgba(74, 222, 128, 0.5)'
                  }
                  strokeWidth="1.8"
                  filter={
                    hoveredDistrict === 'Madeira' || selectedDistrict === 'Madeira'
                      ? 'url(#game-glow-hover)'
                      : userDistrictName === 'Madeira'
                        ? 'url(#game-glow-player)'
                        : undefined
                  }
                  className="backdrop-blur-md transition-all duration-200"
                />
                <text
                  x="34"
                  y="542"
                  fill="#4ade80"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="2.5"
                >
                  MADEIRA
                </text>
                <text
                  x="34"
                  y="556"
                  fill="rgba(255, 255, 255, 0.65)"
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1"
                >
                  ARQUIPÉLAGO • REG. AUTÓNOMA
                </text>

                {/* Online Indicator Badge */}
                <g transform="translate(160, 538)">
                  <rect
                    x="-32"
                    y="-9"
                    width="64"
                    height="18"
                    rx="9"
                    fill="rgba(74, 222, 128, 0.2)"
                    stroke="rgba(74, 222, 128, 0.6)"
                    strokeWidth="1"
                  />
                  <circle cx="-20" cy="0" r="2.5" fill="#34d399" className="animate-pulse" />
                  <text
                    x="5"
                    y="0.5"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#4ade80"
                    fontSize="8.5"
                    fontWeight="800"
                  >
                    {districtOnlineCounts['Madeira'] || 0} Online
                  </text>
                </g>

                {/* 100% Centered Madeira & Porto Santo without Overflow */}
                <g
                  transform="translate(112, 640) scale(1.05) translate(-104, -575)"
                  className={cn(
                    'transition-all duration-200',
                    hoveredDistrict === 'Madeira' && 'brightness-125 saturate-125',
                  )}
                >
                  <path
                    d={madeiraDistrict.path}
                    fill="url(#grad-madeira)"
                    stroke={
                      hoveredDistrict === 'Madeira' || selectedDistrict === 'Madeira'
                        ? '#ffffff'
                        : userDistrictName === 'Madeira'
                          ? '#34d399'
                          : 'rgba(255, 255, 255, 0.7)'
                    }
                    strokeWidth="1.6"
                    filter={hoveredDistrict === 'Madeira' ? 'url(#game-glow-hover)' : undefined}
                    className="transition-all duration-200"
                  />
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Dynamic Hover Tooltip HUD (Desktop only) */}
        {hoveredDistrict && (
          <div
            className="hidden lg:block pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: Math.max(120, Math.min(mousePos.x, 420)),
              top: Math.max(80, mousePos.y - 15),
            }}
          >
            <div className="rounded-2xl border border-white/20 bg-card/95 p-3.5 backdrop-blur-2xl shadow-2xl animate-rise text-left min-w-[190px]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shadow-sm"
                    style={{
                      backgroundColor:
                        DISTRICT_THEMES[activeDistrictStat.name]?.accent || '#34d399',
                    }}
                  />
                  <span className="font-display text-sm font-black text-foreground">
                    {activeDistrictStat.name}
                  </span>
                </div>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-black text-gold border border-gold/30">
                  #{activeDistrictStat.pos}
                </span>
              </div>
              <div className="mt-2.5 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Jogadores:</span>
                  <strong className="text-foreground font-bold">
                    {activeDistrictStat.players.toLocaleString('pt-PT')}
                  </strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Em Direto:</span>
                  <strong className="text-emerald-400 font-bold">
                    {(districtOnlineCounts[activeDistrictStat.name] || 0)} Online
                  </strong>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>XP Acumulado:</span>
                  <strong className="text-primary font-bold">
                    {activeDistrictStat.xp.toLocaleString('pt-PT')} XP
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
