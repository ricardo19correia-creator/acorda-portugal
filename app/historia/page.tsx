import React from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HistoryHero } from '@/components/history/HistoryHero'
import { HistoryTimelineFlow } from '@/components/history/HistoryTimelineFlow'
import { OriginalVisionSection } from '@/components/history/OriginalVisionSection'
import { MusicalIdentitySection } from '@/components/history/MusicalIdentitySection'
import { StructuralEvolutionSection } from '@/components/history/StructuralEvolutionSection'
import { CommunityTrustSection } from '@/components/history/CommunityTrustSection'
import { TheTransformationSection } from '@/components/history/TheTransformationSection'
import { MasterPlanSection } from '@/components/history/MasterPlanSection'
import { EvolutionTimelineSection } from '@/components/history/EvolutionTimelineSection'
import { PlanComparisonSection } from '@/components/history/PlanComparisonSection'
import { TerritorialSection } from '@/components/history/TerritorialSection'
import { PresentUniverseSection } from '@/components/history/PresentUniverseSection'
import { AuthorTributeSection } from '@/components/history/AuthorTributeSection'
import { CinematicClosingSection } from '@/components/history/CinematicClosingSection'

export const metadata: Metadata = {
  title: 'Onde Tudo Começou — A Nossa História | Acorda Portugal',
  description:
    'A verdadeira história de criação e evolução do Acorda Portugal — Desafio Nacional. Concebido por António Ricardo Correia Moreira (Riky Moreira) em Vila Real, Portugal.',
}

export default function HistoriaPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Cabeçalho Oficial do Jogo */}
      <SiteHeader />

      {/* Conteúdo Principal — Narrativa Cinematográfica da História */}
      <main className="flex-1">
        {/* 5. Hero — Onde Tudo Começou */}
        <HistoryHero />

        {/* 2. Sequência Fundamental */}
        <HistoryTimelineFlow />

        {/* 6. Capítulo I — A Ideia Original */}
        <OriginalVisionSection />

        {/* 7. Capítulo II — 05.04.2026: A Identidade Ganha Voz */}
        <MusicalIdentitySection />

        {/* 8. Capítulo III — Abril 2026: A Visão Ganha Estrutura */}
        <StructuralEvolutionSection />

        {/* 9. Capítulo IV — Confiança, Mérito e Comunidade */}
        <CommunityTrustSection />

        {/* 10. Capítulo V — A Grande Transformação / Nascimento do Jogo */}
        <TheTransformationSection />

        {/* 11 & 12. Capítulos VI e VII — O Primeiro Master Plan & A Porta de Entrada */}
        <MasterPlanSection />

        {/* 13. Capítulo VIII — Do Master Plan ao Jogo Real */}
        <EvolutionTimelineSection />

        {/* 14. Capítulo IX — O Que Mudou ("O plano cresceu") */}
        <PlanComparisonSection />

        {/* 15. Capítulo X — O Portugal do Jogo (Dimensão Territorial) */}
        <TerritorialSection />

        {/* 16. Capítulo XI — E a Ideia Continuou a Crescer (6 Pilares Atuais) */}
        <PresentUniverseSection />

        {/* 17 & 18. Capítulos XII e XIII — Hoje & Consagração de Autoria */}
        <AuthorTributeSection />

        {/* 19 & 20. Capítulos XIV e XV — Encerramento Cinematográfico & Arquivo de Origem */}
        <CinematicClosingSection />
      </main>

      {/* Rodapé Oficial do Jogo */}
      <SiteFooter />
    </div>
  )
}
