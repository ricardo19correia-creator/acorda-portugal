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
  ChevronRight,
  Sparkles,
  Target,
  AlertCircle,
  RefreshCw,
  Flame,
  Zap,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { BackgroundFx } from '@/components/background-fx'
import { UserAvatar } from '@/components/ui/UserAvatar'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import {
  ALL_DISTRICTS_LIST,
  subscribeRankings,
  type RankingPlayer,
  calculateCompetitiveDivision,
  DIVISION_COLORS,
  computeDistrictCards,
  findUserNearbyRankings,
  type DistrictCardData,
} from '@/lib/rankings'
import { ACTIVE_SEASON_01, calculateTimeRemaining } from '@/lib/seasons'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { calculateLevelProgress } from '@/lib/progression'
import { getPlayerDisplayTitle } from '@/lib/cosmetics'
import { getUserGameStats } from '@/lib/user-stats'
import { cn } from '@/lib/utils'

export type RankingFilterMode = 'nacional' | 'distrito' | 'duelos' | 'temporada'

function EvolutionBadge({ movement }: { movement?: number | null }) {
  if (typeof movement !== 'number' || movement === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 font-semibold"
        title="Posição estável no ranking"
      >
        <Minus className="h-3 w-3 text-slate-600" />
        <span>—</span>
      </span>
    )
  }

  if (movement > 0) {
    return (
      <span
        className="inline-flex items-center gap-0.5 font-mono text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
        title={`Subiu ${movement} posições`}
      >
        <TrendingUp className="h-3 w-3" />
        <span>+{movement}</span>
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 font-mono text-[11px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30"
      title={`Desceu ${Math.abs(movement)} posições`}
    >
      <TrendingDown className="h-3 w-3" />
      <span>-{Math.abs(movement)}</span>
    </span>
  )
}

export default function RankingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const userGameStats = useMemo(() => getUserGameStats(profile), [profile])

  // Separador Ativo
  const [activeTab, setActiveTab] = useState<RankingFilterMode>('nacional')

  // Visualização de Portugal: 'top' (pódio + lista) ou 'nearby' (à minha volta)
  const [nationalViewMode, setNationalViewMode] = useState<'top' | 'nearby'>('top')

  // Distrito selecionado
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    if (profile?.district && profile.district.trim() !== '') return profile.district.trim()
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_district')
      if (saved && saved.trim() !== '') return saved.trim()
    }
    return 'Vila Real'
  })

  // Limite de paginação progressiva
  const [visibleCount, setVisibleCount] = useState<number>(30)

  // Pesquisa
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Lista de jogadores da Firestore (modo ativo)
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  // Lista geral nacional (para posições globais e distritais)
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])

  // Estados de carregamento e erro
  const [loading, setLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Perfil em Modal
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [copiedShare, setCopiedShare] = useState<boolean>(false)

  // Temporada
  const [seasonTime, setSeasonTime] = useState(() => calculateTimeRemaining(ACTIVE_SEASON_01.endDate))

  // Avatar do utilizador autenticado
  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const equipped = localStorage.getItem('user_equipped_avatar')
      if (equipped) return getAvatarImage(equipped)
    }
    return DEFAULT_AVATAR.image
  })

  // Atualizar contador da temporada
  useEffect(() => {
    const timer = setInterval(() => {
      setSeasonTime(calculateTimeRemaining(ACTIVE_SEASON_01.endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sincronizar Avatar em tempo real
  useEffect(() => {
    const updateAvatar = () => {
      if (typeof window !== 'undefined') {
        const equipped = localStorage.getItem('user_equipped_avatar')
        if (equipped) {
          setUserDisplayAvatar(getAvatarImage(equipped))
        } else if (profile?.photoURL) {
          setUserDisplayAvatar(getAvatarImage(profile.photoURL))
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
  }, [profile?.photoURL])

  // Subscrição Global de Posicionamento Oficial Nacional
  // Subscrição Global de Posicionamento Oficial Nacional
  useEffect(() => {
    let isMounted = true

    // Carregamento Imediato de Alta Velocidade via API do Servidor
    fetch('/api/rankings?mode=nacional&limit=100')
      .then((res) => res.json())
      .then((apiData) => {
        if (!isMounted || !apiData?.success || !Array.isArray(apiData.players)) return
        setNationalPlayers((prev) => (prev.length === 0 ? apiData.players : prev))
      })
      .catch((apiErr) => console.warn('[RANKINGS] Aviso no carregamento inicial da API:', apiErr))

    try {
      const unsub = subscribeRankings(
        'all',
        'xp',
        (data) => {
          if (!isMounted) return
          let allList = [...data]

          // Integrar o utilizador autenticado se ainda não existir
          if (user?.uid && profile) {
            const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
            const userWins = userGameStats.wins1v1
            const userLosses = userGameStats.losses1v1
            const userLevel = calculateLevelProgress(userXp).currentLevel.level
            const userTitle = getPlayerDisplayTitle(profile, calculateLevelProgress(userXp).currentLevel.title)
            const userDistrict = (profile.district || 'Portugal').trim()
            const currentIndex = allList.findIndex((p) => p.uid === user.uid)
            if (currentIndex >= 0) {
              allList[currentIndex] = {
                ...allList[currentIndex],
                xp: userXp,
                level: userLevel,
                title: userTitle,
                equippedTitle: userTitle,
                district: userDistrict,
                displayName: profile.displayName || allList[currentIndex].displayName,
                photoURL: profile.photoURL || allList[currentIndex].photoURL,
                wins1v1: userWins,
                losses1v1: userLosses,
                gamesPlayed: userGameStats.gamesPlayed,
                accuracyRate: userGameStats.accuracy,
              }
            } else {
              const rating = Math.max(500, Math.round(1000 + (userWins * 25) - (userLosses * 15) + (userXp / 100)))
              allList.push({
                uid: user.uid,
                displayName: profile.displayName || user.displayName || 'Jogador',
                photoURL: profile.photoURL || userDisplayAvatar || DEFAULT_AVATAR.image,
                level: userLevel,
                xp: userXp,
                district: userDistrict,
                title: userTitle,
                equippedTitle: userTitle,
                equippedFrame: (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId,
                wins1v1: userWins,
                losses1v1: userLosses,
                gamesPlayed: userGameStats.gamesPlayed,
                accuracyRate: userGameStats.accuracy,
                rating,
                division: calculateCompetitiveDivision(rating),
                streak: typeof profile.streak === 'number' ? profile.streak : 0,
                weeklyMovement: (profile as any)?.posVariation ?? 0,
                isFounder: Boolean((profile as any)?.isFounder),
                virtualMoney: (profile as any)?.virtualMoney ?? profile.coins ?? profile.euros ?? 0,
              })
            }
          }

          // Ordenação Canónica por XP
          allList.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp
            return (b.accuracyRate || 0) - (a.accuracyRate || 0)
          })

          allList = allList.map((p, idx) => ({ ...p, pos: idx + 1 }))
          setNationalPlayers(allList)
          setFetchError(null)
        },
        500
      )
      return () => {
        isMounted = false
        unsub()
      }
    } catch (err: any) {
      console.error('[RANKINGS] Erro ao subscrever ranking nacional:', err)
      setFetchError('Não foi possível conectar ao ranking oficial. Tenta novamente.')
    }
  }, [user?.uid, profile, userDisplayAvatar])

  // Subscrição ao Ranking do Modo Ativo (Nacional / Distrito / Duelos)
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setFetchError(null)
    const districtFilter = activeTab === 'distrito' ? selectedDistrict : 'all'
    const queryMode = activeTab === 'duelos' ? 'duelos' : 'xp'

    // Carregamento Imediato de Alta Velocidade via API do Servidor
    fetch(`/api/rankings?mode=${queryMode}&limit=100&district=${encodeURIComponent(districtFilter)}`)
      .then((res) => res.json())
      .then((apiData) => {
        if (!isMounted || !apiData?.success || !Array.isArray(apiData.players)) return
        setPlayers((prev) => {
          if (prev.length === 0 && apiData.players.length > 0) {
            setLoading(false)
            return apiData.players
          }
          return prev
        })
      })
      .catch((apiErr) => console.warn('[RANKINGS] Aviso no carregamento de separador da API:', apiErr))

    try {
      const unsubscribe = subscribeRankings(
        districtFilter,
        queryMode,
        (data) => {
          if (!isMounted) return
          let list = [...data]

          // Integrar o utilizador autenticado
          if (user?.uid && profile) {
            const userXp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
            const userWins = userGameStats.wins1v1
            const userLosses = userGameStats.losses1v1
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
                  photoURL: profile.photoURL || userDisplayAvatar || DEFAULT_AVATAR.image,
                  level: userLevel,
                  xp: userXp,
                  district: userDistrict,
                  title: userTitle,
                  equippedTitle: userTitle,
                  equippedFrame: (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId,
                  wins1v1: userWins,
                  losses1v1: userLosses,
                  gamesPlayed: userGameStats.gamesPlayed,
                  accuracyRate: userGameStats.accuracy,
                  rating,
                  division: calculateCompetitiveDivision(rating),
                  streak: typeof profile.streak === 'number' ? profile.streak : 0,
                  weeklyMovement: (profile as any)?.posVariation ?? 0,
                  isFounder: Boolean((profile as any)?.isFounder),
                  virtualMoney: (profile as any)?.virtualMoney ?? profile.coins ?? profile.euros ?? 0,
                })
              }
            }
          }

          // Ordenação específica do modo
          list.sort((a, b) => {
            if (queryMode === 'duelos') {
              if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
              return (b.rating || 0) - (a.rating || 0)
            }
            if (b.xp !== a.xp) return b.xp - a.xp
            return (b.accuracyRate || 0) - (a.accuracyRate || 0)
          })

          // Atribuição de posições
          list = list.map((p, idx) => ({ ...p, pos: idx + 1 }))

          setPlayers(list)
          setLoading(false)
        },
        500
      )

      return () => {
        isMounted = false
        unsubscribe()
      }
    } catch (err: any) {
      console.error('[RANKINGS] Erro ao subscrever ranking filtrado:', err)
      setFetchError('Não foi possível carregar os dados deste separador.')
      setLoading(false)
    }
  }, [activeTab, selectedDistrict, user?.uid, profile, userDisplayAvatar])

  // Posição do Utilizador no Ranking Nacional
  const currentUserNationalRank = useMemo(() => {
    if (!user?.uid) return null
    const idx = nationalPlayers.findIndex((p) => p.uid === user.uid)
    return idx >= 0 ? idx + 1 : null
  }, [nationalPlayers, user?.uid])

  // Posição do Utilizador no Distrito do seu Perfil
  const currentUserDistrictRank = useMemo(() => {
    if (!user?.uid || !profile?.district) return null
    const distPlayers = nationalPlayers.filter(
      (p) => (p.district || '').toLowerCase() === profile.district.toLowerCase().trim()
    )
    const idx = distPlayers.findIndex((p) => p.uid === user.uid)
    return idx >= 0 ? idx + 1 : null
  }, [nationalPlayers, user?.uid, profile?.district])

  // Posição do Utilizador em Duelos 1v1
  const currentUserDuelRank = useMemo(() => {
    if (!user?.uid) return null
    const duelList = [...nationalPlayers].sort((a, b) => {
      if ((b.wins1v1 || 0) !== (a.wins1v1 || 0)) return (b.wins1v1 || 0) - (a.wins1v1 || 0)
      return (b.rating || 0) - (a.rating || 0)
    })
    const idx = duelList.findIndex((p) => p.uid === user.uid)
    return idx >= 0 ? idx + 1 : null
  }, [nationalPlayers, user?.uid])

  // Dados de "À Minha Volta" no Ranking Nacional
  const nationalNearby = useMemo(() => {
    return findUserNearbyRankings(nationalPlayers, user?.uid, 3, 2)
  }, [nationalPlayers, user?.uid])

  // Dados de "À Minha Volta" no Distrito Selecionado
  const districtNearby = useMemo(() => {
    if (activeTab !== 'distrito') return null
    return findUserNearbyRankings(players, user?.uid, 3, 2)
  }, [players, activeTab, user?.uid])

  // Estatísticas e Cartões de Todos os Distritos (Grelha dos 18 Distritos + Regiões)
  const districtCards = useMemo<DistrictCardData[]>(() => {
    return computeDistrictCards(nationalPlayers)
  }, [nationalPlayers])

  // Informação do Distrito Próprio do Utilizador
  const userDistrictCard = useMemo(() => {
    if (!profile?.district) return null
    return districtCards.find(
      (d) => d.name.toLowerCase() === profile.district.toLowerCase().trim()
    ) || null
  }, [districtCards, profile?.district])

  // Filtragem de Pesquisa
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return nationalPlayers.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q))
    )
  }, [nationalPlayers, searchQuery])

  // Jogadores a exibir na lista do separador ativo (respeitando pesquisa caso exista)
  const displayPlayers = useMemo(() => {
    if (searchQuery.trim()) return searchResults
    return players
  }, [players, searchResults, searchQuery])

  // Top 3 e Top 10
  const top3 = useMemo(() => displayPlayers.slice(0, 3), [displayPlayers])
  const top10 = useMemo(() => displayPlayers.slice(0, 10), [displayPlayers])
  const restPlayers = useMemo(() => displayPlayers.slice(3, visibleCount), [displayPlayers, visibleCount])

  // Abertura do Perfil Competitivo Compacto
  const handleSelectPlayer = (p: RankingPlayer) => {
    const isVip = Boolean(
      p.isFounder ||
        p.displayName?.toLowerCase().includes('riky') ||
        p.title?.toLowerCase().includes('fundador')
    )

    // Encontrar posição distrital
    const distPlayers = nationalPlayers.filter(
      (np) => (np.district || '').toLowerCase() === (p.district || '').toLowerCase()
    )
    const distIdx = distPlayers.findIndex((np) => np.uid === p.uid)
    const distPos = distIdx >= 0 ? distIdx + 1 : undefined

    setSelectedPlayer({
      id: p.uid,
      username: p.displayName,
      avatarUrl: p.photoURL || undefined,
      equippedFrame: p.equippedFrame,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos || 1,
      districtRankPosition: distPos,
      virtualMoney: p.virtualMoney ?? (p as any)?.coins ?? (p as any)?.euros ?? 0,
      isVip,
      title: p.title || (p.pos === 1 ? 'Líder Nacional' : 'Competidor'),
      rating: p.rating,
      division: p.division || (p.rating ? calculateCompetitiveDivision(p.rating) : 'Bronze'),
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsLost: p.losses1v1 || 0,
        duelsTotal: (p.wins1v1 || 0) + (p.losses1v1 || 0),
        accuracyRate: typeof p.accuracyRate === 'number' ? p.accuracyRate : 0,
        streak: p.streak,
      },
      badges: [
        { icon: '🇵🇹', name: p.district || 'Portugal' },
        { icon: '🏆', name: `Top #${p.pos || 1}` },
        { icon: '⚡', name: `Nível ${p.level || 1}` },
      ],
    })
  }

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSharePosition = () => {
    const posText = currentUserNationalRank
      ? `Estou em #${currentUserNationalRank} no Campeonato Nacional do Acorda Portugal! 🇵🇹 Vem disputar o ranking comigo:`
      : `Vem disputar o Campeonato Nacional do Acorda Portugal! 🇵🇹`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://acordaportugal.pt/rankings'

    if (navigator.share) {
      navigator.share({
        title: 'Acorda Portugal — A Arena Competitiva',
        text: posText,
        url: shareUrl,
      }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${posText} ${shareUrl}`)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 3000)
    }
  }

  // Frase motivacional contextual calculada com base estrita em dados reais
  const motivationalMessage = useMemo(() => {
    if (!user?.uid || !nationalNearby.userPlayer) return null
    const userRank = nationalNearby.userRank || 0

    if (userRank === 1) {
      return {
        highlight: '👑 ÉS O LÍDER SUPREMO DE PORTUGAL!',
        detail: 'Mantém a tua liderança conquistando XP em novas partidas.',
      }
    }

    if (nationalNearby.rivalAbove && typeof nationalNearby.xpToRivalAbove === 'number') {
      const rivalName = nationalNearby.rivalAbove.displayName
      const xpNeeded = nationalNearby.xpToRivalAbove + 10
      const targetRank = (nationalNearby.userRank || 2) - 1

      return {
        highlight: `Faltam ${xpNeeded.toLocaleString('pt-PT')} XP para ultrapassares ${rivalName}!`,
        detail: `Alcança ${xpNeeded.toLocaleString('pt-PT')} XP para subir para a posição #${targetRank} de Portugal.`,
      }
    }

    if (nationalNearby.distanceToTop10 && nationalNearby.distanceToTop10 <= 5) {
      return {
        highlight: `Estás a apenas ${nationalNearby.distanceToTop10} posições do Top 10 Nacional!`,
        detail: 'Mais algumas vitórias colocam o teu nome na elite de Portugal.',
      }
    }

    return null
  }, [user?.uid, nationalNearby])

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <BackgroundFx variant="ranking" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 pb-36">
          {/* ========================================================================= */}
          {/* 1. HERO PRINCIPAL: A ARENA COMPETITIVA DO ACORDA PORTUGAL */}
          {/* ========================================================================= */}
          <section className="mx-auto max-w-7xl px-4 pt-4 sm:pt-6 sm:px-6 lg:px-8">
            {/* Barra de Ações Rápidas */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase tracking-wider">Liga Oficial em Direto</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSharePosition}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedShare ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-mono">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Partilhar Posição</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Banner do Hero */}
            <div className="relative rounded-3xl sm:rounded-4xl border border-emerald-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950 p-5 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Luzes de energia decorativas */}
              <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      RANKING NACIONAL
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5"
                      suppressHydrationWarning
                    >
                      <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                      {ACTIVE_SEASON_01.name} • {seasonTime.formatted}
                    </span>
                  </div>

                  <h1
                    className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white"
                    style={{ textShadow: '0 4px 24px rgba(16, 185, 129, 0.35)' }}
                  >
                    ARENA COMPETITIVA
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                    A tabela oficial de elite de Portugal. Ganha XP em partidas e duelos, sobe na classificação nacional e conquista a liderança do teu distrito.
                  </p>

                  {/* Indicadores Reais da Temporada */}
                  <div className="mt-4 flex items-center gap-4 sm:gap-6 flex-wrap text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{nationalPlayers.length} Jogadores Classificados</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Classificação: XP Real</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>Fase Ativa: Temporada 01</span>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 2. CARTÃO PESSOAL: A TUA POSIÇÃO */}
                {/* ========================================================================= */}
                {user?.uid ? (
                  <div className="w-full lg:w-auto p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col gap-3 min-w-[280px]">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={userDisplayAvatar}
                          activeFrame={(profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId}
                          size="md"
                          isCurrentUser
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black font-mono border border-emerald-500/30">
                              TU
                            </span>
                            <span className="font-bold text-sm text-white truncate max-w-[130px]">
                              {profile?.displayName || user.displayName || 'Jogador'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {profile?.district ? `📍 ${profile.district}` : '📍 Portugal'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Nível</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">
                          {calculateLevelProgress(profile?.xp || 0).currentLevel.level}
                        </span>
                      </div>
                    </div>

                    {/* Posições Nacional e Distrital */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">Posição Nacional</span>
                        <span className="text-lg sm:text-xl font-black text-amber-400 font-display">
                          {currentUserNationalRank ? `#${currentUserNationalRank}` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">de Portugal</span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/90 border border-white/5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">No Teu Distrito</span>
                        <span className="text-lg sm:text-xl font-black text-emerald-400 font-display">
                          {currentUserDistrictRank ? `#${currentUserDistrictRank}` : '--'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {profile?.district || 'Geral'}
                        </span>
                      </div>
                    </div>

                    {/* XP e Progresso */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-slate-400">XP:</span>
                        <span className="font-black text-cyan-400">
                          {(profile?.xp || 0).toLocaleString('pt-PT')}
                        </span>
                      </div>
                      <EvolutionBadge movement={(profile as any)?.posVariation ?? (profile as any)?.weeklyMovement} />
                    </div>

                    {/* Destaque Motivacional Rápido */}
                    {motivationalMessage && (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 leading-snug">
                        <p className="font-bold flex items-center gap-1">
                          <Target className="w-3 h-3 shrink-0 text-emerald-400" />
                          {motivationalMessage.highlight}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full lg:w-auto p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex flex-col gap-3 text-center lg:text-left min-w-[260px]">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase text-amber-400 block">
                        Junta-te à Competição
                      </span>
                      <p className="text-xs text-slate-300 mt-1 max-w-[240px]">
                        Entra para veres a tua posição oficial e começares a subir no ranking nacional.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartGame('/entrar?redirect=/rankings')}
                      className="button-game-gold w-full px-5 py-3 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-105 transition-transform"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Entrar para Competir</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. NAVEGAÇÃO COMPETITIVA PRINCIPAL (TABS) */}
            {/* ========================================================================= */}
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('nacional')
                    setSearchQuery('')
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'nacional'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <span>🇵🇹 Portugal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('distrito')
                    setSearchQuery('')
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
                  <span>📍 Distritos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('duelos')
                    setSearchQuery('')
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'duelos'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-2 ring-amber-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>⚔️ 1v1</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('temporada')
                    setSearchQuery('')
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm',
                    activeTab === 'temporada'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50'
                      : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>🏆 Temporada</span>
                </button>
              </div>

              {/* Barra de Pesquisa Rápida Integrada */}
              {activeTab !== 'temporada' && (
                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Procurar jogador..."
                      className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* TRATAMENTO DE ERRO GLOBAL */}
          {/* ========================================================================= */}
          {fetchError && (
            <div className="mx-auto max-w-5xl px-4 mt-6 sm:px-6 lg:px-8">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{fetchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tentar novamente</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RESULTADOS DA PESQUISA DE JOGADOR */}
          {/* ========================================================================= */}
          {searchQuery.trim().length > 0 && (
            <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-black uppercase text-slate-300 font-mono flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Resultados para «{searchQuery}» ({searchResults.length})</span>
                </h2>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map((p) => (
                    <div
                      key={p.uid}
                      onClick={() => handleSelectPlayer(p)}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-display font-black text-sm text-amber-400 w-7 shrink-0 text-center font-mono">
                          #{p.pos}
                        </span>
                        <UserAvatar
                          src={p.photoURL}
                          activeFrame={p.equippedFrame}
                          equippedFrame={p.equippedFrame}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors block truncate">
                            {p.displayName}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            📍 {p.district} • Nível {p.level}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-xs text-cyan-400 block">
                          {p.xp.toLocaleString('pt-PT')} XP
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {p.wins1v1 || 0}V 1v1
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                  <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Nenhum jogador encontrado para «{searchQuery}»</p>
                  <p className="text-xs text-slate-400 mt-1">Verifica a ortografia ou procura por outro nome ou distrito.</p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* CONTEÚDO PRINCIPAL (QUANDO NÃO ESTÁ A PESQUISAR) */}
          {/* ========================================================================= */}
          {searchQuery.trim().length === 0 && (
            <>
              {/* ========================================================================= */}
              {/* ABA 1: PORTUGAL (GERAL) */}
              {/* ========================================================================= */}
              {activeTab === 'nacional' && (
                <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-8">
                  {/* SELETOR DE MODO: TOP DA LIGA vs À MINHA VOLTA */}
                  {user?.uid && (
                    <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 max-w-md mx-auto">
                      <button
                        type="button"
                        onClick={() => setNationalViewMode('top')}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5',
                          nationalViewMode === 'top'
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        )}
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Top de Portugal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNationalViewMode('nearby')}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5',
                          nationalViewMode === 'nearby'
                            ? 'bg-emerald-500 text-slate-950 shadow-md'
                            : 'text-slate-400 hover:text-white'
                        )}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>À Minha Volta</span>
                      </button>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* MODO «À MINHA VOLTA» (QUEM ESTÁ ACIMA DE MIM) */}
                  {/* ========================================================================= */}
                  {nationalViewMode === 'nearby' && user?.uid && (
                    <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/90 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl space-y-4">
                      <div className="border-b border-white/10 pb-3 flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 block">
                            🎯 O TEU CONFRONTO DIRETO
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-white font-display mt-0.5">
                            QUEM ESTÁ ACIMA DE TI
                          </h2>
                        </div>

                        {nationalNearby.xpToRivalAbove !== null && nationalNearby.rivalAbove && (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                            Faltam {(nationalNearby.xpToRivalAbove + 10).toLocaleString('pt-PT')} XP para subir
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300">
                        Estes são os jogadores mais próximos da tua posição. Ultrapassa quem está acima para subires na classificação de Portugal.
                      </p>

                      <div className="space-y-2 mt-4">
                        {nationalNearby.nearbyPlayers.map((p) => {
                          const isCurrentUser = p.uid === user.uid
                          const isAbove = nationalNearby.userRank && (p.pos || 0) < nationalNearby.userRank

                          return (
                            <div
                              key={p.uid}
                              onClick={() => handleSelectPlayer(p)}
                              className={cn(
                                'p-3.5 rounded-2xl transition-all border flex items-center justify-between gap-3 cursor-pointer',
                                isCurrentUser
                                  ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                                  : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04]'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={cn(
                                    'grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display text-xs font-black border font-mono',
                                    isCurrentUser
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                      : 'bg-slate-950 text-slate-300 border-white/10'
                                  )}
                                >
                                  #{p.pos}
                                </span>

                                <UserAvatar
                                  src={isCurrentUser ? userDisplayAvatar : p.photoURL}
                                  activeFrame={p.equippedFrame}
                                  equippedFrame={p.equippedFrame}
                                  size="sm"
                                  isCurrentUser={isCurrentUser}
                                />

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-white truncate">
                                      {p.displayName}
                                    </span>
                                    {isCurrentUser && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40">
                                        TU
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 block truncate">
                                    📍 {p.district} • Nível {p.level}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono font-black text-sm text-cyan-400 block">
                                  {p.xp.toLocaleString('pt-PT')} XP
                                </span>
                                {isAbove && nationalNearby.userPlayer && (
                                  <span className="text-[10px] text-amber-400 font-mono block">
                                    +{(p.xp - nationalNearby.userPlayer.xp).toLocaleString('pt-PT')} XP acima de ti
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleStartGame('/jogar')}
                          className="button-game-gold px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Jogar Agora para Subir</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* MODO «TOP DA LIGA»: PÓDIO TOP 3 */}
                  {/* ========================================================================= */}
                  {nationalViewMode === 'top' && (
                    <>
                      {/* Pódio dos Três Primeiros */}
                      {!loading && top3.length > 0 && (
                        <div className="pt-2 pb-6">
                          <div className="grid grid-cols-3 items-end gap-2 sm:gap-6 max-w-2xl mx-auto">
                            {[
                              {
                                slotPlayer: top3[1] || null,
                                slotRank: 2,
                                heightClass: 'h-40 sm:h-48',
                                podiumBg:
                                  'bg-gradient-to-b from-slate-400/20 via-slate-900/90 to-slate-950 border-slate-400/30 shadow-[0_0_20px_rgba(203,213,225,0.15)]',
                                badgeBg: 'bg-slate-300 text-slate-950 ring-2 ring-white/60',
                                avatarSize: 'lg' as const,
                              },
                              {
                                slotPlayer: top3[0] || null,
                                slotRank: 1,
                                heightClass: 'h-52 sm:h-64',
                                podiumBg:
                                  'bg-gradient-to-b from-amber-500/25 via-slate-900/95 to-slate-950 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40',
                                badgeBg:
                                  'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 ring-2 ring-amber-300 font-black',
                                avatarSize: 'xl' as const,
                              },
                              {
                                slotPlayer: top3[2] || null,
                                slotRank: 3,
                                heightClass: 'h-36 sm:h-42',
                                podiumBg:
                                  'bg-gradient-to-b from-amber-700/20 via-slate-900/90 to-slate-950 border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.15)]',
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
                                  {isFirst ? (
                                    <div className="mb-1 animate-bounce">
                                      <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
                                    </div>
                                  ) : (
                                    <div className="h-8 sm:h-10 mb-1" />
                                  )}

                                  <UserAvatar
                                    src={isCurrent ? userDisplayAvatar : slotPlayer.photoURL}
                                    activeFrame={slotPlayer.equippedFrame}
                                    equippedFrame={slotPlayer.equippedFrame}
                                    size={avatarSize}
                                    rank={slotRank}
                                    isCurrentUser={isCurrent}
                                  />

                                  <div className="mt-2 flex flex-col items-center text-center w-full px-1">
                                    <span className="truncate max-w-[95px] sm:max-w-[150px] text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                                      {slotPlayer.displayName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate">
                                      📍 {slotPlayer.district}
                                    </span>
                                  </div>

                                  <div
                                    className={cn(
                                      'mt-2.5 flex w-full flex-col items-center justify-end rounded-t-3xl border border-b-0 pb-3 pt-3 transition-all shadow-xl',
                                      podiumBg,
                                      heightClass
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        'grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-xl font-display text-xs sm:text-sm font-black shadow-md',
                                        badgeBg
                                      )}
                                    >
                                      {slotRank}º
                                    </span>

                                    <span className="mt-1 font-display text-xs sm:text-sm font-black text-white font-mono">
                                      {slotPlayer.xp.toLocaleString('pt-PT')} XP
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
                      {/* TOP 10 DE PORTUGAL & CLASSIFICAÇÃO COMPLETA */}
                      {/* ========================================================================= */}
                      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                          <h2 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                            <span>CLASSIFICAÇÃO NACIONAL</span>
                          </h2>
                          <span className="text-xs font-mono text-slate-400">
                            A mostrar {Math.min(visibleCount, displayPlayers.length)} de {displayPlayers.length}
                          </span>
                        </div>

                        {/* Cabeçalho da Lista Desktop */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-[11px] font-mono font-black uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                          <span className="col-span-1">#</span>
                          <span className="col-span-6">Jogador</span>
                          <span className="col-span-2 text-center">Nível</span>
                          <span className="col-span-2 text-right">Pontos XP</span>
                          <span className="col-span-1 text-center">Evolução</span>
                        </div>

                        {/* Lista de Linhas */}
                        <ul className="divide-y divide-white/5 p-2 space-y-1">
                          {restPlayers.map((p) => {
                            const isCurrent = Boolean(user?.uid && p.uid === user.uid)
                            const isInsideTop10 = (p.pos || 0) <= 10

                            return (
                              <li
                                key={p.uid}
                                onClick={() => handleSelectPlayer(p)}
                                className={cn(
                                  'cursor-pointer rounded-2xl transition-all border p-3 sm:px-4 sm:py-3',
                                  isCurrent
                                    ? 'bg-emerald-500/15 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                                    : isInsideTop10
                                    ? 'border-amber-500/20 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                                    : 'border-transparent bg-white/[0.01] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                                )}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                                    <span
                                      className={cn(
                                        'grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl font-display text-xs sm:text-sm font-black border font-mono',
                                        isCurrent
                                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                          : isInsideTop10
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
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
                                        {isInsideTop10 && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold">
                                            TOP 10
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                        <span>📍 {p.district}</span>
                                        <span className="sm:hidden">• Nível {p.level}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="hidden sm:flex items-center justify-center w-24 shrink-0">
                                    <span className="px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-bold text-slate-300">
                                      Nível {p.level}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 text-right">
                                    <div>
                                      <span className="font-mono font-black text-xs sm:text-sm text-cyan-400 block">
                                        {p.xp.toLocaleString('pt-PT')} XP
                                      </span>
                                    </div>

                                    <div className="w-12 sm:w-16 flex justify-end">
                                      <EvolutionBadge movement={p.weeklyMovement} />
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )
                          })}
                        </ul>

                        {/* Botão de Carregar Mais */}
                        {visibleCount < displayPlayers.length && (
                          <div className="p-4 border-t border-white/10 text-center">
                            <button
                              type="button"
                              onClick={() => setVisibleCount((prev) => prev + 25)}
                              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                              Carregar Mais Jogadores (+25)
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* ABA 2: DISTRITOS (COMPETIÇÃO POR DISTRITO — SEM MAPA) */}
              {/* ========================================================================= */}
              {activeTab === 'distrito' && (
                <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-8">
                  {/* ========================================================================= */}
                  {/* BLOCO «O TEU DISTRITO» (SE DEFINIDO NO PERFIL) */}
                  {/* ========================================================================= */}
                  {user?.uid && userDistrictCard && (
                    <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                            O TEU TERRITÓRIO
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5 flex items-center gap-2">
                            <span>🇵🇹 {userDistrictCard.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono">
                              #{userDistrictCard.pos} em Portugal
                            </span>
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDistrict(userDistrictCard.name)}
                            className={cn(
                              'px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer',
                              selectedDistrict.toLowerCase() === userDistrictCard.name.toLowerCase()
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            )}
                          >
                            Ver Classificação deste Distrito
                          </button>
                        </div>
                      </div>

                      {/* Métricas do Teu Distrito */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">A Tua Posição</span>
                          <span className="text-lg sm:text-xl font-black text-emerald-400 font-display">
                            {currentUserDistrictRank ? `#${currentUserDistrictRank}` : '--'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">O Teu XP</span>
                          <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                            {(profile?.xp || 0).toLocaleString('pt-PT')}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Líder Atual</span>
                          <span className="text-sm sm:text-base font-bold text-amber-300 truncate block">
                            {userDistrictCard.leaderName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {userDistrictCard.leaderXp.toLocaleString('pt-PT')} XP
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Falta para o 1.º</span>
                          {currentUserDistrictRank === 1 ? (
                            <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center justify-center gap-1 mt-1">
                              👑 És o Líder!
                            </span>
                          ) : (
                            <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                              {Math.max(0, userDistrictCard.leaderXp - (profile?.xp || 0)).toLocaleString('pt-PT')} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* GRELHA DOS 18 DISTRITOS DE PORTUGAL */}
                  {/* ========================================================================= */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                          CAMPEONATO TERRITORIAL
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                          GRELHA DE DISTRITOS DE PORTUGAL
                        </h2>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        Seleciona um distrito para ver a tabela
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {districtCards.map((dist) => {
                        const isSelected = selectedDistrict.toLowerCase() === dist.name.toLowerCase()
                        const isUserDistrict =
                          profile?.district && profile.district.toLowerCase().trim() === dist.name.toLowerCase()

                        return (
                          <div
                            key={dist.name}
                            onClick={() => setSelectedDistrict(dist.name)}
                            className={cn(
                              'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3',
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                                : 'bg-slate-900/80 border-white/10 hover:border-emerald-500/40 hover:bg-slate-800'
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-black text-amber-400">
                                  #{dist.pos > 0 ? dist.pos : '--'}
                                </span>
                                <span className="font-bold text-sm text-white">{dist.name}</span>
                              </div>

                              {isUserDistrict && (
                                <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/40">
                                  O TEU
                                </span>
                              )}
                            </div>

                            <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block">Líder:</span>
                                <span className="font-bold text-slate-200 truncate max-w-[120px] block">
                                  {dist.leaderName}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] font-mono text-slate-400 block">XP do Líder:</span>
                                <span className="font-mono font-bold text-cyan-400">
                                  {dist.leaderXp > 0 ? `${dist.leaderXp.toLocaleString('pt-PT')} XP` : '--'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-1.5">
                              <span>{dist.totalPlayers} jogadores</span>
                              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                                {dist.totalXp.toLocaleString('pt-PT')} XP Total
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* COMPETIÇÃO LOCAL: CLASSIFICAÇÃO DO DISTRITO SELECIONADO */}
                  {/* ========================================================================= */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                          CLASSIFICAÇÃO LOCAL
                        </span>
                        <h2 className="text-2xl font-black text-white font-display">
                          TOP DE {selectedDistrict.toUpperCase()}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="rounded-xl border border-emerald-500/40 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
                        >
                          {ALL_DISTRICTS_LIST.map((dist) => (
                            <option key={dist} value={dist}>
                              📍 {dist}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* À Minha Volta no Distrito Selecionado (se o utilizador for deste distrito) */}
                    {districtNearby && districtNearby.userPlayer && (
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-emerald-500/30">
                        <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block mb-2">
                          🎯 À Tua Volta em {selectedDistrict}
                        </span>
                        <div className="space-y-1.5">
                          {districtNearby.nearbyPlayers.map((p) => {
                            const isMe = p.uid === user?.uid
                            return (
                              <div
                                key={p.uid}
                                onClick={() => handleSelectPlayer(p)}
                                className={cn(
                                  'p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs cursor-pointer border',
                                  isMe
                                    ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                                    : 'bg-white/[0.01] border-transparent hover:border-white/10 text-slate-300'
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-black text-amber-400 w-6">#{p.pos}</span>
                                  <span className="truncate">{p.displayName}</span>
                                  {isMe && (
                                    <span className="text-[9px] px-1 rounded bg-emerald-500/40 text-emerald-200">
                                      TU
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-cyan-400">
                                  {p.xp.toLocaleString('pt-PT')} XP
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Lista Completa de Jogadores do Distrito */}
                    {displayPlayers.length > 0 ? (
                      <ul className="divide-y divide-white/5 space-y-1">
                        {displayPlayers.map((p) => {
                          const isCurrent = Boolean(user?.uid && p.uid === user.uid)

                          return (
                            <li
                              key={p.uid}
                              onClick={() => handleSelectPlayer(p)}
                              className={cn(
                                'cursor-pointer rounded-2xl transition-all border p-3 flex items-center justify-between gap-3',
                                isCurrent
                                  ? 'bg-emerald-500/15 border-emerald-400 shadow-md'
                                  : 'border-transparent bg-white/[0.01] hover:bg-white/[0.04]'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-display font-black text-xs font-mono text-amber-400 w-6 text-center">
                                  #{p.pos}
                                </span>
                                <UserAvatar
                                  src={isCurrent ? userDisplayAvatar : p.photoURL}
                                  activeFrame={p.equippedFrame}
                                  equippedFrame={p.equippedFrame}
                                  size="sm"
                                  isCurrentUser={isCurrent}
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-white truncate">
                                      {p.displayName}
                                    </span>
                                    {isCurrent && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold">
                                        TU
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 block">Nível {p.level}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-mono font-black text-sm text-cyan-400 block">
                                  {p.xp.toLocaleString('pt-PT')} XP
                                </span>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm font-bold text-white">Ainda não há jogadores registados em {selectedDistrict}.</p>
                        <p className="text-xs text-slate-400 mt-1">Sê o primeiro a jogar e a conquistar o topo deste território!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ABA 3: 1V1 (DUELOS COMPETITIVOS) */}
              {/* ========================================================================= */}
              {activeTab === 'duelos' && (
                <div className="mx-auto max-w-5xl px-4 mt-8 sm:px-6 lg:px-8 space-y-8">
                  {/* Resumo do Jogador em Duelos */}
                  {user?.uid && (
                    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-slate-950 p-5 sm:p-7 backdrop-blur-2xl shadow-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                            AS TUAS ESTATÍSTICAS DE DUELO
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white font-display mt-0.5">
                            ARENA 1V1
                          </h2>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href="/jogar/duelo"
                            className="button-game-gold px-5 py-2.5 rounded-xl font-display text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span>Procurar Duelo</span>
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Posição 1v1</span>
                          <span className="text-lg sm:text-xl font-black text-amber-400 font-display">
                            {currentUserDuelRank ? `#${currentUserDuelRank}` : '--'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Rating Elo</span>
                          <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                            {Math.max(
                              500,
                              Math.round(
                                1000 +
                                  (userGameStats.wins1v1 * 25) -
                                  (userGameStats.losses1v1 * 15) +
                                  ((profile?.xp || 0) / 100)
                              )
                            )}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Registo V/D</span>
                          <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                            {userGameStats.wins1v1}V - {userGameStats.losses1v1}D
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">Divisão</span>
                          <span className="text-sm sm:text-base font-black text-amber-300 font-display uppercase">
                            {calculateCompetitiveDivision(
                              Math.max(
                                500,
                                Math.round(
                                  1000 +
                                    (userGameStats.wins1v1 * 25) -
                                    (userGameStats.losses1v1 * 15) +
                                    ((profile?.xp || 0) / 100)
                                )
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tabela de Classificação 1v1 */}
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                    <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black text-white font-display flex items-center gap-2">
                        <Swords className="w-4 h-4 text-amber-400" />
                        <span>CLASSIFICAÇÃO DE DUELOS 1V1</span>
                      </h2>
                    </div>

                    <ul className="divide-y divide-white/5 p-2 space-y-1">
                      {displayPlayers.map((p) => {
                        const isCurrent = Boolean(user?.uid && p.uid === user.uid)
                        const divisionStyle = DIVISION_COLORS[p.division] || DIVISION_COLORS['Bronze']

                        return (
                          <li
                            key={p.uid}
                            className={cn(
                              'rounded-2xl transition-all border p-3 flex items-center justify-between gap-3',
                              isCurrent
                                ? 'bg-amber-500/15 border-amber-400/80 shadow-md'
                                : 'border-transparent bg-white/[0.01] hover:bg-white/[0.04]'
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-display font-black text-xs sm:text-sm font-mono text-amber-400 w-7 text-center">
                                #{p.pos}
                              </span>

                              <div onClick={() => handleSelectPlayer(p)} className="cursor-pointer shrink-0">
                                <UserAvatar
                                  src={isCurrent ? userDisplayAvatar : p.photoURL}
                                  activeFrame={p.equippedFrame}
                                  equippedFrame={p.equippedFrame}
                                  size="sm"
                                  isCurrentUser={isCurrent}
                                />
                              </div>

                              <div onClick={() => handleSelectPlayer(p)} className="cursor-pointer min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-sm text-white truncate">
                                    {p.displayName}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold">
                                      TU
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      'text-[9px] px-1.5 py-0.2 rounded font-black font-display uppercase border',
                                      divisionStyle.bg,
                                      divisionStyle.text,
                                      divisionStyle.border
                                    )}
                                  >
                                    {p.division}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block">
                                  📍 {p.district} • Elo {p.rating}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <span className="font-mono font-bold text-xs text-emerald-400 block">
                                  {p.wins1v1 || 0}V - {p.losses1v1 || 0}D
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">
                                  {p.accuracyRate}% precisão
                                </span>
                              </div>

                              {/* Ação Real de Desafio */}
                              {!isCurrent ? (
                                <Link
                                  href={`/jogar/duelo?opponent=${encodeURIComponent(p.uid)}`}
                                  className="button-game-gold px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                                >
                                  <Swords className="w-3 h-3" />
                                  <span>Desafiar</span>
                                </Link>
                              ) : (
                                <Link
                                  href="/jogar/duelo"
                                  className="button-game-primary px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                  <span>Jogar</span>
                                </Link>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ABA 4: TEMPORADA (REGRAS E PRÉMIOS REAIS) */}
              {/* ========================================================================= */}
              {activeTab === 'temporada' && (
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

                    {/* Posição Pessoal na Temporada */}
                    {user?.uid && (
                      <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            src={userDisplayAvatar}
                            activeFrame={(profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId}
                            size="md"
                            isCurrentUser
                          />
                          <div>
                            <span className="text-xs font-mono text-slate-400 uppercase block">O Teu Estado</span>
                            <span className="text-sm font-bold text-white">
                              {profile?.displayName || user.displayName || 'Jogador'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">Ranking Atual</span>
                            <span className="text-base font-black text-amber-400">
                              {currentUserNationalRank ? `#${currentUserNationalRank}` : '--'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block">XP Oficial</span>
                            <span className="text-base font-black text-cyan-400">
                              {(profile?.xp || 0).toLocaleString('pt-PT')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="text-sm font-black uppercase text-slate-300 font-mono mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Quadro de Recompensas Oficiais da Temporada:
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
                </div>
              )}
            </>
          )}
        </main>

        {/* ========================================================================= */}
        {/* BARRA FIXA INFERIOR (STICKY FOOTER HUD) */}
        {/* ========================================================================= */}
        {user?.uid ? (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-emerald-500/40 p-2.5 sm:p-4 landscape:py-1.5 landscape:px-4 safe-area-bottom safe-area-x backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
            <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={userDisplayAvatar}
                  activeFrame={(profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId}
                  size="sm"
                  isCurrentUser
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-wider">
                      A TUA POSIÇÃO
                    </span>
                    {(profile as any)?.weeklyMovement || (profile as any)?.posVariation ? (
                      <span className="text-[10px] font-mono text-emerald-300 font-bold">
                        (↑ +{(profile as any)?.weeklyMovement || (profile as any)?.posVariation} posições)
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-black text-white">
                    <span className="text-amber-400 font-display">
                      #{currentUserNationalRank ? currentUserNationalRank : '--'} Nacional
                    </span>
                    {currentUserDistrictRank && profile?.district && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 truncate">
                          #{currentUserDistrictRank} em {profile.district}
                        </span>
                      </>
                    )}
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-cyan-400 font-mono hidden sm:inline">
                      {(profile?.xp || 0).toLocaleString('pt-PT')} XP
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {nationalViewMode === 'top' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('nacional')
                      setNationalViewMode('nearby')
                      window.scrollTo({ top: 400, behavior: 'smooth' })
                    }}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>À Minha Volta</span>
                  </button>
                )}

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
        ) : (
          <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-emerald-500/40 p-3 sm:p-4 safe-area-bottom safe-area-x backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
            <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-200 font-semibold">
                  Queres subir na classificação oficial de Portugal?
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleStartGame('/entrar?redirect=/rankings')}
                className="button-game-gold px-4 sm:px-6 py-2 rounded-xl font-display text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Entrar para Competir</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Perfil Competitivo Compacto */}
      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  )
}
