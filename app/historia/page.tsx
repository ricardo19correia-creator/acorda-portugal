import React from 'react'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { HistoryHero } from '@/components/history/HistoryHero'
import { OriginalIdeaSection } from '@/components/history/OriginalIdeaSection'
import { CitizenReporterSection } from '@/components/history/CitizenReporterSection'
import { LiveEventStreamsSection } from '@/components/history/LiveEventStreamsSection'
import { CommunityInformationSection } from '@/components/history/CommunityInformationSection'
import { TrueAcordaPortugalSection } from '@/components/history/TrueAcordaPortugalSection'
import { IdentityNameSection } from '@/components/history/IdentityNameSection'
import { NationalChallengeGenesisSection } from '@/components/history/NationalChallengeGenesisSection'
import { TwoDimensionsSection } from '@/components/history/TwoDimensionsSection'
import { PresentGameSection } from '@/components/history/PresentGameSection'
import { FutureVisionSection } from '@/components/history/FutureVisionSection'
import { EpilogueClosingSection } from '@/components/history/EpilogueClosingSection'

export const metadata: Metadata = {
  title: 'A História do Acorda Portugal — Da Ideia Original ao Desafio Nacional',
  description:
    'A verdadeira história do Acorda Portugal: a visão original de uma aplicação móvel de informação em tempo real com cidadãos-repórteres e a sua evolução para o Desafio Nacional.',
  alternates: {
    canonical: 'https://acordaportugal.pt/historia',
  },
  openGraph: {
    type: 'article',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/historia',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'A História do Acorda Portugal — Da Ideia Original ao Desafio Nacional',
    description:
      'A verdadeira história do Acorda Portugal: a visão original de uma aplicação móvel de informação em tempo real com cidadãos-repórteres e a sua evolução para o Desafio Nacional.',
  },
}

export default function HistoriaPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-emerald-500 selection:text-black">
      <BackgroundFx variant="default" />

      {/* Cabeçalho Oficial */}
      <SiteHeader />

      {/* Conteúdo Principal — A Verdadeira História do Acorda Portugal */}
      <main className="flex-1">
        {/* 01 — Onde Tudo Começou (Antes do jogo. Havia uma ideia.) */}
        <HistoryHero />

        {/* 02 & 03 — A Ideia Original: Aplicação Móvel de Informação em Primeira Mão */}
        <OriginalIdeaSection />

        {/* 04 — O Cidadão Pode Dar a Notícia (Mecanismos de Credibilidade & Ética) */}
        <CitizenReporterSection />

        {/* 05 — Diretos do Acontecimento (Estar no Local -> Transmitir -> A Comunidade Acompanha) */}
        <LiveEventStreamsSection />

        {/* 06 — Uma Comunidade a Informar (Complementaridade com o Jornalismo) */}
        <CommunityInformationSection />

        {/* 07 — O Verdadeiro Acorda Portugal (A Visão Central & Matriz de Transparência) */}
        <TrueAcordaPortugalSection />

        {/* 08 — O Significado do Nome "Acorda Portugal" (Chamada Cívica à Atenção) */}
        <IdentityNameSection />

        {/* 09 — A Evolução: Nasce o Desafio Nacional (O Jogo como Expansão Posterior) */}
        <NationalChallengeGenesisSection />

        {/* 10 — Duas Dimensões do Mesmo Universo (O que está a acontecer vs O quanto conheces o país) */}
        <TwoDimensionsSection />

        {/* 11 — Onde Estamos Hoje (Funcionalidades Reais em Produção no Jogo) */}
        <PresentGameSection />

        {/* 12 — Para Onde Vamos (O Futuro da Aplicação Móvel de Informação) */}
        <FutureVisionSection />

        {/* 13 — Epílogo Cinematográfico (Não esperes pela notícia. Esteja onde ela acontece.) */}
        <EpilogueClosingSection />
      </main>

      {/* Rodapé Oficial */}
      <SiteFooter />
    </div>
  )
}
