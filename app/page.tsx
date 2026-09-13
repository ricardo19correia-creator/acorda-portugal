'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { logGameFlow } from '@/lib/game-session'

// Módulos Oficiais do Menu Principal Vivo do Acorda Portugal
import { HomeHero } from '@/components/home/HomeHero'
import { PlayerStatusHud } from '@/components/home/PlayerStatusHud'
import { ThreeChallengePaths } from '@/components/home/ThreeChallengePaths'
import { LivePortugalSection } from '@/components/home/LivePortugalSection'
import { FeaturedChallengeSection } from '@/components/home/FeaturedChallengeSection'
import { QuickNavigationSection } from '@/components/home/QuickNavigationSection'
import { HomeFooter } from '@/components/home/HomeFooter'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')

  const handleStartGame = (gameRoute: string) => {
    logGameFlow('JOGAR_CLICK', {
      from: 'HomePage_MainMenu',
      route: gameRoute,
      hasUser: Boolean(user),
    })

    // Se o jogador não estiver autenticado e a ação exigir conta (jogar partidas, 1v1 ou aceder a perfil)
    if (!user && (gameRoute.startsWith('/jogar') || gameRoute.startsWith('/perfil'))) {
      setAuthWallTarget(gameRoute)
      setAuthWallOpen(true)
      return
    }

    router.push(gameRoute)
  }

  const handleOpenAuth = () => {
    setAuthWallTarget('/jogar')
    setAuthWallOpen(true)
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Camada z-10 com transparência estrita para o GlobalBackgroundVideo (z:0) respirar */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        {/* Barra Superior Global */}
        <SiteHeader />

        {/* Menu Principal de Jogo — Hierarquia e Foco Absoluto */}
        <main className="flex-1 flex flex-col justify-start bg-transparent">
          {/* 1. HERO PRINCIPAL — "ACORDA PORTUGAL" / "Portugal está em jogo." / "JOGAR AGORA" */}
          <HomeHero
            onStartGame={handleStartGame}
            isAuthenticated={Boolean(user)}
          />

          {/* 2. ESTADO DO JOGADOR — HUD Compacto ou Cartão Elegante de Entrada */}
          <PlayerStatusHud
            user={user}
            profile={profile}
            onOpenAuth={handleOpenAuth}
          />

          {/* 3. TRÊS CAMINHOS PRINCIPAIS — ⚔️ JOGAR · 🥊 1V1 · 🗺️ PORTUGAL */}
          <ThreeChallengePaths onStartGame={handleStartGame} />

          {/* 4. PORTUGAL ESTÁ VIVO — Presença Real da Comunidade e Temporada */}
          <LivePortugalSection />

          {/* 5. EVENTO / DESAFIO DINÂMICO — Destaque Único Real (apenas se existir) */}
          <FeaturedChallengeSection onStartGame={handleStartGame} />

          {/* 6. NAVEGAÇÃO PARA O RESTO DO JOGO — Atalhos Rápidos */}
          <QuickNavigationSection />
        </main>

        {/* 7. FOOTER MÍNIMO DO MENU PRINCIPAL */}
        <HomeFooter />
      </div>

      {/* 🔒 Modal de Bloqueio de Convidado / Login Obrigatório */}
      <AuthWallModal
        isOpen={authWallOpen}
        onClose={() => setAuthWallOpen(false)}
        targetUrl={authWallTarget}
      />
    </div>
  )
}