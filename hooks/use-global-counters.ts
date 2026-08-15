'use client'

import { useEffect, useState } from 'react'
import { ref, onValue } from 'firebase/database'
import { rtdb } from '@/lib/firebase'

export type GlobalCounters = {
  onlineCount: number
  playingCount: number
  registeredPlayers: number
  gamesToday: number
  loading: boolean
  error: string | null
}

export function useGlobalCounters(): GlobalCounters {
  const [onlineCount, setOnlineCount] = useState(0)
  const [playingCount, setPlayingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const usersRef = ref(rtdb, 'presence/users')
    const guestsRef = ref(rtdb, 'presence/guests')

    let usersData: Record<string, any> = {}
    let guestsData: Record<string, any> = {}

    const calculate = () => {
      const users = Object.values(usersData)
      const guests = Object.values(guestsData)

      const allPresence = [...users, ...guests]

      setOnlineCount(allPresence.length)
      setPlayingCount(
        allPresence.filter((item: any) => item?.status === 'playing').length,
      )
      setLoading(false)
    }

    const unsubscribeUsers = onValue(
      usersRef,
      (snapshot) => {
        usersData = snapshot.val() ?? {}
        calculate()
      },
      (error) => {
        console.error('[COUNTERS] Erro users:', error)
        setError('Erro ao carregar jogadores online.')
        setLoading(false)
      },
    )

    const unsubscribeGuests = onValue(
      guestsRef,
      (snapshot) => {
        guestsData = snapshot.val() ?? {}
        calculate()
      },
      (error) => {
        console.error('[COUNTERS] Erro guests:', error)
        setError('Erro ao carregar jogadores online.')
        setLoading(false)
      },
    )

    return () => {
      unsubscribeUsers()
      unsubscribeGuests()
    }
  }, [])

  return {
    onlineCount,
    playingCount,
    registeredPlayers: 0,
    gamesToday: 0,
    loading,
    error,
  }
}
