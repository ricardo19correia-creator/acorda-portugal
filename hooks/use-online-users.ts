'use client'

import { useEffect, useState } from 'react'

export function useOnlineUsers() {
  const [onlineCount, setOnlineCount] = useState<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let devId = localStorage.getItem('ap_dev_id') || localStorage.getItem('ap_device_id')
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36)
      localStorage.setItem('ap_dev_id', devId)
      localStorage.setItem('ap_device_id', devId)
    }

    let isMounted = true

    const updatePresence = async () => {
      try {
        const res = await fetch('/api/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: devId }),
          cache: 'no-store',
        })
        if (res.ok && isMounted) {
          const data = await res.json()
          if (typeof data?.online === 'number') {
            setOnlineCount(data.online)
          } else if (typeof data?.onlineCount === 'number') {
            setOnlineCount(data.onlineCount)
          }
        }
      } catch (e) {
        // fallback
      }
    }

    updatePresence()
    const interval = setInterval(updatePresence, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return onlineCount
}
