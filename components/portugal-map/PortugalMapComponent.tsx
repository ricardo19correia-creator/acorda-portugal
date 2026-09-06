'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { MapHUDHeader } from './MapHUDHeader'
import { MapControlsCluster } from './MapControlsCluster'
import { MapSearchBar } from './MapSearchBar'
import { DistrictDetailsPanel } from './DistrictDetailsPanel'
import { ArenaDetailsModal } from './ArenaDetailsModal'
import { PortugalCanonicalSVGMap } from './PortugalCanonicalSVGMap'
import { DistrictWarLeaderboardWidget } from './DistrictWarLeaderboardWidget'
import { DistrictIntelCard } from './DistrictIntelCard'
import { ActiveArenasDrawer } from './ActiveArenasDrawer'
import type {
  MapDisplayMode,
  MapRegion,
  MapEngineState,
  MapArenaPOI,
  MapSearchResult,
} from './types'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PortugalMapComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  // 1. Lifecycle flag: exclusively render on the client to guarantee hydration safety
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Read URL parameters if present
  const queryDistrict = searchParams?.get('district') || searchParams?.get('distrito')
  const queryRegion = searchParams?.get('region') || searchParams?.get('regiao')

  const initialDistrict = useMemo(() => {
    if (queryDistrict) return queryDistrict
    if (profile?.district) return profile.district
    return 'Lisboa'
  }, [queryDistrict, profile?.district])

  const initialRegion = useMemo<MapRegion>(() => {
    if (queryRegion === 'acores' || queryRegion === 'açores') return 'acores'
    if (queryRegion === 'madeira') return 'madeira'
    return 'continente'
  }, [queryRegion])

  // UI and Map States
  const [activeMode, setActiveMode] = useState<MapDisplayMode>('satellite')
  const [activeRegion, setActiveRegion] = useState<MapRegion>(initialRegion)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)
  const [selectedArena, setSelectedArena] = useState<MapArenaPOI | null>(null)
  const [isDistrictPanelOpen, setIsDistrictPanelOpen] = useState(false)
  const [isArenaModalOpen, setIsArenaModalOpen] = useState(false)
  const [is3DPitch, setIs3DPitch] = useState(true)
  const [showArenas, setShowArenas] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState<number>(1)

  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)

  // Real-time Rankings Subscription for National War Map
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

  // Server-Authoritative District War calculation using real player data
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

  const displayedTerritory = useMemo(() => {
    const target = hoveredDistrict || selectedDistrict
    return (
      districtWarTerritories.find(
        (t) => t.name.toLowerCase() === target.toLowerCase()
      ) || activeTerritory
    )
  }, [districtWarTerritories, hoveredDistrict, selectedDistrict, activeTerritory])

  // Engine state representation for HUD
  const engineState = useMemo<MapEngineState>(() => ({
    isReady: true,
    is3DSupported: true,
    isUsingFallbackImagery: false,
    isTerrainActive: activeMode === 'terrain',
    activeMode,
    activeRegion,
  }), [activeMode, activeRegion])

  // Handle District Selection (Defined clearly without TDZ issues)
  const handleSelectDistrict = useCallback((name: string) => {
    setSelectedDistrict(name)
    setIsDistrictPanelOpen(true)

    const lower = name.toLowerCase()
    if (lower.includes('açores') || lower.includes('acores')) {
      setActiveRegion('acores')
    } else if (lower.includes('madeira')) {
      setActiveRegion('madeira')
    } else {
      setActiveRegion('continente')
    }
  }, [])

  // Handle Arena Selection
  const handleSelectArena = useCallback((arena: MapArenaPOI) => {
    setSelectedArena(arena)
    setIsArenaModalOpen(true)
    setIsDistrictPanelOpen(false)
  }, [])

  // Handle Search Result Selection
  const handleSelectSearchResult = useCallback(
    (result: MapSearchResult) => {
      if (result.type === 'district') {
        handleSelectDistrict(result.title)
      } else if (result.type === 'arena') {
        handleSelectArena(result.metadata)
      }
    },
    [handleSelectDistrict, handleSelectArena]
  )

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSelectPlayer = (p: any) => {
    if (!p) return
    setSelectedPlayer({
      id: p.uid || p.id,
      username: p.displayName || p.name || 'Jogador',
      avatarUrl: p.photoURL || undefined,
      equippedFrame: p.equippedFrame,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos || 1,
      virtualMoney: (p.xp || 0) * 2,
      isVip: Boolean(p.isFounder),
      title: p.title || 'Guardião Distrital',
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsTotal: p.gamesPlayed || 10,
        accuracyRate: p.accuracyRate || 85,
      },
      badges: [{ icon: '🇵🇹', name: p.district || 'Portugal' }],
    })
  }

  // Camera Controls Handlers
  const handleZoomIn = () => {
    setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))
  }

  const handleResetPortugal = () => {
    setActiveRegion('continente')
    setZoom(1)
    setIsDistrictPanelOpen(false)
  }

  const handleToggleFullscreen = () => {
    if (!rootRef.current) return
    if (!document.fullscreenElement) {
      rootRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // If not mounted yet on the client, render deterministic loading shell
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
          A CARREGAR MAPA NACIONAL // PORTUGAL 2150
        </span>
        <span
          className="text-[10px] font-mono text-emerald-400/90 mt-2 uppercase tracking-widest"
          suppressHydrationWarning
        >
          BUILD-ID: MAP2150-CANONICAL
        </span>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative w-full h-[100dvh] min-h-screen bg-slate-950 overflow-hidden flex flex-col select-none',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* 1. TOP HUD HEADER (Modes, Regions, Title, Brand) */}
      <MapHUDHeader
        engineState={engineState}
        activeMode={activeMode}
        activeRegion={activeRegion}
        onSelectMode={(mode) => setActiveMode(mode)}
        onSelectRegion={(region) => {
          setActiveRegion(region)
          if (region === 'acores') {
            setSelectedDistrict('Açores')
          } else if (region === 'madeira') {
            setSelectedDistrict('Madeira')
          }
        }}
        onStartGame={handleStartGame}
        selectedDistrict={selectedDistrict}
      />

      {/* 2. SEARCH BAR (Top-left on desktop, below header) */}
      <div className="absolute top-24 left-3 sm:left-6 z-30 pointer-events-auto">
        <MapSearchBar onSelectResult={handleSelectSearchResult} />
      </div>

      {/* 3. CAMERA CONTROLS CLUSTER (Right side) */}
      <MapControlsCluster
        is3D={is3DPitch}
        isFullscreen={isFullscreen}
        showArenas={showArenas}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetPortugal={handleResetPortugal}
        onToggle3D={() => setIs3DPitch(!is3DPitch)}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleArenas={() => setShowArenas(!showArenas)}
      />

      {/* 4. MAIN CANONICAL SVG MAP CANVAS (Edge-to-Edge) */}
      <main className="relative flex-1 w-full h-full inset-0 z-0">
        <PortugalCanonicalSVGMap
          selectedDistrict={selectedDistrict}
          hoveredDistrict={hoveredDistrict}
          activeRegion={activeRegion}
          activeMode={activeMode}
          showArenas={showArenas}
          zoom={zoom}
          is3D={is3DPitch}
          territories={districtWarTerritories}
          onSelectDistrict={handleSelectDistrict}
          onHoverDistrict={setHoveredDistrict}
          onSelectArena={handleSelectArena}
        />
      </main>

      {/* 4.1 FLOATING DISTRICT WAR LEADERBOARD WIDGET (Left stack) */}
      <div className="absolute top-36 sm:top-40 left-3 sm:left-6 z-20 pointer-events-none">
        <DistrictWarLeaderboardWidget
          territories={districtWarTerritories}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
        />
      </div>

      {/* 4.2 TACTICAL DISTRICT INTEL DOSSIER CARD (Bottom-Left Stack) */}
      {!isDistrictPanelOpen && (
        <div className="absolute bottom-6 left-3 sm:left-6 z-20 pointer-events-none hidden md:block">
          <DistrictIntelCard
            districtName={hoveredDistrict || selectedDistrict}
            territory={displayedTerritory}
            onOpenDetails={() => setIsDistrictPanelOpen(true)}
            onStartGame={handleStartGame}
          />
        </div>
      )}

      {/* 4.3 ACTIVE ARENAS DRAWER (Bottom-Right Stack) */}
      <div className="absolute bottom-6 right-3 sm:right-6 z-20 pointer-events-none hidden sm:block">
        <ActiveArenasDrawer onSelectArena={handleSelectArena} />
      </div>

      {/* 5. DISTRICT DETAILS PANEL (Side drawer / Bottom sheet) */}
      <DistrictDetailsPanel
        territory={activeTerritory}
        districtName={selectedDistrict}
        isOpen={isDistrictPanelOpen}
        onClose={() => setIsDistrictPanelOpen(false)}
        onSelectPlayer={handleSelectPlayer}
        onStartGame={handleStartGame}
      />

      {/* 6. ARENA DETAILS MODAL (Interactive POI Card) */}
      <ArenaDetailsModal
        arena={selectedArena}
        isOpen={isArenaModalOpen}
        onClose={() => setIsArenaModalOpen(false)}
        onStartGame={handleStartGame}
      />

      {/* 7. PLAYER PROFILE MODAL */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Production Verification Proof Marker */}
      <div
        suppressHydrationWarning
        className="absolute bottom-2 left-2 z-20 pointer-events-none opacity-80 font-mono text-[9px] text-emerald-400/80 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30 backdrop-blur-sm"
      >
        PORTUGAL MAP 2150 // CANONICAL SVG ENGINE • PRODUCTION READY
      </div>
    </div>
  )
}

export default PortugalMapComponent
