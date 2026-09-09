import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa de Portugal — Acorda Portugal',
  description:
    'Mapa nacional oficial de Portugal 2026: 18 distritos continentais, Açores, Madeira, atividade de jogadores reais e classificação territorial em tempo real.',
  openGraph: {
    title: 'Mapa de Portugal — Acorda Portugal',
    description:
      'Mapa nacional oficial de Portugal 2026: 18 distritos continentais, Açores, Madeira, atividade de jogadores reais e classificação territorial em tempo real.',
    url: 'https://acordaportugal.pt/portugal-mapa',
    siteName: 'Acorda Portugal',
    images: [
      {
        url: '/images/og-map.jpg',
        width: 1200,
        height: 630,
        alt: 'Mapa de Portugal — Acorda Portugal',
      },
    ],
    locale: 'pt_PT',
    type: 'website',
  },
}

export default function PortugalMapaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
