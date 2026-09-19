import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comunidade — Acorda Portugal',
  description: 'Partilha ideias, sugestões, opiniões e problemas com a comunidade Acorda Portugal.',
}

export default function ComunidadeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
