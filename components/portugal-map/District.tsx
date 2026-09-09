'use client'

import React, { memo } from 'react'
import type { DistrictMapItem } from '@/lib/district-map-data'
import { cn } from '@/lib/utils'

export interface DistrictProps {
  district: DistrictMapItem
  isSelected: boolean
  isHovered: boolean
  onClick: (district: DistrictMapItem) => void
  onHover: (district: DistrictMapItem | null, event?: React.MouseEvent) => void
  viewMode?: 'mapa' | 'ranking' | 'atividade' | 'jogadores'
}

/**
 * Retorna as cores de estilo tático baseado na classificação nacional e estado
 */
function getDistrictStyle(district: DistrictMapItem, isSelected: boolean, isHovered: boolean) {
  const { pos, onlineNow, activePlayers } = district

  // 1. Estado Selecionado: Ciano Brilhante Neon (Destaque Máximo de Foco)
  if (isSelected) {
    return {
      fill: 'url(#grad-selected)',
      stroke: '#ffffff',
      strokeWidth: 2.8,
      filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))',
      opacity: 1,
      cursor: 'pointer',
    }
  }

  // 2. Estado Hover: Destaque de Iluminação Imediata
  if (isHovered) {
    return {
      fill: 'url(#grad-hover)',
      stroke: '#ffffff',
      strokeWidth: 2.4,
      filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))',
      opacity: 1,
      cursor: 'pointer',
    }
  }

  // 3. Posição #1: Ouro Imperial com Destaque Máximo
  if (pos === 1) {
    return {
      fill: 'url(#grad-podium-gold)',
      stroke: '#fef08a',
      strokeWidth: 2.2,
      filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))',
      opacity: 0.98,
      cursor: 'pointer',
    }
  }

  // 4. Posições #2 e #3: Prata e Bronze
  if (pos === 2) {
    return {
      fill: 'url(#grad-podium-silver)',
      stroke: '#f8fafc',
      strokeWidth: 1.8,
      filter: undefined,
      opacity: 0.95,
      cursor: 'pointer',
    }
  }

  if (pos === 3) {
    return {
      fill: 'url(#grad-podium-bronze)',
      stroke: '#fed7aa',
      strokeWidth: 1.8,
      filter: undefined,
      opacity: 0.95,
      cursor: 'pointer',
    }
  }

  // 5. Posições #4 a #8: Vanguarda Nacional (Ciano Estratégico)
  if (pos <= 8) {
    return {
      fill: 'url(#grad-vanguard)',
      stroke: 'rgba(56, 189, 248, 0.65)',
      strokeWidth: 1.6,
      filter: undefined,
      opacity: 0.92,
      cursor: 'pointer',
    }
  }

  // 6. Posições #9 a #14: Batalhão Central (Azul Tático)
  if (pos <= 14) {
    return {
      fill: 'url(#grad-tactical-mid)',
      stroke: 'rgba(148, 163, 184, 0.45)',
      strokeWidth: 1.4,
      filter: undefined,
      opacity: 0.88,
      cursor: 'pointer',
    }
  }

  // 7. Posições #15 a #20: Força Base (Ardósia Estratégica)
  return {
    fill: 'url(#grad-tactical-base)',
    stroke: 'rgba(100, 116, 139, 0.35)',
    strokeWidth: 1.2,
    filter: undefined,
    opacity: 0.82,
    cursor: 'pointer',
  }
}

export const District = memo(function District({
  district,
  isSelected,
  isHovered,
  onClick,
  onHover,
  viewMode = 'mapa',
}: DistrictProps) {
  const style = getDistrictStyle(district, isSelected, isHovered)
  const isPodium = district.pos <= 3
  const [cx, cy] = district.centroid

  const accessibleLabel = `${district.name}, ${district.pos}º lugar no ranking nacional. ${district.activePlayers} jogadores registados, ${district.totalXp.toLocaleString('pt-PT')} XP.${district.onlineNow > 0 ? ` ${district.onlineNow} jogadores online.` : ''}`

  return (
    <g
      id={`district-group-${district.id}`}
      className="district-interactive-group transition-all duration-150"
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
      {/* 1. Base Geométrica com Fronteiras e Gradiente de Jogo */}
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
          transition: 'fill 0.15s ease, stroke 0.15s ease, stroke-width 0.15s ease',
        }}
      />

      {/* 2. Marcador Centroid: Badge de Ranking (#X) & Pulso Ativo */}
      {district.centroid && (
        <g
          transform={`translate(${cx}, ${cy})`}
          className="pointer-events-none select-none"
        >
          {/* Indicador de Jogadores Online no Distrito */}
          {district.onlineNow > 0 && (
            <circle
              r="7"
              fill="#10b981"
              opacity="0.3"
              className="animate-ping"
            />
          )}

          {/* Fundo do Badge */}
          <rect
            x={district.pos === 1 ? -16 : -13}
            y="-8"
            width={district.pos === 1 ? 32 : 26}
            height="16"
            rx="8"
            fill={
              isSelected
                ? '#0284c7'
                : isHovered
                  ? '#0369a1'
                  : district.pos === 1
                    ? '#b45309'
                    : district.pos === 2
                      ? '#475569'
                      : district.pos === 3
                        ? '#7c2d12'
                        : 'rgba(2, 6, 23, 0.88)'
            }
            stroke={isSelected || isHovered ? '#ffffff' : style.stroke}
            strokeWidth={isSelected ? 1.8 : 1.1}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.85))',
            }}
          />

          {/* Texto do Ranking (#1 com Coroa) */}
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize={district.pos === 1 ? '9' : '8.5'}
            fontWeight="900"
            fontFamily="var(--font-mono, monospace)"
            letterSpacing="-0.03em"
          >
            {district.pos === 1 ? '👑 #1' : `#${district.pos}`}
          </text>
        </g>
      )}
    </g>
  )
})
