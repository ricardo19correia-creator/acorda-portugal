'use client'

import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'

export type RankedPlayer = Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'level' | 'xp' | 'district'> & {
  rank: number
}

export function useHomepageNationalRanking() {
  const [ranking, setRanking] = useState<RankedPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      const q = query(
        collection(db, 'publicProfiles'),
        orderBy('xp', 'desc'),
        limit(10),
      )

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: RankedPlayer[] = []
          snapshot.docs.forEach((docSnap, idx) => {
            const data = docSnap.data()
            list.push({
              uid: docSnap.id,
              displayName: data.displayName || data.name || 'Jogador',
              photoURL: data.photoURL || data.avatar || '',
              level: data.level || 1,
              xp: data.xp || 0,
              district: data.district || 'Portugal',
              rank: idx + 1,
            })
          })
          setRanking(list)
          setLoading(false)
        },
        (err) => {
          console.warn('[HOME RANKING] Erro ao obter ranking real:', err)
          setLoading(false)
        },
      )
    } catch (e) {
      setLoading(false)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { ranking, loading, error }
}
