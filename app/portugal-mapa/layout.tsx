import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acorda Portugal — Portugal 2150',
  description:
    'Explore Portugal em 3D, descubra distritos, arenas e o mundo do Acorda Portugal.',
  openGraph: {
    title: 'Acorda Portugal — Portugal 2150',
    description:
      'Explore Portugal em 3D, descubra distritos, arenas e o mundo do Acorda Portugal.',
    url: 'https://acordaportugal.pt/portugal-mapa',
    siteName: 'Acorda Portugal',
    images: [
      {
        url: '/images/og-map.jpg',
        width: 1200,
        height: 630,
        alt: 'Portugal 2150 — Mapa Tático 3D',
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
