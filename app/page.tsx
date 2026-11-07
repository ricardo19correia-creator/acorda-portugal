'use client'

import React, { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PortugueseBackground } from '@/components/institutional/PortugueseBackground'
import { InstitutionalHero } from '@/components/institutional/InstitutionalHero'
import { InstitutionalNews } from '@/components/institutional/InstitutionalNews'
import { InstitutionalCitizens } from '@/components/institutional/InstitutionalCitizens'
import { InstitutionalLive } from '@/components/institutional/InstitutionalLive'
import { InstitutionalVerification } from '@/components/institutional/InstitutionalVerification'
import { InstitutionalRadar } from '@/components/institutional/InstitutionalRadar'
import { InstitutionalDesafio } from '@/components/institutional/InstitutionalDesafio'
import { resetGlobalArenaState } from '@/lib/game-active-state'

export default function HomePage() {
  // Garantir que a Home institucional nunca retém resíduos de arena de jogo
  useEffect(() => {
    resetGlobalArenaState()
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#040e08] text-foreground flex flex-col justify-between selection:bg-[#10B981] selection:text-black">
      {/* 
        🇵🇹 ACORDA PORTUGAL — IDENTIDADE VISUAL NACIONAL DE RAIZ
        Fundo cinematográfico inspirado no território de Portugal.
        Paleta de cores estritamente nacional: verde, vermelho e branco com apontamentos de dourado.
        Zero estética gaming. Zero azul escuro.
      */}
      <PortugueseBackground />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* Cabeçalho Institucional Oficial */}
        <SiteHeader />

        {/* 
          Conteúdo Institucional Oficial — Organizado exclusivamente nestas 7 secções em ordem estrita:
          1. ACORDA PORTUGAL
          2. INFORMAÇÃO E NOTÍCIAS
          3. A VOZ DOS CIDADÃOS
          4. DIRETOS E ACONTECIMENTOS
          5. VERIFICAÇÃO DE INFORMAÇÃO
          6. RADAR NACIONAL
          7. DESAFIO NACIONAL
        */}
        <main className="flex-1 flex flex-col items-center w-full">
          {/* 1. ACORDA PORTUGAL */}
          <InstitutionalHero />

          {/* 2. INFORMAÇÃO E NOTÍCIAS */}
          <InstitutionalNews />

          {/* 3. A VOZ DOS CIDADÃOS */}
          <InstitutionalCitizens />

          {/* 4. DIRETOS E ACONTECIMENTOS */}
          <InstitutionalLive />

          {/* 5. VERIFICAÇÃO DE INFORMAÇÃO */}
          <InstitutionalVerification />

          {/* 6. RADAR NACIONAL */}
          <InstitutionalRadar />

          {/* 7. DESAFIO NACIONAL */}
          <InstitutionalDesafio />
        </main>

        {/* Rodapé Institucional Oficial */}
        <SiteFooter />
      </div>
    </div>
  )
}
