'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { CommandCenter } from '@/components/home/CommandCenter'
import { LiveOnlineCard } from '@/components/live-online-card'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { Categories } from '@/components/categories'
import { SiteFooter } from '@/components/site-footer'
import { AppBackground } from '@/components/AppBackground'
import { useAuth } from '@/components/auth-provider'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { logGameFlow } from '@/lib/game-session'

export default function Page() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [nationalRank, setNationalRank] = useState<number | null>(null)
  const [districtRank, setDistrictRank] = useState<number | null>(null)
  const [districtKing, setDistrictKing] = useState<string | null>(null)

  // Subscrição em Tempo Real para posições e dados territoriais
  useEffect(() => {
    if (!user?.uid) return

    const unsub = subscribeRankings(
      'all',
      'xp',
      (players) => {
        const userUid = user.uid
        const uDist = (profile?.district || 'Portugal').toLowerCase()

        // 1. Posição Nacional
        const natIndex = players.findIndex((p) => p.uid === userUid)
        setNationalRank(natIndex >= 0 ? natIndex + 1 : 1)

        // 2. Posição Distrital
        const distPlayers = players.filter((p) => (p.district || '').toLowerCase() === uDist)
        const dIndex = distPlayers.findIndex((p) => p.uid === userUid)
        setDistrictRank(dIndex >= 0 ? dIndex + 1 : 1)

        // 3. Rei do Território
        const territories = calculateDistrictWarTerritories(players)
        const myTerritory = territories.find((t) => t.name.toLowerCase() === uDist)
        setDistrictKing(myTerritory?.king?.displayName || null)
      },
      100
    )

    return () => unsub()
  }, [user?.uid, profile?.district])

  const handleStartGame = (gameRoute: string) => {
    logGameFlow('JOGAR_CLICK', {
      from: 'HomePage_CommandCenter',
      route: gameRoute,
      hasUser: Boolean(user),
    })
    if (!user) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* 1. FUNDO GLOBAL OFICIAL DO ACORDA PORTUGAL */}
      <AppBackground />

      {/* 2. CONTEÚDO DO SITE ENCAPSULADO EM RELATIVE Z-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-center gap-8 py-4 bg-transparent">
          {/* SE LOGADO: COMMAND CENTER 2150. SE NÃO LOGADO: HERO CINEMATOGRÁFICO */}
          {user ? (
            <CommandCenter
              user={user}
              profile={profile}
              nationalRank={nationalRank}
              districtRank={districtRank}
              districtKing={districtKing}
              onStartGame={handleStartGame}
            />
          ) : (
            <Hero />
          )}

          {/* ATIVIDADE NACIONAL AO VIVO */}
          <LiveOnlineCard />

          {/* EXPLORAÇÃO DE CATEGORIAS TEMÁTICAS */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <Categories />
          </div>

          {/* SIMBOLISMO NACIONAL */}
          <div id="simbolo">
            <GuzmaniaSection />
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}