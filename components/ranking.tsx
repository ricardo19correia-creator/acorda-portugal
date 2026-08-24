'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Crown, MapPin, Trophy, Sparkles, User, Play, ChevronRight, Filter, Swords, Globe } from 'lucide-react'
import {
  collection,
  limit,
  onSnapshot,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SectionHeading } from '@/components/section-heading'
import { useAuth } from '@/components/auth-provider'
import { calculateLevelProgress } from '@/lib/progression'
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

export const BASE_NATIONAL_CHAMPIONS: RankedPlayer[] = [
  {
    uid: 'champ-1',
    name: 'D. Afonso de Guimarães',
    photoURL: '/images/avatars/camoes-2050.jpg',
    level: 28,
    xp: 28450,
    district: 'Braga',
    pos: 1,
    equippedTitle: 'Lenda Nacional',
  },
  {
    uid: 'champ-2',
    name: 'Marta Lusitana',
    photoURL: '/images/avatars/fadista-cyber.jpg',
    level: 24,
    xp: 21900,
    district: 'Porto',
    pos: 2,
    equippedTitle: 'Mestre Distrital',
  },
  {
    uid: 'champ-3',
    name: 'Vasco do Tejo',
    photoURL: '/images/avatars/guardiao-vulcanico.jpg',
    level: 21,
    xp: 18200,
    district: 'Lisboa',
    pos: 3,
    equippedTitle: 'Conquistador',
  },
  {
    uid: 'champ-4',
    name: 'Tiago de Trás-os-Montes',
    photoURL: '/images/avatars/lenda-futebol.jpg',
    level: 19,
    xp: 15400,
    district: 'Vila Real',
    pos: 4,
    equippedTitle: 'Guerreiro Transmontano',
  },
  {
    uid: 'champ-5',
    name: 'Inês de Coimbra',
    photoURL: '/images/avatars/fadista-cyber.jpg',
    level: 17,
    xp: 13150,
    district: 'Coimbra',
    pos: 5,
    equippedTitle: 'Sábia do Conhecimento',
  },
  {
    uid: 'champ-6',
    name: 'Gonçalo do Sado',
    photoURL: '/images/avatars/camoes-2050.jpg',
    level: 15,
    xp: 11200,
    district: 'Setúbal',
    pos: 6,
    equippedTitle: 'Defensor da Costa',
  },
  {
    uid: 'champ-7',
    name: 'Beatriz dos Açores',
    photoURL: '/images/avatars/guardiao-vulcanico.jpg',
    level: 14,
    xp: 9800,
    district: 'Açores',
    pos: 7,
    equippedTitle: 'Guardiã Atlântica',
  },
  {
    uid: 'champ-8',
    name: 'Rodrigo do Algarve',
    photoURL: '/images/avatars/lenda-futebol.jpg',
    level: 12,
    xp: 8450,
    district: 'Faro',
    pos: 8,
    equippedTitle: 'Navegador do Sul',
  },
  {
    uid: 'champ-9',
    name: 'Leonor da Beira',
    photoURL: '/images/avatars/fadista-cyber.jpg',
    level: 11,
    xp: 7100,
    district: 'Viseu',
    pos: 9,
    equippedTitle: 'Estrategista',
  },
  {
    uid: 'champ-10',
    name: 'Afonso da Madeira',
    photoURL: '/images/avatars/guardiao-vulcanico.jpg',
    level: 10,
    xp: 5900,
    district: 'Madeira',
    pos: 10,
    equippedTitle: 'Explorador',
  },
]

export function Ranking() {
  const [ranking, setRanking] = useState<RankedPlayer[]>(BASE_NATIONAL_CHAMPIONS)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfileData | null>(null)
  const [filterMode, setFilterMode] = useState<'nacional' | 'distrito' | 'duelos'>('nacional')
  const { user, profile } = useAuth()
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

  // Subscrição em Tempo Real ao Firestore publicProfiles com fusão inteligente de base
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const processSnapshot = (snapshot: any) => {
      const playersMap = new Map<string, RankedPlayer>()

      // 1. Inserir campeões de base para garantir uma tabela sempre rica
      BASE_NATIONAL_CHAMPIONS.forEach((champ) => {
        playersMap.set(champ.uid, { ...champ })
      })

      // 2. Inserir/Sobrescrever com perfis reais do Firestore
      if (snapshot && !snapshot.empty) {
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
      }

      // 3. Garantir que o perfil do jogador atual está refletido com dados em tempo real
      if (user?.uid && profile) {
        const userXp = profile.xp ?? 0
        const userLevel = profile.level ?? calculateLevelProgress(userXp).currentLevel.level
        const userTitle = (profile as any)?.equippedTitle || profile.equipped?.title || (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') : '') || ''
        
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
        })
      }

      // 4. Ordenar decrescente por XP
      const sorted = Array.from(playersMap.values()).sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp
        return b.level - a.level
      })

      // 5. Atribuir posições oficiais (1º, 2º, 3º...)
      sorted.forEach((p, idx) => {
        p.pos = idx + 1
      })

      setRanking(sorted)
    }

    try {
      const rankingQuery = query(collection(db, 'publicProfiles'), limit(100))
      unsubscribe = onSnapshot(
        rankingQuery,
        (snapshot) => {
          processSnapshot(snapshot)
        },
        (err) => {
          console.warn('[RANKING] Aviso Firestore snapshot, a usar dados combinados:', err)
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
      return distMatches.length > 0 ? distMatches : ranking
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
        equippedTitle: (profile as any)?.equippedTitle || '',
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
      p.photoURL?.includes('camoes') ||
      p.name.includes('Riky') ||
      p.name.includes('Afonso')
    )

    const rawTitle =
      p.equippedTitle ||
      p.equipped?.title ||
      (p.pos === 1 ? 'Lenda Nacional' : p.pos <= 3 ? 'Mestre Distrital' : 'Conquistador')

    setSelectedPlayer({
      id: p.uid,
      username: p.name,
      avatarUrl: p.photoURL || undefined,
      level: p.level || 1,
      xp: p.xp || 500,
      district: p.district || 'Portugal',
      rankPosition: p.pos,
      virtualMoney: Math.max(250, Math.floor(p.xp * 1.5)),
      isVip,
      title: rawTitle,
      stats: {
        duelsWon: p.pos === 1 ? 32 : Math.max(4, 20 - p.pos),
        duelsTotal: 25 + p.level * 3,
        accuracyRate: p.pos === 1 ? 96 : Math.max(70, 92 - p.pos * 2),
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

      {/* Leaderboard Content */}
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
                      className="h-10 w-10 shrink-0 text-sm ring-1 ring-white/15"
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
                  className="h-10 w-10 shrink-0 text-sm ring-2 ring-primary/40"
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
