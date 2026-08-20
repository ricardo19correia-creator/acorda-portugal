'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65); // Volume aumentado e bem audível
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicialização e tentativa no primeiro clique global
  useEffect(() => {
    const savedPref = localStorage.getItem('ap_music_enabled');
    const wantsMusic = savedPref !== 'false'; // Padrão: ligado se não foi explicitamente desligado

    const tryAutoStartOnFirstClick = () => {
      if (!userInteracted && audioRef.current && wantsMusic) {
        setUserInteracted(true);
        audioRef.current.volume = volume;
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            localStorage.setItem('ap_music_enabled', 'true');
          })
          .catch((err) => {
            console.log('Autoplay aguardando interação direta:', err);
          });
      }
    };

    window.addEventListener('click', tryAutoStartOnFirstClick, { once: true });
    window.addEventListener('keydown', tryAutoStartOnFirstClick, { once: true });
    window.addEventListener('touchstart', tryAutoStartOnFirstClick, { once: true });

    return () => {
      window.removeEventListener('click', tryAutoStartOnFirstClick);
      window.removeEventListener('keydown', tryAutoStartOnFirstClick);
      window.removeEventListener('touchstart', tryAutoStartOnFirstClick);
    };
  }, [userInteracted, volume]);

  // Atualizar volume dinamicamente
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Ação Direta no Clique do Botão (Garantido pelos navegadores)
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem('ap_music_enabled', 'false');
    } else {
      audioRef.current.volume = volume;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem('ap_music_enabled', 'true');
        })
        .catch((err) => {
          console.error('Erro ao reproduzir áudio:', err);
        });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-zinc-950/90 backdrop-blur-xl border border-emerald-500/50 px-4 py-2.5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:border-emerald-400 group">
      {/* Elemento de Áudio HTML5 */}
      <audio
        ref={audioRef}
        src="/audio/theme-bg.mp3"
        loop
        preload="auto"
        playsInline
      />

      {/* Botão Principal Play/Pause com Equalizador */}
      <button
        type="button"
        onClick={togglePlay}
        className="flex items-center gap-2.5 text-xs font-black tracking-wider text-zinc-100 hover:text-emerald-400 transition-colors cursor-pointer"
        title={isPlaying ? 'Pausar Banda Sonora' : 'Tocar Banda Sonora'}
      >
        {isPlaying ? (
          <>
            {/* Equalizador Animado */}
            <div className="flex items-end gap-0.5 h-3.5 w-3.5">
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-full" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1.1s_infinite] h-2/3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite] h-4/5" />
            </div>
            <span className="text-emerald-400 font-extrabold">SOM ON</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">🔇</span>
            <span className="text-zinc-400 font-extrabold group-hover:text-emerald-300">
              SOM OFF (CLICA)
            </span>
          </>
        )}
      </button>

      {/* Controlo de Volume Integrado */}
      <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-zinc-800">
        <span className="text-[10px] text-zinc-400">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
}
