import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://acordaportugal.pt'),
  title: 'Descarregar Acorda Portugal — Desafio Nacional',
  description:
    'Descarrega a aplicação oficial Android do Acorda Portugal — Desafio Nacional e entra no desafio.',
  openGraph: {
    title: 'Descarregar Acorda Portugal — Desafio Nacional',
    description:
      'Descarrega a aplicação oficial Android do Acorda Portugal — Desafio Nacional e entra no desafio.',
    url: 'https://acordaportugal.pt/download',
    siteName: 'Acorda Portugal — Desafio Nacional',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Acorda Portugal — Desafio Nacional',
      },
    ],
    locale: 'pt_PT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Descarregar Acorda Portugal — Desafio Nacional',
    description:
      'Descarrega a aplicação oficial Android do Acorda Portugal — Desafio Nacional e entra no desafio.',
    images: ['/icon.png'],
  },
}

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
