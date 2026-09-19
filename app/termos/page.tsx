import type { Metadata } from 'next'
import { TermosContent } from '@/components/termos-content'

export const metadata: Metadata = {
  title: 'Termos & Privacidade — Acorda Portugal',
  description:
    'Termos de Utilização e Política de Privacidade do Acorda Portugal num único documento. Informação clara sobre regras de jogo, contas, moeda virtual e proteção de dados RGPD.',
  alternates: {
    canonical: 'https://acordaportugal.pt/termos',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://acordaportugal.pt/termos',
    siteName: 'Acorda Portugal — Desafio Nacional',
    title: 'Termos & Privacidade — Acorda Portugal',
    description:
      'Termos de Utilização e Política de Privacidade do Acorda Portugal num único documento. Informação clara sobre regras de jogo, contas, moeda virtual e proteção de dados RGPD.',
  },
}

export default function TermosPage() {
  return <TermosContent />
}
