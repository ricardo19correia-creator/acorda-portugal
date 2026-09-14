import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rankings Nacionais e Distritais — Acorda Portugal',
  description:
    'Consulta as tabelas de classificação nacional e distrital do Acorda Portugal — Desafio Nacional.',
  alternates: {
    canonical: 'https://acordaportugal.pt/rankings',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/rankings',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Rankings Nacionais e Distritais — Acorda Portugal',
    description:
      'Consulta as tabelas de classificação nacional e distrital do Acorda Portugal — Desafio Nacional.',
  },
}

export default function RankingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
