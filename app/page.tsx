'use client'

import React, { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { InstitutionalHero } from '@/components/institutional/InstitutionalHero'
import { InstitutionalMission } from '@/components/institutional/InstitutionalMission'
import { InstitutionalNews } from '@/components/institutional/InstitutionalNews'
import { InstitutionalParticipation } from '@/components/institutional/InstitutionalParticipation'
import { InstitutionalLiveVerification } from '@/components/institutional/InstitutionalLiveVerification'
import { InstitutionalRadar } from '@/components/institutional/InstitutionalRadar'
import { InstitutionalDesafioSecundario } from '@/components/institutional/InstitutionalDesafioSecundario'
import { resetGlobalArenaState } from '@/lib/game-active-state'

export default function HomePage() {
  // Garantir que a Home institucional nunca retém resíduos visuais de arena
  useEffect(() => {
    resetGlobalArenaState()
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#070d19] text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 
        🇵🇹 ACORDA PORTUGAL — PLATAFORMA NACIONAL DE INFORMAÇÃO & CIDADANIA
        Identidade: Institucional, portuguesa, moderna e credível.
        Cores: Azul escuro (#070d19), Verde Português, Branco e apontamentos discretos de Dourado.
      */}
      <div className="relative z-10 flex-1 flex flex-col justify-between">
        
        {/* 1. Cabeçalho com logótipo e navegação simples */}
        <SiteHeader />

        {/* Conteúdo Institucional Oficial */}
        <main className="flex-1 flex flex-col items-center w-full">
          {/* 2. Hero: "Portugal precisa de acordar." / "A informação começa nas pessoas." */}
          <InstitutionalHero />

          {/* 3. Apresentação da missão do projeto */}
          <InstitutionalMission />

          {/* 4. Secção de notícias e informação */}
          <InstitutionalNews />

          {/* 5. Participação dos cidadãos e envio de acontecimentos */}
          <InstitutionalParticipation />

          {/* 6. Diretos ao vivo e verificação de informação */}
          <InstitutionalLiveVerification />

          {/* 7. Radar Nacional */}
          <InstitutionalRadar />

          {/* 8. Apresentação secundária do Desafio Nacional */}
          <InstitutionalDesafioSecundario />
        </main>

        {/* 9. Rodapé institucional com contactos e informação legal */}
        <SiteFooter />
      </div>
    </div>
  )
}
