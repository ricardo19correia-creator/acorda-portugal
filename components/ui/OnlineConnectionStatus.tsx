'use client'

import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OnlineConnectionStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [showReconnected, setShowReconnected] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3500)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold shadow-2xl transition-all duration-300 backdrop-blur-md',
        !isOnline
          ? 'bg-red-600/90 text-white border-b border-red-500 animate-pulse'
          : 'bg-emerald-600/90 text-white border-b border-emerald-500'
      )}
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4 shrink-0 animate-bounce" />
          <span>Ligação à internet perdida. A tentar reconectar...</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          <span>Ligação à internet restabelecida!</span>
        </>
      )}
    </div>
  )
}
