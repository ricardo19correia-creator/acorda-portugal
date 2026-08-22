'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Crown, MapPin, Trophy, Sparkles, User, Play, ChevronRight } from 'lucide-react'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SectionHeading } from '@/components/section-heading'
import { useAuth } from '@/components/auth-provider'
import { calculateLevelProgress } from '@/lib/progression'
import { getTitleBadgeStyle } from '@/lib/cosmetics'
import { SHOP_CATALOG } from '@/lib/economy'
import { TITLE_SHOP_CATALOG } from '@/data/shopTitles'
import type { EquippedCosmetics } from '@/lib/game-data'
import { cn } from '@/lib/utils'
import PlayerProfileModal, { type PlayerProfileData } from '@/components/PlayerProfileModal'
import { PlayerAvatar } from '@/components/player-avatar'

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
}

const PODIUM_ORDER = [1, 0, 2] // 2º (left), 1º (center), 3º (right)

export function Ranking() {
  const [ranking, setRanking] = useState<RankedPlayer[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, authResolved } = useAuth()
  const [userDisplayAvatar, setUserDisplayAvatar] = useState<string>('/images/avatars/camoes-2050.jpg')

  useEffect(() => {
    const updateAvatar = () => {
      if (typeof window !== 'undefined') {
        const equipped = localStorage.getItem('user_equipped_avatar')
        if (equipped) {
          setUserDisplayAvatar(equipped)
        } else if (user?.photoURL) {
          setUserDisplayAvatar(user.photoURL)
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

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const processSnapshot = (snapshot: any) => {
      const playersMap = new Map<string, RankedPlayer>()

      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data()
        if (!data) return

        const rawName = (data.displayName || data.name || data.email?.split('@')[0] || '').trim()
        const name = rawName || 'Jogador'
        const xp = typeof data.xp === 'number' && !isNaN(data.xp) ? data.xp : 0
        const level = calculateLevelProgress(xp).currentLevel.level
        const district = data.district || 'Portugal'
        const photoURL = data.photoURL || null
        const equipped = data.equipped || {}
        const equippedTitle = data.equippedTitle || data.equipped?.title || data.title || ''

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
        })
      })

      // Convert to array and sort descending by XP, then level
      const sorted = Array.from(playersMap.values()).sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp
        return b.level - a.level
      })

      // Assign official ranks (1-based)
      sorted.forEach((p, idx) => {
        p.pos = idx + 1
      })

      setRanking(sorted)
      setLoading(false)
      setError(null)
    }

    try {
      // Primary query: publicProfiles collection ordered by XP descending
      const rankingQuery = query(
        collection(db, 'publicProfiles'),
        orderBy('xp', 'desc'),
        limit(50),
      )

      unsubscribe = onSnapshot(
        rankingQuery,
        (snapshot) => {
          processSnapshot(snapshot)
        },
        (err) => {
          console.warn('[RANKING] Query com orderBy falhou, a tentar fallback:', err)
          // Fallback query without orderBy in case single field index is still indexing
          try {
            const fallbackQuery = query(collection(db, 'publicProfiles'), limit(50))
            unsubscribe = onSnapshot(
              fallbackQuery,
              (fallbackSnap) => {
                processSnapshot(fallbackSnap)
              },
              (fallbackErr) => {
                console.error('[RANKING] Fallback query error:', fallbackErr)
                setError('Não foi possível carregar a tabela de classificação.')
                setLoading(false)
              },
            )
          } catch (innerErr) {
            console.error('[RANKING] Erro ao iniciar fallback query:', innerErr)
            setError('Não foi possível carregar a tabela de classificação.')
            setLoading(false)
          }
        },
      )
    } catch (queryErr) {
      console.error('[RANKING] Erro ao criar query de ranking:', queryErr)
      setError('Erro ao iniciar a consulta do ranking.')
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, []) // Empty dependency array: stable Firestore listener

  const top3 = useMemo(() => ranking.slice(0, 3), [ranking])
  const rest = useMemo(() => ranking.slice(3, 10), [ranking])

  // Determine current user rank status
  const currentUserEntry = useMemo(() => {
    if (!user?.uid) return null
    const foundInTop = ranking.find((p) => p.uid === user.uid)
    if (foundInTop) return foundInTop

    if (profile) {
      const userXp = profile.xp ?? 0
      const rankPos = ranking.filter((p) => p.xp > userXp).length + 1
      const equippedTitle = (profile as any)?.equippedTitle || profile?.equipped?.title || (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') : '') || ''
      return {
        uid: user.uid,
        name: profile.displayName || user.displayName || 'Jogador',
        photoURL: profile.photoURL || user.photoURL || null,
        level: profile.level ?? 1,
        xp: userXp,
        district: profile.district || 'Portugal',
        pos: rankPos,
        equippedTitle,
        equipped: profile.equipped,
      } as RankedPlayer
    }

    return null
  }, [ranking, user, profile])

  const isCurrentUserInTop10 = useMemo(() => {
    if (!user?.uid) return false
    return ranking.slice(0, 10).some((p) => p.uid === user.uid)
  }, [ranking, user])

  const handleSelectPlayer = (p: RankedPlayer) => {
    const isVip = Boolean(
      (p as any)?.is_founder ||
      (p as any)?.isFounder ||
      (p as any)?.isVip ||
      (p.equipped as any)?.avatar?.includes('camoes') ||
      p.photoURL?.includes('camoes') ||
      p.name.includes('Riky'),
    )

    const rawTitle = (
      p.equippedTitle ||
      p.equipped?.title ||
      (p as any)?.title ||
      (p.pos === 1 ? 'Lenda Nacional' : p.pos <= 3 ? 'Mestre Distrital' : 'Noviço da Nação')
    )

    setSelectedPlayer({
      id: p.uid,
      username: p.name,
      avatarUrl: p.photoURL || undefined,
      level: p.level || 1,
      xp: p.xp || 500,
      district: p.district || 'Portugal',
      rankPosition: p.pos,
      virtualMoney: Math.max(150, Math.floor(p.xp * 1.5)),
      isVip,
      title: rawTitle,
      stats: {
        duelsWon: p.pos === 1 ? 24 : Math.max(3, 16 - p.pos),
        duelsTotal: 18 + p.level * 3,
        accuracyRate: p.pos === 1 ? 94 : Math.max(65, 90 - p.pos * 2),
      },
      badges: [
        { icon: '🇵🇹', name: p.district || 'Portugal' },
        { icon: '🏆', name: `Top #${p.pos}` },
        { icon: '⚡', name: `Nível ${p.level}` },
      ],
    })
  }

  return (
    <section
      id="ranking"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <SectionHeading
        eyebrow="A tabela nacional"
        title="Top de Portugal"
        description="Os melhores do país, atualizados a cada partida. Sobe, ultrapassa e reclama a coroa."
      />

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

      {/* Error state */}
      {!loading && error && (
        <div className="mt-12 mx-auto max-w-lg rounded-3xl border border-flag-red/30 bg-flag-red/10 p-6 text-center">
          <p className="font-semibold text-flag-red">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">Tenta recarregar a página para atualizar a tabela.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && ranking.length === 0 && (
        <div className="mt-12 mx-auto max-w-md rounded-3xl border border-white/10 bg-card/60 p-8 text-center backdrop-blur">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
            <Trophy className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-foreground">A temporada começou!</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sê o primeiro jogador a concluir uma partida e a liderar a classificação de Portugal.
          </p>
          <div className="mt-6">
            <Link
              href="/jogar"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-display text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-[0_0_20px_-3px_var(--primary)]"
            >
              <Play className="h-4 w-4 fill-current" />
              Jogar primeira partida
            </Link>
          </div>
        </div>
      )}

      {/* Populated Leaderboard */}
      {!loading && !error && ranking.length > 0 && (
        <div className="mt-12">
          {/* TOP 3 Podium */}
          {top3.length > 0 && (
            <div className="mx-auto max-w-3xl">
              <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-6">
                {PODIUM_ORDER.map((posIndex) => {
                  const player = top3[posIndex]
                  if (!player) {
                    return <div key={`empty-pos-${posIndex}`} className="h-28" />
                  }
                  return (
                    <PodiumCard
                      key={player.uid}
                      player={player}
                      isCurrentUser={Boolean(user?.uid && player.uid === user.uid) || player.name === user?.displayName || player.name === 'Riky Moreira'}
                      userDisplayAvatar={userDisplayAvatar}
                      onSelect={() => handleSelectPlayer(player)}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Leaderboard list (ranks 4 to 10) */}
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur shadow-xl">
            {rest.length > 0 && (
              <ul className="divide-y divide-white/5">
                {rest.map((row) => {
                  const isCurrentUser = Boolean(user?.uid && row.uid === user.uid) || row.name === user?.displayName || row.name === 'Riky Moreira'
                  return (
                    <li
                      key={row.uid}
                      onClick={() => handleSelectPlayer(row)}
                      className={cn(
                        'flex items-center gap-3.5 px-4 py-3.5 transition-colors sm:gap-4 sm:px-6 cursor-pointer',
                        isCurrentUser
                          ? 'bg-primary/10 border-l-4 border-primary hover:bg-primary/15'
                          : 'hover:bg-white/[0.06]',
                      )}
                    >
                      {/* Position Badge */}
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/5 font-display text-sm font-black text-muted-foreground">
                        {row.pos}
                      </span>

                      {/* Player Avatar */}
                      <PlayerAvatar
                        name={row.name}
                        photoURL={isCurrentUser ? userDisplayAvatar : row.photoURL}
                        avatarImage={isCurrentUser ? userDisplayAvatar : undefined}
                        isCurrentUser={isCurrentUser}
                        className="h-10 w-10 shrink-0 text-sm ring-1 ring-white/15"
                      />

                      {/* Name + District + Level */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="truncate font-display font-bold text-foreground">
                            {row.name}
                          </p>
                          {row.equippedTitle || row.equipped?.title ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-semibold text-amber-300 tracking-wide shrink-0">
                              {(TITLE_SHOP_CATALOG.find((i) => i.id === (row.equippedTitle || row.equipped?.title) || i.name === (row.equippedTitle || row.equipped?.title))?.name || (row.equippedTitle || row.equipped?.title))?.replace(/^Título:\s*«?/, '').replace(/»?$/, '')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 shrink-0">Recruta</span>
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

                      {/* XP Score */}
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

            {/* Current user card if outside Top 10 */}
            {currentUserEntry && !isCurrentUserInTop10 && (
              <div
                onClick={() => handleSelectPlayer(currentUserEntry)}
                className="border-t border-white/10 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-4 sm:p-5 cursor-pointer hover:bg-primary/20 transition-colors"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-primary">
                  A tua classificação
                </p>
                <div className="mt-2 flex items-center gap-3.5 sm:gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20 font-display text-base font-black text-primary ring-1 ring-primary/40">
                    {currentUserEntry.pos}
                  </span>

                  <PlayerAvatar
                    name={currentUserEntry.name}
                    photoURL={userDisplayAvatar}
                    avatarImage={userDisplayAvatar}
                    isCurrentUser={true}
                    className="h-10 w-10 shrink-0 text-sm ring-2 ring-primary/40"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate font-display font-bold text-foreground">
                        {currentUserEntry.name}
                      </p>
                      {(currentUserEntry.equippedTitle || currentUserEntry.equipped?.title || (profile as any)?.equippedTitle || profile?.equipped?.title || (typeof window !== 'undefined' && localStorage.getItem('equipped_title'))) ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-semibold text-amber-300 tracking-wide shrink-0">
                          {(TITLE_SHOP_CATALOG.find((i) => i.id === (currentUserEntry.equippedTitle || currentUserEntry.equipped?.title || (profile as any)?.equippedTitle || profile?.equipped?.title || localStorage.getItem('equipped_title')) || i.name === (currentUserEntry.equippedTitle || currentUserEntry.equipped?.title || (profile as any)?.equippedTitle || profile?.equipped?.title || localStorage.getItem('equipped_title')))?.name || (currentUserEntry.equippedTitle || currentUserEntry.equipped?.title || (profile as any)?.equippedTitle || profile?.equipped?.title || localStorage.getItem('equipped_title') || ''))?.replace(/^Título:\s*«?/, '').replace(/»?$/, '')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 shrink-0">Recruta</span>
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
              <Link
                href="/jogar"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary transition-all hover:border-primary/50 hover:bg-primary/25"
              >
                <Sparkles className="h-4 w-4" />
                Jogar agora e subir no ranking
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil Rápido do Jogador */}
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
      {/* Crown above 1st place */}
      {config.crown ? (
        <div className="animate-glow-pulse mb-1 grid h-8 w-8 place-items-center">
          <Crown className="h-7 w-7 fill-gold text-gold drop-shadow-[0_0_12px_var(--gold)]" />
        </div>
      ) : (
        <div className="h-8 mb-1" />
      )}

      {/* Avatar with position halo */}
      <div className="relative">
        <PlayerAvatar
          name={player.name}
          photoURL={isCurrentUser ? userDisplayAvatar : player.photoURL}
          avatarImage={isCurrentUser ? userDisplayAvatar : undefined}
          isCurrentUser={isCurrentUser}
          className={cn(
            'ring-2 transition-transform duration-300',
            config.ringColor,
            isFirst ? 'h-16 w-16 sm:h-20 sm:w-20 text-xl' : 'h-13 w-13 sm:h-16 sm:w-16 text-base',
            isCurrentUser && 'ring-4 ring-primary',
          )}
        />
        {isCurrentUser && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.2 text-[0.55rem] font-black uppercase text-primary-foreground ring-1 ring-background">
            Tu
          </span>
        )}
      </div>

      {/* Player name & Title & District */}
      <div className="mt-2.5 flex flex-col items-center text-center w-full px-1">
        <span className="max-w-[100px] sm:max-w-[140px] truncate text-xs sm:text-base font-bold text-white tracking-tight">
          {player.name}
        </span>

        {/* Badge do Título Equipado */}
        {player.equippedTitle || player.equipped?.title ? (
          <span className="inline-block mt-0.5 max-w-[110px] sm:max-w-[140px] truncate px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-semibold text-amber-300 tracking-wide">
            {(TITLE_SHOP_CATALOG.find((i) => i.id === (player.equippedTitle || player.equipped?.title) || i.name === (player.equippedTitle || player.equipped?.title))?.name || (player.equippedTitle || player.equipped?.title))?.replace(/^Título:\s*«?/, '').replace(/»?$/, '')}
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 mt-0.5">Recruta</span>
        )}

        <span className="text-[0.62rem] sm:text-xs text-slate-400 mt-0.5 max-w-[90px] sm:max-w-[130px] truncate">
          {player.district}
        </span>
      </div>

      {/* Pedestal block */}
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