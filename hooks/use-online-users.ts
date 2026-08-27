'use client'

import { usePresence } from '@/components/presence-provider'

export function useOnlineUsers(): number {
  try {
    const { onlineCount } = usePresence()
    return onlineCount
  } catch {
    return 0
  }
}
