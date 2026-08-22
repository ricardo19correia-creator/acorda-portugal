'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Trophy, Zap, Shield, Flame, Award, 
  ShoppingBag, Swords, CheckCircle2, Lock, Sparkles, MapPin, Check, Plus, Globe, Palette, User, Eye
} from 'lucide-react'
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { UserAvatar } from '@/components/user-avatar'
import { avatarShopList, type AvatarItem } from '@/data/shopAvatars'
import { TITLE_SHOP_CATALOG, type TitleItem } from '@/data/shopTitles'
import { ARENA_SHOP_CATALOG, type ArenaItem } from '@/data/shopArenas'
import { ArenaEffectsLayer } from '@/components/ArenaEffectsLayer'

interface InventoryItem {
  id: string
  name: string
  category: 'avatars' | 'arenas' | 'titulos'
  description: string
  image?: string
  badge?: string
  badgeColor?: string
  effect?: string
}

const getAvatarBadgeColor = (rarity: string) => {
  switch (rarity) {
    case 'Exclusivo':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    case 'Lendário':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    case 'Épico':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    case 'Raro':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40'
  }
}

// Catálogo Global Unificado para cruzamento de inventário
const MASTER_PROFILE_CATALOG: InventoryItem[] = [
  ...avatarShopList.map((a) => ({
    id: a.id,
    name: a.name,
    category: 'avatars' as const,
    description: a.description,
    image: a.image,
    badge: a.rarity,
    badgeColor: getAvatarBadgeColor(a.rarity),
  })),
  ...ARENA_SHOP_CATALOG.map((ar) => ({
    id: ar.id,
    name: ar.name,
    category: 'arenas' as const,
    description: ar.description,
    image: ar.image,
    badge: ar.rarity,
    badgeColor: ar.badgeColor,
    effect: ar.effect,
  })),
  ...TITLE_SHOP_CATALOG.map((t) => ({
    id: t.id,
    name: t.name,
    category: 'titulos' as const,
    description: t.requirement || 'Título oficial concedido ao jogador.',
    image: '/images/shop/titulo-conquistador.jpg',
    badge: t.rarity,
    badgeColor: t.badgeColor,
  })),
]

export default function PerfilPage() {
  const [mounted, setMounted] = useState(false)
  const [avatar, setAvatar] = useState<string>('/images/avatars/guardiao-vulcanico.jpg')
  const [equippedAvatarId, setEquippedAvatarId] = useState<string>('guardiao-vulcanico')
  const [arena, setArena] = useState<string>('arena_ponte_2077')
  const [title, setTitle] = useState<string>('Filho de Portugal')
  const [userCoins, setUserCoins] = useState<number>(803845)
  const [activeTab, setActiveTab] = useState<'inventario' | 'conquistas' | 'historico'>('inventario')
  const [inventoryFilter, setInventoryFilter] = useState<'todos' | 'avatars' | 'arenas' | 'titulos'>('todos')
  
  const [consumables, setConsumables] = useState<{ help5050: number; freezeTime: number }>({ help5050: 5, freezeTime: 3 })
  const [inventory, setInventory] = useState<{ avatars: string[]; arenas: string[]; titles: string[]; taunts?: string[] }>({
    avatars: ['guardiao-vulcanico', 'camoes-2050', 'avatar_vulcao_acores', 'avatar_camoes_2050'],
    arenas: ['arena_ponte_2077', 'arena_neon_2088'],
    titles: ['tit_filho_portugal', 'tit_novico', 'Filho de Portugal', 'Noviço da Nação']
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    'guardiao-vulcanico', 
    'camoes-2050', 
    'arena_neon_2088', 
    'arena_ponte_2077', 
    'avatar_vulcao_acores', 
    'avatar_camoes_2050',
    'tit_filho_portugal',
    'Filho de Portugal'
  ])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    setMounted(true)
    const syncProfile = () => {
      try {
        const savedAvatar = localStorage.getItem('user_equipped_avatar')
        if (savedAvatar && !savedAvatar.includes('moldura')) {
          setAvatar(savedAvatar)
        } else {
          setAvatar('/images/avatars/guardiao-vulcanico.jpg')
        }

        const savedAvatarId = localStorage.getItem('equipped_avatar_id')
        if (savedAvatarId) setEquippedAvatarId(savedAvatarId)

        const savedArena = localStorage.getItem('equipped_arena')
        if (savedArena) setArena(savedArena)

        const savedTitle = localStorage.getItem('equipped_title')
        if (savedTitle) setTitle(savedTitle)

        const savedCoins = localStorage.getItem('user_coins') || localStorage.getItem('user_euros')
        if (savedCoins) setUserCoins(Number(savedCoins))

        const savedConsumables = localStorage.getItem('user_consumables')
        if (savedConsumables) {
          try {
            const parsed = JSON.parse(savedConsumables)
            if (parsed) setConsumables((prev) => ({ ...prev, ...parsed }))
          } catch (e) {
            console.error(e)
          }
        }

        const savedInventory = localStorage.getItem('user_inventory')
        if (savedInventory) {
          try {
            const parsed = JSON.parse(savedInventory)
            if (parsed) {
              setInventory((prev) => ({
                avatars: Array.from(new Set([...prev.avatars, ...(parsed.avatars || [])])),
                arenas: Array.from(new Set([...prev.arenas, ...(parsed.arenas || [])])),
                titles: Array.from(new Set([...prev.titles, ...(parsed.titles || [])])),
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
      } catch (err) {
        console.error(err)
      }
    }

    syncProfile()

    // Firestore Realtime Listener
    let unsubscribeSnapshot: (() => void) | undefined
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        unsubscribeSnapshot = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            const coinsVal = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : null
            if (coinsVal !== null) {
              setUserCoins(coinsVal)
              localStorage.setItem('user_coins', String(coinsVal))
              localStorage.setItem('user_euros', String(coinsVal))
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
            if (data.inventory) {
              setInventory((prev) => ({
                avatars: Array.from(new Set([...prev.avatars, ...(data.inventory.avatars || [])])),
                arenas: Array.from(new Set([...prev.arenas, ...(data.inventory.arenas || [])])),
                titles: Array.from(new Set([...prev.titles, ...(data.inventory.titles || [])])),
              }))
              localStorage.setItem('user_inventory', JSON.stringify(data.inventory))
            }
            if (data.equippedAvatar || data.equipped?.avatar || data.avatar) {
              const avImg = data.equipped?.avatar || data.avatar
              if (avImg && !avImg.includes('moldura')) {
                setAvatar(avImg)
                localStorage.setItem('user_equipped_avatar', avImg)
              }
              if (data.equippedAvatar) {
                setEquippedAvatarId(data.equippedAvatar)
                localStorage.setItem('equipped_avatar_id', data.equippedAvatar)
              }
            }
            if (data.equippedArena || data.equipped?.arena) {
              const ar = data.equipped?.arena || data.equippedArena
              setArena(ar)
              localStorage.setItem('equipped_arena', ar)
            }
            if (data.equippedTitle || data.equipped?.title) {
              const tit = data.equipped?.title || data.equippedTitle
              setTitle(tit)
              localStorage.setItem('equipped_title', tit)
            }
          }
        })
      } catch (e) {
        console.error(e)
      }
    }

    window.addEventListener('avatarChanged', syncProfile)
    window.addEventListener('arenaChanged', syncProfile)
    window.addEventListener('titleChanged', syncProfile)
    window.addEventListener('consumables_updated', syncProfile)
    window.addEventListener('inventory_updated', syncProfile)
    window.addEventListener('balance_updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot()
      window.removeEventListener('avatarChanged', syncProfile)
      window.removeEventListener('arenaChanged', syncProfile)
      window.removeEventListener('titleChanged', syncProfile)
      window.removeEventListener('consumables_updated', syncProfile)
      window.removeEventListener('inventory_updated', syncProfile)
      window.removeEventListener('balance_updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [])

  const handleEquipItem = async (item: InventoryItem) => {
    if (item.category === 'avatars') {
      const imgToSet = item.image || '/images/avatars/guardiao-vulcanico.jpg'
      setAvatar(imgToSet)
      setEquippedAvatarId(item.id)
      localStorage.setItem('user_equipped_avatar', imgToSet)
      localStorage.setItem('equipped_avatar_id', item.id)
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            equippedAvatar: item.id,
            'equipped.avatar': imgToSet,
            avatar: imgToSet,
          })
        } catch (e) {
          console.error(e)
        }
      }
      window.dispatchEvent(new Event('avatarChanged'))
      showToast(`Avatar "${item.name}" equipado!`)
    } else if (item.category === 'arenas') {
      setArena(item.id)
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
      setTitle(item.name)
      localStorage.setItem('equipped_title', item.name)
      localStorage.setItem('equipped_title_id', item.id)
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            equippedTitle: item.name,
            'equipped.title': item.name,
          })
        } catch (e) {
          console.error(e)
        }
      }
      window.dispatchEvent(new Event('titleChanged'))
      showToast(`Título "${item.name}" ativado!`)
    }

    window.dispatchEvent(new Event('inventory_updated'))
  }

  if (!mounted) return <div className="min-h-screen bg-slate-950" />

  // Cruzamento do inventário do utilizador com os catálogos globais
  const unlockedCosmetics = MASTER_PROFILE_CATALOG.filter((item) => {
    let isUnlocked = false

    if (item.category === 'avatars') {
      const isDefault = item.id === 'guardiao-vulcanico' || item.id === 'camoes-2050' || item.id === 'avatar_vulcao_acores' || item.id === 'avatar_camoes_2050'
      isUnlocked = inventory.avatars.includes(item.id) || unlockedItems.includes(item.id) || isDefault
    } else if (item.category === 'arenas') {
      const isDefault = item.id === 'arena_ponte_2077'
      isUnlocked = inventory.arenas.includes(item.id) || unlockedItems.includes(item.id) || isDefault
    } else if (item.category === 'titulos') {
      const isDefault = item.id === 'tit_filho_portugal' || item.name === 'Filho de Portugal' || item.id === 'tit_novico' || item.name === 'Noviço da Nação'
      isUnlocked = 
        inventory.titles.includes(item.id) ||
        inventory.titles.includes(item.name) ||
        unlockedItems.includes(item.id) ||
        unlockedItems.includes(item.name) ||
        isDefault
    }

    if (!isUnlocked) return false
    if (inventoryFilter === 'todos') return true
    return item.category === inventoryFilter
  })

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>

        {toastMessage && (
          <div className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-xl border border-emerald-400 animate-fade-in">
            {toastMessage}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-black flex items-center gap-1.5 shadow-inner">
            <span>🪙</span>
            <span>{userCoins.toLocaleString('pt-PT')} €</span>
          </div>

          <Link 
            href="/loja"
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Ir para a Loja
          </Link>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="w-full max-w-5xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <UserAvatar avatarUrl={avatar} size="xl" isCurrentUser={true} />
            <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg z-20">
              NÍVEL 2
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-wide text-white">
                Riky Moreira
              </h1>
              <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                <Shield className="w-3 h-3" /> Vila Real
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium flex items-center justify-center md:justify-start gap-2">
              <span className="text-amber-400 font-bold">« {title} »</span>
              <span>•</span>
              <span className="text-slate-400">Membro Fundador</span>
            </p>
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 max-w-md mt-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full w-[65%]" />
            </div>
            <p className="text-[11px] text-slate-500">650 / 1000 XP para Nível 3</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xl font-black text-white">5,981</span>
            <span className="text-xs text-slate-400">XP Total</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Award className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xl font-black text-emerald-400">#1</span>
            <span className="text-xs text-slate-400">Posição Nacional</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Zap className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xl font-black text-white">88%</span>
            <span className="text-xs text-slate-400">Taxa de Acerto</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-orange-400">14</span>
            <span className="text-xs text-slate-400">Vitórias em Duelo</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="w-full max-w-5xl flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'inventario'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> O Meu Inventário
        </button>
        <button
          onClick={() => setActiveTab('conquistas')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'conquistas'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Conquistas
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'historico'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" /> Histórico de Duelos
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full max-w-5xl">
        {activeTab === 'inventario' && (
          <div className="space-y-8">
            {/* BLOCO 1: AJUDAS & CONSUMÍVEIS (CONTADORES EM DESTAQUE) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" /> Ajudas & Utilidades em Stock
                  </h2>
                  <p className="text-xs text-slate-400">Power-ups consumíveis ativos para usar durante as tuas partidas do quiz.</p>
                </div>
                <Link
                  href="/loja"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adquirir Mais na Loja
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 50/50 Card */}
                <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-slate-700/60 shrink-0">
                      <img src="/images/shop/ajuda-5050.jpg" alt="50:50" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Pack Ajudas 50/50</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Elimina duas opções incorretas.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-base font-black border border-amber-500/40 shadow-inner">
                      x{consumables.help5050 || 0}
                    </span>
                    <Link
                      href="/loja"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all"
                    >
                      +5
                    </Link>
                  </div>
                </div>

                {/* Congelar Tempo Card */}
                <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-slate-700/60 shrink-0">
                      <img src="/images/shop/ajuda-congelar.jpg" alt="Congelar Tempo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Congelar Tempo</h3>
                      <p className="text-xs text-slate-400 mt-0.5">+15s de tempo extra na pergunta.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-base font-black border border-cyan-500/40 shadow-inner">
                      x{consumables.freezeTime || 0}
                    </span>
                    <Link
                      href="/loja"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition-all"
                    >
                      +3
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCO 2: COSMÉTICOS & PERSONALIZAÇÃO */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" /> Personalização & Cosméticos Desbloqueados
                  </h2>
                  <p className="text-xs text-slate-400">Gere as tuas personagens, arenas e títulos em uso.</p>
                </div>

                {/* Sub-tabs */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setInventoryFilter('todos')}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === 'todos'
                        ? 'bg-purple-600 text-white shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Todos ({unlockedCosmetics.length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('avatars')}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === 'avatars'
                        ? 'bg-purple-600 text-white shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Avatares ({MASTER_PROFILE_CATALOG.filter((i) => i.category === 'avatars' && (inventory.avatars.includes(i.id) || unlockedItems.includes(i.id) || i.id === 'guardiao-vulcanico')).length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('arenas')}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === 'arenas'
                        ? 'bg-purple-600 text-white shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Arenas ({MASTER_PROFILE_CATALOG.filter((i) => i.category === 'arenas' && (inventory.arenas.includes(i.id) || unlockedItems.includes(i.id) || i.id === 'arena_ponte_2077')).length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('titulos')}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === 'titulos'
                        ? 'bg-purple-600 text-white shadow-md font-black'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Títulos ({MASTER_PROFILE_CATALOG.filter((i) => i.category === 'titulos' && (inventory.titles.includes(i.id) || inventory.titles.includes(i.name) || unlockedItems.includes(i.id) || unlockedItems.includes(i.name) || i.id === 'tit_filho_portugal')).length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedCosmetics.map((item) => {
                  const isEquipped = 
                    (item.category === 'avatars' && (avatar === item.image || equippedAvatarId === item.id || (item.id === 'guardiao-vulcanico' && avatar.includes('guardiao-vulcanico')))) ||
                    (item.category === 'arenas' && arena === item.id) ||
                    (item.category === 'titulos' && (title === item.name || title === item.id))

                  return (
                    <div 
                      key={item.id}
                      className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md transition-all shadow-lg ${
                        isEquipped ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            item.badgeColor || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          }`}>
                            {item.badge || item.category}
                          </span>
                          {isEquipped ? (
                            <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 text-emerald-400" /> Equipado ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Desbloqueado</span>
                          )}
                        </div>

                        {/* Preview */}
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center mb-3 relative">
                          {item.category === 'avatars' && item.image ? (
                            <UserAvatar avatarUrl={item.image} size="lg" />
                          ) : item.category === 'arenas' && item.image ? (
                            <div className="relative w-full h-full overflow-hidden">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  e.currentTarget.src = '/images/hero-bg.jpg'
                                }}
                              />
                              <ArenaEffectsLayer effect={(item.effect as any) || 'particles'} intensity="low" showContrastOverlay={false} />
                            </div>
                          ) : item.category === 'titulos' ? (
                            <div className="flex flex-col items-center justify-center p-3 text-center w-full h-full bg-slate-950">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-yellow-400" /> TÍTULO OFICIAL
                              </span>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${
                                item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                « {item.name} »
                              </span>
                            </div>
                          ) : item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.src = '/images/hero-bg.jpg'
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <Trophy className="w-8 h-8 text-amber-400 mb-1" />
                              <span className="text-xs font-bold text-slate-300">{item.name}</span>
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-white">{item.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                        {isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Em Uso Atualmente
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEquipItem(item)}
                            className="cursor-pointer px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all active:scale-95 flex items-center gap-1"
                          >
                            Equipar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Explorar Mais na Loja Card */}
                <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[220px]">
                  <ShoppingBag className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm text-white">Desbloquear Mais Cosméticos</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4 max-w-[200px]">Visita a Loja para adquirir novos avatares, arenas e títulos.</p>
                  <Link
                    href="/loja"
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
                  >
                    Ver Loja Completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conquistas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Lenda Transmontana</h4>
                <p className="text-xs text-slate-400">Representaste Vila Real em 10 partidas.</p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pódio de Ouro</h4>
                <p className="text-xs text-slate-400">Alcançaste o 1º Lugar Nacional.</p>
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Mestre dos 18 Distritos</h4>
                <p className="text-xs text-slate-500">Vence duelos em todas as regiões.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Suice guy (Lisboa)</p>
                  <p className="text-xs text-slate-500">Modo Duelo 1v1 • Desafio Nacional</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">+250 XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Neymar (Vila Real)</p>
                  <p className="text-xs text-slate-500">Modo Duelo 1v1 • Desafio Nacional</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">+250 XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
