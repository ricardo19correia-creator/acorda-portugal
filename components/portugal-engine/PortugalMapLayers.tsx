'use client'

import React from 'react'
import type { PortugalTerritory } from '@/lib/portugal-territories'
import type { PortugalCity } from '@/lib/portugal-cities-data'
import type { DistrictWarTerritory } from '@/lib/district-war'

export type MapViewMode = 'mapa' | 'ranking' | 'atividade' | 'jogadores' | 'arena'

// =============================================================================
// 1. PALETA VIBRANTE & ILUMINAÇÃO NW 315° (CORES AAA SATURADAS DE JOGO NACIONAL)
// =============================================================================
export const DISTRICT_VIBRANT_PALETTE: Record<
  string,
  {
    highlight: string     // Luz NW (Topo-Esquerda)
    gradientStart: string // Corpo Médio Saturado
    gradientEnd: string   // Sombra SE (Fundo-Direita)
    border: string        // Contorno Nitidamente Branco/Luminoso
    glow: string
    badgeText: string
  }
> = {
  lisboa: {
    highlight: '#fbbf24',
    gradientStart: '#f59e0b',
    gradientEnd: '#b45309',
    border: '#ffffff',
    glow: 'rgba(245, 158, 11, 0.75)',
    badgeText: '#fef3c7',
  },
  porto: {
    highlight: '#22d3ee',
    gradientStart: '#06b6d4',
    gradientEnd: '#0e7490',
    border: '#ffffff',
    glow: 'rgba(6, 182, 212, 0.75)',
    badgeText: '#cffafe',
  },
  braga: {
    highlight: '#34d399',
    gradientStart: '#10b981',
    gradientEnd: '#047857',
    border: '#ffffff',
    glow: 'rgba(16, 185, 129, 0.75)',
    badgeText: '#d1fae5',
  },
  aveiro: {
    highlight: '#a78bfa',
    gradientStart: '#8b5cf6',
    gradientEnd: '#6d28d9',
    border: '#ffffff',
    glow: 'rgba(139, 92, 246, 0.75)',
    badgeText: '#ede9fe',
  },
  coimbra: {
    highlight: '#60a5fa',
    gradientStart: '#3b82f6',
    gradientEnd: '#1d4ed8',
    border: '#ffffff',
    glow: 'rgba(59, 130, 246, 0.75)',
    badgeText: '#dbeafe',
  },
  faro: {
    highlight: '#fb7185',
    gradientStart: '#f43f5e',
    gradientEnd: '#be123c',
    border: '#ffffff',
    glow: 'rgba(244, 63, 94, 0.75)',
    badgeText: '#ffe4e6',
  },
  setubal: {
    highlight: '#2dd4bf',
    gradientStart: '#14b8a6',
    gradientEnd: '#0f766e',
    border: '#ffffff',
    glow: 'rgba(20, 184, 166, 0.75)',
    badgeText: '#ccfbf1',
  },
  leiria: {
    highlight: '#818cf8',
    gradientStart: '#6366f1',
    gradientEnd: '#4338ca',
    border: '#ffffff',
    glow: 'rgba(99, 102, 241, 0.75)',
    badgeText: '#e0e7ff',
  },
  santarem: {
    highlight: '#fb923c',
    gradientStart: '#f97316',
    gradientEnd: '#c2410c',
    border: '#ffffff',
    glow: 'rgba(249, 115, 22, 0.75)',
    badgeText: '#ffedd5',
  },
  viseu: {
    highlight: '#a3e635',
    gradientStart: '#84cc16',
    gradientEnd: '#4d7c0f',
    border: '#ffffff',
    glow: 'rgba(132, 204, 22, 0.75)',
    badgeText: '#ecfccb',
  },
  viana_do_castelo: {
    highlight: '#38bdf8',
    gradientStart: '#0284c7',
    gradientEnd: '#0369a1',
    border: '#ffffff',
    glow: 'rgba(2, 132, 199, 0.75)',
    badgeText: '#e0f2fe',
  },
  vila_real: {
    highlight: '#fde047',
    gradientStart: '#eab308',
    gradientEnd: '#a16207',
    border: '#ffffff',
    glow: 'rgba(234, 179, 8, 0.75)',
    badgeText: '#fef9c3',
  },
  braganca: {
    highlight: '#f87171',
    gradientStart: '#ef4444',
    gradientEnd: '#b91c1c',
    border: '#ffffff',
    glow: 'rgba(239, 68, 68, 0.75)',
    badgeText: '#fee2e2',
  },
  guarda: {
    highlight: '#e879f9',
    gradientStart: '#d946ef',
    gradientEnd: '#a21caf',
    border: '#ffffff',
    glow: 'rgba(217, 70, 239, 0.75)',
    badgeText: '#fae8ff',
  },
  castelo_branco: {
    highlight: '#38bdf8',
    gradientStart: '#0ea5e9',
    gradientEnd: '#0369a1',
    border: '#ffffff',
    glow: 'rgba(14, 165, 233, 0.75)',
    badgeText: '#e0f2fe',
  },
  portalegre: {
    highlight: '#fbbf24',
    gradientStart: '#d97706',
    gradientEnd: '#92400e',
    border: '#ffffff',
    glow: 'rgba(217, 119, 6, 0.75)',
    badgeText: '#fef3c7',
  },
  evora: {
    highlight: '#fb7185',
    gradientStart: '#e11d48',
    gradientEnd: '#9f1239',
    border: '#ffffff',
    glow: 'rgba(225, 29, 72, 0.75)',
    badgeText: '#ffe4e6',
  },
  beja: {
    highlight: '#ea580c',
    gradientStart: '#c2410c',
    gradientEnd: '#7c2d12',
    border: '#ffffff',
    glow: 'rgba(194, 65, 12, 0.75)',
    badgeText: '#ffedd5',
  },
  acores: {
    highlight: '#2dd4bf',
    gradientStart: '#0d9488',
    gradientEnd: '#115e59',
    border: '#ffffff',
    glow: 'rgba(13, 148, 136, 0.75)',
    badgeText: '#ccfbf1',
  },
  madeira: {
    highlight: '#38bdf8',
    gradientStart: '#0284c7',
    gradientEnd: '#1e40af',
    border: '#ffffff',
    glow: 'rgba(2, 132, 199, 0.75)',
    badgeText: '#e0f2fe',
  },
}

// =============================================================================
// 2. ENQUADRAMENTO MATEMÁTICO — PORTUGAL CONTINENTAL CENTRADO (70-85% ÁREA ÚTIL)
// =============================================================================
export const MAINLAND_CENTER_OFFSET = 'translate(30, 20)'

export const ACORES_INSET_TRANSFORM = 'translate(150, 175) scale(1.18) translate(-125, -150)'
export const MADEIRA_INSET_TRANSFORM = 'translate(150, 675) scale(1.22) translate(-125, -650)'

// Desvios calibrados para os rótulos das capitais de distrito (anti-sobreposição)
export const CAPITAL_LABEL_OFFSETS: Record<
  string,
  { label: string; dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }
> = {
  viana_do_castelo: { label: 'VIANA DO CASTELO', dx: -8,  dy: -12, anchor: 'end' },
  braga:             { label: 'BRAGA',             dx: 14,  dy: -6,  anchor: 'start' },
  porto:             { label: 'PORTO',             dx: -14, dy: -4,  anchor: 'end' },
  vila_real:         { label: 'VILA REAL',         dx: 0,   dy: -12, anchor: 'middle' },
  braganca:          { label: 'BRAGANÇA',          dx: 0,   dy: -12, anchor: 'middle' },
  aveiro:            { label: 'AVEIRO',            dx: -14, dy: 0,   anchor: 'end' },
  viseu:             { label: 'VISEU',             dx: 0,   dy: -10, anchor: 'middle' },
  guarda:            { label: 'GUARDA',            dx: 10,  dy: -6,  anchor: 'start' },
  coimbra:           { label: 'COIMBRA',           dx: -12, dy: 6,   anchor: 'end' },
  castelo_branco:    { label: 'CASTELO BRANCO',    dx: 0,   dy: 12,  anchor: 'middle' },
  leiria:            { label: 'LEIRIA',            dx: -14, dy: 0,   anchor: 'end' },
  santarem:          { label: 'SANTARÉM',          dx: 14,  dy: 2,   anchor: 'start' },
  portalegre:        { label: 'PORTALEGRE',        dx: 12,  dy: -4,  anchor: 'start' },
  lisboa:            { label: 'LISBOA',            dx: -16, dy: -4,  anchor: 'end' },
  setubal:           { label: 'SETÚBAL',           dx: -14, dy: 8,   anchor: 'end' },
  evora:             { label: 'ÉVORA',             dx: 0,   dy: -10, anchor: 'middle' },
  beja:              { label: 'BEJA',              dx: 0,   dy: -10, anchor: 'middle' },
  faro:              { label: 'FARO',              dx: 0,   dy: 14,  anchor: 'middle' },
}

// =============================================================================
// 3. DEFINIÇÕES SVG (FILTROS 3D, SOMBRAS, GRADIENTES & ESTILOS DE ANIMAÇÃO)
// =============================================================================
interface DefsProps {
  territories: PortugalTerritory[]
}

export function PortugalMapDefs({ territories }: DefsProps) {
  return (
    <defs>
      {/* Folha de Estilos de Animação CSS (Puro SVG/CSS, 60fps, Zero WebGL) */}
      <style>{`
        @keyframes oceanCurrentSlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 320; }
        }
        @keyframes oceanCurrentReverse {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes coastAuraPulse {
          0%, 100% { opacity: 0.38; filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.45)); }
          50% { opacity: 0.72; filter: drop-shadow(0 0 22px rgba(6, 182, 212, 0.85)); }
        }
        @keyframes networkPulseFlow {
          0% { stroke-dashoffset: 80; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes capitalBeaconPulse {
          0%, 100% { r: 5px; opacity: 0.45; }
          50% { r: 9px; opacity: 0.85; }
        }
        @keyframes marineParticleFloat {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-8px) scale(1.3); opacity: 0.7; }
        }

        .anim-ocean-current-1 {
          animation: oceanCurrentSlow 18s linear infinite;
        }
        .anim-ocean-current-2 {
          animation: oceanCurrentReverse 14s linear infinite;
        }
        .anim-coastline-glow {
          animation: coastAuraPulse 9s ease-in-out infinite;
        }
        .anim-network-line {
          animation: networkPulseFlow 7s linear infinite;
        }
        .anim-capital-beacon {
          animation: capitalBeaconPulse 2.8s ease-in-out infinite;
        }
        .anim-particle-1 {
          animation: marineParticleFloat 8s ease-in-out infinite;
        }
        .anim-particle-2 {
          animation: marineParticleFloat 12s ease-in-out infinite reverse;
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-ocean-current-1,
          .anim-ocean-current-2,
          .anim-coastline-glow,
          .anim-network-line,
          .anim-capital-beacon,
          .anim-particle-1,
          .anim-particle-2 {
            animation: none !important;
          }
        }
      `}</style>

      {/* 1. Gradientes Vívidos com Iluminação Topo-Esquerda (315° NW Light Angle) */}
      {Object.entries(DISTRICT_VIBRANT_PALETTE).map(([id, p]) => (
        <linearGradient key={`grad-${id}`} id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.highlight} stopOpacity="0.99" />
          <stop offset="35%" stopColor={p.gradientStart} stopOpacity="0.96" />
          <stop offset="100%" stopColor={p.gradientEnd} stopOpacity="0.92" />
        </linearGradient>
      ))}

      {/* 2. Gradiente do Distrito Selecionado (Explosão Ciano Neon) */}
      <linearGradient id="grad-selected-surge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7dd3fc" />
        <stop offset="30%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>

      {/* 3. Gradientes de Pódio / Ranking */}
      <linearGradient id="grad-podium-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef9c3" />
        <stop offset="30%" stopColor="#fde047" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      <linearGradient id="grad-podium-silver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#e2e8f0" />
        <stop offset="80%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <linearGradient id="grad-podium-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffedd5" />
        <stop offset="35%" stopColor="#fb923c" />
        <stop offset="75%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#9a3412" />
      </linearGradient>

      {/* 4. Caixas Táticas Glassmorphism dos Arquipélagos */}
      <linearGradient id="inset-tactical-glass" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#082347" stopOpacity="0.88" />
        <stop offset="100%" stopColor="#020f21" stopOpacity="0.97" />
      </linearGradient>

      {/* 5. Grelha Tática do Oceano */}
      <pattern id="tactical-ocean-grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="0.75" />
      </pattern>

      {/* 6. Filtros 3D: Sombra de Elevação Territorial Realista */}
      <filter id="district-3d-shadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="3" dy="5.5" stdDeviation="3.5" floodColor="#010712" floodOpacity="0.78" />
      </filter>

      <filter id="laser-glow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      <filter id="selection-glow" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="7" result="blur" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.85  0 0 0 0 0.95  0 0 0 0.95 0" />
        <feComposite in="SourceGraphic" operator="over" />
      </filter>
    </defs>
  )
}

// =============================================================================
// 4. TOPOGRAFIA / RELEVO 3D DAS SERRAS DE PORTUGAL (GERÊS, ESTRELA, MONCHIQUE)
// =============================================================================
export function PortugalTopographicRelief() {
  return (
    <g id="portugal-topographic-relief" className="pointer-events-none select-none">
      {/* Serras do Noroeste / Gerês / Peneda / Alvão */}
      <g stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.85" fill="none" strokeLinecap="round">
        <path d="M 380,85 Q 400,105 420,95 M 390,115 Q 410,125 435,110 M 385,135 Q 415,145 440,130" />
        <path d="M 445,100 Q 470,115 490,105 M 460,125 Q 480,140 510,120" opacity="0.7" />
        {/* Serra do Marão */}
        <path d="M 425,185 Q 445,205 465,190 M 430,210 Q 455,225 480,205" />
      </g>

      {/* Cordilheira Central / Serra da Estrela (Torre 1993m) */}
      <g id="serra-da-estrela-relief">
        {/* Curvas de Nível Concéntricas */}
        <path
          d="M 465,360 C 485,345 520,350 535,370 C 530,395 490,405 470,385 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.1"
        />
        <path
          d="M 480,368 C 495,358 515,362 522,374 C 518,388 495,394 482,382 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1.2"
        />
        {/* Pico da Torre 1993m */}
        <g transform="translate(502, 376)">
          <polygon points="0,-4 3.5,3 -3.5,3" fill="#fef08a" stroke="#0f172a" strokeWidth="0.5" />
          <text x="6" y="2" fill="#fef08a" fontSize="7.5" fontWeight="900" fontFamily="monospace" letterSpacing="0.05em">
            TORRE 1993m
          </text>
        </g>
      </g>

      {/* Serra da Lousã & Açor */}
      <g stroke="rgba(255, 255, 255, 0.20)" strokeWidth="0.8" fill="none" strokeLinecap="round">
        <path d="M 410,410 Q 430,425 455,415 M 420,430 Q 440,442 465,430" />
      </g>

      {/* Serra de Sintra (Cabo da Roca / Pena) */}
      <g stroke="rgba(255, 255, 255, 0.32)" strokeWidth="1.0" fill="none" strokeLinecap="round">
        <path d="M 300,520 Q 312,525 322,518" />
      </g>

      {/* Serra de São Mamede (Portalegre) */}
      <g stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.85" fill="none" strokeLinecap="round">
        <path d="M 505,480 Q 520,500 535,488 M 512,505 Q 528,518 540,505" />
      </g>

      {/* Serra de Monchique & Caldeirão (Fóia 902m, Algarve) */}
      <g id="serra-de-monchique-relief">
        <path
          d="M 390,750 Q 430,735 480,755 M 410,768 Q 450,752 500,770"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="0.95"
          fill="none"
          strokeLinecap="round"
        />
        <g transform="translate(425, 746)">
          <polygon points="0,-3.5 3,2.5 -3,2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="0.5" />
          <text x="5" y="2" fill="#fef08a" fontSize="7" fontWeight="900" fontFamily="monospace">
            FÓIA 902m
          </text>
        </g>
      </g>

      {/* Planícies do Alentejo (Ondulação Suave e Espaçada) */}
      <g stroke="rgba(255, 255, 255, 0.10)" strokeWidth="0.75" fill="none" strokeDasharray="4 8">
        <path d="M 390,600 Q 440,615 490,605 M 405,635 Q 460,650 515,638 M 380,680 Q 435,695 490,685" />
      </g>
    </g>
  )
}

// =============================================================================
// 5. REDE NACIONAL ESTRATÉGICA (CORREDORES INTERCIDADES COM PULSO DE LUZ)
// =============================================================================
export function PortugalNationalNetwork() {
  return (
    <g id="portugal-national-network" className="pointer-events-none select-none opacity-45">
      {/* Linhas de Conexão Estruturantes da Rede Nacional */}
      <g
        stroke="rgba(56, 189, 248, 0.55)"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="4, 10"
        className="anim-network-line"
      >
        {/* Minho - Porto */}
        <path d="M 374,105 L 395,122 L 374,181" />
        {/* Eixo Atlântico: Porto -> Aveiro -> Coimbra -> Leiria -> Lisboa */}
        <path d="M 374,181 L 378,272 L 392,345 L 368,432 L 315,538" />
        {/* Trás-os-Montes: Porto -> Vila Real -> Bragança */}
        <path d="M 374,181 L 452,175 L 535,115" />
        {/* Beira Interior: Coimbra -> Viseu -> Guarda */}
        <path d="M 392,345 L 435,270 L 495,310" />
        {/* Guarda -> Castelo Branco -> Portalegre */}
        <path d="M 495,310 L 468,422 L 498,495" />
        {/* Sul: Lisboa -> Setúbal -> Évora -> Beja -> Faro */}
        <path d="M 315,538 L 332,575 L 442,605 L 448,690 L 438,795" />
      </g>
    </g>
  )
}

// =============================================================================
// 6. COSTA ILUMINADA (COASTLINE GLOW & LIVING ENERGY SURGE)
// =============================================================================
export function PortugalCoastlineGlow({ mainlandTerritories }: { mainlandTerritories: PortugalTerritory[] }) {
  return (
    <g id="portugal-coastline-luminescence" className="pointer-events-none select-none">
      {/* Camada A: Brilho Oceânico Difuso Costeiro */}
      <g className="anim-coastline-glow">
        {mainlandTerritories.map((t) => (
          <path
            key={`coast-diffuse-${t.id}`}
            d={t.path}
            fill="none"
            stroke="rgba(56, 189, 248, 0.35)"
            strokeWidth="16"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Camada B: Franja Luminosa Litorânea */}
      <g opacity="0.6">
        {mainlandTerritories.map((t) => (
          <path
            key={`coast-edge-${t.id}`}
            d={t.path}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>
    </g>
  )
}

// =============================================================================
// 7. OCEANO VIVO — ATMOSFERA MULTICAMADA, CORRENTES & TELEMETRIA 2026
// =============================================================================
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
      {/* 1. Grelha Holográfica Tática do Atlântico */}
      <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="url(#tactical-ocean-grid)" />

      {/* 2. Correntes Oceânicas Animadas (Ciclos Lentos de 14–18s) */}
      <g fill="none">
        {/* Corrente Oceânica do Norte para Sul (Canário / Açores) */}
        <path
          d="M 10,140 C 160,180 240,120 320,240 C 370,320 310,480 270,580 C 230,680 320,780 370,860"
          stroke="rgba(56, 189, 248, 0.28)"
          strokeWidth="1.6"
          strokeDasharray="14 36"
          className="anim-ocean-current-1"
        />
        {/* Corrente Profunda da Plataforma */}
        <path
          d="M 0,320 C 140,340 220,280 300,390 C 360,460 320,620 310,720 C 300,790 350,830 400,860"
          stroke="rgba(14, 165, 233, 0.22)"
          strokeWidth="1.2"
          strokeDasharray="10 28"
          className="anim-ocean-current-2"
        />
        {/* Corrente Litoral do Golfo de Cádis / Algarve */}
        <path
          d="M 280,845 C 380,820 480,840 600,835 C 720,830 840,845 950,840"
          stroke="rgba(34, 211, 238, 0.25)"
          strokeWidth="1.4"
          strokeDasharray="12 30"
          className="anim-ocean-current-1"
        />
      </g>

      {/* 3. Contornos Batimétricos da Plataforma Continental (ZEE Portugal) */}
      <g opacity="0.26" stroke="rgba(14, 165, 233, 0.45)" fill="none">
        {/* Plataforma 200m */}
        <path d="M 0,220 C 180,240 320,180 440,260 C 520,310 460,450 420,520 C 380,600 460,700 500,860" strokeWidth="1.4" strokeDasharray="8 10" />
        {/* Bordo 1000m */}
        <path d="M 0,430 C 140,440 260,400 360,470 C 420,510 390,630 400,760" strokeWidth="1.1" strokeDasharray="5 7" />
        {/* Abissal 3000m */}
        <path d="M 0,660 C 120,650 240,690 340,740" strokeWidth="0.9" strokeDasharray="4 6" />
      </g>

      {/* 4. Partículas Flutuantes de Luz Marinha */}
      <g className="anim-particle-1" fill="#38bdf8">
        <circle cx="160" cy="380" r="1.8" opacity="0.6" />
        <circle cx="210" cy="480" r="2.2" opacity="0.5" />
        <circle cx="120" cy="620" r="1.6" opacity="0.7" />
        <circle cx="280" cy="730" r="2.0" opacity="0.4" />
      </g>
      <g className="anim-particle-2" fill="#2dd4bf">
        <circle cx="240" cy="330" r="1.5" opacity="0.5" />
        <circle cx="180" cy="540" r="2.0" opacity="0.6" />
        <circle cx="130" cy="710" r="1.7" opacity="0.5" />
      </g>

      {/* 5. Telemetria Marítima ZEE 2026 */}
      <g opacity="0.55" fontFamily="monospace" fontSize="9" fill="#38bdf8">
        <text x="30" y="445" letterSpacing="1.2" fontWeight="bold">
          ATLÂNTICO // ZEE DE PORTUGAL 2026
        </text>
        <text x="30" y="460" fill="#64748b">
          38° 42' N  9° 11' W • PLATAFORMA CONTINENTAL
        </text>
      </g>

      {/* 6. Rosa dos Ventos Tática Oficial 2026 (Canto Inferior Direito) */}
      <g transform="translate(910, 780)" opacity="0.75">
        <circle r="36" fill="none" stroke="rgba(14, 165, 233, 0.40)" strokeWidth="1.2" />
        <circle r="26" fill="none" stroke="rgba(245, 158, 11, 0.45)" strokeWidth="0.8" strokeDasharray="3 3" />
        {/* Ponteiro Norte Dourado */}
        <polygon points="0,-36 6,-8 0,0 -6,-8" fill="#f59e0b" />
        <polygon points="0,36 6,8 0,0 -6,8" fill="#0284c7" />
        <polygon points="36,0 8,6 0,0 8,-6" fill="#0284c7" />
        <polygon points="-36,0 -8,6 0,0 -8,-6" fill="#0284c7" />
        <text
          x="0"
          y="-40"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
        >
          N
        </text>
      </g>
    </g>
  )
}
