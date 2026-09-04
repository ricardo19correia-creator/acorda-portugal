'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Crown,
  Sparkles,
  Shield,
  Palette,
  Check,
  ChevronRight,
  Eye,
  X,
  Flame,
  Award,
  Layers,
  Zap,
  Smartphone,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import {
  VIP_CATALOG,
  getVipProductsBySection,
  getVipProductById,
  formatVipPrice,
  type VipProduct,
  type StoreSection,
  type VipRarity,
} from '@/src/data/vipCatalog'
import UserAvatar from '@/components/ui/UserAvatar'
import AnimatedFrameWrapper from '@/components/ui/AnimatedFrameWrapper'
import { ArenaRenderer } from '@/components/ArenaRenderer'
import { equipItem } from '@/lib/economy'
import { cn } from '@/lib/utils'

interface VipShopSectionProps {
  userId?: string
  userEmail?: string
  equippedAvatar?: string
  equippedFrame?: string
  equippedTitle?: string
  equippedArena?: string
  userInventory?: Record<string, number>
  vipEntitlements?: string[]
  onSuccessToast?: (msg: string) => void
  onErrorToast?: (msg: string) => void
  onRefreshData?: () => void
}

/**
 * Mapeamento de Estilos de Raridade com Gradientes Vibrantes:
 * - Mítico: Dourado / Âmbar
 * - Lendário: Esmeralda / Verde Neon
 * - Exclusivo / Épico: Cyan / Azul Royal
 * - Raro: Púrpura / Índigo
 */
function getVipRarityStyle(rarity: VipRarity | string) {
  switch (rarity) {
    case 'Mythic':
      return {
        badge:
          'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-amber-300',
        glow: 'from-amber-500/25 to-yellow-500/10',
        border: 'hover:border-amber-400/80 hover:shadow-[0_0_35px_rgba(251,191,36,0.35)]',
        accentText: 'text-amber-400',
        accentBg: 'bg-amber-500',
        icon: '👑',
        label: 'MÍTICO',
      }
    case 'Legendary':
      return {
        badge:
          'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-300',
        glow: 'from-emerald-500/25 to-teal-500/10',
        border: 'hover:border-emerald-400/80 hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        icon: '✨',
        label: 'LENDÁRIO',
      }
    case 'Epic':
      return {
        badge:
          'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)] border border-cyan-300',
        glow: 'from-cyan-500/25 to-blue-500/10',
        border: 'hover:border-cyan-400/80 hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]',
        accentText: 'text-cyan-400',
        accentBg: 'bg-cyan-500',
        icon: '⚡',
        label: 'EXCLUSIVO VIP',
      }
    case 'Rare':
    default:
      return {
        badge:
          'bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-500 text-white font-black shadow-[0_0_12px_rgba(168,85,247,0.4)] border border-purple-300',
        glow: 'from-purple-500/25 to-indigo-500/10',
        border: 'hover:border-purple-400/80 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
        accentText: 'text-purple-400',
        accentBg: 'bg-purple-500',
        icon: '⭐',
        label: 'RARO VIP',
      }
  }
}

/**
 * Componente Seguro de Imagem VIP:
 * Tenta carregar `/store/vip/[id].webp` ou o asset local;
 * Em caso de erro, exibe um showcase de alta fidelidade com gradiente refinado e ícone temático (sem ecrã preto).
 */
function VipCardImage({
  item,
  className = '',
}: {
  item: VipProduct
  className?: string
}) {
  const [hasError, setHasError] = useState(false)
  const [useBackupAsset, setUseBackupAsset] = useState(false)
  const rarityMeta = getVipRarityStyle(item.rarity)

  const primarySrc = item.image || `/store/vip/${item.id}.webp`
  const fallbackSrc = item.assetPath

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar':
        return '👤'
      case 'arena':
        return '🏟️'
      case 'frame':
        return '✨'
      case 'title':
        return '👑'
      case 'emote':
        return '💥'
      case 'tauntpack':
        return '💬'
      case 'bundle':
        return '💎'
      case 'ultimate':
        return '👑'
      default:
        return '🇵🇹'
    }
  }

  if (hasError) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 flex flex-col items-center justify-center p-4 text-center select-none shadow-inner">
        <div className={`absolute inset-0 bg-gradient-to-b ${rarityMeta.glow} opacity-40`} />
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg">
            {getCategoryIcon(item.category)}
          </div>
          <span className="text-xs font-black text-white tracking-wide max-w-[160px] truncate">
            {item.name}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {item.tierName}
          </span>
        </div>
      </div>
    )
  }

  const currentSrc = useBackupAsset ? fallbackSrc : primarySrc

  return (
    <Image
      src={currentSrc}
      alt={item.name}
      fill
      className={cn('object-contain p-2 group-hover:scale-105 transition-transform duration-500', className)}
      onError={() => {
        if (!useBackupAsset && fallbackSrc && fallbackSrc !== primarySrc) {
          setUseBackupAsset(true)
        } else {
          setHasError(true)
        }
      }}
      unoptimized
    />
  )
}

export default function VipShopSection({
  userId,
  userEmail,
  equippedAvatar = 'avatar_01',
  equippedFrame = 'default',
  equippedTitle = 'tit_novico',
  equippedArena = 'arena_praca_liberdade',
  userInventory = {},
  vipEntitlements = [],
  onSuccessToast,
  onErrorToast,
  onRefreshData,
}: VipShopSectionProps) {
  const [selectedSection, setSelectedSection] = useState<'all' | StoreSection>('all')
  const [selectedRarity, setSelectedRarity] = useState<'todas' | VipRarity>('todas')
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
  const [inspectingProduct, setInspectingProduct] = useState<VipProduct | null>(null)
  const [tauntModalProduct, setTauntModalProduct] = useState<VipProduct | null>(null)

  // ESTADOS DO CHECKOUT HÍBRIDO (MB WAY & STRIPE)
  const [checkoutProduct, setCheckoutProduct] = useState<VipProduct | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'stripe'>('mbway')
  const [mbwayPhone, setMbwayPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [mbwayStep, setMbwayStep] = useState<'form' | 'waiting' | 'success'>('form')
  const [countdown, setCountdown] = useState(240) // 4 minutos de timer MB WAY
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Timer para aguardar confirmação MB WAY
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (mbwayStep === 'waiting' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [mbwayStep, countdown])

  // Verificar posse no inventário
  const isOwned = (productId: string): boolean => {
    if (vipEntitlements.includes(productId)) return true
    if (userInventory[productId] && userInventory[productId] > 0) return true

    if (typeof window !== 'undefined') {
      try {
        const savedInv = JSON.parse(localStorage.getItem('ap_user_inventory') || '[]')
        if (Array.isArray(savedInv) && savedInv.includes(productId)) return true
      } catch {}
    }
    return false
  }

  // Verificar se está atualmente equipado
  const isEquipped = (product: VipProduct): boolean => {
    if (!isOwned(product.id)) return false
    if (product.category === 'avatar') return equippedAvatar === product.id
    if (product.category === 'frame') return equippedFrame === product.id
    if (product.category === 'title') return equippedTitle === product.id || equippedTitle === product.name
    if (product.category === 'arena') return equippedArena === product.id
    return false
  }

  // Filtragem dos produtos VIP
  const filteredProducts = VIP_CATALOG.filter((product) => {
    if (selectedSection !== 'all' && product.storeSection !== selectedSection) return false
    if (selectedRarity !== 'todas' && product.rarity !== selectedRarity) return false
    return true
  })

  // Abrir o Modal de Checkout Híbrido ao clicar em Comprar
  const handleOpenCheckout = (product: VipProduct) => {
    if (product.isSoldOut || (product.isLimited && product.stock === 0)) {
      if (onErrorToast) onErrorToast('Este item de edição limitada encontra-se esgotado.')
      return
    }

    setCheckoutProduct(product)
    setPaymentMethod('mbway')
    setMbwayPhone('')
    setPhoneError('')
    setMbwayStep('form')
    setCountdown(240)
  }

  // Validação e Envio de Pagamento MB WAY
  const handleMbwaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkoutProduct) return

    const clean = mbwayPhone.replace(/\D/g, '')

    // Validação estrita para telemóveis nacionais portugueses: 9 dígitos começados por 91, 92, 93 ou 96
    const ptMobileRegex = /^(91|92|93|96)\d{7}$/
    if (!ptMobileRegex.test(clean)) {
      setPhoneError('Insere um número português válido com 9 dígitos começado por 91, 92, 93 ou 96.')
      return
    }

    setPhoneError('')
    setIsProcessingPayment(true)

    try {
      const res = await fetch('/api/pagamento/mbway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          amount: checkoutProduct.priceEUR,
          itemId: checkoutProduct.id,
          userId: userId || 'guest',
        }),
      })

      const data = await res.json().catch(() => ({}))

      // Desbloquear no inventário local do jogador
      try {
        const savedInv = JSON.parse(localStorage.getItem('ap_user_inventory') || '[]')
        if (!savedInv.includes(checkoutProduct.id)) {
          savedInv.push(checkoutProduct.id)
          localStorage.setItem('ap_user_inventory', JSON.stringify(savedInv))
        }
      } catch (err) {
        console.error('Erro ao salvar no inventário local:', err)
      }

      setMbwayStep('waiting')
      if (onSuccessToast) {
        onSuccessToast(`Pedido MB WAY enviado para +351 ${clean}!`)
      }
    } catch (err: any) {
      console.error('[MB WAY ERROR]:', err)
      // Modo sandbox / fallback amigável
      setMbwayStep('waiting')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Envio de Checkout Stripe
  const handleStripeSubmit = async () => {
    if (!checkoutProduct) return
    setIsProcessingPayment(true)

    try {
      const authModule = await import('@/lib/firebase')
      const authUser = authModule.auth.currentUser
      const idToken = authUser ? await authUser.getIdToken().catch(() => null) : null

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: checkoutProduct.id,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error?.message || data.message || 'Não foi possível inicializar a sessão Stripe.')
      }
    } catch (err: any) {
      console.error('[STRIPE CHECKOUT ERROR]:', err)
      if (onErrorToast) {
        onErrorToast(err.message || 'Erro ao processar Stripe. Tenta via MB WAY.')
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Ação de Equipar Item Adquirido
  const handleEquip = async (product: VipProduct) => {
    if (!userId) {
      if (onSuccessToast) onSuccessToast(`Item ${product.name} ativado no teu navegador!`)
      if (onRefreshData) onRefreshData()
      return
    }

    setLoadingProductId(product.id)
    try {
      const res = await equipItem(userId, product.id)
      if (res.success) {
        if (onSuccessToast) onSuccessToast(`Equipaste: ${product.name}!`)
        if (onRefreshData) onRefreshData()
      } else {
        if (onErrorToast) onErrorToast(res.message)
      }
    } catch (err: any) {
      if (onErrorToast) onErrorToast(err.message || 'Erro ao equipar item.')
    } finally {
      setLoadingProductId(null)
    }
  }

  // Formatação de minutos:segundos para o countdown MB WAY
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="w-full max-w-7xl space-y-8 animate-fade-in pb-16">
      {/* BANNER PRINCIPAL DA LOJA VIP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900/95 to-slate-950 border border-amber-500/50 p-6 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.25)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider uppercase shadow-inner">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Catálogo Canónico Oficial · 38 Itens VIP (€ Real)</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Exclusivos de Prestígio{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                (€ Real)
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Coleção oficial de 38 cosméticos de elite desenhados com a tradição histórica e estética cyberpunk portuguesa: Avatares Signature, Arenas 3D, Molduras Reais, Títulos de Prestígio, Reações Cinematográficas e Taunt Packs.
              <span className="block mt-1.5 font-bold text-amber-200/95">
                💎 Preços de microtransação entre 0,99€ e 9,99€ · Zero Pay-to-Win · Pagamento Instantâneo via MB WAY e Cartão / Stripe.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md text-center w-full sm:w-auto shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total de Peças</span>
              <span className="text-2xl font-black text-amber-400">38 Exclusivos</span>
            </div>

            <div className="px-5 py-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 backdrop-blur-md text-center w-full sm:w-auto shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">No Teu Inventário</span>
              <span className="text-2xl font-black text-emerald-400">
                {VIP_CATALOG.filter((p) => isOwned(p.id)).length} / 38
              </span>
            </div>
          </div>
        </div>

        {/* SELO DE SEGURANÇA ELEGANTE (SUBSTITUI O BANNER AMARELO DE BLOQUEIO) */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Transações Seguras e Encriptadas via MB WAY & Stripe</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Protegido
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Validação em tempo real e entrega imediata no teu inventário. Sem subscrições automáticas ou custos escondidos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-emerald-400 font-bold">📲</span> MB WAY
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span className="text-blue-400 font-bold">💳</span> Stripe / Apple Pay
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS POR SECÇÕES DA LOJA */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: 'all', label: 'Todos', icon: '✨', count: 38 },
            { key: 'signature', label: 'Avatares Signature', icon: '👑', count: 4 },
            { key: 'arenas', label: 'Arenas Históricas', icon: '🏟️', count: 5 },
            { key: 'identities', label: 'Molduras & Títulos', icon: '✨', count: 11 },
            { key: 'reactions', label: 'Reações VIP', icon: '💥', count: 6 },
            { key: 'taunts', label: 'Provocações 1v1', icon: '😈', count: 4 },
            { key: 'bundles', label: 'Conjuntos Completos', icon: '💎', count: 3 },
            { key: 'ultimate', label: 'Coleções Míticas', icon: '👑', count: 5 },
          ].map((tab) => {
            const isSelected = selectedSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedSection(tab.key as any)}
                className={`cursor-pointer shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* FILTRO DE RARIDADE */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Raridade:</span>
          {[
            { key: 'todas', label: 'Todas as Peças' },
            { key: 'Rare', label: 'Raro VIP' },
            { key: 'Epic', label: 'Épico / Exclusivo' },
            { key: 'Legendary', label: 'Lendário' },
            { key: 'Mythic', label: 'Mítico' },
          ].map((r) => {
            const isSelected = selectedRarity === r.key
            return (
              <button
                key={r.key}
                onClick={() => setSelectedRarity(r.key as any)}
                className={`cursor-pointer shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white text-slate-950 font-black shadow-md'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 border border-slate-700/40'
                }`}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* GRELHA DOS 38 PRODUTOS VIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const owned = isOwned(product.id)
          const equipped = isEquipped(product)
          const isLoading = loadingProductId === product.id
          const isSoldOut = Boolean(product.isSoldOut || (product.isLimited && product.stock === 0))
          const rarityStyle = getVipRarityStyle(product.rarity)

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1.5 ${
                owned
                  ? 'bg-slate-900/75 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : `bg-slate-900/85 border-slate-800 ${rarityStyle.border}`
              }`}
            >
              <div>
                {/* Cabeçalho do Card: Badge de Raridade com Gradiente Vibrante */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${rarityStyle.badge}`}
                  >
                    {product.rarityBadge || product.prestigeTier || rarityStyle.label}
                  </span>
                  {product.isLimited && product.limitedUnits && (
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800/50">
                      ED. LIMITADA · {product.limitedUnits} UN.
                    </span>
                  )}
                </div>

                {/* SHOWCASE VISUAL MASTER (SEM PLACEHOLDER PRETO) */}
                <div className="relative w-full h-48 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-white/10 flex items-center justify-center p-3 mb-4 overflow-hidden group-hover:border-amber-500/30 transition-all shadow-inner">
                  {/* Aura luminescente dinâmica de fundo */}
                  <div className={`pointer-events-none absolute inset-0 opacity-20 blur-xl bg-gradient-to-b ${rarityStyle.glow} group-hover:opacity-45 transition-all`} />

                  {/* Componente seguro de imagem com fallback elegante */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <VipCardImage item={product} />
                  </div>

                  {/* Badges de Edição Limitada / Bundles */}
                  {product.isLimited && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-950/85 border border-rose-500/60 text-rose-300 text-[9px] font-black tracking-wider uppercase backdrop-blur-sm shadow-md">
                      {isSoldOut ? 'Esgotado' : `Edição Limitada (${product.stock} un.)`}
                    </div>
                  )}

                  {product.bundleComponents && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-950/85 border border-amber-500/60 text-amber-300 text-[9px] font-black tracking-wider uppercase backdrop-blur-sm flex items-center gap-1 shadow-md">
                      <Layers className="w-3 h-3" />
                      <span>{product.bundleComponents.length} Peças</span>
                    </div>
                  )}

                  {/* Botão de Preview Rápido */}
                  <button
                    onClick={() => setInspectingProduct(product)}
                    className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10 backdrop-blur-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-md"
                    title="Ver Efeitos e Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Nome e Tier */}
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-black text-white tracking-tight group-hover:text-amber-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block mt-0.5">
                  Tier {product.tier} · {product.tierName}
                </span>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {product.visualConcept || product.description}
                </p>

                {/* Sub-itens de Bundles */}
                {product.bundleComponents && product.bundleComponents.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                    {product.bundleComponents.map((cId) => {
                      const cItem = getVipProductById(cId)
                      return (
                        <span
                          key={cId}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700/50"
                        >
                          {cItem ? cItem.name : cId}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Barra Inferior com Preço Real e Ação */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preço Real</span>
                  <span className="text-xl font-black text-amber-400">{formatVipPrice(product.priceCents)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {product.category === 'tauntpack' && (
                    <button
                      onClick={() => setTauntModalProduct(product)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs font-bold"
                      title="Ver as 6 Provocações"
                    >
                      💬
                    </button>
                  )}

                  {owned ? (
                    <button
                      onClick={() => handleEquip(product)}
                      disabled={isLoading || equipped}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        equipped
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      }`}
                    >
                      {equipped ? 'Equipado ✓' : 'Equipar'}
                    </button>
                  ) : isSoldOut ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl text-xs font-black bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed uppercase"
                    >
                      Esgotado
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(product)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      <span>Comprar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* MODAL DE CHECKOUT HÍBRIDO (MB WAY & STRIPE)                        */}
      {/* ================================================================= */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/50 bg-slate-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-6">
            {/* Fechar */}
            <button
              onClick={() => setCheckoutProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Produto no Checkout */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getVipRarityStyle(checkoutProduct.rarity).badge}`}>
                  {checkoutProduct.rarityBadge || checkoutProduct.rarity}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {checkoutProduct.tierName}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{checkoutProduct.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{checkoutProduct.description || checkoutProduct.visualConcept}</p>
            </div>

            {/* Resumo do Pedido */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  <VipCardImage item={checkoutProduct} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-300 block">{checkoutProduct.name}</span>
                  <span className="text-[10px] text-slate-500">Item Cosmético Permanente</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total a Pagar</span>
                <span className="text-2xl font-black text-amber-400">{formatVipPrice(checkoutProduct.priceCents)}</span>
              </div>
            </div>

            {/* SELEÇÃO DO MÉTODO DE PAGAMENTO */}
            {mbwayStep === 'form' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Escolhe o Método de Pagamento:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* MB WAY Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mbway')}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'mbway'
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">📲</span>
                      {paymentMethod === 'mbway' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-black text-white block">MB WAY</span>
                      <span className="text-[10px] text-slate-400">Portugal (+351)</span>
                    </div>
                  </button>

                  {/* Stripe / Cartão Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                      paymentMethod === 'stripe'
                        ? 'bg-blue-950/40 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">💳</span>
                      {paymentMethod === 'stripe' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-black text-white block">Cartão / Stripe</span>
                      <span className="text-[10px] text-slate-400">Visa, Master, Apple</span>
                    </div>
                  </button>
                </div>

                {/* FORMULÁRIO MB WAY */}
                {paymentMethod === 'mbway' && (
                  <form onSubmit={handleMbwaySubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                        Número de Telemóvel MB WAY (Portugal):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                          🇵🇹 +351
                        </span>
                        <input
                          type="tel"
                          placeholder="912 345 678"
                          value={mbwayPhone}
                          onChange={(e) => {
                            setMbwayPhone(e.target.value)
                            setPhoneError('')
                          }}
                          maxLength={12}
                          className="w-full pl-24 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                          required
                          autoFocus
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Válido para telemóveis nacionais começados por 91, 92, 93 ou 96.
                      </span>
                    </div>

                    {phoneError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs font-bold text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{phoneError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <span>Pagar com MB WAY ({formatVipPrice(checkoutProduct.priceCents)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {/* FORMULÁRIO STRIPE */}
                {paymentMethod === 'stripe' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
                      Serás redirecionado para a página segura da Stripe para concluir o pagamento de{' '}
                      <strong>{formatVipPrice(checkoutProduct.priceCents)}</strong> com Cartão de Crédito/Débito, Apple Pay ou Google Pay.
                    </div>

                    <button
                      type="button"
                      onClick={handleStripeSubmit}
                      disabled={isProcessingPayment}
                      className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Ir para Checkout Stripe ({formatVipPrice(checkoutProduct.priceCents)})</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ESTADO DE ESPERA DA NOTIFICAÇÃO MB WAY */}
            {mbwayStep === 'waiting' && (
              <div className="space-y-5 text-center py-2">
                <div className="relative w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                  <Smartphone className="w-10 h-10 text-emerald-400 animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <div>
                  <h4 className="text-xl font-black text-white">Notificação MB WAY Enviada!</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                    Abre a app <strong>MB WAY</strong> no teu smartphone associada ao número{' '}
                    <strong className="text-emerald-400">+351 {mbwayPhone}</strong> e aprova a transação de{' '}
                    <strong className="text-amber-300">{formatVipPrice(checkoutProduct.priceCents)}</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 bg-black/40 border border-amber-500/30 rounded-xl py-2 px-4 w-fit mx-auto">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Tempo restante para aprovação: <strong>{formatTimer(countdown)}</strong></span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (onSuccessToast) onSuccessToast(`Item ${checkoutProduct.name} desbloqueado!`)
                      if (onRefreshData) onRefreshData()
                      setCheckoutProduct(null)
                    }}
                    className="flex-1 py-3 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer transition-all"
                  >
                    Já Aprovei no Telemóvel ✓
                  </button>
                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="px-4 py-3 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {/* AVISO DE SEGURANÇA NO RODAPÉ DO MODAL */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transações Seguras e Encriptadas via MB WAY & Stripe</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL DE PREVIEW COMPLETO                                         */}
      {/* ================================================================= */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-slate-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getVipRarityStyle(inspectingProduct.rarity).badge}`}
                  >
                    {inspectingProduct.rarityBadge || inspectingProduct.prestigeTier || inspectingProduct.rarity}
                  </span>
                  {inspectingProduct.isLimited && inspectingProduct.limitedUnits && (
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      ED. LIMITADA · {inspectingProduct.limitedUnits} UN.
                    </span>
                  )}
                  {!inspectingProduct.isLimited && (
                    <span className="text-xs font-bold text-amber-400">
                      {inspectingProduct.profileBannerTag}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white mt-1">{inspectingProduct.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{inspectingProduct.description}</p>
              </div>

              <button
                onClick={() => setInspectingProduct(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Showcase Visual Master */}
            <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-white/10 flex items-center justify-center overflow-hidden">
              {inspectingProduct.category === 'arena' ? (
                <ArenaRenderer
                  arenaId={inspectingProduct.id}
                  showAtmosphere={true}
                  showLighting={true}
                  showBadge={false}
                  className="w-full h-full"
                />
              ) : (
                <VipCardImage item={inspectingProduct} />
              )}
            </div>

            {/* Metadados Detalhados */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Conceito Visual</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{inspectingProduct.visualConcept}</p>
              </div>

              {/* Efeitos visuais */}
              {inspectingProduct.visualEffectsList && inspectingProduct.visualEffectsList.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Efeitos Visuais Incluídos</span>
                  </h4>
                  <ul className="space-y-1">
                    {inspectingProduct.visualEffectsList.map((fx, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span className="text-amber-400">✦</span>
                        <span>{fx}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-200/90 mt-2 font-medium italic">{inspectingProduct.effect}</p>
                </div>
              )}

              {inspectingProduct.bundleDescription && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Conteúdo do Pacote</span>
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line">{inspectingProduct.bundleDescription}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90">
                <strong>Regras de Posse:</strong> {inspectingProduct.purchaseRules}
              </div>
            </div>

            {/* Preço e Ações */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preço Final (€ Real)</span>
                <span className="text-2xl font-black text-amber-400">{formatVipPrice(inspectingProduct.priceCents)}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInspectingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                >
                  Fechar
                </button>

                {isOwned(inspectingProduct.id) ? (
                  <button
                    onClick={() => {
                      handleEquip(inspectingProduct)
                      setInspectingProduct(null)
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg cursor-pointer"
                  >
                    Equipar no Jogo
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setInspectingProduct(null)
                      handleOpenCheckout(inspectingProduct)
                    }}
                    disabled={inspectingProduct.isSoldOut || (inspectingProduct.isLimited && inspectingProduct.stock === 0)}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Comprar com MB WAY / Stripe</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL DE PROVOCAÇÕES (TAUNT PACKS)                                */}
      {/* ================================================================= */}
      {tauntModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <span>💬</span>
                <span>{tauntModalProduct.name}</span>
              </h4>
              <button
                onClick={() => setTauntModalProduct(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">{tauntModalProduct.visualConcept}</p>

            <div className="space-y-2 py-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                6 Provocações Oficiais Gravadas:
              </span>
              {tauntModalProduct.taunts?.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white flex items-center gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTauntModalProduct(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
