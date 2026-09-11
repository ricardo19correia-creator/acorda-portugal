'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { GameLobby } from '@/components/home/GameLobby'
import { LiveOnlineCard } from '@/components/live-online-card'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { logGameFlow } from '@/lib/game-session'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const handleStartGame = (gameRoute: string) => {
    logGameFlow('JOGAR_CLICK', {
      from: 'HomePage_GameLobby',
      route: gameRoute,
      hasUser: Boolean(user),
    })
    router.push(gameRoute)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-start gap-4 py-4 bg-transparent">
          {/* LOBBY PRINCIPAL DE JOGO */}
          <GameLobby
            user={user}
            profile={profile}
            onStartGame={handleStartGame}
          />

          {/* INDICADOR DISCRETO DE ATIVIDADE NACIONAL AO VIVO */}
          <LiveOnlineCard />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}