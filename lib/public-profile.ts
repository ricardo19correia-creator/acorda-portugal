import { serverTimestamp } from 'firebase/firestore'
import type { UserProfile } from '@/lib/game-data'

export type PublicProfile = {
  uid: string
  displayName: string
  photoURL: string
  district: string
  xp: number
  level: number
}

export function toPublicProfile(
  profile: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'district' | 'xp' | 'level'>
): PublicProfile {
  return {
    uid: profile.uid,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    district: profile.district ?? '',
    xp: profile.xp,
    level: profile.level,
  }
}

export function publicProfileWrite(
  profile: Pick<UserProfile, 'uid' | 'displayName' | 'photoURL' | 'district' | 'xp' | 'level'>
) {
  return {
    ...toPublicProfile(profile),
    updatedAt: serverTimestamp()
  }
}