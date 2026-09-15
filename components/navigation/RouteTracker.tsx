'use client'

import React, { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function RouteTrackerInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
  const lastUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (lastUrlRef.current && lastUrlRef.current !== currentUrl) {
        const rawDepth = sessionStorage.getItem('ap_nav_depth')
        const currentDepth = rawDepth ? parseInt(rawDepth, 10) : 0
        sessionStorage.setItem('ap_nav_depth', String(isNaN(currentDepth) ? 1 : currentDepth + 1))
        sessionStorage.setItem('ap_prev_path', lastUrlRef.current)
      } else if (!sessionStorage.getItem('ap_nav_depth')) {
        sessionStorage.setItem('ap_nav_depth', '0')
      }
    } catch {}

    lastUrlRef.current = currentUrl
  }, [currentUrl])

  return null
}

export function RouteTracker() {
  return (
    <Suspense fallback={null}>
      <RouteTrackerInner />
    </Suspense>
  )
}

export default RouteTracker
