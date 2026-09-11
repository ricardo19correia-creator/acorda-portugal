'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { MeuDistritoView } from '@/components/distrito/MeuDistritoView'

function MeuDistritoContent() {
  const searchParams = useSearchParams()
  const districtParam = searchParams.get('dist') || searchParams.get('distrito') || searchParams.get('district')

  return <MeuDistritoView initialDistrict={districtParam} />
}

export default function MeuDistritoPage() {
  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="district" />

      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />

        <main className="flex-1 w-full pb-16 lg:pb-8">
          <Suspense fallback={null}>
            <MeuDistritoContent />
          </Suspense>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
