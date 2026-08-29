'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Gamepad2,
  Swords,
  Activity,
  MapPin,
  Radio,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { usePresence } from '@/components/presence-provider'
import { SectionHeading } from '@/components/section-heading'
import { ACTIVITY_LABELS, type PublicActiveUser } from '@/lib/presence'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

export function LivePresence() {
  const router = useRouter()
  const { user } = useAuth()
  const { onlineCount, playingCount, duelCount, activeUsers, loading } = usePresence()

  const handleStartGame = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user && !auth?.currentUser) {
      router.push('/entrar?redirect=/jogar')
      return
    }
    router.push('/jogar')
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/40 p-6 backdrop-blur-xl sm:p-10">
        {/* Glow ambient background elements */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-flag-red/10 blur-3xl" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Em Direto
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            🇵🇹 Agora no <span className="text-brand-gradient">Acorda Portugal</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Comunidade ativa em tempo real. Vê quem está online, a responder a perguntas e a representar o seu distrito.
          </p>
        </div>

        {/* 3 Real-time Counters */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Card 1: Online */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-card">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {onlineCount}
              </div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Utilizadores Online
              </p>
            </div>
          </div>

          {/* Card 2: Playing */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur transition-all duration-300 hover:border-accent/40 hover:bg-card">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-accent">
                🎮 A JOGAR
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {playingCount}
              </div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                A Jogar neste momento
              </p>
            </div>
          </div>

          {/* Card 3: Duel */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/70 p-5 backdrop-blur transition-all duration-300 hover:border-gold/40 hover:bg-card">
            <div className="flex items-center justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <Swords className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[0.7rem] font-bold text-gold">
                ⚔️ DUELOS
              </span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {duelCount}
              </div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Em Duelo 1v1
              </p>
            </div>
          </div>
        </div>

        {/* Live Users Feed */}
        <div className="relative z-10 mt-8 rounded-2xl border border-white/5 bg-background/50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                Atividade Recente da Comunidade
              </h3>
            </div>
            <button
              type="button"
              onClick={handleStartGame}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:text-primary/80 cursor-pointer"
            >
              Entrar numa partida
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {activeUsers.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                A carregar presença da comunidade...
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {activeUsers.slice(0, 9).map((u) => (
                <UserActivityCard key={u.id} user={u} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function UserActivityCard({ user }: { user: PublicActiveUser }) {
  const meta = ACTIVITY_LABELS[user.activity] || ACTIVITY_LABELS.browsing

  const toneClasses = {
    primary: 'border-primary/30 bg-primary/10 text-primary',
    red: 'border-flag-red/30 bg-flag-red/10 text-flag-red',
    gold: 'border-gold/30 bg-gold/10 text-gold',
    accent: 'border-accent/30 bg-accent/10 text-accent',
    muted: 'border-white/10 bg-white/5 text-muted-foreground',
  }

  const initial = user.username.charAt(0).toUpperCase() || 'J'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-card/60 px-3.5 py-2.5 backdrop-blur transition-all duration-200 hover:border-white/15 hover:bg-card">
      <div className="flex min-w-0 items-center gap-3">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.username}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 font-display text-xs font-bold text-primary ring-2 ring-primary/20">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold text-foreground">
              {user.username}
            </span>
            {user.isCurrentUser && (
              <span className="rounded bg-primary/20 px-1 py-0.2 text-[0.62rem] font-black text-primary">
                TU
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 truncate text-[0.68rem] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5 text-primary/70" />
            {user.district} • Nível {user.level || 1}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold',
          toneClasses[meta.tone]
        )}
      >
        <span>{meta.icon}</span>
        <span>{meta.label}</span>
      </div>
    </div>
  )
}
