'use client'

import React from 'react'
import type { PortugalTerritory } from '@/lib/portugal-territories'
import type { PortugalCity } from '@/lib/portugal-cities-data'
import type { DistrictWarTerritory } from '@/lib/district-war'

export type MapViewMode = 'mapa' | 'ranking' | 'atividade' | 'jogadores' | 'arena'

// Cores vivas, saturadas e individuais para cada um dos 18 distritos e 2 regiões
// Elimina COMPLETAMENTE qualquer cor cinzenta do mapa!
export const DISTRICT_VIBRANT_PALETTE: Record<
  string,
  {
    gradientStart: string
    gradientEnd: string
    border: string
    glow: string
    badgeText: string
  }
> = {
  lisboa: {
    gradientStart: '#f59e0b',
    gradientEnd: '#b45309',
    border: '#fde68a',
    glow: 'rgba(245, 158, 11, 0.75)',
    badgeText: '#fef3c7',
  },
  porto: {
    gradientStart: '#06b6d4',
    gradientEnd: '#0e7490',
    border: '#a5f3fc',
    glow: 'rgba(6, 182, 212, 0.75)',
    badgeText: '#cffafe',
  },
  braga: {
    gradientStart: '#10b981',
    gradientEnd: '#047857',
    border: '#a7f3d0',
    glow: 'rgba(16, 185, 129, 0.75)',
    badgeText: '#d1fae5',
  },
  aveiro: {
    gradientStart: '#8b5cf6',
    gradientEnd: '#6d28d9',
    border: '#ddd6fe',
    glow: 'rgba(139, 92, 246, 0.75)',
    badgeText: '#ede9fe',
  },
  coimbra: {
    gradientStart: '#3b82f6',
    gradientEnd: '#1d4ed8',
    border: '#bfdbfe',
    glow: 'rgba(59, 130, 246, 0.75)',
    badgeText: '#dbeafe',
  },
  faro: {
    gradientStart: '#f43f5e',
    gradientEnd: '#be123c',
    border: '#fecdd3',
    glow: 'rgba(244, 63, 94, 0.75)',
    badgeText: '#ffe4e6',
  },
  setubal: {
    gradientStart: '#14b8a6',
    gradientEnd: '#0f766e',
    border: '#99f6e4',
    glow: 'rgba(20, 184, 166, 0.75)',
    badgeText: '#ccfbf1',
  },
  leiria: {
    gradientStart: '#6366f1',
    gradientEnd: '#4338ca',
    border: '#c7d2fe',
    glow: 'rgba(99, 102, 241, 0.75)',
    badgeText: '#e0e7ff',
  },
  santarem: {
    gradientStart: '#f97316',
    gradientEnd: '#c2410c',
    border: '#fed7aa',
    glow: 'rgba(249, 115, 22, 0.75)',
    badgeText: '#ffedd5',
  },
  viseu: {
    gradientStart: '#84cc16',
    gradientEnd: '#4d7c0f',
    border: '#d9f99d',
    glow: 'rgba(132, 204, 22, 0.75)',
    badgeText: '#ecfccb',
  },
  viana_do_castelo: {
    gradientStart: '#0284c7',
    gradientEnd: '#0369a1',
    border: '#bae6fd',
    glow: 'rgba(2, 132, 199, 0.75)',
    badgeText: '#e0f2fe',
  },
  vila_real: {
    gradientStart: '#eab308',
    gradientEnd: '#a16207',
    border: '#fef08a',
    glow: 'rgba(234, 179, 8, 0.75)',
    badgeText: '#fef9c3',
  },
  braganca: {
    gradientStart: '#ef4444',
    gradientEnd: '#b91c1c',
    border: '#fecaca',
    glow: 'rgba(239, 68, 68, 0.75)',
    badgeText: '#fee2e2',
  },
  guarda: {
    gradientStart: '#d946ef',
    gradientEnd: '#a21caf',
    border: '#f5d0fe',
    glow: 'rgba(217, 70, 239, 0.75)',
    badgeText: '#fae8ff',
  },
  castelo_branco: {
    gradientStart: '#0ea5e9',
    gradientEnd: '#0369a1',
    border: '#bae6fd',
    glow: 'rgba(14, 165, 233, 0.75)',
    badgeText: '#e0f2fe',
  },
  portalegre: {
    gradientStart: '#d97706',
    gradientEnd: '#92400e',
    border: '#fde68a',
    glow: 'rgba(217, 119, 6, 0.75)',
    badgeText: '#fef3c7',
  },
  evora: {
    gradientStart: '#e11d48',
    gradientEnd: '#9f1239',
    border: '#fecdd3',
    glow: 'rgba(225, 29, 72, 0.75)',
    badgeText: '#ffe4e6',
  },
  beja: {
    gradientStart: '#c2410c',
    gradientEnd: '#7c2d12',
    border: '#fed7aa',
    glow: 'rgba(194, 65, 12, 0.75)',
    badgeText: '#ffedd5',
  },
  acores: {
    gradientStart: '#0d9488',
    gradientEnd: '#115e59',
    border: '#99f6e4',
    glow: 'rgba(13, 148, 136, 0.75)',
    badgeText: '#ccfbf1',
  },
  madeira: {
    gradientStart: '#0284c7',
    gradientEnd: '#1e40af',
    border: '#7dd3fc',
    glow: 'rgba(2, 132, 199, 0.75)',
    badgeText: '#e0f2fe',
  },
}

// Transformações matemáticas de enquadramento
// Mainland X: 272..648. Com translate(30, 20), situa-se em X: 302..678.
// Centro exato em X = 490 num canvas de 1000px de largura.
export const MAINLAND_CENTER_OFFSET = 'translate(30, 20)'

// Inset dos Açores (Top-Left): Box [X: 25..275, Y: 45..295]
// Açores centroid ~ [125, 150]. Frame center ~ [150, 175].
export const ACORES_INSET_TRANSFORM = 'translate(150, 175) scale(1.18) translate(-125, -150)'

// Inset da Madeira (Bottom-Left): Box [X: 25..275, Y: 535..815]
// Madeira centroid ~ [125, 650]. Frame center ~ [150, 675].
export const MADEIRA_INSET_TRANSFORM = 'translate(150, 675) scale(1.22) translate(-125, -650)'

// Desvios estratégicos para os rótulos das capitais de distrito (evita sobreposições e direciona cidades costeiras ao mar)
export const CAPITAL_LABEL_OFFSETS: Record<
  string,
  { label: string; dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }
> = {
  viana_do_castelo: { label: 'VIANA DO CASTELO', dx: -8, dy: -12, anchor: 'end' },
  braga:             { label: 'BRAGA',             dx: 14, dy: -6,  anchor: 'start' },
  porto:             { label: 'PORTO',             dx: -14, dy: -4, anchor: 'end' },
  vila_real:         { label: 'VILA REAL',         dx: 0,  dy: -12, anchor: 'middle' },
  braganca:          { label: 'BRAGANÇA',          dx: 0,  dy: -12, anchor: 'middle' },
  aveiro:            { label: 'AVEIRO',            dx: -14, dy: 0,  anchor: 'end' },
  viseu:             { label: 'VISEU',             dx: 0,  dy: -10, anchor: 'middle' },
  guarda:            { label: 'GUARDA',            dx: 10, dy: -6,  anchor: 'start' },
  coimbra:           { label: 'COIMBRA',           dx: -12, dy: 6,  anchor: 'end' },
  castelo_branco:    { label: 'CASTELO BRANCO',    dx: 0,  dy: 12,  anchor: 'middle' },
  leiria:            { label: 'LEIRIA',            dx: -14, dy: 0,  anchor: 'end' },
  santarem:          { label: 'SANTARÉM',          dx: 14, dy: 2,   anchor: 'start' },
  portalegre:        { label: 'PORTALEGRE',        dx: 12, dy: -4,  anchor: 'start' },
  lisboa:            { label: 'LISBOA',            dx: -16, dy: -4, anchor: 'end' },
  setubal:           { label: 'SETÚBAL',           dx: -14, dy: 8,  anchor: 'end' },
  evora:             { label: 'ÉVORA',             dx: 0,  dy: -10, anchor: 'middle' },
  beja:              { label: 'BEJA',              dx: 0,  dy: -10, anchor: 'middle' },
  faro:              { label: 'FARO',              dx: 0,  dy: 14,  anchor: 'middle' },
}

interface DefsProps {
  territories: PortugalTerritory[]
}

export function PortugalMapDefs({ territories }: DefsProps) {
  return (
    <defs>
      {/* 1. Gradientes Vívidos Individuais para cada território (Cores Saturadas de Jogo) */}
      {Object.entries(DISTRICT_VIBRANT_PALETTE).map(([id, p]) => (
        <linearGradient key={`grad-${id}`} id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.gradientStart} stopOpacity="0.98" />
          <stop offset="100%" stopColor={p.gradientEnd} stopOpacity="0.90" />
        </linearGradient>
      ))}

      {/* 2. Gradiente do Distrito Selecionado (Explosão Ciano Neon) */}
      <linearGradient id="grad-selected-surge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      {/* 3. Gradiente Pódio Ranking (Ouro, Prata, Bronze) */}
      <linearGradient id="grad-podium-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      <linearGradient id="grad-podium-silver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="50%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="grad-podium-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="50%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* 4. Caixas Táticas de Vidro para as Ilhas */}
      <linearGradient id="inset-tactical-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0a254d" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#03142d" stopOpacity="0.96" />
      </linearGradient>

      {/* 5. Grelha Tática e Filtros de Glow */}
      <pattern id="tactical-ocean-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.10)" strokeWidth="0.8" />
      </pattern>

      <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="selection-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.82  0 0 0 0 0.93  0 0 0 0.9 0" />
        <feComposite in="SourceGraphic" operator="over" />
      </filter>
    </defs>
  )
}

interface BackgroundDecorationsProps {
  viewBoxWidth?: number
  viewBoxHeight?: number
}

export function PortugalBackgroundAtmosphere({
  viewBoxWidth = 1000,
  viewBoxHeight = 860,
}: BackgroundDecorationsProps) {
  return (
    <g className="pointer-events-none select-none">
      {/* Grelha holográfica do oceano */}
      <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="url(#tactical-ocean-grid)" />

      {/* Contornos Batimétricos do Atlântico */}
      <g opacity="0.22" stroke="rgba(14, 165, 233, 0.45)" fill="none">
        <path d="M 0,220 C 180,240 320,180 440,260 C 520,310 460,450 420,520 C 380,600 460,700 500,860" strokeWidth="1.2" strokeDasharray="6 8" />
        <path d="M 0,430 C 140,440 260,400 360,470 C 420,510 390,630 400,760" strokeWidth="1" strokeDasharray="4 6" />
        <path d="M 0,660 C 120,650 240,690 340,740" strokeWidth="1" strokeDasharray="5 7" />
      </g>

      {/* Telemetria Marítima ZEE */}
      <g opacity="0.5" fontFamily="monospace" fontSize="9" fill="#38bdf8">
        <text x="30" y="445" letterSpacing="1.2">ATLÂNTICO // ZEE DE PORTUGAL</text>
        <text x="30" y="460" fill="#64748b">38° 42' N  9° 11' W • PLATAFORMA CONTINENTAL</text>
      </g>

      {/* Rosa dos Ventos Tática (Canto Inferior Direito) */}
      <g transform="translate(910, 780)" opacity="0.6">
        <circle r="34" fill="none" stroke="rgba(14, 165, 233, 0.35)" strokeWidth="1.2" />
        <circle r="24" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.8" strokeDasharray="2 3" />
        {/* Ponteiro Norte Dourado */}
        <polygon points="0,-34 5,-8 0,0 -5,-8" fill="#f59e0b" />
        <polygon points="0,34 5,8 0,0 -5,8" fill="#0284c7" />
        <polygon points="34,0 8,5 0,0 8,-5" fill="#0284c7" />
        <polygon points="-34,0 -8,5 0,0 -8,-5" fill="#0284c7" />
        <text x="0" y="-38" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="bold" fontFamily="monospace">
          N
        </text>
      </g>
    </g>
  )
}
