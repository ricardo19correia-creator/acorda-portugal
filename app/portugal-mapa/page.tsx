'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { DEFAULT_AVATAR } from '@/lib/avatars'
import { PortugalGameMap } from '@/components/portugal-map/PortugalGameMap'
import type { MapRegion } from '@/components/portugal-map/types'
import { Globe } from 'lucide-react'

function PortugalMapaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile } = useAuth()

  // Read URL parameters if present
  const queryDistrict = searchParams.get('district') || searchParams.get('distrito')
  const queryRegion = searchParams.get('region') || searchParams.get('regiao')

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

  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict)
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)

  // Real-time Rankings Subscription for National War Map
  useEffect(() => {
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
  }, [user?.uid, user?.displayName, user?.photoURL, profile])

  // Server-Authoritative District War calculation using real player data
  const districtWarTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

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

  return (
    <div className="relative w-full h-[100dvh] bg-slate-950 overflow-hidden flex flex-col">
      <PortugalGameMap
        initialDistrict={selectedDistrict}
        initialRegion={initialRegion}
        territories={districtWarTerritories}
        onSelectDistrict={(dist) => setSelectedDistrict(dist)}
        onSelectPlayer={handleSelectPlayer}
        onStartGame={handleStartGame}
      />

      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}

export default function PortugalMapaPage() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Globe className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <span className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400">
            A CARREGAR MAPA NACIONAL // PORTUGAL 2150
          </span>
          <span className="text-[10px] font-mono text-emerald-400/90 mt-2 uppercase tracking-widest">
            BUILD-ID: MAP2150-REAL-001
          </span>
        </div>
      }
    >
      <PortugalMapaContent />
    </Suspense>
  )
}
