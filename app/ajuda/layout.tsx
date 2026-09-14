import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Central de Ajuda — Acorda Portugal',
  description:
    'Perguntas frequentes, regras de jogo, tutoriais e suporte da plataforma Acorda Portugal — Desafio Nacional.',
  alternates: {
    canonical: 'https://acordaportugal.pt/ajuda',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/ajuda',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Central de Ajuda — Acorda Portugal',
    description:
      'Perguntas frequentes, regras de jogo, tutoriais e suporte da plataforma Acorda Portugal — Desafio Nacional.',
  },
}

export default function AjudaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
