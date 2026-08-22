'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, User, Layers, Zap, Palette, Trophy, Globe, Check, Filter, MessageSquare } from 'lucide-react'
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { avatarShopList, type AvatarItem } from '@/data/shopAvatars'
import { TAUNT_PACKS } from '@/data/tauntPacks'

type Category = 'vip' | 'avatars' | 'todos' | 'taunts' | 'ajudas' | 'molduras' | 'titulos' | 'arenas'
type AvatarCategory = 'todos' | 'historia' | 'geografia' | 'desporto' | 'cultura' | 'simbolos'
type AvatarRarity = 'todas' | 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Exclusivo'

interface ShopItem {
  id: string
  name: string
  category: Category
  avatarCategory?: 'historia' | 'geografia' | 'desporto' | 'cultura' | 'simbolos'
  avatarCategoryLabel?: string
  rarity?: 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Exclusivo'
  description: string
  price: string
  priceValue: number
  isRealMoney?: boolean
  image?: string
  badge?: string
  badgeColor?: string
}

const AVATAR_SHOP_ITEMS: ShopItem[] = avatarShopList.map((av) => ({
  id: av.id,
  name: av.name,
  category: 'avatars',
  avatarCategory: av.category,
  avatarCategoryLabel: av.categoryLabel,
  rarity: av.rarity,
  description: av.description,
  price: `€${av.price.toLocaleString('pt-PT')}`,
  priceValue: av.price,
  image: av.image,
  badge: av.rarity,
  badgeColor: av.badgeColor,
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
  image: '/images/hero-bg.jpg',
}))

const OTHER_SHOP_ITEMS: ShopItem[] = [
  // ARENAS
  { id: 'arena_ponte_2077', name: 'Ponte do Infinito 2077', category: 'arenas', description: 'Cenário cyberpunk sobre o Tejo com lasers e arranha-céus.', price: 'GRÁTIS', priceValue: 0, image: '/arenas/arena-ponte-2077.gif', badge: 'Desbloqueado' },
  { id: 'arena_fado_alfama', name: 'Noite de Fado em Alfama', category: 'arenas', description: 'Aparência visual com tons aveludados e atmosfera intimista.', price: '€5.000', priceValue: 5000, image: '/images/shop/arena-fado-alfama.jpg', badge: 'Épico' },
  { id: 'arena_fogo_acores', name: 'Fogo dos Açores', category: 'arenas', description: 'Brasas em ascensão e rebordo incandescente nas partidas.', price: '€20.000', priceValue: 20000, image: '/images/shop/arena-fogo-acores.jpg', badge: 'Mítico' },

  // AJUDAS & UTILIDADES
  { id: 'ajuda_5050', name: 'Pack x5 Ajudas 50/50', category: 'ajudas', description: 'Elimina duas respostas erradas instantaneamente no quiz.', price: '€500', priceValue: 500, image: '/images/shop/ajuda-5050.jpg', badge: 'Consumível (+5)' },
  { id: 'ajuda_congelar', name: 'Pack x3 Congelar Tempo', category: 'ajudas', description: 'Dá +15 segundos adicionais para responder à questão.', price: '€750', priceValue: 750, image: '/images/shop/ajuda-congelar.jpg', badge: 'Consumível (+3)' },

  // MOLDURAS
  { id: 'moldura_ouro_real', name: 'Moldura Ouro Real 3D', category: 'molduras', description: 'Rebordo dourado pulsante ao redor do teu avatar.', price: '€4.000', priceValue: 4000, image: '/images/shop/moldura-ouro.jpg', badge: 'Exclusivo' },
  { id: 'moldura_neon_portugal', name: 'Moldura Quinas Neon', category: 'molduras', description: 'Efeito luminoso verde e rubro vivo.', price: '€2.500', priceValue: 2500, image: '/images/shop/moldura-neon.jpg', badge: 'Raro' },

  // TÍTULOS
  { id: 'titulo_patriota', name: 'Título: O Conquistador', category: 'titulos', description: 'Exibido por baixo do teu nome em todos os rankings e duelos.', price: '€1.000', priceValue: 1000, image: '/images/shop/titulo-conquistador.jpg', badge: 'Honorífico' }
]

const SHOP_ITEMS: ShopItem[] = [...AVATAR_SHOP_ITEMS, ...TAUNT_SHOP_ITEMS, ...OTHER_SHOP_ITEMS]

const AVATAR_CATEGORIES = [
  { key: 'todos' as AvatarCategory, label: 'Todos os Avatares' },
  { key: 'historia' as AvatarCategory, label: '🏛️ História' },
  { key: 'geografia' as AvatarCategory, label: '🌍 Geografia' },
  { key: 'desporto' as AvatarCategory, label: '⚽ Desporto' },
  { key: 'cultura' as AvatarCategory, label: '🎭 Cultura & Fado' },
  { key: 'simbolos' as AvatarCategory, label: '🇵🇹 Símbolos' },
]

const AVATAR_RARITIES: AvatarRarity[] = ['todas', 'Comum', 'Raro', 'Épico', 'Lendário', 'Exclusivo']

export default function LojaPage() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Category>('avatars')
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState<AvatarCategory>('todos')
  const [avatarRarityFilter, setAvatarRarityFilter] = useState<AvatarRarity>('todas')
  const [equippedAvatar, setEquippedAvatar] = useState<string>('/images/avatars/guardiao-vulcanico.jpg')
  const [equippedArena, setEquippedArena] = useState<string>('arena_ponte_2077')
  const [equippedFrame, setEquippedFrame] = useState<string>('')
  const [equippedTitle, setEquippedTitle] = useState<string>('')
  const [userBalance, setUserBalance] = useState<number>(803845)
  const [consumables, setConsumables] = useState<{ help5050: number; freezeTime: number }>({ help5050: 5, freezeTime: 3 })
  const [inventory, setInventory] = useState<{ avatars: string[]; frames: string[]; arenas: string[]; titles: string[] }>({
    avatars: ['guardiao-vulcanico', 'camoes-2050', 'avatar_vulcao_acores', 'avatar_camoes_2050'],
    frames: ['moldura_padrao'],
    arenas: ['arena_ponte_2077', 'arena_neon_2088'],
    titles: ['titulo_iniciante']
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    'guardiao-vulcanico', 
    'camoes-2050', 
    'arena_neon_2088', 
    'arena_ponte_2077', 
    'avatar_vulcao_acores', 
    'avatar_camoes_2050'
  ])
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    setMounted(true)
    try {
      const savedAvatar = localStorage.getItem('user_equipped_avatar')
      if (savedAvatar && !savedAvatar.includes('moldura')) setEquippedAvatar(savedAvatar)
      
      const savedArena = localStorage.getItem('equipped_arena')
      if (savedArena) setEquippedArena(savedArena)

      const savedFrame = localStorage.getItem('equipped_frame') || localStorage.getItem('user_equipped_frame')
      if (savedFrame) setEquippedFrame(savedFrame)

      const savedTitle = localStorage.getItem('equipped_title')
      if (savedTitle) setEquippedTitle(savedTitle)

      const savedEuros = localStorage.getItem('user_euros')
      if (savedEuros) setUserBalance(Number(savedEuros))

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
              frames: Array.from(new Set([...prev.frames, ...(parsedInv.frames || [])])),
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
            setUnlockedItems(Array.from(new Set([...unlockedItems, ...parsed])))
          }
        } catch (e) {
          console.error(e)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type })
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  const isItemUnlocked = (item: ShopItem) => {
    if (item.category === 'ajudas') return false
    if (item.priceValue === 0) return true
    if (unlockedItems.includes(item.id)) return true
    if (item.category === 'avatars') {
      if (inventory.avatars.includes(item.id)) return true
      if (item.id === 'guardiao-vulcanico' && (inventory.avatars.includes('avatar_vulcao_acores') || unlockedItems.includes('avatar_vulcao_acores'))) return true
      if (item.id === 'camoes-2050' && (inventory.avatars.includes('avatar_camoes_2050') || unlockedItems.includes('avatar_camoes_2050'))) return true
      if (item.id === 'cyborg-quinas' && (inventory.avatars.includes('avatar_lenda_futebol') || unlockedItems.includes('avatar_lenda_futebol'))) return true
      if (item.id === 'fadista-cyber-alfama' && (inventory.avatars.includes('avatar_fadista_cyber') || unlockedItems.includes('avatar_fadista_cyber'))) return true
    }
    if (item.category === 'molduras' && inventory.frames.includes(item.id)) return true
    if (item.category === 'arenas' && inventory.arenas.includes(item.id)) return true
    if (item.category === 'titulos' && inventory.titles.includes(item.id)) return true
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
    if (item.category === 'molduras') return equippedFrame === item.id
    if (item.category === 'titulos') return equippedTitle === item.name
    return false
  }

  const handleAction = async (item: ShopItem) => {
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

      if (auth.currentUser && consumableKey) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            euros: newBalance,
            [consumableKey]: increment(amountAdded)
          })
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
              'equipped.avatar': item.image,
              avatar: item.image
            })
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
              'equipped.arena': item.id
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('arenaChanged'))
        showToast(`Arena "${item.name}" equipada no jogo!`)
      } else if (item.category === 'molduras') {
        setEquippedFrame(item.id)
        localStorage.setItem('equipped_frame', item.id)
        localStorage.setItem('user_equipped_frame', item.id)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'equipped.frame': item.id,
              equippedFrame: item.id
            })
          } catch (e) {
            console.error(e)
          }
        }
        window.dispatchEvent(new Event('frameChanged'))
        showToast(`Moldura "${item.name}" equipada!`)
      } else if (item.category === 'titulos') {
        setEquippedTitle(item.name)
        localStorage.setItem('equipped_title', item.name)
        if (auth.currentUser) {
          try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              'equipped.title': item.name
            })
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
      localStorage.setItem('user_euros', String(newBalance))

      // Atualizar Inventário
      let updatedInv = { ...inventory }
      let firestoreInvField = ''

      if (item.category === 'avatars') {
        updatedInv.avatars = Array.from(new Set([...updatedInv.avatars, item.id]))
        firestoreInvField = 'inventory.avatars'
      } else if (item.category === 'molduras') {
        updatedInv.frames = Array.from(new Set([...updatedInv.frames, item.id]))
        firestoreInvField = 'inventory.frames'
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
      } else if (item.category === 'molduras') {
        setEquippedFrame(item.id)
        localStorage.setItem('equipped_frame', item.id)
        localStorage.setItem('user_equipped_frame', item.id)
        window.dispatchEvent(new Event('frameChanged'))
      } else if (item.category === 'titulos') {
        setEquippedTitle(item.name)
        localStorage.setItem('equipped_title', item.name)
        window.dispatchEvent(new Event('titleChanged'))
      }

      if (auth.currentUser) {
        try {
          const updatePayload: any = {
            euros: newBalance,
          }
          if (firestoreInvField) {
            updatePayload[firestoreInvField] = arrayUnion(item.id)
          }
          if (item.category === 'avatars' && item.image) {
            updatePayload['equipped.avatar'] = item.image
            updatePayload.avatar = item.image
          } else if (item.category === 'molduras') {
            updatePayload['equipped.frame'] = item.id
            updatePayload.equippedFrame = item.id
          } else if (item.category === 'arenas') {
            updatePayload['equipped.arena'] = item.id
          } else if (item.category === 'titulos') {
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
      if (avatarCategoryFilter !== 'todos' && item.avatarCategory !== avatarCategoryFilter) return false
      if (avatarRarityFilter !== 'todas' && item.rarity !== avatarRarityFilter) return false
      return true
    }
    return item.category === activeTab
  })

  return (
    <div className="relative min-h-screen w-full text-white bg-transparent flex flex-col items-center p-4 md:p-8">
      {/* CAMADA FIXA DA IMAGEM ANEXADA (Sobrepõe a grelha verde do site) */}
      <div 
        className="fixed inset-0 z-0 w-full h-full pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(5, 10, 18, 0.65), rgba(5, 10, 18, 0.85)), url('/images/bg-loja.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* CONTEÚDO DA LOJA POR CIMA */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Top Navigation */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
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
              Adquire avatares épicos, ajudas de jogo, molduras vivas, títulos e arenas 3D exclusivas.
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
            onClick={() => setActiveTab('molduras')}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'molduras'
                ? 'bg-purple-500 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-900/70 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Molduras
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

        {/* SUB-FILTROS DE AVATARES (CATEGORIAS E RARIDADES) */}
        {activeTab === 'avatars' && (
          <div className="w-full max-w-6xl space-y-3 mb-6 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
            {/* Categorias Temáticas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Categoria:
              </span>
              {AVATAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setAvatarCategoryFilter(cat.key)}
                  className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    avatarCategoryFilter === cat.key
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Raridades */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-800/60 scrollbar-none">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Raridade:
              </span>
              {AVATAR_RARITIES.map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setAvatarRarityFilter(rarity)}
                  className={`cursor-pointer shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    avatarRarityFilter === rarity
                      ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                  }`}
                >
                  {rarity === 'todas' ? 'Todas' : rarity}
                </button>
              ))}
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

                const isGoldFrame = item.id === 'moldura_ouro_real'
                const isNeonFrame = item.id === 'moldura_neon_portugal'

                return (
                  <div 
                    key={item.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] shadow-lg"
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
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-slate-800/80 mb-3">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                              isGoldFrame ? 'animate-frame-gold' : isNeonFrame ? 'animate-frame-neon' : ''
                            }`} 
                            onError={(e) => {
                              e.currentTarget.src = '/images/avatars/guardiao-vulcanico.jpg'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Sparkles className="w-8 h-8" />
                          </div>
                        )}
                        {/* Efeito de brilho pulsante */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Ação e Preço */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
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
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
