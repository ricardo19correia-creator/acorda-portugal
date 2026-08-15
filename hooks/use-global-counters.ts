﻿'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type GlobalCounters = {
  onlineCount: number
  playingCount: number
  loading: boolean
  error: string | null
}

export function useGlobalCounters(): GlobalCounters {
  const [onlineCount, setOnlineCount] = useState(0)
  const [playingCount, setPlayingCount] = useState(0)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const presenceCollection = collection(db, 'presence');
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const q = query(
      presenceCollection,
      where('lastSeen', '>', Timestamp.fromDate(twoMinutesAgo)),
      where('online', '==', true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let online = 0;
        let playing = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          online++;
          if (data.status === 'playing') {
            playing++;
          }
        });
        setOnlineCount(online);
        setPlayingCount(playing);
        setLoading(false);
      },
      (error) => {
        console.error('[FIRESTORE PRESENCE]', error);
        setError('Erro ao carregar jogadores online.');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    }
  }, [])

  return {
    onlineCount,
    playingCount,
    loading,
    error,
  }
}
