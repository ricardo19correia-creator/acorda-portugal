'use client'

import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { HowItWorks } from '@/components/how-it-works'
import { Progression } from '@/components/progression'
import { Rewards } from '@/components/rewards'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Gamepad2, Trophy, LayoutGrid, Sparkles } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

export default function ExplorarPage() {
  const router = useRouter()
  const { user } = useAuth()

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="about" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1">
          {/* Breadcrumb & Intro Header */}
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Início
                </Link>
                <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-primary">
                  Explorar o Acorda Portugal
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-medium">
                  Descobre como funciona a competição, o sistema de progressão por níveis e as recompensas de videojogo.
                </p>
              </div>

              {/* Quick Jump Action Links */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleStartGame('/jogar')}
                  className="button-game-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Jogar Agora</span>
                </button>
                <Link
                  href="/rankings"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold text-foreground hover:bg-white/20 transition shadow-md"
                >
                  <Trophy className="h-4 w-4 text-gold" />
                  <span>Rankings</span>
                </Link>
                <Link
                  href="/categorias"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-bold text-foreground hover:bg-white/20 transition shadow-md"
                >
                  <LayoutGrid className="h-4 w-4 text-accent" />
                  <span>Categorias</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Section: Como Funciona */}
          <HowItWorks />

          {/* Section: Progressão & Níveis RPG */}
          <Progression />

          {/* Section: Recompensas */}
          <Rewards />
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
