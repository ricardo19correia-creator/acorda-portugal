import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acorda Portugal — Desafio Nacional',
}

export default function JogarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-black select-none overscroll-none touch-none">
      {children}
    </div>
  )
}
