'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'

export interface AudioContextType {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  currentTrackIndex: number
  playlist: readonly string[]
  toggleMute: () => void
  togglePlay: () => void
  setVolume: (val: number) => void
  playBgm: () => Promise<void>
  pauseBgm: () => void
  nextTrack: () => void
  prevTrack: () => void
  setTrack: (index: number) => void
}

const AudioContext = createContext<AudioContextType | null>(null)

const DEFAULT_VOLUME = 0.35

/**
 * Playlist global oficial de música de fundo do Acorda Portugal.
 * Reprodução contínua em loop sequencial: 1 -> 2 -> 3 -> 4 -> 1.
 */
export const BGM_PLAYLIST: readonly string[] = [
  '/audio/musica-01.mp3',
  '/audio/musica-02.mp3',
  '/audio/musica-03.mp3',
  '/audio/musica-04.mp3',
] as const

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(DEFAULT_VOLUME)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0)

  // Refs de sincronização para evitar re-criação de listeners e re-trigger acidental de faixas
  const activeTrackIndexRef = useRef<number>(0)
  const isPlayingRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(false)
  const volumeRef = useRef<number>(DEFAULT_VOLUME)
  const userInteractedRef = useRef<boolean>(false)

  // Manter refs em sincronia com o estado
  isPlayingRef.current = isPlaying
  isMutedRef.current = isMuted
  volumeRef.current = volume
  activeTrackIndexRef.current = currentTrackIndex

  // Pré-carregamento suave da próxima faixa para eliminar silêncio/pausa
  const preloadNextTrack = useCallback((index: number) => {
    if (typeof window === 'undefined' || BGM_PLAYLIST.length <= 1) return
    const nextIdx = (index + 1) % BGM_PLAYLIST.length
    const nextSrc = BGM_PLAYLIST[nextIdx]
    if (preloadRef.current && nextSrc) {
      preloadRef.current.src = nextSrc
      preloadRef.current.load()
    }
  }, [])

  // Função interna de carregamento seguro de faixa
  const loadAndPlayTrack = useCallback(
    async (index: number, shouldPlay: boolean) => {
      const audio = audioRef.current
      if (!audio || BGM_PLAYLIST.length === 0) return

      const validIndex = ((index % BGM_PLAYLIST.length) + BGM_PLAYLIST.length) % BGM_PLAYLIST.length
      const targetSrc = BGM_PLAYLIST[validIndex]

      // Apenas reatribui src se realmente for uma faixa diferente
      const currentResolvedSrc = audio.src
      const isDifferentTrack =
        !currentResolvedSrc ||
        !currentResolvedSrc.endsWith(targetSrc)

      if (isDifferentTrack) {
        audio.src = targetSrc
        audio.currentTime = 0
        audio.load()
      }

      audio.volume = volumeRef.current
      audio.muted = isMutedRef.current

      preloadNextTrack(validIndex)

      if (shouldPlay) {
        try {
          await audio.play()
          setIsPlaying(true)
          isPlayingRef.current = true
          localStorage.setItem('bgm_enabled', 'true')
          localStorage.setItem('ap_music_enabled', 'true')
        } catch {
          // Autoplay bloqueado pelo browser até haver interação do utilizador
        }
      }
    },
    [preloadNextTrack]
  )

  // 1. Inicialização de preferências salvas e autoplay seguro no primeiro render
  useEffect(() => {
    if (typeof window === 'undefined') return

    let initialMuted = false
    let initialVolume = DEFAULT_VOLUME
    let shouldStartPlaying = true

    try {
      const savedMuted = localStorage.getItem('bgm_muted')
      if (savedMuted !== null) {
        initialMuted = savedMuted === 'true'
        setIsMuted(initialMuted)
        isMutedRef.current = initialMuted
      }

      const savedVol = localStorage.getItem('bgm_volume')
      if (savedVol !== null) {
        const parsedVol = parseFloat(savedVol)
        if (!isNaN(parsedVol) && parsedVol >= 0 && parsedVol <= 1) {
          initialVolume = parsedVol
          setVolumeState(initialVolume)
          volumeRef.current = initialVolume
        }
      }

      const savedEnabled =
        localStorage.getItem('bgm_enabled') ?? localStorage.getItem('ap_music_enabled')
      if (savedEnabled === 'false') {
        shouldStartPlaying = false
      }
    } catch (e) {
      console.warn('[AudioProvider] Erro ao ler localStorage:', e)
    }

    const audio = audioRef.current
    if (audio && BGM_PLAYLIST.length > 0) {
      audio.volume = initialVolume
      audio.muted = initialMuted
      if (!audio.src || !audio.src.endsWith(BGM_PLAYLIST[0])) {
        audio.src = BGM_PLAYLIST[0]
        audio.load()
      }
      preloadNextTrack(0)

      if (shouldStartPlaying) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            isPlayingRef.current = true
          })
          .catch(() => {
            // Autoplay bloqueado: aguarda o primeiro clique/toque
            const handleFirstGesture = () => {
              if (userInteractedRef.current) return
              userInteractedRef.current = true

              const currentPref =
                localStorage.getItem('bgm_enabled') ??
                localStorage.getItem('ap_music_enabled')
              if (currentPref !== 'false' && audioRef.current) {
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true)
                    isPlayingRef.current = true
                  })
                  .catch(() => {})
              }

              cleanupListeners()
            }

            const cleanupListeners = () => {
              window.removeEventListener('pointerdown', handleFirstGesture)
              window.removeEventListener('touchstart', handleFirstGesture)
              window.removeEventListener('click', handleFirstGesture)
              window.removeEventListener('keydown', handleFirstGesture)
            }

            window.addEventListener('pointerdown', handleFirstGesture, { once: true })
            window.addEventListener('touchstart', handleFirstGesture, { once: true })
            window.addEventListener('click', handleFirstGesture, { once: true })
            window.addEventListener('keydown', handleFirstGesture, { once: true })
          })
      }
    }
  }, [preloadNextTrack])

  // 2. Transição automática ao terminar faixa: onEnded -> faixa seguinte sem pausas
  const handleTrackEnded = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return
    const nextIndex = (activeTrackIndexRef.current + 1) % BGM_PLAYLIST.length
    activeTrackIndexRef.current = nextIndex
    setCurrentTrackIndex(nextIndex)
    loadAndPlayTrack(nextIndex, true)
  }, [loadAndPlayTrack])

  // 3. Controlos de reprodução
  const playBgm = useCallback(async () => {
    if (!audioRef.current || BGM_PLAYLIST.length === 0) return
    try {
      audioRef.current.volume = volumeRef.current
      audioRef.current.muted = isMutedRef.current
      await audioRef.current.play()
      setIsPlaying(true)
      isPlayingRef.current = true
      localStorage.setItem('bgm_enabled', 'true')
      localStorage.setItem('ap_music_enabled', 'true')
    } catch (err: any) {
      console.log('[AudioProvider] Interação necessária para play:', err?.message || err)
    }
  }, [])

  const pauseBgm = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
    isPlayingRef.current = false
    localStorage.setItem('bgm_enabled', 'false')
    localStorage.setItem('ap_music_enabled', 'false')
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pauseBgm()
    } else {
      playBgm()
    }
  }, [pauseBgm, playBgm])

  // 4. Mute / Unmute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      isMutedRef.current = next
      if (audioRef.current) {
        audioRef.current.muted = next
      }
      localStorage.setItem('bgm_muted', String(next))
      return next
    })
  }, [])

  // 5. Volume (0.0 a 1.0)
  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolumeState(clamped)
    volumeRef.current = clamped
    if (audioRef.current) {
      audioRef.current.volume = clamped
    }
    localStorage.setItem('bgm_volume', String(clamped))
  }, [])

  // 6. Navegação manual de faixas
  const setTrack = useCallback(
    (index: number) => {
      if (BGM_PLAYLIST.length === 0) return
      const validIndex = ((index % BGM_PLAYLIST.length) + BGM_PLAYLIST.length) % BGM_PLAYLIST.length
      activeTrackIndexRef.current = validIndex
      setCurrentTrackIndex(validIndex)
      loadAndPlayTrack(validIndex, isPlayingRef.current)
    },
    [loadAndPlayTrack]
  )

  const nextTrack = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return
    const nextIndex = (activeTrackIndexRef.current + 1) % BGM_PLAYLIST.length
    activeTrackIndexRef.current = nextIndex
    setCurrentTrackIndex(nextIndex)
    loadAndPlayTrack(nextIndex, isPlayingRef.current)
  }, [loadAndPlayTrack])

  const prevTrack = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return
    const prevIndex =
      (activeTrackIndexRef.current - 1 + BGM_PLAYLIST.length) % BGM_PLAYLIST.length
    activeTrackIndexRef.current = prevIndex
    setCurrentTrackIndex(prevIndex)
    loadAndPlayTrack(prevIndex, isPlayingRef.current)
  }, [loadAndPlayTrack])

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        currentTrackIndex,
        playlist: BGM_PLAYLIST,
        toggleMute,
        togglePlay,
        setVolume,
        playBgm,
        pauseBgm,
        nextTrack,
        prevTrack,
        setTrack,
      }}
    >
      {/* 
        Elemento de áudio global persistente montado no layout raiz.
        Permanece vivo sem reiniciar durante a navegação entre rotas (/jogar, /ranking, etc.).
      */}
      <audio
        ref={audioRef}
        src={BGM_PLAYLIST[0]}
        onEnded={handleTrackEnded}
        preload="auto"
        playsInline
      />
      {/* Elemento secundário silencioso apenas para buffering preventivo da próxima faixa */}
      <audio
        ref={preloadRef}
        preload="auto"
        muted
        playsInline
        style={{ display: 'none' }}
      />
      {children}
    </AudioContext.Provider>
  )
}

const fallbackAudio: AudioContextType = {
  isPlaying: false,
  isMuted: false,
  volume: DEFAULT_VOLUME,
  currentTrackIndex: 0,
  playlist: BGM_PLAYLIST,
  toggleMute: () => {},
  togglePlay: () => {},
  setVolume: () => {},
  playBgm: async () => {},
  pauseBgm: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  setTrack: () => {},
}

export function useAudio() {
  const context = useContext(AudioContext)
  return context || fallbackAudio
}

export default AudioContext

