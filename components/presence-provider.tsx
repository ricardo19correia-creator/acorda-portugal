'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  limit,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import {
  ACTIVITY_LABELS,
  OFFLINE_THRESHOLD_MS,
  sanitizeDisplayName,
  type PresenceData,
  type PublicActiveUser,
  type UserActivityState,
} from '@/lib/presence'

type PresenceContextValue = {
  onlineCount: number
  playingCount: number
  duelCount: number
  activeUsers: PublicActiveUser[]
  currentActivity: UserActivityState
  setActivity: (activity: UserActivityState, gameId?: string | null) => void
  loading: boolean
  error: string | null
}

const PresenceContext = createContext<PresenceContextValue | null>(null)

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  // Track activity state
  const [explicitActivity, setExplicitActivity] = useState<{
    activity: UserActivityState
    gameId: string | null
  } | null>(null)

  // Derive current activity from route unless overridden explicitly
  const currentActivity: UserActivityState = useMemo(() => {
    if (explicitActivity) {
      return explicitActivity.activity
    }
    if (pathname.startsWith('/jogar')) {
      return 'playing'
    }
    if (pathname.startsWith('/perfil')) {
      return 'profile'
    }
    if (pathname.startsWith('/ranking')) {
      return 'ranking'
    }
    return 'browsing'
  }, [explicitActivity, pathname])

  const setActivity = useCallback((activity: UserActivityState, gameId: string | null = null) => {
    setExplicitActivity({ activity, gameId })
  }, [])

  // Auto reset explicit activity on route transition
  useEffect(() => {
    setExplicitActivity(null)
  }, [pathname])

  // Gera um ID único por aba/sessão do browser (para contar instâncias e dispositivos ativos reais)
  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return 'guest_server'
    try {
      let id = sessionStorage.getItem('client_presence_id')
      if (!id) {
        id = `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`
        sessionStorage.setItem('client_presence_id', id)
      }
      return id
    } catch {
      return `guest_${Math.random().toString(36).substring(2, 10)}`
    }
  }, [])

  // Local state for all online users retrieved from Firestore
  const [rawPresenceDocs, setRawPresenceDocs] = useState<PresenceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  // Keep a ref to mutable presence info to avoid interval recreation
  const presenceInfoRef = useRef({
    sessionId,
    user,
    profile,
    currentActivity,
    gameId: explicitActivity?.gameId ?? null,
  })

  useEffect(() => {
    presenceInfoRef.current = {
      sessionId,
      user,
      profile,
      currentActivity,
      gameId: explicitActivity?.gameId ?? null,
    }
  }, [sessionId, user, profile, currentActivity, explicitActivity])

  // Heartbeat sender
  const sendHeartbeat = useCallback(async (isOnline = true) => {
    const { sessionId: currentSessionId, user: currentUser, profile: currentProfile, currentActivity: currentAct, gameId: currentGameId } = presenceInfoRef.current
    if (!currentSessionId) return

    const username = sanitizeDisplayName(
      currentUser?.displayName ?? currentProfile?.displayName,
      !currentUser,
      currentProfile?.district
    )

    const payload: PresenceData = {
      userId: currentUser?.uid || currentSessionId,
      online: isOnline,
      lastSeen: Date.now(),
      activity: currentAct,
      gameId: currentGameId,
      district: currentProfile?.district || 'Portugal',
      level: currentProfile?.level || 1,
      xp: currentProfile?.xp || 0,
      username,
      photoURL: currentUser?.photoURL || currentProfile?.photoURL || null,
      isAnonymous: !currentUser,
      updatedAt: serverTimestamp(),
    }

    try {
      const docRef = doc(db, 'presence', currentSessionId)
      await setDoc(docRef, payload, { merge: true })
    } catch (err) {
      console.warn('[PRESENCE] Heartbeat warning:', err)
    }
  }, [])

  // Manage heartbeat lifecycle
  useEffect(() => {
    if (!sessionId) return

    // Send immediate heartbeat on mount or activity/session change
    void sendHeartbeat(true)

    // Schedule periodic heartbeat (a cada 10s para presença ágil)
    const heartbeatTimer = setInterval(() => {
      void sendHeartbeat(true)
    }, 10_000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void sendHeartbeat(true)
      }
    }

    const handleBeforeUnload = () => {
      // Mark offline on unload
      try {
        const docRef = doc(db, 'presence', sessionId)
        void setDoc(
          docRef,
          {
            online: false,
            lastSeen: Date.now(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch {}
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      clearInterval(heartbeatTimer)
      if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [sessionId, sendHeartbeat, currentActivity])

  // Single subscription to active presence in Firestore
  useEffect(() => {
    const presenceQuery = query(
      collection(db, 'presence'),
      where('online', '==', true),
      limit(200)
    )

    const unsubscribe = onSnapshot(
      presenceQuery,
      (snapshot) => {
        const docs: PresenceData[] = []
        snapshot.forEach((d) => {
          const data = d.data() as Partial<PresenceData>
          if (data && typeof data.lastSeen === 'number') {
            docs.push({
              userId: d.id,
              online: data.online ?? true,
              lastSeen: data.lastSeen,
              activity: (data.activity as UserActivityState) || 'browsing',
              gameId: data.gameId || null,
              district: data.district || 'Portugal',
              level: typeof data.level === 'number' ? data.level : 1,
              xp: typeof data.xp === 'number' ? data.xp : 0,
              username: data.username || 'Jogador',
              photoURL: data.photoURL || null,
              isAnonymous: Boolean(data.isAnonymous),
              updatedAt: data.updatedAt,
            })
          }
        })
        setRawPresenceDocs(docs)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('[PRESENCE] Subscription error:', err)
        setError('Não foi possível carregar a presença em tempo real.')
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [])

  // Local ticker to re-evaluate active users rapidly without requiring Firestore writes
  useEffect(() => {
    const ticker = setInterval(() => {
      setNow(Date.now())
    }, 2_000)
    return () => clearInterval(ticker)
  }, [])

  // Filter valid active users within threshold
  const { onlineCount, playingCount, duelCount, activeUsers } = useMemo(() => {
    const validUsers = rawPresenceDocs.filter((p) => {
      if (!p.online) return false
      const timeDiff = now - p.lastSeen
      return timeDiff >= 0 && timeDiff <= OFFLINE_THRESHOLD_MS
    })

    let playing = 0
    let duel = 0

    const formattedList: PublicActiveUser[] = validUsers.map((u) => {
      if (u.activity === 'playing') playing++
      if (u.activity === 'duel') duel++

      const meta = ACTIVITY_LABELS[u.activity] || ACTIVITY_LABELS.browsing
      return {
        id: u.userId,
        username: u.username,
        district: u.district || 'Portugal',
        level: u.level || 1,
        xp: u.xp || 0,
        activity: u.activity,
        activityLabel: meta.label,
        photoURL: u.photoURL,
        lastSeen: u.lastSeen,
        isCurrentUser: u.userId === sessionId,
      }
    })

    // Sort: current user first, then by lastSeen descending
    formattedList.sort((a, b) => {
      if (a.isCurrentUser) return -1
      if (b.isCurrentUser) return 1
      return b.lastSeen - a.lastSeen
    })

    return {
      onlineCount: Math.max(1, validUsers.length),
      playingCount: playing,
      duelCount: duel,
      activeUsers: formattedList,
    }
  }, [rawPresenceDocs, now, sessionId])

  const value = useMemo(
    () => ({
      onlineCount,
      playingCount,
      duelCount,
      activeUsers,
      currentActivity,
      setActivity,
      loading,
      error,
    }),
    [
      onlineCount,
      playingCount,
      duelCount,
      activeUsers,
      currentActivity,
      setActivity,
      loading,
      error,
    ]
  )

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (!context) {
    throw new Error('usePresence deve ser utilizado dentro de um PresenceProvider.')
  }
  return context
}
