'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Play,
  MapPin,
  Trophy,
  Crown,
  Globe,
  Swords,
  Sparkles,
  Users,
  ChevronRight,
  Medal,
  Flame,
  Shield,
  Filter,
  Search,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  Award,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Portugal3DExperience } from '@/components/portugal-3d-map/Portugal3DExperience'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import {
  ALL_DISTRICTS_LIST,
  subscribeRankings,
  type RankingPlayer,
  DIVISION_COLORS,
  calculateCompetitiveDivision,
} from '@/lib/rankings'
import { calculateDistrictWarTerritories, type DistrictWarTerritory } from '@/lib/district-war'
import { ACTIVE_SEASON_01, HISTORICAL_HALL_OF_FAME, calculateTimeRemaining } from '@/lib/seasons'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { cn } from '@/lib/utils'

export type RankingNavTab =
  | 'nacional'
  | 'distritos'
  | 'duelos'
  | 'guerra'
  | 'temporada'
  | 'hall-of-fame'
  | 'subidas'

export default function RankingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [activeTab, setActiveTab] = useState<RankingNavTab>('nacional')
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => profile?.district || 'Lisboa')
  const [rankingLimit, setRankingLimit] = useState<number>(50)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week' | 'today'>('all')
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [copiedShare, setCopiedShare] = useState<boolean>(false)
  const [seasonTime, setSeasonTime] = useState(() => calculateTimeRemaining(ACTIVE_SEASON_01.endDate))

  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>(() =>
    getAvatarImage(typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null)
  )

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

  // Subscrição aos Rankings no Firestore
  useEffect(() => {
    setLoading(true)
    const districtFilter = activeTab === 'distritos' ? selectedDistrict : 'all'
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
            activeTab !== 'distritos' || userDistrict.toLowerCase() === selectedDistrict.toLowerCase()

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
                weeklyMovement: 2,
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

  // Subscrição Global para Guerra dos Distritos e Métricas Territoriais
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])

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
              photoURL: profile.photoURL || user.photoURL || userDisplayAvatar,
              level: userLevel,
              xp: userXp,
              district: userDistrict,
              title: userTitle,
              equippedTitle: userTitle,
              equippedFrame: (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId,
              wins1v1: userWins,
              losses1v1: 0,
              gamesPlayed: userWins,
              accuracyRate: 85,
              rating: 1000 + (userWins * 25),
              division: 'Bronze',
              streak: 0,
              weeklyMovement: 0,
              isFounder: Boolean((profile as any)?.isFounder),
            })
          }
        }
        setNationalPlayers(allList)
      },
      300
    )
    return () => unsub()
  }, [user?.uid, profile, userDisplayAvatar])

  // Calcular Territórios da Guerra dos Distritos
  const districtWarTerritories = useMemo(() => {
    return calculateDistrictWarTerritories(nationalPlayers)
  }, [nationalPlayers])

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
    <div className="relative min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500 selection:text-black">
      <BackgroundFx variant="ranking" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-28">
          {/* HERO CINEMATOGRÁFICO PORTUGAL 2050 */}
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="relative rounded-4xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Luzes de energia decorativas */}
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="badge-hud text-gold border-gold/40 bg-gold/15 shadow-md shadow-gold/20 flex items-center gap-1.5 font-mono">
                      <Trophy className="h-3.5 w-3.5" />
                      CAMPEONATO NACIONAL OFICIAL
                    </span>
                    <span className="badge-hud text-cyan-400 border-cyan-500/40 bg-cyan-500/10 font-mono flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      {`${ACTIVE_SEASON_01.name} • ${seasonTime.formatted}`}
                    </span>
                  </div>

                  <h1
                    className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg"
                    style={{ textShadow: '0 4px 25px rgba(6, 182, 212, 0.4)' }}
                  >
                    PORTUGAL EM JOGO
                  </h1>

                  <p className="mt-2 text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
                    «Cada resposta muda a classificação da tua região.» Competição territorial em tempo real entre os 18 distritos e as 2 regiões autónomas.
                  </p>
                </div>

                {/* CTAs do Hero */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={() => handleStartGame('/jogar')}
                    className="button-game-gold px-8 py-4 rounded-2xl font-display text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Entrar na Competição</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePosition}
                    className="px-5 py-4 rounded-2xl bg-slate-900/90 border border-white/15 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    {copiedShare ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-300">Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4 text-cyan-400" />
                        <span>Partilhar Posição</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* NAVEGAÇÃO PREMIUM DE ABAS */}
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'nacional', label: '🏆 Nacional', desc: 'Classificação Geral' },
                { id: 'distritos', label: '📍 Distritos', desc: 'Por Território' },
                { id: 'duelos', label: '⚔️ Duelos 1v1', desc: 'Elo e Divisões' },
                { id: 'guerra', label: '⚔️ Guerra dos Distritos', desc: 'Domínio Territorial' },
                { id: 'temporada', label: '🔥 Temporada 01', desc: 'Recompensas & Regras' },
                { id: 'hall-of-fame', label: '🏛️ Hall of Fame', desc: 'Campeões Históricos' },
                { id: 'subidas', label: '🚀 Subidas da Semana', desc: 'Maiores Movimentos' },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as RankingNavTab)}
                    className={cn(
                      'px-5 py-3 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-md',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-102 ring-2 ring-cyan-400/50'
                        : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* MAPA 3D TÁTICO DE PORTUGAL 2050 (Visível nos Modos Guerra / Distritos ou Expansível) */}
          {(activeTab === 'guerra' || activeTab === 'distritos' || activeTab === 'nacional') && (
            <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
              <Portugal3DExperience
                territories={districtWarTerritories}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(dist) => setSelectedDistrict(dist)}
                onSelectPlayer={handleSelectPlayer}
                onStartGame={handleStartGame}
              />
            </div>
          )}

          {/* ABA: TEMPORADA 01 (REGRAS & PRÉMIOS) */}
          {activeTab === 'temporada' && (
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-6">
              <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-amber-400 block">
                      {`TEMPORADA ATIVA • ${ACTIVE_SEASON_01.name}`}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                      {ACTIVE_SEASON_01.subtitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Tema: «{ACTIVE_SEASON_01.theme}» • Termina em {seasonTime.formatted}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Pool de Moedas</span>
                    <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono">
                      🪙 {ACTIVE_SEASON_01.totalPrizePoolCoins.toLocaleString('pt-PT')}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-black uppercase text-slate-300 font-mono mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Quadro de Recompensas Oficiais da Temporada:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {ACTIVE_SEASON_01.rewards.map((r, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{r.rankRange}</span>
                        <span className="text-xs font-mono font-black text-amber-400">
                          +🪙 {r.coins.toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <span className="text-xs text-cyan-300 font-semibold">{r.title}</span>
                      <span className="text-[11px] text-slate-400">{r.exclusiveCosmetic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: HALL OF FAME */}
          {activeTab === 'hall-of-fame' && (
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-6">
              <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <span className="text-xs font-mono font-bold uppercase text-cyan-400 block">
                    ARQUIVO HISTÓRICO • IMORTAIS DA PÁTRIA
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                    Hall of Fame de Portugal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Registo perpétuo dos campeões nacionais e distritos vitoriosos de temporadas encerradas.
                  </p>
                </div>

                <div className="space-y-4">
                  {HISTORICAL_HALL_OF_FAME.map((hof) => (
                    <div
                      key={hof.seasonId}
                      className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                          {hof.seasonName}
                        </span>
                        <h4 className="text-lg font-black text-white font-display mt-0.5">
                          🥇 Campeão: {hof.champion.displayName} ({hof.champion.district})
                        </h4>
                        <p className="text-xs text-slate-300">
                          Distrito Vencedor: <strong>{hof.winningDistrict.name}</strong> • Pontuação Final: {hof.champion.finalXp.toLocaleString('pt-PT')} XP
                        </p>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase font-mono">
                        🏛️ Arquivado
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA: SUBIDAS DA SEMANA */}
          {activeTab === 'subidas' && (
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-6">
              <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="border-b border-white/10 pb-4 mb-6">
                  <span className="text-xs font-mono font-bold uppercase text-emerald-400 block">
                    MOVIMENTO SEMANAL • PROMETEDORES
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
                    🚀 Subidas da Semana
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Jogadores que mais posições conquistaram nos últimos 7 dias.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {nationalPlayers
                    .filter((p) => p.weeklyMovement > 0 || p.isNewWeekly)
                    .sort((a, b) => b.weeklyMovement - a.weeklyMovement)
                    .slice(0, 9)
                    .map((p, i) => (
                      <div
                        key={p.uid}
                        onClick={() => handleSelectPlayer(p)}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            src={p.photoURL}
                            activeFrame={p.equippedFrame}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300 transition-colors">
                              {p.displayName}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {p.district}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black font-mono shrink-0">
                          ↑ +{p.weeklyMovement || 1}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TABELA DE RANKING & PÓDIO (ABAS NACIONAL / DISTRITOS / DUELOS / GUERRA) */}
          {(activeTab === 'nacional' || activeTab === 'distritos' || activeTab === 'duelos' || activeTab === 'guerra') && (
            <div className="mx-auto max-w-5xl px-4 mt-10 sm:px-6 lg:px-8">
              {/* Barra de Pesquisa e Filtros */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Procurar jogador por nome ou título..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Seletor de Distrito no Modo 'distritos' */}
                  {activeTab === 'distritos' && (
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="rounded-2xl border border-cyan-500/40 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                    >
                      {ALL_DISTRICTS_LIST.map((dist) => (
                        <option key={dist} value={dist}>
                          📍 {dist}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Limite */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={rankingLimit}
                      onChange={(e) => setRankingLimit(Number(e.target.value))}
                      className="rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
                    >
                      <option value={10}>Top 10</option>
                      <option value={25}>Top 25</option>
                      <option value={50}>Top 50</option>
                      <option value={100}>Top 100</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skeleton Loading */}
              {loading && (
                <div className="space-y-6 animate-pulse">
                  <div className="grid grid-cols-3 items-end gap-3 sm:gap-6 max-w-3xl mx-auto h-52 bg-white/5 rounded-3xl" />
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-16 rounded-2xl bg-white/5" />
                    ))}
                  </div>
                </div>
              )}

              {/* PÓDIO DOS 3 PRIMEIROS CLASSIFICADOS */}
              {!loading && top3.length > 0 && (
                <div className="mb-10 max-w-3xl mx-auto">
                  <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-6">
                    {[
                      {
                        slotPlayer: top3[1] || null,
                        slotRank: 2,
                        heightClass: 'h-36 sm:h-44',
                        podiumBg: 'bg-gradient-to-b from-slate-300/20 via-slate-300/5 to-transparent border-slate-300/30 shadow-[0_0_20px_rgba(203,213,225,0.2)]',
                        badgeBg: 'bg-slate-200 text-slate-950 ring-2 ring-white/50',
                        avatarSize: 'lg' as const,
                      },
                      {
                        slotPlayer: top3[0] || null,
                        slotRank: 1,
                        heightClass: 'h-44 sm:h-52',
                        podiumBg: 'bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
                        badgeBg: 'bg-amber-400 text-slate-950 ring-2 ring-amber-300',
                        avatarSize: 'xl' as const,
                      },
                      {
                        slotPlayer: top3[2] || null,
                        slotRank: 3,
                        heightClass: 'h-32 sm:h-38',
                        podiumBg: 'bg-gradient-to-b from-amber-700/25 via-amber-700/5 to-transparent border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.2)]',
                        badgeBg: 'bg-amber-700 text-white ring-2 ring-amber-600',
                        avatarSize: 'lg' as const,
                      },
                    ].map(({ slotPlayer, slotRank, heightClass, podiumBg, badgeBg, avatarSize }) => {
                      if (!slotPlayer) return null
                      const isCurrent = Boolean(user?.uid && slotPlayer.uid === user.uid)
                      const isFirst = slotRank === 1

                      return (
                        <div
                          key={slotPlayer.uid}
                          onClick={() => handleSelectPlayer(slotPlayer)}
                          className="cursor-pointer group flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5"
                        >
                          {isFirst ? (
                            <div className="mb-1 animate-bounce">
                              <Crown className="h-8 w-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                            </div>
                          ) : (
                            <div className="h-8 mb-1" />
                          )}

                          <UserAvatar
                            src={isCurrent ? userDisplayAvatar : slotPlayer.photoURL}
                            activeFrame={slotPlayer.equippedFrame}
                            equippedFrame={slotPlayer.equippedFrame}
                            size={avatarSize}
                            rank={slotRank}
                            isCurrentUser={isCurrent}
                          />

                          <div className="mt-3 flex flex-col items-center text-center w-full px-1">
                            <span className="truncate max-w-[110px] sm:max-w-[160px] text-xs sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                              {slotPlayer.displayName}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                              📍 {slotPlayer.district}
                            </span>
                          </div>

                          <div
                            className={cn(
                              'mt-3 flex w-full flex-col items-center justify-end rounded-t-3xl border border-b-0 pb-4 pt-4 transition-all shadow-xl',
                              podiumBg,
                              heightClass
                            )}
                          >
                            <span
                              className={cn(
                                'grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-2xl font-display text-sm sm:text-base font-black shadow-md',
                                badgeBg
                              )}
                            >
                              {slotRank}º
                            </span>

                            <span className="mt-2 font-display text-xs sm:text-base font-black text-white">
                              {activeTab === 'duelos'
                                ? `${slotPlayer.rating || 1000} Rating`
                                : `${slotPlayer.xp.toLocaleString('pt-PT')} XP`}
                            </span>

                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Nível {slotPlayer.level}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* LISTA DE JOGADORES (POSIÇÃO 4 EM DIANTE) */}
              {!loading && restPlayers.length > 0 && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                  <ul className="divide-y divide-white/5 p-2 space-y-1">
                    {restPlayers.map((p) => {
                      const isCurrent = Boolean(user?.uid && p.uid === user.uid)

                      return (
                        <li
                          key={p.uid}
                          onClick={() => handleSelectPlayer(p)}
                          className={cn(
                            'cursor-pointer flex items-center gap-3.5 sm:gap-5 px-4 py-3.5 rounded-2xl transition-all border',
                            isCurrent
                              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/40'
                              : 'border-transparent bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/30'
                          )}
                        >
                          <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-slate-950 font-display text-xs sm:text-sm font-black text-slate-300 border border-white/10 font-mono">
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-white truncate">
                                {p.displayName}
                              </span>
                              {p.isFounder && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  👑 FUNDADOR
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>📍 {p.district}</span>
                              <span>•</span>
                              <span>Nível {p.level}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-xs sm:text-sm text-cyan-400 block">
                              {activeTab === 'duelos'
                                ? `${p.rating || 1000} Elo`
                                : `${p.xp.toLocaleString('pt-PT')} XP`}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              ↑ +{p.weeklyMovement || 1}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>

        {/* BARRA FIXA «A TUA POSIÇÃO» (STICKY FOOTER HUD) */}
        {user?.uid && (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-cyan-500/40 p-3 sm:p-4 backdrop-blur-2xl shadow-2xl">
            <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={userDisplayAvatar}
                  activeFrame={(profile as any)?.equippedFrame}
                  size="md"
                  isCurrentUser
                />
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    A TUA POSIÇÃO EM TEMPO REAL
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-white">
                      #{currentUserNationalPos || '--'} 🇵🇹 Nacional
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs font-bold text-amber-400">
                      #{currentUserDistrictPos || '--'} em {profile?.district || 'Portugal'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStartGame('/jogar')}
                  className="button-game-gold px-5 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-transform"
                >
                  Jogar Agora
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
