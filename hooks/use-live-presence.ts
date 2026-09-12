'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import {
  type RealCommunityState,
  filterActiveRealPlayers,
} from '@/lib/real-presence'

export function useLivePresence() {
  const { user } = useAuth()
  const [rawDocs, setRawDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const presenceCol = collection(db, 'publicPresence')
      const q = query(presenceCol, where('online', '==', true), limit(250))

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: any[] = []
          snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data && data.userId) {
              docs.push(data)
            }
          })
          setRawDocs(docs)
          setLoading(false)
        },
        (error) => {
          console.debug('[PRESENCE_HOOK] Erro:', error)
          setLoading(false)
        }
      )
    } catch (err) {
      console.debug('[PRESENCE_HOOK] Falha na subscrição:', err)
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 15_000)
    return () => clearInterval(timer)
  }, [])

  const community: RealCommunityState = useMemo(() => {
    return filterActiveRealPlayers(rawDocs, user?.uid, now)
  }, [rawDocs, user?.uid, now])

  return {
    ...community,
    loading,
  }
}
