'use client'

import React, { Suspense } from 'react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { Events } from '@/components/events'

export default function EventosPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="challenges" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-16 sm:pb-24">
          <Suspense
            fallback={
              <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
                <div className="h-8 w-8 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <p className="mt-4 text-xs text-slate-400 font-bold uppercase tracking-wider">A carregar eventos...</p>
              </div>
            }
          >
            <Events />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
