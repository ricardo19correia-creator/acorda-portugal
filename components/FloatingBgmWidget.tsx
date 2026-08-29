'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Volume2, VolumeX, Music, ChevronUp, ChevronDown, Volume1 } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export function FloatingBgmWidget() {
  const pathname = usePathname()
  const { isPlaying, isMuted, volume, toggleMute, togglePlay, setVolume } = useAudio()
  const [isExpanded, setIsExpanded] = useState(false)

  const publicRoutes = ['/criadores', '/termos', '/privacidade', '/contacto']

  if (publicRoutes.some((route) => pathname?.startsWith(route))) {
    return null
  }

  const isActive = isPlaying && !isMuted

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none flex flex-col items-end gap-1.5 font-sans">
      {/* Painel expandido com slider de volume */}
      {isExpanded && (
        <div className="bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200 flex flex-col gap-2.5 w-48 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <Music className="w-3.5 h-3.5" />
              <span>MÚSICA BGM</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slider de Volume */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                {volume === 0 || isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : volume < 0.5 ? <Volume1 className="w-3 h-3 text-cyan-400" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
                <span>Volume</span>
              </span>
              <span className="font-mono text-cyan-300">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value)
                setVolume(newVol)
                if (isMuted && newVol > 0) {
                  toggleMute()
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Botões de Ação Rápida */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={togglePlay}
              className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isPlaying ? 'Pausar' : 'Tocar'}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className={`py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                isMuted
                  ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30'
              }`}
            >
              {isMuted ? 'Desmutar' : 'Silenciar'}
            </button>
          </div>
        </div>
      )}

      {/* Botão Pill Flutuante Principal */}
      <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-800 hover:border-cyan-500/50 rounded-full p-1 shadow-xl backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={toggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isActive
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title={isActive ? 'Silenciar Áudio' : 'Ativar Áudio'}
        >
          {isActive ? (
            <>
              {/* Equalizer bars animation */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s] h-2/3" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-4/5" />
              </div>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            </>
          )}
          <span className="text-[10px] font-black tracking-wider uppercase">
            {isActive ? `${Math.round(volume * 100)}%` : 'MUTE'}
          </span>
        </button>

        {/* Toggle para expandir painel */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-1.5 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Opções de Áudio"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default FloatingBgmWidget
