'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User, updateProfile as updateFirebaseAuthProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'
import { publicProfileWrite } from '@/lib/public-profile'

type AuthState = {
  user: User | null
  authResolved: boolean
  authInitializationError: string | null
  profile: UserProfile | null
  profileLoading: boolean
  profileError: string | null
  retryProfile: () => void
  updateProfile: (updater: (profile: UserProfile) => UserProfile) => void
  waitForAuthenticatedUser: (uid: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function createDefaultUserProfile(user: User): UserProfile {
  const now = new Date()
  return {
    uid: user.uid, // Ensure uid is always set
    displayName: user.displayName ?? (user.isAnonymous ? 'Jogador convidado' : 'Jogador'),
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    level: 1,
    xp: 0,
    euros: 100,
    streak: 0,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    bestStreak: 0,
    unlockedAchievements: [],
    badges: [],
    createdAt: now,
    updatedAt: now,
  }
}

function normalizeUserProfile(user: User, data: Record<string, unknown>): UserProfile {
  const defaults = createDefaultUserProfile(user)
  return {
    ...defaults,
    ...data,
    uid: user.uid,
    // Ensure essential fields from auth are always up-to-date
    displayName: user.displayName ?? data.displayName ?? defaults.displayName,
    photoURL: user.photoURL ?? data.photoURL ?? defaults.photoURL,
    email: user.email ?? data.email ?? defaults.email,
  } as UserProfile
}

/** Creates users/{uid} only when it does not already exist, then returns it. */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
	const userRef = doc(db, 'users', user.uid);
	const publicProfileRef = doc(db, 'publicProfiles', user.uid);

	// 1. Use set with merge: true as a safe "upsert" operation.
	// This creates the document with defaults if it's missing, or does nothing
	// if it exists, without overwriting existing data.
	const defaultProfile = createDefaultUserProfile(user);
	await setDoc(userRef, defaultProfile, { merge: true });

	// 2. Now, safely read the definitive state of the profile.
	const finalSnapshot = await getDoc(userRef);
	const finalProfile = normalizeUserProfile(user, finalSnapshot.data() ?? {});

	// 3. Sync to public profile in the background (fire-and-forget).
	// This operation is secondary and should not block the main profile loading.
	setDoc(publicProfileRef, publicProfileWrite(finalProfile), { merge: true }).catch((error) => console.error('[AUTH] Failed to sync public profile:', error));

	return finalProfile;
}

function profileErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: unknown; message?: unknown }
  const code = typeof firebaseError.code === 'string' ? firebaseError.code : ''

  if (code === 'permission-denied') {
    return 'Não tens permissão para aceder ao teu perfil. Confirma as regras do Firestore e tenta novamente.'
  }

  console.error('[PROFILE FIRESTORE]', error); // Log the actual error
  return 'Não foi possível carregar o teu perfil. Verifica a ligação e tenta novamente.'
}

/** The only Firebase Auth listener in the application. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [authInitializationError, setAuthInitializationError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileRetry, setProfileRetry] = useState(0)
  const authenticatedUserRef = useRef<User | null>(null)
  const authWaitersRef = useRef<Array<{ uid: string; resolve: () => void }>>([])
  const retryProfile = useCallback(() => setProfileRetry((value) => value + 1), [])
  const updateProfile = useCallback((updater: (profile: UserProfile) => UserProfile) => {
    setProfile((currentProfile) => currentProfile ? updater(currentProfile) : currentProfile)
  }, [])
  const waitForAuthenticatedUser = useCallback(async (uid: string) => {
    if (authenticatedUserRef.current?.uid === uid) return

    await new Promise<void>((resolve) => {
      authWaitersRef.current.push({ uid, resolve })
    })
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        authenticatedUserRef.current = currentUser
        setUser(currentUser)
        setAuthInitializationError(null)
        setAuthResolved(true)
        authWaitersRef.current = authWaitersRef.current.filter((waiter) => {
          if (currentUser?.uid !== waiter.uid) return true
          waiter.resolve()
          return false
        })
      },
      (error) => {
        console.error('Não foi possível verificar a sessão Firebase:', error)
        authenticatedUserRef.current = null
        setUser(null)
        setAuthInitializationError('Não foi possível verificar a sessão. Atualiza a página e tenta novamente.')
        setAuthResolved(true)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!authResolved || !user) {
      if (authResolved) {
        setProfile(null)
        setProfileError(null)
        setProfileLoading(false)
      }
      return
    }

    setProfile(null)
    setProfileLoading(true)
    setProfileError(null)

    void ensureUserProfile(user)
      .then((nextProfile) => {
        if (!cancelled) setProfile(nextProfile)
      })
      .catch((error: unknown) => {
        console.error('Não foi possível sincronizar o perfil Firestore:', error)
        if (!cancelled) setProfileError(profileErrorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => { cancelled = true }
  }, [authResolved, profileRetry, user])

  return <AuthContext.Provider value={{ user, authResolved, authInitializationError, profile, profileLoading, profileError, retryProfile, updateProfile, waitForAuthenticatedUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const state = useContext(AuthContext)
  if (!state) throw new Error('useAuth tem de ser utilizado dentro de AuthProvider.')
  return state
}
