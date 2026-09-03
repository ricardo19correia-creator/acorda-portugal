'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Sparkles, User, Layers, Zap, Trophy, Globe, Check, Filter, MessageSquare, Eye, X, Coins } from 'lucide-react'
import { doc, updateDoc, setDoc, increment, arrayUnion, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { avatarShopList, type AvatarItem, type AvatarRarity, AVATAR_18_CATEGORIES } from '@/data/shopAvatars'
import {
  getAvatarById,
  getAvatarImage,
  normalizeAvatarId,
  DEFAULT_AVATAR,
  REAL_AVATARS,
} from '@/lib/avatars'
import { TITLE_SHOP_CATALOG, type TitleItem, type TitleGroup, type TitleRarity, getTitleRarityBadge } from '@/data/shopTitles'
import { shopArenas, ARENA_SHOP_CATALOG, ARENA_CATEGORIES_LIST, type ArenaItem, type ArenaRarity, type ArenaEffect, getArenaRarityBadge } from '@/data/shopArenas'
import { ArenaEffectsLayer } from '@/components/ArenaEffectsLayer'
import { AppBackground } from '@/components/AppBackground'
import { TAUNT_PACKS } from '@/data/tauntPacks'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteRarityBadge } from '@/src/data/emotes'
import { playEmoteSound } from '@/lib/sound-engine'
import { useEconomy } from '@/context/economy-context'
import { useAuth } from '@/components/auth-provider'
import {
  extractUserCoins,
  extractUserInventory,
  extractUserEquipped,
  parseSafeNumber,
  safeSyncLog,
} from '@/lib/economy-helpers'
import { ANIMATED_FRAMES, type AnimatedFrame, type FrameRarity, getFrameRarityBadge } from '@/data/frames'
import { UserAvatar } from '@/components/user-avatar'
import { DEFAULT_AVATAR_ID, STARTER_AVATAR_ID } from '@/data/constants'
import { equipTitle } from '@/lib/titles-service'
import {
  DEFAULT_STARTER_TITLE_ID,
  DEFAULT_STARTER_TITLE_NAME,
  resolvePlayerEquippedTitle,
  resolveTitle,
  isTitleOwned,
  sanitizeTitleName,
} from '@/lib/titles'
import VipShopSection from '@/components/shop/VipShopSection'
import { AID_SHOP_ITEMS } from '@/lib/shop-catalog'

type Category = 'vip' | 'avatars' | 'todos' | 'molduras' | 'taunts' | 'ajudas' | 'titulos' | 'arenas'

interface ShopItem {
  id: string
  name: string
  category: Category
  maxOwned?: number
  categoryKey?: string
  categoryTitle?: string
  group?: TitleGroup
  avatarCategory?: string
  avatarCategoryLabel?: string
  rarity?: AvatarRarity | TitleRarity | ArenaRarity | FrameRarity
  description: string
  story?: string
  accentColor?: string
  secondaryColor?: string
  price: string
  priceValue: number
  isRealMoney?: boolean
  isExclusive?: boolean
  unlockCondition?: string
  icon?: string
  image?: string
  shopImage?: string
  effect?: ArenaEffect
  badge?: string
  badgeColor?: string
  phrases?: string[]
}

const getRarityBadgeColor = (rarity: AvatarRarity) => {
  switch (rarity) {
    case 'Comum':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    case 'Raro':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    case 'Épico':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Lendário':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
    case 'Exclusivo':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
    default:
      return 'bg-slate-700 text-slate-300 border-slate-600'
  }
}

const AVATAR_SHOP_ITEMS: ShopItem[] = avatarShopList.map((av) => ({
  id: av.id,
  name: av.name,
  category: 'avatars',
  categoryKey: av.categoryKey,
  avatarCategory: av.categoryKey,
  avatarCategoryLabel: av.categoryTitle,
  rarity: av.rarity,
  description: av.description,
  price: av.price !== null ? (av.price === 0 ? 'GRÁTIS' : `${av.price.toLocaleString('pt-PT')} Moedas`) : 'POR MÉRITO',
  priceValue: av.price ?? 0,
  isExclusive: av.isExclusive,
  unlockCondition: av.unlockCondition,
  icon: av.icon,
  image: av.image ? `${av.image}?v=2` : '',
  badge: av.rarity,
  badgeColor: getRarityBadgeColor(av.rarity),
}))

const TITLE_SHOP_ITEMS: ShopItem[] = TITLE_SHOP_CATALOG.map((t) => ({
  id: t.id,
  name: t.name,
  category: 'titulos',
  categoryKey: t.categoryKey,
  group: t.group,
  avatarCategoryLabel: t.categoryTitle,
  rarity: t.rarity,
  description: t.requirement ? `Desbloqueio: ${t.requirement}` : `Título oficial exibido no teu perfil, duelos e rankings.`,
  price: t.price !== null ? (t.price === 0 ? 'GRÁTIS' : `${t.price.toLocaleString('pt-PT')} Moedas`) : 'POR MÉRITO',
  priceValue: t.price ?? 0,
  isExclusive: t.price === null,
  unlockCondition: t.requirement,
  image: '/images/shop/titulo-conquistador.jpg',
  badge: t.rarity,
  badgeColor: t.badgeColor,
}))

const ARENA_SHOP_ITEMS: ShopItem[] = shopArenas.map((a) => ({
  id: a.id,
  name: a.name,
  category: 'arenas',
  categoryKey: a.category,
  avatarCategoryLabel: a.categoryLabel,
  rarity: a.rarity,
  description: a.description,
  meaning: a.meaning,
  price: a.price !== null ? (a.price === 0 ? 'GRÁTIS' : `${a.price.toLocaleString('pt-PT')} Moedas`) : 'POR MÉRITO',
  priceValue: a.price ?? 0,
  isExclusive: a.price === null,
  unlockCondition: a.unlockCondition,
  icon: a.icon || '🏟️',
  image: a.image,
  shopImage: a.shopImage || a.image,
  gameImage: a.gameImage || a.image,
  gameBackground: a.gameBackground || a.image,
  duelBackground: a.duelBackground || a.image,
  effect: a.effect,
  badge: a.rarity,
  badgeColor: a.badgeColor,
}))

const TAUNT_SHOP_ITEMS: ShopItem[] = OFFICIAL_EMOTES.map((e) => ({
  id: e.id,
  name: e.text,
  category: 'taunts',
  categoryKey: e.category,
  rarity: e.rarity as any,
  description: `Reação oficial para duelos multiplayer 1v1 (${e.category}).`,
  price: e.price === 0 ? 'GRÁTIS' : `${e.price.toLocaleString('pt-PT')} Moedas`,
  priceValue: e.price,
  badge: e.rarity,
  badgeColor: getEmoteRarityBadge(e.rarity),
  icon: e.emoji,
  phrases: [e.text],
}))

export const FRAME_CATEGORIES_LIST = [
  { key: 'todas', title: 'Todas as Molduras', icon: '✨' },
  { key: 'elemental', title: 'Elementais', icon: '🔥' },
  { key: 'cosmico', title: 'Cósmicas & Cyber', icon: '🌌' },
  { key: 'real', title: 'Realeza & Deuses', icon: '👑' },
  { key: 'lusitano', title: 'Lusitanas & PT', icon: '🇵🇹' },
  { key: 'especial', title: 'Especiais & Arcade', icon: '👾' },
]

export const FRAME_RARITIES: (FrameRarity | 'todas')[] = ['todas', 'Raro', 'Épico', 'Lendário', 'Mítico']

export const FRAME_PREVIEW_AVATARS = [
  { id: 'equipped', label: 'O Teu Avatar Atual', icon: '👤', fallback: '/images/avatars/avatar_01.png' },
  { id: 'avatar_01', label: 'O Estratega', icon: '🧠', fallback: '/images/avatars/avatar_01.png' },
  { id: 'avatar_02', label: 'A Líder', icon: '👑', fallback: '/images/avatars/avatar_02.png' },
  { id: 'avatar_03', label: 'O Explorador', icon: '⛵', fallback: '/images/avatars/avatar_03.png' },
  { id: 'avatar_04', label: 'O Inovador', icon: '⚡', fallback: '/images/avatars/avatar_04.png' },
  { id: 'avatar_05', label: 'A Guardiã', icon: '🛡️', fallback: '/images/avatars/avatar_05.png' },
]

const FRAME_SHOP_ITEMS: ShopItem[] = ANIMATED_FRAMES.map((f) => ({
  id: f.id,
  name: f.name,
  category: 'molduras',
  categoryKey: f.categoryKey,
  categoryTitle: f.categoryTitle,
  rarity: f.rarity as any,
  description: f.description,
  story: f.story,
  accentColor: f.accentColor,
  secondaryColor: f.secondaryColor,
  price: `${f.price.toLocaleString('pt-PT')} Moedas`,
  priceValue: f.price,
  badge: f.rarity,
  badgeColor: getFrameRarityBadge(f.rarity),
  icon: f.rarity === 'Mítico' ? '🔥' : f.rarity === 'Lendário' ? '👑' : f.rarity === 'Épico' ? '✨' : '⭐',
}))

const OTHER_SHOP_ITEMS: ShopItem[] = AID_SHOP_ITEMS.map((aid) => ({
  id: aid.id,
  name: aid.name,
  category: 'ajudas',
  description: aid.description,
  price: `${aid.priceCoins?.toLocaleString('pt-PT')} Moedas`,
  priceValue: aid.priceCoins || 0,
  image: aid.asset || '/assets/shop/aids/aid-50-50.webp',
  badge: aid.badgeText || 'Ajuda',
  badgeColor: aid.badgeColor,
  icon: aid.icon || '✨',
  maxOwned: aid.maxOwned || 50,
}))

const SHOP_ITEMS: ShopItem[] = [...AVATAR_SHOP_ITEMS, ...FRAME_SHOP_ITEMS, ...ARENA_SHOP_ITEMS, ...TITLE_SHOP_ITEMS, ...TAUNT_SHOP_ITEMS, ...OTHER_SHOP_ITEMS]

const AVATAR_CATEGORIES = AVATAR_18_CATEGORIES
const AVATAR_RARITIES: (AvatarRarity | 'todas')[] = ['todas', 'Comum', 'Raro', 'Épico', 'Lendário', 'Exclusivo']

function LojaContent() {
  const { coins: userBalance, formattedCoins, deductCoins, isBalancePulsing } = useEconomy()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') as Category | null
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Category>(() => {
    if (tabParam && ['vip', 'avatars', 'todos', 'molduras', 'taunts', 'ajudas', 'titulos', 'arenas'].includes(tabParam)) {
      return tabParam
    }
    return 'avatars'
  })

  useEffect(() => {
    if (tabParam && ['vip', 'avatars', 'todos', 'molduras', 'taunts', 'ajudas', 'titulos', 'arenas'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState<string>('todos')
  const [avatarRarityFilter, setAvatarRarityFilter] = useState<AvatarRarity | 'todas'>('todas')
  const [frameCategoryFilter, setFrameCategoryFilter] = useState<string>('todas')
  const [frameRarityFilter, setFrameRarityFilter] = useState<FrameRarity | 'todas'>('todas')
  const [previewAvatarId, setPreviewAvatarId] = useState<string>('equipped')
  const [inspectingFrameItem, setInspectingFrameItem] = useState<ShopItem | null>(null)
  const [titleSubFilter, setTitleSubFilter] = useState<'todos' | 'tematico' | 'competicao' | 'exclusivo'>('todos')
  const [titleThemeCategory, setTitleThemeCategory] = useState<string>('todas')
  const [arenaCategoryFilter, setArenaCategoryFilter] = useState<string>('todos')
  const [previewArenaItem, setPreviewArenaItem] = useState<ShopItem | null>(null)
  const [equippedAvatar, setEquippedAvatar] = useState<string>(() => getAvatarImage(typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null))
  const [equippedFrame, setEquippedFrame] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_frame') : null))
  const [equippedArena, setEquippedArena] = useState<string>('arena_1')
  const [equippedTitleId, setEquippedTitleId] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('equipped_title_id') || DEFAULT_STARTER_TITLE_ID : DEFAULT_STARTER_TITLE_ID))
  const [equippedTitle, setEquippedTitle] = useState<string>(() => (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') || DEFAULT_STARTER_TITLE_NAME : DEFAULT_STARTER_TITLE_NAME))
  const [equippedTauntId, setEquippedTauntId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('equipped_taunt_id') || 'PROV_010'
    }
    return 'PROV_010'
  })
  const [equippedEmotes, setEquippedEmotes] = useState<string[]>(['PROV_010', 'emote_ola', 'emote_boa_sorte', 'emote_vamos'])
  const [testingEmoteId, setTestingEmoteId] = useState<string | null>(null)
  const [consumables, setConsumables] = useState<Record<string, number>>({
    help5050: 0,
    freezeTime: 0,
    publicVote: 0,
    hints: 0,
    secondChance: 0,
    tripleElimination: 0,
    fastAnswer: 0,
    streakProtection: 0,
  })
  const [aidStatus, setAidStatus] = useState<Record<string, {
    id?: string
    name?: string
    stock: number
    maxOwned: number
    purchasesLast24h: number
    purchaseLimit24h: number
    remainingPurchases24h: number
    is24hLimitReached?: boolean
    isStockFull?: boolean
  }>>({})

  const fetchAidStatus = async () => {
    const targetUser = user || auth.currentUser
    if (!targetUser) return
    try {
      const idToken = await targetUser.getIdToken().catch(() => null)
      if (!idToken) return
      const res = await fetch('/api/shop/purchase', {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const json = await res.json().catch(() => ({}))
        if (json.success && json.aids) {
          setAidStatus(json.aids)
        }
      }
    } catch (e) {
      console.warn('[SHOP_FETCH_STATUS_WARN]', e)
    }
  }

  const getAidStock = (itemId: string): number => {
    if (aidStatus[itemId]?.stock !== undefined) return aidStatus[itemId].stock
    if (itemId === 'AID_002' || itemId === 'aid_50_50' || itemId === 'ajuda_5050' || itemId === 'consumable_50_50' || itemId === 'help5050') return consumables.help5050 || 0
    if (itemId === 'AID_003' || itemId === 'aid_public_vote' || itemId === 'HELP_005' || itemId === 'ajuda_publico' || itemId === 'consumable_public_vote' || itemId === 'publicVote') return consumables.publicVote || 0
    if (itemId === 'AID_004' || itemId === 'aid_freeze_time' || itemId === 'ajuda_congelar' || itemId === 'consumable_congelar_tempo' || itemId === 'freezeTime') return consumables.freezeTime || 0
    if (itemId === 'AID_001' || itemId === 'aid_hint' || itemId === 'consumable_pista' || itemId === 'pista_historica') return consumables.hints || 0
    if (itemId === 'AID_005' || itemId === 'aid_second_chance') return consumables.secondChance || (rawInventory[itemId] || 0)
    if (itemId === 'AID_006' || itemId === 'aid_triple_elimination') return consumables.tripleElimination || (rawInventory[itemId] || 0)
    if (itemId === 'AID_007' || itemId === 'aid_fast_answer') return consumables.fastAnswer || (rawInventory[itemId] || 0)
    if (itemId === 'AID_008' || itemId === 'aid_streak_protection' || itemId === 'consumable_protecao_streak') return consumables.streakProtection || 0
    return rawInventory[itemId] || 0
  }
  const [inventory, setInventory] = useState<{ avatars: string[]; frames: string[]; arenas: string[]; titles: string[]; taunts: string[] }>({
    avatars: [DEFAULT_AVATAR_ID],
    frames: ['default'],
    arenas: ['arena_1'],
    titles: [DEFAULT_STARTER_TITLE_ID],
    taunts: ['pack_basico'],
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    DEFAULT_AVATAR_ID,
    'arena_1',
    DEFAULT_STARTER_TITLE_ID,
    'pack_basico',
  ])
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [rawInventory, setRawInventory] = useState<Record<string, number>>({})
  const [vipEntitlements, setVipEntitlements] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const syncStore = () => {
      try {
        const savedAvatar = localStorage.getItem('user_equipped_avatar')
        if (savedAvatar) setEquippedAvatar(getAvatarImage(savedAvatar))

        const savedFrame = localStorage.getItem('user_equipped_frame')
        if (savedFrame) setEquippedFrame(savedFrame)
        
        const savedArena = localStorage.getItem('equipped_arena')
        if (savedArena) setEquippedArena(savedArena)

        const savedTaunt = localStorage.getItem('equipped_taunt_id')
        if (savedTaunt) setEquippedTauntId(savedTaunt)

        const savedEmotes = localStorage.getItem('equipped_emotes') || localStorage.getItem('equipped_taunts')
        if (savedEmotes) {
          try { setEquippedEmotes(JSON.parse(savedEmotes)) } catch {}
        }
        const savedTitleId = localStorage.getItem('equipped_title_id') || DEFAULT_STARTER_TITLE_ID
        const savedTitle = localStorage.getItem('equipped_title') || DEFAULT_STARTER_TITLE_NAME
        if (savedTitleId) setEquippedTitleId(savedTitleId)
        if (savedTitle) setEquippedTitle(savedTitle)
      } catch (err) {
        console.error(err)
      }
    }

    syncStore()

    window.addEventListener('avatarChanged', syncStore)
    window.addEventListener('arenaChanged', syncStore)
    window.addEventListener('titleChanged', syncStore)
    window.addEventListener('tauntsChanged', syncStore)
    window.addEventListener('emotesChanged', syncStore)
    window.addEventListener('consumables_updated', syncStore)
    window.addEventListener('consumables_updated', fetchAidStatus)
    window.addEventListener('inventory_updated', syncStore)
    window.addEventListener('balance_updated', syncStore)

    return () => {
      window.removeEventListener('avatarChanged', syncStore)
      window.removeEventListener('arenaChanged', syncStore)
      window.removeEventListener('titleChanged', syncStore)
      window.removeEventListener('tauntsChanged', syncStore)
      window.removeEventListener('emotesChanged', syncStore)
      window.removeEventListener('consumables_updated', syncStore)
      window.removeEventListener('consumables_updated', fetchAidStatus)
      window.removeEventListener('inventory_updated', syncStore)
      window.removeEventListener('balance_updated', syncStore)
    }
  }, [])

  // Subscrição Reativa em Tempo Real ao Firestore baseada no utilizador autenticado
  useEffect(() => {
    const targetUid = user?.uid || auth.currentUser?.uid
    if (!targetUid) return

    let unsubscribeSnapshot: (() => void) | undefined
    try {
      const userRef = doc(db, 'users', targetUid)
      unsubscribeSnapshot = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            const invData = extractUserInventory(data)
            const equippedData = extractUserEquipped(data)

            safeSyncLog('SHOP_SNAPSHOT', {
              uid: targetUid,
              avatarsCount: invData.avatars.length,
              fromCache: snap.metadata.fromCache,
            })

            setRawInventory(invData.rawMap)
            setInventory({
              avatars: invData.avatars,
              frames: invData.frames,
              arenas: invData.arenas,
              titles: invData.titles,
              taunts: invData.taunts,
            })
            setUnlockedItems(
              Array.from(
                new Set([
                  ...invData.avatars,
                  ...invData.frames,
                  ...invData.arenas,
                  ...invData.titles,
                  ...invData.taunts,
                ]),
              ),
            )
            if (Array.isArray(data.vipEntitlements)) {
              setVipEntitlements(data.vipEntitlements)
            }
            setConsumables({
              help5050: invData.utilities.fiftyFifty,
              freezeTime: invData.utilities.freezeTime,
              publicVote: invData.utilities.publicVote,
              hints:
                parseSafeNumber(data.consumables?.hints) ??
                parseSafeNumber(invData.rawMap.consumable_pista) ??
                0,
              streakProtection:
                parseSafeNumber(data.consumables?.streakProtection) ??
                parseSafeNumber(invData.rawMap.consumable_protecao_streak) ??
                0,
              secondChance:
                parseSafeNumber(data.consumables?.secondChance) ??
                parseSafeNumber(invData.rawMap.aid_second_chance) ??
                0,
              tripleElimination:
                parseSafeNumber(data.consumables?.tripleElimination) ??
                parseSafeNumber(invData.rawMap.aid_triple_elimination) ??
                0,
              fastAnswer:
                parseSafeNumber(data.consumables?.fastAnswer) ??
                parseSafeNumber(invData.rawMap.aid_fast_answer) ??
                0,
            })

            if (equippedData.avatarImage && !equippedData.avatarImage.includes('moldura')) {
              setEquippedAvatar(equippedData.avatarImage)
            }
            if (equippedData.frameId) {
              setEquippedFrame(equippedData.frameId)
            }
            if (equippedData.arenaId) {
              setEquippedArena(equippedData.arenaId)
            }
            if (equippedData.titleId) {
              setEquippedTitleId(equippedData.titleId)
              setEquippedTitle(equippedData.titleName)
            }
            if (data.equippedTauntId || data.equipped?.taunt) {
              setEquippedTauntId(data.equippedTauntId || data.equipped?.taunt)
            }
            if (Array.isArray(data.equippedEmotes || data.equipped?.emotes || data.equipped?.taunts)) {
              setEquippedEmotes(data.equippedEmotes || data.equipped?.emotes || data.equipped?.taunts)
            }
          }
        },
        (err) => {
          console.warn('[SHOP] Aviso transitório no snapshot do utilizador:', err)
        },
      )
    } catch (e) {
      console.error('[SHOP] Erro ao subscrever snapshot da loja:', e)
    }

    void fetchAidStatus()

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot()
    }
  }, [user?.uid])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type })
    setTimeout(() => setFeedbackMessage(null), type === 'error' ? 8000 : 3500)
  }

  const formatPurchaseErrorMessage = (json: any, resStatus?: number): string => {
    const reqId = json?.requestId || 'N/A'
    const code =
      json?.error?.code ||
      (typeof json?.code === 'string' ? json.code : '') ||
      (resStatus === 401
        ? 'UNAUTHORIZED'
        : resStatus === 403
          ? 'FORBIDDEN'
          : resStatus === 404
            ? 'PRODUCT_NOT_FOUND'
            : resStatus === 409
              ? 'CONFLICT'
              : resStatus === 503
                ? 'FIRESTORE_SERVICE_UNAVAILABLE'
                : 'PURCHASE_FAILED')

    const msg =
      json?.error?.message ||
      (typeof json?.error === 'string' ? json.error : '') ||
      (typeof json?.message === 'string' ? json.message : 'Erro ao processar compra no servidor.')

    const httpText = resStatus ? ` | HTTP: ${resStatus}` : ''

    return `[${code}] ${msg}${httpText} | Req: ${reqId}`
  }

  const isItemUnlocked = (item: ShopItem) => {
    if (item.category === 'ajudas') return false
    if (item.id === 'exclusivo_fundador' || item.id === 'tit_excl_fundador' || item.id === 'arena_excl_fundadores' || item.name === 'Fundador') {
      const isFounder = Boolean(localStorage.getItem('user_is_founder') === 'true')
      if (isFounder) return true
    }
    if (item.category === 'molduras') {
      return (
        item.id === 'default' ||
        unlockedItems.includes(item.id) ||
        inventory.frames.includes(item.id) ||
        (inventory as any)?.unlockedFrames?.includes(item.id)
      )
    }
    if (item.category === 'avatars') {
      const isFree = item.id === DEFAULT_AVATAR_ID || item.id === STARTER_AVATAR_ID
      return isFree || inventory.avatars.includes(item.id) || unlockedItems.includes(item.id)
    }
    if (item.category === 'arenas') {
      const isDefault = item.id === 'arena_1'
      return isDefault || inventory.arenas.includes(item.id) || unlockedItems.includes(item.id)
    }
    if (item.category === 'titulos') {
      return isTitleOwned(inventory.titles, item.id) || unlockedItems.includes(item.id)
    }
    if (item.category === 'taunts') {
      return (
        item.id === 'pack_basico' ||
        inventory.taunts?.includes(item.id) ||
        unlockedItems.includes(item.id) ||
        DEFAULT_EQUIPPED_EMOTES.includes(item.id)
      )
    }
    return false
  }

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'ajudas') return false
    if (item.category === 'molduras') return equippedFrame === item.id
    if (item.category === 'taunts') {
      if (equippedTauntId && equippedTauntId === item.id) return true
      const active = (equippedEmotes && equippedEmotes.length > 0)
        ? equippedEmotes
        : ['PROV_010', 'emote_ola', 'emote_boa_sorte', 'emote_vamos']
      return active.includes(item.id)
    }
    if (item.category === 'avatars') return equippedAvatar === item.image || normalizeAvatarId(equippedAvatar) === normalizeAvatarId(item.id)
    if (item.category === 'arenas') return equippedArena === item.id
    if (item.category === 'titulos') {
      const resolvedTarget = resolveTitle(item.id)
      const targetCanonicalId = resolvedTarget ? resolvedTarget.id : item.id
      const targetClean = sanitizeTitleName(item.name).toLowerCase()
      const equippedClean = sanitizeTitleName(equippedTitle).toLowerCase()

      return (
        equippedTitleId === targetCanonicalId ||
        equippedTitleId === item.id ||
        equippedClean === targetClean ||
        equippedTitle === item.name ||
        resolveTitle(equippedTitleId)?.id === targetCanonicalId
      )
    }
    return false
  }

  const handleAction = async (item: ShopItem) => {
    // 0. ITENS EXCLUSIVOS POR MÉRITO
    if (item.isExclusive) {
      const unlocked = isItemUnlocked(item)
      if (!unlocked) {
        showToast(`Item exclusivo por mérito: ${item.unlockCondition}`, 'error')
        return
      }
      if (item.category === 'titulos') {
        const cleanName = sanitizeTitleName(item.name)
        setEquippedTitleId(item.id)
        setEquippedTitle(cleanName)
        if (auth.currentUser) {
          const res = await equipTitle(auth.currentUser.uid, item.id)
          if (res.success) {
            showToast(res.message)
          } else {
            showToast(res.message, 'error')
          }
        } else {
          showToast(`Título exclusivo "${cleanName}" ativado com sucesso!`)
        }
        return
      }
      if (item.category === 'arenas') {
        setEquippedArena(item.id)
        localStorage.setItem('equipped_arena', item.id)
        if (item.image) localStorage.setItem('equipped_arena_image', item.image)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'equipped.arena': item.id,
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('arenaChanged'))
        showToast(`Arena exclusiva "${item.name}" equipada no jogo!`)
        return
      }
      if (item.category === 'avatars' && item.image) {
        setEquippedAvatar(item.image)
        localStorage.setItem('user_equipped_avatar', item.image)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'equipped.avatar': item.image,
              avatar: item.image,
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('avatarChanged'))
        showToast(`Avatar exclusivo "${item.name}" equipado com sucesso!`)
        return
      }
      return
    }
    // 1. CONSUMÍVEIS (SEMPRE COMPRA VIA SERVIDOR /api/shop/purchase)
    if (item.category === 'ajudas') {
      if (!auth.currentUser) {
        showToast('Precisas de iniciar sessão para comprar.', 'error')
        return
      }

      if (userBalance < item.priceValue) {
        showToast(`Saldo insuficiente. Precisas de ${item.priceValue.toLocaleString('pt-PT')} Moedas e tens ${userBalance.toLocaleString('pt-PT')} Moedas.`, 'error')
        return
      }

      const currentAidStock = getAidStock(item.id)
      const st = aidStatus[item.id]
      const maxLimit = st?.maxOwned || item.maxOwned || 50
      if (currentAidStock >= maxLimit) {
        showToast(`Inventário cheio para «${item.name}». Já possuis ${currentAidStock} unidades (limite: ${maxLimit} un.).`, 'error')
        return
      }
      if (st && st.remainingPurchases24h <= 0) {
        showToast(`Limite de 3 compras desta ajuda nas últimas 24 horas atingido.`, 'error')
        return
      }

      try {
        const idToken = await auth.currentUser.getIdToken().catch(() => null)
        if (!idToken) {
          showToast('Sessão expirada. Inicia sessão novamente.', 'error')
          return
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        }

        const idempotencyKey =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `pur_${Date.now()}_${Math.random().toString(36).slice(2)}`

        const res = await fetch('/api/shop/purchase', {
          method: 'POST',
          headers,
          cache: 'no-store',
          body: JSON.stringify({
            productId: item.id,
            itemId: item.id,
            idempotencyKey,
          }),
        })

        const json = await res.json().catch(() => ({}))
        if (!json.success && !json.ok) {
          const errMsg = formatPurchaseErrorMessage(json, res.status)
          showToast(errMsg, 'error')
          fetchAidStatus()
          return
        }

        // Sincronizar saldo imediatamente
        if (typeof json.remainingCoins === 'number') {
          localStorage.setItem('user_coins', String(json.remainingCoins))
          localStorage.setItem('user_euros', String(json.remainingCoins))
          window.dispatchEvent(
            new CustomEvent('balance_updated', { detail: { coins: json.remainingCoins } })
          )
        }

        // Atualizar estado da ajuda no client com a resposta do servidor
        if (json.stock !== undefined) {
          setAidStatus((prev) => ({
            ...prev,
            [item.id]: {
              id: item.id,
              name: item.name,
              stock: json.stock,
              maxOwned: json.maxOwned || maxLimit,
              purchasesLast24h: json.purchasesLast24h,
              purchaseLimit24h: json.purchaseLimit24h,
              remainingPurchases24h: json.remainingPurchases24h,
              is24hLimitReached: json.remainingPurchases24h === 0,
              isStockFull: json.stock >= (json.maxOwned || maxLimit),
            },
          }))
        }

        fetchAidStatus()
        window.dispatchEvent(new Event('consumables_updated'))
        window.dispatchEvent(new Event('inventory_updated'))

        showToast(json.message || `«${item.name}» adquirida com sucesso!`)
        return
      } catch (e: any) {
        showToast(e.message || 'Erro de comunicação ao comprar.', 'error')
        return
      }
    }

    // 2. COSMÉTICOS (EQUIPAR SE DESBLOQUEADO, COMPRAR SE NÃO)
    const unlocked = isItemUnlocked(item)

    if (unlocked) {
      // EQUIPAR
      if (item.category === 'avatars') {
        const canonicalImg = getAvatarImage(item.image || item.id)
        const canonicalId = normalizeAvatarId(item.id)
        setEquippedAvatar(canonicalImg)
        localStorage.setItem('user_equipped_avatar', canonicalImg)
        localStorage.setItem('user_equipped_avatar_id', canonicalId)
        localStorage.setItem('equipped_avatar_id', canonicalId)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              equippedAvatar: canonicalId,
              avatarId: canonicalId,
              'equipped.avatar': canonicalImg,
              'equipped.avatarId': canonicalId,
              avatar: canonicalImg,
              photoURL: canonicalImg,
            })
            await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
              photoURL: canonicalImg,
              avatar: canonicalImg,
              avatarId: canonicalId,
              'equipped.avatar': canonicalImg,
              equippedAvatar: canonicalId,
            }, { merge: true })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('avatarChanged'))
        window.dispatchEvent(new Event('inventory_updated'))
        window.dispatchEvent(new Event('storage'))
        showToast(`Avatar "${item.name}" equipado com sucesso!`)
      } else if (item.category === 'arenas') {
        setEquippedArena(item.id)
        localStorage.setItem('equipped_arena', item.id)
        if (item.image) localStorage.setItem('equipped_arena_image', item.image)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              equippedArena: item.id,
              'equipped.arena': item.id,
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('arenaChanged'))
        showToast(`Arena "${item.name}" equipada no jogo!`)
      } else if (item.category === 'titulos') {
        const cleanName = sanitizeTitleName(item.name)
        setEquippedTitleId(item.id)
        setEquippedTitle(cleanName)
        if (auth.currentUser) {
          const res = await equipTitle(auth.currentUser.uid, item.id)
          if (res.success) {
            showToast(res.message)
          } else {
            showToast(res.message, 'error')
          }
        } else {
          showToast(`Título "${cleanName}" ativado no perfil!`)
        }
      } else if (item.category === 'molduras') {
        if (equippedFrame === item.id) {
          setEquippedFrame(null)
          localStorage.removeItem('user_equipped_frame')
          if (auth.currentUser) {
            try {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                equippedFrame: null,
                'equipped.frameId': null,
              })
              await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
                equippedFrame: null,
                'equipped.frameId': null,
              }, { merge: true })
            } catch (e) {
              console.error(e)
            }
          }
          window.dispatchEvent(new Event('frameChanged'))
          window.dispatchEvent(new Event('inventory_updated'))
          showToast(`Moldura "${item.name}" desequipada!`)
        } else {
          setEquippedFrame(item.id)
          localStorage.setItem('user_equipped_frame', item.id)
          if (auth.currentUser) {
            try {
              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                equippedFrame: item.id,
                'equipped.frameId': item.id,
              })
              await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
                equippedFrame: item.id,
                'equipped.frameId': item.id,
              }, { merge: true })
            } catch (e) {
              console.error(e)
            }
          }
          window.dispatchEvent(new Event('frameChanged'))
          window.dispatchEvent(new Event('inventory_updated'))
          showToast(`Moldura "${item.name}" equipada no teu avatar!`)
        }
      } else if (item.category === 'taunts') {
        let currentEquipped = [...equippedEmotes]
        if (currentEquipped.includes(item.id)) {
          if (currentEquipped.length <= 1) {
            showToast('Precisas de manter pelo menos 1 provocação equipada!', 'error')
            return
          }
          currentEquipped = currentEquipped.filter((id) => id !== item.id)
          if (equippedTauntId === item.id) {
            const nextId = currentEquipped[0] || ''
            setEquippedTauntId(nextId)
            localStorage.setItem('equipped_taunt_id', nextId)
          }
          showToast(`Provocação "${item.name}" desequipada dos 4 atalhos!`)
        } else {
          setEquippedTauntId(item.id)
          localStorage.setItem('equipped_taunt_id', item.id)
          if (currentEquipped.length >= 4) {
            currentEquipped = [item.id, currentEquipped[0], currentEquipped[1], currentEquipped[2]]
          } else {
            currentEquipped = [item.id, ...currentEquipped]
          }
          showToast(`Provocação "${item.name}" equipada com sucesso!`)
        }
        playEmoteSound(item.name)
        setEquippedEmotes(currentEquipped)
        localStorage.setItem('equipped_emotes', JSON.stringify(currentEquipped))
        localStorage.setItem('equipped_taunts', JSON.stringify(currentEquipped))
        if (auth.currentUser) {
          try {
            updateDoc(doc(db, 'users', auth.currentUser.uid), {
              equippedTauntId: item.id,
              'equipped.taunt': item.id,
              equippedEmotes: currentEquipped,
              'equipped.emotes': currentEquipped,
              equippedTaunts: currentEquipped,
              'equipped.taunts': currentEquipped,
            }).catch(() => {})
          } catch {}
        }
        window.dispatchEvent(new Event('emotesChanged'))
        window.dispatchEvent(new Event('tauntsChanged'))
        window.dispatchEvent(new Event('inventory_updated'))
      }

      window.dispatchEvent(new Event('inventory_updated'))
    } else {
      // COMPRAR COSMÉTICO (VIA SERVIDOR COM TRANSAÇÃO ATÓMICA)
      if (item.isRealMoney) {
        showToast(`Acesso antecipado em breve!`)
        return
      }

      if (!auth.currentUser) {
        showToast('Inicia sessão para adquirires cosméticos na loja.', 'error')
        return
      }

      if (item.priceValue > 0 && userBalance < item.priceValue) {
        showToast('Saldo de Moedas insuficiente!', 'error')
        return
      }

      try {
        const idToken = await auth.currentUser.getIdToken().catch(() => null)
        if (!idToken) {
          showToast('Sessão expirada. Inicia sessão novamente.', 'error')
          return
        }
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        }

        const idempotencyKey =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `pur_${Date.now()}_${Math.random().toString(36).slice(2)}`

        const res = await fetch('/api/shop/purchase', {
          method: 'POST',
          headers,
          cache: 'no-store',
          body: JSON.stringify({
            productId: item.id,
            itemId: item.id,
            idempotencyKey,
          }),
        })

        const json = await res.json().catch(() => ({}))
        if (!json.success && !json.ok) {
          const errMsg = formatPurchaseErrorMessage(json, res.status)
          showToast(errMsg, 'error')
          return
        }

        // Sincronizar saldo imediatamente
        if (typeof json.remainingCoins === 'number') {
          localStorage.setItem('user_coins', String(json.remainingCoins))
          localStorage.setItem('user_euros', String(json.remainingCoins))
          window.dispatchEvent(
            new CustomEvent('balance_updated', { detail: { coins: json.remainingCoins } })
          )
        }
      } catch (e: any) {
        showToast(e.message || 'Erro de rede ao comprar cosmético.', 'error')
        return
      }

      // Atualizar Inventário Local e Estado Reativo
      let updatedInv = { ...inventory }

      if (item.category === 'avatars') {
        updatedInv.avatars = Array.from(new Set([...updatedInv.avatars, item.id]))
      } else if (item.category === 'molduras') {
        updatedInv.frames = Array.from(new Set([...(updatedInv.frames || []), item.id]))
      } else if (item.category === 'arenas') {
        updatedInv.arenas = Array.from(new Set([...updatedInv.arenas, item.id]))
      } else if (item.category === 'titulos') {
        updatedInv.titles = Array.from(new Set([...updatedInv.titles, item.id]))
      } else if (item.category === 'taunts') {
        const localTaunts = Array.from(new Set([...JSON.parse(localStorage.getItem('user_inventory_taunts') || localStorage.getItem('user_inventory_emotes') || '[]'), item.id]))
        localStorage.setItem('user_inventory_taunts', JSON.stringify(localTaunts))
        localStorage.setItem('user_inventory_emotes', JSON.stringify(localTaunts))
        setEquippedTauntId(item.id)
        localStorage.setItem('equipped_taunt_id', item.id)
        let newEquipped = [item.id, ...equippedEmotes.filter((id) => id !== item.id)].slice(0, 4)
        setEquippedEmotes(newEquipped)
        localStorage.setItem('equipped_emotes', JSON.stringify(newEquipped))
        localStorage.setItem('equipped_taunts', JSON.stringify(newEquipped))
      }

      setInventory(updatedInv)
      localStorage.setItem('user_inventory', JSON.stringify(updatedInv))

      const updatedUnlocked = Array.from(new Set([...unlockedItems, item.id]))
      setUnlockedItems(updatedUnlocked)
      localStorage.setItem('user_unlocked_items', JSON.stringify(updatedUnlocked))

      // Auto-equipar após compra
      if (item.category === 'avatars' && item.image) {
        setEquippedAvatar(item.image)
        localStorage.setItem('user_equipped_avatar', item.image)
        window.dispatchEvent(new Event('avatarChanged'))
      } else if (item.category === 'molduras') {
        setEquippedFrame(item.id)
        localStorage.setItem('user_equipped_frame', item.id)
        window.dispatchEvent(new Event('frameChanged'))
      } else if (item.category === 'arenas') {
        setEquippedArena(item.id)
        localStorage.setItem('equipped_arena', item.id)
        if (item.image) localStorage.setItem('equipped_arena_image', item.image)
        window.dispatchEvent(new Event('arenaChanged'))
      } else if (item.category === 'titulos') {
        const cleanName = sanitizeTitleName(item.name)
        setEquippedTitleId(item.id)
        setEquippedTitle(cleanName)
        localStorage.setItem('equipped_title_id', item.id)
        localStorage.setItem('equipped_title', cleanName)
        localStorage.setItem('user_equipped_title', cleanName)
        window.dispatchEvent(new Event('titleChanged'))
      } else if (item.category === 'taunts') {
        setEquippedTauntId(item.id)
        localStorage.setItem('equipped_taunt_id', item.id)
        window.dispatchEvent(new Event('tauntsChanged'))
        window.dispatchEvent(new Event('emotesChanged'))
      }

      if (auth.currentUser) {
        try {
          const updatePayload: any = {}
          if (item.category === 'avatars') {
            updatePayload.equippedAvatar = item.id
            updatePayload['equipped.avatar'] = item.image || item.id
            updatePayload.avatar = item.image || item.id
          } else if (item.category === 'molduras') {
            updatePayload.equippedFrame = item.id
            updatePayload['equipped.frameId'] = item.id
          } else if (item.category === 'arenas') {
            updatePayload.equippedArena = item.id
            updatePayload['equipped.arena'] = item.id
          } else if (item.category === 'titulos') {
            const cleanName = sanitizeTitleName(item.name)
            updatePayload.equippedTitleId = item.id
            updatePayload.equippedTitle = cleanName
            updatePayload.title = cleanName
            updatePayload['equipped.title'] = item.id
            updatePayload['equipped.titleId'] = item.id
            updatePayload['equipped.titleName'] = cleanName
          } else if (item.category === 'taunts') {
            updatePayload.equippedTauntId = item.id
            updatePayload['equipped.taunt'] = item.id
            const newEm = [item.id, ...equippedEmotes.filter((id) => id !== item.id)].slice(0, 4)
            updatePayload.equippedEmotes = newEm
            updatePayload['equipped.emotes'] = newEm
            updatePayload['equipped.taunts'] = newEm
          }
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updatePayload)
          if (item.category === 'molduras') {
            await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
              equippedFrame: item.id,
              'equipped.frameId': item.id,
            }, { merge: true })
          } else if (item.category === 'titulos') {
            const cleanName = sanitizeTitleName(item.name)
            await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
              equippedTitleId: item.id,
              equippedTitle: cleanName,
              title: cleanName,
              updatedAt: serverTimestamp(),
            }, { merge: true })
          }
        } catch (e) {
          console.error(e)
        }
      }

      window.dispatchEvent(new Event('inventory_updated'))
      window.dispatchEvent(new Event('balance_updated'))
      showToast(`Sucesso! Adquiriste ${item.name}!`)
    }
  }

  if (!mounted) return <div className="min-h-screen bg-transparent" />

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (activeTab === 'vip') return false
    if (activeTab === 'todos') return true
    if (activeTab === 'avatars') {
      if (item.category !== 'avatars') return false
      if (avatarCategoryFilter !== 'todos' && item.categoryKey !== avatarCategoryFilter) return false
      if (avatarRarityFilter !== 'todas' && item.rarity !== avatarRarityFilter) return false
      return true
    }
    if (activeTab === 'molduras') {
      if (item.category !== 'molduras') return false
      if (frameCategoryFilter !== 'todas' && item.categoryKey !== frameCategoryFilter) return false
      if (frameRarityFilter !== 'todas' && item.rarity !== frameRarityFilter) return false
      return true
    }
    if (activeTab === 'titulos') {
      if (item.category !== 'titulos') return false
      if (titleSubFilter === 'todos') return true
      if (titleSubFilter === 'tematico') {
        if (item.group !== 'tematico') return false
        if (titleThemeCategory !== 'todas' && item.categoryKey !== titleThemeCategory) return false
        return true
      }
      if (titleSubFilter === 'competicao') {
        return ['progressao', 'competicao', 'streaks', 'precisao', 'distrito'].includes(item.group as string)
      }
      if (titleSubFilter === 'exclusivo') {
        return item.group === 'exclusivo' || item.isExclusive
      }
      return true
    }
    if (activeTab === 'arenas') {
      if (item.category !== 'arenas') return false
      if (arenaCategoryFilter === 'todos') return true
      return item.categoryKey === arenaCategoryFilter
    }
    return item.category === activeTab
  })

  return (
    <div className="relative min-h-screen w-full text-white bg-transparent flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      {/* 1. FUNDO OFICIAL (LOJA) */}
      <AppBackground />

      {/* CONTEÚDO DA LOJA POR CIMA */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Navigation & Feedback Toast */}
        <div className="w-full flex items-center justify-between mb-4">
          <Link
            href="/jogar"
            className="inline-flex items-center gap-2 text-xs font-black tracking-wider uppercase text-slate-400 hover:text-white transition-colors bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Menu
          </Link>

          {feedbackMessage && (
            <div className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl animate-fade-in ${
              feedbackMessage.type === 'success' 
                ? 'bg-emerald-500/90 text-slate-950 border border-emerald-400' 
                : 'bg-rose-500/90 text-white border border-rose-400'
            }`}>
              {feedbackMessage.text}
            </div>
          )}
        </div>

        {/* Store Header Banner */}
        <div className="w-full max-w-6xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
          <div>
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase block mb-1">
              ECONOMIA OFICIAL & MERCADO
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white">
              LOJA ACORDA PORTUGAL
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Escolhe e equipa os 9 avatares oficiais de Portugal, títulos, ajudas e cenários exclusivos para as tuas partidas.
            </p>
          </div>

          <div className="bg-black/60 border border-amber-500/40 rounded-2xl px-6 py-3 text-right shadow-inner min-w-[220px]">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block mb-0.5">
              O TEU SALDO VIRTUAL
            </span>
            <div className="flex items-center justify-end gap-1.5 text-2xl font-black text-amber-300">
              <Coins className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{userBalance.toLocaleString('pt-PT')}</span>
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider ml-1">Moedas</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="w-full max-w-6xl flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
              activeTab === 'avatars'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/70 text-cyan-400 border border-cyan-500/30 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> LOJA DE AVATARES (9)
          </button>

          <button
            onClick={() => setActiveTab('molduras')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
              activeTab === 'molduras'
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/70 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" /> MOLDURAS VIVAS ({ANIMATED_FRAMES.length})
          </button>

          <button
            onClick={() => setActiveTab('todos')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'todos'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900/70 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Todos os Itens (Moedas)
          </button>

          <button
            onClick={() => setActiveTab('ajudas')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'ajudas'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Ajudas & Utilidades
          </button>

          <button
            onClick={() => setActiveTab('titulos')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'titulos'
                ? 'bg-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'bg-slate-900/70 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Títulos
          </button>

          <button
            onClick={() => setActiveTab('arenas')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'arenas'
                ? 'bg-blue-500 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'bg-slate-900/70 text-blue-400 border border-blue-500/30 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Arenas de Jogo
          </button>

          <button
            onClick={() => setActiveTab('taunts')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'taunts'
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-slate-900/70 text-rose-300 border border-rose-500/30 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Provocações 1v1
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
              activeTab === 'vip'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900/70 text-amber-400 border border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> EXCLUSIVOS VIP (€ Real)
          </button>
        </div>

        {/* SUB-FILTROS DE AVATARES (18 CATEGORIAS + EXCLUSIVOS & 5 RARIDADES) */}
        {activeTab === 'avatars' && (
          <div className="w-full max-w-6xl space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            {/* Categorias Temáticas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Categoria:
              </span>
              {AVATAR_CATEGORIES.map((cat) => {
                const isSelected = avatarCategoryFilter === cat.key
                const isExclusives = cat.key === 'exclusivos'

                return (
                  <button
                    key={cat.key}
                    onClick={() => setAvatarCategoryFilter(cat.key)}
                    className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isExclusives
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] font-black'
                          : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)] font-black'
                        : isExclusives
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Raridades */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1.5 border-t border-slate-800/60 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Raridade:
              </span>
              {AVATAR_RARITIES.map((rarity) => {
                const isSelected = avatarRarityFilter === rarity
                let badgeStyle = 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'

                if (isSelected) {
                  switch (rarity) {
                    case 'Comum':
                      badgeStyle = 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      break
                    case 'Raro':
                      badgeStyle = 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      break
                    case 'Épico':
                      badgeStyle = 'bg-purple-500 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      break
                    case 'Lendário':
                      badgeStyle = 'bg-amber-500 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      break
                    case 'Exclusivo':
                      badgeStyle = 'bg-rose-500 text-white font-black shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                      break
                    default:
                      badgeStyle = 'bg-white text-slate-950 font-black'
                  }
                }

                return (
                  <button
                    key={rarity}
                    onClick={() => setAvatarRarityFilter(rarity)}
                    className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${badgeStyle}`}
                  >
                    {rarity === 'todas' ? 'Todas' : rarity}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* SUB-FILTROS DE MOLDURAS VIVAS (COLEÇÃO, RARIDADE & TESTE DE AVATAR) */}
        {activeTab === 'molduras' && (
          <div className="w-full max-w-6xl space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/70 border border-purple-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            {/* Categorias Temáticas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 shrink-0 mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-400" /> Coleção:
              </span>
              {FRAME_CATEGORIES_LIST.map((cat) => {
                const isSelected = frameCategoryFilter === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFrameCategoryFilter(cat.key)}
                    className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] font-black'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.title}</span>
                  </button>
                )
              })}
            </div>

            {/* Raridades */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1.5 border-t border-slate-800/60 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Raridade:
              </span>
              {FRAME_RARITIES.map((rarity) => {
                const isSelected = frameRarityFilter === rarity
                let badgeStyle = 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'

                if (isSelected) {
                  switch (rarity) {
                    case 'Mítico':
                      badgeStyle = 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white font-black shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse'
                      break
                    case 'Lendário':
                      badgeStyle = 'bg-amber-500 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      break
                    case 'Épico':
                      badgeStyle = 'bg-purple-500 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      break
                    case 'Raro':
                      badgeStyle = 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      break
                    default:
                      badgeStyle = 'bg-white text-slate-950 font-black'
                  }
                }

                return (
                  <button
                    key={rarity}
                    onClick={() => setFrameRarityFilter(rarity)}
                    className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${badgeStyle}`}
                  >
                    {rarity === 'todas' ? 'Todas as Raridades' : rarity}
                  </button>
                )
              })}
            </div>

            {/* Seletor de Avatar de Pré-Visualização */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1.5 border-t border-slate-800/60 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 shrink-0 mr-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-400" /> Testar no Avatar:
              </span>
              {FRAME_PREVIEW_AVATARS.map((av) => {
                const isSelected = previewAvatarId === av.id
                return (
                  <button
                    key={av.id}
                    onClick={() => setPreviewAvatarId(av.id)}
                    className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-500 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 border border-slate-700/40'
                    }`}
                  >
                    <span>{av.icon}</span>
                    <span>{av.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* SUB-FILTROS DE TÍTULOS (TODOS, TEMÁTICAS, COMPETIÇÃO & PERFIL, EXCLUSIVOS) */}
        {activeTab === 'titulos' && (
          <div className="w-full max-w-6xl space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            {/* Grupo de Títulos */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-yellow-400" /> Grupo:
              </span>
              {[
                { key: 'todos', label: '✨ Todos os Títulos' },
                { key: 'tematico', label: '🏛️ Categorias Temáticas (18 Temas)' },
                { key: 'competicao', label: '⚔️ Competição & Perfil' },
                { key: 'exclusivo', label: '👑 Exclusivos de Mérito' },
              ].map((filter) => {
                const isSelected = titleSubFilter === filter.key
                const isExcl = filter.key === 'exclusivo'
                return (
                  <button
                    key={filter.key}
                    onClick={() => setTitleSubFilter(filter.key as any)}
                    className={`cursor-pointer shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isExcl
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] font-black'
                          : 'bg-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(234,179,8,0.4)] font-black'
                        : isExcl
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{filter.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Se o filtro temático estiver ativo, exibir seletor das 18 categorias */}
            {titleSubFilter === 'tematico' && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1.5 border-t border-slate-800/60 scrollbar-none">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                  Tema:
                </span>
                <button
                  onClick={() => setTitleThemeCategory('todas')}
                  className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    titleThemeCategory === 'todas'
                      ? 'bg-yellow-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                  }`}
                >
                  Todos os Temas
                </button>
                {AVATAR_18_CATEGORIES.filter((c) => c.key !== 'todos' && c.key !== 'exclusivos').map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setTitleThemeCategory(c.key)}
                    className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                      titleThemeCategory === c.key
                        ? 'bg-yellow-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.title.replace(/^[^a-zA-ZÀ-ÿ0-9]+\s*/, '')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-FILTROS DE ARENAS DE JOGO */}
        {activeTab === 'arenas' && (
          <div className="w-full max-w-6xl space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-400" /> Coleção:
              </span>
              {ARENA_CATEGORIES_LIST.map((cat) => {
                const isSelected = arenaCategoryFilter === cat.key
                const isExcl = cat.key === 'exclusivas'
                return (
                  <button
                    key={cat.key}
                    onClick={() => setArenaCategoryFilter(cat.key)}
                    className={`cursor-pointer shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? isExcl
                          ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] font-black'
                          : 'bg-blue-500 text-slate-950 shadow-[0_0_12px_rgba(59,130,246,0.4)] font-black'
                        : isExcl
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* VIP Section Oficial (€ Real) */}
        {activeTab === 'vip' ? (
          <VipShopSection
            userId={auth.currentUser?.uid}
            userEmail={auth.currentUser?.email || undefined}
            equippedAvatar={equippedAvatar}
            equippedFrame={equippedFrame || 'default'}
            equippedTitle={equippedTitle}
            equippedArena={equippedArena}
            userInventory={rawInventory}
            vipEntitlements={vipEntitlements}
            onSuccessToast={(msg) => showToast(msg)}
            onErrorToast={(msg) => showToast(msg, 'error')}
            onRefreshData={() => {
              if (auth.currentUser?.uid) {
                // Sincronização em tempo real via snapshot
              }
            }}
          />
        ) : (
          /* Items Grid */
          <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
                <p className="text-sm font-medium">Nenhum item encontrado com os filtros selecionados.</p>
                <button
                  onClick={() => {
                    setAvatarCategoryFilter('todos')
                    setAvatarRarityFilter('todas')
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition cursor-pointer"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isConsumable = item.category === 'ajudas'
                const isUnlocked = isItemUnlocked(item)
                const isEquipped = isItemEquipped(item)
                const isExclusive = item.isExclusive
                const isPremiumAid = item.id === 'AID_003'

                return (
                  <div 
                    key={item.id}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-2xl border bg-slate-900/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg",
                      isExclusive
                        ? "border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] bg-gradient-to-b from-slate-900/90 to-rose-950/20"
                        : isPremiumAid
                          ? "border-purple-500/60 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] bg-gradient-to-b from-slate-900/90 via-purple-950/25 to-slate-900/90"
                          : "border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
                    )}
                  >
                    <div>
                      {/* Badge & Category Tag com Altura Reservada */}
                      <div className="flex justify-between items-center mb-2 gap-1 min-h-[24px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.badge && (
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                          {item.avatarCategoryLabel && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                              {item.avatarCategoryLabel}
                            </span>
                          )}
                        </div>

                        {isUnlocked && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> Desbloqueado
                          </span>
                        )}
                        {isConsumable && (
                          <span className="text-[10px] font-bold text-amber-400 shrink-0">
                            Tens: {getAidStock(item.id)}
                          </span>
                        )}
                      </div>

                      {/* Image / Preview */}
                      {item.category === 'molduras' ? (
                        <div 
                          onClick={() => setInspectingFrameItem(item)}
                          className="relative aspect-square w-full rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/30 p-4 flex flex-col items-center justify-center overflow-hidden mb-3 shadow-inner group/frame cursor-pointer transition-all hover:border-purple-400"
                        >
                          {/* Ambient Glow */}
                          <div
                            className="pointer-events-none absolute -inset-4 opacity-35 blur-2xl transition-opacity group-hover/frame:opacity-75"
                            style={{
                              background: item.accentColor
                                ? `radial-gradient(circle, ${item.accentColor} 0%, transparent 70%)`
                                : 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
                            }}
                          />

                          {/* Avatar com Moldura */}
                          <div className="relative z-10 w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover/frame:scale-105">
                            <UserAvatar
                              avatarUrl={
                                previewAvatarId === 'equipped'
                                  ? equippedAvatar
                                  : REAL_AVATARS.find((a) => a.id === previewAvatarId)?.image || equippedAvatar
                              }
                              activeFrame={item.id}
                              size="lg"
                              showBadge={false}
                            />
                          </div>

                          {/* Tag de raridade & Botão Inspecionar */}
                          <div className="absolute top-2 right-2 z-20">
                            <span className="px-2 py-0.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white font-black text-[10px] flex items-center gap-1 shadow-md backdrop-blur-sm group-hover/frame:opacity-100 transition">
                              <Eye className="w-3 h-3" /> Inspecionar
                            </span>
                          </div>

                          <span className="mt-2 text-[10px] font-black uppercase tracking-wider text-purple-300 z-10 flex items-center gap-1">
                            <span>{item.icon}</span>
                            <span>{item.categoryTitle || 'Moldura Viva'}</span>
                          </span>
                        </div>
                      ) : item.category === 'titulos' ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-slate-800 mb-3 flex flex-col items-center justify-center p-3 text-center shadow-inner group-hover:border-yellow-500/50 transition-colors">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-yellow-400" /> TÍTULO OFICIAL
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border shadow-md ${
                            item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            « {item.name} »
                          </span>
                        </div>
                      ) : item.category === 'arenas' ? (
                        <div 
                          onClick={() => setPreviewArenaItem(item)}
                          className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/60 mb-3 cursor-pointer group/arena shadow-md bg-slate-950"
                        >
                          <img 
                            src={item.image || (item as any).shopImage || ''} 
                            alt={item.name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/arena:scale-105" 
                          />
                          <ArenaEffectsLayer effect={item.effect || 'particles'} intensity="low" showContrastOverlay={false} className="z-10" />
                          
                          {/* Botão de Testar */}
                          <div className="absolute top-2 right-2 z-20">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white font-black text-[10px] flex items-center gap-1 shadow-md backdrop-blur-sm group-hover/arena:opacity-100 transition">
                              <Eye className="w-3 h-3" /> Testar
                            </span>
                          </div>
                        </div>
                      ) : item.category === 'taunts' ? (
                        <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 border border-purple-500/30 p-4 flex flex-col items-center justify-center overflow-hidden mb-3 group/emote shadow-inner">
                          {/* Animated Preview Bubble */}
                          <div className={cn(
                            "transition-all duration-300 transform",
                            testingEmoteId === item.id ? "scale-115 animate-bounce" : "scale-100"
                          )}>
                            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-900/90 border border-cyan-400/50 px-4 py-2.5 shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md">
                              <span className="text-3xl filter drop-shadow">{item.icon || '👑'}</span>
                              {item.id === 'PROV_010' ? (
                                <h3 className="taunt-title text-center text-cyan-400 font-extrabold leading-tight text-xs sm:text-sm">
                                  QUEM MANDA AQUI<br/>SOY YOO
                                </h3>
                              ) : (
                                <h3 className="taunt-title text-center text-cyan-400 font-extrabold leading-tight text-xs sm:text-sm">
                                  {item.name.replace(/^[\p{Emoji}\s]+/u, '')}
                                </h3>
                              )}
                            </div>
                          </div>

                          {/* Testar Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              playEmoteSound(item.name)
                              setTestingEmoteId(item.id)
                              setTimeout(() => setTestingEmoteId(null), 2500)
                            }}
                            className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer z-20"
                          >
                            <Sparkles className="w-3 h-3 text-purple-200" />
                            <span>{testingEmoteId === item.id ? 'A Testar...' : 'Testar'}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800/80 mb-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_AVATAR.image
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Título com line-clamp-1 e tooltip */}
                      <div className="flex items-center justify-between mt-1 mb-0.5 min-h-[24px]">
                        <h3 
                          className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 truncate"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        {item.category === 'arenas' && (
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1.5 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                            {item.effect === 'fire' ? '🔥 Fogo' : item.effect === 'lava' ? '🌋 Lava' : item.effect === 'rain' ? '🌧️ Chuva' : item.effect === 'stars' ? '⭐ Estrelas' : item.effect === 'waves' ? '🌊 Ondas' : item.effect === 'lightning' ? '⚡ Trovões' : item.effect === 'fireworks' ? '🎆 Pirotecnia' : item.effect === 'fog' ? '🌫️ Névoa' : '✨ Partículas'}
                          </span>
                        )}
                      </div>

                      {/* Descrição com altura fixa line-clamp-2 min-h-[40px] */}
                      <p 
                        className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-[40px] leading-relaxed"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                      {item.category === 'arenas' && (item as any).meaning && (
                        <p 
                          className="mt-1.5 text-[11px] text-amber-300/90 italic font-medium border-l-2 border-amber-500/50 pl-2 leading-snug line-clamp-1 truncate"
                          title={(item as any).meaning}
                        >
                          “{(item as any).meaning}”
                        </p>
                      )}
                    </div>

                    {/* Ação e Preço / Condição de Mérito */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      {isExclusive && !isUnlocked ? (
                        <div className="space-y-2">
                          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-300 flex items-center gap-1.5 leading-tight">
                            <span>{item.icon || '🏅'}</span>
                            <span className="truncate">{item.unlockCondition}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black text-rose-400 uppercase tracking-wider">
                              POR MÉRITO
                            </span>
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-500/15 text-[11px] font-black uppercase text-rose-300 shadow-sm select-none">
                              <span>🔒</span>
                              <span>Desbloquear por Desafio</span>
                            </div>
                          </div>
                        </div>
                      ) : isConsumable ? (
                        (() => {
                          const st = aidStatus[item.id]
                          const aidStock = typeof st?.stock === 'number' ? st.stock : getAidStock(item.id)
                          const maxLimit = typeof st?.maxOwned === 'number' ? st.maxOwned : (item.maxOwned || 50)
                          const purchases24h = typeof st?.purchasesLast24h === 'number' ? st.purchasesLast24h : 0
                          const limit24h = typeof st?.purchaseLimit24h === 'number' ? st.purchaseLimit24h : 3
                          const remaining24h = typeof st?.remainingPurchases24h === 'number' ? st.remainingPurchases24h : Math.max(0, limit24h - purchases24h)

                          const is24hLimitReached = Boolean(st?.is24hLimitReached || remaining24h <= 0 || purchases24h >= limit24h)
                          const isStockFull = Boolean(st?.isStockFull || aidStock >= maxLimit)
                          const isDisabled = is24hLimitReached || isStockFull

                          return (
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 font-mono text-sm font-black text-amber-400">
                                  {item.priceValue > 0 && <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  <span>{item.price}</span>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 mt-0.5">
                                  Tens: <strong className={isStockFull ? 'text-amber-400 font-black' : 'text-cyan-400'}>{aidStock}</strong> / {maxLimit}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Compras últimas 24h: <strong className={is24hLimitReached ? 'text-rose-400 font-black' : 'text-amber-300'}>{purchases24h}</strong> / {limit24h}
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => handleAction(item)}
                                className={`rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 z-20 ${
                                  is24hLimitReached
                                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60 cursor-not-allowed select-none shadow-none text-[10px] leading-tight text-center'
                                    : isStockFull
                                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed select-none'
                                    : 'cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                }`}
                              >
                                {is24hLimitReached
                                  ? 'Compras 24h Esgotadas'
                                  : isStockFull
                                  ? 'Inventário Cheio'
                                  : 'Comprar'}
                              </button>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 font-mono text-sm font-black text-amber-400">
                            {item.priceValue > 0 && <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            <span>{item.price}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAction(item)}
                            className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 z-20 ${
                              isEquipped
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)] ring-1 ring-emerald-400/50'
                                : isUnlocked
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                                : item.price === 'GRÁTIS'
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            }`}
                          >
                            {isEquipped ? 'Equipado ✅' : isUnlocked ? 'Equipar' : item.price === 'GRÁTIS' ? 'Ativar Grátis' : 'Comprar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* MODAL DE PRÉ-VISUALIZAÇÃO DE ARENA COM EFEITOS DINÂMICOS */}
        {previewArenaItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-blue-500/40 bg-slate-950 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              {/* Arena Background Layer with Particle Engine */}
              <div 
                className="relative h-72 sm:h-96 w-full bg-cover bg-center overflow-hidden flex flex-col justify-between p-6"
                style={{
                  backgroundImage: `url('${(previewArenaItem as any).gameBackground || previewArenaItem.image || (previewArenaItem as any).shopImage || ''}')`,
                }}
              >
                <ArenaEffectsLayer effect={previewArenaItem.effect || 'particles'} intensity="high" showContrastOverlay={false} />
                
                {/* Header Preview */}
                <div className="relative z-20 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md backdrop-blur-md ${
                    previewArenaItem.badgeColor || 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    {previewArenaItem.badge} • {previewArenaItem.avatarCategoryLabel}
                  </span>
                  
                  <button
                    onClick={() => setPreviewArenaItem(null)}
                    className="p-2 rounded-xl bg-black/60 border border-white/20 text-white hover:bg-black/90 transition cursor-pointer backdrop-blur-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mock Question Preview HUD */}
                <div className="relative z-20 max-w-lg mx-auto w-full rounded-2xl bg-slate-950/80 border border-white/15 p-4 backdrop-blur-md text-center shadow-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    SIMULAÇÃO DE DUELO 1V1
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Qual foi a primeira capital de Portugal após a fundação da nacionalidade?
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/20 py-2 text-xs font-bold text-emerald-300">
                      A) Guimarães ✓
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 py-2 text-xs font-medium text-slate-300">
                      B) Coimbra
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="relative z-20 flex items-center justify-between text-xs text-slate-300">
                  <span className="bg-black/60 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                    Efeito: <strong className="text-white capitalize">{previewArenaItem.effect || 'Partículas'}</strong>
                  </span>
                  <span className="bg-black/60 px-3 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                    {previewArenaItem.isExclusive ? 'Mérito / Conquista' : previewArenaItem.price}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>{(previewArenaItem as any).icon || '🏛️'}</span>
                    <span>{previewArenaItem.name}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{previewArenaItem.description}</p>
                  {(previewArenaItem as any).meaning && (
                    <p className="text-xs font-bold text-amber-300 italic mt-1.5 border-l-2 border-amber-500/60 pl-2 leading-relaxed">
                      “{(previewArenaItem as any).meaning}”
                    </p>
                  )}
                  {previewArenaItem.isExclusive && !isItemUnlocked(previewArenaItem) && (
                    <p className="text-xs font-bold text-rose-400 mt-2 flex items-center gap-1">
                      <span>🔒 Requisito:</span> {previewArenaItem.unlockCondition}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setPreviewArenaItem(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Fechar
                  </button>

                  <button
                    onClick={() => {
                      handleAction(previewArenaItem)
                      if (isItemUnlocked(previewArenaItem)) {
                        setPreviewArenaItem(null)
                      }
                    }}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      isItemEquipped(previewArenaItem)
                        ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isItemUnlocked(previewArenaItem)
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : previewArenaItem.isExclusive
                        ? 'bg-rose-500/30 border border-rose-500/50 text-rose-300 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    {isItemEquipped(previewArenaItem)
                      ? 'Equipada ✓'
                      : isItemUnlocked(previewArenaItem)
                      ? 'Equipar Arena'
                      : previewArenaItem.isExclusive
                      ? '🔒 Bloqueada'
                      : `Comprar ${previewArenaItem.price}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* MODAL DE INSPEÇÃO E PRÉ-VISUALIZAÇÃO DE MOLDURAS VIVAS */}
        {inspectingFrameItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-purple-500/40 bg-slate-950 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
              {/* Top ambient glow */}
              <div 
                className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-40 blur-3xl"
                style={{
                  background: inspectingFrameItem.accentColor
                    ? `radial-gradient(circle, ${inspectingFrameItem.accentColor} 0%, transparent 70%)`
                    : 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
                }}
              />

              {/* Modal Header */}
              <div className="relative z-20 flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md ${
                    inspectingFrameItem.badgeColor || 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  }`}>
                    {inspectingFrameItem.badge} • {inspectingFrameItem.categoryTitle || 'Moldura Viva'}
                  </span>
                </div>
                
                <button
                  onClick={() => setInspectingFrameItem(null)}
                  className="p-2 rounded-xl bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Frame Visual Showcase */}
              <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
                <div className="w-36 h-36 flex items-center justify-center mb-6">
                  <UserAvatar
                    avatarUrl={
                      previewAvatarId === 'equipped'
                        ? equippedAvatar
                        : REAL_AVATARS.find((a) => a.id === previewAvatarId)?.image || equippedAvatar
                    }
                    activeFrame={inspectingFrameItem.id}
                    size="xl"
                    showBadge={false}
                  />
                </div>

                {/* Avatar Switcher in Modal */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 scrollbar-none mb-4">
                  <span className="text-[10px] font-bold text-slate-400 px-2 shrink-0">Avatar:</span>
                  {FRAME_PREVIEW_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setPreviewAvatarId(av.id)}
                      className={`cursor-pointer shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                        previewAvatarId === av.id
                          ? 'bg-purple-500 text-white font-black shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{av.icon}</span>
                      <span>{av.label.replace('O Teu Avatar Atual', 'Meu Avatar')}</span>
                    </button>
                  ))}
                </div>

                <h3 className="text-xl font-black text-white text-center flex items-center gap-2">
                  <span>{inspectingFrameItem.icon}</span>
                  <span>{inspectingFrameItem.name}</span>
                </h3>
                <p className="text-xs text-slate-300 text-center max-w-md mt-1.5 leading-relaxed">
                  {inspectingFrameItem.description}
                </p>
                {inspectingFrameItem.story && (
                  <p className="text-xs font-bold text-purple-300 italic text-center max-w-md mt-2 border-l-2 border-purple-500/50 pl-3 leading-relaxed">
                    “{inspectingFrameItem.story}”
                  </p>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 font-mono text-base font-black text-amber-400">
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{inspectingFrameItem.price}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInspectingFrameItem(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Fechar
                  </button>

                  <button
                    onClick={() => {
                      handleAction(inspectingFrameItem)
                      if (isItemUnlocked(inspectingFrameItem)) {
                        setInspectingFrameItem(null)
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      isItemEquipped(inspectingFrameItem)
                        ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isItemUnlocked(inspectingFrameItem)
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    {isItemEquipped(inspectingFrameItem)
                      ? 'Equipada ✓'
                      : isItemUnlocked(inspectingFrameItem)
                      ? 'Equipar Moldura'
                      : `Comprar ${inspectingFrameItem.price}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LojaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
        </div>
      }
    >
      <LojaContent />
    </Suspense>
  )
}

