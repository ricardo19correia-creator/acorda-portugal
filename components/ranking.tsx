'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, MapPin, Trophy, Sparkles, Play, ChevronRight, Swords, Globe } from 'lucide-react'
import {
  collection,
  limit,
  onSnapshot,
  query,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { SectionHeading } from '@/components/section-heading'
import { useAuth } from '@/components/auth-provider'
import { calculateLevelProgress } from '@/lib/progression'
import type { EquippedCosmetics } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { PlayerAvatar } from '@/components/player-avatar'
import { getAvatarImage, DEFAULT_AVATAR } from '@/lib/avatars'

export type RankedPlayer = {
  uid: string
  name: string
  photoURL?: string | null
  level: number
  xp: number
  district: string
  pos: number
  equippedTitle?: string
  equipped?: EquippedCosmetics
  duelWins?: number
  duelsTotal?: number
  accuracyRate?: number
}

const PODIUM_ORDER = [1, 0, 2] // 2º (left), 1º (center), 3º (right)

export function Ranking() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [ranking, setRanking] = useState<RankedPlayer[]>([])

  const handleStartGame = (gameRoute: string) => {
    if (!user && !auth?.currentUser) {
      router.push(`/entrar?redirect=${encodeURIComponent(gameRoute)}`)
      return
    }
    router.push(gameRoute)
  }
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState<'nacional' | 'distrito' | 'duelos'>('nacional')
  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>(() => getAvatarImage(typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null))

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

  // Subscrição em Tempo Real aos Utilizadores Reais no Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const processSnapshot = (snapshot: any) => {
      const playersMap = new Map<string, RankedPlayer>()

      // 1. Processar estritamente perfis reais da coleção publicProfiles
      if (snapshot && !snapshot.empty) {
        snapshot.forEach((docSnap: any) => {
          const data = docSnap.data()
          if (!data) return

          const rawName = (data.displayName || data.name || data.username || data.email?.split('@')[0] || '').trim()
          const name = rawName || 'Jogador'
          const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? data.xp : 0
          const level = typeof data.level === 'number' ? data.level : calculateLevelProgress(xp).currentLevel.level
          const district = data.district || 'Portugal'
          const photoURL = getAvatarImage(data.photoURL || data.avatar || data.avatarId || null)
          const equipped = data.equipped || {}
          const equippedTitle = data.equippedTitle || data.title || data.equipped?.title || ''

          playersMap.set(docSnap.id, {
            uid: docSnap.id,
            name,
            photoURL,
            level,
            xp,
            district,
            pos: 0,
            equippedTitle,
            equipped,
            duelWins: typeof data.wins === 'number' ? data.wins : typeof data.duelWins === 'number' ? data.duelWins : 0,
            duelsTotal: typeof data.gamesPlayed === 'number' ? data.gamesPlayed : 0,
            accuracyRate: typeof data.accuracy === 'number' ? data.accuracy : typeof data.accuracyRate === 'number' ? data.accuracyRate : 0,
          })
        })
      }

      // 2. Garantir que o utilizador autenticado atual está presente na lista se tiver perfil
      if (user?.uid && profile) {
        const userXp = profile.xp ?? 0
        const userLevel = profile.level ?? calculateLevelProgress(userXp).currentLevel.level
        const userTitle = profile.equippedTitle || (profile as any)?.title || profile.equipped?.title || (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') : '') || 'Membro Fundador'
        
        playersMap.set(user.uid, {
          uid: user.uid,
          name: profile.displayName || user.displayName || 'Jogador',
          photoURL: profile.photoURL || user.photoURL || userDisplayAvatar,
          level: userLevel,
          xp: userXp,
          district: profile.district || 'Portugal',
          pos: 0,
          equippedTitle: userTitle,
          equipped: profile.equipped,
          duelWins: profile.wins || 0,
          duelsTotal: profile.gamesPlayed || 0,
          accuracyRate: profile.totalQuestions && profile.totalQuestions > 0 ? Math.round((profile.correctAnswers / profile.totalQuestions) * 100) : 0,
        })
      }

      // 3. Ordenar decrescente por XP real
      const sorted = Array.from(playersMap.values()).sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp
        return b.level - a.level
      })

      // 4. Atribuir posições oficiais reais (1º, 2º, 3º...)
      sorted.forEach((p, idx) => {
        p.pos = idx + 1
      })

      setRanking(sorted)
      setLoading(false)
    }

    try {
      const rankingQuery = query(collection(db, 'publicProfiles'), limit(100))
      unsubscribe = onSnapshot(
        rankingQuery,
        (snapshot) => {
          processSnapshot(snapshot)
        },
        (err) => {
          console.warn('[RANKING] Snapshot publicProfiles com aviso:', err)
          processSnapshot(null)
        },
      )
    } catch (e) {
      console.warn('[RANKING] Erro ao subscrever Firestore:', e)
      processSnapshot(null)
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user?.uid, profile, userDisplayAvatar])

  // Filtragem dinâmica por Modo / Distrito
  const filteredRanking = useMemo(() => {
    if (filterMode === 'distrito' && profile?.district) {
      const userDist = profile.district.toLowerCase()
      const distMatches = ranking.filter((p) => (p.district || '').toLowerCase().includes(userDist) || userDist.includes((p.district || '').toLowerCase()))
      return distMatches
    }
    if (filterMode === 'duelos') {
      const duelList = [...ranking].sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0))
      duelList.forEach((p, i) => {
        p.pos = i + 1
      })
      return duelList
    }
    return ranking
  }, [ranking, filterMode, profile?.district])

  const top3 = useMemo(() => filteredRanking.slice(0, 3), [filteredRanking])
  const rest = useMemo(() => filteredRanking.slice(3, 10), [filteredRanking])

  const currentUserEntry = useMemo(() => {
    if (!user?.uid) return null
    const found = ranking.find((p) => p.uid === user.uid)
    if (found) return found

    if (profile) {
      const userXp = profile.xp ?? 0
      const rankPos = ranking.filter((p) => p.xp > userXp).length + 1
      return {
        uid: user.uid,
        name: profile.displayName || user.displayName || 'Jogador',
        photoURL: profile.photoURL || user.photoURL || userDisplayAvatar,
        level: profile.level ?? 1,
        xp: userXp,
        district: profile.district || 'Portugal',
        pos: rankPos,
        equippedTitle: profile.equippedTitle || '',
      } as RankedPlayer
    }
    return null
  }, [ranking, user, profile, userDisplayAvatar])

  const isCurrentUserInTop10 = useMemo(() => {
    if (!user?.uid) return false
    return filteredRanking.slice(0, 10).some((p) => p.uid === user.uid)
  }, [filteredRanking, user])

  const handleSelectPlayer = (p: RankedPlayer) => {
    const isVip = Boolean(
      (p as any)?.is_founder ||
      (p as any)?.isFounder ||
      p.name?.toLowerCase().includes('riky') ||
      p.equippedTitle?.toLowerCase().includes('fundador')
    )

    const rawTitle = p.equippedTitle || p.equipped?.title || (p.pos === 1 ? 'Líder Nacional' : 'Competidor')

    setSelectedPlayer({
      id: p.uid,
      username: p.name,
      avatarUrl: p.photoURL || undefined,
      level: p.level || 1,
      xp: p.xp || 0,
      district: p.district || 'Portugal',
      rankPosition: p.pos,
      virtualMoney: p.xp * 2,
      isVip,
      title: rawTitle,
      stats: {
        duelsWon: p.duelWins || 0,
        duelsTotal: p.duelsTotal || 0,
        accuracyRate: p.accuracyRate || (p.xp > 0 ? 85 : 0),
      },
      badges: [
        { icon: '🇵🇹', name: p.district || 'Portugal' },
        { icon: '🏆', name: `Top #${p.pos}` },
        { icon: '⚡', name: `Nível ${p.level}` },
      ],
    })
  }

  return (
    <section id="ranking" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        eyebrow="Tabela Oficial de Portugal"
        title="Rankings Nacionais"
        description="Os melhores jogadores do país em tempo real. Sobe de nível, conquista pontos nos quizzes e representa o teu distrito."
      />

      {/* Filtros de Classificação */}
      <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilterMode('nacional')}
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm',
            filterMode === 'nacional'
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
              : 'bg-card/70 border border-white/10 text-muted-foreground hover:bg-card hover:text-white'
          )}
        >
          <Globe className="h-4 w-4" />
          <span>Top Nacional</span>
        </button>

        {profile?.district && (
          <button
            type="button"
            onClick={() => setFilterMode('distrito')}
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm',
              filterMode === 'distrito'
                ? 'bg-gold text-gold-foreground shadow-lg shadow-gold/25 scale-105'
                : 'bg-card/70 border border-white/10 text-muted-foreground hover:bg-card hover:text-white'
            )}
          >
            <MapPin className="h-4 w-4" />
            <span>{profile.district}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilterMode('duelos')}
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm',
            filterMode === 'duelos'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105'
              : 'bg-card/70 border border-white/10 text-muted-foreground hover:bg-card hover:text-white'
          )}
        >
          <Swords className="h-4 w-4" />
          <span>Duelos 1v1</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-12 space-y-6">
          <div className="grid grid-cols-3 items-end gap-3 sm:gap-6 max-w-3xl mx-auto">
            <div className="h-32 sm:h-40 rounded-t-3xl bg-white/[0.03] animate-pulse border border-white/5" />
            <div className="h-44 sm:h-52 rounded-t-3xl bg-white/[0.05] animate-pulse border border-primary/20" />
            <div className="h-28 sm:h-36 rounded-t-3xl bg-white/[0.03] animate-pulse border border-white/5" />
          </div>
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-card/40 p-6 space-y-4">
            <div className="h-12 w-full rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="h-12 w-full rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="h-12 w-full rounded-2xl bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      )}

      {/* Empty state when no real players are found */}
      {!loading && filteredRanking.length === 0 && (
        <div className="mt-12 mx-auto max-w-md rounded-3xl border border-white/10 bg-card/60 p-8 text-center backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
            <Trophy className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">A temporada começou!</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sê o primeiro jogador a concluir uma partida e a liderar a classificação oficial de Portugal.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleStartGame('/jogar')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-[0_0_20px_-3px_var(--primary)] cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              Jogar primeira partida
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Content with Real Authenticated Users */}
      {!loading && filteredRanking.length > 0 && (
        <div className="mt-10">
          {/* TOP 3 Podium */}
          {top3.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-6">
                {PODIUM_ORDER.map((posIndex) => {
                  const player = top3[posIndex]
                  if (!player) return <div key={`empty-${posIndex}`} className="h-28" />
                  const isCurrent = Boolean(user?.uid && player.uid === user.uid)
                  return (
                    <PodiumCard
                      key={player.uid}
                      player={player}
                      isCurrentUser={isCurrent}
                      userDisplayAvatar={userDisplayAvatar}
                      onSelect={() => handleSelectPlayer(player)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Leaderboard list (ranks 4 to 10) */}
          <div
            className="mx-auto mt-8 max-w-3xl overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(18, 24, 27, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            {rest.length > 0 && (
              <ul className="divide-y divide-white/5 p-2 space-y-1">
                {rest.map((row) => {
                  const isCurrentUser = Boolean(user?.uid && row.uid === user.uid)
                  return (
                    <li
                      key={row.uid}
                      onClick={() => handleSelectPlayer(row)}
                      style={{
                        background: isCurrentUser ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        borderLeft: isCurrentUser ? '4px solid #00ff88' : '4px solid transparent',
                      }}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all sm:gap-4 sm:px-6 cursor-pointer border border-transparent',
                        isCurrentUser
                          ? 'shadow-[0_0_15px_rgba(0,255,136,0.15)] border-emerald-500/30'
                          : 'hover:!bg-[rgba(0,255,136,0.08)] hover:!border-[rgba(0,255,136,0.3)]',
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 font-display text-sm font-bold text-white">
                        {row.pos}
                      </span>

                      <PlayerAvatar
                        name={row.name}
                        photoURL={isCurrentUser ? userDisplayAvatar : row.photoURL}
                        avatarImage={isCurrentUser ? userDisplayAvatar : undefined}
                        isCurrentUser={isCurrentUser}
                        size="sm"
                        showBadge={false}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="truncate font-display font-bold text-foreground">
                            {row.name}
                          </p>
                          {row.equippedTitle && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide shrink-0">
                              {row.equippedTitle}
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-primary ring-1 ring-primary/40">
                              Tu
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{row.district}</span>
                          <span>•</span>
                          <span className="font-medium text-foreground/70">Nível {row.level}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-display text-base font-black text-brand-gradient sm:text-lg">
                          {row.xp.toLocaleString('pt-PT')}
                        </p>
                        <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                          XP
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Current user sticky card if outside Top 10 */}
            {currentUserEntry && !isCurrentUserInTop10 && (
              <div
                onClick={() => handleSelectPlayer(currentUserEntry)}
                className="border-t border-white/10 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-4 sm:p-5 cursor-pointer hover:bg-primary/20 transition-colors"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-primary">
                  A tua classificação nacional
                </p>
                <div className="mt-2 flex items-center gap-3.5 sm:gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20 font-display text-base font-black text-primary ring-1 ring-primary/40">
                    #{currentUserEntry.pos}
                  </span>

                  <PlayerAvatar
                    name={currentUserEntry.name}
                    photoURL={userDisplayAvatar}
                    avatarImage={userDisplayAvatar}
                    isCurrentUser={true}
                    size="sm"
                    showBadge={false}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate font-display font-bold text-foreground">
                        {currentUserEntry.name}
                      </p>
                      {currentUserEntry.equippedTitle && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide shrink-0">
                          {currentUserEntry.equippedTitle}
                        </span>
                      )}
                      <span className="rounded-full bg-primary/25 px-2 py-0.5 text-[0.65rem] font-black uppercase text-primary">
                        Tu
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0 text-primary" />
                      <span>{currentUserEntry.district}</span>
                      <span>•</span>
                      <span>Nível {currentUserEntry.level}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-black text-brand-gradient">
                      {currentUserEntry.xp.toLocaleString('pt-PT')}
                    </p>
                    <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                      XP
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Call to action at bottom */}
            <div className="border-t border-white/5 p-4 sm:p-5 text-center bg-card/30">
              <button
                type="button"
                onClick={() => handleStartGame('/jogar')}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:border-primary/50 hover:bg-primary/25 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                Jogar agora e subir no ranking
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <PlayerProfileModal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        player={selectedPlayer}
      />
    </section>
  )
}

function PodiumCard({
  player,
  isCurrentUser,
  userDisplayAvatar,
  onSelect,
}: {
  player: RankedPlayer
  isCurrentUser: boolean
  userDisplayAvatar?: string
  onSelect?: () => void
}) {
  const isFirst = player.pos === 1

  const config = {
    1: {
      pedestal: 'h-40 sm:h-52 bg-gradient-to-b from-gold/30 via-gold/10 to-transparent border-gold/40 shadow-[0_0_40px_-10px_var(--gold)]',
      badge: 'bg-gold text-gold-foreground font-black ring-2 ring-gold/50 shadow-[0_0_15px_var(--gold)]',
      crown: true,
      ringColor: 'ring-gold/60',
    },
    2: {
      pedestal: 'h-32 sm:h-40 bg-gradient-to-b from-white/15 via-white/5 to-transparent border-white/20',
      badge: 'bg-white/90 text-background font-black ring-2 ring-white/30',
      crown: false,
      ringColor: 'ring-white/40',
    },
    3: {
      pedestal: 'h-28 sm:h-36 bg-gradient-to-b from-flag-red/25 via-flag-red/5 to-transparent border-flag-red/30',
      badge: 'bg-flag-red text-flag-red-foreground font-black ring-2 ring-flag-red/40',
      crown: false,
      ringColor: 'ring-flag-red/50',
    },
  }[player.pos as 1 | 2 | 3] || {
    pedestal: 'h-28 bg-white/5 border-white/10',
    badge: 'bg-white/10 text-foreground',
    crown: false,
    ringColor: 'ring-white/20',
  }

  return (
    <div
      onClick={onSelect}
      className="flex flex-col items-center cursor-pointer group transition-transform hover:-translate-y-1"
    >
      {config.crown ? (
        <div className="animate-glow-pulse mb-1 grid h-8 w-8 place-items-center">
          <Crown className="h-7 w-7 fill-gold text-gold drop-shadow-[0_0_12px_var(--gold)]" />
        </div>
      ) : (
        <div className="h-8 mb-1" />
      )}

      <div className="relative">
        <PlayerAvatar
          name={player.name}
          photoURL={isCurrentUser ? userDisplayAvatar : player.photoURL}
          avatarImage={isCurrentUser ? userDisplayAvatar : undefined}
          isCurrentUser={isCurrentUser}
          rank={player.pos}
          size={isFirst ? 'lg' : 'md'}
        />
      </div>

      <div className="mt-2.5 flex flex-col items-center text-center w-full px-1">
        <span className="max-w-[100px] sm:max-w-[140px] truncate text-xs sm:text-base font-bold text-white tracking-tight">
          {player.name}
        </span>

        {player.equippedTitle && (
          <span className="inline-block mt-0.5 max-w-[110px] sm:max-w-[140px] truncate px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide">
            {player.equippedTitle}
          </span>
        )}

        <span className="text-[0.62rem] sm:text-xs text-slate-400 mt-0.5 max-w-[90px] sm:max-w-[130px] truncate">
          {player.district}
        </span>
      </div>

      <div
        className={cn(
          'mt-3 flex w-full flex-col items-center justify-end rounded-t-3xl border border-b-0 pb-3 pt-3 transition-all',
          config.pedestal,
        )}
      >
        <span
          className={cn(
            'grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-2xl font-display text-sm sm:text-base font-black',
            config.badge,
          )}
        >
          {player.pos}º
        </span>

        <span className="mt-2 font-display text-xs sm:text-base font-black text-foreground">
          {player.xp.toLocaleString('pt-PT')}
        </span>

        <span className="text-[0.58rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
          XP
        </span>
      </div>
    </div>
  )
}
