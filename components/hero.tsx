'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Play,
  Trophy,
  Sparkles,
  MapPin,
  Award,
  Crown,
  Swords,
  ArrowRight,
  Globe,
  Clock,
  Flame,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVE_SEASON_01, calculateTimeRemaining } from '@/lib/seasons'
import { PortugalVectorFallback } from '@/components/portugal-map/PortugalVectorFallback'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { logGameFlow } from '@/lib/game-session'

const HERO_STATS = [
  {
    icon: Sparkles,
    value: '+5.000',
    label: 'Perguntas Oficiais',
    sub: '18 categorias temáticas',
    tone: 'text-primary',
  },
  {
    icon: MapPin,
    value: '20 Territórios',
    label: '18 Distritos + Ilhas',
    sub: 'Continente, Açores e Madeira',
    tone: 'text-accent',
  },
  {
    icon: Award,
    value: '21 Níveis',
    label: 'Progressão RPG',
    sub: 'De Curioso a Mestre Supremo',
    tone: 'text-gold',
  },
  {
    icon: Crown,
    value: 'Guerra dos Distritos',
    label: 'Rei do Território',
    sub: 'Poder & Domínio Nacional',
    tone: 'text-flag-red',
  },
]

export function Hero() {
  const router = useRouter()
  const [seasonTime, setSeasonTime] = useState(() => calculateTimeRemaining(ACTIVE_SEASON_01.endDate))
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Lisboa')

  // Atualizar temporizador decrescente a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setSeasonTime(calculateTimeRemaining(ACTIVE_SEASON_01.endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Subscrição em Tempo Real para alimentar o radar do Hero
  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (players) => {
        setNationalPlayers(players)
      },
      100
    )
    return () => unsub()
  }, [])

  const territories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  const handleStartGame = (gameRoute: string) => {
    logGameFlow('JOGAR_CLICK', {
      from: 'Hero',
      route: gameRoute,
    })
    router.push(gameRoute)
  }

  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12 lg:pt-6 bg-transparent">
      {/* Main Centered Hero Copy & CTAs */}
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Official Badge Pill & Season Timer */}
        <div
          className="animate-rise inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-amber-500/15 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          style={{ animationDelay: '60ms' }}
        >
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          <span className="font-display text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-amber-300">
            DESAFIO NACIONAL 🇵🇹 {ACTIVE_SEASON_01.name}
          </span>
          <span className="text-white/30 hidden sm:inline">•</span>
          <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {seasonTime.formatted}
          </span>
        </div>

        {/* Main 3D Title with Chrome & Neon Glint */}
        <div className="mt-6">
          <h1
            className="animate-rise font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white text-3d-chrome leading-[0.92]"
            style={{ animationDelay: '140ms' }}
          >
            ACORDA PORTUGAL
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-widest text-cyan-400 font-display mt-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            DESAFIO NACIONAL
          </h2>
        </div>

        {/* Subtítulo Oficial 2150 */}
        <p
          className="animate-rise mt-5 max-w-2xl text-pretty text-base sm:text-lg md:text-xl leading-relaxed text-slate-200 font-bold mx-auto"
          style={{ animationDelay: '200ms' }}
        >
          Portugal entrou no futuro. Agora és tu que decides quem domina o mapa.
        </p>

        <p
          className="animate-rise mt-2 max-w-xl text-xs sm:text-sm text-slate-400 font-medium mx-auto"
          style={{ animationDelay: '240ms' }}
        >
          Joga a solo, desafia em Duelos 1v1, ganha Acordas Virtuais e defende o teu território na Guerra dos Distritos.
        </p>

        {/* Os 3 CTAs Principais Requeridos */}
        <div
          className="animate-rise mt-8 flex w-full flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
          style={{ animationDelay: '300ms' }}
        >
          {/* CTA 1: Jogar Agora */}
          <button
            type="button"
            onClick={() => handleStartGame('/jogar')}
            className="btn-mech-emerald light-sweep w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-display text-base sm:text-lg font-black uppercase tracking-wider text-emerald-950 cursor-pointer shadow-2xl hover:scale-105 transition-all duration-300 shadow-emerald-500/40"
          >
            <Play className="h-5 w-5 fill-current text-emerald-950 drop-shadow-sm" />
            <span>Jogar Agora</span>
          </button>

          {/* CTA 2: Explorar Portugal 3D */}
          <Link
            href="/portugal-mapa"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider text-cyan-300 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 backdrop-blur-xl cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-cyan-950/50"
          >
            <Globe className="h-5 w-5 text-cyan-400" />
            <span>Explorar Portugal 3D</span>
          </Link>

          {/* CTA 3: Classificação Nacional */}
          <Link
            href="/rankings"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-4 font-display text-sm sm:text-base font-black uppercase tracking-wider text-amber-300 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 backdrop-blur-xl cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 shadow-amber-950/50"
          >
            <Trophy className="h-5 w-5 text-amber-400" />
            <span>Classificação Nacional</span>
          </Link>
        </div>

        {/* Quick Hub Links Centered */}
        <div
          className="animate-rise mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-slate-400"
          style={{ animationDelay: '360ms' }}
        >
          <Link href="/jogar/duelo" className="hover:text-purple-400 transition flex items-center gap-1.5 group">
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span className="group-hover:translate-x-0.5 transition">⚔️ Duelos 1v1 Elo</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/loja" className="hover:text-amber-300 transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">🛒 Loja & VIP</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/categorias" className="hover:text-cyan-300 transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">📚 18 Categorias</span>
          </Link>
          <span className="text-white/20">•</span>
          <Link href="/download" className="hover:text-emerald-300 transition flex items-center gap-1.5 group">
            <span className="group-hover:translate-x-0.5 transition">📱 App Android</span>
          </Link>
        </div>
      </div>

      {/* MAPA TÁTICO DE PORTUGAL (PRÉ-VISUALIZAÇÃO INTERATIVA) */}
      <div className="mt-10 max-w-4xl mx-auto rounded-3xl border border-cyan-500/30 bg-slate-950/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs font-black uppercase tracking-widest text-cyan-400">
              PORTUGAL EM TEMPO REAL // 20 TERRITÓRIOS
            </span>
          </div>
          <Link
            href="/portugal-mapa"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 hover:scale-102 transition-all cursor-pointer"
          >
            <span>Explorar Portugal 2150 em 3D</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <PortugalVectorFallback
          territories={territories}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={(d) => setSelectedDistrict(d)}
        />
      </div>

      {/* Estatísticas do Ecossistema */}
      <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
          {HERO_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="card-hud-cyber group relative overflow-hidden rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[0.06] transition-transform duration-300 group-hover:scale-110 shadow-md">
                    <Icon className={cn('h-5 w-5', stat.tone)} />
                  </div>
                  <div>
                    <dd className="font-display text-xl sm:text-2xl font-black text-white">
                      {stat.value}
                    </dd>
                    <dt className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.label}</dt>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-400 leading-snug font-medium">
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
