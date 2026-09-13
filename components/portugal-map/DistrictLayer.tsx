'use client'

import React, { memo } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { District } from './District'

export interface DistrictLayerProps {
  territories: DistrictMapItem[]
  selectedId: string | null
  hoveredId: string | null
  showAllMarkers?: boolean
  onSelectDistrict: (district: DistrictMapItem) => void
  onHoverDistrict: (district: DistrictMapItem | null, event?: React.MouseEvent) => void
  viewMode?: 'mapa' | 'ranking' | 'atividade' | 'jogadores'
}

/**
 * Calcula a altura em pixeis de extrusão 3D com base na posição do ranking
 */
function getElevation(pos: number, isSelected: boolean, isHovered: boolean): number {
  let base = 2.5
  if (pos === 1) base = 12
  else if (pos === 2) base = 9.5
  else if (pos === 3) base = 7.8
  else if (pos <= 10) base = 5
  else base = 2.5

  if (isSelected) return base + 3
  if (isHovered) return base + 1.5
  return base
}

export const DistrictLayer = memo(function DistrictLayer({
  territories,
  selectedId,
  hoveredId,
  showAllMarkers = false,
  onSelectDistrict,
  onHoverDistrict,
  viewMode = 'mapa',
}: DistrictLayerProps) {
  const mainlandTerritories = territories.filter((t) => t.type === 'mainland')
  const acores = territories.find((t) => t.id === 'acores')
  const madeira = territories.find((t) => t.id === 'madeira')

  const hasSelection = Boolean(selectedId)

  return (
    <g id="district-layer" className="select-none isolate">
      {/* ========================================================= */}
      {/* 1. DEFINIÇÕES SVG OTIMIZADAS (MATERIAIS, GLOWS & GRADIENTES) */}
      {/* ========================================================= */}
      <defs>
        {/* Pódio #1 Ouro Imperial com Nuances de Metal Nobre */}
        <linearGradient id="grad-podium-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        {/* Pódio #2 Prata Tática / Platina Escovada */}
        <linearGradient id="grad-podium-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Pódio #3 Bronze Nobre / Cobre Escovado */}
        <linearGradient id="grad-podium-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="35%" stopColor="#fed7aa" />
          <stop offset="70%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>

        {/* Vanguarda Top 4-10: Ciano Estratégico de Jogo */}
        <linearGradient id="grad-vanguard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Posições Base Top 11-20: Azul Ardósia / Obsidiana Tática */}
        <linearGradient id="grad-tactical-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="50%" stopColor="#102536" />
          <stop offset="100%" stopColor="#091522" />
        </linearGradient>

        {/* Iluminação de Seleção: Ciano Laser de Alta Intensidade */}
        <linearGradient id="grad-selected" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="30%" stopColor="#22d3ee" />
          <stop offset="75%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>

        {/* Iluminação de Hover Imediata */}
        <linearGradient id="grad-hover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Gradiente das Paredes de Extrusão 3D (Bisel Sombreado) */}
        <linearGradient id="grad-3d-wall-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#091b2e" />
          <stop offset="100%" stopColor="#030914" />
        </linearGradient>

        {/* Filtro de Glow Suave para a Costa Soberana de Portugal */}
        <filter id="coastline-laser-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Filtro de Glow Dourado para o Top 1 */}
        <filter id="gold-marker-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ========================================================= */}
      {/* 2. COSTA DE PORTUGAL CONTINENTAL (LASER EDGE SOBERANO) */}
      {/* ========================================================= */}
      <g id="mainland-sovereign-coastline" className="pointer-events-none">
        {/* Aura Oceânica de Profundidade */}
        {mainlandTerritories.map((t) => (
          <path
            key={`coast-aura-${t.id}`}
            d={t.path}
            fill="none"
            stroke="#00e5ff"
            strokeWidth="10"
            strokeOpacity="0.14"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ filter: 'url(#coastline-laser-glow)' }}
          />
        ))}

        {/* Contorno Laser da Costa */}
        {mainlandTerritories.map((t) => (
          <path
            key={`coast-line-${t.id}`}
            d={t.path}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
            strokeOpacity="0.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 3. SOMBRAS PROJETADAS 3D BASEADAS NA ELEVAÇÃO DO RANKING */}
      {/* ========================================================= */}
      <g id="mainland-depth-shadows" className="pointer-events-none">
        {mainlandTerritories.map((t) => {
          const isSel = selectedId === t.id
          const isHov = hoveredId === t.id
          const elev = getElevation(t.pos, isSel, isHov)
          const offsetY = Math.min(16, Math.max(3, elev * 1.15))
          const offsetX = Math.min(8, Math.max(2, elev * 0.45))

          return (
            <path
              key={`shadow-${t.id}`}
              d={t.path}
              transform={`translate(${offsetX}, ${offsetY})`}
              fill="#01060f"
              opacity={isSel ? 0.85 : 0.65}
              stroke="#01060f"
              strokeWidth={Math.max(2, elev * 0.4)}
              strokeLinejoin="round"
              style={{
                filter: `blur(${Math.min(6, Math.max(2, elev * 0.35))}px)`,
                transition: 'all 0.2s ease-out',
              }}
            />
          )
        })}
      </g>

      {/* ========================================================= */}
      {/* 4. PAREDES DE EXTRUSÃO 3D (PLATÔ ELEVADO COM BISEL SOMBREADO) */}
      {/* ========================================================= */}
      <g id="mainland-3d-extrusion-walls" className="pointer-events-none">
        {mainlandTerritories.map((t) => {
          const isSel = selectedId === t.id
          const isHov = hoveredId === t.id
          const elev = getElevation(t.pos, isSel, isHov)

          // Distritos do Top 10 e selecionados têm fatias visíveis de extrusão vertical
          if (elev < 4) return null

          const stepY = elev * 0.5
          const stepX = elev * 0.2

          return (
            <g key={`extrusion-${t.id}`} opacity={hasSelection && !isSel ? 0.4 : 0.85}>
              <path
                d={t.path}
                transform={`translate(${stepX}, ${stepY})`}
                fill="url(#grad-3d-wall-side)"
                stroke="#040c17"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ transition: 'all 0.2s ease-out' }}
              />
            </g>
          )
        })}
      </g>

      {/* ========================================================= */}
      {/* 5. OS 18 DISTRITOS CONTINENTAIS (SUPERFÍCIE SUPERIOR DE JOGO) */}
      {/* ========================================================= */}
      <g id="mainland-districts">
        {mainlandTerritories.map((district) => (
          <District
            key={district.id}
            district={district}
            isSelected={selectedId === district.id}
            isHovered={hoveredId === district.id}
            hasSelection={hasSelection}
            showAllMarkers={showAllMarkers}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        ))}
      </g>

      {/* ========================================================= */}
      {/* 6. REGIÃO AUTÓNOMA DOS AÇORES (GLASSMORPHISM INTEGRADO) */}
      {/* ========================================================= */}
      {acores && (
        <g id="inset-acores-wrapper" className="cursor-pointer group">
          {/* Sombra suave da placa glassmorphism */}
          <rect
            x="14"
            y="42"
            width="226"
            height="188"
            rx="20"
            fill="#01060f"
            opacity="0.45"
            transform="translate(2, 6)"
            style={{ filter: 'blur(6px)' }}
          />

          {/* Placa Glassmorphism Integrada (Sem caixa preta opaca nem tracejados) */}
          <rect
            x="14"
            y="42"
            width="226"
            height="188"
            rx="20"
            fill="rgba(6, 18, 34, 0.45)"
            stroke={
              selectedId === 'acores'
                ? '#22d3ee'
                : hoveredId === 'acores'
                  ? 'rgba(56, 189, 248, 0.65)'
                  : 'rgba(56, 189, 248, 0.2)'
            }
            strokeWidth={selectedId === 'acores' ? 2 : 1.2}
            style={{
              filter:
                selectedId === 'acores'
                  ? 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.45))'
                  : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.65))',
              transition: 'all 0.2s ease',
            }}
            onClick={() => onSelectDistrict(acores)}
          />

          {/* Badge de Cabeçalho Integrado dos Açores */}
          <g
            className="pointer-events-none select-none font-mono"
            onClick={() => onSelectDistrict(acores)}
          >
            {/* Pill do Nome */}
            <rect
              x="26"
              y="54"
              width="135"
              height="20"
              rx="10"
              fill="rgba(15, 23, 42, 0.85)"
              stroke={
                selectedId === 'acores'
                  ? '#22d3ee'
                  : 'rgba(56, 189, 248, 0.35)'
              }
              strokeWidth="1"
            />
            <text
              x="36"
              y="68"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="900"
              letterSpacing="0.08em"
            >
              🌊 AÇORES // 9 ILHAS
            </text>

            {/* Informação Rápida de Classificação */}
            <text
              x="28"
              y="87"
              fill="#94a3b8"
              fontSize="8"
              fontWeight="700"
              letterSpacing="0.04em"
            >
              POSIÇÃO #{acores.pos} • {acores.activePlayers} JOGADORES
            </text>
          </g>

          {/* Geometria Interativa das 9 Ilhas dos Açores */}
          <District
            district={acores}
            isSelected={selectedId === 'acores'}
            isHovered={hoveredId === 'acores'}
            hasSelection={hasSelection}
            showAllMarkers={showAllMarkers}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        </g>
      )}

      {/* ========================================================= */}
      {/* 7. REGIÃO AUTÓNOMA DA MADEIRA (GLASSMORPHISM INTEGRADO) */}
      {/* ========================================================= */}
      {madeira && (
        <g id="inset-madeira-wrapper" className="cursor-pointer group">
          {/* Sombra suave da placa glassmorphism */}
          <rect
            x="14"
            y="520"
            width="226"
            height="242"
            rx="20"
            fill="#01060f"
            opacity="0.45"
            transform="translate(2, 6)"
            style={{ filter: 'blur(6px)' }}
          />

          {/* Placa Glassmorphism Integrada (Sem caixa preta opaca nem tracejados) */}
          <rect
            x="14"
            y="520"
            width="226"
            height="242"
            rx="20"
            fill="rgba(6, 18, 34, 0.45)"
            stroke={
              selectedId === 'madeira'
                ? '#22d3ee'
                : hoveredId === 'madeira'
                  ? 'rgba(56, 189, 248, 0.65)'
                  : 'rgba(56, 189, 248, 0.2)'
            }
            strokeWidth={selectedId === 'madeira' ? 2 : 1.2}
            style={{
              filter:
                selectedId === 'madeira'
                  ? 'drop-shadow(0 0 16px rgba(6, 182, 212, 0.45))'
                  : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.65))',
              transition: 'all 0.2s ease',
            }}
            onClick={() => onSelectDistrict(madeira)}
          />

          {/* Badge de Cabeçalho Integrado da Madeira */}
          <g
            className="pointer-events-none select-none font-mono"
            onClick={() => onSelectDistrict(madeira)}
          >
            {/* Pill do Nome */}
            <rect
              x="26"
              y="532"
              width="145"
              height="20"
              rx="10"
              fill="rgba(15, 23, 42, 0.85)"
              stroke={
                selectedId === 'madeira'
                  ? '#22d3ee'
                  : 'rgba(56, 189, 248, 0.35)'
              }
              strokeWidth="1"
            />
            <text
              x="36"
              y="546"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="900"
              letterSpacing="0.08em"
            >
              🌺 MADEIRA // ILHAS
            </text>

            {/* Informação Rápida de Classificação */}
            <text
              x="28"
              y="565"
              fill="#94a3b8"
              fontSize="8"
              fontWeight="700"
              letterSpacing="0.04em"
            >
              POSIÇÃO #{madeira.pos} • {madeira.activePlayers} JOGADORES
            </text>
          </g>

          {/* Geometria Interativa da Madeira & Porto Santo */}
          <District
            district={madeira}
            isSelected={selectedId === 'madeira'}
            isHovered={hoveredId === 'madeira'}
            hasSelection={hasSelection}
            showAllMarkers={showAllMarkers}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        </g>
      )}
    </g>
  )
})

