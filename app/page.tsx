'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { GameLobby } from '@/components/home/GameLobby'
import { LiveOnlineCard } from '@/components/live-online-card'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { logGameFlow } from '@/lib/game-session'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')

  const handleStartGame = (gameRoute: string) => {
    logGameFlow('JOGAR_CLICK', {
      from: 'HomePage_GameLobby',
      route: gameRoute,
      hasUser: Boolean(user),
    })
    if (!user) {
      setAuthWallTarget(gameRoute)
      setAuthWallOpen(true)
      return
    }
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

      {/* 🔒 MODAL DE BLOQUEIO DE CONVIDADO / LOGIN OBRIGATÓRIO */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}