import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorias de Perguntas — Acorda Portugal',
  description:
    'Explora as diversas categorias de perguntas sobre Portugal: História, Geografia, Desporto, Tradições, Cultura e muito mais.',
  alternates: {
    canonical: 'https://acordaportugal.pt/categorias',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/categorias',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Categorias de Perguntas — Acorda Portugal',
    description:
      'Explora as diversas categorias de perguntas sobre Portugal: História, Geografia, Desporto, Tradições, Cultura e muito mais.',
  },
}

export default function CategoriasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
