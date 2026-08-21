'use client'

import React, { useState } from 'react'

interface DistrictInfo {
  id: string
  name: string
  online: number
  color: string
  path: string
  labelPos: { x: number; y: number }
}

export function PortugalMap3D({
  className = '',
  selectedDistrict,
  onSelectDistrict,
}: {
  className?: string
  selectedDistrict?: string | null
  onSelectDistrict?: (name: string) => void
} = {}) {
  const [hovered, setHovered] = useState<string | null>(null)

  // 18 Distritos Oficiais com contornos fechados e ajustados
  const districts: DistrictInfo[] = [
    { id: 'viana', name: 'Viana do Castelo', online: 1, color: '#10b981', labelPos: { x: 80, y: 35 }, path: 'M60,20 L95,15 L105,40 L75,55 L55,35 Z' },
    { id: 'braga', name: 'Braga', online: 2, color: '#3b82f6', labelPos: { x: 105, y: 60 }, path: 'M75,55 L105,40 L135,50 L125,75 L85,70 Z' },
    { id: 'porto', name: 'Porto', online: 4, color: '#8b5cf6', labelPos: { x: 70, y: 85 }, path: 'M55,70 L85,70 L95,95 L60,105 L45,85 Z' },
    { id: 'vilareal', name: 'Vila Real', online: 1, color: '#f59e0b', labelPos: { x: 140, y: 80 }, path: 'M105,40 L155,35 L170,85 L125,100 L125,75 Z' },
    { id: 'braganca', name: 'Bragança', online: 0, color: '#ef4444', labelPos: { x: 205, y: 55 }, path: 'M155,35 L225,30 L245,75 L195,105 L170,85 Z' },
    { id: 'aveiro', name: 'Aveiro', online: 1, color: '#06b6d4', labelPos: { x: 75, y: 130 }, path: 'M60,105 L95,95 L110,145 L70,155 L55,125 Z' },
    { id: 'viseu', name: 'Viseu', online: 0, color: '#6366f1', labelPos: { x: 135, y: 130 }, path: 'M125,100 L170,85 L180,145 L130,160 L110,145 Z' },
    { id: 'guarda', name: 'Guarda', online: 0, color: '#14b8a6', labelPos: { x: 195, y: 140 }, path: 'M170,85 L195,105 L230,125 L215,185 L180,145 Z' },
    { id: 'coimbra', name: 'Coimbra', online: 2, color: '#3b82f6', labelPos: { x: 95, y: 180 }, path: 'M70,155 L110,145 L130,160 L140,205 L80,210 Z' },
    { id: 'castelobranco', name: 'Castelo Branco', online: 0, color: '#f97316', labelPos: { x: 175, y: 200 }, path: 'M180,145 L215,185 L200,240 L145,230 L140,205 Z' },
    { id: 'leiria', name: 'Leiria', online: 1, color: '#84cc16', labelPos: { x: 65, y: 235 }, path: 'M55,200 L80,210 L95,260 L60,265 L45,225 Z' },
    { id: 'santarem', name: 'Santarém', online: 0, color: '#eab308', labelPos: { x: 110, y: 275 }, path: 'M80,210 L140,205 L155,290 L95,305 L95,260 Z' },
    { id: 'lisboa', name: 'Lisboa', online: 6, color: '#ec4899', labelPos: { x: 50, y: 310 }, path: 'M40,270 L80,275 L75,330 L30,335 L25,295 Z' },
    { id: 'portalegre', name: 'Portalegre', online: 0, color: '#a855f7', labelPos: { x: 170, y: 275 }, path: 'M145,230 L200,240 L210,300 L155,290 Z' },
    { id: 'setubal', name: 'Setúbal', online: 2, color: '#0ea5e9', labelPos: { x: 75, y: 365 }, path: 'M30,335 L75,330 L105,340 L85,415 L50,405 Z' },
    { id: 'evora', name: 'Évora', online: 1, color: '#f59e0b', labelPos: { x: 145, y: 355 }, path: 'M155,290 L210,300 L200,395 L125,400 L105,340 Z' },
    { id: 'beja', name: 'Beja', online: 0, color: '#f97316', labelPos: { x: 120, y: 445 }, path: 'M50,405 L125,400 L200,395 L180,485 L70,490 Z' },
    { id: 'faro', name: 'Faro', online: 3, color: '#ef4444', labelPos: { x: 125, y: 520 }, path: 'M70,490 L180,485 L185,535 L65,540 Z' }
  ]

  return (
    <div className={`relative w-full max-w-lg mx-auto flex items-center justify-center select-none ${className}`}>
      {/* Box Arquipélago dos Açores */}
      <div
        onClick={() => onSelectDistrict?.('Açores')}
        className="absolute top-0 left-0 w-44 h-36 bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-3 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-black text-cyan-400 tracking-wider">AÇORES</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">🟢 1 Online</span>
        </div>
        <svg viewBox="0 0 200 120" className="w-full h-24">
          {/* Ilhas Açores Ampliadas */}
          <ellipse cx="30" cy="40" rx="9" ry="5" fill="#06b6d4" />
          <ellipse cx="45" cy="30" rx="7" ry="4" fill="#06b6d4" />
          <ellipse cx="90" cy="55" rx="14" ry="6" fill="#06b6d4" />
          <ellipse cx="115" cy="50" rx="16" ry="6" fill="#06b6d4" />
          <ellipse cx="130" cy="65" rx="12" ry="5" fill="#06b6d4" />
          <ellipse cx="170" cy="80" rx="20" ry="8" fill="#06b6d4" className="animate-pulse" />
          <ellipse cx="185" cy="100" rx="8" ry="4" fill="#06b6d4" />
        </svg>
      </div>

      {/* Box Arquipélago da Madeira */}
      <div
        onClick={() => onSelectDistrict?.('Madeira')}
        className="absolute bottom-4 left-0 w-44 h-36 bg-slate-900/80 border border-pink-500/40 rounded-2xl p-3 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.2)] cursor-pointer"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-black text-pink-400 tracking-wider">MADEIRA</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">🟢 1 Online</span>
        </div>
        <svg viewBox="0 0 160 100" className="w-full h-24">
          {/* Madeira & Porto Santo Ampliadas */}
          <ellipse cx="80" cy="55" rx="34" ry="14" fill="#ec4899" className="animate-pulse" />
          <ellipse cx="135" cy="25" rx="10" ry="6" fill="#ec4899" />
          <ellipse cx="120" cy="85" rx="6" ry="3" fill="#ec4899" />
        </svg>
      </div>

      {/* Portugal Continental Vetorial com Perspetiva 3D */}
      <div className="ml-24 w-80 h-[580px]" style={{ transform: 'perspective(900px) rotateY(-8deg) rotateX(10deg)' }}>
        <svg viewBox="0 0 260 560" className="w-full h-full filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)]">
          {districts.map((d) => (
            <g
              key={d.id}
              onClick={() => onSelectDistrict?.(d.name)}
              onMouseEnter={() => setHovered(d.name)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-transform duration-200 hover:opacity-90"
            >
              <path
                d={d.path}
                fill={d.color}
                stroke="#0f172a"
                strokeWidth="2.5"
                className="transition-all duration-200"
                style={{
                  filter: hovered === d.name ? 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.6))' : 'brightness(0.95)'
                }}
              />
              <text
                x={d.labelPos.x}
                y={d.labelPos.y}
                textAnchor="middle"
                className="text-[9px] font-extrabold fill-white pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              >
                {d.name.toUpperCase()}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default PortugalMap3D
