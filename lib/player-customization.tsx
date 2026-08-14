'use client'

import { SectionHeading } from '@/components/section-heading'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export function PlayerCustomization() {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          title="Personalizar Perfil"
          description="Altera o teu nome, avatar e outros detalhes."
        />
        <Button variant="outline" disabled>
          <Settings className="mr-2 h-4 w-4" /> Editar Perfil (Em breve)
        </Button>
      </div>
    </section>
  )
}