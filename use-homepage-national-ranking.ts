'use client'

import { useState } from 'react';
import type { UserProfile } from '@/lib/game-data';

export type RankedPlayer = Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'level' | 'xp' | 'district'> & {
  rank: number;
};

const STATIC_RANKING: RankedPlayer[] = [
  { rank: 1, uid: 'static-1', displayName: 'Tiago Pereira', xp: 8760, level: 18, district: 'Vila Real', photoURL: '' },
  { rank: 2, uid: 'static-2', displayName: 'Joana Santos', xp: 5840, level: 14, district: 'Porto', photoURL: '' },
  { rank: 3, uid: 'static-3', displayName: 'Miguel Costa', xp: 4920, level: 12, district: 'Braga', photoURL: '' },
  { rank: 4, uid: 'static-4', displayName: 'Ana Martins', xp: 4380, level: 11, district: 'Lisboa', photoURL: '' },
  { rank: 5, uid: 'static-5', displayName: 'Pedro Silva', xp: 3970, level: 10, district: 'Aveiro', photoURL: '' },
  { rank: 6, uid: 'static-6', displayName: 'Rui Fernandes', xp: 3510, level: 9, district: 'Bragança', photoURL: '' },
  { rank: 7, uid: 'static-7', displayName: 'Sofia Almeida', xp: 3260, level: 8, district: 'Viseu', photoURL: '' },
  { rank: 8, uid: 'static-8', displayName: 'Daniel Rodrigues', xp: 2940, level: 8, district: 'Coimbra', photoURL: '' },
  { rank: 9, uid: 'static-9', displayName: 'Mariana Lopes', xp: 2680, level: 7, district: 'Faro', photoURL: '' },
  { rank: 10, uid: 'static-10', displayName: 'João Carvalho', xp: 2410, level: 7, district: 'Viana do Castelo', photoURL: '' },
];

export function useHomepageNationalRanking() {
  const [ranking] = useState<RankedPlayer[]>(STATIC_RANKING);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { ranking, loading, error };
}