'use client'

import React, { memo } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { District } from './District'

export interface DistrictLayerProps {
  territories: DistrictMapItem[]
  selectedId: string | null
  hoveredId: string | null
  onSelectDistrict: (district: DistrictMapItem) => void
  onHoverDistrict: (district: DistrictMapItem | null, event?: React.MouseEvent) => void
  viewMode?: 'mapa' | 'ranking' | 'atividade' | 'jogadores'
}

export const DistrictLayer = memo(function DistrictLayer({
  territories,
  selectedId,
  hoveredId,
  onSelectDistrict,
  onHoverDistrict,
  viewMode = 'mapa',
}: DistrictLayerProps) {
  const mainlandTerritories = territories.filter((t) => t.type === 'mainland')
  const acores = territories.find((t) => t.id === 'acores')
  const madeira = territories.find((t) => t.id === 'madeira')

  return (
    <g id="district-layer" className="select-none">
      {/* 1. DEFINIÇÕES SVG OTIMIZADAS (Zero bibliotecas externas, CSS nativo) */}
      <defs>
        {/* Pódio #1 Ouro Imperial */}
        <linearGradient id="grad-podium-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        {/* Pódio #2 Prata Tática */}
        <linearGradient id="grad-podium-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Pódio #3 Bronze Nobre */}
        <linearGradient id="grad-podium-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="45%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>

        {/* Vanguarda Top 4-8: Ciano Estratégico */}
        <linearGradient id="grad-vanguard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* Posições Intermédias Top 9-14: Azul Ardósia Estratégico */}
        <linearGradient id="grad-tactical-mid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="60%" stopColor="#0f1d30" />
          <stop offset="100%" stopColor="#08101a" />
        </linearGradient>

        {/* Posições Base Top 15-20: Azul Profundo Discreto */}
        <linearGradient id="grad-tactical-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#152438" />
          <stop offset="60%" stopColor="#0a1320" />
          <stop offset="100%" stopColor="#050a10" />
        </linearGradient>

        {/* Iluminação Hover */}
        <linearGradient id="grad-hover" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Destaque Selecionado */}
        <linearGradient id="grad-selected" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>

        {/* Caixa de Inset dos Arquipélagos */}
        <linearGradient id="inset-box-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#081b33" stopOpacity="0.82" />
          <stop offset="100%" stopColor="#020b17" stopOpacity="0.94" />
        </linearGradient>
      </defs>

      {/* 2. INSET DOS AÇORES (Topo-Esquerda: 9 Ilhas Autónomas) */}
      {acores && (
        <g id="inset-acores-wrapper" className="cursor-pointer">
          {/* Caixa Delimitadora Tática dos Açores */}
          <rect
            x="15"
            y="45"
            width="225"
            height="185"
            rx="14"
            fill="url(#inset-box-bg)"
            stroke={
              selectedId === 'acores'
                ? '#22d3ee'
                : hoveredId === 'acores'
                  ? 'rgba(56, 189, 248, 0.8)'
                  : 'rgba(56, 189, 248, 0.3)'
            }
            strokeWidth={selectedId === 'acores' ? 2.2 : 1.2}
            strokeDasharray={selectedId === 'acores' ? undefined : '4 4'}
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.85))',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onSelectDistrict(acores)}
          />

          {/* Rótulo Oficial da Região Autónoma */}
          <g className="pointer-events-none font-mono">
            <text
              x="28"
              y="68"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="900"
              letterSpacing="0.08em"
            >
              🌊 AÇORES // 9 ILHAS
            </text>
            <text
              x="28"
              y="80"
              fill="#94a3b8"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.04em"
            >
              REGIÃO AUTÓNOMA
            </text>
          </g>

          {/* Geometria Interativa dos Açores */}
          <District
            district={acores}
            isSelected={selectedId === 'acores'}
            isHovered={hoveredId === 'acores'}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        </g>
      )}

      {/* 3. INSET DA MADEIRA (Fundo-Esquerda: Madeira & Porto Santo) */}
      {madeira && (
        <g id="inset-madeira-wrapper" className="cursor-pointer">
          {/* Caixa Delimitadora Tática da Madeira */}
          <rect
            x="15"
            y="525"
            width="225"
            height="240"
            rx="14"
            fill="url(#inset-box-bg)"
            stroke={
              selectedId === 'madeira'
                ? '#22d3ee'
                : hoveredId === 'madeira'
                  ? 'rgba(56, 189, 248, 0.8)'
                  : 'rgba(56, 189, 248, 0.3)'
            }
            strokeWidth={selectedId === 'madeira' ? 2.2 : 1.2}
            strokeDasharray={selectedId === 'madeira' ? undefined : '4 4'}
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.85))',
              transition: 'all 0.15s ease',
            }}
            onClick={() => onSelectDistrict(madeira)}
          />

          {/* Rótulo Oficial da Região Autónoma */}
          <g className="pointer-events-none font-mono">
            <text
              x="28"
              y="548"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="900"
              letterSpacing="0.08em"
            >
              🌺 MADEIRA // ILHAS
            </text>
            <text
              x="28"
              y="560"
              fill="#94a3b8"
              fontSize="8"
              fontWeight="600"
              letterSpacing="0.04em"
            >
              MADEIRA & PORTO SANTO
            </text>
          </g>

          {/* Geometria Interativa da Madeira */}
          <District
            district={madeira}
            isSelected={selectedId === 'madeira'}
            isHovered={hoveredId === 'madeira'}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        </g>
      )}

      {/* 4. PORTUGAL CONTINENTAL (18 DISTRITOS) */}
      <g id="mainland-districts">
        {/* Base de Sombra Território (Efeito 3D Discreto e Realista) */}
        <g id="mainland-depth-shadow" className="pointer-events-none opacity-60">
          {mainlandTerritories.map((t) => (
            <path
              key={`shadow-${t.id}`}
              d={t.path}
              transform="translate(2.5, 4)"
              fill="#01060f"
              stroke="#01060f"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* Os 18 Distritos Oficiais Continentais */}
        {mainlandTerritories.map((district) => (
          <District
            key={district.id}
            district={district}
            isSelected={selectedId === district.id}
            isHovered={hoveredId === district.id}
            onClick={onSelectDistrict}
            onHover={onHoverDistrict}
            viewMode={viewMode}
          />
        ))}
      </g>
    </g>
  )
})
