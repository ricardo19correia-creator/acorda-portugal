'use client'

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/game-data';

export type RankedPlayer = Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'level' | 'xp' | 'district'> & {
  rank: number;
};

export function useHomepageNationalRanking() {
  const [ranking, setRanking] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'publicProfiles'),
      orderBy('xp', 'desc'),
      limit(10) // Top 10 players
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedRanking: RankedPlayer[] = [];
      let rank = 1;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserProfile;
        // Ensure displayName is valid, otherwise skip or use a fallback
        if (data.displayName) {
          fetchedRanking.push({
            rank,
            uid: data.uid,
            displayName: data.displayName,
            photoURL: data.photoURL,
            level: data.level,
            xp: data.xp,
            district: data.district,
          });
          rank++;
        }
      });

      setRanking(fetchedRanking);
      setLoading(false);
    }, (err: any) => {
      console.error('[FIRESTORE RANKING] Erro ao carregar ranking nacional:', err);
      console.error('Firebase Error Code:', err.code);
      console.error('Firebase Error Message:', err.message);
      setError('Não foi possível carregar o ranking. Tente novamente.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { ranking, loading, error };
}