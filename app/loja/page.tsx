'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, User, Layers, Zap, Trophy, Globe, Check, Filter, MessageSquare, Eye, X } from 'lucide-react'
import { doc, updateDoc, setDoc, increment, arrayUnion, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { avatarShopList, type AvatarItem, type AvatarRarity, AVATAR_18_CATEGORIES } from '@/data/shopAvatars'
import { TITLE_SHOP_CATALOG, type TitleItem, type TitleGroup, type TitleRarity, getTitleRarityBadge } from '@/data/shopTitles'
import { ARENA_SHOP_CATALOG, ARENA_CATEGORIES_LIST, type ArenaItem, type ArenaRarity, type ArenaEffect, getArenaRarityBadge } from '@/data/shopArenas'
import { ArenaEffectsLayer } from '@/components/ArenaEffectsLayer'
import { AppBackground } from '@/components/AppBackground'
import { TAUNT_PACKS } from '@/data/tauntPacks'

type Category = 'vip' | 'avatars' | 'todos' | 'taunts' | 'ajudas' | 'titulos' | 'arenas'

interface ShopItem {
  id: string
  name: string
  category: Category
  categoryKey?: string
  group?: TitleGroup
  avatarCategory?: string
  avatarCategoryLabel?: string
  rarity?: AvatarRarity | TitleRarity | ArenaRarity
  description: string
  price: string
  priceValue: number
  isRealMoney?: boolean
  isExclusive?: boolean
  unlockCondition?: string
  icon?: string
  image?: string
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
  price: av.price !== null ? `€${av.price.toLocaleString('pt-PT')}` : 'POR MÉRITO',
  priceValue: av.price ?? 0,
  isExclusive: av.isExclusive,
  unlockCondition: av.unlockCondition,
  icon: av.icon,
  image: av.image,
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
  price: t.price !== null ? `€${t.price.toLocaleString('pt-PT')}` : 'POR MÉRITO',
  priceValue: t.price ?? 0,
  isExclusive: t.price === null,
  unlockCondition: t.requirement,
  image: '/images/shop/titulo-conquistador.jpg',
  badge: t.rarity,
  badgeColor: t.badgeColor,
}))

const ARENA_SHOP_ITEMS: ShopItem[] = ARENA_SHOP_CATALOG.map((a) => ({
  id: a.id,
  name: a.name,
  category: 'arenas',
  categoryKey: a.category,
  avatarCategoryLabel: a.categoryLabel,
  rarity: a.rarity,
  description: a.description,
  price: a.price !== null ? (a.price === 0 ? 'GRÁTIS' : `€${a.price.toLocaleString('pt-PT')}`) : 'POR MÉRITO',
  priceValue: a.price ?? 0,
  isExclusive: a.price === null,
  unlockCondition: a.unlockCondition,
  image: a.image,
  effect: a.effect,
  badge: a.rarity,
  badgeColor: a.badgeColor,
}))

const TAUNT_SHOP_ITEMS: ShopItem[] = TAUNT_PACKS.filter(p => !p.isFree).map((p) => ({
  id: p.id,
  name: `Pack: ${p.name}`,
  category: 'taunts',
  description: p.description,
  price: `€${p.price.toLocaleString('pt-PT')}`,
  priceValue: p.price,
  badge: 'Provocação 1v1',
  badgeColor: p.badgeColor,
  phrases: p.taunts.map((t) => t.text),
}))

const OTHER_SHOP_ITEMS: ShopItem[] = [
  // AJUDAS & UTILIDADES
  { id: 'ajuda_5050', name: 'Pack x5 Ajudas 50/50', category: 'ajudas', description: 'Elimina duas respostas erradas instantaneamente no quiz.', price: '€500', priceValue: 500, image: '/images/shop/ajuda-5050.jpg', badge: 'Consumível (+5)' },
  { id: 'ajuda_congelar', name: 'Pack x3 Congelar Tempo', category: 'ajudas', description: 'Dá +15 segundos adicionais para responder à questão.', price: '€750', priceValue: 750, image: '/images/shop/ajuda-congelar.jpg', badge: 'Consumível (+3)' },
]

const SHOP_ITEMS: ShopItem[] = [...AVATAR_SHOP_ITEMS, ...ARENA_SHOP_ITEMS, ...TITLE_SHOP_ITEMS, ...TAUNT_SHOP_ITEMS, ...OTHER_SHOP_ITEMS]

const AVATAR_CATEGORIES = AVATAR_18_CATEGORIES
const AVATAR_RARITIES: (AvatarRarity | 'todas')[] = ['todas', 'Comum', 'Raro', 'Épico', 'Lendário', 'Exclusivo']

export default function LojaPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Category>('avatars')
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState<string>('todos')
  const [avatarRarityFilter, setAvatarRarityFilter] = useState<AvatarRarity | 'todas'>('todas')
  const [titleSubFilter, setTitleSubFilter] = useState<'todos' | 'tematico' | 'competicao' | 'exclusivo'>('todos')
  const [titleThemeCategory, setTitleThemeCategory] = useState<string>('todas')
  const [arenaCategoryFilter, setArenaCategoryFilter] = useState<string>('todos')
  const [previewArenaItem, setPreviewArenaItem] = useState<ShopItem | null>(null)
  const [equippedAvatar, setEquippedAvatar] = useState<string>('/images/avatars/guardiao-vulcanico.jpg')
  const [equippedArena, setEquippedArena] = useState<string>('arena_1')
  const [equippedTitle, setEquippedTitle] = useState<string>('')
  const [userBalance, setUserBalance] = useState<number>(803845)
  const [consumables, setConsumables] = useState<{ help5050: number; freezeTime: number }>({ help5050: 5, freezeTime: 3 })
  const [inventory, setInventory] = useState<{ avatars: string[]; arenas: string[]; titles: string[] }>({
    avatars: ['guardiao-vulcanico', 'camoes-2050', 'avatar_vulcao_acores', 'avatar_camoes_2050'],
    arenas: ['arena_1', 'arena_2', 'arena_ponte_2077', 'arena_neon_2088'],
    titles: ['titulo_iniciante']
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    'guardiao-vulcanico', 
    'camoes-2050', 
    'arena_1',
    'arena_2',
    'arena_neon_2088', 
    'arena_ponte_2077', 
    'avatar_vulcao_acores', 
    'avatar_camoes_2050'
  ])
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setMounted(true)
    const syncStore = () => {
      try {
        const savedAvatar = localStorage.getItem('user_equipped_avatar')
        if (savedAvatar && !savedAvatar.includes('moldura')) setEquippedAvatar(savedAvatar)
        
        const savedArena = localStorage.getItem('equipped_arena')
        if (savedArena) setEquippedArena(savedArena)

        const savedTitle = localStorage.getItem('equipped_title')
        if (savedTitle) setEquippedTitle(savedTitle)

        const savedCoins = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
        if (savedCoins) setUserBalance(Number(savedCoins))

        const savedConsumables = localStorage.getItem('user_consumables')
        if (savedConsumables) {
          try {
            const parsedCons = JSON.parse(savedConsumables)
            if (parsedCons) setConsumables((prev) => ({ ...prev, ...parsedCons }))
          } catch (e) {
            console.error(e)
          }
        }

        const savedInventory = localStorage.getItem('user_inventory')
        if (savedInventory) {
          try {
            const parsedInv = JSON.parse(savedInventory)
            if (parsedInv) {
              setInventory((prev) => ({
                avatars: Array.from(new Set([...prev.avatars, ...(parsedInv.avatars || [])])),
                arenas: Array.from(new Set([...prev.arenas, ...(parsedInv.arenas || [])])),
                titles: Array.from(new Set([...prev.titles, ...(parsedInv.titles || [])])),
              }))
            }
          } catch (e) {
            console.error(e)
          }
        }

        const savedUnlocked = localStorage.getItem('user_unlocked_items')
        if (savedUnlocked) {
          try {
            const parsed = JSON.parse(savedUnlocked)
            if (Array.isArray(parsed)) {
              setUnlockedItems((prev) => Array.from(new Set([...prev, ...parsed])))
            }
          } catch (e) {
            console.error(e)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    syncStore()

    let unsubscribeSnapshot: (() => void) | undefined
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        unsubscribeSnapshot = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            const balance = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : null
            if (balance !== null) {
              setUserBalance(balance)
              localStorage.setItem('user_coins', String(balance))
              localStorage.setItem('user_euros', String(balance))
            }
            if (data.inventory) {
              setInventory((prev) => ({
                avatars: Array.from(new Set([...prev.avatars, ...(data.inventory.avatars || [])])),
                arenas: Array.from(new Set([...prev.arenas, ...(data.inventory.arenas || [])])),
                titles: Array.from(new Set([...prev.titles, ...(data.inventory.titles || [])])),
              }))
              localStorage.setItem('user_inventory', JSON.stringify(data.inventory))
            }
            if (data.consumables) {
              setConsumables((prev) => ({ ...prev, ...data.consumables }))
              localStorage.setItem('user_consumables', JSON.stringify(data.consumables))
            } else if (data.inventory?.utilities) {
              const utils = data.inventory.utilities
              setConsumables({
                help5050: utils.fiftyFifty || 5,
                freezeTime: utils.freezeTime || 3,
              })
            }
            if (data.equippedAvatar || data.equipped?.avatar) {
              const av = data.equipped?.avatar || data.equippedAvatar
              if (av && !av.includes('moldura')) {
                setEquippedAvatar(av)
                localStorage.setItem('user_equipped_avatar', av)
              }
            }
            if (data.equippedArena || data.equipped?.arena) {
              const ar = data.equipped?.arena || data.equippedArena
              setEquippedArena(ar)
              localStorage.setItem('equipped_arena', ar)
            }
            if (data.equippedTitle || data.equipped?.title) {
              const tit = data.equipped?.title || data.equippedTitle
              setEquippedTitle(tit)
              localStorage.setItem('equipped_title', tit)
            }
          }
        })
      } catch (e) {
        console.error(e)
      }
    }

    window.addEventListener('avatarChanged', syncStore)
    window.addEventListener('arenaChanged', syncStore)
    window.addEventListener('titleChanged', syncStore)
    window.addEventListener('consumables_updated', syncStore)
    window.addEventListener('inventory_updated', syncStore)
    window.addEventListener('balance_updated', syncStore)
    window.addEventListener('storage', syncStore)

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot()
      window.removeEventListener('avatarChanged', syncStore)
      window.removeEventListener('arenaChanged', syncStore)
      window.removeEventListener('titleChanged', syncStore)
      window.removeEventListener('consumables_updated', syncStore)
      window.removeEventListener('inventory_updated', syncStore)
      window.removeEventListener('balance_updated', syncStore)
      window.removeEventListener('storage', syncStore)
    }
  }, [])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type })
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  const isItemUnlocked = (item: ShopItem) => {
    if (item.category === 'ajudas') return false
    if (item.id === 'exclusivo_fundador' || item.id === 'tit_excl_fundador' || item.id === 'arena_excl_fundadores' || item.name === 'Fundador') {
      const isFounder = Boolean(localStorage.getItem('user_is_founder') === 'true')
      if (isFounder) return true
    }
    if (item.isExclusive) {
      if (item.category === 'titulos') {
        return (
          inventory.titles.includes(item.id) ||
          inventory.titles.includes(item.name) ||
          unlockedItems.includes(item.id) ||
          unlockedItems.includes(item.name)
        )
      }
      if (item.category === 'arenas') {
        return inventory.arenas.includes(item.id) || unlockedItems.includes(item.id)
      }
      return unlockedItems.includes(item.id) || inventory.avatars.includes(item.id)
    }
    if (item.priceValue === 0 && !item.isExclusive) return true
    if (unlockedItems.includes(item.id) || unlockedItems.includes(item.name)) return true
    if (item.category === 'avatars') {
      if (inventory.avatars.includes(item.id)) return true
      if (item.id === 'guardiao-vulcanico' && (inventory.avatars.includes('avatar_vulcao_acores') || unlockedItems.includes('avatar_vulcao_acores'))) return true
      if (item.id === 'camoes-2050' && (inventory.avatars.includes('avatar_camoes_2050') || unlockedItems.includes('avatar_camoes_2050'))) return true
      if (item.id === 'cyborg-quinas' && (inventory.avatars.includes('avatar_lenda_futebol') || unlockedItems.includes('avatar_lenda_futebol'))) return true
      if (item.id === 'fadista-cyber-alfama' && (inventory.avatars.includes('avatar_fadista_cyber') || unlockedItems.includes('avatar_fadista_cyber'))) return true
    }
    if (item.category === 'arenas' && (inventory.arenas.includes(item.id) || item.priceValue === 0)) return true
    if (item.category === 'titulos' && (inventory.titles.includes(item.id) || inventory.titles.includes(item.name))) return true
    if (item.category === 'taunts') {
      const localTaunts = JSON.parse(localStorage.getItem('user_inventory_taunts') || '["pack_basico"]')
      return item.priceValue === 0 || unlockedItems.includes(item.id) || localTaunts.includes(item.id)
    }
    return false
  }

  const isItemEquipped = (item: ShopItem) => {
    if (item.category === 'ajudas' || item.category === 'taunts') return false
    if (item.category === 'avatars') return equippedAvatar === item.image
    if (item.category === 'arenas') return equippedArena === item.id
    if (item.category === 'titulos') return equippedTitle === item.name || equippedTitle === item.id
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
        setEquippedTitle(item.name)
        localStorage.setItem('equipped_title', item.name)
        localStorage.setItem('user_equipped_title', item.name)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'equipped.title': item.name,
              equippedTitle: item.name,
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('titleChanged'))
        showToast(`Título exclusivo "${item.name}" ativado com sucesso!`)
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
    // 1. CONSUMÍVEIS (SEMPRE COMPRA)
    if (item.category === 'ajudas') {
      if (userBalance < item.priceValue) {
        showToast(`Saldo insuficiente! Precisas de mais €${(item.priceValue - userBalance).toLocaleString('pt-PT')} € Acorda.`, 'error')
        return
      }

      const newBalance = userBalance - item.priceValue
      setUserBalance(newBalance)
      localStorage.setItem('user_euros', String(newBalance))

      let updatedConsumables = { ...consumables }
      let amountAdded = 0
      let consumableKey = ''

      if (item.id === 'ajuda_5050') {
        amountAdded = 5
        consumableKey = 'consumables.help5050'
        updatedConsumables.help5050 = (updatedConsumables.help5050 || 0) + 5
      } else if (item.id === 'ajuda_congelar') {
        amountAdded = 3
        consumableKey = 'consumables.freezeTime'
        updatedConsumables.freezeTime = (updatedConsumables.freezeTime || 0) + 3
      }

      setConsumables(updatedConsumables)
      localStorage.setItem('user_consumables', JSON.stringify(updatedConsumables))

      if (auth.currentUser) {
        try {
          const updatePayload: any = {
            coins: newBalance,
            euros: newBalance,
          }
          if (item.id === 'ajuda_5050') {
            updatePayload['inventory.utilities.fiftyFifty'] = increment(5)
            updatePayload['consumables.help5050'] = increment(5)
          } else if (item.id === 'ajuda_congelar') {
            updatePayload['inventory.utilities.freezeTime'] = increment(3)
            updatePayload['consumables.freezeTime'] = increment(3)
          }
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updatePayload)
        } catch (e) {
          console.error(e)
        }
      }

      window.dispatchEvent(new Event('consumables_updated'))
      window.dispatchEvent(new Event('inventory_updated'))
      showToast(`Sucesso! Adquiriste ${item.name}! Total: ${item.id === 'ajuda_5050' ? updatedConsumables.help5050 : updatedConsumables.freezeTime}`)
      return
    }

    // 2. COSMÉTICOS (EQUIPAR SE DESBLOQUEADO, COMPRAR SE NÃO)
    const unlocked = isItemUnlocked(item)

    if (unlocked) {
      // EQUIPAR
      if (item.category === 'avatars' && item.image) {
        setEquippedAvatar(item.image)
        localStorage.setItem('user_equipped_avatar', item.image)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              equippedAvatar: item.id,
              'equipped.avatar': item.image,
              avatar: item.image,
            })
            await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
              photoURL: item.image,
              avatar: item.image,
              'equipped.avatar': item.image,
              equippedAvatar: item.id,
            }, { merge: true })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('avatarChanged'))
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
        setEquippedTitle(item.name)
        localStorage.setItem('equipped_title', item.name)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              equippedTitle: item.name,
              'equipped.title': item.name,
            })
            await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
              equippedTitle: item.name,
              'equipped.title': item.name,
              title: item.name,
            }, { merge: true })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('titleChanged'))
        showToast(`Título "${item.name}" ativado no perfil!`)
      } else if (item.category === 'taunts') {
        showToast(`Pack de provocações pronto para uso nos Duelos 1v1!`)
      }

      window.dispatchEvent(new Event('inventory_updated'))
    } else {
      // COMPRAR COSMÉTICO
      if (item.isRealMoney) {
        showToast(`Acesso antecipado em breve!`)
        return
      }

      if (userBalance < item.priceValue) {
        showToast(`Saldo insuficiente! Precisas de mais €${(item.priceValue - userBalance).toLocaleString('pt-PT')} € Acorda.`, 'error')
        return
      }

      const newBalance = userBalance - item.priceValue
      setUserBalance(newBalance)
      localStorage.setItem('user_coins', String(newBalance))
      localStorage.setItem('user_euros', String(newBalance))

      // Atualizar Inventário
      let updatedInv = { ...inventory }
      let firestoreInvField = ''

      if (item.category === 'avatars') {
        updatedInv.avatars = Array.from(new Set([...updatedInv.avatars, item.id]))
        firestoreInvField = 'inventory.avatars'
      } else if (item.category === 'arenas') {
        updatedInv.arenas = Array.from(new Set([...updatedInv.arenas, item.id]))
        firestoreInvField = 'inventory.arenas'
      } else if (item.category === 'titulos') {
        updatedInv.titles = Array.from(new Set([...updatedInv.titles, item.id]))
        firestoreInvField = 'inventory.titles'
      } else if (item.category === 'taunts') {
        const localTaunts = Array.from(new Set([...JSON.parse(localStorage.getItem('user_inventory_taunts') || '["pack_basico"]'), item.id]))
        localStorage.setItem('user_inventory_taunts', JSON.stringify(localTaunts))
        firestoreInvField = 'inventory.taunts'
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
      } else if (item.category === 'arenas') {
        setEquippedArena(item.id)
        localStorage.setItem('equipped_arena', item.id)
        if (item.image) localStorage.setItem('equipped_arena_image', item.image)
        window.dispatchEvent(new Event('arenaChanged'))
      } else if (item.category === 'titulos') {
        setEquippedTitle(item.name)
        localStorage.setItem('equipped_title', item.name)
        window.dispatchEvent(new Event('titleChanged'))
      }

      if (auth.currentUser) {
        try {
          const updatePayload: any = {
            coins: newBalance,
            euros: newBalance,
          }
          if (firestoreInvField) {
            updatePayload[firestoreInvField] = arrayUnion(item.id)
          }
          if (item.category === 'avatars') {
            updatePayload.equippedAvatar = item.id
            updatePayload['equipped.avatar'] = item.image || item.id
            updatePayload.avatar = item.image || item.id
          } else if (item.category === 'arenas') {
            updatePayload.equippedArena = item.id
            updatePayload['equipped.arena'] = item.id
          } else if (item.category === 'titulos') {
            updatePayload.equippedTitle = item.name
            updatePayload['equipped.title'] = item.name
          }
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updatePayload)
        } catch (e) {
          console.error(e)
        }
      }

      window.dispatchEvent(new Event('inventory_updated'))
      showToast(`Parabéns! Adquiriste "${item.name}" por €${item.priceValue.toLocaleString('pt-PT')}!`)
    }
  }

  if (!mounted) return <div className="min-h-screen bg-slate-950" />

  const filteredItems = SHOP_ITEMS.filter((item) => {
    if (activeTab === 'vip') return false
    if (activeTab === 'todos') return true
    if (activeTab === 'avatars') {
      if (item.category !== 'avatars') return false
      if (avatarCategoryFilter !== 'todos' && item.categoryKey !== avatarCategoryFilter) return false
      if (avatarRarityFilter !== 'todas' && item.rarity !== avatarRarityFilter) return false
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
    <div className="relative min-h-screen w-full text-white bg-slate-950 flex flex-col items-center p-4 md:p-8 overflow-x-hidden">
      {/* 1. FUNDO OFICIAL 18 (LOJA) / 19 (AJUDAS & POWER-UPS) */}
      <AppBackground variant={activeTab === 'ajudas' ? 'powerups' : 'shop'} contrastIntensity="normal" />

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
              Adquire avatares temáticos das 18 categorias, títulos, ajudas e desbloqueia troféus exclusivos por mérito.
            </p>
          </div>

          <div className="bg-black/60 border border-amber-500/40 rounded-2xl px-6 py-3 text-right shadow-inner min-w-[220px]">
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block mb-0.5">
              O TEU SALDO VIRTUAL
            </span>
            <div className="text-2xl font-black text-amber-300">
              €{userBalance.toLocaleString('pt-PT')} <span className="text-xs text-amber-400 font-bold">€ Acorda</span>
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
            <User className="w-3.5 h-3.5" /> LOJA DE AVATARES
          </button>

          <button
            onClick={() => setActiveTab('todos')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'todos'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-slate-900/70 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Todos os Itens (€ Acorda)
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
            <Sparkles className="w-3.5 h-3.5" /> EXCLUSIVOS VIP (€)
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

        {/* VIP Tab Coming Soon Teaser */}
        {activeTab === 'vip' ? (
          <div className="w-full max-w-6xl py-16 px-6 text-center rounded-3xl bg-slate-900/50 border border-amber-500/20 backdrop-blur-xl relative overflow-hidden my-6">
            {/* Glow néon âmbar */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                🔒
              </div>
              
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest uppercase">
                Acesso Antecipado
              </span>
              
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                EXCLUSIVOS VIP <span className="text-amber-400">BREVEMENTE</span>
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed">
                Estamos a preparar o Passe Fundador da Nação, pacotes de cosméticos lendários e arenas animadas com suporte a MB WAY.
              </p>
              
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Lançamento na Temporada 1
                </span>
              </div>
            </div>
          </div>
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

                return (
                  <div 
                    key={item.id}
                    className={cn(
                      "group relative flex flex-col justify-between rounded-2xl border bg-slate-900/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg",
                      isExclusive
                        ? "border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] bg-gradient-to-b from-slate-900/90 to-rose-950/20"
                        : "border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
                    )}
                  >
                    <div>
                      {/* Badge & Category Tag */}
                      <div className="flex justify-between items-center mb-2 gap-1">
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
                            {item.id === 'ajuda_5050' ? `Tens: ${consumables.help5050 || 0}` : `Tens: ${consumables.freezeTime || 0}`}
                          </span>
                        )}
                      </div>

                      {/* Image / Preview */}
                      {item.category === 'titulos' ? (
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
                          className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/60 mb-3 cursor-pointer group/arena shadow-md"
                        >
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover/arena:scale-105" 
                              onError={(e) => {
                                e.currentTarget.src = '/arenas/arena-1.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Globe className="w-8 h-8" />
                            </div>
                          )}
                          <ArenaEffectsLayer effect={item.effect || 'particles'} intensity="low" showContrastOverlay={false} className="z-10" />
                          
                          {/* Botão de Testar (canto superior direito, sem overlay escuro na imagem) */}
                          <div className="absolute top-2 right-2 z-20">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center gap-1 shadow-md opacity-90 group-hover/arena:opacity-100 transition">
                              <Eye className="w-3 h-3" /> Testar
                            </span>
                          </div>
                        </div>
                      ) : item.category === 'taunts' ? (
                        <div className="w-full h-40 rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex flex-col justify-center gap-2 overflow-hidden mb-3">
                          {(item.phrases || []).slice(0, 2).map((phrase, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "px-3 py-1.5 rounded-full bg-slate-900 text-xs font-semibold max-w-[90%] truncate shadow-sm",
                                idx % 2 === 0
                                  ? "self-start border border-cyan-500/30 text-cyan-300"
                                  : "self-end border border-amber-500/30 text-amber-300"
                              )}
                            >
                              💬 "{phrase}"
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-800/80 mb-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                              onError={(e) => {
                                e.currentTarget.src = '/images/avatars/guardiao-vulcanico.jpg'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1 mb-0.5">
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.name}
                        </h3>
                        {item.category === 'arenas' && (
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">
                            {item.effect === 'fire' ? '🔥 Fogo' : item.effect === 'lava' ? '🌋 Lava' : item.effect === 'rain' ? '🌧️ Chuva' : item.effect === 'stars' ? '⭐ Estrelas' : item.effect === 'waves' ? '🌊 Ondas' : item.effect === 'lightning' ? '⚡ Trovões' : item.effect === 'fireworks' ? '🎆 Pirotecnia' : item.effect === 'fog' ? '🌫️ Névoa' : '✨ Partículas'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
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
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-semibold text-yellow-400">
                            {item.price}
                          </span>

                          <button
                            onClick={() => handleAction(item)}
                            className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 z-20 ${
                              isConsumable
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                : isEquipped
                                ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                : isUnlocked
                                ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            }`}
                          >
                            {isConsumable ? 'Comprar' : isEquipped ? 'Equipado ✓' : isUnlocked ? 'Equipar' : 'Comprar'}
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
                style={{ backgroundImage: `url('${previewArenaItem.image || '/arenas/arena-1.jpg'}')` }}
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
                  <h3 className="text-xl font-black text-white">{previewArenaItem.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{previewArenaItem.description}</p>
                  {previewArenaItem.isExclusive && !isItemUnlocked(previewArenaItem) && (
                    <p className="text-xs font-bold text-rose-400 mt-1 flex items-center gap-1">
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
      </div>
    </div>
  )
}
