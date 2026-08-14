'use client'

import { useState, useEffect, Suspense } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import type { UserProfile } from '@/components/player-card'
import { ProfileDetails } from '@/components/profile/profile-details'
import { BackgroundFx } from '@/components/background-fx'
import { SectionHeading } from '@/components/section-heading'

function ProfilePageContent() {
  const { user, authResolved } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let active = true
    setUserProfile(null)

    if (!user) return () => { active = false }

    void getDoc(doc(db, 'users', user.uid)).then((userSnap) => {
      if (active && userSnap.exists()) setUserProfile(userSnap.data() as UserProfile)
    })

    return () => { active = false }
  }, [user])

  if (!authResolved) {
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
