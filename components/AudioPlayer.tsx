'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AudioPlayer({ className = '' }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedPref = localStorage.getItem('ap_music_enabled');
    if (savedPref === 'true') {
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.35;
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Autoplay aguardando interação:', err);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
    localStorage.setItem('ap_music_enabled', String(isPlaying));
  }, [isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={`flex items-center select-none ${className}`}>
      <audio ref={audioRef} src="/audio/theme-bg.mp3" loop preload="auto" playsInline />
      <button
        type="button"
        onClick={togglePlay}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
          isPlaying
            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`}
        title={isPlaying ? 'Desligar Música' : 'Ligar Música'}
      >
        {isPlaying ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-wide">🔊 SOM</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="text-[11px] font-extrabold tracking-wide">🔇 MUDO</span>
          </>
        )}
      </button>
    </div>
  );
}
