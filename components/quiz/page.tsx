'use client'

import { useState, useEffect, Suspense } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/components/player-card'
import { ProfileDetails } from '@/components/profile/profile-details'
import { BackgroundFx } from '@/components/background-fx'
import { SectionHeading } from '@/components/section-heading'

function ProfilePageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">A carregar perfil...</div>
  }

  if (!user || !userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <SectionHeading title="Perfil de Jogador" description="Cria uma conta ou faz login para veres o teu progresso e estatísticas." />
        <Link href="/#perfil" className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground">
          Criar Conta ou Entrar
        </Link>
      </div>
    )
  }

  return <ProfileDetails user={user} profile={userProfile} />
}

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">A carregar...</div>}>
        <ProfilePageContent />
      </Suspense>
    </div>
  )
}