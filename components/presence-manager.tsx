'use client'

import { usePresence } from '@/hooks/use-presence'

export function PresenceManager() {
  usePresence('online')
  return null
}
