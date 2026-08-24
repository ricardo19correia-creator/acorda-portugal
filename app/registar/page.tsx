'use client'

import { Suspense } from 'react'
import { EntrarPageContent } from '../entrar/page'

export default function RegistarPage() {
  return (
    <Suspense fallback={null}>
      <EntrarPageContent defaultMode="register" />
    </Suspense>
  )
}
