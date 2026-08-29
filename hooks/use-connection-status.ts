'use client'

import { useState, useEffect } from 'react'
import { connectionManager, type ConnectionState } from '@/lib/connection-manager'

export function useConnectionStatus() {
  const [state, setState] = useState<ConnectionState>(() =>
    typeof window !== 'undefined' ? connectionManager.getState() : 'connected'
  )
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false)

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((newState) => {
      setState(newState)
      setIsReconnecting(newState === 'reconnecting')
    })
    return () => unsubscribe()
  }, [])

  return {
    state,
    isConnected: state === 'connected',
    isReconnecting: state === 'reconnecting',
    isFailed: state === 'failed',
    forceReconnect: () => connectionManager.forceReconnect(),
  }
}
