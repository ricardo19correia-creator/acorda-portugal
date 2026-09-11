'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  Crown,
  Medal,
  Play,
  Search,
  Share2,
  Clock,
  Check,
  Award,
  Filter,
  MapPin,
  Swords,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Shield,
  User,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { UserAvatar } from '@/components/ui/UserAvatar'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import {
  ALL_DISTRICTS_LIST,
  subscribeRankings,
  type RankingPlayer,
  calculateCompetitiveDivision,
  DIVISION_COLORS,
} from '@/lib/rankings'
import { ACTIVE_SEASON_01, HISTORICAL_HALL_OF_FAME, calculateTimeRemaining } from '@/lib/seasons'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { cn } from '@/lib/utils'

export type RankingFilterMode = 'nacional' | 'distrito' | 'duelos' | 'temporada'

function EvolutionBadge({ movement }: { movement?: number | null }) {
  if (typeof movement !== 'number' || movement === 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 font-semibold" title="Sem alteração de posição">
        <Minus className="h-3 w-3 text-slate-500" />
        <span>—</span>
      </span>
    )
  }

  if (movement > 0) {
    return (
      <span
        className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30"
        title={`Subiu ${movement} posições esta semana`}
      >
        <TrendingUp className="h-3 w-3" />
        <span>↑ {movement}</span>
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30"
      title={`Desceu ${Math.abs(movement)} posições esta semana`}
    >
      <TrendingDown className="h-3 w-3" />
      <span>↓ {Math.abs(movement)}</span>
    </span>
  )
}

export default function RankingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [activeTab, setActiveTab] = useState<RankingFilterMode>('nacional')
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    if (profile?.district && profile.district.trim() !== '') return profile.district.trim()
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_district')
      if (saved && saved.trim() !== '') return saved.trim()
    }
    return 'Aveiro'
  })
  const [rankingLimit, setRankingLimit] = useState<number>(50)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [copiedShare, setCopiedShare] = useState<boolean>(false)
  const [seasonTime, setSeasonTime] = useState(() => calculateTimeRemaining(ACTIVE_SEASON_01.endDate))
  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>(DEFAULT_AVATAR.image)

  // Atualizar contador da temporada a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setSeasonTime(calculateTimeRemaining(ACTIVE_SEASON_01.endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sincronizar Avatar em Tempo Real
  useEffect(() => {
    const updateAvatar = () => {
      if (typeof window !== 'undefined') {
        const equipped = localStorage.getItem('user_equipped_avatar')
        if (equipped) {
          setUserDisplayAvatar(getAvatarImage(equipped))
        } else if (user?.photoURL) {
          setUserDisplayAvatar(getAvatarImage(user.photoURL))
        } else {
          setUserDisplayAvatar(DEFAULT_AVATAR.image)
        }
      }
    }

    updateAvatar()
    window.addEventListener('avatarChanged', updateAvatar)
    window.addEventListener('inventory_updated', updateAvatar)
    window.addEventListener('storage', updateAvatar)

    return () => {
      window.removeEventListener('avatarChanged', updateAvatar)
      window.removeEventListener('inventory_updated', updateAvatar)
      window.removeEventListener('storage', updateAvatar)
    }
  }, [user?.photoURL])

  // Subscrição Global para Posicionamento Oficial Nacional
  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        let allList = [...data]
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userWins = profile.wins ?? 0
          const userLosses = profile.losses ?? 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
          const userDistrict = (profile.district || 'Portugal').trim()
          const hasCurrentUser = allList.some((p) => p.uid === user.uid)
          if (!hasCurrentUser) {
            allList.push({
              uid: user.uid,
              displayName: profile.displayName || user.displayName || 'Jogador',
              photoURL: profile.photoURL || user.photoURL || userDisplayAvatar,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              title: userTitle,
              equippedTitle: userTitle,
              equippedFrame: (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId,
              wins1v1: userWins,
              losses1v1: userLosses,
              gamesPlayed: userWins + userLosses,
              accuracyRate: profile.totalQuestions && profile.totalQuestions > 0 ? Math.round((profile.correctAnswers / profile.totalQuestions) * 100) : 85,
              rating: Math.max(500, Math.round(1000 + (userWins * 25) - (userLosses * 15) + (userXp / 100))),
              division: 'Bronze',
              streak: userWins > 0 ? Math.min(userWins, 5) : 0,
              weeklyMovement: (profile as any)?.posVariation ?? 0,
              isFounder: Boolean((profile as any)?.isFounder),
            })
          }
        }
        allList.sort((a, b) => b.xp - a.xp)
        setNationalPlayers(allList)
      },
      300
    )
    return () => unsub()
  }, [user?.uid, profile, userDisplayAvatar])

  // Subscrição aos Rankings Filtrados no Firestore
  useEffect(() => {
    setLoading(true)
    const districtFilter = activeTab === 'distrito' ? selectedDistrict : 'all'
    const queryMode = activeTab === 'duelos' ? 'duelos' : 'xp'

    const unsubscribe = subscribeRankings(
      districtFilter,
      queryMode,
      (data) => {
        let list = [...data]

        // Integrar utilizador autenticado se aplicável
        if (user?.uid && profile) {
          const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
          const userWins = profile.wins ?? 0
          const userLosses = profile.losses ?? 0
          const userLevel = calculateLevelProgress(userXp).currentLevel.level
          const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
          const userDistrict = (profile.district || 'Portugal').trim()
          const rating = Math.max(500, Math.round(1000 + (userWins * 25) - (userLosses * 15) + (userXp / 100)))

          const matchesDistrict =
            activeTab !== 'distrito' ||
            userDistrict.toLowerCase() === selectedDistrict.toLowerCase()

          if (matchesDistrict) {
            const hasCurrentUser = list.some((p) => p.uid === user.uid)
            if (!hasCurrentUser) {
              list.push({
                uid: user.uid,
                displayName: profile.displayName || user.displayName || 'Jogador',
                photoURL: profile.photoURL || user.photoURL || userDisplayAvatar,
                level: userLevel,
                xp: userXp,
                district: userDistrict,
                title: userTitle,
                equippedTitle: userTitle,
                equippedFrame: (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId,
                wins1v1: userWins,
                losses1v1: userLosses,
                gamesPlayed: userWins + userLosses,
                accuracyRate: profile.totalQuestions && profile.totalQuestions > 0 ? Math.round((profile.correctAnswers / profile.totalQuestions) * 100) : 85,
                rating,
                division: calculateCompetitiveDivision(rating),
                streak: userWins > 0 ? Math.min(userWins, 5) : 0,
                weeklyMovement: (profile as any)?.posVariation ?? 0,
                isFounder: Boolean((profile as any)?.isFounder),
              })
            }
          }
        }

        // Reordenar
        list.sort((a, b) => {
          if (queryMode === 'duelos') {
            if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
            return (b.rating || 0) - (a.rating || 0)
          }
          if (b.xp !== a.xp) return b.xp - a.xp
          return (b.accuracyRate || 0) - (a.accuracyRate || 0)
        })

        // Atribuir posições
        list = list.map((p, idx) => ({ ...p, pos: idx + 1 }))

        setPlayers(list)
        setLoading(false)
      },
      rankingLimit
    )

    return () => {
      unsubscribe()
    }
  }, [activeTab, selectedDistrict, rankingLimit, user?.uid, profile, userDisplayAvatar])

  // Jogadores filtrados por pesquisa
  const displayPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players
    const q = searchQuery.toLowerCase().trim()
    return players.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q))
    )
  }, [players, searchQuery])

  const top3 = useMemo(() => displayPlayers.slice(0, 3), [displayPlayers])
  const restPlayers = useMemo(() => displayPlayers.slice(3, rankingLimit), [displayPlayers, rankingLimit])

  // Posição do jogador atual
  const currentUserRank = useMemo(() => {
    if (!user?.uid) return null
    return nationalPlayers.find((p) => p.uid === user.uid) || null
  }, [nationalPlayers, user?.uid])

  const currentUserNationalPos = useMemo(() => {
    if (!currentUserRank) return null
    const idx = nationalPlayers.findIndex((p) => p.uid === currentUserRank.uid)
    return idx >= 0 ? idx + 1 : null
  }, [nationalPlayers, currentUserRank])

  const currentUserDistrictPos = useMemo(() => {
    if (!currentUserRank) return null
    const distPlayers = nationalPlayers.filter(
      (p) => (p.district || '').toLowerCase() === (currentUserRank.district || '').toLowerCase()
    )
    const idx = distPlayers.findIndex((p) => p.uid === currentUserRank.uid)
    return idx >= 0 ? idx + 1 : null
  }, [nationalPlayers, currentUserRank])

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSelectPlayer = (p: RankingPlayer | any) => {
    const isVip = Boolean(
      p.isFounder ||
        p.displayName?.toLowerCase().includes('riky') ||
        p.title?.toLowerCase().includes('fundador')
    )

    setSelectedPlayer({
      id: p.uid,
      username: p.displayName,
      avatarUrl: p.photoURL || undefined,
      equippedFrame: p.equippedFrame,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos || 1,
      virtualMoney: p.virtualMoney ?? (p.xp * 2),
      isVip,
      title: p.title || (p.pos === 1 ? 'Líder Nacional' : 'Competidor'),
      rating: p.rating,
      division: p.division || (p.rating ? calculateCompetitiveDivision(p.rating) : 'Bronze'),
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsLost: p.losses1v1 || 0,
        duelsTotal: p.gamesPlayed || (p.wins1v1 || 0) + 5,
        accuracyRate: p.accuracyRate || (p.xp > 0 ? 85 : 0),
        streak: p.streak,
      },
      badges: [
        { icon: '🇵🇹', name: p.district || 'Portugal' },
        { icon: '🏆', name: `Top #${p.pos || 1}` },
        { icon: '⚡', name: `Nível ${p.level || 1}` },
      ],
    })
  }

  const handleSharePosition = () => {
    const posText = currentUserNationalPos
      ? `Estou em #${currentUserNationalPos} no Campeonato Nacional do Acorda Portugal! 🇵🇹 Vem competir comigo:`
      : `Vem competir no Campeonato Nacional de Portugal 2050 no Acorda Portugal! 🇵🇹`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://acordaportugal.pt/rankings'

    if (navigator.share) {
      navigator.share({
        title: 'Acorda Portugal — Rankings Nacionais',
        text: posText,
        url: shareUrl,
      }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${posText} ${shareUrl}`)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 3000)
    }
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="ranking" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-32">
          {/* ========================================================================= */}
          {/* 1. CABEÇALHO COMPETITIVO */}
          {/* ========================================================================= */}
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8">
            {/* Atalhos de Navegação Complementar (Sem duplicar funcionalidades) */}
            <div className="flex items-center justify-between gap-3 mb-4 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Explorar Outras Áreas:
                </span>
                <Link
                  href="/portugal-mapa"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mapa de Portugal</span>
                </Link>
                <Link
                  href="/meu-distrito"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Meu Distrito</span>
                </Link>
                <Link
                  href="/perfil"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Perfil</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleSharePosition}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
              >
                {copiedShare ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Partilhar Posição</span>
                  </>
                )}
              </button>
            </div>

            {/* Banner Principal de Ranking */}
            <div className="relative rounded-3xl sm:rounded-4xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Luzes de energia decorativas */}
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      CLASSIFICAÇÃO OFICIAL
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5" suppressHydrationWarning>
                      <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                      {`${ACTIVE_SEASON_01.name} • ${seasonTime.formatted}`}
                    </span>
                  </div>

                  <h1
                    className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white"
                    style={{ textShadow: '0 4px 20px rgba(16, 185, 129, 0.3)' }}
                  >
                    RANKING
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                    A tabela de elite do Acorda Portugal. Conquista XP nas partidas, eleva o teu nível e compete pelo topo de Portugal e do teu distrito.
                  </p>
                </div>

                {/* Bloco Resumo do Jogador Autenticado (TU) */}
                {user?.uid ? (
                  <div className="w-full lg:w-auto p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-emerald-500/30 backdrop-blur-xl flex items-center justify-between lg:justify-start gap-4">
                    <UserAvatar
                      src={userDisplayAvatar}
                      activeFrame={(profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId}
                      size="md"
                      isCurrentUser
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black font-mono">
                          TU
                        </span>
                        <span className="font-bold text-sm text-white truncate max-w-[140px] sm:max-w-[180px]">
                          {profile?.displayName || user.displayName || 'Jogador'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-base sm:text-lg font-black text-amber-400 font-display">
                          #{currentUserNationalPos || '--'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Nacional
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {(profile?.xp || 0).toLocaleString('pt-PT')} XP
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>Nível {calculateLevelProgress(profile?.xp || 0).currentLevel.level}</span>
                        <span>•</span>
                        <span>📍 {profile?.district || 'Portugal'}</span>
                        <span>•</span>
                        <EvolutionBadge movement={(profile as any)?.posVariation ?? 0} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => handleStartGame('/entrar?redirect=/ranking')}
                      className="button-game-gold w-full sm:w-auto px-6 py-3.5 rounded-2xl font-display text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-105 transition-transform"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Entrar para Competir</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. FILTROS DE RANKING COM SUPORTE REAL DE DADOS */}
            {/* ========================================================================= */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Alternador de Classificações */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab('nacional')}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'nacional'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <span>🇵🇹 Portugal (Geral)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('distrito')
                    if (profile?.district && profile.district.trim() !== '') {
                      setSelectedDistrict(profile.district.trim())
                    }
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'distrito'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Por Distrito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('duelos')}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'duelos'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Duelos 1v1</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('temporada')}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'temporada'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Temporada 01</span>
                </button>
              </div>

              {/* Controlos de Pesquisa, Distrito e Limite */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* 4. MEU DISTRITO: Seleção dos 20 distritos (sem concelhos) */}
                {activeTab === 'distrito' && (
                  <div className="flex items-center gap-1.5">
                    {profile?.district && (
                      <button
                        type="button"
                        onClick={() => setSelectedDistrict(profile.district.trim())}
                        className={cn(
                          'px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer',
                          selectedDistrict.toLowerCase() === profile.district.toLowerCase()
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                        )}
                        title="Filtrar pelo teu próprio distrito"
                      >
                        📍 Meu Distrito
                      </button>
                    )}

                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="rounded-2xl border border-emerald-500/40 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                    >
                      {ALL_DISTRICTS_LIST.map((dist) => (
                        <option key={dist} value={dist}>
                          📍 {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Barra de Pesquisa */}
                {activeTab !== 'temporada' && (
                  <div className="relative min-w-[180px] sm:min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Procurar jogador..."
                      className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>
                )}

                {/* Seletor de Limite */}
                {activeTab !== 'temporada' && (
                  <div className="flex items-center gap-1 bg-slate-900 rounded-2xl border border-white/10 px-2.5 py-1.5">
                    <Filter className="w-3 h-3 text-slate-400" />
                    <select
                      value={rankingLimit}
                      onChange={(e) => setRankingLimit(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value={25}>Top 25</option>
                      <option value={50}>Top 50</option>
                      <option value={100}>Top 100</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONTEÚDO PRINCIPAL DE CLASSIFICAÇÃO */}
          {/* ========================================================================= */}
          {activeTab === 'temporada' ? (
            /* ABA: TEMPORADA 01 (REGRAS E PRÉMIOS) */
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-6">
              <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-cyan-400 block">
                      TEMPORADA OFICIAL ATIVA
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5">
                      {ACTIVE_SEASON_01.name} — {ACTIVE_SEASON_01.subtitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1" suppressHydrationWarning>
                      Tema: «{ACTIVE_SEASON_01.theme}» • Termina em {seasonTime.formatted}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Pool de Moedas</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      🪙 {ACTIVE_SEASON_01.totalPrizePoolCoins.toLocaleString('pt-PT')}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black uppercase text-slate-300 font-mono mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Quadro de Recompensas Oficiais:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {ACTIVE_SEASON_01.rewards.map((r, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{r.rankRange}</span>
                        <span className="text-xs font-mono font-black text-amber-400">
                          +🪙 {r.coins.toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-300 font-semibold">{r.title}</span>
                      <span className="text-[11px] text-slate-400">{r.exclusiveCosmetic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hall of Fame Histórico */}
              {HISTORICAL_HALL_OF_FAME.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                  <div className="border-b border-white/10 pb-4 mb-4">
                    <h3 className="text-lg font-black text-white font-display">
                      🏛️ Campeões Anteriores
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {HISTORICAL_HALL_OF_FAME.map((hof) => (
                      <div
                        key={hof.seasonId}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                            {hof.seasonName}
                          </span>
                          <span className="text-sm font-bold text-white">
                            🥇 {hof.champion.displayName} ({hof.champion.district})
                          </span>
                        </div>
                        <span className="text-xs font-mono text-cyan-400">
                          {hof.champion.finalXp.toLocaleString('pt-PT')} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TABELA DE RANKINGS & PÓDIO (NACIONAL / DISTRITO / DUELOS) */
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8">
              {/* Skeleton Loading */}
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="grid grid-cols-3 items-end gap-3 sm:gap-6 max-w-3xl mx-auto h-56 bg-white/5 rounded-3xl" />
                  <div className="space-y-2.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-16 rounded-2xl bg-white/5" />
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* 2. PÓDIO DOS 3 PRIMEIROS JOGADORES */}
              {/* ========================================================================= */}
              {!loading && top3.length > 0 && (
                <div className="mb-10 max-w-3xl mx-auto pt-4">
                  <div className="grid grid-cols-3 items-end gap-2 sm:gap-6">
                    {[
                      {
                        slotPlayer: top3[1] || null,
                        slotRank: 2,
                        heightClass: 'h-40 sm:h-48',
                        podiumBg: 'bg-gradient-to-b from-slate-300/15 via-slate-900/90 to-slate-950/95 border-slate-300/30 shadow-[0_0_20px_rgba(203,213,225,0.15)]',
                        badgeBg: 'bg-slate-200 text-slate-950 ring-2 ring-white/60',
                        avatarSize: 'lg' as const,
                      },
                      {
                        slotPlayer: top3[0] || null,
                        slotRank: 1,
                        heightClass: 'h-48 sm:h-60',
                        podiumBg: 'bg-gradient-to-b from-amber-500/20 via-slate-900/90 to-slate-950/95 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30',
                        badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-300 font-black',
                        avatarSize: 'xl' as const,
                      },
                      {
                        slotPlayer: top3[2] || null,
                        slotRank: 3,
                        heightClass: 'h-36 sm:h-42',
                        podiumBg: 'bg-gradient-to-b from-amber-700/20 via-slate-900/90 to-slate-950/95 border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.15)]',
                        badgeBg: 'bg-amber-700 text-white ring-2 ring-amber-600',
                        avatarSize: 'lg' as const,
                      },
                    ].map(({ slotPlayer, slotRank, heightClass, podiumBg, badgeBg, avatarSize }) => {
                      if (!slotPlayer) return <div key={slotRank} className="h-20" />
                      const isCurrent = Boolean(user?.uid && slotPlayer.uid === user.uid)
                      const isFirst = slotRank === 1

                      return (
                        <div
                          key={slotPlayer.uid}
                          onClick={() => handleSelectPlayer(slotPlayer)}
                          className="cursor-pointer group flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5"
                        >
                          {/* Coroa no 1.º Lugar */}
                          {isFirst ? (
                            <div className="mb-1 animate-pulse">
                              <Crown className="h-7 w-7 sm:h-9 sm:w-9 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                            </div>
                          ) : (
                            <div className="h-7 sm:h-9 mb-1" />
                          )}

                          <UserAvatar
                            src={isCurrent ? userDisplayAvatar : slotPlayer.photoURL}
                            activeFrame={slotPlayer.equippedFrame}
                            equippedFrame={slotPlayer.equippedFrame}
                            size={avatarSize}
                            rank={slotRank}
                            isCurrentUser={isCurrent}
                          />

                          <div className="mt-2.5 flex flex-col items-center text-center w-full px-1">
                            <span className="truncate max-w-[100px] sm:max-w-[160px] text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                              {slotPlayer.displayName}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              📍 {slotPlayer.district}
                            </span>
                          </div>

                          {/* Pilar de Pódio */}
                          <div
                            className={cn(
                              'mt-2.5 flex w-full flex-col items-center justify-end rounded-t-3xl border border-b-0 pb-3 pt-3 transition-all shadow-xl',
                              podiumBg,
                              heightClass
                            )}
                          >
                            <span
                              className={cn(
                                'grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-xl font-display text-xs sm:text-sm font-black shadow-md',
                                badgeBg
                              )}
                            >
                              {slotRank}º
                            </span>

                            <span className="mt-1.5 font-display text-xs sm:text-sm font-black text-white font-mono">
                              {activeTab === 'duelos'
                                ? `${slotPlayer.rating || 1000} Elo`
                                : `${slotPlayer.xp.toLocaleString('pt-PT')} XP`}
                            </span>

                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                              Nível {slotPlayer.level}
                            </span>

                            <div className="mt-1">
                              <EvolutionBadge movement={slotPlayer.weeklyMovement} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* 5. LISTA PRINCIPAL COMPETITIVA (Posição 4 em diante) */}
              {/* ========================================================================= */}
              {!loading && restPlayers.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                  {/* Cabeçalho da Lista para Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-[11px] font-mono font-black uppercase tracking-wider text-slate-400">
                    <span className="col-span-1">#</span>
                    <span className="col-span-6">Jogador</span>
                    <span className="col-span-2 text-center">Nível</span>
                    <span className="col-span-2 text-right">
                      {activeTab === 'duelos' ? 'Rating' : 'Pontos XP'}
                    </span>
                    <span className="col-span-1 text-center">Evolução</span>
                  </div>

                  {/* Linhas de Jogadores */}
                  <ul className="divide-y divide-white/5 p-2 space-y-1">
                    {restPlayers.map((p) => {
                      const isCurrent = Boolean(user?.uid && p.uid === user.uid)

                      return (
                        <li
                          key={p.uid}
                          onClick={() => handleSelectPlayer(p)}
                          className={cn(
                            'cursor-pointer rounded-2xl transition-all border p-3 sm:px-4 sm:py-3',
                            isCurrent
                              ? 'bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                              : 'border-transparent bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                          )}
                        >
                          {/* Layout Responsivo: Mobile & Desktop */}
                          <div className="flex items-center justify-between gap-3">
                            {/* Lado Esquerdo: Posição + Avatar + Nome */}
                            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                              <span
                                className={cn(
                                  'grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl font-display text-xs sm:text-sm font-black border font-mono',
                                  isCurrent
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-slate-950 text-slate-300 border-white/10'
                                )}
                              >
                                #{p.pos}
                              </span>

                              <div className="shrink-0">
                                <UserAvatar
                                  src={isCurrent ? userDisplayAvatar : p.photoURL}
                                  activeFrame={p.equippedFrame}
                                  equippedFrame={p.equippedFrame}
                                  size="sm"
                                  isCurrentUser={isCurrent}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-xs sm:text-sm text-white truncate">
                                    {p.displayName}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40">
                                      TU
                                    </span>
                                  )}
                                  {p.isFounder && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                      👑 FUNDADOR
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>📍 {p.district}</span>
                                  <span className="sm:hidden">• Nível {p.level}</span>
                                </div>
                              </div>
                            </div>

                            {/* Coluna Nível (Desktop) */}
                            <div className="hidden sm:flex items-center justify-center w-24 shrink-0">
                              <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-bold text-slate-300">
                                Nível {p.level}
                              </span>
                            </div>

                            {/* Lado Direito: XP/Pontos + Evolução */}
                            <div className="flex items-center gap-3 shrink-0 text-right">
                              <div>
                                <span className="font-mono font-black text-xs sm:text-sm text-cyan-400 block">
                                  {activeTab === 'duelos'
                                    ? `${p.rating || 1000} Elo`
                                    : `${p.xp.toLocaleString('pt-PT')} XP`}
                                </span>
                                {activeTab === 'duelos' && (
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {p.wins1v1 || 0}V - {p.losses1v1 || 0}D
                                  </span>
                                )}
                              </div>

                              <div className="w-14 sm:w-16 flex justify-end">
                                <EvolutionBadge movement={p.weeklyMovement} />
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Estado Vazio (Sem Jogadores) */}
              {!loading && displayPlayers.length === 0 && (
                <div className="text-center py-16 px-4 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                  <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Nenhum jogador encontrado
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    {searchQuery
                      ? `Não encontramos resultados para "${searchQuery}". Tenta procurar por outro nome.`
                      : 'Ainda não existem classificações disponíveis para este filtro.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
                    >
                      Limpar Pesquisa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ========================================================================= */}
        {/* BARRA FIXA «A TUA POSIÇÃO» (STICKY FOOTER HUD) */}
        {/* ========================================================================= */}
        {user?.uid && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-emerald-500/40 p-2.5 sm:p-4 landscape:py-1.5 landscape:px-4 safe-area-bottom safe-area-x backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={userDisplayAvatar}
                  activeFrame={(profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId}
                  size="sm"
                  isCurrentUser
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider">
                      A TUA POSIÇÃO
                    </span>
                    {currentUserRank?.weeklyMovement ? (
                      <span className="text-[10px] font-mono text-emerald-300 font-bold">
                        (↑ +{currentUserRank.weeklyMovement} posições)
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-black text-white">
                    <span className="text-amber-400 font-display">
                      #{currentUserNationalPos ? currentUserNationalPos : '--'} Nacional
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 truncate">
                      #{currentUserDistrictPos ? currentUserDistrictPos : '--'} em {profile?.district || 'Portugal'}
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-cyan-400 font-mono hidden sm:inline">
                      {(profile?.xp || 0).toLocaleString('pt-PT')} XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartGame('/jogar')}
                  className="button-game-gold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Jogar Agora</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <SiteFooter />
      </div>

      {/* Modal de Perfil Competitivo */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}
