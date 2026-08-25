'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

export interface AudioContextType {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  toggleMute: () => void
  togglePlay: () => void
  setVolume: (val: number) => void
  playBgm: () => Promise<void>
  pauseBgm: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

const DEFAULT_VOLUME = 0.35
const AUDIO_SRC = '/audio/bgm-main.mp3'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(DEFAULT_VOLUME)
  const userInteractedRef = useRef<boolean>(false)

  // 1. Inicializar preferências salvas do LocalStorage
  useEffect(() => {
    try {
      const savedMuted = localStorage.getItem('bgm_muted')
      if (savedMuted !== null) {
        setIsMuted(savedMuted === 'true')
      }

      const savedVol = localStorage.getItem('bgm_volume')
      if (savedVol !== null) {
        const parsedVol = parseFloat(savedVol)
        if (!isNaN(parsedVol) && parsedVol >= 0 && parsedVol <= 1) {
          setVolumeState(parsedVol)
        }
      }

      const savedEnabled = localStorage.getItem('bgm_enabled') || localStorage.getItem('ap_music_enabled')
      if (savedEnabled === 'false') {
        setIsPlaying(false)
      } else {
        // Por padrão, música ativada
        setIsPlaying(true)
      }
    } catch (e) {
      console.error('[AudioProvider] Erro ao carregar preferências:', e)
    }
  }, [])

  // 2. Aplicar volume e mute ao elemento de áudio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // 3. Função de reprodução segura (com tratamento de autoplay policy dos browsers)
  const playBgm = useCallback(async () => {
    if (!audioRef.current) return
    try {
      audioRef.current.volume = volume
      audioRef.current.muted = isMuted
      const promise = audioRef.current.play()
      if (promise !== undefined) {
        await promise
        setIsPlaying(true)
        localStorage.setItem('bgm_enabled', 'true')
        localStorage.setItem('ap_music_enabled', 'true')
      }
    } catch (err: any) {
      // Bloqueio de autoplay do navegador antes de interação
      console.log('[AudioProvider] Aguardando interação para iniciar áudio:', err?.message || err)
    }
  }, [volume, isMuted])

  const pauseBgm = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
    localStorage.setItem('bgm_enabled', 'false')
    localStorage.setItem('ap_music_enabled', 'false')
  }, [])

  // 4. Alternar Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      localStorage.setItem('bgm_muted', String(next))
      return next
    })
  }, [])

  // 5. Alternar Play/Pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseBgm()
    } else {
      playBgm()
    }
  }, [isPlaying, pauseBgm, playBgm])

  // 6. Ajustar Volume (0.0 a 1.0)
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
    localStorage.setItem('bgm_volume', String(clamped))
  }, [])

  // 7. Desbloqueio automático de áudio no primeiro clique/toque do utilizador
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (userInteractedRef.current) return
      userInteractedRef.current = true

      const savedPref = localStorage.getItem('bgm_enabled') ?? localStorage.getItem('ap_music_enabled')
      if (savedPref !== 'false' && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {})
      }

      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('click', handleFirstInteraction)
    }

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    window.addEventListener('click', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('click', handleFirstInteraction)
    }
  }, [])

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        toggleMute,
        togglePlay,
        setVolume,
        playBgm,
        pauseBgm,
      }}
    >
      {/* Elemento de áudio HTML5 ÚNICO e PERSISTENTE no Root Layout */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="auto"
        playsInline
      />
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio deve ser utilizado dentro de um AudioProvider')
  }
  return context
}

export default AudioContext
