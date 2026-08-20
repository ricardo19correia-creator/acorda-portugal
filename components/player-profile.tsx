'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { signOut, updateProfile } from 'firebase/auth'
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Award,
  CheckCircle2,
  Coins,
  Crown,
  Flame,
  Gamepad2,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  XCircle,
  ShoppingBag,
  Wallet,
  Check,
  Shield,
  Palette,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Info,
  Calendar,
  Layers,
} from 'lucide-react'

import { useAuth } from '@/components/auth-provider'
import { AchievementCard } from '@/components/achievement-card'
import { ProfilePanel } from '@/components/profile-panel'
import { WalletModal } from '@/components/wallet-modal'
import { PlayerAvatar } from '@/components/player-avatar'
import { auth, db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'
import { ACHIEVEMENTS } from '@/lib/game-data'
import { calculateLevelProgress } from '@/lib/progression'
import {
  SHOP_CATALOG,
  equipItem,
  formatRarityLabel,
  formatItemStatusBadge,
  type ShopItem,
  type WalletTransaction,
} from '@/lib/economy'
import { getEquippedCosmetics, getPlayerDisplayTitle } from '@/lib/cosmetics'
import { cn } from '@/lib/utils'

const districts = [
  'Vila Real',
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Viseu',
  'Açores',
  'Madeira',
]

const format = (value?: number | null) =>
  typeof value === 'number' && !isNaN(value) ? value.toLocaleString('pt-PT') : '0'

function formatRelativeTime(date: Date): string {
  const now = Date.now()
  const diffSec = Math.floor((now - date.getTime()) / 1000)

  if (diffSec < 60) return 'agora mesmo'
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60)
    return `há ${m} ${m === 1 ? 'minuto' : 'minutos'}`
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600)
    return `há ${h} ${h === 1 ? 'hora' : 'horas'}`
  }
  if (diffSec < 172800) return 'ontem'
  const d = Math.floor(diffSec / 86400)
  return `há ${d} dias`
}

function Avatar({ profile, small = false }: { profile: UserProfile; small?: boolean }) {
  return <PlayerAvatar profile={profile} size={small ? 'md' : 'xl'} />
}

export function PlayerProfile() {
  const {
    user,
    authResolved,
    authInitializationError,
    profile,
    profileLoading,
    profileError,
    retryProfile,
  } = useAuth()
  const router = useRouter()

  const [walletOpen, setWalletOpen] = useState(false)
  const [equipping, setEquipping] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft, setDraft] = useState({ displayName: '', district: 'Vila Real' })
  const [override, setOverride] = useState<UserProfile | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Real-time Rankings
  const [nationalRank, setNationalRank] = useState<number | null>(null)
  const [districtRank, setDistrictRank] = useState<number | null>(null)
  const [rankingLoading, setRankingLoading] = useState(true)

  // Real-time Activity Timeline
  const [recentActivities, setRecentActivities] = useState<WalletTransaction[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  const player = override ?? profile

  useEffect(() => {
    if (profile) {
      setDraft({ displayName: profile.displayName, district: profile.district })
      setOverride(null)
    }
  }, [profile])

  // Subscrição em tempo real aos rankings nacionais e distritais
  useEffect(() => {
    if (!player) return

    const effectiveUid = user?.uid || player.uid
    setRankingLoading(true)
    const q = query(collection(db, 'publicProfiles'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: { uid: string; xp: number; district: string }[] = []
        snapshot.forEach((docSnap) => {
          const d = docSnap.data()
          list.push({
            uid: docSnap.id,
            xp: typeof d.xp === 'number' ? d.xp : 0,
            district: d.district || 'Portugal',
          })
        })

        // Ordenar por XP descrescente
        list.sort((a, b) => b.xp - a.xp)

        // Posição nacional
        const natIndex = list.findIndex((p) => p.uid === effectiveUid)
        if (natIndex !== -1 && (list[natIndex].xp > 0 || player.gamesPlayed > 0)) {
          setNationalRank(natIndex + 1)
        } else {
          setNationalRank(null)
        }

        // Posição distrital
        const districtList = list.filter((p) => p.district === player.district)
        const distIndex = districtList.findIndex((p) => p.uid === effectiveUid)
        if (distIndex !== -1 && (districtList[distIndex].xp > 0 || player.gamesPlayed > 0)) {
          setDistrictRank(distIndex + 1)
        } else {
          setDistrictRank(null)
        }

        setRankingLoading(false)
      },
      (err) => {
        console.warn('Erro ao carregar rankings em tempo real:', err)
        setRankingLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid, player?.uid, player?.district, player?.xp, player?.gamesPlayed])

  // Subscrição em tempo real às atividades e transações do jogador
  useEffect(() => {
    if (!user?.uid) {
      setActivitiesLoading(false)
      return
    }

    setActivitiesLoading(true)
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(10),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const acts: WalletTransaction[] = []
        snapshot.forEach((docSnap) => {
          const d = docSnap.data()
          acts.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type || (d.amount >= 0 ? 'earn' : 'spend'),
            amount: d.amount,
            reason: d.reason || 'Atividade de jogo',
            itemId: d.itemId,
            matchId: d.matchId,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
          })
        })
        setRecentActivities(acts)
        setActivitiesLoading(false)
      },
      (err) => {
        console.warn('Erro ao carregar atividades do utilizador:', err)
        setActivitiesLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user?.uid])

  const accuracy = useMemo(() => {
    const total = (player as any)?.totalQuestions ?? (player as any)?.questionsAnswered ?? 0
    const correct = player?.correctAnswers ?? 0
    return total > 0 ? (correct / total) * 100 : 0
  }, [player])

  const save = async () => {
    if (!player) return
    const displayName = typeof draft.displayName === 'string' ? draft.displayName.trim() : ''
    const district = typeof draft.district === 'string' && draft.district.trim() ? draft.district.trim() : 'Vila Real'

    if (!displayName) {
      setSaveError('O nome não pode ficar vazio.')
      return
    }

    if (user && user.uid) {
      try {
        setSaving(true)
        setSaveError(null)
        await updateDoc(doc(db, 'users', user.uid), {
          displayName,
          district,
          updatedAt: serverTimestamp(),
        })
        await setDoc(
          doc(db, 'publicProfiles', user.uid),
          { displayName, district, updatedAt: serverTimestamp() },
          { merge: true },
        )
        if (typeof (user as any).getIdToken === 'function') {
          await updateProfile(user, { displayName })
        }
        setOverride({ ...player, displayName, district, updatedAt: new Date() })
        setEditing(false)
        retryProfile()
      } catch (error) {
        setSaveError(
          `Não foi possível guardar as alterações. [Firebase: ${error instanceof Error ? error.message : 'erro desconhecido'}]`,
        )
      } finally {
        setSaving(false)
      }
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { performGoogleSignIn } = await import('@/lib/auth-helpers')
      await performGoogleSignIn('/perfil')
    } catch (err) {
      console.error('Erro no login Google:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const logout = async () => {
    setOverride(null)
    setDraft({ displayName: '', district: 'Vila Real' })
    if (auth) {
      await signOut(auth)
    }
    router.replace('/')
  }

  if (!authResolved) return <StateCard text="A verificar a tua conta..." />
  if (authInitializationError)
    return <ErrorCard message={authInitializationError} onRetry={() => window.location.reload()} />
  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-card/80 p-8 text-center backdrop-blur-xl shadow-2xl space-y-5 max-w-lg mx-auto">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/20 text-primary ring-2 ring-primary/40 shadow-lg">
          <UserRound className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-black text-foreground">Inicia Sessão para Ver o Teu Perfil</h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Acede às tuas estatísticas, moedas, cosméticos e posição no ranking nacional.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3.5 px-4 font-display text-sm font-black uppercase tracking-wider text-black shadow-xl hover:bg-white/90 active:scale-[0.99] transition cursor-pointer"
          >
            <span>Continuar com Google</span>
          </button>
          <Link
            href="/entrar"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 px-4 font-display text-xs font-bold uppercase tracking-wider text-foreground hover:bg-white/10 transition cursor-pointer"
          >
            <span>Entrar com Email / Criar Conta</span>
          </Link>
        </div>
      </div>
    )
  }
  if (profileError) return <ErrorCard message={profileError} onRetry={retryProfile} />
  if (profileLoading || !player) return <StateCard text="A carregar o teu perfil de jogador..." />

  const progressInfo = calculateLevelProgress(player.xp ?? 0)
  const isMaxLevel = progressInfo.isMaxLevel
  const nextTargetXp = progressInfo.nextLevel ? progressInfo.nextLevel.xpRequired : 3000000

  const inventory: Record<string, number> = (player as any)?.inventory || {}
  const equipped = (player as any)?.equipped || {}

  // Contagens do inventário
  const ownedFrames = SHOP_CATALOG.filter((i) => i.id.startsWith('frame_') && (inventory[i.id] || 0) > 0)
  const ownedTitles = SHOP_CATALOG.filter((i) => i.id.startsWith('title_') && (inventory[i.id] || 0) > 0)
  const ownedThemes = SHOP_CATALOG.filter((i) => i.id.startsWith('theme_') && (inventory[i.id] || 0) > 0)
  const totalConsumables = SHOP_CATALOG.filter(
    (i) => i.type === 'consumable' && (inventory[i.id] || 0) > 0,
  ).reduce((acc, curr) => acc + (inventory[curr.id] || 0), 0)

  // Cosméticos equipados atualmente
  const equippedFrameItem = SHOP_CATALOG.find((i) => i.id === equipped.frame)
  const equippedTitleItem = SHOP_CATALOG.find((i) => i.id === equipped.title)
  const equippedThemeItem = SHOP_CATALOG.find((i) => i.id === equipped.theme)

  const effectiveUid = user?.uid || profile?.uid || ''
  const cosmeticsList = SHOP_CATALOG.filter(
    (item) => item.type === 'permanent' && (inventory[item.id] || 0) > 0,
  )
  const consumablesList = SHOP_CATALOG.filter((item) => item.type === 'consumable')

  const handleEquipToggle = async (item: ShopItem) => {
    if (!effectiveUid) return
    setEquipping(item.id)
    const slot = item.id.startsWith('frame_')
      ? 'frame'
      : item.id.startsWith('title_')
        ? 'title'
        : item.id.startsWith('theme_')
          ? 'theme'
          : item.id.startsWith('sfx_')
            ? 'sfx'
            : 'aura'
    const isEquipped = (equipped as any)?.[slot] === item.id
    const nextItemId = isEquipped ? null : item.id

    await equipItem(effectiveUid, nextItemId, slot as any)
    setEquipping(null)
  }

  const totalQuestions = (player as any)?.totalQuestions ?? (player as any)?.questionsAnswered ?? 0
  const correctAnswers = player?.correctAnswers ?? 0
  const incorrectAnswers = (player as any)?.incorrectAnswers ?? Math.max(0, totalQuestions - correctAnswers)

  const stats = [
    [Target, 'Perguntas respondidas', format(totalQuestions), 'text-primary'],
    [CheckCircle2, 'Respostas certas', format(correctAnswers), 'text-accent'],
    [XCircle, 'Respostas erradas', format(incorrectAnswers), 'text-flag-red'],
    [Sparkles, 'Taxa de acerto', `${accuracy.toFixed(1)}%`, 'text-gold'],
    [Gamepad2, 'Partidas jogadas', format(player.gamesPlayed ?? 0), 'text-primary'],
    [Sparkles, 'XP total acumulado', format(player.xp ?? 0), 'text-accent'],
    [Coins, 'Euros Acorda ganhos', `€${format(player.euros ?? 0)}`, 'text-gold'],
    [Flame, 'Melhor sequência', `${player.bestStreak ?? 0} dias`, 'text-flag-red'],
  ] as const

  return (
    <div className="animate-rise space-y-8 sm:space-y-10">

      {/* 1. CABEÇALHO DO PERFIL & IDENTIDADE FORTE */}
      <section className="relative overflow-hidden rounded-4xl border border-primary/25 bg-card/75 p-6 backdrop-blur-xl sm:p-8 shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar profile={player} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-black uppercase tracking-[0.28em] text-primary">
                  {equippedTitleItem ? equippedTitleItem.name.replace('Título: ', '') : progressInfo.currentLevel.title}
                </span>
                {equippedFrameItem && (
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.62rem] font-bold text-muted-foreground">
                    {equippedFrameItem.name}
                  </span>
                )}
              </div>

              <h1 className="mt-1 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
                {player.displayName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-bold">
                <span className="rounded-full bg-gold/15 px-3 py-1 text-gold font-display border border-gold/20">
                  {isMaxLevel ? '👑 MESTRE DE PORTUGAL' : `NÍVEL ${progressInfo.currentLevel.level} — ${progressInfo.currentLevel.title}`}
                </span>

                <Link
                  href="/#mapa"
                  className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-primary border border-primary/20 hover:bg-primary/25 transition"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{player.district}</span>
                </Link>

                <span className="flex items-center gap-1.5 rounded-full bg-flag-red/15 px-3 py-1 text-flag-red border border-flag-red/20">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>{player.streak} dias</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEditing(!editing)
                setSaveError(null)
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-white/10 transition cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5 text-primary" />
              <span>{editing ? 'Cancelar' : 'Editar Dados'}</span>
            </button>

            <Link
              href="/loja"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Loja</span>
            </Link>
          </div>
        </div>

        {/* Formulário de Edição de Nome e Distrito */}
        {editing && (
          <div className="relative mt-6 border-t border-white/10 pt-6 animate-rise">
            <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              <span>Atualizar Nome e Distrito Oficial</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nome de Jogador
                <input
                  value={draft.displayName}
                  onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl border border-white/15 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground focus:border-primary outline-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Distrito Representado
                <select
                  value={draft.district}
                  onChange={(e) => setDraft({ ...draft, district: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl border border-white/15 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground focus:border-primary outline-none"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2 flex items-center gap-3 mt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'A guardar...' : 'Guardar Alterações'}</span>
                </button>
                {saveError && <p className="text-xs font-bold text-flag-red">{saveError}</p>}
              </div>
            </div>
          </div>
        )}

        {/* 2. PROGRESSÃO REAL DE XP */}
        <div className="relative mt-8 border-t border-white/10 pt-6">
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs sm:text-sm font-bold">
            <span className="text-foreground">
              {format(player.xp)} / {format(nextTargetXp)} XP
            </span>
            <span className="text-primary">
              {isMaxLevel
                ? '👑 Topo Absoluto Atingido'
                : `${format(progressInfo.xpRemaining)} XP até ${progressInfo.nextLevel?.title}`}
            </span>
          </div>

          <div className="h-3.5 overflow-hidden rounded-full bg-white/10 p-0.5 ring-1 ring-white/10">
            <div
              className="shimmer relative h-full rounded-full bg-gradient-to-r from-primary via-accent to-gold transition-all duration-700"
              style={{ width: `${Math.max(3, progressInfo.progressPercentage)}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. CENTRO DE COMANDO: RANKING, CARTEIRA & SEQUÊNCIA */}
      <section className="grid gap-5 lg:grid-cols-3">
        {/* 🏆 RANKING NACIONAL & DISTRITAL REAL */}
        <div className="relative overflow-hidden rounded-4xl border border-primary/20 bg-card/75 p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-primary">
                    Classificação
                  </p>
                  <h3 className="font-display text-lg font-black text-foreground">
                    Posição no Ranking
                  </h3>
                </div>
              </div>

              <Link
                href="/#ranking"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Ver Top</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {/* Nacional */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇵🇹</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">Ranking Nacional</p>
                    <p className="text-[0.62rem] text-muted-foreground">Entre todos os jogadores</p>
                  </div>
                </div>
                <div className="text-right">
                  {rankingLoading ? (
                    <span className="text-xs text-muted-foreground">A calcular...</span>
                  ) : nationalRank !== null ? (
                    <span className="font-display text-xl font-black text-primary">
                      #{nationalRank}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">Sem classificação</span>
                  )}
                </div>
              </div>

              {/* Distrital */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">📍</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{player.district}</p>
                    <p className="text-[0.62rem] text-muted-foreground">Ranking do distrito</p>
                  </div>
                </div>
                <div className="text-right">
                  {rankingLoading ? (
                    <span className="text-xs text-muted-foreground">A calcular...</span>
                  ) : districtRank !== null ? (
                    <span className="font-display text-xl font-black text-gold">
                      #{districtRank}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground font-semibold">Sem classificação</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[0.68rem] text-muted-foreground">
            Cada partida certa soma pontos para ti e para o distrito de {player.district}.
          </p>
        </div>

        {/* 💶 CARTEIRA ACORDA (SALDO REAL) */}
        <div className="relative overflow-hidden rounded-4xl border border-gold/25 bg-gradient-to-br from-gold/15 via-card/85 to-primary/10 p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold ring-1 ring-gold/40">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold">
                    Moeda do Jogo
                  </p>
                  <h3 className="font-display text-lg font-black text-foreground">
                    Carteira Acorda
                  </h3>
                </div>
              </div>

              <Link
                href="/loja"
                className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
              >
                <span>Loja</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-5 text-center sm:text-left">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                Saldo Disponível
              </p>
              <p className="mt-0.5 font-display text-4xl font-black text-foreground tracking-tight">
                €{format(player.euros)}
              </p>
              <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                € Acorda (Moeda virtual para extras e cosméticos)
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-foreground hover:bg-white/10 transition cursor-pointer"
            >
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span>Histórico</span>
            </button>
            <Link
              href="/loja"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-md hover:scale-102 transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Usar Saldo</span>
            </Link>
          </div>
        </div>

        {/* 🔥 SEQUÊNCIA & STREAK */}
        <div className="relative overflow-hidden rounded-4xl border border-flag-red/25 bg-card/75 p-6 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-flag-red/15 text-flag-red ring-1 ring-flag-red/30">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-flag-red">
                  Constância
                </p>
                <h3 className="font-display text-lg font-black text-foreground">
                  Sequência Ativa
                </h3>
              </div>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-display text-5xl font-black text-flag-red">{player.streak}</span>
              <span className="text-base font-bold text-muted-foreground">dias consecutivos</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Joga uma partida hoje para manteres a tua sequência de vitórias.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-xs border border-white/5">
            <span className="text-muted-foreground">Melhor sequência de sempre</span>
            <strong className="text-foreground font-display text-sm">
              {player.bestStreak} dias
            </strong>
          </div>
        </div>
      </section>

      {/* 4. AS TUAS ESTATÍSTICAS REAIS */}
      <Section
        title="As Tuas Estatísticas"
        description="Desempenho oficial no Desafio Nacional Acorda Portugal."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(([Icon, label, value, color]) => (
            <div
              key={label}
              className="rounded-3xl border border-white/10 bg-card/65 p-4 sm:p-5 transition hover:-translate-y-1 hover:border-white/20 shadow-lg"
            >
              <Icon className={`h-6 w-6 ${color}`} />
              <p className="mt-4 font-display text-2xl sm:text-3xl font-black text-foreground">
                {value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. ATIVIDADE RECENTE & TIMELINE REAL */}
      <Section
        title="Atividade Recente"
        description="Histórico de partidas, recompensas de € Acorda e evolução da tua conta."
      >
        {activitiesLoading ? (
          <div className="rounded-3xl border border-white/10 bg-card/60 p-8 text-center backdrop-blur">
            <Sparkles className="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">A carregar o histórico de atividades...</p>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-2.5">
            {recentActivities.map((act) => {
              const isEarn = act.amount > 0
              return (
                <div
                  key={act.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-card/75 px-5 py-4 backdrop-blur transition hover:bg-card/90 shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-bold',
                        isEarn
                          ? 'bg-primary/20 text-primary ring-1 ring-primary/40'
                          : 'bg-flag-red/20 text-flag-red ring-1 ring-flag-red/40',
                      )}
                    >
                      {isEarn ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-bold text-foreground">
                        {act.reason}
                      </p>
                      <p className="text-[0.65rem] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeTime(act.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        'font-display text-sm sm:text-base font-black',
                        isEarn ? 'text-primary' : 'text-flag-red',
                      )}
                    >
                      {isEarn
                        ? `+€${act.amount.toLocaleString('pt-PT')}`
                        : `-€${Math.abs(act.amount).toLocaleString('pt-PT')}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-card/40 p-8 text-center backdrop-blur">
            <Activity className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="font-display text-base font-bold text-foreground">
              Ainda não tens atividade registada
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Completa a tua primeira partida para ganhares XP, subires no ranking e acumulares € Acorda.
            </p>
            <Link
              href="/jogar"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-display text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 hover:scale-105 transition"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Jogar Agora</span>
            </Link>
          </div>
        )}
      </Section>

      {/* 6. PERSONALIZAÇÃO & INVENTÁRIO DO JOGADOR */}
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Personalização Atual */}
        <div className="rounded-4xl border border-white/10 bg-card/75 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-foreground">
                    Personalização
                  </h3>
                  <p className="text-xs text-muted-foreground">Itens ativos no teu perfil</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Moldura de Avatar</p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {equippedFrameItem ? equippedFrameItem.name : 'Moldura Padrão'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">Equipada</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Título Ativo</p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {equippedTitleItem ? equippedTitleItem.name : progressInfo.currentLevel.title}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gold">Visível</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Distrito Representado</p>
                    <p className="text-[0.65rem] text-muted-foreground">{player.district}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent">Oficial</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Queres desbloquear mais?</span>
            <Link
              href="/loja"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Explorar Loja</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Resumo do Inventário */}
        <div className="rounded-4xl border border-white/10 bg-card/75 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/20 text-gold">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-foreground">
                    O Teu Inventário
                  </h3>
                  <p className="text-xs text-muted-foreground">Cosméticos e consumíveis adquiridos</p>
                </div>
              </div>
            </div>

            {/* Categorias do Inventário */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Molduras
                </p>
                <p className="mt-1 font-display text-2xl font-black text-primary">
                  {ownedFrames.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Títulos
                </p>
                <p className="mt-1 font-display text-2xl font-black text-gold">
                  {ownedTitles.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Temas
                </p>
                <p className="mt-1 font-display text-2xl font-black text-accent">
                  {ownedThemes.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-center">
                <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Consumíveis
                </p>
                <p className="mt-1 font-display text-2xl font-black text-foreground">
                  {totalConsumables}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Total de itens: {ownedFrames.length + ownedTitles.length + ownedThemes.length + totalConsumables}
            </span>
            <Link
              href="/loja"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-white/10 transition"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-gold" />
              <span>Comprar Itens</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. GESTÃO DE COSMÉTICOS & INVENTÁRIO */}
      <Section
        title="Cosméticos & Personalização"
        description="Equipa as tuas molduras, títulos e temas para personalizares o teu perfil e a tua presença no jogo."
      >
        {cosmeticsList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cosmeticsList.map((item) => {
              const slot = item.id.startsWith('frame_')
                ? 'frame'
                : item.id.startsWith('title_')
                  ? 'title'
                  : item.id.startsWith('theme_')
                    ? 'theme'
                    : item.id.startsWith('sfx_')
                      ? 'sfx'
                      : 'aura'
              const isEquipped = (equipped as any)?.[slot] === item.id

              return (
                <div
                  key={item.id}
                  className={cn(
                    'relative flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all duration-200 shadow-lg',
                    isEquipped
                      ? 'border-primary bg-primary/15 ring-2 ring-primary/40 shadow-[0_0_20px_oklch(0.76_0.19_150/0.25)]'
                      : 'border-white/10 bg-card/65 hover:border-white/20',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider',
                          isEquipped
                            ? 'bg-primary/25 text-primary border border-primary/40'
                            : 'bg-white/10 text-muted-foreground',
                        )}
                      >
                        {formatItemStatusBadge(item.rarity, isEquipped)}
                      </span>
                    </div>

                    <h4 className="mt-3.5 font-display text-base font-bold text-foreground flex items-center gap-1.5">
                      {item.name}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={equipping === item.id}
                    onClick={() => handleEquipToggle(item)}
                    className={cn(
                      'mt-5 w-full rounded-2xl py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md',
                      isEquipped
                        ? 'border border-white/20 bg-white/10 text-foreground hover:bg-flag-red/20 hover:text-flag-red hover:border-flag-red/40'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-102 shadow-primary/25',
                    )}
                  >
                    {equipping === item.id
                      ? 'A guardar...'
                      : isEquipped
                        ? 'Desequipar'
                        : 'Equipar'}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-card/50 p-8 text-center backdrop-blur-xl">
            <Shield className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <h4 className="mt-3 font-display text-base font-bold text-foreground">
              Ainda não tens cosméticos desbloqueados
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              Adquire molduras de avatar patrióticas, títulos honoríficos e temas visuais na Loja Oficial para te destacares nas partidas e rankings.
            </p>
            <Link
              href="/loja"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 font-display text-xs font-black uppercase tracking-wider text-primary-foreground hover:scale-105 transition shadow-lg shadow-primary/25"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Explorar Loja</span>
            </Link>
          </div>
        )}
      </Section>

      {/* 7.1. INVENTÁRIO DE AJUDAS & CONSUMÍVEIS */}
      <Section
        title="Ajudas & Consumíveis do Quiz"
        description="Quantidades reais disponíveis na tua conta para utilização durante as partidas."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {consumablesList.map((item) => {
            const count = inventory[item.id] || 0
            const hasStock = count > 0

            return (
              <div
                key={item.id}
                className={cn(
                  'relative flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-xl transition-all shadow-md',
                  hasStock
                    ? 'border-white/15 bg-card/75'
                    : 'border-white/5 bg-card/35 opacity-70',
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-muted-foreground">
                      {formatRarityLabel(item.rarity)}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-wider',
                        hasStock
                          ? 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-white/5 text-muted-foreground/60',
                      )}
                    >
                      Qtd: {count}×
                    </span>
                  </div>

                  <h4 className="mt-3.5 font-display text-base font-bold text-foreground">
                    {item.name}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/5 pt-3 flex items-center justify-between">
                  <span className="text-[0.7rem] text-muted-foreground">
                    {hasStock ? 'Disponível no Quiz' : 'Sem stock'}
                  </span>
                  <Link
                    href="/loja"
                    className="text-[0.7rem] font-bold text-gold hover:underline flex items-center gap-1"
                  >
                    <span>Comprar</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* 8. CONQUISTAS DESBLOQUEADAS */}
      <Section
        title="Conquistas"
        description={`${player.unlockedAchievements.length} de ${ACHIEVEMENTS.length} conquistas desbloqueadas.`}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement as any}
              unlocked={player.unlockedAchievements.includes(achievement.id)}
            />
          ))}
        </div>
      </Section>

      {/* 9. TERMINAR SESSÃO */}
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-flag-red/30 bg-flag-red/10 px-5 py-4 font-bold text-flag-red transition hover:bg-flag-red/20 cursor-pointer shadow-lg"
      >
        Terminar Sessão
      </button>

      {/* Modal da Carteira com Auditoria de Transações */}
      <WalletModal open={walletOpen} onOpenChange={setWalletOpen} />
    </div>
  )
}

function StateCard({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card/70 p-8 text-center backdrop-blur shadow-xl">
      <Sparkles className="mx-auto h-7 w-7 animate-pulse text-primary" />
      <p className="mt-4 text-muted-foreground font-semibold">{text}</p>
    </div>
  )
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-flag-red/30 bg-card/70 p-7 text-center backdrop-blur shadow-xl">
      <p className="text-red-200 font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/15 cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">{title}</h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
