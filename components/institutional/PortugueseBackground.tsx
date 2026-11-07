'use client'

import React from 'react'

/**
 * 🇵🇹 ACORDA PORTUGAL — IDENTIDADE VISUAL NACIONAL & IMAGEM CINEMATOGRÁFICA
 * Cores Nacionais: Verde Pátria (#041009), Carmesim Nobre (#1c0505), Branco e Dourado (#D4AF37).
 * Imagem de Fundo de qualidade cinematográfica (/images/hero-portugal.jpg) inspirada no território nacional.
 * Zero estética gaming. Zero azul escuro. Totalmente institucional e moderno.
 */
export function PortugueseBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 overflow-hidden -z-10 bg-[#040e08]"
    >
      {/* 1. IMAGEM DE FUNDO CINEMATOGRÁFICA DE PORTUGAL */}
      <div className="absolute top-0 left-0 right-0 h-[850px] sm:h-[1000px] lg:h-[1150px] w-full overflow-hidden">
        <img
          src="/images/hero-portugal.jpg"
          alt=""
          role="presentation"
          decoding="async"
          loading="eager"
          className="w-full h-full object-cover object-top filter brightness-[0.78] contrast-[1.08] saturate-[1.05]"
        />

        {/* Sobreposições graduadas para garantir leitura impecável dos textos */}
        {/* Gradiente vertical para fusão suave com o fundo nacional */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040e08]/50 via-[#040e08]/75 to-[#040e08]" />

        {/* Vinheta lateral e reflexo de luz natural */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,rgba(212,175,55,0.06),transparent_65%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040e08]/80 via-transparent to-[#040e08]/80" />
      </div>

      {/* 2. BASE CROMÁTICA NACIONAL (Verde Profundo, Vinho Pátria e Dourado) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_25%,rgba(16,185,129,0.07),transparent_60%),radial-gradient(ellipse_60%_50%_at_80%_45%,rgba(185,28,28,0.06),transparent_60%),radial-gradient(ellipse_50%_40%_at_50%_75%,rgba(212,175,55,0.04),transparent_60%)]" />

      {/* 3. PADRÃO GEOMÉTRICO INSTITUCIONAL SUBTIL (Linhas de Precisão e Pátria) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="pt-national-lattice"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 56 M 0 0 L 56 56"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="0.5"
            />
            <circle cx="28" cy="28" r="1" fill="#10B981" />
            <circle cx="0" cy="0" r="0.75" fill="#EF4444" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pt-national-lattice)" />
      </svg>

      {/* 4. ESFERA ARMILAR E ELEMENTO NÁUTICO SOBERANO (Hairline Dourado Sofisticado) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none opacity-[0.045] text-[#D4AF37]">
        <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="400" cy="400" r="370" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="400" cy="400" r="340" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="400" cy="400" r="260" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="400" r="170" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 6" />
          <circle cx="400" cy="400" r="70" stroke="currentColor" strokeWidth="1.5" />
          <line x1="400" y1="20" x2="400" y2="780" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="400" x2="780" y2="400" stroke="currentColor" strokeWidth="1" />
          <ellipse cx="400" cy="400" rx="340" ry="130" stroke="currentColor" strokeWidth="1" transform="rotate(-23.5 400 400)" />
          <ellipse cx="400" cy="400" rx="340" ry="130" stroke="currentColor" strokeWidth="1" transform="rotate(23.5 400 400)" />
        </svg>
      </div>

      {/* 5. LINHA HORIZONTAL SUBTIL VERDE E VERMELHA (Topo da Página) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] via-50% via-[#DC2626] to-transparent opacity-80" />
    </div>
  )
}
