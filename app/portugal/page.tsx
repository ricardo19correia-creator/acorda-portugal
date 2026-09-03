'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { BackgroundFx } from '@/components/background-fx'
import { SiteHeader } from '@/components/site-header'
import { DistrictRanking } from '@/components/district-ranking'
import { SiteFooter } from '@/components/site-footer'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Play, Globe, Flag, Trophy, Swords } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'

const Portugal3DExperienceDynamic = dynamic(
  () =>
    import('@/components/portugal-3d-map/Portugal3DExperience').then(
      (mod) => mod.Portugal3DExperience
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[640px] sm:h-[720px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-slate-950 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Globe className="w-7 h-7 text-emerald-400 absolute inset-0 m-auto" />
        </div>
        <span className="font-mono text-xs font-black uppercase tracking-widest text-emerald-400">
          A INICIALIZAR RADAR 3D // PORTUGAL 2150
        </span>
      </div>
    ),
  }
)

export default function PortugalPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Lisboa')
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)

  useEffect(() => {
    if (profile?.district) {
      setSelectedDistrict(profile.district)
    }
  }, [profile?.district])

  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        setNationalPlayers(data)
      },
      300
    )
    return () => unsub()
  }, [])

  const districtWarTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSelectPlayer = (p: any) => {
    setSelectedPlayer({
      id: p.uid,
      username: p.displayName,
      avatarUrl: p.photoURL || undefined,
      equippedFrame: p.equippedFrame,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos || 1,
      virtualMoney: p.xp * 2,
      isVip: Boolean(p.isFounder),
      title: p.title || 'Guardião Distrital',
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsTotal: p.gamesPlayed || 10,
        accuracyRate: 85,
      },
      badges: [{ icon: '🇵🇹', name: p.district || 'Portugal' }],
    })
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="about" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-16">
          {/* Header Banner */}
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
              <div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao Início
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge-hud text-cyan-400 border-cyan-500/40 bg-cyan-500/15 shadow-md shadow-cyan-500/20 flex items-center gap-1.5 font-mono">
                    <Flag className="h-3.5 w-3.5" />
                    18 Distritos + 2 Regiões Autónomas
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-white">
                  Portugal Territorial 2050
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-slate-300 font-medium">
                  Explora o mapa interativo 3D, apoia o teu território e compete pelo título de Rei do Distrito.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/rankings"
                  className="px-5 py-4 rounded-2xl bg-slate-900 border border-white/15 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Ver Rankings Gerais</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleStartGame('/jogar?cat=o-meu-distrito')}
                  className="button-game-gold inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Conquistar Distrito</span>
                </button>
              </div>
            </div>

            {/* Interactive 3D Map Showcase */}
            <div className="mt-4">
              <Portugal3DExperienceDynamic
                territories={districtWarTerritories}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(dist) => setSelectedDistrict(dist)}
                onSelectPlayer={handleSelectPlayer}
                onStartGame={handleStartGame}
              />
            </div>
          </div>

          {/* District Territorial Ranking Section */}
          <div className="mt-10">
            <DistrictRanking />
          </div>
        </main>

        <SiteFooter />
      </div>

      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}
