'use client'

import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function AudioPlayer({
  className = '',
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'compact'
}) {
  const { isPlaying, isMuted, toggleMute, togglePlay } = useAudio()

  const isActive = isPlaying && !isMuted

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isPlaying) {
      togglePlay()
    } else {
      toggleMute()
    }
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center select-none shrink-0 ${className}`}>
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
            isActive
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/40'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
          title={isActive ? 'Silenciar Música (BGM)' : 'Ativar Música (BGM)'}
          aria-label={isActive ? 'Silenciar Música' : 'Ativar Música'}
        >
          {isActive ? (
            <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
          ) : (
            <VolumeX className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center select-none shrink-0 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer active:scale-95 ${
          isActive
            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/30'
            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
        }`}
        title={isActive ? 'Silenciar Música (BGM)' : 'Ativar Música (BGM)'}
        aria-label={isActive ? 'Silenciar Música' : 'Ativar Música'}
      >
        {isActive ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-black tracking-wider uppercase">BGM ON</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <VolumeX className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-black tracking-wider uppercase">BGM OFF</span>
          </>
        )}
      </button>
    </div>
  )
}
