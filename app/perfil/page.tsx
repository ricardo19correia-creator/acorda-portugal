'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, Trophy, Zap, Shield, Flame, Award, 
  ShoppingBag, Swords, CheckCircle2, Lock, Sparkles, MapPin, Building2, Check, Plus, Globe, 
  User, UserRound, Edit3, LogOut, Trash2, AlertTriangle, X, MessageSquare, 
  ChevronRight, BarChart3, HelpCircle, Star, Crown, BookOpen, Gift, CheckCheck,
  Mail, Key, RefreshCw, Eye, EyeOff, AlertCircle, ShieldCheck
} from 'lucide-react'
import { doc, updateDoc, setDoc, deleteDoc, onSnapshot, increment, arrayUnion, query, collection, limit } from 'firebase/firestore'
import { 
  signOut, 
  deleteUser, 
  updateProfile,
  verifyBeforeUpdateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification
} from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { useAuth } from '@/components/auth-provider'
import { performLogout, handleGoogleLogin } from '@/lib/auth-helpers'
import { UserAvatar } from '@/components/user-avatar'
import { avatarShopList, type AvatarItem } from '@/data/shopAvatars'
import {
  getAvatarById,
  getAvatarImage,
  normalizeAvatarId,
  DEFAULT_AVATAR,
  REAL_AVATARS,
} from '@/lib/avatars'
import { TITLE_SHOP_CATALOG, type TitleItem } from '@/data/shopTitles'
import { ARENA_SHOP_CATALOG, type ArenaItem } from '@/data/shopArenas'
import { TAUNT_PACKS, type TauntPack } from '@/data/tauntPacks'
import { OFFICIAL_EMOTES, DEFAULT_EQUIPPED_EMOTES, getEmoteById, getEmoteRarityBadge, type EmoteItem } from '@/src/data/emotes'
import { ANIMATED_FRAMES, type AnimatedFrame } from '@/data/frames'
import { playEmoteSound } from '@/lib/sound-engine'
import { ACHIEVEMENTS_LIST, type AchievementItem, type AchievementCategory } from '@/data/achievements'
import { ArenaEffectsLayer } from '@/components/ArenaEffectsLayer'
import { AppBackground } from '@/components/AppBackground'
import { DEFAULT_AVATAR_ID } from '@/data/constants'
import { calculateLevelProgress } from '@/lib/progression'
import { cn } from '@/lib/utils'

interface InventoryItem {
  id: string
  name: string
  category: 'avatars' | 'molduras' | 'arenas' | 'titulos' | 'taunts' | 'ajudas'
  description: string
  image?: string
  icon?: string
  badge?: string
  badgeColor?: string
  effect?: string
  price?: number | null
}

const getAvatarBadgeColor = (rarity: string) => {
  switch (rarity) {
    case 'Exclusivo':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    case 'Mítico':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
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
  ...ANIMATED_FRAMES.map((f) => ({
    id: f.id,
    name: f.name,
    category: 'molduras' as const,
    description: f.description,
    badge: f.rarity,
    badgeColor: getAvatarBadgeColor(f.rarity),
    price: f.price,
  })),
  ...ARENA_SHOP_CATALOG.map((ar) => ({
    id: ar.id,
    name: ar.name,
    category: 'arenas' as const,
    description: ar.description,
    image: ar.image,
    icon: ar.icon || '🏟️',
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

function PerfilContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') as 'inventario' | 'estatisticas' | 'conquistas' | 'historico' | null

  const { user, profile, profileLoading, authResolved } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [nationalRank, setNationalRank] = useState<number | null>(null)

  // Redirecionamento de utilizadores não autenticados
  useEffect(() => {
    if (authResolved && !user) {
      router.push('/entrar?redirect=/perfil')
    }
  }, [authResolved, user, router])
  
  // Perfil Base (100% Dinâmico do Firestore / Auth)
  const [displayName, setDisplayName] = useState<string>(() => profile?.displayName || user?.displayName || user?.email?.split('@')[0] || '')
  const [district, setDistrict] = useState<string>(() => profile?.district || '')
  const [avatar, setAvatar] = useState<string>(() => getAvatarImage((profile as any)?.equipped?.avatar || (profile as any)?.avatar || profile?.photoURL || user?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null)))
  const [equippedAvatarId, setEquippedAvatarId] = useState<string>(() => normalizeAvatarId((profile as any)?.equippedAvatar || (profile as any)?.avatarId || (typeof window !== 'undefined' ? localStorage.getItem('equipped_avatar_id') : null)))
  const [equippedFrame, setEquippedFrame] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_frame') : (profile as any)?.equippedFrame || (profile as any)?.equipped?.frameId || null))
  const [arena, setArena] = useState<string>(() => (profile as any)?.equippedArena || (profile as any)?.equipped?.arena || 'arena_1')
  const [title, setTitle] = useState<string>(() => (profile as any)?.equippedTitle || profile?.equipped?.title || '')
  const [equippedEmotes, setEquippedEmotes] = useState<string[]>(DEFAULT_EQUIPPED_EMOTES)
  const [testingEmoteId, setTestingEmoteId] = useState<string | null>(null)
  const [userCoins, setUserCoins] = useState<number>(() => profile?.coins ?? profile?.euros ?? 0)
  const [userXp, setUserXp] = useState<number>(() => profile?.xp ?? 0)
  const [userLevel, setUserLevel] = useState<number>(() => profile?.level ?? 1)

  // Abas Principais & Sub-Filtros
  const [activeTab, setActiveTab] = useState<'inventario' | 'estatisticas' | 'conquistas' | 'historico'>(
    initialTab === 'conquistas' || initialTab === 'estatisticas' || initialTab === 'historico' ? initialTab : 'inventario'
  )
  const [inventoryFilter, setInventoryFilter] = useState<'todos' | 'avatars' | 'molduras' | 'arenas' | 'titulos' | 'taunts' | 'ajudas'>('todos')
  const [achievementCategory, setAchievementCategory] = useState<AchievementCategory>('todas')
  
  // Conquistas Reclamadas
  const [claimedAchievements, setClaimedAchievements] = useState<Record<string, boolean>>({})

  // Consumíveis & Inventário Reais (Zero por defeito se não adquiridos)
  const [consumables, setConsumables] = useState<{ help5050: number; freezeTime: number; publicVote: number }>({
    help5050: (profile as any)?.inventory?.utilities?.fiftyFifty ?? (profile as any)?.consumables?.help5050 ?? 0,
    freezeTime: (profile as any)?.inventory?.utilities?.freezeTime ?? (profile as any)?.consumables?.freezeTime ?? 0,
    publicVote: (profile as any)?.inventory?.utilities?.publicVote ?? (profile as any)?.consumables?.publicVote ?? 0,
  })
  const [inventory, setInventory] = useState<{ avatars: string[]; frames: string[]; arenas: string[]; titles: string[]; taunts: string[] }>(() => {
    return {
      avatars: Array.isArray((profile as any)?.inventory?.avatars) && (profile as any).inventory.avatars.length > 0 ? (profile as any).inventory.avatars : [DEFAULT_AVATAR_ID],
      frames: Array.isArray((profile as any)?.inventory?.frames) ? (profile as any).inventory.frames : ['default'],
      arenas: Array.isArray((profile as any)?.inventory?.arenas) && (profile as any).inventory.arenas.length > 0 ? (profile as any).inventory.arenas : ['arena_1'],
      titles: Array.isArray((profile as any)?.inventory?.titles) && (profile as any).inventory.titles.length > 0 ? (profile as any).inventory.titles : ['tit_novico'],
      taunts: Array.isArray((profile as any)?.inventory?.taunts) ? (profile as any).inventory.taunts : ['pack_basico'],
    }
  })
  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => [
    DEFAULT_AVATAR_ID,
    'arena_1',
    'tit_novico',
    ...((profile as any)?.inventory?.avatars || []),
    ...((profile as any)?.inventory?.arenas || []),
    ...((profile as any)?.inventory?.titles || []),
    ...((profile as any)?.inventory?.taunts || []),
  ])

  // Modais de Ação
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [needsReauth, setNeedsReauth] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Identificação do Provedor de Conta (Google vs Email/Password)
  const isGoogleUser = useMemo(() => {
    return user?.providerData?.some((p) => p.providerId === 'google.com') || false
  }, [user])

  // Verificação de Email
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationSentMessage, setVerificationSentMessage] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  // Modal: Alterar Email
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [confirmNewEmail, setConfirmNewEmail] = useState('')
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null)
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null)
  const [emailRequiresRecentLogin, setEmailRequiresRecentLogin] = useState(false)

  // Modal: Alterar Palavra-passe
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)

  // Tradução amigável de erros de segurança de conta
  const mapAccountError = (error: any): string => {
    const code = error?.code || ''
    const message = error?.message || ''

    if (code === 'auth/requires-recent-login') {
      return 'Por segurança, confirma novamente a tua palavra-passe atual.'
    }
    if (code === 'auth/email-already-in-use') {
      return 'Esse email já está associado a outra conta.'
    }
    if (code === 'auth/invalid-email') {
      return 'Introduz um email válido.'
    }
    if (code === 'auth/weak-password') {
      return 'A palavra-passe não cumpre os requisitos de segurança (mínimo 6 caracteres).'
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'A palavra-passe atual está incorreta.'
    }
    if (code === 'auth/too-many-requests') {
      return 'Foram feitas demasiadas tentativas. Tenta novamente mais tarde.'
    }

    return message || 'Ocorreu um erro ao processar o pedido.'
  }

  // Reenviar email de verificação
  const handleSendVerification = async () => {
    if (!auth.currentUser) return
    setVerificationError(null)
    setVerificationSentMessage(null)
    setIsSendingVerification(true)

    try {
      await sendEmailVerification(auth.currentUser)
      setVerificationSentMessage('Email de verificação enviado! Verifica a tua caixa de correio.')
    } catch (err: any) {
      setVerificationError(mapAccountError(err))
    } finally {
      setIsSendingVerification(false)
    }
  }

  // Alterar Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailErrorMessage(null)
    setEmailSuccessMessage(null)

    const cleanNewEmail = newEmail.trim()
    const cleanConfirmNewEmail = confirmNewEmail.trim()

    if (!cleanNewEmail || !cleanConfirmNewEmail) {
      setEmailErrorMessage('Preenche todos os campos de email.')
      return
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!EMAIL_REGEX.test(cleanNewEmail)) {
      setEmailErrorMessage('Introduz um email válido.')
      return
    }

    if (cleanNewEmail.toLowerCase() !== cleanConfirmNewEmail.toLowerCase()) {
      setEmailErrorMessage('Os dois endereços de email não coincidem.')
      return
    }

    if (!auth.currentUser) {
      setEmailErrorMessage('Sessão expirada. Volta a entrar.')
      return
    }

    if (cleanNewEmail.toLowerCase() === auth.currentUser.email?.toLowerCase()) {
      setEmailErrorMessage('O novo email deve ser diferente do email atual.')
      return
    }

    setEmailLoading(true)

    try {
      if (emailCurrentPassword && auth.currentUser.email) {
        try {
          const credential = EmailAuthProvider.credential(auth.currentUser.email, emailCurrentPassword)
          await reauthenticateWithCredential(auth.currentUser, credential)
        } catch (reauthErr: any) {
          setEmailErrorMessage(mapAccountError(reauthErr))
          setEmailLoading(false)
          return
        }
      }

      await verifyBeforeUpdateEmail(auth.currentUser, cleanNewEmail)
      setEmailSuccessMessage('Enviámos um email de confirmação para o teu novo endereço.')
      setNewEmail('')
      setConfirmNewEmail('')
      setEmailCurrentPassword('')
      setEmailRequiresRecentLogin(false)
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        setEmailRequiresRecentLogin(true)
        setEmailErrorMessage('Por segurança, introduz a tua palavra-passe atual para confirmar a alteração.')
      } else {
        setEmailErrorMessage(mapAccountError(err))
      }
    } finally {
      setEmailLoading(false)
    }
  }

  // Alterar Palavra-passe
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrorMessage(null)
    setPasswordSuccessMessage(null)

    const cleanCurrent = currentPassword
    const cleanNew = newPassword
    const cleanConfirm = confirmNewPassword

    if (!cleanCurrent) {
      setPasswordErrorMessage('Introduz a tua palavra-passe atual.')
      return
    }

    if (!cleanNew || !cleanConfirm) {
      setPasswordErrorMessage('Preenche a nova palavra-passe e a sua confirmação.')
      return
    }

    if (cleanNew.length < 6) {
      setPasswordErrorMessage('A nova palavra-passe deve conter pelo menos 6 caracteres.')
      return
    }

    if (cleanNew !== cleanConfirm) {
      setPasswordErrorMessage('A nova palavra-passe e a confirmação não coincidem.')
      return
    }

    if (cleanNew === cleanCurrent) {
      setPasswordErrorMessage('A nova palavra-passe não pode ser igual à atual.')
      return
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setPasswordErrorMessage('Sessão expirada. Volta a entrar.')
      return
    }

    setPasswordLoading(true)

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, cleanCurrent)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, cleanNew)

      setPasswordSuccessMessage('Palavra-passe alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setPasswordErrorMessage(mapAccountError(err))
    } finally {
      setPasswordLoading(false)
    }
  }

  // Formulário do Modal de Edição
  const [editName, setEditName] = useState('')
  const [editDistrict, setEditDistrict] = useState('Lisboa')
  const [editAvatar, setEditAvatar] = useState(DEFAULT_AVATAR.image)
  const [editAvatarId, setEditAvatarId] = useState(DEFAULT_AVATAR.id)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    setMounted(true)
    // Sincronizar Posição no Ranking Nacional
    let unsubRank: (() => void) | undefined
    if (user?.uid) {
      try {
        const qRank = query(collection(db, 'publicProfiles'), limit(100))
        unsubRank = onSnapshot(qRank, (snap: any) => {
          if (!snap || snap.empty) {
            setNationalRank(1)
            return
          }
          const sorted = snap.docs.map((d: any) => ({
            id: d.id,
            xp: typeof d.data()?.xp === 'number' ? d.data().xp : 0,
          })).sort((a: { xp: number }, b: { xp: number }) => b.xp - a.xp)

          const idx = sorted.findIndex((p: { id: string }) => p.id === user.uid)
          if (idx !== -1) {
            setNationalRank(idx + 1)
          } else {
            const userXp = profile?.xp ?? 0
            const higher = sorted.filter((p: { xp: number }) => p.xp > userXp).length
            setNationalRank(higher + 1)
          }
        })
      } catch (e) {}
    }

    const syncProfile = () => {
      try {
        const savedName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || (typeof window !== 'undefined' ? localStorage.getItem('user_display_name') : null) || 'Conta'
        setDisplayName(savedName)

        const savedDistrict = profile?.district || (typeof window !== 'undefined' ? localStorage.getItem('user_district') : null) || 'Portugal'
        setDistrict(savedDistrict)

        const rawSavedAvatar = (profile as any)?.equipped?.avatar || (profile as any)?.avatar || profile?.photoURL || user?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('user_equipped_avatar') : null)
        const resolvedSavedAvatar = getAvatarImage(rawSavedAvatar)
        setAvatar(resolvedSavedAvatar)

        const rawSavedAvatarId = (profile as any)?.equippedAvatar || (profile as any)?.avatarId || (typeof window !== 'undefined' ? localStorage.getItem('equipped_avatar_id') : null) || rawSavedAvatar
        const resolvedSavedAvatarId = normalizeAvatarId(rawSavedAvatarId)
        setEquippedAvatarId(resolvedSavedAvatarId)

        const savedArena = (profile as any)?.equippedArena || (profile as any)?.equipped?.arena || (typeof window !== 'undefined' ? localStorage.getItem('equipped_arena') : null) || 'arena_1'
        if (savedArena) setArena(savedArena)

        const savedEmotes = typeof window !== 'undefined' ? localStorage.getItem('equipped_emotes') : null
        if (savedEmotes) {
          try { setEquippedEmotes(JSON.parse(savedEmotes)) } catch {}
        }
        const savedTitle = (profile as any)?.equippedTitle || profile?.equipped?.title || (profile as any)?.title || (typeof window !== 'undefined' ? localStorage.getItem('equipped_title') : null) || 'Membro Fundador'
        if (savedTitle) setTitle(savedTitle)

        const liveBalance = profile?.coins ?? profile?.euros ?? (typeof window !== 'undefined' ? Number(localStorage.getItem('user_coins') || localStorage.getItem('user_euros') || 0) : 0)
        setUserCoins(liveBalance)

        const currentXp = typeof profile?.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
        setUserXp(currentXp)
        setUserLevel(calculateLevelProgress(currentXp).currentLevel.level)

        if (profile?.claimedAchievements) {
          setClaimedAchievements(profile.claimedAchievements)
        }
        if (profile?.consumables) {
          setConsumables({
            help5050: typeof profile.consumables.help5050 === 'number' ? profile.consumables.help5050 : 0,
            freezeTime: typeof profile.consumables.freezeTime === 'number' ? profile.consumables.freezeTime : 0,
            publicVote: typeof (profile.consumables as any).publicVote === 'number' ? (profile.consumables as any).publicVote : 0,
          })
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
            if (typeof data.xp === 'number' && !isNaN(data.xp)) {
              const liveXp = Math.max(0, data.xp)
              setUserXp(liveXp)
              setUserLevel(calculateLevelProgress(liveXp).currentLevel.level)
            }
            if (data.claimedAchievements) {
              setClaimedAchievements(data.claimedAchievements)
              localStorage.setItem('user_claimed_achievements', JSON.stringify(data.claimedAchievements))
            }
            if (data.consumables) {
              setConsumables({
                help5050: typeof data.consumables.help5050 === 'number' ? data.consumables.help5050 : 0,
                freezeTime: typeof data.consumables.freezeTime === 'number' ? data.consumables.freezeTime : 0,
                publicVote: typeof data.consumables.publicVote === 'number' ? data.consumables.publicVote : 0,
              })
              localStorage.setItem('user_consumables', JSON.stringify(data.consumables))
            } else if (data.inventory?.utilities) {
              const utils = data.inventory.utilities
              setConsumables({
                help5050: typeof utils.fiftyFifty === 'number' ? utils.fiftyFifty : 0,
                freezeTime: typeof utils.freezeTime === 'number' ? utils.freezeTime : 0,
                publicVote: typeof utils.publicVote === 'number' ? utils.publicVote : 0,
              })
            } else {
              setConsumables({ help5050: 0, freezeTime: 0, publicVote: 0 })
            }
            if (data.inventory) {
              setInventory({
                avatars: Array.isArray(data.inventory.avatars) && data.inventory.avatars.length > 0 ? data.inventory.avatars : [DEFAULT_AVATAR_ID],
                frames: Array.isArray(data.inventory.frames) ? data.inventory.frames : ['default'],
                arenas: Array.isArray(data.inventory.arenas) && data.inventory.arenas.length > 0 ? data.inventory.arenas : ['arena_1'],
                titles: Array.isArray(data.inventory.titles) && data.inventory.titles.length > 0 ? data.inventory.titles : ['tit_novico'],
                taunts: Array.isArray(data.inventory.taunts) ? data.inventory.taunts : ['pack_basico'],
              })
              localStorage.setItem('user_inventory', JSON.stringify(data.inventory))
            }
            if (data.unlockedFrames && Array.isArray(data.unlockedFrames)) {
              setUnlockedItems((prev) => Array.from(new Set([...prev, ...data.unlockedFrames])))
              setInventory((prev) => ({ ...prev, frames: Array.from(new Set([...prev.frames, ...data.unlockedFrames])) }))
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
            if (data.equippedFrame || data.equipped?.frameId) {
              const fr = data.equippedFrame || data.equipped?.frameId
              setEquippedFrame(fr)
              localStorage.setItem('user_equipped_frame', fr)
            }
            if (data.equippedArena || data.equipped?.arena) {
              const ar = data.equipped?.arena || data.equippedArena
              setArena(ar)
              localStorage.setItem('equipped_arena', ar)
            }
            if (data.equippedEmotes || data.equipped?.emotes) {
              const em = data.equipped?.emotes || data.equippedEmotes
              if (Array.isArray(em)) {
                setEquippedEmotes(em)
                localStorage.setItem('equipped_emotes', JSON.stringify(em))
              }
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
    window.addEventListener('frameChanged', syncProfile)
    window.addEventListener('arenaChanged', syncProfile)
    window.addEventListener('titleChanged', syncProfile)
    window.addEventListener('consumables_updated', syncProfile)
    window.addEventListener('inventory_updated', syncProfile)
    window.addEventListener('balance_updated', syncProfile)
    window.addEventListener('storage', syncProfile)

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot()
      if (unsubRank) unsubRank()
      window.removeEventListener('avatarChanged', syncProfile)
      window.removeEventListener('arenaChanged', syncProfile)
      window.removeEventListener('titleChanged', syncProfile)
      window.removeEventListener('consumables_updated', syncProfile)
      window.removeEventListener('inventory_updated', syncProfile)
      window.removeEventListener('balance_updated', syncProfile)
      window.removeEventListener('storage', syncProfile)
    }
  }, [user, profile])

  // Ação de Equipar / Desequipar Provocações nos 4 Atalhos Rápidos 1v1
  const handleEquipEmote = async (emoteId: string) => {
    let updated = [...equippedEmotes]
    if (updated.includes(emoteId)) return
    if (updated.length >= 4) {
      updated = [emoteId, updated[0], updated[1], updated[2]]
      showToast('Provocação equipada nos teus 4 atalhos!')
    } else {
      updated.push(emoteId)
      showToast('Provocação adicionada aos teus atalhos de 1v1!')
    }
    const emoteItem = getEmoteById(emoteId)
    if (emoteItem) playEmoteSound(emoteItem.label)
    setEquippedEmotes(updated)
    localStorage.setItem('equipped_emotes', JSON.stringify(updated))
    localStorage.setItem('equipped_taunts', JSON.stringify(updated))
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          equippedEmotes: updated,
          'equipped.emotes': updated,
          equippedTaunts: updated,
          'equipped.taunts': updated,
        })
      } catch (e) {
        console.error(e)
      }
    }
    window.dispatchEvent(new Event('emotesChanged'))
    window.dispatchEvent(new Event('inventory_updated'))
  }

  const handleUnequipEmote = async (emoteId: string) => {
    if (equippedEmotes.length <= 1) {
      showToast('Precisas de manter pelo menos 1 provocação equipada!')
      return
    }
    const updated = equippedEmotes.filter((id) => id !== emoteId)
    setEquippedEmotes(updated)
    localStorage.setItem('equipped_emotes', JSON.stringify(updated))
    localStorage.setItem('equipped_taunts', JSON.stringify(updated))
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          equippedEmotes: updated,
          'equipped.emotes': updated,
          equippedTaunts: updated,
          'equipped.taunts': updated,
        })
      } catch (e) {
        console.error(e)
      }
    }
    window.dispatchEvent(new Event('emotesChanged'))
    window.dispatchEvent(new Event('inventory_updated'))
    showToast('Provocação desequipada do atalho.')
  }

  // Ação de Equipar Cosmético Universal
  const handleEquipItem = async (item: InventoryItem) => {
    if (item.category === 'avatars') {
      const imgToSet = getAvatarImage(item.image || item.id)
      const idToSet = normalizeAvatarId(item.id)
      setAvatar(imgToSet)
      setEquippedAvatarId(idToSet)
      localStorage.setItem('user_equipped_avatar', imgToSet)
      localStorage.setItem('user_equipped_avatar_id', idToSet)
      localStorage.setItem('equipped_avatar_id', idToSet)
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            equippedAvatar: idToSet,
            avatarId: idToSet,
            'equipped.avatar': imgToSet,
            'equipped.avatarId': idToSet,
            avatar: imgToSet,
            photoURL: imgToSet,
          })
          await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
            photoURL: imgToSet,
            avatar: imgToSet,
            avatarId: idToSet,
            'equipped.avatar': imgToSet,
            equippedAvatar: idToSet,
          }, { merge: true })
        } catch (e) {
          console.error(e)
        }
      }
      window.dispatchEvent(new Event('avatarChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      window.dispatchEvent(new Event('storage'))
      showToast(`Avatar "${item.name}" equipado com sucesso!`)
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

  // Ação de Reclamar Recompensa de Conquista
  const handleClaimAchievement = async (ach: AchievementItem) => {
    if (claimedAchievements[ach.id]) return

    const updatedClaimed = { ...claimedAchievements, [ach.id]: true }
    setClaimedAchievements(updatedClaimed)
    localStorage.setItem('user_claimed_achievements', JSON.stringify(updatedClaimed))

    // 1. Coins
    if (ach.reward.coins > 0) {
      setUserCoins((prev) => {
        const next = prev + ach.reward.coins
        localStorage.setItem('user_coins', String(next))
        localStorage.setItem('user_euros', String(next))
        return next
      })
    }

    // 2. Utilities
    if (ach.reward.utilities) {
      const f50 = ach.reward.utilities.fiftyFifty || 0
      const fz = ach.reward.utilities.freezeTime || 0
      const pv = (ach.reward.utilities as any).publicVote || 0
      setConsumables((prev) => {
        const next = {
          help5050: prev.help5050 + f50,
          freezeTime: prev.freezeTime + fz,
          publicVote: (prev.publicVote || 0) + pv,
        }
        localStorage.setItem('user_consumables', JSON.stringify(next))
        return next
      })
    }

    // 3. Titles
    if (ach.reward.title) {
      setInventory((prev) => ({
        ...prev,
        titles: Array.from(new Set([...prev.titles, ach.reward.title!])),
      }))
      setUnlockedItems((prev) => Array.from(new Set([...prev, ach.reward.title!])))
    }

    // 4. Firestore Sync
    if (auth.currentUser) {
      try {
        const updatePayload: any = {
          [`claimedAchievements.${ach.id}`]: true,
          coins: increment(ach.reward.coins),
          euros: increment(ach.reward.coins),
        }
        if (ach.reward.utilities?.fiftyFifty) {
          updatePayload['inventory.utilities.fiftyFifty'] = increment(ach.reward.utilities.fiftyFifty)
          updatePayload['consumables.help5050'] = increment(ach.reward.utilities.fiftyFifty)
        }
        if (ach.reward.utilities?.freezeTime) {
          updatePayload['inventory.utilities.freezeTime'] = increment(ach.reward.utilities.freezeTime)
          updatePayload['consumables.freezeTime'] = increment(ach.reward.utilities.freezeTime)
        }
        if ((ach.reward.utilities as any)?.publicVote) {
          updatePayload['inventory.utilities.publicVote'] = increment((ach.reward.utilities as any).publicVote)
          updatePayload['consumables.publicVote'] = increment((ach.reward.utilities as any).publicVote)
        }
        if (ach.reward.title) {
          updatePayload['inventory.titles'] = arrayUnion(ach.reward.title)
        }
        await updateDoc(doc(db, 'users', auth.currentUser.uid), updatePayload)
      } catch (e) {
        console.error(e)
      }
    }

    window.dispatchEvent(new Event('balance_updated'))
    window.dispatchEvent(new Event('consumables_updated'))
    window.dispatchEvent(new Event('inventory_updated'))
    showToast(`🎁 Recompensa Reclamada! +${ach.reward.coins.toLocaleString('pt-PT')} € Acorda adicionados!`)
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
      const permanentDistrict = district || 'Portugal'
      const rawAvatar = editAvatar || avatar
      const newAvatar = getAvatarImage(rawAvatar)
      const newAvatarId = normalizeAvatarId(editAvatarId || equippedAvatarId || rawAvatar)

      setDisplayName(newName)
      setDistrict(permanentDistrict)
      setAvatar(newAvatar)
      setEquippedAvatarId(newAvatarId)

      localStorage.setItem('user_display_name', newName)
      localStorage.setItem('user_district', permanentDistrict)
      localStorage.setItem('user_equipped_avatar', newAvatar)
      localStorage.setItem('user_equipped_avatar_id', newAvatarId)
      localStorage.setItem('equipped_avatar_id', newAvatarId)

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
          photoURL: newAvatar,
        })

        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: newName,
          name: newName,
          district: permanentDistrict,
          districtLocked: true,
          avatar: newAvatar,
          photoURL: newAvatar,
          avatarId: newAvatarId,
          equippedAvatar: newAvatarId,
          'equipped.avatar': newAvatar,
          'equipped.avatarId': newAvatarId,
        })

        await setDoc(doc(db, 'publicProfiles', auth.currentUser.uid), {
          displayName: newName,
          name: newName,
          district: permanentDistrict,
          avatar: newAvatar,
          photoURL: newAvatar,
          avatarId: newAvatarId,
          equippedAvatar: newAvatarId,
          'equipped.avatar': newAvatar,
        }, { merge: true })
      }

      window.dispatchEvent(new Event('avatarChanged'))
      window.dispatchEvent(new Event('inventory_updated'))
      window.dispatchEvent(new Event('storage'))
      showToast('Perfil atualizado com sucesso!')
      setIsEditModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast('Erro ao atualizar o perfil.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Logout de Sessão Definitivo
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      showToast('A terminar sessão...')
      await performLogout('/')
    } catch (err) {
      console.error('[LOGOUT ERROR]', err)
      window.location.href = '/'
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Reautenticação com Google para eliminação
  const handleReauthGoogle = async () => {
    if (!auth.currentUser) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const { GoogleAuthProvider, reauthenticateWithPopup } = await import('firebase/auth')
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await reauthenticateWithPopup(auth.currentUser, provider)
      setNeedsReauth(false)
      await handleDeleteAccount()
    } catch (e: any) {
      setDeleteError('Falha na reautenticação com a Google: ' + (e?.message || 'Tenta novamente.'))
      setIsDeleting(false)
    }
  }

  // Eliminar Conta Definitivamente com Limpeza em Cascata e Reautenticação Segura
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR') {
      setDeleteError('Por favor escreve "ELIMINAR" para confirmar a remoção permanente.')
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      setDeleteError('Sessão expirada. Inicia sessão novamente.')
      return
    }

    // Proteção de Segurança para a Conta Oficial
    if (
      currentUser.email === 'ricardo19correia@gmail.com' ||
      currentUser.uid === 'A4tBQnNi8ySw2lYUI7rlxAo2bKE2'
    ) {
      setDeleteError('Esta conta oficial de Administrador/Fundador está protegida contra eliminação.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const uid = currentUser.uid

      // Se for exigida reautenticação por password prévia
      if (needsReauth && deletePassword && currentUser.email) {
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, deletePassword)
          await reauthenticateWithCredential(currentUser, credential)
        } catch (credErr: any) {
          setIsDeleting(false)
          setDeleteError('A palavra-passe introduzida está incorreta.')
          return
        }
      }

      // 1. Apagar documento do Firestore primeiro (enquanto o utilizador ainda está autenticado)
      try {
        const userDocRef = doc(db, 'users', uid)
        await deleteDoc(userDocRef)
      } catch (e) {
        console.warn('[DELETE] Aviso ao apagar doc users:', e)
      }

      try {
        const publicDocRef = doc(db, 'publicProfiles', uid)
        await deleteDoc(publicDocRef)
      } catch (e) {
        console.warn('[DELETE] Aviso ao apagar doc publicProfiles:', e)
      }

      // 2. Apagar subcoleção walletTransactions se existir
      try {
        const { getDocs, collection } = await import('firebase/firestore')
        const txSnap = await getDocs(collection(db, 'users', uid, 'walletTransactions'))
        for (const d of txSnap.docs) {
          await deleteDoc(d.ref).catch(() => {})
        }
      } catch (e) {
        console.warn('[DELETE] Aviso ao limpar walletTransactions:', e)
      }

      // 3. Eliminar conta no Firebase Authentication com reautenticação se necessário
      try {
        await deleteUser(currentUser)
      } catch (authError: any) {
        // Se exigir login recente (auth/requires-recent-login), dispara popup de reautenticação
        if (authError?.code === 'auth/requires-recent-login' || authError?.code === 'auth/user-token-expired') {
          const isGoogle = currentUser.providerData.some((p) => p.providerId === 'google.com')
          if (isGoogle) {
            const { GoogleAuthProvider, reauthenticateWithPopup } = await import('firebase/auth')
            const provider = new GoogleAuthProvider()
            provider.setCustomParameters({ prompt: 'select_account' })
            await reauthenticateWithPopup(currentUser, provider)
            await deleteUser(currentUser)
          } else if (deletePassword && currentUser.email) {
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword)
            await reauthenticateWithCredential(currentUser, credential)
            await deleteUser(currentUser)
          } else {
            setNeedsReauth(true)
            setIsDeleting(false)
            setDeleteError(
              isGoogle
                ? 'Por motivos de segurança, clica no botão abaixo para reautenticar com o Google antes de eliminar.'
                : 'Por motivos de segurança, introduz a tua palavra-passe atual abaixo para confirmar a eliminação.'
            )
            return
          }
        } else {
          throw authError
        }
      }

      // 4. Limpeza total de cache local, storage e indexedDB
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        try {
          window.indexedDB.deleteDatabase('firebaseLocalStorageDb')
          window.indexedDB.deleteDatabase('firebase-heartbeat-database')
        } catch (e) {}
      }

      // 5. Redirecionar imediatamente para a página de confirmação /conta-eliminada
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
      window.location.href = '/conta-eliminada'
    } catch (err: any) {
      console.error('[DELETE ACCOUNT ERROR]', err)
      setIsDeleting(false)
      const code = err?.code || ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setDeleteError('A palavra-passe introduzida está incorreta.')
      } else if (code === 'auth/network-request-failed') {
        setDeleteError('Falha de ligação à rede. Verifica a tua conexão com a Internet.')
      } else if (code === 'auth/popup-closed-by-user') {
        setDeleteError('A janela de autenticação Google foi fechada antes de concluir.')
      } else {
        setDeleteError(err?.message || 'Ocorreu um erro ao eliminar a conta. Tenta novamente mais tarde.')
      }
    }
  }

  // Lista de Avatares Desbloqueados para o Seletor do Modal (Exclusivamente os 5 avatares reais)
  const availableUnlockedAvatars = useMemo(() => {
    return REAL_AVATARS
  }, [])

  // Cosméticos Desbloqueados no Inventário
  const unlockedCosmetics = useMemo(() => {
    return MASTER_PROFILE_CATALOG.filter((item) => {
      let isUnlocked = false

      if (item.category === 'avatars') {
        const isFree = item.id === DEFAULT_AVATAR_ID
        isUnlocked = isFree || inventory.avatars.includes(item.id) || unlockedItems.includes(item.id)
      } else if (item.category === 'molduras') {
        isUnlocked =
          item.id === 'default' ||
          inventory.frames.includes(item.id) ||
          unlockedItems.includes(item.id) ||
          ((profile as any)?.unlockedFrames && (profile as any)?.unlockedFrames.includes(item.id))
      } else if (item.category === 'arenas') {
        const isDefault = item.id === 'arena_1'
        isUnlocked = isDefault || inventory.arenas.includes(item.id) || unlockedItems.includes(item.id)
      } else if (item.category === 'titulos') {
        const isDefault = item.id === 'tit_novico' || item.name === 'Noviço da Nação'
        isUnlocked = 
          isDefault ||
          inventory.titles.includes(item.id) ||
          inventory.titles.includes(item.name) ||
          unlockedItems.includes(item.id) ||
          unlockedItems.includes(item.name)
      }

      if (!isUnlocked) return false
      if (inventoryFilter === 'todos') return true
      return item.category === inventoryFilter
    })
  }, [inventory, unlockedItems, inventoryFilter, profile])

  // Estatísticas de Conquistas Calculadas Dinamicamente
  const userAchievements = useMemo(() => {
    return ACHIEVEMENTS_LIST.map((ach) => {
      let progress = 0
      switch (ach.statKey) {
        case 'gamesPlayed':
          progress = profile?.gamesPlayed ?? 0
          break
        case 'questionsAnswered':
          progress = profile?.questionsAnswered ?? (profile?.totalQuestions ?? 0)
          break
        case 'level':
          progress = userLevel
          break
        case 'duelsWon':
          progress = (profile as any)?.stats?.duelsWon ?? (profile?.wins ?? 0)
          break
        case 'bestStreak':
          progress = profile?.bestStreak ?? 0
          break
        case 'historiaCorrect':
          progress = (profile as any)?.categoryStats?.historia?.correct ?? 0
          break
        case 'geografiaCorrect':
          progress = (profile as any)?.categoryStats?.geografia?.correct ?? 0
          break
        case 'desportoCorrect':
          progress = (profile as any)?.categoryStats?.desporto?.correct ?? 0
          break
        case 'culturaCorrect':
          progress = (profile as any)?.categoryStats?.cultura?.correct ?? 0
          break
        case 'simbolosCorrect':
          progress = (profile as any)?.categoryStats?.simbolos?.correct ?? 0
          break
        case 'districtGames':
          progress = (profile as any)?.categoryStats?.distrito?.games ?? 0
          break
        case 'districtsFaced':
          progress = (profile as any)?.stats?.districtsFaced ?? 0
          break
        case 'coins':
          progress = userCoins
          break
        case 'malucoGames':
          progress = (profile as any)?.categoryStats?.maluco?.games ?? 0
          break
        case 'malucoCorrect':
          progress = (profile as any)?.categoryStats?.maluco?.correct ?? 0
          break
        case 'isFounder':
          progress = (profile as any)?.isFounder ? 1 : 0
          break
        case 'isTop10':
          progress = nationalRank ? (nationalRank <= 10 ? 1 : 0) : 0
          break
        case 'isTop1':
          progress = nationalRank === 1 ? 1 : 0
          break
        default:
          progress = 0
      }

      const isCompleted = progress >= ach.maxProgress
      const isClaimed = Boolean(claimedAchievements[ach.id])
      const canClaim = isCompleted && !isClaimed

      return {
        ...ach,
        currentProgress: Math.min(progress, ach.maxProgress),
        isCompleted,
        isClaimed,
        canClaim,
      }
    })
  }, [profile, userLevel, userCoins, claimedAchievements, nationalRank])

  // Métricas Globais de Conquistas
  const totalAchievementsCount = userAchievements.length
  const completedAchievementsCount = userAchievements.filter((a) => a.isCompleted).length
  const claimableCount = userAchievements.filter((a) => a.canClaim).length
  const globalProgressPercentage = Math.round((completedAchievementsCount / totalAchievementsCount) * 100)

  // Conquistas Filtradas
  const filteredAchievements = useMemo(() => {
    if (achievementCategory === 'todas') return userAchievements
    return userAchievements.filter((a) => a.category === achievementCategory)
  }, [userAchievements, achievementCategory])

  // Estatísticas por Categoria (Performance Real de Quiz)
  const categoryStats = useMemo(() => {
    const userCatStats = (profile as any)?.categoryStats || {}
    return [
      {
        id: 'historia',
        name: 'História de Portugal',
        icon: '🏛️',
        accuracy:
          userCatStats.historia?.total > 0
            ? Math.round((userCatStats.historia.correct / userCatStats.historia.total) * 100)
            : profile?.totalQuestions && profile.totalQuestions > 0
              ? Math.round(((profile.correctAnswers || 0) / profile.totalQuestions) * 100)
              : 0,
        answered: userCatStats.historia?.total || (profile?.totalQuestions ? Math.round(profile.totalQuestions / 6) : 0),
        correct: userCatStats.historia?.correct || (profile?.correctAnswers ? Math.round(profile.correctAnswers / 6) : 0),
        levelName: 'Mestre da Lusitânia',
        gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
        borderColor: 'border-amber-500/40',
        barColor: 'bg-amber-500',
      },
      {
        id: 'geografia',
        name: 'Geografia & Território',
        icon: '🌍',
        accuracy:
          userCatStats.geografia?.total > 0
            ? Math.round((userCatStats.geografia.correct / userCatStats.geografia.total) * 100)
            : 0,
        answered: userCatStats.geografia?.total || 0,
        correct: userCatStats.geografia?.correct || 0,
        levelName: 'Navegador Cartógrafo',
        gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
        borderColor: 'border-emerald-500/40',
        barColor: 'bg-emerald-500',
      },
      {
        id: 'desporto',
        name: 'Desporto Nacional',
        icon: '⚽',
        accuracy:
          userCatStats.desporto?.total > 0
            ? Math.round((userCatStats.desporto.correct / userCatStats.desporto.total) * 100)
            : 0,
        answered: userCatStats.desporto?.total || 0,
        correct: userCatStats.desporto?.correct || 0,
        levelName: 'Campeão Ibérico',
        gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
        borderColor: 'border-blue-500/40',
        barColor: 'bg-blue-500',
      },
      {
        id: 'cultura',
        name: 'Cultura & Tradições',
        icon: '🎭',
        accuracy:
          userCatStats.cultura?.total > 0
            ? Math.round((userCatStats.cultura.correct / userCatStats.cultura.total) * 100)
            : 0,
        answered: userCatStats.cultura?.total || 0,
        correct: userCatStats.cultura?.correct || 0,
        levelName: 'Erudito das Beiras',
        gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
        borderColor: 'border-purple-500/40',
        barColor: 'bg-purple-500',
      },
      {
        id: 'simbolos',
        name: 'Símbolos & Gastronomia',
        icon: '🇵🇹',
        accuracy:
          userCatStats.simbolos?.total > 0
            ? Math.round((userCatStats.simbolos.correct / userCatStats.simbolos.total) * 100)
            : 0,
        answered: userCatStats.simbolos?.total || 0,
        correct: userCatStats.simbolos?.correct || 0,
        levelName: 'Paladar Lusitano',
        gradient: 'from-red-500/20 via-amber-500/10 to-transparent',
        borderColor: 'border-red-500/40',
        barColor: 'bg-red-500',
      },
      {
        id: 'maluco',
        name: 'Modo Maluco',
        icon: '🤪',
        accuracy:
          userCatStats.maluco?.total > 0
            ? Math.round((userCatStats.maluco.correct / userCatStats.maluco.total) * 100)
            : 0,
        answered: userCatStats.maluco?.total || 0,
        correct: userCatStats.maluco?.correct || 0,
        levelName: 'Maluco Veterano',
        gradient: 'from-yellow-500/20 via-lime-500/10 to-transparent',
        borderColor: 'border-yellow-500/40',
        barColor: 'bg-yellow-500',
      },
    ]
  }, [profile])

  if (!mounted || !authResolved || (profileLoading && !profile) || !user) {
    return (
      <div className="relative min-h-screen w-full bg-transparent text-white p-4 md:p-8 flex flex-col items-center justify-center overflow-x-hidden">
        <AppBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 bg-slate-900/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300 animate-pulse">A carregar o perfil oficial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-transparent text-white p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      {/* 1. FUNDO OFICIAL: PERFIL */}
      <AppBackground />

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
              <UserAvatar avatarUrl={avatar} activeFrame={equippedFrame} size="xl" isCurrentUser={true} />
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
                <span>ID: {user?.uid ? user.uid.slice(0, 8).toUpperCase() : '-'}</span>
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
            <span className="text-xl font-black text-emerald-400">
              {nationalRank ? `#${nationalRank}` : '-'}
            </span>
            <span className="text-xs text-slate-400">Posição Nacional</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Zap className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-xl font-black text-white">
              {profile?.totalQuestions && profile.totalQuestions > 0
                ? Math.round((profile.correctAnswers / profile.totalQuestions) * 100)
                : profile?.questionsAnswered && profile.questionsAnswered > 0
                  ? Math.round(((profile.correctAnswers || 0) / profile.questionsAnswered) * 100)
                  : (profile as any)?.stats?.accuracyRate ?? 0}%
            </span>
            <span className="text-xs text-slate-400">Taxa de Acerto</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Flame className="w-5 h-5 text-orange-400 mb-1" />
            <span className="text-xl font-black text-orange-400">
              {profile?.wins ?? (profile as any)?.stats?.duelsWon ?? 0}
            </span>
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
          className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${
            activeTab === 'conquistas'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 🏆 Conquistas &amp; Prestígio
          {claimableCount > 0 && (
            <span className="ml-1 px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-bounce">
              {claimableCount}
            </span>
          )}
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
                  onClick={() => setInventoryFilter('molduras')}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    inventoryFilter === 'molduras'
                      ? 'bg-purple-600 text-white shadow-md font-black'
                      : 'bg-slate-900/80 text-purple-300 hover:text-white border border-purple-500/30'
                  }`}
                >
                  Molduras Vivas ({unlockedCosmetics.filter((i) => i.category === 'molduras').length})
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 50/50 Card */}
                  <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                        ✨
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Ajuda 50/50</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Elimina duas opções erradas instantaneamente.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono text-sm font-black border border-cyan-400/40 shadow-inner">
                        x{consumables.help5050 || 0}
                      </span>
                      <Link
                        href="/loja"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition-all"
                      >
                        Loja
                      </Link>
                    </div>
                  </div>

                  {/* Pergunta ao Público Card */}
                  <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                        👥
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Pergunta ao Público</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Votação simulada da plateia com percentagens.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono text-sm font-black border border-purple-400/40 shadow-inner">
                        x{consumables.publicVote || 0}
                      </span>
                      <Link
                        href="/loja"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-purple-500 hover:text-slate-950 text-slate-200 transition-all"
                      >
                        Loja
                      </Link>
                    </div>
                  </div>

                  {/* Congelar Tempo Card */}
                  <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                        ⏳
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Congelar (+15s)</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">Pausa o cronómetro e dá tempo extra.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-sm font-black border border-amber-400/40 shadow-inner">
                        x{consumables.freezeTime || 0}
                      </span>
                      <Link
                        href="/loja"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all"
                      >
                        Loja
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO: COSMÉTICOS (AVATARES, MOLDURAS, ARENAS, TÍTULOS) */}
            {(inventoryFilter === 'todos' || inventoryFilter === 'avatars' || inventoryFilter === 'molduras' || inventoryFilter === 'arenas' || inventoryFilter === 'titulos') && (
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-purple-400" /> Coleção de Cosméticos Ativos
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedCosmetics.map((item) => {
                    const isEquipped = 
                      (item.category === 'avatars' && (avatar === item.image || equippedAvatarId === item.id || normalizeAvatarId(avatar) === normalizeAvatarId(item.id))) ||
                      (item.category === 'molduras' && equippedFrame === item.id) ||
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
                            ) : item.category === 'molduras' ? (
                              <div className="w-full h-36 flex flex-col items-center justify-center p-2">
                                <UserAvatar avatarUrl={avatar} activeFrame={item.id} size="lg" showBadge={false} />
                              </div>
                            ) : item.category === 'arenas' ? (
                              <div className="relative w-full h-36 overflow-hidden bg-slate-950">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                                    <span className="text-3xl mb-1 filter drop-shadow-md">
                                      {item.icon || '🏟️'}
                                    </span>
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                                      {item.name}
                                    </span>
                                  </div>
                                )}
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
                          {(item as any).meaning && (
                            <p className="text-[11px] text-amber-300/90 italic mt-1 font-medium border-l border-amber-500/50 pl-1.5 leading-snug line-clamp-2">
                              “{(item as any).meaning}”
                            </p>
                          )}
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

            {/* SEÇÃO: EMOTES & REAÇÕES 1V1 (8 SLOTS EQUIPADOS) */}
            {(inventoryFilter === 'todos' || inventoryFilter === 'taunts') && (
              <div className="space-y-6">
                {/* 1. PAINEL DE 8 SLOTS EQUIPADOS NO HUD 1V1 */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-purple-950/30 border border-purple-500/30 shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-400" /> 4 Atalhos de Provocações & Reações (1v1)
                      </h2>
                      <p className="text-xs text-slate-400">Estes 4 atalhos rápidos ficam imediatamente disponíveis no botão 💬 durante as tuas partidas 1v1 em tempo real.</p>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                      {Math.min(4, equippedEmotes.length)} / 4 Atalhos Ativos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, slotIdx) => {
                      const emoteId = equippedEmotes[slotIdx]
                      const emote = emoteId ? getEmoteById(emoteId) : null

                      return (
                        <div
                          key={slotIdx}
                          className={cn(
                            'relative flex flex-col justify-between p-3 rounded-2xl border transition-all min-h-[95px]',
                            emote
                              ? 'bg-slate-950/80 border-purple-500/40 shadow-lg shadow-purple-950/30'
                              : 'bg-slate-950/30 border-dashed border-slate-800 items-center justify-center text-center'
                          )}
                        >
                          <span className="absolute top-2 left-2 text-[9px] font-black uppercase text-slate-500">
                            Slot {slotIdx + 1}
                          </span>

                          {emote ? (
                            <>
                              <button
                                onClick={() => handleUnequipEmote(emote.id)}
                                title="Desequipar deste slot"
                                className="absolute top-2 right-2 text-slate-400 hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-2xl">{emote.emoji}</span>
                                <div className="min-w-0">
                                  <p className="font-display text-xs font-black text-white truncate">{emote.label}</p>
                                  <span className={cn('text-[8px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5', getEmoteRarityBadge(emote.rarity))}>
                                    {emote.rarity}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-600">Vazio</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. CATÁLOGO DE TODOS OS EMOTES DISPONÍVEIS */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" /> Todos os Emotes Desbloqueados & da Coleção
                      </h3>
                      <p className="text-xs text-slate-400">Equipa ou testa as animações das tuas reações antes de entrar na arena 1v1.</p>
                    </div>
                    <Link
                      href="/loja"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Obter Mais na Loja
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {OFFICIAL_EMOTES.map((emote) => {
                      const isUnlocked =
                        emote.id === 'pack_basico' ||
                        DEFAULT_EQUIPPED_EMOTES.includes(emote.id) ||
                        inventory.taunts.includes(emote.id) ||
                        unlockedItems.includes(emote.id)
                      const isEquipped = equippedEmotes.includes(emote.id)

                      return (
                        <div
                          key={emote.id}
                          className={cn(
                            'p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all flex flex-col justify-between',
                            isEquipped
                              ? 'bg-gradient-to-br from-slate-900/90 to-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
                              : isUnlocked
                              ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/60 border-slate-800 opacity-60'
                          )}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={cn('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border', getEmoteRarityBadge(emote.rarity))}>
                                {emote.rarity}
                              </span>
                              {isEquipped ? (
                                <span className="text-[10px] font-black text-purple-300 bg-purple-950/80 border border-purple-500/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Equipado
                                </span>
                              ) : isUnlocked ? (
                                <span className="text-[10px] font-bold text-emerald-400">Desbloqueado</span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-400 font-mono">€{emote.price.toLocaleString('pt-PT')}</span>
                              )}
                            </div>

                            {/* Preview Animation Bubble */}
                            <div className="relative w-full h-28 rounded-xl bg-slate-950/90 border border-slate-800 p-3 flex flex-col items-center justify-center mb-3 overflow-hidden">
                              <div className={cn(
                                'transition-all duration-300 transform',
                                testingEmoteId === emote.id ? 'scale-115 animate-bounce' : 'scale-100'
                              )}>
                                <div className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-white/20 px-3.5 py-1.5 shadow-lg">
                                  <span className="text-2xl">{emote.emoji}</span>
                                  <span className="font-display text-xs font-black text-white">{emote.label}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  playEmoteSound(emote.label)
                                  setTestingEmoteId(emote.id)
                                  setTimeout(() => setTestingEmoteId(null), 2500)
                                }}
                                className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition cursor-pointer"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-purple-300" />
                                <span>{testingEmoteId === emote.id ? 'A Testar...' : 'Testar'}</span>
                              </button>
                            </div>

                            <h4 className="font-display text-sm font-black text-white">{emote.text}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Reação rápida ({emote.category}).</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                            {isEquipped ? (
                              <button
                                onClick={() => handleUnequipEmote(emote.id)}
                                className="cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600/80 text-rose-300 hover:text-white transition-all shadow-sm"
                              >
                                Desequipar
                              </button>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => handleEquipEmote(emote.id)}
                                className="cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all active:scale-95 flex items-center gap-1"
                              >
                                Equipar no Slot
                              </button>
                            ) : (
                              <Link
                                href="/loja"
                                className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-xl hover:bg-amber-500/30 transition-all shadow-sm flex items-center gap-1"
                              >
                                <span>Comprar na Loja</span>
                                <span>→</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
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
                Total: {profile?.totalQuestions || profile?.questionsAnswered || 0} Questões
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
        {/* ABA 3: CONQUISTAS & PRESTÍGIO (COM SISTEMA DE CLAIM) */}
        {/* ========================================================= */}
        {activeTab === 'conquistas' && (
          <div className="space-y-6">
            {/* Header da Aba Conquistas com Progresso Global */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    Quadro de Conquistas &amp; Prestígio
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conclui desafios nacionais para ganhar moedas, títulos honoríficos e ajudas de jogo.
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-sm font-black text-amber-300 font-mono">
                    {completedAchievementsCount} / {totalAchievementsCount} Desbloqueadas ({globalProgressPercentage}%)
                  </span>
                  {claimableCount > 0 && (
                    <p className="text-xs font-black text-emerald-400 flex items-center sm:justify-end gap-1 mt-0.5 animate-pulse">
                      <Gift className="w-3.5 h-3.5" /> {claimableCount} {claimableCount === 1 ? 'Recompensa pronta' : 'Recompensas prontas'} para reclamar!
                    </p>
                  )}
                </div>
              </div>

              {/* Barra de Progresso Dourada Global */}
              <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800 p-0.5 overflow-hidden shadow-inner relative z-10">
                <div
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  style={{ width: `${globalProgressPercentage}%` }}
                />
              </div>

              {/* Filtros por Categoria de Conquista */}
              <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-slate-800/80 relative z-10">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'geral', label: 'Geral' },
                  { id: 'duelos', label: 'Duelos 1v1' },
                  { id: 'sequencias', label: 'Sequências' },
                  { id: 'categorias', label: 'Categorias' },
                  { id: 'distritos', label: 'Distritos' },
                  { id: 'economia', label: 'Economia' },
                  { id: 'maluco', label: 'Modo Maluco' },
                  { id: 'especiais', label: 'Especiais' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAchievementCategory(f.id as AchievementCategory)}
                    className={cn(
                      'cursor-pointer px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                      achievementCategory === f.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grelha de Conquistas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((ach) => {
                const percent = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100))

                return (
                  <div
                    key={ach.id}
                    className={cn(
                      'p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-all flex flex-col justify-between relative overflow-hidden',
                      ach.canClaim
                        ? 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-emerald-950/30 border-amber-500/70 ring-2 ring-amber-500/40 shadow-amber-500/10'
                        : ach.isClaimed
                          ? 'bg-slate-900/90 border-emerald-500/30'
                          : ach.isCompleted
                            ? 'bg-slate-900/80 border-slate-700'
                            : 'bg-slate-950/60 border-slate-800/80 opacity-75',
                    )}
                  >
                    <div>
                      {/* Top Row: Icon, Category Badge & Status */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border shadow-inner',
                            ach.canClaim
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-bounce'
                              : ach.isClaimed
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-slate-800/80 border-slate-700 text-slate-400',
                          )}>
                            {ach.icon}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-sm text-white">{ach.title}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {ach.categoryLabel}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ach.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="my-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Progresso</span>
                          <span className={ach.isCompleted ? 'text-emerald-400 font-black' : 'text-slate-400'}>
                            {ach.currentProgress.toLocaleString('pt-PT')} / {ach.maxProgress.toLocaleString('pt-PT')} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-700',
                              ach.canClaim
                                ? 'bg-gradient-to-r from-amber-400 to-emerald-400 animate-pulse'
                                : ach.isClaimed
                                  ? 'bg-emerald-500'
                                  : 'bg-primary/80',
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Rewards & Action Claim Button */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Badges de Recompensa */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ach.reward.coins > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-black text-amber-300 shadow-sm">
                            <span>🪙</span> +{ach.reward.coins.toLocaleString('pt-PT')} €
                          </span>
                        )}

                        {ach.reward.title && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-[11px] font-black text-purple-300 shadow-sm">
                            <span>🏷️</span> «{ach.reward.title}»
                          </span>
                        )}

                        {ach.reward.utilities?.fiftyFifty && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-black text-cyan-300 shadow-sm">
                            <span>✨</span> +{ach.reward.utilities.fiftyFifty}x 50/50
                          </span>
                        )}

                        {ach.reward.utilities?.freezeTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/40 text-[11px] font-black text-blue-300 shadow-sm">
                            <span>⏳</span> +{ach.reward.utilities.freezeTime}x Congelar
                          </span>
                        )}
                      </div>

                      {/* Botão de Reclamação */}
                      <div>
                        {ach.canClaim ? (
                          <button
                            type="button"
                            onClick={() => handleClaimAchievement(ach)}
                            className="cursor-pointer px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                          >
                            <Gift className="w-3.5 h-3.5 fill-current" />
                            <span>Reclamar Prémio</span>
                          </button>
                        ) : ach.isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Reclamado
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-500 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                            Em Progresso
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: HISTÓRICO DE DUELOS */}
        {/* ========================================================= */}
        {activeTab === 'historico' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Swords className="w-4 h-4 text-purple-400" /> Histórico de Confrontos 1v1
              </h3>
              <span className="text-xs text-slate-400">
                Total: {profile?.gamesPlayed ?? (profile as any)?.stats?.totalDuels ?? 0} Duelos
              </span>
            </div>

            {/* Resumo Estatístico do Histórico 1v1 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-1">Vitórias</span>
                <span className="text-lg font-black text-emerald-400">
                  {profile?.wins ?? (profile as any)?.stats?.duelsWon ?? 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-1">Derrotas</span>
                <span className="text-lg font-black text-rose-400">
                  {Math.max(0, (profile?.gamesPlayed ?? 0) - (profile?.wins ?? 0))}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block mb-1">Taxa de Vitória</span>
                <span className="text-lg font-black text-cyan-400">
                  {profile?.gamesPlayed && profile.gamesPlayed > 0
                    ? Math.round(((profile.wins || 0) / profile.gamesPlayed) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            {(!profile?.gamesPlayed || profile.gamesPlayed === 0) && (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto text-xl">
                  ⚔️
                </div>
                <p className="text-sm font-bold text-slate-300">Nenhum duelo registado ainda</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Entra na Arena de Duelos 1v1 para desafiar outros jogadores e acumular vitórias no teu histórico oficial.
                </p>
                <Link
                  href="/jogar/duelo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/30"
                >
                  <Swords className="w-4 h-4" /> Jogar Duelo 1v1
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECÇÃO: SEGURANÇA E CONTA */}
      {/* ========================================================= */}
      <div className="w-full max-w-5xl mt-12 pt-8 border-t border-slate-800/80">
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
          {/* Cabeçalho da Secção */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Segurança e conta</h4>
                <p className="text-xs text-slate-400">Gere o teu método de acesso, credenciais e verificação de identidade.</p>
              </div>
            </div>

            {isGoogleUser ? (
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold shadow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Conta Google
              </span>
            ) : (
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm">
                <Mail className="w-3.5 h-3.5" />
                Conta Email / Palavra-passe
              </span>
            )}
          </div>

          {/* Grelha de Informações de Segurança */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Bloco 1: Email */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Email da Conta</span>
                <p className="text-sm font-bold text-white truncate">{user?.email || 'Nenhum email associado'}</p>
                
                {/* Estado de Verificação */}
                <div className="mt-2.5 flex items-center gap-2">
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Email verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Email não verificado
                    </span>
                  )}
                </div>

                {!user?.emailVerified && !isGoogleUser && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={isSendingVerification}
                      className="cursor-pointer text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-500/50 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <RefreshCw className={cn("w-3 h-3", isSendingVerification && "animate-spin")} />
                      <span>{isSendingVerification ? 'A enviar...' : 'Reenviar email de verificação'}</span>
                    </button>
                    {verificationSentMessage && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-1.5">{verificationSentMessage}</p>
                    )}
                    {verificationError && (
                      <p className="text-[11px] text-rose-400 font-medium mt-1.5">{verificationError}</p>
                    )}
                  </div>
                )}
              </div>

              {!isGoogleUser && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailErrorMessage(null)
                      setEmailSuccessMessage(null)
                      setIsEmailModalOpen(true)
                    }}
                    className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alterar email</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bloco 2: Palavra-passe / Google Info */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  {isGoogleUser ? 'Método de Autenticação' : 'Palavra-passe'}
                </span>

                {isGoogleUser ? (
                  <div className="mt-1">
                    <p className="text-sm font-bold text-slate-200">Esta conta utiliza o Google para autenticação.</p>
                    <p className="text-xs text-slate-400 mt-1">A gestão de credenciais e segurança é assegurada diretamente pela Google.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-mono tracking-widest text-slate-300 font-bold">••••••••••••</p>
                    <p className="text-[11px] text-slate-400 mt-1">Protegida por cifra padrão Firebase Authentication.</p>
                  </div>
                )}
              </div>

              {!isGoogleUser && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordErrorMessage(null)
                      setPasswordSuccessMessage(null)
                      setIsPasswordModalOpen(true)
                    }}
                    className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alterar palavra-passe</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Zona de Perigo & Ações Globais da Conta */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Conectado como <strong>{user?.email || displayName}</strong> • Todos os dados guardados em nuvem.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm active:scale-95"
              >
                Terminar Sessão
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECÇÃO: SUPORTE & REPORTE DE PROBLEMAS */}
      {/* ========================================================= */}
      <div className="w-full max-w-5xl mt-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/40 p-6 sm:p-8 text-center backdrop-blur-2xl shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 mb-3">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Problemas &amp; Assistência</span>
            </div>

            <h4 className="font-display text-xl sm:text-2xl font-black uppercase text-white">
              Precisas de Ajuda ou Encontraste um Erro?
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              A nossa equipa está pronta para ajudar. Reporta qualquer anomalia técnica ou entra em contacto direto.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center">
              <a
                href={`mailto:suporte@acordaportugal.pt?subject=${encodeURIComponent('[Reporte de Erro / Suporte] - Acorda Portugal')}&body=${encodeURIComponent(`Descrição detalhada do problema:\n\n---\nNome de Utilizador (se aplicável): ${displayName || user?.displayName || ''}\nDispositivo / Navegador:`)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-7 py-3.5 font-display text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 hover:scale-105 hover:brightness-110 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
              >
                <AlertCircle className="h-4 w-4 text-slate-950" />
                <span>⚠️ REPORTAR UM PROBLEMA</span>
              </a>

              <p className="mt-4 text-xs text-slate-400">
                Para suporte geral, dúvidas ou parcerias:{' '}
                <a
                  href="mailto:suporte@acordaportugal.pt"
                  className="underline hover:opacity-80 transition-opacity text-emerald-400"
                >
                  suporte@acordaportugal.pt
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ALTERAR EMAIL */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5 text-indigo-400" /> Alterar Email da Conta
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Email atual: <strong>{user?.email}</strong>
            </p>

            {emailErrorMessage && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{emailErrorMessage}</span>
              </div>
            )}

            {emailSuccessMessage && (
              <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{emailSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Novo Endereço de Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="novo.email@exemplo.pt"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:outline-none text-sm text-white font-medium shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmar Novo Email
                </label>
                <input
                  type="email"
                  value={confirmNewEmail}
                  onChange={(e) => setConfirmNewEmail(e.target.value)}
                  required
                  placeholder="Confirma o novo email"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:outline-none text-sm text-white font-medium shadow-inner"
                />
              </div>

              {emailRequiresRecentLogin && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">
                    Palavra-passe Atual (Confirmação de Segurança)
                  </label>
                  <input
                    type="password"
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    required
                    placeholder="A tua palavra-passe atual"
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-amber-500/50 focus:border-amber-400 focus:outline-none text-sm text-white font-medium"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {emailLoading ? 'A processar...' : 'Guardar Novo Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ALTERAR PALAVRA-PASSE */}
      {/* ========================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-1">
              <Lock className="w-5 h-5 text-indigo-400" /> Alterar Palavra-passe
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Introduz a tua palavra-passe atual para definir uma nova chave de acesso.
            </p>

            {passwordErrorMessage && (
              <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordErrorMessage}</span>
              </div>
            )}

            {passwordSuccessMessage && (
              <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Palavra-passe Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="A tua palavra-passe atual"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:outline-none text-sm text-white font-medium pr-10 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:outline-none text-sm text-white font-medium pr-10 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmar Nova Palavra-passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    minLength={6}
                    required
                    placeholder="Confirma a nova palavra-passe"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-400 focus:outline-none text-sm text-white font-medium pr-10 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {passwordLoading ? 'A guardar...' : 'Alterar Palavra-passe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              {/* Distrito e Cidade Permanentes / Imutáveis */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Distrito de Representação
                  </label>
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300 font-bold shadow-inner">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{district || profile?.district || 'Portugal'}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/40 shrink-0">
                      <Lock className="w-3 h-3" />
                      Imutável
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Cidade de Representação
                  </label>
                  <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-300 font-bold shadow-inner">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{profile?.city || profile?.representedCity || district || 'Portugal'}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/40 shrink-0">
                      <Lock className="w-3 h-3" />
                      Imutável
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                * A tua afiliação territorial (distrito e cidade) é definitiva e intransferível para garantir a integridade dos rankings nacionais e regionais.
              </p>

              {/* Seletor de Avatar Ativo */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Escolher Avatar Ativo
                  </label>
                  <Link
                    href="/loja"
                    className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" /> Obter Mais na Loja
                  </Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-2.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                  {REAL_AVATARS.map((avatarItem) => {
                    const isFree = avatarItem.currency === 'free' || avatarItem.id === 'camoes_2050' || avatarItem.price === 'Grátis' || avatarItem.price === 0
                    const isOwned = isFree || inventory.avatars.includes(avatarItem.id) || unlockedItems.includes(avatarItem.id)
                    const isSelected = editAvatar === avatarItem.image || editAvatarId === avatarItem.id

                    return (
                      <div key={avatarItem.id} className="relative group">
                        <button
                          type="button"
                          disabled={!isOwned}
                          onClick={() => {
                            if (isOwned) {
                              if (avatarItem.image) setEditAvatar(avatarItem.image)
                              setEditAvatarId(avatarItem.id)
                            }
                          }}
                          className={cn(
                            'w-full relative aspect-square p-1.5 rounded-2xl border-2 flex flex-col items-center justify-between transition-all select-none',
                            isOwned
                              ? isSelected
                                ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 cursor-pointer shadow-md'
                                : 'border-slate-800 bg-slate-950/80 hover:border-slate-600 cursor-pointer'
                              : 'border-red-900/60 bg-slate-950/90 cursor-not-allowed'
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={avatarItem.image}
                            alt={avatarItem.name}
                            className={cn(
                              'w-12 h-12 rounded-xl object-cover transition-all',
                              !isOwned && 'opacity-30 grayscale'
                            )}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_AVATAR.image
                            }}
                          />

                          <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center mt-1" title={avatarItem.name}>
                            {avatarItem.name}
                          </span>

                          {/* Marcador de Seleção Ativa */}
                          {isSelected && isOwned && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md">
                              ✓
                            </div>
                          )}

                          {/* Máscara e ícone de Cadeado para itens não comprados */}
                          {!isOwned && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center p-1 backdrop-blur-[0.5px]">
                              <Lock className="w-5 h-5 text-red-400 animate-pulse" />
                              <span className="text-[10px] text-red-400 font-bold uppercase mt-1">Loja</span>
                            </div>
                          )}
                        </button>
                      </div>
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
            <p className="text-xs text-slate-400 mb-6">
              Todos os teus dados de progresso e saldo estão guardados na nuvem. Poderás voltar a entrar a qualquer momento.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutModalOpen(false)}
                className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isLoggingOut && <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                <span>{isLoggingOut ? 'A sair...' : 'Sim, Terminar Sessão'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ZONA DE PERIGO - ELIMINAR CONTA */}
      {/* ========================================================= */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center my-8">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white mb-2">Eliminar Conta Definitivamente?</h3>
            <div className="text-xs text-slate-300 leading-relaxed mb-5 bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-xl text-left space-y-1.5">
              <p className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                Esta ação é irreversível e permanente.
              </p>
              <p className="text-[11px] text-slate-400">
                Serão apagados todos os teus dados: perfil, progresso de nível, moedas virtuais, cosméticos desbloqueados e histórico de partidas.
              </p>
            </div>

            {/* Caixa de Erro */}
            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-semibold text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Campo de Confirmação por Texto */}
            <div className="space-y-3 mb-6 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Para confirmar, escreve <span className="text-rose-400 font-mono font-black">ELIMINAR</span> abaixo:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-white font-mono text-sm tracking-wider uppercase placeholder:normal-case placeholder:text-slate-600 transition-all"
                />
              </div>

              {/* Se for necessária reautenticação */}
              {needsReauth && (
                <div className="pt-2 border-t border-slate-800 space-y-3 animate-fade-in">
                  {auth.currentUser?.providerData.some((p) => p.providerId === 'google.com') ? (
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleReauthGoogle}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <span>Reautenticar com Google</span>
                    </button>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Palavra-passe Atual:
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="A tua palavra-passe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 text-white text-sm transition-all"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteConfirmationText('')
                  setDeletePassword('')
                  setDeleteError(null)
                  setNeedsReauth(false)
                }}
                className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmationText.trim().toUpperCase() !== 'ELIMINAR'}
                onClick={handleDeleteAccount}
                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting && <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                <span>{isDeleting ? 'A eliminar conta...' : 'Sim, Eliminar Tudo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <PerfilContent />
    </Suspense>
  )
}
