'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  MapPin,
  Trophy,
  Swords,
  Globe,
  Flame,
  Shield,
  Clock,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { Portugal3DExperience } from '@/components/portugal-3d-map/Portugal3DExperience'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { subscribeRankings, type RankingPlayer } from '@/lib/rankings'
import { calculateDistrictWarTerritories } from '@/lib/district-war'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'

export default function PortugalMapaPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => profile?.district || 'Lisboa')
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [copiedShare, setCopiedShare] = useState<boolean>(false)

  // Subscrição Global para Alimentar o Mapa Tático
  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        let allList = [...data]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userWins = profile.wins ?? 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasCurrentUser = allList.some((p) => p.uid === user.uid)
          if (!hasCurrentUser) {
            allList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || DEFAULT_AVATAR.image,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              title: userTitle,
              equippedTitle: userTitle,
              equippedFrame: (profile as any)?.equippedFrame,
              wins1v1: userWins,
              losses1v1: 0,
              gamesPlayed: userWins,
              accuracyRate: 85,
              rating: 1000 + userWins * 25,
              division: 'Bronze',
              streak: 0,
              weeklyMovement: 0,
            })
          }
        }
        setNationalPlayers(allList)
      },
      300
    )
    return () => unsub()
  }, [user?.uid, profile])

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

  const handleShare = () => {
    const text = `Explora o Mapa Tático de Portugal 2050 no Acorda Portugal! 🇵🇹`
    const url = typeof window !== 'undefined' ? window.location.href : 'https://acordaportugal.pt/portugal-mapa'
    if (navigator.share) {
      navigator.share({ title: 'Portugal 2050 — Mapa Tático 3D', text, url }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 3000)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="about" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-16">
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
              <div>
                <Link
                  href="/rankings"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-white/10 hover:text-white backdrop-blur-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ir para Rankings Gerais
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge-hud text-cyan-400 border-cyan-500/40 bg-cyan-500/15 shadow-md shadow-cyan-500/20 flex items-center gap-1.5 font-mono">
                    <Globe className="h-3.5 w-3.5" />
                    18 Distritos + 2 Regiões Autónomas
                  </span>
                </div>
                <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-white">
                  PORTUGAL DIGITAL 2050
                </h1>
                <p className="mt-1.5 text-sm sm:text-base text-slate-300 font-medium max-w-2xl">
                  Explora o território nacional em 3D, inspeciona o domínio da Guerra dos Distritos e apoia a tua região.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-5 py-4 rounded-2xl bg-slate-900 border border-white/15 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-cyan-400" />
                      <span>Partilhar Mapa</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleStartGame(`/jogar?distrito=${encodeURIComponent(selectedDistrict)}`)}
                  className="button-game-gold inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Conquistar Território</span>
                </button>
              </div>
            </div>

            {/* Mapa 3D Completo */}
            <div className="mt-4">
              <Portugal3DExperience
                territories={districtWarTerritories}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(dist) => setSelectedDistrict(dist)}
                onSelectPlayer={handleSelectPlayer}
                onStartGame={handleStartGame}
              />
            </div>
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
