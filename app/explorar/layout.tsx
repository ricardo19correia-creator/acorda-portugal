import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Funciona o Jogo — Acorda Portugal',
  description:
    'Descobre as mecânicas, modos de jogo, progressão, níveis e recompensas do Acorda Portugal — Desafio Nacional.',
  alternates: {
    canonical: 'https://acordaportugal.pt/explorar',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/explorar',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Como Funciona o Jogo — Acorda Portugal',
    description:
      'Descobre as mecânicas, modos de jogo, progressão, níveis e recompensas do Acorda Portugal — Desafio Nacional.',
  },
}

export default function ExplorarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
