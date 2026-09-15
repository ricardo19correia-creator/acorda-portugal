'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { logGameFlow } from '@/lib/game-session'
import { resetGlobalArenaState } from '@/lib/game-active-state'

// Módulos Oficiais do Menu Principal Vivo do Acorda Portugal
import { HomeHero } from '@/components/home/HomeHero'
import { PlayerStatusHud } from '@/components/home/PlayerStatusHud'
import { ThreeChallengePaths } from '@/components/home/ThreeChallengePaths'
import { QuickNavigationSection } from '@/components/home/QuickNavigationSection'
import { HomeFooter } from '@/components/home/HomeFooter'

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [authWallOpen, setAuthWallOpen] = useState(false)
  const [authWallTarget, setAuthWallTarget] = useState('/jogar')

  // Garantir que a Home nunca retém resíduos visuais de uma partida anterior
  useEffect(() => {
    resetGlobalArenaState()
  }, [])

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
        <main className="flex-1 flex flex-col justify-between items-center w-full bg-transparent px-4 py-4 sm:py-6">
          <div className="w-full flex flex-col items-center">
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

            {/* 3. TRÊS CAMINHOS PRINCIPAIS — ⚔️ JOGAR · 🥊 1V1 · 🏆 RANKINGS */}
            <ThreeChallengePaths onStartGame={handleStartGame} />
          </div>

          {/* 4. BARRA DE NAVEGAÇÃO INFERIOR — (Rankings, Categorias, Loja, Conquistas, Perfil) */}
          <div className="w-full mt-6 sm:mt-8 mb-2">
            <QuickNavigationSection />
          </div>
        </main>

        {/* 5. FOOTER MÍNIMO DO MENU PRINCIPAL */}
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