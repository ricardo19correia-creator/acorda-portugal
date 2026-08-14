'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'

import { db } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import type { UserProfile } from '@/lib/game-data'

import { BackgroundFx } from '@/components/background-fx'
import { SectionHeading } from '@/components/section-heading'
import { ProfileHero } from '@/components/profile/profile-hero'
import { PlayerCard } from '@/components/profile/player-card'
import { PlayerStats } from '@/components/profile/player-stats'
import { PlayerStreak } from '@/components/profile/player-streak'
import { PlayerAchievements } from '@/components/profile/player-achievements'
import { PlayerDistrict } from '@/components/profile/player-district'
import { PlayerRanking } from '@/components/profile/player-ranking'
import { PlayerActivity } from '@/components/profile/player-activity'
import { PlayerCustomization } from '@/components/profile/player-customization'
import { Button } from '@/components/ui/button'

function ProfilePageContent() {
  const { user, authResolved } = useAuth()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    setUserProfile(null)
    setProfileLoading(true)
    setProfileError(null)

    if (!user) {
      setProfileLoading(false)

      return () => {
        active = false
      }
    }

    const loadProfile = async () => {
      try {
        console.log('[Perfil] A carregar perfil:', user.uid)

        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (!active) return

        if (userSnap.exists()) {
          console.log('[Perfil] Perfil encontrado.')

          setUserProfile(userSnap.data() as UserProfile)
        } else {
          console.warn(
            '[Perfil] Documento users/' + user.uid + ' não existe.'
          )

          setProfileError(
            'O teu perfil ainda não foi criado no Firestore.'
          )
        }
      } catch (error: unknown) {
        console.error('[Perfil] ERRO FIRESTORE:', error)

        if (!active) return

        const firebaseError = error as {
          code?: string
          message?: string
        }

        const code = firebaseError.code ?? 'unknown-error'

        if (code === 'permission-denied') {
          setProfileError(
            'O Firestore recusou o acesso ao teu perfil. Verifica as regras de segurança do Firestore.'
          )
        } else {
          setProfileError(
            `Não foi possível carregar o teu perfil. [${code}]`
          )
        }
      } finally {
        if (active) {
          setProfileLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [user])

  // A autenticação ainda está a ser determinada.
  if (!authResolved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p className="text-sm text-muted-foreground">
          A verificar a tua conta...
        </p>
      </div>
    )
  }

  // Não existe utilizador autenticado.
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <SectionHeading
          title="Perfil de Jogador"
          description="Cria uma conta ou faz login para veres o teu progresso, conquistas, nível e estatísticas."
        />

        <Link
          href="/#perfil"
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          Criar Conta ou Entrar
        </Link>
      </div>
    )
  }

  // O perfil do Firestore ainda está a carregar.
  if (profileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        <p className="text-sm text-muted-foreground">
          A carregar o teu perfil...
        </p>
      </div>
    )
  }

  // O perfil não conseguiu ser carregado.
  if (profileError || !userProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <SectionHeading
          title="Perfil temporariamente indisponível"
          description={
            profileError ??
            'Não foi possível carregar os dados do teu perfil.'
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl"
          >
            Tentar novamente
          </Button>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  // Perfil carregado com sucesso.
  return (
    <ProfileDetails
      user={user}
      profile={userProfile}
    />
  )
}

function ProfileDetails({
  user,
  profile,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>
  profile: UserProfile
}) {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <ProfileHero
        user={user}
        profile={profile}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlayerCard
            user={user}
            profile={profile}
          />
        </div>

        <PlayerStats profile={profile} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerStreak profile={profile} />

        <PlayerDistrict profile={profile} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerAchievements profile={profile} />

        <PlayerRanking profile={profile} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerActivity profile={profile} />

        <PlayerCustomization profile={profile} />
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundFx />

      <ProfilePageContent />
    </div>
  )
}