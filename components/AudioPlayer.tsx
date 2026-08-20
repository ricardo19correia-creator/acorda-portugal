'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Volume equilibrado de fundo (30%)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedPref = localStorage.getItem('ap_music_enabled');
    if (savedPref === 'true') {
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Se o navegador bloquear antes do primeiro clique do jogador
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
    localStorage.setItem('ap_music_enabled', String(isPlaying));
  }, [isPlaying, volume]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-zinc-950/85 backdrop-blur-md border border-emerald-500/40 px-3.5 py-2 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all hover:border-emerald-400">
      {/* Áudio em loop contínuo */}
      <audio
        ref={audioRef}
        src="/audio/theme-bg.mp3"
        loop
        preload="auto"
      />

      {/* Botão Interativo On/Off */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 text-xs font-black tracking-wide text-zinc-200 hover:text-emerald-400 transition-colors cursor-pointer"
        title={isPlaying ? 'Pausar Banda Sonora' : 'Tocar Banda Sonora'}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400">BGM ON</span>
          </>
        ) : (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600"></span>
            <span className="text-zinc-400">BGM OFF</span>
          </>
        )}
      </button>
    </div>
  );
}
