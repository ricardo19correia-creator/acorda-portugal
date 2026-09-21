'use client'

import React from 'react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { PortoLisboaEvent } from '@/components/events/PortoLisboaEvent'

export default function PortoVsLisboaPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="challenges" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-16 sm:pb-24">
          <PortoLisboaEvent />
        </main>
      </div>
    </div>
  )
}
