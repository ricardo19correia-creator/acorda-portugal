import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa de Portugal — Acorda Portugal | O Desafio Nacional',
  description:
    'Mapa estratégico nacional: 18 distritos, Açores, Madeira, cidades, arenas históricas e ranking territorial em tempo real.',
  openGraph: {
    title: 'Mapa de Portugal — Acorda Portugal',
    description:
      'Mapa estratégico nacional: 18 distritos, Açores, Madeira, cidades, arenas históricas e ranking territorial em tempo real.',
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
