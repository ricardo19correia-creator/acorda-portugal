'use client'

import React, { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PortugueseBackground } from '@/components/institutional/PortugueseBackground'
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] text-foreground flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* 
        🇵🇹 ACORDA PORTUGAL — PLATAFORMA NACIONAL DE INFORMAÇÃO & CIDADANIA
        Fundo Gráfico Exclusivo: Inspirado na herança cartográfica, náutica e geométrica de Portugal.
        Design institucional, sofisticado, sóbrio e minimalista, sem qualquer estética gaming.
      */}
      <PortugueseBackground />

      <div className="relative z-10 flex-1 flex flex-col justify-between">
        {/* Cabeçalho Institucional Oficial */}
        <SiteHeader />

        {/* Conteúdo Institucional Oficial */}
        <main className="flex-1 flex flex-col items-center w-full">
          {/* 1. Apresentação: «Portugal precisa de acordar.» / «A informação começa nas pessoas.» */}
          <InstitutionalHero />

          {/* 2 & 3. Explicação Breve do Verdadeiro Projeto & Os Três Pilares da Missão */}
          <InstitutionalMission />

          {/* 4. Funcionalidades: Notícias */}
          <InstitutionalNews />

          {/* 4. Funcionalidades: Envio de Acontecimentos pelos Cidadãos */}
          <InstitutionalParticipation />

          {/* 4. Funcionalidades: Diretos ao Vivo & Mesa de Verificação Factual */}
          <InstitutionalLiveVerification />

          {/* 4. Funcionalidades: Radar Nacional */}
          <InstitutionalRadar />

          {/* 5. Secção Pequena & Independente: Acorda Portugal — Desafio Nacional */}
          <InstitutionalDesafioSecundario />
        </main>

        {/* Rodapé Institucional Oficial */}
        <SiteFooter />
      </div>
    </div>
  )
}
