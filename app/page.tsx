'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { GameLobby } from '@/components/home/GameLobby'
import { LiveOnlineCard } from '@/components/live-online-card'
import { GuzmaniaSection } from '@/components/guzmania-section'
import { Categories } from '@/components/categories'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { logGameFlow } from '@/lib/game-session'

export default function Page() {
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
      {/* CONTEÚDO DO SITE ENCAPSULADO EM RELATIVE Z-10 */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        <SiteHeader />

        <main className="flex-1 flex flex-col justify-center gap-8 py-4 bg-transparent">
          {/* CENTRAL / LOBBY PRINCIPAL DE JOGO */}
          <GameLobby
            user={user}
            profile={profile}
            onStartGame={handleStartGame}
          />

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