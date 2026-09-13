'use client'

import React, { memo } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { cn } from '@/lib/utils'

export interface DistrictProps {
  district: DistrictMapItem
  isSelected: boolean
  isHovered: boolean
  hasSelection?: boolean
  showAllMarkers?: boolean
  onClick: (district: DistrictMapItem) => void
  onHover: (district: DistrictMapItem | null, event?: React.MouseEvent) => void
  viewMode?: 'mapa' | 'ranking' | 'atividade' | 'jogadores'
}

/**
 * Retorna as especificações de estilo e material tático baseado na classificação e no estado
 */
function getDistrictStyle(
  district: DistrictMapItem,
  isSelected: boolean,
  isHovered: boolean,
  hasSelection: boolean
) {
  const { pos } = district

  // 1. Estado Selecionado: Ciano Laser Neon (Foco Supremo)
  if (isSelected) {
    return {
      fill: 'url(#grad-selected)',
      stroke: '#ffffff',
      strokeWidth: 2.8,
      filter: 'drop-shadow(0 0 16px rgba(34, 211, 238, 0.95))',
      opacity: 1,
      elevation: 14,
    }
  }

  // 2. Estado Hover: Iluminação Imediata e Aresta Laser
  if (isHovered) {
    return {
      fill: 'url(#grad-hover)',
      stroke: '#67e8f9',
      strokeWidth: 2.4,
      filter: 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.85))',
      opacity: 1,
      elevation: 10,
    }
  }

  // 3. Quando outro distrito está selecionado: suavizar vizinhança sem apagar
  const baseOpacity = hasSelection ? 0.58 : 1

  // 4. Posição #1: Ouro Imperial
  if (pos === 1) {
    return {
      fill: 'url(#grad-podium-gold)',
      stroke: '#fef08a',
      strokeWidth: 2.2,
      filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.55))',
      opacity: baseOpacity,
      elevation: 12,
    }
  }

  // 5. Posição #2: Prata Tática
  if (pos === 2) {
    return {
      fill: 'url(#grad-podium-silver)',
      stroke: '#f8fafc',
      strokeWidth: 1.8,
      filter: 'drop-shadow(0 0 7px rgba(203, 213, 225, 0.35))',
      opacity: baseOpacity,
      elevation: 9.5,
    }
  }

  // 6. Posição #3: Bronze Nobre
  if (pos === 3) {
    return {
      fill: 'url(#grad-podium-bronze)',
      stroke: '#fed7aa',
      strokeWidth: 1.8,
      filter: 'drop-shadow(0 0 7px rgba(217, 119, 6, 0.35))',
      opacity: baseOpacity,
      elevation: 8,
    }
  }

  // 7. Posições #4 a #10: Vanguarda Nacional (Ciano Estratégico)
  if (pos <= 10) {
    return {
      fill: 'url(#grad-vanguard)',
      stroke: 'rgba(56, 189, 248, 0.55)',
      strokeWidth: 1.5,
      filter: 'drop-shadow(0 0 5px rgba(2, 132, 199, 0.25))',
      opacity: baseOpacity,
      elevation: 5,
    }
  }

  // 8. Posições #11 a #20: Base Territorial Tática (Ardósia / Obsidiana com contraste)
  return {
    fill: 'url(#grad-tactical-base)',
    stroke: 'rgba(56, 189, 248, 0.28)',
    strokeWidth: 1.2,
    filter: undefined,
    opacity: hasSelection ? 0.45 : 0.92,
    elevation: 2.5,
  }
}

export const District = memo(function District({
  district,
  isSelected,
  isHovered,
  hasSelection = false,
  showAllMarkers = false,
  onClick,
  onHover,
  viewMode = 'mapa',
}: DistrictProps) {
  const style = getDistrictStyle(district, isSelected, isHovered, hasSelection)
  const [cx, cy] = district.centroid

  // Regra Canónica de Ruído: apenas Top 5 mostram markers na vista geral normal.
  // Posições #6-#20 aparecem sob hover, foco, seleção ou zoom elevado.
  const isVisibleMarker =
    district.pos <= 5 || isHovered || isSelected || showAllMarkers

  const isTop1 = district.pos === 1
  const isTop2 = district.pos === 2
  const isTop3 = district.pos === 3

  const accessibleLabel = `${district.name}, ${district.pos}º lugar no ranking nacional. ${district.activePlayers} jogadores, ${district.totalXp.toLocaleString('pt-PT')} XP.${district.onlineNow > 0 ? ` ${district.onlineNow} jogadores online.` : ''}`

  return (
    <g
      id={`district-group-${district.id}`}
      className="district-interactive-group transition-all duration-200"
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      aria-pressed={isSelected}
      onClick={() => onClick(district)}
      onMouseEnter={(e) => onHover(district, e)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(district)}
      onBlur={() => onHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(district)
        }
      }}
      style={{ outline: 'none' }}
    >
      {/* 1. GEOMETRIA DO DISTRITO (POLÍGONO PRINCIPAL COM RELEVO & MATERIAIS) */}
      <path
        d={district.path}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{
          filter: style.filter,
          opacity: style.opacity,
          transition:
            'fill 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
        }}
      />

      {/* 2. REALCE SUPERIOR DE CHANFRO (Top Bevel Edge Light para sensação 3D) */}
      {(isHovered || isSelected || isTop1) && (
        <path
          d={district.path}
          fill="none"
          stroke={isSelected ? '#ffffff' : isHovered ? '#a5f3fc' : '#fef08a'}
          strokeWidth={isSelected ? 1.5 : 1.2}
          strokeOpacity={isSelected ? 0.9 : 0.65}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="pointer-events-none"
        />
      )}

      {/* 3. MARCADORES TÁTICOS CENTROID (Top 1 Pill Glass, Top 2-5 Badges, Pulsos Ativos) */}
      {district.centroid && (
        <g
          transform={`translate(${cx}, ${cy})`}
          className="pointer-events-none select-none transition-transform duration-200"
          style={{
            transform: `translate(${cx}px, ${cy}px) scale(${
              isSelected ? 1.2 : isHovered ? 1.15 : 1
            })`,
          }}
        >
          {/* Pulso de Jogadores Online no Distrito */}
          {district.onlineNow > 0 && (
            <g className="pointer-events-none">
              <circle
                r={isSelected ? 10 : 8}
                fill="#10b981"
                opacity={0.35}
                className="animate-ping"
              />
              <circle
                r={2.5}
                fill="#34d399"
                stroke="#064e3b"
                strokeWidth={0.8}
              />
            </g>
          )}

          {/* Marcador Top 1 de Alta Fidelidade (Pill Glass com Coroa Estilizada) */}
          {isTop1 && (
            <g
              transform="translate(0, -1)"
              className="transition-all duration-300"
            >
              {/* Brilho de Fundo Dourado com Respiração Suave */}
              <rect
                x="-22"
                y="-10"
                width="44"
                height="20"
                rx="10"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                opacity={0.5}
                className="animate-pulse"
              />

              {/* Corpo Pill Glass Ouro Imperial */}
              <rect
                x="-21"
                y="-9"
                width="42"
                height="18"
                rx="9"
                fill="rgba(15, 23, 42, 0.92)"
                stroke="#f59e0b"
                strokeWidth="1.6"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.65))',
                }}
              />

              {/* Ícone Coroa Estilizada Dourada */}
              <path
                d="M-13,-2.5 L-11,2 L-5,2 L-3,-2.5 L-6,-0.5 L-8,-4.5 L-10,-0.5 Z"
                fill="#f59e0b"
                stroke="#fef08a"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />

              {/* Rótulo #1 */}
              <text
                x="4"
                y="3.5"
                textAnchor="middle"
                fill="#fef08a"
                fontSize="9"
                fontWeight="900"
                fontFamily="var(--font-mono, monospace)"
                letterSpacing="-0.02em"
              >
                #1
              </text>
            </g>
          )}

          {/* Marcadores Top 2 e Top 3 (Pill Prata / Bronze de Elite) */}
          {(isTop2 || isTop3) && isVisibleMarker && (
            <g transform="translate(0, -1)">
              <rect
                x="-16"
                y="-8"
                width="32"
                height="16"
                rx="8"
                fill="rgba(15, 23, 42, 0.90)"
                stroke={isTop2 ? '#cbd5e1' : '#fb923c'}
                strokeWidth={1.4}
                style={{
                  filter: `drop-shadow(0 2px 6px ${
                    isTop2 ? 'rgba(203, 213, 225, 0.45)' : 'rgba(251, 146, 60, 0.45)'
                  })`,
                }}
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill={isTop2 ? '#f8fafc' : '#fed7aa'}
                fontSize="8.5"
                fontWeight="900"
                fontFamily="var(--font-mono, monospace)"
              >
                #{district.pos}
              </text>
            </g>
          )}

          {/* Marcadores Top 4 e Top 5 (ou restantes revelados no hover/select) */}
          {!isTop1 && !isTop2 && !isTop3 && isVisibleMarker && (
            <g transform="translate(0, -1)">
              <rect
                x="-14"
                y="-7.5"
                width="28"
                height="15"
                rx="7.5"
                fill={
                  isSelected
                    ? '#0284c7'
                    : isHovered
                      ? '#0369a1'
                      : 'rgba(15, 23, 42, 0.88)'
                }
                stroke={
                  isSelected
                    ? '#ffffff'
                    : isHovered
                      ? '#67e8f9'
                      : 'rgba(56, 189, 248, 0.5)'
                }
                strokeWidth={isSelected ? 1.6 : 1}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85))',
                }}
              />
              <text
                x="0"
                y="3.2"
                textAnchor="middle"
                fill={isSelected || isHovered ? '#ffffff' : '#38bdf8'}
                fontSize="8"
                fontWeight="800"
                fontFamily="var(--font-mono, monospace)"
              >
                #{district.pos}
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  )
})
