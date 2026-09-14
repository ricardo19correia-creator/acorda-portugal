import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Loja Oficial — Acorda Portugal',
  description:
    'Loja oficial do Acorda Portugal — Desafio Nacional. Adquire ajudas de jogo, molduras de avatar e itens exclusivos.',
  alternates: {
    canonical: 'https://acordaportugal.pt/loja',
  },
}

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
