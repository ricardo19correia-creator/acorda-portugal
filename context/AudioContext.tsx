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
 * Reprodução contínua e dinâmica de faixas aleatórias sem repetição imediata.
 */
export const BGM_PLAYLIST: readonly string[] = [
  '/audio/musica-01.mp3',
  '/audio/musica-02.mp3',
  '/audio/musica-03.mp3',
  '/audio/musica-04.mp3',
] as const

/**
 * Retorna o próximo índice aleatório a partir de um pool de faixas não tocadas.
 * Se o pool estiver vazio, regenera todas as faixas exceto a atual, garantindo
 * reprodução contínua, variada e sem repetição consecutiva da mesma música.
 */
export function getNextRandomTrack(
  currentIdx: number,
  unplayedPool: number[],
  playlistLength: number = BGM_PLAYLIST.length
): { nextIndex: number; newPool: number[] } {
  if (playlistLength <= 1) return { nextIndex: 0, newPool: [] }

  let available = unplayedPool.filter(
    (idx) => idx !== currentIdx && idx >= 0 && idx < playlistLength
  )

  if (available.length === 0) {
    available = []
    for (let i = 0; i < playlistLength; i++) {
      if (i !== currentIdx) {
        available.push(i)
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * available.length)
  const selectedIndex = available[randomIndex]
  const newPool = available.filter((idx) => idx !== selectedIndex)

  return { nextIndex: selectedIndex, newPool }
}

/**
 * Escolhe aleatoriamente uma faixa inicial para a nova sessão.
 * Se houver uma faixa anterior em cache, tenta excluí-la para variar o início da sessão.
 */
export function pickInitialRandomTrack(
  lastPlayedIndex: number | null,
  playlistLength: number = BGM_PLAYLIST.length
): number {
  if (playlistLength <= 1) return 0

  const candidates: number[] = []
  for (let i = 0; i < playlistLength; i++) {
    if (lastPlayedIndex === null || i !== lastPlayedIndex) {
      candidates.push(i)
    }
  }

  if (candidates.length === 0) {
    return Math.floor(Math.random() * playlistLength)
  }

  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex]
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolumeState] = useState<number>(DEFAULT_VOLUME)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0)

  // Refs de sincronização e gestão de reprodução aleatória
  const activeTrackIndexRef = useRef<number>(0)
  const isPlayingRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(false)
  const volumeRef = useRef<number>(DEFAULT_VOLUME)
  const userInteractedRef = useRef<boolean>(false)

  // Pool dinâmico de faixas não tocadas e pré-carregamento suave
  const unplayedPoolRef = useRef<number[]>([])
  const nextCandidateRef = useRef<number | null>(null)
  const historyRef = useRef<number[]>([])

  // Manter refs em sincronia com o estado
  isPlayingRef.current = isPlaying
  isMutedRef.current = isMuted
  volumeRef.current = volume
  activeTrackIndexRef.current = currentTrackIndex

  // Pré-carregamento suave em elemento secundário
  const preloadTrack = useCallback((index: number) => {
    if (typeof window === 'undefined' || BGM_PLAYLIST.length <= 1) return
    const src = BGM_PLAYLIST[index]
    if (preloadRef.current && src) {
      preloadRef.current.src = src
      preloadRef.current.load()
    }
  }, [])

  // Sorteia antecipadamente a próxima faixa aleatória e inicia o pré-carregamento
  const prepareNextCandidate = useCallback(
    (currentIdx: number) => {
      const { nextIndex, newPool } = getNextRandomTrack(
        currentIdx,
        unplayedPoolRef.current,
        BGM_PLAYLIST.length
      )
      nextCandidateRef.current = nextIndex
      unplayedPoolRef.current = newPool
      preloadTrack(nextIndex)
      return nextIndex
    },
    [preloadTrack]
  )

  // Função interna de carregamento seguro de faixa sem sobreposição nem reinícios acidentais
  const loadAndPlayTrack = useCallback(
    async (index: number, shouldPlay: boolean) => {
      const audio = audioRef.current
      if (!audio || BGM_PLAYLIST.length === 0) return

      const validIndex = ((index % BGM_PLAYLIST.length) + BGM_PLAYLIST.length) % BGM_PLAYLIST.length
      const targetSrc = BGM_PLAYLIST[validIndex]

      // Apenas reatribui src se for realmente uma faixa diferente
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

      // Prepara antecipadamente a próxima faixa aleatória
      prepareNextCandidate(validIndex)

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
    [prepareNextCandidate]
  )

  // 1. Inicialização com escolha aleatória de faixa por sessão e preferências salvas
  useEffect(() => {
    if (typeof window === 'undefined') return

    let initialMuted = false
    let initialVolume = DEFAULT_VOLUME
    let shouldStartPlaying = true
    let lastTrackIndex: number | null = null

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

      const savedLast =
        localStorage.getItem('ap_bgm_last_track') ?? localStorage.getItem('bgm_last_track')
      if (savedLast !== null) {
        const parsedLast = parseInt(savedLast, 10)
        if (!isNaN(parsedLast) && parsedLast >= 0 && parsedLast < BGM_PLAYLIST.length) {
          lastTrackIndex = parsedLast
        }
      }
    } catch (e) {
      console.warn('[AudioProvider] Erro ao ler localStorage:', e)
    }

    // Escolha aleatória da música que inicia a sessão
    const initialTrack = pickInitialRandomTrack(lastTrackIndex, BGM_PLAYLIST.length)
    activeTrackIndexRef.current = initialTrack
    setCurrentTrackIndex(initialTrack)

    try {
      localStorage.setItem('ap_bgm_last_track', String(initialTrack))
      localStorage.setItem('bgm_last_track', String(initialTrack))
    } catch {}

    // Inicializar pool de faixas não tocadas
    const initialPool: number[] = []
    for (let i = 0; i < BGM_PLAYLIST.length; i++) {
      if (i !== initialTrack) initialPool.push(i)
    }
    unplayedPoolRef.current = initialPool

    // Preparar antecipadamente e pré-carregar a próxima faixa candidata
    prepareNextCandidate(initialTrack)

    const audio = audioRef.current
    if (audio && BGM_PLAYLIST.length > 0) {
      audio.volume = initialVolume
      audio.muted = initialMuted

      const initialSrc = BGM_PLAYLIST[initialTrack]
      if (!audio.src || !audio.src.endsWith(initialSrc)) {
        audio.src = initialSrc
        audio.currentTime = 0
        audio.load()
      }

      if (shouldStartPlaying) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true)
            isPlayingRef.current = true
          })
          .catch(() => {
            // Autoplay bloqueado: aguarda o primeiro gesto do utilizador
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
  }, [prepareNextCandidate])

  // 2. Transição automática ao terminar faixa: onEnded -> próxima faixa aleatória sem repetições
  const handleTrackEnded = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return

    const currentTrack = activeTrackIndexRef.current
    historyRef.current.push(currentTrack)
    if (historyRef.current.length > 20) {
      historyRef.current.shift()
    }

    let nextIndex = nextCandidateRef.current
    if (nextIndex === null || nextIndex === currentTrack) {
      const result = getNextRandomTrack(
        currentTrack,
        unplayedPoolRef.current,
        BGM_PLAYLIST.length
      )
      nextIndex = result.nextIndex
      unplayedPoolRef.current = result.newPool
    }
    nextCandidateRef.current = null

    activeTrackIndexRef.current = nextIndex
    setCurrentTrackIndex(nextIndex)

    try {
      localStorage.setItem('ap_bgm_last_track', String(nextIndex))
      localStorage.setItem('bgm_last_track', String(nextIndex))
    } catch {}

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

  // 6. Navegação de faixas
  const setTrack = useCallback(
    (index: number) => {
      if (BGM_PLAYLIST.length === 0) return
      const validIndex = ((index % BGM_PLAYLIST.length) + BGM_PLAYLIST.length) % BGM_PLAYLIST.length
      const currentTrack = activeTrackIndexRef.current
      if (currentTrack !== validIndex) {
        historyRef.current.push(currentTrack)
      }
      nextCandidateRef.current = null
      activeTrackIndexRef.current = validIndex
      setCurrentTrackIndex(validIndex)

      try {
        localStorage.setItem('ap_bgm_last_track', String(validIndex))
        localStorage.setItem('bgm_last_track', String(validIndex))
      } catch {}

      loadAndPlayTrack(validIndex, isPlayingRef.current)
    },
    [loadAndPlayTrack]
  )

  const nextTrack = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return

    const currentTrack = activeTrackIndexRef.current
    historyRef.current.push(currentTrack)
    if (historyRef.current.length > 20) {
      historyRef.current.shift()
    }

    let nextIndex = nextCandidateRef.current
    if (nextIndex === null || nextIndex === currentTrack) {
      const result = getNextRandomTrack(
        currentTrack,
        unplayedPoolRef.current,
        BGM_PLAYLIST.length
      )
      nextIndex = result.nextIndex
      unplayedPoolRef.current = result.newPool
    }
    nextCandidateRef.current = null

    activeTrackIndexRef.current = nextIndex
    setCurrentTrackIndex(nextIndex)

    try {
      localStorage.setItem('ap_bgm_last_track', String(nextIndex))
      localStorage.setItem('bgm_last_track', String(nextIndex))
    } catch {}

    loadAndPlayTrack(nextIndex, isPlayingRef.current)
  }, [loadAndPlayTrack])

  const prevTrack = useCallback(() => {
    if (BGM_PLAYLIST.length === 0) return

    const currentTrack = activeTrackIndexRef.current
    let targetIndex: number

    if (historyRef.current.length > 0) {
      targetIndex = historyRef.current.pop()!
    } else {
      const result = getNextRandomTrack(
        currentTrack,
        unplayedPoolRef.current,
        BGM_PLAYLIST.length
      )
      targetIndex = result.nextIndex
    }

    nextCandidateRef.current = null
    activeTrackIndexRef.current = targetIndex
    setCurrentTrackIndex(targetIndex)

    try {
      localStorage.setItem('ap_bgm_last_track', String(targetIndex))
      localStorage.setItem('bgm_last_track', String(targetIndex))
    } catch {}

    loadAndPlayTrack(targetIndex, isPlayingRef.current)
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
        src é gerido imperativamente para prevenir resets no ciclo de vida do React.
        Permanece vivo sem reiniciar durante a navegação entre rotas (/jogar, /ranking, etc.).
      */}
      <audio
        ref={audioRef}
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

