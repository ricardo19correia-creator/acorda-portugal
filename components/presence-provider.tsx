'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { usePathname } from 'next/navigation'
import {
  type PresenceData,
  type UserActivityState,
  type CommunityState,
  type CanonicalPresenceState,
  HEARTBEAT_INTERVAL_MS,
  OFFLINE_THRESHOLD_MS,
  getCommunityState,
} from '@/lib/presence'

const PresenceContext = createContext<CanonicalPresenceState | null>(null)

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
    const safePath = pathname || ''
    if (safePath.startsWith('/jogar')) {
      return 'playing'
    }
    if (safePath.startsWith('/perfil')) {
      return 'profile'
    }
    if (safePath.startsWith('/ranking')) {
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
  const [loading, setLoading] = useState(false)
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
  const sendHeartbeat = useCallback(async () => {
    const { sessionId: currentSessionId, user: currentUser, profile: currentProfile, currentActivity: currentAct, gameId } = presenceInfoRef.current

    try {
      const presenceUid = currentUser?.uid || currentSessionId
      const userRef = doc(db, 'presence', presenceUid)

      const rawDistrict = (currentProfile?.district || '').trim()
      const rawName = (currentProfile?.displayName || currentUser?.displayName || '').trim()

      const payload: Record<string, any> = {
        userId: presenceUid,
        online: true,
        lastSeen: Date.now(),
        updatedAt: serverTimestamp(),
        activity: currentAct,
        gameId: gameId || null,
        district: rawDistrict || 'Portugal',
        level: currentProfile?.level || 1,
        xp: currentProfile?.xp || 0,
        username: rawName || (currentUser ? 'Jogador' : 'Visitante'),
        photoURL: currentProfile?.photoURL || currentUser?.photoURL || null,
        isAnonymous: !currentUser,
        playerType: 'human',
        isNpc: false,
      }

      await setDoc(userRef, payload, { merge: true })
    } catch (err: any) {
      console.warn('Erro ao atualizar heartbeat de presença:', err)
    }
  }, [])

  // Setup periodic heartbeat
  useEffect(() => {
    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [sendHeartbeat])

  // Send offline status on tab unload/beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { sessionId: currentSessionId, user: currentUser } = presenceInfoRef.current
      const presenceUid = currentUser?.uid || currentSessionId
      try {
        const userRef = doc(db, 'presence', presenceUid)
        setDoc(
          userRef,
          {
            online: false,
            lastSeen: Date.now(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch {
        // Unload context: ignore error
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Update `now` periodically every 5s to refresh relative time calculations & NPC rotation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(timer)
  }, [])

  // Subscribe to real-time presence collection
  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      const presenceCol = collection(db, 'presence')
      const q = query(presenceCol, where('online', '==', true), limit(250))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: PresenceData[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as PresenceData
            if (data && data.userId) {
              docs.push(data)
            }
          })
          setRawPresenceDocs(docs)
          setLoading(false)
        },
        (err) => {
          console.warn('Erro ao subscrever presença no Firestore:', err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err: any) {
      console.warn('Erro ao configurar listener de presença:', err)
      setError(err?.message || 'Erro desconhecido')
      setLoading(false)
    }
  }, [])

  // Canonical Single Source of Truth for Community State
  const communityState: CommunityState = useMemo(() => {
    return getCommunityState(rawPresenceDocs, new Date(now), sessionId)
  }, [rawPresenceDocs, now, sessionId])

  const value: CanonicalPresenceState = useMemo(
    () => ({
      ...communityState,
      onlineCount: communityState.humanOnline,
      humanOnlineCount: communityState.humanOnline,
      npcOnlineCount: communityState.npcOnline,
      districtDistribution: communityState.byDistrict,
      currentActivity,
      setActivity,
      loading,
      error,
    }),
    [communityState, currentActivity, setActivity, loading, error]
  )

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}

const fallbackPresenceState: CanonicalPresenceState = {
  activeTotal: 0,
  regionalDistribution: {},
  onlineUsers: [],
  communityActivity: [],
  currentActivity: 'browsing',
  setActivity: () => {},
  loading: false,
  error: null,
}

export function usePresence(): CanonicalPresenceState {
  const context = useContext(PresenceContext)
  return context || fallbackPresenceState
}
