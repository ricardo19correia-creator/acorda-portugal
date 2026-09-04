'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@/components/auth-provider'
import {
  getThemeMeta,
  getEquippedCosmetics,
  type GameThemeMeta,
  type GameThemeId,
  type SoundpackId,
  type StreakEffectId,
} from '@/lib/cosmetics'
import {
  triggerSoundpackAudio,
  type SoundEvent,
} from '@/lib/sound-engine'

export type GameThemeContextType = {
  themeId: string
  themeMeta: GameThemeMeta
  soundpackId: string
  streakEffectId: string
  previewThemeId: string | null
  previewSoundpackId: string | null
  setPreviewThemeId: (id: string | null) => void
  setPreviewSoundpackId: (id: string | null) => void
  playSound: (event: SoundEvent) => void
  currentStreak: number
  setCurrentStreak: (streak: number) => void
}

const GameThemeContext = createContext<GameThemeContextType | null>(null)

export function GameThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null)
  const [previewSoundpackId, setPreviewSoundpackId] = useState<string | null>(null)
  const [currentStreak, setCurrentStreak] = useState<number>(0)
  const [localSavedTheme, setLocalSavedTheme] = useState<string | null>(null)

  // Leitura segura de localStorage exclusivamente dentro de useEffect (elimina Hydration Mismatch #418)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('game_theme') || localStorage.getItem('equipped_game_theme')
        if (saved) {
          setLocalSavedTheme(saved)
        }
      }
    } catch (err) {
      console.warn('[GameThemeProvider] Erro ao ler tema local:', err)
    }
  }, [])

  const equipped = useMemo(() => getEquippedCosmetics(profile), [profile])

  const effectiveThemeId =
    previewThemeId ||
    equipped.themeId ||
    (profile as any)?.equipped_game_theme ||
    localSavedTheme ||
    'theme_matriz_tron'

  const effectiveSoundpackId = previewSoundpackId || equipped.soundpackId || 'default'
  const effectiveStreakEffectId = equipped.streakEffectId || 'default'

  // Persistir tema no localStorage
  useEffect(() => {
    if (effectiveThemeId && typeof window !== 'undefined') {
      localStorage.setItem('game_theme', effectiveThemeId)
      localStorage.setItem('equipped_game_theme', effectiveThemeId)
    }
  }, [effectiveThemeId])

  const themeMeta = useMemo(() => getThemeMeta(effectiveThemeId), [effectiveThemeId])

  const playSound = useCallback(
    (event: SoundEvent) => {
      triggerSoundpackAudio(effectiveSoundpackId, event)
    },
    [effectiveSoundpackId],
  )

  const value = useMemo(
    () => ({
      themeId: effectiveThemeId,
      themeMeta,
      soundpackId: effectiveSoundpackId,
      streakEffectId: effectiveStreakEffectId,
      previewThemeId,
      previewSoundpackId,
      setPreviewThemeId,
      setPreviewSoundpackId,
      playSound,
      currentStreak,
      setCurrentStreak,
    }),
    [
      effectiveThemeId,
      themeMeta,
      effectiveSoundpackId,
      effectiveStreakEffectId,
      previewThemeId,
      previewSoundpackId,
      playSound,
      currentStreak,
    ],
  )

  return (
    <GameThemeContext.Provider value={value}>
      {children}
    </GameThemeContext.Provider>
  )
}

const fallbackGameTheme: GameThemeContextType = {
  themeId: 'default_tron',
  themeMeta: { id: 'default_tron', name: 'Original', description: 'Tema clássico' } as any,
  soundpackId: 'classic',
  streakEffectId: 'default',
  previewThemeId: null,
  previewSoundpackId: null,
  setPreviewThemeId: () => {},
  setPreviewSoundpackId: () => {},
  playSound: () => {},
  currentStreak: 0,
  setCurrentStreak: () => {},
}

export function useGameTheme(): GameThemeContextType {
  const context = useContext(GameThemeContext)
  return context || fallbackGameTheme
}
