'use client'

import { SectionHeading } from '@/components/section-heading'
import { History } from 'lucide-react'

export function PlayerActivity() {
  return (
    <section>
      <SectionHeading
        title="Atividade Recente"
        description="O teu histórico de jogo e recompensas."
      />
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-card/60 p-12 text-center backdrop-blur">
        <History className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 max-w-xs text-sm text-muted-foreground">A tua atividade aparecerá aqui quando começares a jogar.</p>
      </div>
    </section>
  )
}