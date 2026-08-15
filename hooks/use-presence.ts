﻿'use client'

import { useEffect, useRef, useCallback } from 'react'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

const GUEST_SESSION_ID_KEY = 'acorda-portugal-guest-session-id'
const HEARTBEAT_INTERVAL_MS = 60 * 1000; // 1 minute heartbeat

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export function usePresence(status: 'online' | 'playing' = 'online') {
  const { user, authResolved } = useAuth()
  const sessionIdRef = useRef<string | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getSessionId = useCallback(() => {
    if (user) return user.uid

    let sessionId = window.localStorage.getItem(GUEST_SESSION_ID_KEY)

    if (!sessionId) {
      sessionId = createSessionId()
      window.localStorage.setItem(GUEST_SESSION_ID_KEY, sessionId)
    }

    return sessionId
  }, [user])

  useEffect(() => {
    if (!authResolved) return

    const sessionId = getSessionId()
    const path = user
      ? `presence/users/${sessionId}`
      : `presence/guests/${sessionId}`

    const currentRef = ref(rtdb, path)
    presenceRef.current = currentRef

    const presenceData = {
      uid: user?.uid ?? null,
      sessionId,
      status,
      isAuth: !!user,
      lastSeen: serverTimestamp(),
    }

    set(currentRef, presenceData)
      .then(() => onDisconnect(currentRef).remove())
      .catch((error) => {
        console.error('[PRESENCE] Erro ao registar presença:', error)
      })

    heartbeatRef.current = setInterval(() => {
      update(currentRef, {
        status,
        lastSeen: serverTimestamp(),
      }).catch((error) => {
        console.error('[PRESENCE] Erro no heartbeat:', error)
      })
    }, HEARTBEAT_INTERVAL_MS)

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }

      onDisconnect(currentRef).cancel().catch(() => {})
      set(currentRef, null).catch(() => {})

      presenceRef.current = null
    }
  }, [authResolved, user, status, getSessionId])
}
