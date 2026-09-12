'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useAuth } from '@/components/auth-provider'
import { AuthWallModal } from '@/components/auth-wall-modal'
import { logGameFlow } from '@/lib/game-session'

// Módulos do Main Menu do Acorda Portugal
import { HeroSection } from '@/components/home/HeroSection'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { TerritorySection } from '@/components/home/TerritorySection'
import { GameModesSection } from '@/components/home/GameModesSection'
import { DistrictSection } from '@/components/home/DistrictSection'
import { ProgressionSection } from '@/components/home/ProgressionSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'
import { RankingPreviewSection } from '@/components/home/RankingPreviewSection'
import { FutureSection } from '@/components/home/FutureSection'
import { FinalCtaSection } from '@/components/home/FinalCtaSection'

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

    if (!user) {
      setAuthWallTarget(gameRoute)
      setAuthWallOpen(true)
      return
    }

    router.push(gameRoute)
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-transparent text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Camada z-10 com transparência estrita para o GlobalBackgroundVideo (z:0) respirar */}
      <div className="relative z-10 flex-1 flex flex-col justify-between bg-transparent">
        {/* Barra Superior Global */}
        <SiteHeader />

        {/* Narrativa de Videojogo — Ritmo Contínuo do Main Menu */}
        <main className="flex-1 flex flex-col justify-start bg-transparent">
          {/* 1. HERO — Impacto Imediato + Indicadores Reais */}
          <HeroSection onStartGame={handleStartGame} />

          {/* 2. MANIFESTO — Não É Apenas Um Quiz (01-04) */}
          <ManifestoSection />

          {/* 3. TERRITÓRIO — Portugal É O Teu Campo de Jogo */}
          <TerritorySection />

          {/* 4. MODOS DE JOGO — Como Queres Jogar? */}
          <GameModesSection onStartGame={handleStartGame} />

          {/* 5. MEU DISTRITO — Representa O Teu Distrito */}
          <DistrictSection user={user} profile={profile} onStartGame={handleStartGame} />

          {/* 6. PROGRESSÃO — A Tua Jornada */}
          <ProgressionSection user={user} profile={profile} />

          {/* 7. CATEGORIAS — O Que Sabes? (18 Temas Reais) */}
          <CategoriesSection onStartGame={handleStartGame} />

          {/* 8. RANKING — Quem Está No Topo? (Pódio Real) */}
          <RankingPreviewSection />

          {/* 9. O FUTURO DO JOGO — Universo Em Evolução */}
          <FutureSection />

          {/* 10. CTA FINAL — Estás Pronto? Portugal Está Em Jogo */}
          <FinalCtaSection onStartGame={handleStartGame} />
        </main>

        {/* Rodapé Oficial */}
        <SiteFooter />
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