'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { PortugalNexus3DEngine, type MapLayersState } from './PortugalNexus3DEngine'
import { NexusMapHUD } from './NexusMapHUD'
import { NexusDistrictDossier } from './NexusDistrictDossier'
import { NexusArenaModal } from './NexusArenaModal'
import { PortugalVectorFallback } from './PortugalVectorFallback'
import type {
  MapDisplayMode,
  MapRegion,
  MapArenaPOI,
} from './types'
import { Globe } from 'lucide-react'

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function PortugalMapComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  // 1. Client-only mounting flag
  const [mounted, setMounted] = useState(false)
  const [hasWebGL, setHasWebGL] = useState(true)

  useEffect(() => {
    setMounted(true)
    setHasWebGL(checkWebGLSupport())
  }, [])

  // Read URL parameters if present
  const queryDistrict = searchParams?.get('district') || searchParams?.get('distrito')
  const queryRegion = searchParams?.get('region') || searchParams?.get('regiao')

  const initialDistrict = useMemo(() => {
    if (queryDistrict) return queryDistrict
    if (profile?.district) return profile.district
    return 'Porto'
  }, [queryDistrict, profile?.district])

  const initialRegion = useMemo<MapRegion>(() => {
    if (queryRegion === 'acores' || queryRegion === 'açores') return 'acores'
    if (queryRegion === 'madeira') return 'madeira'
    return 'continente'
  }, [queryRegion])

  // UI & 3D Engine States
  const [activeMode, setActiveMode] = useState<MapDisplayMode>('terrain')
  const [activeRegion, setActiveRegion] = useState<MapRegion>(initialRegion)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [isDistrictPanelOpen, setIsDistrictPanelOpen] = useState(false)
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false)
  const [isCinematic, setIsCinematic] = useState(false)
  const [isTerritorySynchronized, setIsTerritorySynchronized] = useState(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 17. Camadas
  const [layers, setLayers] = useState<MapLayersState>({
    territorios: true,
    cidades: true,
    arenas: true,
    jogadores: false,
    eventos: false,
    ranking: false,
    conexoes: true,
    landmarks: true,
  })

  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Real-time Rankings Subscription for National War Map (Server Authoritative)
  useEffect(() => {
    if (!mounted) return
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        const allList = [...data]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userWins = profile.wins ?? 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasCurrentUser = allList.some((p) => p.uid === user.uid)

          if (!hasCurrentUser) {
            allList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || DEFAULT_AVATAR.image,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              title: userTitle,
              equippedTitle: userTitle,
              equippedFrame: (profile as any)?.equippedFrame,
              wins1v1: userWins,
              losses1v1: 0,
              gamesPlayed: userWins,
              accuracyRate: 85,
              rating: 1000 + userWins * 25,
              division: 'Bronze',
              streak: 0,
              weeklyMovement: 0,
            })
          }
        }
        setNationalPlayers(allList)
      },
      300
    )
    return () => unsub()
  }, [mounted, user?.uid, user?.displayName, user?.photoURL, profile])

  // Real-time district war computation
  const districtWarTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  const activeTerritory = useMemo(() => {
    return (
      districtWarTerritories.find(
        (t) => t.name.toLowerCase() === selectedDistrict.toLowerCase()
      ) || null
    )
  }, [districtWarTerritories, selectedDistrict])

  // Trigger Territorial Synchronization Pulse
  const handleTriggerSynchronized = useCallback((name: string) => {
    setIsTerritorySynchronized(true)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    syncTimeoutRef.current = setTimeout(() => {
      setIsTerritorySynchronized(false)
    }, 3200)
  }, [])

  // Handle District Selection
  const handleSelectDistrict = useCallback((name: string) => {
    setSelectedDistrict(name)
    setIsDistrictPanelOpen(true)
    handleTriggerSynchronized(name)

    const lower = name.toLowerCase()
    if (lower.includes('açores') || lower.includes('acores')) {
      setActiveRegion('acores')
    } else if (lower.includes('madeira')) {
      setActiveRegion('madeira')
    } else {
      setActiveRegion('continente')
    }
  }, [handleTriggerSynchronized])

  // Handle Arena Selection
  const handleSelectArena = useCallback((arena: MapArenaPOI) => {
    setSelectedArena(arena)
    setIsArenaModalOpen(true)
    setIsDistrictPanelOpen(false)
  }, [])

  // Layer toggle handler
  const handleToggleLayer = useCallback((layerKey: keyof MapLayersState) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }))
  }, [])

  // Navigation action strictly audited
  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  // Camera Reset
  const handleResetPortugal = () => {
    setActiveRegion('continente')
    setSelectedDistrict('Porto')
    setIsDistrictPanelOpen(false)
    setIsArenaModalOpen(false)
    setIsCinematic(false)
  }

  if (!mounted) {
    return (
      <div
        className="relative w-full h-[100dvh] min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none"
        suppressHydrationWarning
      >
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <span
          className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400"
          suppressHydrationWarning
        >
          A INICIALIZAR RELEVO // PORTUGAL 2150
        </span>
      </div>
    )
  }

  // Fallback 2D se WebGL falhar (requisito 23)
  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[100dvh] min-h-screen bg-slate-950">
        <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold uppercase">
          MODO TÁTICO 2D // FALLBACK
        </div>
        <PortugalVectorFallback
          territories={districtWarTerritories}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
          onSelectArena={handleSelectArena}
          onHoverDistrict={setHoveredDistrict}
        />
        <NexusDistrictDossier
          districtName={selectedDistrict}
          territory={activeTerritory}
          isOpen={isDistrictPanelOpen}
          onClose={() => setIsDistrictPanelOpen(false)}
          onStartGame={handleStartGame}
        />
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[100dvh] min-h-screen bg-slate-950 overflow-hidden select-none isolate"
    >
      {/* 1. HERO 3D TOPOGRAPHIC ENGINE (Edge-to-Edge Canvas >95% Viewport) */}
      <main className="absolute inset-0 w-full h-full z-0">
        <PortugalNexus3DEngine
          selectedDistrict={selectedDistrict}
          hoveredDistrict={hoveredDistrict}
          activeRegion={activeRegion}
          activeMode={activeMode}
          showArenas={layers.arenas}
          isCinematic={isCinematic}
          layers={layers}
          territories={districtWarTerritories}
          onSelectDistrict={handleSelectDistrict}
          onHoverDistrict={setHoveredDistrict}
          onSelectArena={handleSelectArena}
          onToggleCinematic={() => setIsCinematic(!isCinematic)}
          onTriggerSynchronized={handleTriggerSynchronized}
        />
      </main>

      {/* 2. MINIMALIST HUD */}
      <NexusMapHUD
        activeRegion={activeRegion}
        onSelectRegion={setActiveRegion}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        isCinematic={isCinematic}
        onToggleCinematic={() => setIsCinematic(!isCinematic)}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onResetPortugal={handleResetPortugal}
        onStartGame={handleStartGame}
        selectedDistrict={selectedDistrict}
        isTerritorySynchronized={isTerritorySynchronized}
      />

      {/* 3. COMPACT CONTEXTUAL DOSSIER (Requisito 9) */}
      <NexusDistrictDossier
        districtName={selectedDistrict}
        territory={activeTerritory}
        isOpen={isDistrictPanelOpen && !isCinematic}
        onClose={() => setIsDistrictPanelOpen(false)}
        onStartGame={handleStartGame}
      />

      {/* 4. ARENA DETAILS MODAL */}
      <NexusArenaModal
        arena={selectedArena}
        isOpen={isArenaModalOpen && !isCinematic}
        onClose={() => setIsArenaModalOpen(false)}
        onStartGame={handleStartGame}
      />

      {/* 5. PLAYER PROFILE MODAL */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}

export default PortugalMapComponent
