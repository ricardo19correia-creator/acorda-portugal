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
        fillOpacity: 0.92,
        stroke: '#ffffff',
        strokeWidth: 2.8,
        filter: `drop-shadow(0 0 22px ${colorInfo.hex}) drop-shadow(0 0 8px #ffffff)`,
        glowColor: colorInfo.hex,
      }
    }

    if (isHovered) {
      return {
        fill: colorInfo.hex,
        fillOpacity: 0.8,
        stroke: '#ffffff',
        strokeWidth: 2.2,
        filter: `drop-shadow(0 0 18px ${colorInfo.hex})`,
        glowColor: colorInfo.hex,
      }
    }

    // Heatmap dinâmico baseado no XP da região
    const baseOpacity = xp === 0 ? 0.28 : 0.4 + ratio * 0.45
    const strokeOpacity = xp === 0 ? 0.5 : 0.8 + ratio * 0.2

    return {
      fill: colorInfo.hex,
      fillOpacity: baseOpacity,
      stroke: colorInfo.hex,
      strokeOpacity: strokeOpacity,
      strokeWidth: xp > 0 ? 1.5 : 1.1,
      filter: xp > 0 ? `drop-shadow(0 0 ${Math.max(5, ratio * 14)}px ${colorInfo.hex})` : undefined,
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

  // Dados das Regiões Autónomas
  const isAzoresSelected = selected.toLowerCase() === 'açores' || selected.toLowerCase() === 'acores'
  const isAzoresHovered = hovered?.name.toLowerCase() === 'açores'
  const azoresStats = districtStats.get('Açores')
  const azoresStyle = getDistrictStyle('Açores', isAzoresSelected, isAzoresHovered)

  const isMadeiraSelected = selected.toLowerCase() === 'madeira'
  const isMadeiraHovered = hovered?.name.toLowerCase() === 'madeira'
  const madeiraStats = districtStats.get('Madeira')
  const madeiraStyle = getDistrictStyle('Madeira', isMadeiraSelected, isMadeiraHovered)

  // Filtrar distritos continentais para a camada principal
  const mainlandDistricts = useMemo(() => {
    return PORTUGAL_GEO_DATA.filter((d) => d.type === 'mainland')
  }, [])

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
        {/* CAIXA HOLOGRÁFICA: AÇORES (AMPLIADA 4X • 9 ILHAS NÍTIDAS) */}
        {/* ========================================================= */}
        <g
          id="tactical-box-acores"
          className="cursor-pointer transition-all duration-300 group"
          role="button"
          tabIndex={0}
          aria-label="Região Autónoma dos Açores (9 Ilhas)"
          aria-pressed={isAzoresSelected}
          onClick={() => onSelect('Açores')}
          onMouseEnter={() =>
            setHovered({
              name: 'Açores',
              type: 'island',
              path: '',
              centroid: [130, 150],
            })
          }
          onFocus={() => {
            setHovered({
              name: 'Açores',
              type: 'island',
              path: '',
              centroid: [130, 150],
            })
            setMousePos({ x: 130, y: 150 })
          }}
          onBlur={() => setHovered(null)}
        >
          {/* Caixa Tática HUD com Chanfros */}
          <rect
            x="20"
            y="35"
            width="220"
            height="235"
            rx="18"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={isAzoresSelected ? '#14b8a6' : isAzoresHovered ? '#2dd4bf' : 'rgba(20, 184, 166, 0.45)'}
            strokeWidth={isAzoresSelected ? '2.8' : isAzoresHovered ? '2' : '1.3'}
            strokeDasharray={isAzoresSelected ? 'none' : '6 4'}
            filter={
              isAzoresSelected
                ? 'drop-shadow(0 0 25px rgba(20, 184, 166, 0.75))'
                : isAzoresHovered
                ? 'drop-shadow(0 0 15px rgba(20, 184, 166, 0.5))'
                : undefined
            }
          />

          {/* Chanfros HUD Militares nos Cantos */}
          <path
            d="M20 50 L35 35 M225 35 L240 50 M20 255 L35 270 M225 270 L240 255"
            stroke="#14b8a6"
            strokeWidth="2"
            fill="none"
          />

          {/* Sub-grelha tática interna */}
          <line x1="20" y1="90" x2="240" y2="90" stroke="rgba(20, 184, 166, 0.15)" strokeDasharray="3 3" />
          <line x1="20" y1="200" x2="240" y2="200" stroke="rgba(20, 184, 166, 0.15)" strokeDasharray="3 3" />
          <line x1="90" y1="35" x2="90" y2="270" stroke="rgba(20, 184, 166, 0.15)" strokeDasharray="3 3" />

          {/* Header da Mini-Tela */}
          <text
            x="32"
            y="56"
            fill="#14b8a6"
            fontSize="11"
            fontFamily="var(--font-mono), monospace"
            fontWeight="900"
            letterSpacing="0.12em"
          >
            [01] AÇORES (9 ILHAS)
          </text>
          <text
            x="32"
            y="70"
            fill="rgba(255, 255, 255, 0.6)"
            fontSize="8.5"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
          >
            {azoresStats?.xp ? `${azoresStats.xp.toLocaleString('pt-PT')} XP • #${azoresStats.pos} no País` : 'SETOR OCIDENTAL ATLÂNTICO'}
          </text>

          {/* ILHAS DOS AÇORES (AMPLIADAS 4X PARA MÁXIMA VISIBILIDADE) */}
          <g
            className="transition-all duration-300"
            style={{
              filter: azoresStyle.filter,
            }}
          >
            {/* 1. Corvo */}
            <path
              d="M58,64 C62,58 70,60 69,69 C67,75 60,75 57,69 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2"
            />
            <text x="50" y="58" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">Corvo</text>

            {/* 2. Flores */}
            <path
              d="M48,84 C54,76 66,78 65,92 C64,105 53,108 47,98 C43,91 44,85 48,84 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.2"
            />
            <text x="32" y="96" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">Flores</text>

            {/* 3. Graciosa */}
            <path
              d="M106,94 C111,86 123,88 124,96 C123,104 113,108 107,102 C104,98 104,96 106,94 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2"
            />
            <text x="100" y="86" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">Graciosa</text>

            {/* 4. Terceira */}
            <path
              d="M148,114 C158,102 180,106 182,120 C180,133 162,136 152,128 C146,122 146,116 148,114 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.4"
            />
            <text x="156" y="102" fill="rgba(20, 184, 166, 0.9)" fontSize="7.5" fontFamily="var(--font-mono), monospace" fontWeight="bold">Terceira</text>

            {/* 5. São Jorge */}
            <path
              d="M102,124 C112,116 138,112 152,116 C150,122 126,128 108,130 C102,128 100,126 102,124 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.2"
            />
            <text x="96" y="116" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">S. Jorge</text>

            {/* 6. Faial */}
            <path
              d="M82,136 C88,128 102,130 104,140 C102,150 90,154 82,146 C79,141 79,138 82,136 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.2"
            />
            <text x="64" y="142" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">Faial</text>

            {/* 7. Pico */}
            <path
              d="M105,145 C116,135 140,140 148,150 C144,160 120,164 108,156 C103,152 102,148 105,145 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.4"
            />
            <text x="124" y="166" fill="rgba(20, 184, 166, 0.9)" fontSize="7.5" fontFamily="var(--font-mono), monospace" fontWeight="bold">Pico</text>

            {/* 8. São Miguel */}
            <path
              d="M152,180 C166,166 200,164 218,172 C220,184 196,194 168,192 C156,189 150,185 152,180 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.5"
            />
            <text x="165" y="202" fill="rgba(20, 184, 166, 0.95)" fontSize="8" fontFamily="var(--font-mono), monospace" fontWeight="bold">São Miguel</text>

            {/* 9. Santa Maria */}
            <path
              d="M198,218 C206,210 220,214 220,224 C218,234 206,236 200,229 C196,224 196,220 198,218 Z"
              fill={azoresStyle.fill}
              fillOpacity={azoresStyle.fillOpacity}
              stroke={azoresStyle.stroke}
              strokeWidth="2.2"
            />
            <text x="180" y="244" fill="rgba(20, 184, 166, 0.8)" fontSize="7" fontFamily="var(--font-mono), monospace" fontWeight="bold">Santa Maria</text>
          </g>
        </g>

        {/* ========================================================= */}
        {/* CAIXA HOLOGRÁFICA: MADEIRA & PORTO SANTO (AMPLIADA 4X)    */}
        {/* ========================================================= */}
        <g
          id="tactical-box-madeira"
          className="cursor-pointer transition-all duration-300 group"
          role="button"
          tabIndex={0}
          aria-label="Região Autónoma da Madeira e Porto Santo"
          aria-pressed={isMadeiraSelected}
          onClick={() => onSelect('Madeira')}
          onMouseEnter={() =>
            setHovered({
              name: 'Madeira',
              type: 'island',
              path: '',
              centroid: [130, 650],
            })
          }
          onFocus={() => {
            setHovered({
              name: 'Madeira',
              type: 'island',
              path: '',
              centroid: [130, 650],
            })
            setMousePos({ x: 130, y: 650 })
          }}
          onBlur={() => setHovered(null)}
        >
          {/* Caixa Tática HUD com Chanfros */}
          <rect
            x="20"
            y="545"
            width="220"
            height="225"
            rx="18"
            fill="rgba(15, 23, 42, 0.9)"
            stroke={isMadeiraSelected ? '#06b6d4' : isMadeiraHovered ? '#38bdf8' : 'rgba(6, 182, 212, 0.45)'}
            strokeWidth={isMadeiraSelected ? '2.8' : isMadeiraHovered ? '2' : '1.3'}
            strokeDasharray={isMadeiraSelected ? 'none' : '6 4'}
            filter={
              isMadeiraSelected
                ? 'drop-shadow(0 0 25px rgba(6, 182, 212, 0.75))'
                : isMadeiraHovered
                ? 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.5))'
                : undefined
            }
          />

          {/* Chanfros HUD Militares nos Cantos */}
          <path
            d="M20 560 L35 545 M225 545 L240 560 M20 755 L35 770 M225 770 L240 755"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
          />

          {/* Sub-grelha tática interna */}
          <line x1="20" y1="600" x2="240" y2="600" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />
          <line x1="20" y1="710" x2="240" y2="710" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />
          <line x1="160" y1="545" x2="160" y2="770" stroke="rgba(6, 182, 212, 0.15)" strokeDasharray="3 3" />

          {/* Header da Mini-Tela */}
          <text
            x="32"
            y="566"
            fill="#06b6d4"
            fontSize="11"
            fontFamily="var(--font-mono), monospace"
            fontWeight="900"
            letterSpacing="0.12em"
          >
            [02] MADEIRA &amp; PORTO SANTO
          </text>
          <text
            x="32"
            y="580"
            fill="rgba(255, 255, 255, 0.6)"
            fontSize="8.5"
            fontFamily="var(--font-mono), monospace"
            fontWeight="700"
          >
            {madeiraStats?.xp ? `${madeiraStats.xp.toLocaleString('pt-PT')} XP • #${madeiraStats.pos} no País` : 'SETOR AUSTRAL ATLÂNTICO'}
          </text>

          {/* ILHAS DA MADEIRA (AMPLIADAS 4X PARA MÁXIMA VISIBILIDADE) */}
          <g
            className="transition-all duration-300"
            style={{
              filter: madeiraStyle.filter,
            }}
          >
            {/* 1. Ilha da Madeira (Principal, Ampla e Nítida) */}
            <path
              d="M45,652 C52,638 86,628 126,628 C158,629 184,640 186,649 C188,653 176,660 162,658 C150,666 122,678 84,678 C58,676 44,664 45,652 Z"
              fill={madeiraStyle.fill}
              fillOpacity={madeiraStyle.fillOpacity}
              stroke={madeiraStyle.stroke}
              strokeWidth="2.8"
            />
            <text x="80" y="660" fill="#ffffff" fontSize="9.5" fontFamily="var(--font-mono), monospace" fontWeight="900">ILHA DA MADEIRA</text>
            <text x="96" y="694" fill="rgba(6, 182, 212, 0.9)" fontSize="7.5" fontFamily="var(--font-mono), monospace" fontWeight="bold">Funchal</text>

            {/* 2. Ilha de Porto Santo (Nordeste) */}
            <path
              d="M172,582 C182,570 200,574 202,588 C198,600 182,604 174,594 C170,588 170,584 172,582 Z"
              fill={madeiraStyle.fill}
              fillOpacity={madeiraStyle.fillOpacity}
              stroke={madeiraStyle.stroke}
              strokeWidth="2.2"
            />
            <text x="156" y="574" fill="rgba(6, 182, 212, 0.95)" fontSize="8" fontFamily="var(--font-mono), monospace" fontWeight="bold">Porto Santo</text>

            {/* 3. Ilhas Desertas (Sudeste) */}
            <path
              d="M184,692 C188,688 194,696 192,710 C190,724 184,730 182,726 C180,720 182,698 184,692 Z"
              fill={madeiraStyle.fill}
              fillOpacity={madeiraStyle.fillOpacity}
              stroke={madeiraStyle.stroke}
              strokeWidth="2"
            />
            <text x="160" y="742" fill="rgba(6, 182, 212, 0.8)" fontSize="7.5" fontFamily="var(--font-mono), monospace" fontWeight="bold">Desertas</text>
          </g>
        </g>

        {/* ========================================================= */}
        {/* CAMADA DE DISTRITOS CONTINENTAIS (CORES VIVAS & HEATMAP)  */}
        {/* ========================================================= */}
        <g id="districts-tactical-mainland-layer">
          {mainlandDistricts.map((district) => {
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
        {/* LEGENDA HOLOGRÁFICA DO RADAR                              */}
        {/* ========================================================= */}
        <g transform="translate(32, 290)">
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
