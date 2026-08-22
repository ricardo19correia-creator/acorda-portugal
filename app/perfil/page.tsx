'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Trophy, Zap, Shield, Flame, Award, 
  ShoppingBag, Swords, CheckCircle2, Lock, Sparkles, MapPin, Check, Plus, Globe, 
  User, Edit3, LogOut, Trash2, AlertTriangle, MessageSquare, 
  ChevronRight, BarChart3, HelpCircle, Star, Crown, BookOpen
} from 'lucide-react'
import { doc, updateDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { signOut, deleteUser, updateProfile } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { UserAvatar } from '@/components/user-avatar'
import { avatarShopList, type AvatarItem } from '@/data/shopAvatars'
import { TITLE_SHOP_CATALOG, type TitleItem } from '@/data/shopTitles'
import { ARENA_SHOP_CATALOG, type ArenaItem } from '@/data/shopArenas'
import { TAUNT_PACKS, type TauntPack } from '@/data/tauntPacks'
import { DISTRICT_MAP } from '@/lib/district-map'
import { ArenaEffectsLayer } from '@/components/ArenaEffectsLayer'
import { cn } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  category: 'avatars' | 'arenas' | 'titulos' | 'taunts' | 'ajudas'
  description: string
  image?: string
  badge?: string
  badgeColor?: string
  effect?: string
  price?: number | null
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
    description: a.description || 'Avatar temático de Portugal.',
    image: a.image,
    badge: a.rarity,
    badgeColor: getAvatarBadgeColor(a.rarity),
    price: a.price,
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
    price: ar.price,
  })),
  ...TITLE_SHOP_CATALOG.map((t) => ({
    id: t.id,
    name: t.name,
    category: 'titulos' as const,
    description: t.requirement || 'Título oficial concedido ao jogador.',
    image: '/images/shop/titulo-conquistador.jpg',
    badge: t.rarity,
    badgeColor: t.badgeColor,
    price: t.price,
  })),
]

export default function PerfilPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // Perfil Base
  const [displayName, setDisplayName] = useState<string>('Jogador')
  const [district, setDistrict] = useState<string>('Portugal')
  const [avatar, setAvatar] = useState<string>('/images/avatars/guardiao-vulcanico.jpg')
  const [equippedAvatarId, setEquippedAvatarId] = useState<string>('guardiao-vulcanico')
  const [arena, setArena] = useState<string>('arena_ponte_2077')
  const [title, setTitle] = useState<string>('Filho de Portugal')
  const [userCoins, setUserCoins] = useState<number>(803845)
  const [userXp, setUserXp] = useState<number>(5980)
  const [userLevel, setUserLevel] = useState<number>(2)

  // Abas Principais & Sub-Filtros
  const [activeTab, setActiveTab] = useState<'inventario' | 'estatisticas' | 'conquistas' | 'historico'>('inventario')
  const [inventoryFilter, setInventoryFilter] = useState<'todos' | 'avatars' | 'arenas' | 'titulos' | 'taunts' | 'ajudas'>('todos')
  
  // Consumíveis & Inventário
  const [consumables, setConsumables] = useState<{ help5050: number; freezeTime: number }>({ help5050: 5, freezeTime: 3 })
  const [inventory, setInventory] = useState<{ avatars: string[]; arenas: string[]; titles: string[]; taunts: string[] }>({
    avatars: ['guardiao-vulcanico', 'camoes-2050', 'avatar_vulcao_acores', 'avatar_camoes_2050'],
    arenas: ['arena_ponte_2077', 'arena_neon_2088'],
    titles: ['tit_filho_portugal', 'tit_novico', 'Filho de Portugal', 'Noviço da Nação'],
    taunts: ['pack_basico'],
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>([
    'guardiao-vulcanico', 
    'camoes-2050', 
    'arena_neon_2088', 
    'arena_ponte_2077', 
    'avatar_vulcao_acores', 
    'avatar_camoes_2050',
    'tit_filho_portugal',
    'Filho de Portugal',
    'pack_basico',
  ])

  // Modais de Ação
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Formulário do Modal de Edição
  const [editName, setEditName] = useState('')
  const [editDistrict, setEditDistrict] = useState('Lisboa')
  const [editAvatar, setEditAvatar] = useState('/images/avatars/guardiao-vulcanico.jpg')
  const [editAvatarId, setEditAvatarId] = useState('guardiao-vulcanico')

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    setMounted(true)
    const syncProfile = () => {
      try {
        const savedName = localStorage.getItem('user_display_name') || user?.displayName || profile?.displayName || 'Riky Moreira'
        setDisplayName(savedName)

        const savedDistrict = localStorage.getItem('user_district') || profile?.district || 'Vila Real'
        setDistrict(savedDistrict)

        const savedAvatar = localStorage.getItem('user_equipped_avatar') || (profile as any)?.equipped?.avatar || (profile as any)?.avatar || user?.photoURL || '/images/avatars/guardiao-vulcanico.jpg'
        if (savedAvatar && !savedAvatar.includes('moldura')) {
          setAvatar(savedAvatar)
        } else {
          setAvatar('/images/avatars/guardiao-vulcanico.jpg')
        }

        const savedAvatarId = localStorage.getItem('equipped_avatar_id') || (profile as any)?.equippedAvatar || 'guardiao-vulcanico'
        if (savedAvatarId) setEquippedAvatarId(savedAvatarId)

        const savedArena = localStorage.getItem('equipped_arena') || (profile as any)?.equippedArena || (profile as any)?.equipped?.arena || 'arena_ponte_2077'
        if (savedArena) setArena(savedArena)

        const savedTitle = localStorage.getItem('equipped_title') || (profile as any)?.equippedTitle || profile?.equipped?.title || (profile as any)?.title || 'Filho de Portugal'
        if (savedTitle) setTitle(savedTitle)

        const savedCoins = localStorage.getItem('user_coins') || localStorage.getItem('user_euros') || (profile?.euros ?? 803845)
        if (savedCoins) setUserCoins(Number(savedCoins))

        const currentXp = profile?.xp ?? 5980
        setUserXp(currentXp)
        setUserLevel(profile?.level ?? (Math.floor(currentXp / 1000) + 1))

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
                taunts: Array.from(new Set([...prev.taunts, ...(parsed.taunts || ['pack_basico'])])),
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
            if (data.displayName) {
              setDisplayName(data.displayName)
              localStorage.setItem('user_display_name', data.displayName)
            }
            if (data.district) {
              setDistrict(data.district)
              localStorage.setItem('user_district', data.district)
            }
            const coinsVal = typeof data.coins === 'number' ? data.coins : typeof data.euros === 'number' ? data.euros : null
            if (coinsVal !== null) {
              setUserCoins(coinsVal)
              localStorage.setItem('user_coins', String(coinsVal))
              localStorage.setItem('user_euros', String(coinsVal))
            }
            if (typeof data.xp === 'number') {
              setUserXp(data.xp)
              setUserLevel(Math.floor(data.xp / 1000) + 1)
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
                taunts: Array.from(new Set([...prev.taunts, ...(data.inventory.taunts || ['pack_basico'])])),
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
  }, [user, profile])

  // Ação de Equipar Cosmético Universal
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
          await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
            photoURL: imgToSet,
            avatar: imgToSet,
            'equipped.avatar': imgToSet,
            equippedAvatar: item.id,
          }, { merge: true })
        } catch (e) {
          console.error(e)
        }
      }
      window.dispatchEvent(new Event('avatarChanged'))
      showToast(`Avatar "${item.name}" equipado com sucesso!`)
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
      showToast(`Título «${item.name}» ativado no perfil!`)
    }

    window.dispatchEvent(new Event('inventory_updated'))
  }

  // Abrir Modal de Edição de Perfil
  const openEditModal = () => {
    setEditName(displayName)
    setEditDistrict(district)
    setEditAvatar(avatar)
    setEditAvatarId(equippedAvatarId)
    setIsEditModalOpen(true)
  }

  // Guardar Edição de Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingEdit(true)

    try {
      const newName = editName.trim() || displayName
      const newDistrict = editDistrict || district
      const newAvatar = editAvatar || avatar
      const newAvatarId = editAvatarId || equippedAvatarId

      setDisplayName(newName)
      setDistrict(newDistrict)
      setAvatar(newAvatar)
      setEquippedAvatarId(newAvatarId)

      localStorage.setItem('user_display_name', newName)
      localStorage.setItem('user_district', newDistrict)
      localStorage.setItem('user_equipped_avatar', newAvatar)
      localStorage.setItem('equipped_avatar_id', newAvatarId)

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
          photoURL: newAvatar,
        })

        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: newName,
          name: newName,
          district: newDistrict,
          avatar: newAvatar,
          photoURL: newAvatar,
          equippedAvatar: newAvatarId,
          'equipped.avatar': newAvatar,
        })

        await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
          displayName: newName,
          name: newName,
          district: newDistrict,
          avatar: newAvatar,
          photoURL: newAvatar,
          equippedAvatar: newAvatarId,
          'equipped.avatar': newAvatar,
        }, { merge: true })
      }

      window.dispatchEvent(new Event('avatarChanged'))
      showToast('Perfil atualizado com sucesso!')
      setIsEditModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast('Erro ao atualizar o perfil.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Logout de Sessão
  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('user_display_name')
      showToast('Sessão terminada.')
      router.push('/')
    } catch (err) {
      console.error(err)
    }
  }

  // Eliminar Conta
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid
        try {
          await deleteDoc(doc(db, 'users', uid))
          await deleteDoc(doc(db, 'publicProfiles', uid))
        } catch (e) {
          console.warn('Erro ao limpar documentos Firestore:', e)
        }
        await deleteUser(auth.currentUser)
      }
      localStorage.clear()
      router.push('/')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        alert('Por motivos de segurança, por favor faz login novamente antes de eliminar a conta.')
      } else {
        alert('Erro ao eliminar a conta. Tenta novamente mais tarde.')
      }
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  // Lista de Avatares Desbloqueados para o Seletor do Modal
  const availableUnlockedAvatars = useMemo(() => {
    return avatarShopList.filter((a) => {
      const isDefault = a.id === 'guardiao-vulcanico' || a.id === 'camoes-2050' || a.id === 'avatar_vulcao_acores' || a.id === 'avatar_camoes_2050'
      return isDefault || inventory.avatars.includes(a.id) || unlockedItems.includes(a.id)
    })
  }, [inventory.avatars, unlockedItems])

  // Cosméticos Desbloqueados no Inventário
  const unlockedCosmetics = useMemo(() => {
    return MASTER_PROFILE_CATALOG.filter((item) => {
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
  }, [inventory, unlockedItems, inventoryFilter])

  // Estatísticas por Categoria (Performance de Quiz)
  const categoryStats = useMemo(() => [
    {
      id: 'historia',
      name: 'História de Portugal',
      icon: '🏛️',
      accuracy: 88,
      answered: 142,
      correct: 125,
      levelName: 'Mestre da Lusitânia',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/40',
      barColor: 'bg-amber-500',
    },
    {
      id: 'geografia',
      name: 'Geografia & Território',
      icon: '🌍',
      accuracy: 92,
      answered: 110,
      correct: 101,
      levelName: 'Navegador Cartógrafo',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/40',
      barColor: 'bg-emerald-500',
    },
    {
      id: 'desporto',
      name: 'Desporto Nacional',
      icon: '⚽',
      accuracy: 78,
      answered: 95,
      correct: 74,
      levelName: 'Campeão Ibérico',
      gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-blue-500/40',
      barColor: 'bg-blue-500',
    },
    {
      id: 'cultura',
      name: 'Cultura & Tradições',
      icon: '🎭',
      accuracy: 80,
      answered: 88,
      correct: 70,
      levelName: 'Erudito das Beiras',
      gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'border-purple-500/40',
      barColor: 'bg-purple-500',
    },
    {
      id: 'simbolos',
      name: 'Símbolos & Gastronomia',
      icon: '🇵🇹',
      accuracy: 95,
      answered: 120,
      correct: 114,
      levelName: 'Paladar Lusitano',
      gradient: 'from-red-500/20 via-amber-500/10 to-transparent',
      borderColor: 'border-red-500/40',
      barColor: 'bg-red-500',
    },
    {
      id: 'maluco',
      name: 'Modo Maluco',
      icon: '🤪',
      accuracy: 70,
      answered: 64,
      correct: 45,
      levelName: 'Maluco Veterano',
      gradient: 'from-yellow-500/20 via-lime-500/10 to-transparent',
      borderColor: 'border-yellow-500/40',
      barColor: 'bg-yellow-500',
    },
  ], [])

  if (!mounted) return <div className="min-h-screen bg-slate-950" />

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-sm font-medium transition-all shadow-md"
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
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="relative">
              <UserAvatar avatarUrl={avatar} size="xl" isCurrentUser={true} />
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg z-20">
                NÍVEL {userLevel}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-black tracking-wide text-white">
                  {displayName}
                </h1>
                <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full w-fit mx-auto md:mx-0 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {district}
                </span>
                {title && (
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-300 tracking-wide">
                    « {title.replace(/^Título:\s*«?/, '').replace(/»?$/, '')} »
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-bold">Membro Fundador</span>
                <span>•</span>
                <span>ID: {user?.uid ? user.uid.slice(0, 8) : '2026-PT'}</span>
              </div>

              {/* Barra de Progresso de Nível */}
              <div className="w-full bg-slate-800/90 rounded-full h-3 max-w-md mt-2 border border-slate-700/50 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  style={{ width: `${Math.min(100, (userXp % 1000) / 10)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {userXp % 1000} / 1.000 XP para Nível {userLevel + 1}
              </p>
            </div>
          </div>

          {/* Botões de Ação Rápida no Perfil */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={openEditModal}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all shadow-md active:scale-95"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              <span>Editar Perfil</span>
            </button>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-bold text-xs border border-slate-700 hover:border-rose-500/40 transition-all shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Stats Grid Rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xl font-black text-white">{userXp.toLocaleString('pt-PT')}</span>
            <span className="text-xs text-slate-400">XP Total</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Award className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xl font-black text-emerald-400">#1</span>
            <span className="text-xs text-slate-400">Posição Nacional</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Zap className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xl font-black text-white">88%</span>
            <span className="text-xs text-slate-400">Taxa de Acerto</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-orange-400">14</span>
            <span className="text-xs text-slate-400">Vitórias em Duelo</span>
          </div>
        </div>
      </div>

      {/* Navegação de Abas Principais */}
      <div className="w-full max-w-5xl flex gap-2 mb-6 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventario')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'inventario'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> 🎒 Inventário &amp; Cosméticos
        </button>

        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'estatisticas'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> 📊 Estatísticas por Categoria
        </button>

        <button
          onClick={() => setActiveTab('conquistas')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'conquistas'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 🏆 Conquistas &amp; Prestígio
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'historico'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Swords className="w-4 h-4" /> ⚔️ Histórico de Duelos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="w-full max-w-5xl">
        {/* ========================================================= */}
        {/* ABA 1: INVENTÁRIO & COSMÉTICOS */}
        {/* ========================================================= */}
        {activeTab === 'inventario' && (
          <div className="space-y-8">
            {/* Sub-Filtros do Inventário */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Filtrar Inventário
                </h3>
                <p className="text-xs text-slate-400">Gere as tuas personagens, arenas, títulos e reações desbloqueadas.</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setInventoryFilter('todos')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'todos'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setInventoryFilter('avatars')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'avatars'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Avatares ({unlockedCosmetics.filter((i) => i.category === 'avatars').length})
                </button>
                <button
                  onClick={() => setInventoryFilter('arenas')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'arenas'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Arenas ({unlockedCosmetics.filter((i) => i.category === 'arenas').length})
                </button>
                <button
                  onClick={() => setInventoryFilter('titulos')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'titulos'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Títulos ({unlockedCosmetics.filter((i) => i.category === 'titulos').length})
                </button>
                <button
                  onClick={() => setInventoryFilter('taunts')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'taunts'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Provocações (💬)
                </button>
                <button
                  onClick={() => setInventoryFilter('ajudas')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'ajudas'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Ajudas &amp; Consumíveis
                </button>
              </div>
            </div>

            {/* SEÇÃO: AJUDAS & CONSUMÍVEIS */}
            {(inventoryFilter === 'todos' || inventoryFilter === 'ajudas') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" /> Ajudas &amp; Consumíveis em Stock
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
                  <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-cyan-500/30 flex items-center justify-center text-2xl shrink-0">
                        ✨
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Ajuda 50/50</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Elimina duas opções erradas instantaneamente.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-base font-black border border-cyan-400/40 shadow-inner">
                        x{consumables.help5050 || 0}
                      </span>
                      <Link
                        href="/loja"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition-all"
                      >
                        Loja
                      </Link>
                    </div>
                  </div>

                  {/* Congelar Tempo Card */}
                  <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
                        ⏳
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Congelar Tempo (+15s)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Pausa o cronómetro e dá tempo extra para pensar.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-base font-black border border-amber-400/40 shadow-inner">
                        x{consumables.freezeTime || 0}
                      </span>
                      <Link
                        href="/loja"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all"
                      >
                        Loja
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO: COSMÉTICOS (AVATARES, ARENAS, TÍTULOS) */}
            {(inventoryFilter === 'todos' || inventoryFilter === 'avatars' || inventoryFilter === 'arenas' || inventoryFilter === 'titulos') && (
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-purple-400" /> Coleção de Cosméticos Ativos
                </h2>

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

                          {/* Preview Adaptada por Tipo */}
                          <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center mb-3 relative">
                            {item.category === 'avatars' && item.image ? (
                              <div className="w-full h-36 flex items-center justify-center p-2">
                                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-md" />
                              </div>
                            ) : item.category === 'arenas' && item.image ? (
                              <div className="relative w-full h-36 overflow-hidden">
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
                              <div className="flex flex-col items-center justify-center p-4 text-center w-full h-36 bg-slate-950">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
                                  <Trophy className="w-3 h-3 text-amber-400" /> TÍTULO OFICIAL
                                </span>
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border shadow-md ${
                                  item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                  « {item.name} »
                                </span>
                              </div>
                            ) : (
                              <div className="h-36 flex items-center justify-center text-slate-400">
                                {item.name}
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
                </div>
              </div>
            )}

            {/* SEÇÃO: PROVOCAÇÕES (TAUNTS) */}
            {(inventoryFilter === 'todos' || inventoryFilter === 'taunts') && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" /> Packs de Provocações (Duelos 1v1)
                    </h2>
                    <p className="text-xs text-slate-400">Mensagens rápidas e balões de diálogo para usar durante o duelo contra adversários.</p>
                  </div>
                  <Link
                    href="/loja"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ver Packs na Loja
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TAUNT_PACKS.map((pack) => {
                    const isUnlocked = pack.isFree || inventory.taunts.includes(pack.id) || unlockedItems.includes(pack.id)

                    return (
                      <div
                        key={pack.id}
                        className={cn(
                          'p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-all',
                          isUnlocked
                            ? 'bg-slate-900/90 border-slate-700/80 shadow-purple-950/20'
                            : 'bg-slate-950/60 border-slate-800 opacity-60',
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{pack.icon}</span>
                            <div>
                              <h3 className="font-black text-sm text-white">{pack.name}</h3>
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 inline-block', pack.badgeColor)}>
                                {pack.isFree ? 'Grátis' : 'Desbloqueado'}
                              </span>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                              <Check className="w-3 h-3" /> Ativo
                            </span>
                          ) : (
                            <Link
                              href="/loja"
                              className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-xl hover:bg-amber-500/30 transition-all"
                            >
                              Adquirir
                            </Link>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mb-4">{pack.description}</p>

                        {/* Balões de Diálogo com as Frases do Pack */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
                          {pack.taunts.map((t) => (
                            <div
                              key={t.id}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 text-center truncate hover:border-purple-400 transition-colors"
                              title={t.text}
                            >
                              {t.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: ESTATÍSTICAS POR CATEGORIA (PERFORMANCE DO QUIZ) */}
        {/* ========================================================= */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> Domínio por Categoria de Conhecimento
                </h2>
                <p className="text-xs text-slate-400">Analisa a tua taxa de acerto e evolução em cada tema de Portugal.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Total: 619 Questões
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryStats.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    'p-5 rounded-2xl border bg-slate-900/90 backdrop-blur-md shadow-xl transition-all relative overflow-hidden',
                    cat.borderColor,
                  )}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cat.gradient} rounded-full blur-2xl pointer-events-none`} />

                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-black text-sm text-white">{cat.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400">{cat.levelName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-white font-mono">{cat.accuracy}%</span>
                      <p className="text-[10px] text-slate-400">Acerto</p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden mb-3">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', cat.barColor)}
                      style={{ width: `${cat.accuracy}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Respondidas: <strong>{cat.answered}</strong></span>
                    <span>Corretas: <strong className="text-emerald-400">{cat.correct}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: CONQUISTAS & PRESTÍGIO */}
        {/* ========================================================= */}
        {activeTab === 'conquistas' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0">
                👑
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Membro Fundador</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pioneiro no lançamento do Acorda Portugal.</p>
                <span className="text-[10px] font-black text-emerald-400 uppercase mt-1 inline-block">✓ Desbloqueada</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Top 1 Nacional</h4>
                <p className="text-xs text-slate-400 mt-0.5">Alcançou a 1ª posição da tabela geral.</p>
                <span className="text-[10px] font-black text-amber-300 uppercase mt-1 inline-block">✓ Desbloqueada</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl shrink-0">
                ⚔️
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Guerreiro dos Duelos</h4>
                <p className="text-xs text-slate-400 mt-0.5">Venceu mais de 10 duelos 1v1.</p>
                <span className="text-[10px] font-black text-cyan-300 uppercase mt-1 inline-block">✓ Desbloqueada</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-purple-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl shrink-0">
                🔥
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sequência de Fogo</h4>
                <p className="text-xs text-slate-400 mt-0.5">Acertou 10 perguntas consecutivas.</p>
                <span className="text-[10px] font-black text-purple-300 uppercase mt-1 inline-block">✓ Desbloqueada</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center text-xl shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Conquistador Total</h4>
                <p className="text-xs text-slate-500 mt-0.5">Vence duelos nos 18 distritos e ilhas.</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 inline-block">Progresso: 4 / 20</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center text-xl shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Enciclopédia Viva</h4>
                <p className="text-xs text-slate-500 mt-0.5">Responde a 1.000 perguntas no quiz.</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 inline-block">Progresso: 619 / 1000</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: HISTÓRICO DE DUELOS */}
        {/* ========================================================= */}
        {activeTab === 'historico' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-purple-400" /> Últimos Confrontos 1v1
              </h3>
              <span className="text-xs text-slate-400">Total: 16 Duelos</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Suice guy (Lisboa)</p>
                  <p className="text-xs text-slate-500">História &amp; Geografia • 1850 vs 1420 pts</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-400">+250 XP</span>
                <p className="text-[10px] text-slate-500">Há 2 horas</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">VITÓRIA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Neymar (Vila Real)</p>
                  <p className="text-xs text-slate-500">Desporto Nacional • 1600 vs 1200 pts</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-400">+250 XP</span>
                <p className="text-[10px] text-slate-500">Ontem</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-rose-400 bg-rose-950/80 border border-rose-800 px-2.5 py-1 rounded-lg">DERROTA</span>
                <div>
                  <p className="text-sm font-bold text-white">vs Lusitano (Porto)</p>
                  <p className="text-xs text-slate-500">Cultura &amp; Tradições • 1350 vs 1580 pts</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-400">+50 XP</span>
                <p className="text-[10px] text-slate-500">Há 2 dias</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ÁREA DE GESTÃO DE CONTA & ZONA DE PERIGO */}
      {/* ========================================================= */}
      <div className="w-full max-w-5xl mt-12 pt-8 border-t border-slate-800/80">
        <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" /> Definições de Conta &amp; Segurança
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Conectado como <strong>{user?.email || displayName}</strong> • Todos os dados guardados em nuvem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Terminar Sessão
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Conta</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDITAR PERFIL */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Edit3 className="w-5 h-5 text-emerald-400" /> Editar Perfil
            </h3>
            <p className="text-xs text-slate-400 mb-5">Personaliza o teu nome, distrito de origem e avatar ativo.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome de Exibição (Nickname)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={24}
                  required
                  placeholder="O teu nome no jogo"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-sm text-white font-medium shadow-inner"
                />
              </div>

              {/* Distrito */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Distrito de Origem / Representação
                </label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-400 focus:outline-none text-sm text-white font-medium shadow-inner"
                >
                  {DISTRICT_MAP.map((d) => (
                    <option key={d.slug} value={d.name} className="bg-slate-900 text-white">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seletor de Avatar Ativo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Escolher Avatar Ativo (Desbloqueados)
                </label>
                <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
                  {availableUnlockedAvatars.map((av) => {
                    const isSelected = editAvatar === av.image || editAvatarId === av.id

                    return (
                      <button
                        type="button"
                        key={av.id}
                        onClick={() => {
                          if (av.image) setEditAvatar(av.image)
                          setEditAvatarId(av.id)
                        }}
                        className={cn(
                          'cursor-pointer relative p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all',
                          isSelected
                            ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50'
                            : 'border-slate-800 bg-slate-950/80 hover:border-slate-700',
                        )}
                      >
                        <img src={av.image} alt={av.name} className="w-12 h-12 rounded-lg object-cover" />
                        <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                          {av.name.split(' ')[0]}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                            ✓
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="cursor-pointer px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95"
                >
                  {isSavingEdit ? 'A guardar...' : 'Guardar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRMAÇÃO DE LOGOUT */}
      {/* ========================================================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mb-1">Terminar Sessão?</h3>
            <p className="text-xs text-slate-400 mb-6">Poderás voltar a entrar com a tua conta em qualquer altura.</p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white shadow-lg transition-all"
              >
                Sim, Terminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ZONA DE PERIGO - ELIMINAR CONTA */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white mb-2">Eliminar Conta Definitivamente?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-left">
              ⚠️ <strong>Atenção:</strong> Esta ação é irreversível e apagará permanentemente todo o teu progresso, XP acumulado, euros virtuais e itens cosméticos desbloqueados.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
              >
                {isDeleting ? 'A eliminar...' : 'Sim, Eliminar Tudo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
