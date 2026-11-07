'use client'

import React from 'react'

/**
 * 🇵🇹 ACORDA PORTUGAL — COMPOSIÇÃO GRÁFICA EXCLUSIVA
 * Fundo Institucional inspirado na herança cartográfica, náutica e geométrica de Portugal.
 * Design sóbrio, sofisticado, minimalista, sem qualquer estética gaming.
 */
export function PortugueseBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden -z-10 bg-[#030712]"
    >
      {/* 1. Gradiente Base: Azul Marítimo Noturno Português com profundidade de Ardósia */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,78,59,0.14),transparent_70%),radial-gradient(ellipse_60%_50%_at_80%_40%,rgba(180,83,9,0.07),transparent_60%),linear-gradient(to_bottom,#030712_0%,#060e1d_35%,#040a14_70%,#02050b_100%)]" />

      {/* 2. Padrão Geométrico Exclusivo (Inspirado na Calçada & Azulejaria Portuguesa com linhas de precisão) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="pt-geometric-lattice"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            {/* Quadrícula Geométrica Fina */}
            <path
              d="M 64 0 L 0 64 M 0 0 L 64 64"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {/* Losangos Centrais da Tradição Geométrica */}
            <path
              d="M 32 0 L 64 32 L 32 64 L 0 32 Z"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="0.5"
            />
            {/* Pontos de Cruzamento */}
            <circle cx="32" cy="32" r="1.5" fill="#10b981" />
            <circle cx="0" cy="0" r="1" fill="#cbd5e1" />
            <circle cx="64" cy="0" r="1" fill="#cbd5e1" />
            <circle cx="0" cy="64" r="1" fill="#cbd5e1" />
            <circle cx="64" cy="64" r="1" fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pt-geometric-lattice)" />
      </svg>

      {/* 3. Composição Cartográfica Náutica: Esfera Armilar & Rosa dos Ventos em Hairline */}
      <svg
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] max-w-[130vw] h-[1000px] opacity-[0.07] text-amber-200 pointer-events-none"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo do Horizonte e Equador */}
        <circle cx="500" cy="500" r="460" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="500" cy="500" r="420" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="500" cy="500" r="340" stroke="currentColor" strokeWidth="1" />
        <circle cx="500" cy="500" r="260" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="500" cy="500" r="180" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="500" cy="500" r="70" stroke="currentColor" strokeWidth="1" />

        {/* Eixos Cardeais & Meridianos */}
        <line x1="500" y1="20" x2="500" y2="980" stroke="currentColor" strokeWidth="1" />
        <line x1="20" y1="500" x2="980" y2="500" stroke="currentColor" strokeWidth="1" />
        
        {/* Linhas de Rumo Cartográficas (Pedro Reinel & Cartas Náuticas do Atlântico) */}
        <line x1="174" y1="174" x2="826" y2="826" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 7" />
        <line x1="826" y1="174" x2="174" y2="826" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 7" />
        <line x1="500" y1="20" x2="826" y2="826" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
        <line x1="500" y1="20" x2="174" y2="826" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.5" />
        
        {/* Elipses de Rotação Armilar */}
        <ellipse cx="500" cy="500" rx="420" ry="160" stroke="currentColor" strokeWidth="1" transform="rotate(-23.5 500 500)" />
        <ellipse cx="500" cy="500" rx="420" ry="160" stroke="currentColor" strokeWidth="1" transform="rotate(23.5 500 500)" />
        <ellipse cx="500" cy="500" rx="160" ry="420" stroke="currentColor" strokeWidth="0.75" />
      </svg>

      {/* 4. Ondulações Topográficas do Atlântico e Costa Portuguesa (Linhas de Contorno Subtis) */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-[520px] opacity-[0.05] pointer-events-none text-emerald-300"
        preserveAspectRatio="none"
        viewBox="0 0 1440 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,192 C288,256 576,128 864,192 C1152,256 1296,160 1440,192 L1440,520 L0,520 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M0,256 C360,192 720,320 1080,256 C1260,224 1350,288 1440,256 L1440,520 L0,520 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M0,320 C320,384 640,256 960,320 C1280,384 1360,320 1440,352 L1440,520 L0,520 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>

      {/* 5. Vinheta Suave e Difusão de Iluminação Nobre */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02050b] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#030712] to-transparent pointer-events-none" />
    </div>
  )
}

export default PortugueseBackground
