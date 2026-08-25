'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, Trophy, Sparkles, MapPin, Award, Crown, Swords, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'

const HERO_STATS = [
  {
    icon: Sparkles,
    value: '+1.000',
    label: 'Perguntas Oficiais',
    sub: '18 categorias temáticas',
    tone: 'text-primary',
  },
  {
    icon: MapPin,
    value: '18 + 2',
    label: 'Distritos & Regiões',
    sub: 'Continente, Açores e Madeira',
    tone: 'text-accent',
  },
  {
    icon: Award,
    value: '21 Níveis',
    label: 'Progressão RPG',
    sub: 'De Curioso a Mestre',
    tone: 'text-gold',
  },
  {
    icon: Crown,
    value: '1 Topo',
    label: 'Rei do Distrito',
    sub: 'Conquista territorial',
    tone: 'text-flag-red',
  },
]

export function Hero() {
  const router = useRouter()
  const { user } = useAuth()

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8 bg-transparent">
      {/* Main Centered Hero Copy & CTAs */}
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Official Badge Pill */}
        <div
          className="animate-rise inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          style={{ animationDelay: '60ms' }}
        >
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          <span className="font-display text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-amber-300">
            Desafio Nacional • Edição Oficial
          </span>
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
        </div>

        {/* Main 3D Title with Neon Glint */}
        <h1
          className="animate-rise mt-6 font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-foreground text-3d-chrome leading-[0.95]"
          style={{ animationDelay: '140ms' }}
        >
          Acorda Portugal
        </h1>

        <p
          className="animate-rise mt-5 max-w-2xl text-pretty text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground font-medium mx-auto"
          style={{ animationDelay: '240ms' }}
        >
          Testa o teu conhecimento. Representa o teu distrito. Conquista o topo de Portugal no maior videojogo de trivia nacional.
        </p>

        {/* Action CTAs: 3D Console/Mech Gaming Buttons Perfectly Centered */}
        <div
          className="animate-rise mt-8 flex w-full flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
          style={{ animationDelay: '300ms' }}
        >
          {/* Primary Mech Emerald Button */}
          <button
            type="button"
            onClick={() => handleStartGame('/jogar')}
            className="btn-mech-emerald light-sweep w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-display text-base sm:text-lg font-black uppercase tracking-wider text-emerald-950 cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-emerald-500/30"
          >
            <Play className="h-5 w-5 fill-current text-emerald-950 drop-shadow-sm" />
            <span>Jogar Agora</span>
          </button>

          {/* Duelo 1v1 Fast Match Mech Button */}
          <button
            type="button"
            onClick={() => handleStartGame('/jogar/duelo')}
            className="btn-mech-purple w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider text-white cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-purple-500/30"
          >
            <Swords className="h-5 w-5 drop-shadow-sm" />
            <span>Duelo 1v1</span>
          </button>

          {/* Rankings Mech Gold Button */}
          <Link
            href="/rankings"
            className="btn-mech-gold w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-gold-foreground backdrop-blur-xl cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-amber-500/30"
          >
            <Trophy className="h-4 w-4 text-gold" />
            <span className="text-gold">Rankings</span>
          </Link>
        </div>

        {/* Quick Hub Links Centered */}
        <div
          className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground"
          style={{ animationDelay: '360ms' }}
        >
          <Link href="/categorias" className="hover:text-primary transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">📚 18 Categorias</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/rankings" className="hover:text-accent transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">🏆 Classificação Nacional</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/ajuda" className="hover:text-emerald-300 transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">❓ Perguntas Frequentes</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/explorar" className="hover:text-gold transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">✨ Explorar o Jogo</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>

      {/* Transition Statistics Bar: Holographic Glassmorphism Cards */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {HERO_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="card-hud-cyber group relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] transition-transform duration-300 group-hover:scale-110 shadow-md">
                    <Icon className={cn('h-5 w-5', stat.tone)} />
                  </div>
                  <div>
                    <dd className="font-display text-xl sm:text-2xl font-black text-foreground">
                      {stat.value}
                    </dd>
                    <dt className="text-xs font-bold text-foreground/90 uppercase tracking-wider">{stat.label}</dt>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-snug font-medium">
                  {stat.sub}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

