'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import {
  type RealCommunityState,
  presenceManager,
} from '@/lib/real-presence'

export function useLivePresence(): RealCommunityState {
  const { user } = useAuth()
  const [state, setState] = useState<RealCommunityState>(() => presenceManager.getState())

  useEffect(() => {
    presenceManager.updateCurrentUid(user?.uid)
    const unsubscribe = presenceManager.subscribe((newState) => {
      setState(newState)
    }, user?.uid)

    return unsubscribe
  }, [user?.uid])

  return state
}

