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
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { PortugalMapInteractive, getDistrictColorInfo, type DistrictStatItem } from '@/components/portugal-map-interactive'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import {
  ALL_DISTRICTS_LIST,
  subscribeRankings,
  fetchRankings,
  computeDistrictStats,
  type RankingPlayer,
} from '@/lib/rankings'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'
import { calculateLevelProgress } from '@/lib/progression'
import { cn } from '@/lib/utils'

const PODIUM_ORDER = [1, 0, 2] // 2º Lugar (Esquerda), 1º Lugar (Centro), 3º Lugar (Direita)

export default function RankingsPage() {
  const router = useRouter()
  const { user, profile } = useAuth()

  const [mode, setMode] = useState<'nacional' | 'distrito' | 'duelos'>('nacional')
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => profile?.district || 'Lisboa')
  const [rankingLimit, setRankingLimit] = useState<number>(50)
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>(() =>
    getAvatarImage(typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null)
  )

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
    const districtFilter = mode === 'distrito' ? selectedDistrict : 'all'
    const queryMode = mode === 'duelos' ? 'duelos' : 'xp'

    const unsubscribe = subscribeRankings(
      districtFilter,
      queryMode,
      (data) => {
        let list = [...data]

        // Integrar utilizador autenticado se aplicável
        if (user?.uid && profile) {
          const userXp = profile.xp ?? 0
          const userWins = profile.wins ?? 0
          const userLevel = profile.level ?? calculateLevelProgress(userXp).currentLevel.level
          const userTitle = profile.equippedTitle || (profile as any)?.title || 'Membro Fundador'
          const userDistrict = profile.district || 'Portugal'

          const matchesDistrict =
            mode !== 'distrito' || userDistrict.toLowerCase() === selectedDistrict.toLowerCase()

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
                isFounder: Boolean((profile as any)?.isFounder),
              })
            }
          }
        }

        // Reordenar
        list.sort((a, b) => {
          const valA = queryMode === 'duelos' ? (a.wins1v1 || 0) : a.xp
          const valB = queryMode === 'duelos' ? (b.wins1v1 || 0) : b.xp
          return valB - valA
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
  }, [mode, selectedDistrict, rankingLimit, user?.uid, profile, userDisplayAvatar])

  // Subscrição Nacional Global para alimentar o Radar Tático e Rankings Territoriais de todos os 20 Distritos
  const [nationalPlayers, setNationalPlayers] = useState<RankingPlayer[]>([])

  useEffect(() => {
    const unsub = subscribeRankings(
      'all',
      'xp',
      (data) => {
        let allList = [...data]
        if (user?.uid && profile) {
          const userXp = profile.xp ?? 0
          const userWins = profile.wins ?? 0
          const userLevel = profile.level ?? calculateLevelProgress(userXp).currentLevel.level
          const userTitle = profile.equippedTitle || (profile as any)?.title || 'Membro Fundador'
          const userDistrict = profile.district || 'Portugal'
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
              isFounder: Boolean((profile as any)?.isFounder),
            })
          }
        }
        setNationalPlayers(allList)
      },
      500
    )
    return () => unsub()
  }, [user?.uid, profile, userDisplayAvatar])

  // Total Nacional de XP Acumulado
  const totalNationalXP = useMemo(() => {
    return nationalPlayers.reduce((sum, p) => sum + (p.xp || 0), 0)
  }, [nationalPlayers])

  // Calcular Estatísticas Distritais para o Mapa Interativo e Classificação Territorial (Soma de Humanos + Bots)
  const districtStatsMap = useMemo(() => {
    const rawMap = computeDistrictStats(nationalPlayers)
    const rankedMap = new Map<string, DistrictStatItem>()

    rawMap.forEach((stat, districtName) => {
      rankedMap.set(districtName, {
        name: districtName,
        pos: stat.pos,
        players: stat.players,
        xp: stat.xp,
      })
    })

    return rankedMap
  }, [nationalPlayers])

  const selectedDistrictStats = useMemo(() => {
    return (
      districtStatsMap.get(selectedDistrict) || {
        name: selectedDistrict,
        pos: 0,
        players: 0,
        xp: 0,
      }
    )
  }, [districtStatsMap, selectedDistrict])

  const firstPlayer = useMemo(() => players[0] || null, [players])
  const secondPlayer = useMemo(() => players[1] || null, [players])
  const thirdPlayer = useMemo(() => players[2] || null, [players])
  const top3 = useMemo(() => players.slice(0, 3), [players])
  const restPlayers = useMemo(() => players.slice(3, rankingLimit), [players, rankingLimit])

  const currentUserRank = useMemo(() => {
    if (!user?.uid) return null
    return players.find((p) => p.uid === user.uid) || null
  }, [players, user?.uid])

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }

  const handleSelectPlayer = (p: RankingPlayer) => {
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
      virtualMoney: p.xp * 2,
      isVip,
      title: p.title || (p.pos === 1 ? 'Líder Nacional' : 'Competidor'),
      stats: {
        duelsWon: p.wins1v1 || 0,
        duelsTotal: p.gamesPlayed || (p.wins1v1 || 0) + 5,
        accuracyRate: p.accuracyRate || (p.xp > 0 ? 85 : 0),
      },
      badges: [
        { icon: '🇵🇹', name: p.district || 'Portugal' },
        { icon: '🏆', name: `Top #${p.pos || 1}` },
        { icon: '⚡', name: `Nível ${p.level || 1}` },
      ],
    })
  }

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col">
      <BackgroundFx variant="ranking" />

      <div className="relative z-20 flex-1 flex flex-col">
        <SiteHeader />

        <main className="flex-1 bg-transparent pb-16">
          {/* Header Banner */}
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
                <div className="mt-3 flex items-center gap-2">
                  <span className="badge-hud text-gold border-gold/40 bg-gold/15 shadow-md shadow-gold/20 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    Tabela Oficial de Portugal
                  </span>
                </div>
                <h1
                  className="mt-2 font-display text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tight text-foreground text-glow-gold"
                  style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)' }}
                >
                  Rankings &amp; Competição
                </h1>
                <p
                  className="mt-1.5 text-sm sm:text-base text-slate-300 font-medium max-w-2xl"
                  style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)' }}
                >
                  Classificação em tempo real dos melhores jogadores e disputa territorial entre os 18
                  distritos e 2 regiões autónomas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleStartGame('/jogar')}
                className="button-game-gold inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 font-display text-sm font-black uppercase tracking-wider cursor-pointer shadow-xl self-start sm:self-auto hover:scale-105 transition-transform"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Jogar para Subir</span>
              </button>
            </div>

            {/* Navegação de Abas Principais de Ranking */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {/* Aba 1: Top Nacional */}
              <button
                type="button"
                onClick={() => setMode('nacional')}
                className={cn(
                  'cursor-pointer flex items-center gap-2 rounded-2xl px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md',
                  mode === 'nacional'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 ring-2 ring-emerald-400/50'
                    : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Globe className="h-4 w-4" />
                <span>Top Nacional</span>
              </button>

              {/* Aba 2: Por Distrito / Ilhas */}
              <button
                type="button"
                onClick={() => setMode('distrito')}
                className={cn(
                  'cursor-pointer flex items-center gap-2 rounded-2xl px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md',
                  mode === 'distrito'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105 ring-2 ring-amber-400/50'
                    : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <MapPin className="h-4 w-4" />
                <span>Por Distrito / Ilhas</span>
              </button>

              {/* Aba 3: Duelos 1v1 */}
              <button
                type="button"
                onClick={() => setMode('duelos')}
                className={cn(
                  'cursor-pointer flex items-center gap-2 rounded-2xl px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-md',
                  mode === 'duelos'
                    ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105 ring-2 ring-purple-400/50'
                    : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Swords className="h-4 w-4" />
                <span>Duelos 1v1</span>
              </button>
            </div>
          </div>

          {/* Secção do Mapa Interativo Territorial (Ativada no Modo 'distrito' ou Expansível) */}
          {mode === 'distrito' && (
            <div className="mx-auto max-w-7xl px-4 mt-8 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-5 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Glow decorativo de fundo */}
                <div
                  className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: getDistrictColorInfo(selectedDistrict).hex }}
                />

                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  {/* Lado Esquerdo: Seletor Dropdown e Painel Tático do Distrito */}
                  <div className="w-full lg:w-1/2 space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full animate-ping"
                          style={{ backgroundColor: getDistrictColorInfo(selectedDistrict).hex }}
                        />
                        <span
                          className="text-[10px] font-black uppercase tracking-widest font-mono"
                          style={{ color: getDistrictColorInfo(selectedDistrict).hex }}
                        >
                          SETOR TÁTICO // {getDistrictColorInfo(selectedDistrict).tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
                          {selectedDistrict}
                        </h2>
                        {selectedDistrictStats.xp > 0 && selectedDistrictStats.pos > 0 ? (
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono border"
                            style={{
                              backgroundColor: `${getDistrictColorInfo(selectedDistrict).hex}20`,
                              color: getDistrictColorInfo(selectedDistrict).hex,
                              borderColor: `${getDistrictColorInfo(selectedDistrict).hex}50`,
                            }}
                          >
                            #{selectedDistrictStats.pos} no País
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold uppercase font-mono border border-slate-700 bg-slate-800/80 text-slate-400">
                            Território Não Conquistado
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Clica no mapa de radar tático holográfico ou seleciona abaixo para inspecionar os dados territoriais.
                      </p>
                    </div>

                    {/* Dropdown Sincronizado */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Região Selecionada:
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full rounded-2xl border border-cyan-500/40 bg-slate-900/90 px-4 py-3 text-sm font-bold text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                      >
                        {ALL_DISTRICTS_LIST.map((dist) => {
                          const stat = districtStatsMap.get(dist)
                          const isConquered = stat && stat.xp > 0 && stat.pos > 0
                          return (
                            <option key={dist} value={dist}>
                              {dist} {isConquered ? `(#${stat.pos} • ${stat.xp.toLocaleString('pt-PT')} XP)` : '(Sem Pontos • 0 XP)'}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* Cartão do Rei / Campeão do Distrito */}
                    {top3[0] ? (
                      <div
                        onClick={() => handleSelectPlayer(top3[0])}
                        className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-400 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <Crown className="h-4 w-4 text-amber-400 absolute -top-2.5 left-1/2 -translate-x-1/2 fill-amber-400 animate-bounce" />
                            <UserAvatar
                              src={top3[0].photoURL}
                              activeFrame={top3[0].equippedFrame}
                              equippedFrame={top3[0].equippedFrame}
                              size="md"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block font-mono">
                              👑 REI DE {selectedDistrict.toUpperCase()}
                            </span>
                            <span className="font-bold text-sm text-white truncate block group-hover:text-amber-300 transition-colors">
                              {top3[0].displayName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Nível {top3[0].level} • {top3[0].title || 'Campeão Distrital'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-sm sm:text-base font-black text-amber-400 font-mono block">
                            {top3[0].xp.toLocaleString('pt-PT')} XP
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Líder</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Trophy className="h-5 w-5 text-amber-400/60 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-white block">Trono de {selectedDistrict} Vago</span>
                            <span className="text-[11px] text-slate-400">Joga uma partida para liderar este distrito!</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleStartGame(`/jogar?distrito=${encodeURIComponent(selectedDistrict)}`)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-black uppercase tracking-wide border border-amber-500/40 cursor-pointer transition-colors"
                        >
                          Conquistar
                        </button>
                      </div>
                    )}

                    {/* Domínio Territorial & Métricas */}
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className="text-slate-400">Domínio Territorial Nacional</span>
                          <span
                            className="font-bold font-mono"
                            style={{
                              color: selectedDistrictStats.xp > 0 ? getDistrictColorInfo(selectedDistrict).hex : '#94a3b8',
                            }}
                          >
                            {totalNationalXP > 0 && selectedDistrictStats.xp > 0
                              ? Math.min(100, Math.max(1, Math.round((selectedDistrictStats.xp / totalNationalXP) * 100)))
                              : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              backgroundColor: selectedDistrictStats.xp > 0 ? getDistrictColorInfo(selectedDistrict).hex : '#334155',
                              width: `${
                                totalNationalXP > 0 && selectedDistrictStats.xp > 0
                                  ? Math.min(100, Math.max(1, Math.round((selectedDistrictStats.xp / totalNationalXP) * 100)))
                                  : 0
                              }%`,
                              boxShadow: selectedDistrictStats.xp > 0 ? `0 0 10px ${getDistrictColorInfo(selectedDistrict).hex}` : 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Grid de Estatísticas */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center">
                          <span className="text-[11px] text-slate-400 font-bold block mb-0.5">Jogadores Ativos</span>
                          <span className="text-xl font-black text-emerald-400 font-display">
                            {selectedDistrictStats.players}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-center">
                          <span className="text-[11px] text-slate-400 font-bold block mb-0.5">XP da Região</span>
                          <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                            {selectedDistrictStats.xp.toLocaleString('pt-PT')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Mapa Radar Tático SVG */}
                  <div className="w-full lg:w-1/2 flex items-center justify-center p-1">
                    <div className="w-full max-w-[460px]">
                      <PortugalMapInteractive
                        selected={selectedDistrict}
                        onSelect={(distName) => setSelectedDistrict(distName)}
                        districtStats={districtStatsMap}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo Principal do Ranking: Pódio e Tabela */}
          <div className="mx-auto max-w-5xl px-4 mt-10 sm:px-6 lg:px-8">
            {/* Controlo de Limite / Filtro */}
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">A exibir:</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  {mode === 'nacional'
                    ? 'Top Geral Nacional'
                    : mode === 'distrito'
                    ? `Top ${selectedDistrict}`
                    : 'Classificação de Duelos 1v1'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={rankingLimit}
                  onChange={(e) => setRankingLimit(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                </select>
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

            {/* Estado Vazio */}
            {!loading && players.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-10 text-center backdrop-blur-md">
                <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-black text-white">Sem jogadores registados neste filtro</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Sê o primeiro jogador a concluir uma partida e a liderar a classificação de {selectedDistrict}!
                </p>
                <button
                  type="button"
                  onClick={() => handleStartGame('/jogar')}
                  className="mt-5 button-game-gold inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Jogar Agora</span>
                </button>
              </div>
            )}

            {/* PÓDIO DOS 3 PRIMEIROS CLASSIFICADOS (Condicional Estrita Sem Mocks/Bots) */}
            {!loading && (firstPlayer || secondPlayer || thirdPlayer) && (
              <div className="mb-10 max-w-3xl mx-auto">
                <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-6">
                  {[
                    {
                      slotPlayer: secondPlayer,
                      slotRank: 2,
                      heightClass: 'h-36 sm:h-44',
                      podiumBg: 'bg-gradient-to-b from-slate-300/20 via-slate-300/5 to-transparent border-slate-300/30 shadow-[0_0_20px_rgba(203,213,225,0.2)]',
                      badgeBg: 'bg-slate-200 text-slate-950 ring-2 ring-white/50',
                      avatarSize: 'lg' as const,
                    },
                    {
                      slotPlayer: firstPlayer,
                      slotRank: 1,
                      heightClass: 'h-44 sm:h-52',
                      podiumBg: 'bg-gradient-to-b from-amber-500/25 via-amber-500/10 to-transparent border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
                      badgeBg: 'bg-amber-400 text-slate-950 ring-2 ring-amber-300',
                      avatarSize: 'xl' as const,
                    },
                    {
                      slotPlayer: thirdPlayer,
                      slotRank: 3,
                      heightClass: 'h-32 sm:h-38',
                      podiumBg: 'bg-gradient-to-b from-amber-700/25 via-amber-700/5 to-transparent border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.2)]',
                      badgeBg: 'bg-amber-700 text-white ring-2 ring-amber-600',
                      avatarSize: 'lg' as const,
                    },
                  ].map(({ slotPlayer, slotRank, heightClass, podiumBg, badgeBg, avatarSize }) => {
                    if (!slotPlayer) {
                      return (
                        <div
                          key={`empty-podium-slot-${slotRank}`}
                          className="flex flex-col items-center opacity-40 hover:opacity-70 transition-opacity"
                        >
                          <div className="h-8 mb-1" />
                          <div className="h-14 w-14 rounded-2xl border border-dashed border-white/20 grid place-items-center bg-white/5 text-slate-500 text-xs font-mono">
                            Vago
                          </div>
                          <div className="mt-3 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Posição {slotRank}º
                            </span>
                            <span className="text-[9px] text-slate-600">Disponível</span>
                          </div>
                          <div
                            className={cn(
                              'mt-3 flex w-full flex-col items-center justify-end rounded-t-3xl border border-dashed border-white/10 pb-3 pt-3 bg-white/[0.02]',
                              heightClass
                            )}
                          >
                            <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-900 text-slate-500 text-xs font-black border border-white/10">
                              {slotRank}º
                            </span>
                            <span className="mt-1 text-[10px] text-slate-500 font-mono">-- XP</span>
                          </div>
                        </div>
                      )
                    }

                    const isCurrent = Boolean(user?.uid && slotPlayer.uid === user.uid)
                    const isFirst = slotRank === 1

                    return (
                      <div
                        key={slotPlayer.uid}
                        onClick={() => handleSelectPlayer(slotPlayer)}
                        className="cursor-pointer group flex flex-col items-center transition-all duration-300 hover:-translate-y-1.5"
                      >
                        {/* Coroa no 1º Lugar */}
                        {isFirst ? (
                          <div className="mb-1 animate-bounce">
                            <Crown className="h-8 w-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                          </div>
                        ) : (
                          <div className="h-8 mb-1" />
                        )}

                        {/* Avatar com Moldura Viva */}
                        <div className="relative">
                          <UserAvatar
                            src={isCurrent ? userDisplayAvatar : slotPlayer.photoURL}
                            activeFrame={slotPlayer.equippedFrame}
                            equippedFrame={slotPlayer.equippedFrame}
                            size={avatarSize}
                            rank={slotRank}
                            isCurrentUser={isCurrent}
                          />
                        </div>

                        {/* Nome e Título */}
                        <div className="mt-3 flex flex-col items-center text-center w-full px-1">
                          <span className="truncate max-w-[110px] sm:max-w-[160px] text-xs sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                            {slotPlayer.displayName}
                          </span>
                          <span className="inline-block mt-0.5 max-w-[100px] sm:max-w-[140px] truncate px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] sm:text-[10px] font-bold text-amber-300 tracking-wide">
                            {slotPlayer.title || 'Jogador'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {slotPlayer.district}
                          </span>
                        </div>

                        {/* Pedestal Holográfico */}
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
                            {mode === 'duelos'
                              ? `${slotPlayer.wins1v1 || 0} Vitórias`
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

            {/* TABELA DE LIDERANÇA (POSIÇÕES 4 EM DIANTE) */}
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
                            : 'border-transparent bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30'
                        )}
                      >
                        {/* Posição */}
                        <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-slate-950 font-display text-xs sm:text-sm font-black text-slate-300 border border-white/10">
                          #{p.pos}
                        </span>

                        {/* Avatar */}
                        <div className="shrink-0">
                          <UserAvatar
                            src={isCurrent ? userDisplayAvatar : p.photoURL}
                            activeFrame={p.equippedFrame}
                            equippedFrame={p.equippedFrame}
                            size="sm"
                            isCurrentUser={isCurrent}
                          />
                        </div>

                        {/* Informações do Jogador */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate font-display font-bold text-white text-xs sm:text-sm">
                              {p.displayName}
                            </span>

                            {p.title && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] sm:text-[10px] font-bold text-amber-300 tracking-wide truncate">
                                {p.title}
                              </span>
                            )}

                            {isCurrent && (
                              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 leading-none">
                                TU
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                            <MapPin className="h-3 w-3 shrink-0 text-emerald-400" />
                            <span className="truncate">{p.district}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-300">Nível {p.level}</span>
                          </p>
                        </div>

                        {/* Pontuação */}
                        <div className="text-right shrink-0">
                          <span className="font-display text-sm sm:text-base font-black text-emerald-400 block font-mono">
                            {mode === 'duelos'
                              ? `${p.wins1v1 || 0} Vitórias`
                              : `${p.xp.toLocaleString('pt-PT')} XP`}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {mode === 'duelos' ? '1v1 Duelo' : 'Total XP'}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* CARTÃO FIXO DO UTILIZADOR ATUAL (CASO NÃO ESTEJA NO PÓDIO) */}
            {currentUserRank && currentUserRank.pos && currentUserRank.pos > 3 && (
              <div
                onClick={() => handleSelectPlayer(currentUserRank)}
                className="mt-6 cursor-pointer rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl hover:border-emerald-400 transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-2">
                  A TUA CLASSIFICAÇÃO ATUAL NO RANKING:
                </span>
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-slate-950 font-display text-base font-black shadow-lg">
                    #{currentUserRank.pos}
                  </span>

                  <UserAvatar
                    src={userDisplayAvatar}
                    activeFrame={currentUserRank.equippedFrame}
                    size="md"
                    isCurrentUser={true}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-bold text-white text-sm">
                        {currentUserRank.displayName}
                      </span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300 border border-emerald-500/30">
                        TU
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{currentUserRank.district}</span>
                      <span>•</span>
                      <span>Nível {currentUserRank.level}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-base sm:text-lg font-black text-emerald-400 block font-mono">
                      {mode === 'duelos'
                        ? `${currentUserRank.wins1v1 || 0} Vitórias`
                        : `${currentUserRank.xp.toLocaleString('pt-PT')} XP`}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">A Tua Pontuação</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <SiteFooter />
      </div>

      {/* Modal de Perfil Detalhado */}
      <PlayerProfileModal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        player={selectedPlayer}
      />
    </div>
  )
}
