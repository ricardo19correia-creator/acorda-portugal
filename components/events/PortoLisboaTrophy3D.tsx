'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type TrophyPlacement = 1 | 2 | 3
export type TrophyTeamSide = 'porto' | 'lisboa' | null

interface Trophy3DProps {
  placement: TrophyPlacement
  teamSide?: TrophyTeamSide
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  className?: string
  showAura?: boolean
}

/**
 * 🥇 1.º LUGAR — TROFÉU SUPREMO — PORTO × LISBOA 2026
 * Taça monumental em ouro maciço 24k, pedestal nobre cinzelado com placa dourada,
 * asas esculpidas, joias de safira azul e rubi carmesim e varrimento de luz dinâmico.
 */
export function TrophySupremo3D({
  teamSide,
  size = 'md',
  interactive = true,
  className,
  showAura = true,
}: Omit<Trophy3DProps, 'placement'>) {
  const sizeMap = {
    sm: 'w-24 h-28',
    md: 'w-44 h-52',
    lg: 'w-64 h-76',
    xl: 'w-80 h-96 sm:w-96 sm:h-[430px]',
  }

  const teamGlowClass =
    teamSide === 'porto'
      ? 'from-blue-600/35 via-amber-400/20 to-transparent drop-shadow-[0_0_35px_rgba(37,99,235,0.45)]'
      : teamSide === 'lisboa'
      ? 'from-rose-600/35 via-amber-400/20 to-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.45)]'
      : 'from-blue-600/20 via-amber-400/30 to-rose-600/20 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none group',
        sizeMap[size],
        interactive && 'transition-transform duration-500 hover:scale-105',
        className
      )}
    >
      {/* Halo de Luz Ambiente e Profundidade */}
      {showAura && (
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-radial blur-2xl pointer-events-none transition-opacity duration-700 opacity-80 group-hover:opacity-100',
            teamGlowClass
          )}
        />
      )}

      {/* Brilho pulsante de fundo */}
      <div className="absolute -inset-2 bg-gradient-to-t from-amber-500/10 via-yellow-400/15 to-transparent rounded-full blur-xl pointer-events-none animate-pulse" />

      {/* SVG 3D Ultra-Detilhado */}
      <svg
        viewBox="0 0 400 480"
        className="w-full h-full relative z-10 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ouro Principal: Gradiente Cilíndrico de Alto Contraste */}
          <linearGradient id="goldCupBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="12%" stopColor="#d97706" />
            <stop offset="28%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#fef9c3" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="75%" stopColor="#b45309" />
            <stop offset="90%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Ouro Polido Secundário (Asas e Pormenores) */}
          <linearGradient id="goldAccents" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Ouro Espelhado Claro (Bordas e Relevos) */}
          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
          </linearGradient>

          {/* Pedestal de Obsidiana / Mármore Negro */}
          <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="20%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="80%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Placa Metálica Gravada */}
          <linearGradient id="plaqueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Safira Azul Real do Porto */}
          <radialGradient id="sapphireGem" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="75%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Rubi Carmesim Real de Lisboa */}
          <radialGradient id="rubyGem" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="35%" stopColor="#e11d48" />
            <stop offset="75%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>

          {/* Varrimento de Brilho / Sheen */}
          <linearGradient id="sheenLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Sombra de Profundidade */}
          <filter id="dropShadowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* ================================================================= */}
        {/* 1. PEDESTAL MONUMENTAL (MÁRMORE + REBORDOS CHANFRADOS EM OURO)     */}
        {/* ================================================================= */}
        {/* Sombra de Chão */}
        <ellipse cx="200" cy="458" rx="140" ry="16" fill="#000000" fillOpacity="0.65" filter="blur(6px)" />

        {/* Base Inferior Larga */}
        <path d="M70 450 L330 450 L320 425 L80 425 Z" fill="url(#pedestalBase)" stroke="#475569" strokeWidth="1" />
        <line x1="75" y1="426" x2="325" y2="426" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.7" />

        {/* Bloco Central do Pedestal */}
        <rect x="95" y="375" width="210" height="50" rx="3" fill="url(#pedestalBase)" stroke="#1e293b" strokeWidth="2" />

        {/* Bordo Chanfrado de Ouro Superior do Pedestal */}
        <path d="M85 375 L315 375 L300 360 L100 360 Z" fill="url(#goldAccents)" />
        <line x1="88" y1="375" x2="312" y2="375" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.8" />

        {/* PLACA COMEMORATIVA GRAVADA */}
        <rect x="110" y="383" width="180" height="34" rx="3" fill="url(#plaqueGrad)" stroke="#78350f" strokeWidth="1.2" filter="url(#dropShadowGlow)" />
        <rect x="113" y="386" width="174" height="28" rx="2" fill="none" stroke="#fef08a" strokeWidth="0.8" strokeOpacity="0.7" />

        {/* Texto da Placa */}
        <text x="200" y="396" textAnchor="middle" fill="#451a03" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.8">
          PORTO × LISBOA 2026
        </text>
        <text x="200" y="408" textAnchor="middle" fill="#020617" fontSize="10.5" fontWeight="950" fontFamily="sans-serif" letterSpacing="2.2">
          REI DA RIVALIDADE
        </text>

        {/* Parafuso decorativo nos cantos da placa */}
        <circle cx="116" cy="389" r="1.5" fill="#78350f" />
        <circle cx="284" cy="389" r="1.5" fill="#78350f" />
        <circle cx="116" cy="411" r="1.5" fill="#78350f" />
        <circle cx="284" cy="411" r="1.5" fill="#78350f" />

        {/* ================================================================= */}
        {/* 2. COLUNA E HASTE DO TROFÉU (OURO ESCULPIDO COM CANELURAS)         */}
        {/* ================================================================= */}
        {/* Anel Inferior da Haste */}
        <ellipse cx="200" cy="358" rx="42" ry="7" fill="url(#goldAccents)" stroke="#78350f" strokeWidth="1" />

        {/* Fuste Canelado (Haste Central) */}
        <path d="M175 358 Q190 310 185 270 L215 270 Q210 310 225 358 Z" fill="url(#goldCupBody)" />
        {/* Linhas de Relevo Canelado */}
        <path d="M188 355 Q198 310 195 270" stroke="#fef08a" strokeWidth="1.2" strokeOpacity="0.7" />
        <path d="M200 354 Q200 310 200 270" stroke="#ffffff" strokeWidth="1.8" strokeOpacity="0.9" />
        <path d="M212 355 Q202 310 205 270" stroke="#78350f" strokeWidth="1.2" strokeOpacity="0.6" />

        {/* Nó Central / Esfera Banhada */}
        <ellipse cx="200" cy="270" rx="34" ry="9" fill="url(#goldAccents)" stroke="#78350f" strokeWidth="1" />
        <circle cx="200" cy="270" r="14" fill="url(#goldCupBody)" filter="url(#dropShadowGlow)" />
        <ellipse cx="196" cy="266" rx="4" ry="2" fill="#ffffff" fillOpacity="0.8" />

        {/* ================================================================= */}
        {/* 3. ASAS ESCULPIDAS LATERAIS (ASAS DO DRAGÃO & ÁGUIA)              */}
        {/* ================================================================= */}
        {/* Asa Esquerda (Porto / Dragão Alado) */}
        <g filter="url(#dropShadowGlow)">
          <path
            d="M135 150 C80 130, 45 170, 52 230 C58 270, 95 305, 145 300 C125 285, 100 255, 96 220 C92 180, 115 158, 135 150 Z"
            fill="url(#goldAccents)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          {/* Aresta Brilhante da Asa Esquerda */}
          <path
            d="M135 150 C80 130, 45 170, 52 230"
            stroke="#ffffff"
            strokeWidth="2"
            strokeOpacity="0.7"
          />
          {/* Safira Incrustada no Topo da Asa Esquerda (Azul Porto) */}
          <circle cx="85" cy="155" r="7" fill="url(#sapphireGem)" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="83" cy="153" r="2" fill="#ffffff" fillOpacity="0.9" />
        </g>

        {/* Asa Direita (Lisboa / Águia Soberana) */}
        <g filter="url(#dropShadowGlow)">
          <path
            d="M265 150 C320 130, 355 170, 348 230 C342 270, 305 305, 255 300 C275 285, 300 255, 304 220 C308 180, 285 158, 265 150 Z"
            fill="url(#goldAccents)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          {/* Aresta Brilhante da Asa Direita */}
          <path
            d="M265 150 C320 130, 355 170, 348 230"
            stroke="#fef08a"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          {/* Rubi Incrustado no Topo da Asa Direita (Vermelho Lisboa) */}
          <circle cx="315" cy="155" r="7" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="313" cy="153" r="2" fill="#ffffff" fillOpacity="0.9" />
        </g>

        {/* ================================================================= */}
        {/* 4. TAÇA MONUMENTAL (CÁLICE 3D COM VOLUME E PROFUNDIDADE)           */}
        {/* ================================================================= */}
        {/* Corpo do Cálice */}
        <path
          d="M125 125 C125 185, 140 245, 200 255 C260 245, 275 185, 275 125 Z"
          fill="url(#goldCupBody)"
          stroke="#78350f"
          strokeWidth="1.5"
        />

        {/* Bordo Superior do Cálice (Abertura 3D Elíptica) */}
        <ellipse cx="200" cy="125" rx="75" ry="18" fill="url(#goldAccents)" stroke="#78350f" strokeWidth="1.5" />
        {/* Interior Sombrio do Cálice */}
        <ellipse cx="200" cy="125" rx="68" ry="14" fill="#3b1d03" />
        <ellipse cx="200" cy="123" rx="65" ry="11" fill="#1c0b00" />
        {/* Reflexo Dourado da Borda Interna */}
        <path d="M135 125 A65 11 0 0 0 265 125" stroke="#fef08a" strokeWidth="2" fill="none" strokeOpacity="0.8" />

        {/* Linhas de Brilho Especular Vertical no Corpo da Taça */}
        <path
          d="M168 135 Q174 195 195 248"
          stroke="#ffffff"
          strokeWidth="4"
          strokeOpacity="0.55"
          filter="blur(1px)"
        />
        <path
          d="M165 137 Q170 190 192 245"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.9"
        />

        {/* ================================================================= */}
        {/* 5. MEDALHÃO CENTRAL DO GRANDE DUELO (ESCUDO DUAL PORTO × LISBOA)   */}
        {/* ================================================================= */}
        <g filter="url(#dropShadowGlow)">
          {/* Aro Exterior do Medalhão */}
          <circle cx="200" cy="188" r="32" fill="url(#goldAccents)" stroke="#451a03" strokeWidth="1.5" />
          <circle cx="200" cy="188" r="28" fill="#090d16" stroke="#fbbf24" strokeWidth="1.2" />

          {/* Divisão Dual Interna do Escudo (Azul Porto à Esquerda, Vermelho Lisboa à Direita) */}
          <path d="M200 162 A26 26 0 0 0 200 214 Z" fill="#1e3a8a" />
          <path d="M200 162 A26 26 0 0 1 200 214 Z" fill="#991b1b" />

          {/* Linha Divisória de Luz Central */}
          <line x1="200" y1="162" x2="200" y2="214" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Coroa Superior Imperial sobre o Medalhão */}
          <path
            d="M188 152 L193 158 L200 148 L207 158 L212 152 L210 164 L190 164 Z"
            fill="url(#goldAccents)"
            stroke="#78350f"
            strokeWidth="0.8"
          />

          {/* Símbolo Central × da Rivalidade */}
          <text
            x="200"
            y="194"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="950"
            fontFamily="sans-serif"
            filter="drop-shadow(0 0 4px rgba(245,158,11,0.8))"
          >
            ×
          </text>

          {/* Inscrições no Medalhão */}
          <text x="183" y="192" textAnchor="middle" fill="#93c5fd" fontSize="7.5" fontWeight="900">
            FCP
          </text>
          <text x="217" y="192" textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="900">
            SLB
          </text>
          <text x="200" y="208" textAnchor="middle" fill="#fde047" fontSize="7.5" fontWeight="900" letterSpacing="0.5">
            2026
          </text>
        </g>

        {/* ================================================================= */}
        {/* 6. COROA SUPREMA DO TOPO (CONSAGRAÇÃO MÁXIMA DO CAMPEÃO)          */}
        {/* ================================================================= */}
        <g filter="url(#dropShadowGlow)">
          {/* Coroa Dourada Flutuante no Topo */}
          <path
            d="M165 105 L175 75 L188 95 L200 60 L212 95 L225 75 L235 105 Z"
            fill="url(#goldCupBody)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          {/* Base da Coroa */}
          <path d="M162 105 L238 105 L234 112 L166 112 Z" fill="url(#goldAccents)" stroke="#451a03" strokeWidth="1" />

          {/* Gemas Cravadas nas Pontas da Coroa */}
          <circle cx="175" cy="75" r="3.5" fill="url(#sapphireGem)" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="200" cy="60" r="5" fill="url(#goldHighlight)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="200" cy="60" r="2.5" fill="#fef08a" />
          <circle cx="225" cy="75" r="3.5" fill="url(#rubyGem)" stroke="#ffffff" strokeWidth="0.8" />

          {/* Faixa de Brilho Superior */}
          <line x1="168" y1="108" x2="232" y2="108" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.85" />
        </g>

        {/* Centelhas de Brilho Diamante (Sheen) */}
        <g>
          {/* Faísca Superior Esquerda */}
          <path d="M140 85 Q147 85 147 78 Q147 85 154 85 Q147 85 147 92 Q147 85 140 85 Z" fill="#ffffff" opacity="0.9" />
          <circle cx="147" cy="85" r="1.5" fill="#fef08a" />

          {/* Faísca no Bordo do Cálice */}
          <path d="M260 120 Q265 120 265 115 Q265 120 270 120 Q265 120 265 125 Q265 120 260 120 Z" fill="#ffffff" opacity="0.95" />

          {/* Faísca na Placa */}
          <path d="M115 385 Q119 385 119 381 Q119 385 123 385 Q119 385 119 389 Q119 385 115 385 Z" fill="#ffffff" opacity="0.85" />
        </g>
      </svg>
    </div>
  )
}

/**
 * 🥈 2.º LUGAR — MEDALHA DE PRATA — PORTO × LISBOA 2026
 * Medalha de alta joalharia em prata pura e platina com relevo escovado,
 * fita cerimonial em tecido nobre, aro comemorativo gravado e reflexos de prestígio.
 */
export function MedalPrata3D({
  teamSide,
  size = 'md',
  interactive = true,
  className,
  showAura = true,
}: Omit<Trophy3DProps, 'placement'>) {
  const sizeMap = {
    sm: 'w-24 h-28',
    md: 'w-40 h-48',
    lg: 'w-56 h-68',
    xl: 'w-72 h-88',
  }

  const teamRibbonClass =
    teamSide === 'porto'
      ? 'from-blue-700 via-slate-300 to-blue-900'
      : teamSide === 'lisboa'
      ? 'from-rose-700 via-slate-300 to-rose-900'
      : 'from-blue-700 via-slate-200 to-rose-700'

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none group',
        sizeMap[size],
        interactive && 'transition-transform duration-500 hover:scale-105',
        className
      )}
    >
      {/* Halo de Luz Prateada Fria */}
      {showAura && (
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-slate-300/25 via-blue-400/15 to-transparent blur-2xl pointer-events-none transition-opacity duration-700 opacity-70 group-hover:opacity-100" />
      )}

      <svg
        viewBox="0 0 360 440"
        className="w-full h-full relative z-10 filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Prata Metálica Radial de Alta Densidade */}
          <radialGradient id="silverBody" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#f1f5f9" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="90%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Prata Escovada em Ângulo */}
          <linearGradient id="silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="55%" stopColor="#f8fafc" />
            <stop offset="75%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Fita Cerimonial */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="28%" stopColor="#2563eb" />
            <stop offset="48%" stopColor="#e2e8f0" />
            <stop offset="52%" stopColor="#ffffff" />
            <stop offset="72%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          <filter id="shadowMedal" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* ================================================================= */}
        {/* 1. FITA CERIMONIAL EM V (DUAL BLUE & RED COM CENTRO PRATA)        */}
        {/* ================================================================= */}
        <g filter="url(#shadowMedal)">
          {/* Ramo Esquerdo da Fita */}
          <path d="M120 20 L180 160 L140 160 L95 20 Z" fill="url(#ribbonGrad)" />
          {/* Ramo Direito da Fita */}
          <path d="M240 20 L180 160 L220 160 L265 20 Z" fill="url(#ribbonGrad)" />
          {/* Dobra Superior */}
          <path d="M95 20 L140 20 L180 110 L220 20 L265 20 L195 160 L165 160 Z" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.3" />
        </g>

        {/* Argola e Presilha de Prata da Medalha */}
        <g filter="url(#shadowMedal)">
          <ellipse cx="180" cy="160" rx="22" ry="12" fill="url(#silverRim)" stroke="#334155" strokeWidth="2" />
          <ellipse cx="180" cy="160" rx="15" ry="7" fill="#0f172a" />
        </g>

        {/* ================================================================= */}
        {/* 2. DISCO DA MEDALHA DE PRATA (RELEVO CONCÊNTRICO)                 */}
        {/* ================================================================= */}
        <g filter="url(#shadowMedal)">
          {/* Aro Exterior */}
          <circle cx="180" cy="270" r="120" fill="url(#silverRim)" stroke="#1e293b" strokeWidth="3" />

          {/* Bisel Chanfrado Exterior */}
          <circle cx="180" cy="270" r="112" fill="url(#silverBody)" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Ranhura Circular com Rebites de Joalharia */}
          <circle cx="180" cy="270" r="98" fill="#1e293b" />
          <circle cx="180" cy="270" r="94" fill="url(#silverBody)" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Inscrições Circulares em Relevo */}
          <text x="180" y="200" textAnchor="middle" fill="#1e293b" fontSize="10.5" fontWeight="950" fontFamily="sans-serif" letterSpacing="2">
            PORTO × LISBOA
          </text>
          <text x="180" y="214" textAnchor="middle" fill="#475569" fontSize="8.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">
            EDIÇÃO OFICIAL 2026
          </text>

          {/* Brasão Central em Relevo */}
          <circle cx="180" cy="275" r="48" fill="url(#silverRim)" stroke="#475569" strokeWidth="2" />
          <circle cx="180" cy="275" r="44" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />

          {/* Emblema Central: 2.º LUGAR & ESPADAS */}
          <text x="180" y="270" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="950" fontFamily="sans-serif" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
            2.º
          </text>
          <text x="180" y="292" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="900" letterSpacing="1">
            LUGAR
          </text>

          {/* Faixa do Título Exclusivo Inferior */}
          <path d="M105 325 L255 325 L245 352 L115 352 Z" fill="url(#silverRim)" stroke="#1e293b" strokeWidth="1.2" />
          <line x1="108" y1="326" x2="252" y2="326" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.9" />
          <text x="180" y="342" textAnchor="middle" fill="#0f172a" fontSize="8.5" fontWeight="950" fontFamily="sans-serif" letterSpacing="1.2">
            SENHOR DA RIVALIDADE
          </text>

          {/* Louros Esculpidos em Prata na Base */}
          <path d="M120 280 C110 305, 125 330, 150 340" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M240 280 C250 305, 235 330, 210 340" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* Brilhos Diamantinos */}
        <path d="M125 190 Q130 190 130 185 Q130 190 135 190 Q130 190 130 195 Q130 190 125 190 Z" fill="#ffffff" opacity="0.9" />
        <path d="M245 230 Q250 230 250 225 Q250 230 255 230 Q250 230 250 235 Q250 230 245 230 Z" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  )
}

/**
 * 🥉 3.º LUGAR — MEDALHA DE BRONZE — PORTO × LISBOA 2026
 * Medalha de bronze nobre e cobre polido com relevos cinzelados,
 * pátina requintada, acabamento militar comemorativo e reflexos quentes.
 */
export function MedalBronze3D({
  teamSide,
  size = 'md',
  interactive = true,
  className,
  showAura = true,
}: Omit<Trophy3DProps, 'placement'>) {
  const sizeMap = {
    sm: 'w-24 h-28',
    md: 'w-40 h-48',
    lg: 'w-56 h-68',
    xl: 'w-72 h-88',
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none group',
        sizeMap[size],
        interactive && 'transition-transform duration-500 hover:scale-105',
        className
      )}
    >
      {/* Halo de Luz Bronze Quente */}
      {showAura && (
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-amber-700/30 via-orange-600/15 to-transparent blur-2xl pointer-events-none transition-opacity duration-700 opacity-70 group-hover:opacity-100" />
      )}

      <svg
        viewBox="0 0 360 440"
        className="w-full h-full relative z-10 filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Bronze Radial Envelhecido e Polido */}
          <radialGradient id="bronzeBody" cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="55%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>

          {/* Aro em Cobre Nobre com Reflexo */}
          <linearGradient id="bronzeRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="25%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#9a3412" />
            <stop offset="75%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>

          {/* Fita Nobre Carmesim e Dourada */}
          <linearGradient id="ribbonBronze" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="35%" stopColor="#dc2626" />
            <stop offset="48%" stopColor="#f59e0b" />
            <stop offset="52%" stopColor="#fbbf24" />
            <stop offset="65%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <filter id="shadowBronze" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#000000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. Fita Cerimonial */}
        <g filter="url(#shadowBronze)">
          <path d="M120 20 L180 160 L140 160 L95 20 Z" fill="url(#ribbonBronze)" />
          <path d="M240 20 L180 160 L220 160 L265 20 Z" fill="url(#ribbonBronze)" />
        </g>

        {/* Presilha de Bronze */}
        <g filter="url(#shadowBronze)">
          <ellipse cx="180" cy="160" rx="22" ry="12" fill="url(#bronzeRim)" stroke="#451a03" strokeWidth="2" />
          <ellipse cx="180" cy="160" rx="15" ry="7" fill="#1c0b00" />
        </g>

        {/* 2. Disco da Medalha de Bronze */}
        <g filter="url(#shadowBronze)">
          {/* Aro Exterior Canelado */}
          <circle cx="180" cy="270" r="120" fill="url(#bronzeRim)" stroke="#270a03" strokeWidth="3" />

          {/* Relevo Central */}
          <circle cx="180" cy="270" r="112" fill="url(#bronzeBody)" stroke="#fef08a" strokeWidth="1.2" strokeOpacity="0.6" />

          {/* Anel Interno Cinzelado com Parafusos */}
          <circle cx="180" cy="270" r="96" fill="#2e0f06" />
          <circle cx="180" cy="270" r="92" fill="url(#bronzeBody)" stroke="#9a3412" strokeWidth="1.5" />

          {/* Inscrições em Relevo */}
          <text x="180" y="202" textAnchor="middle" fill="#2b0f06" fontSize="10.5" fontWeight="950" fontFamily="sans-serif" letterSpacing="2">
            PORTO × LISBOA
          </text>
          <text x="180" y="215" textAnchor="middle" fill="#591c0b" fontSize="8" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">
            EDIÇÃO OFICIAL 2026
          </text>

          {/* Escudo Central com 3.º Lugar */}
          <circle cx="180" cy="275" r="48" fill="url(#bronzeRim)" stroke="#270a03" strokeWidth="2" />
          <circle cx="180" cy="275" r="44" fill="#1c0a05" stroke="#f59e0b" strokeWidth="1" />

          {/* Número 3.º em Bronze Nobre */}
          <text x="180" y="270" textAnchor="middle" fill="#fed7aa" fontSize="28" fontWeight="950" fontFamily="sans-serif" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">
            3.º
          </text>
          <text x="180" y="292" textAnchor="middle" fill="#d97706" fontSize="10" fontWeight="900" letterSpacing="1">
            LUGAR
          </text>

          {/* Faixa com Título Exclusivo */}
          <path d="M100 325 L260 325 L250 352 L110 352 Z" fill="url(#bronzeRim)" stroke="#270a03" strokeWidth="1.2" />
          <line x1="104" y1="326" x2="256" y2="326" stroke="#fef08a" strokeWidth="1" strokeOpacity="0.8" />
          <text x="180" y="342" textAnchor="middle" fill="#1f0701" fontSize="8" fontWeight="950" fontFamily="sans-serif" letterSpacing="0.8">
            GUERREIRO DA RIVALIDADE
          </text>
        </g>

        {/* Faíscas de Brilho */}
        <path d="M125 210 Q130 210 130 205 Q130 210 135 210 Q130 210 130 215 Q130 210 125 210 Z" fill="#ffffff" opacity="0.85" />
      </svg>
    </div>
  )
}

/**
 * Componente Mestre Dinâmico para renderizar qualquer um dos 3 prémios por colocação
 */
export function PortoLisboaPrize3D({
  placement,
  teamSide = null,
  size = 'md',
  interactive = true,
  className,
  showAura = true,
}: Trophy3DProps) {
  if (placement === 1) {
    return (
      <TrophySupremo3D
        teamSide={teamSide}
        size={size}
        interactive={interactive}
        className={className}
        showAura={showAura}
      />
    )
  }

  if (placement === 2) {
    return (
      <MedalPrata3D
        teamSide={teamSide}
        size={size}
        interactive={interactive}
        className={className}
        showAura={showAura}
      />
    )
  }

  return (
    <MedalBronze3D
      teamSide={teamSide}
      size={size}
      interactive={interactive}
      className={className}
      showAura={showAura}
    />
  )
}
