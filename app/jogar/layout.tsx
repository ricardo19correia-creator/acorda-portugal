import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jogar — Acorda Portugal',
  description:
    'Entra no desafio e responde às perguntas sobre Portugal. Testa o teu conhecimento e representa o teu distrito.',
  alternates: {
    canonical: 'https://acordaportugal.pt/jogar',
  },
}

export default function JogarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
