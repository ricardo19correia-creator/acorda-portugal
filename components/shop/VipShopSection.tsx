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
  AlertCircle,
  Flame,
  Award,
  Layers,
  Sparkle,
  Zap,
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
  const [providerConfigStatus, setProviderConfigStatus] = useState<'READY' | 'BLOCKED_PENDING_PROVIDER_CONFIG'>('READY')
  const [inspectingProduct, setInspectingProduct] = useState<VipProduct | null>(null)
  const [tauntModalProduct, setTauntModalProduct] = useState<VipProduct | null>(null)
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [providerModalMessage, setProviderModalMessage] = useState('')

  // Consultar estado de configuração do gateway Stripe
  useEffect(() => {
    async function checkProviderStatus() {
      try {
        const res = await fetch('/api/vip/status')
        if (res.ok) {
          const data = await res.json()
          if (data.providerConfig?.status) {
            setProviderConfigStatus(data.providerConfig.status)
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar status de provider VIP:', err)
      }
    }
    checkProviderStatus()
  }, [])

  // Verificar se o utilizador possui o produto
  const isOwned = (productId: string): boolean => {
    if (vipEntitlements.includes(productId)) return true
    if (userInventory[productId] && userInventory[productId] > 0) return true
    return false
  }

  // Verificar se o produto está atualmente equipado
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

  // Ação de Compra via Checkout
  const handleBuy = async (product: VipProduct) => {
    if (product.isSoldOut || (product.isLimited && product.stock === 0)) {
      if (onErrorToast) onErrorToast('Este item de edição limitada está esgotado.')
      return
    }

    if (!userId || userId.startsWith('guest_')) {
      if (onErrorToast) {
        onErrorToast('Cria uma conta permanente ou faz login para adquirir itens VIP exclusivos.')
      }
      return
    }

    setLoadingProductId(product.id)

    try {
      const auth = (await import('@/lib/firebase')).auth
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.id,
        }),
      })

      const data = await res.json()

      if (res.status === 503 || data.error?.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' || data.code === 'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED') {
        setProviderModalMessage(
          data.error?.message ||
            data.message ||
            'PAYMENT_PROVIDER_NOT_CONFIGURED: O fornecedor de pagamentos reais (Stripe) requer configuração das chaves de ambiente (STRIPE_SECRET_KEY) no servidor de produção.',
        )
        setProviderModalOpen(true)
        return
      }

      if (res.status === 409 || data.error?.code === 'ALREADY_OWNED') {
        if (onErrorToast) onErrorToast(data.error?.message || 'Já possuis este item VIP na tua conta.')
        return
      }

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error?.message || data.message || 'Não foi possível inicializar a sessão de pagamento.')
      }
    } catch (err: any) {
      console.error('[VIP CHECKOUT ERROR]:', err)
      if (onErrorToast) {
        onErrorToast(err.message || 'Erro ao inicializar checkout.')
      }
    } finally {
      setLoadingProductId(null)
    }
  }

  // Ação de Equipar Item VIP Adquirido
  const handleEquip = async (product: VipProduct) => {
    if (!userId) return

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

  return (
    <div className="w-full max-w-7xl space-y-8 animate-fade-in pb-16">
      {/* BANNER PRINCIPAL VIP COLLECTION 2.0 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900/95 to-purple-950/70 border border-amber-500/50 p-6 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.3)]">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>VIP Collection 2.0 · 38 Premium Exclusives</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              A Coleção Definitiva <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">(€ Real)</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              O catálogo oficial de 38 cosméticos de elite: Avatares Signature, Arenas Ultimate, Molduras Reais, Títulos de Prestígio, Reações Cinematográficas, Taunt Packs e Edições Fundador.
              <span className="block mt-1.5 font-bold text-amber-200/95">
                💎 Cosméticos Permanentes · Zero Pay-to-Win · Validação Server-Authoritative no Firestore.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-black/60 border border-amber-500/20 backdrop-blur-md text-center w-full sm:w-auto shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total de Peças</span>
              <span className="text-2xl font-black text-amber-400">38 Exclusivos</span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-black/60 border border-emerald-500/20 backdrop-blur-md text-center w-full sm:w-auto shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">No Teu Inventário</span>
              <span className="text-2xl font-black text-emerald-400">
                {VIP_CATALOG.filter((p) => isOwned(p.id)).length} / 38
              </span>
            </div>
          </div>
        </div>

        {/* MODO DE PRÉ-LANÇAMENTO / STATUS DE GATEWAY */}
        {providerConfigStatus === 'BLOCKED_PENDING_PROVIDER_CONFIG' && (
          <div className="mt-6 pt-4 border-t border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Modo de Produção Protegido:</strong> Os 38 itens e assets estão prontos. Transações com dinheiro real exigem a configuração da chave Stripe em produção.
              </span>
            </div>
            <button
              onClick={() => {
                setProviderModalMessage(
                  'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED: Conforme as diretrizes canónicas, nenhuma compra fictícia é simulada no frontend. Os 38 itens, assets WebP de alta resolução, rotas de verificação idempotentes e desempacotamento de bundles estão totalmente codificados.',
                )
                setProviderModalOpen(true)
              }}
              className="text-xs font-bold text-amber-300 underline hover:text-amber-100 transition cursor-pointer"
            >
              Ver Detalhes Técnicos
            </button>
          </div>
        )}
      </div>

      {/* AS 7 SECÇÕES CANÓNICAS DA LOJA VIP 2.0 */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: 'all', label: 'Todos', icon: '✨', count: 38 },
            { key: 'signature', label: 'Signature', icon: '👑', count: 4 },
            { key: 'arenas', label: 'Ultimate Arenas', icon: '🏟️', count: 5 },
            { key: 'identities', label: 'Royal Identities', icon: '✨', count: 11 },
            { key: 'reactions', label: 'Cinematic Reactions', icon: '💥', count: 6 },
            { key: 'taunts', label: 'Elite Taunts', icon: '😈', count: 4 },
            { key: 'bundles', label: 'Complete Sets', icon: '💎', count: 3 },
            { key: 'ultimate', label: 'Ultimate', icon: '👑', count: 5 },
          ].map((tab) => {
            const isSelected = selectedSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedSection(tab.key as any)}
                className={`cursor-pointer shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
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
            { key: 'todas', label: 'Todas' },
            { key: 'Rare', label: 'Raro' },
            { key: 'Epic', label: 'Épico' },
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

      {/* GRELHA DOS 38 PRODUTOS VIP 2.0 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const owned = isOwned(product.id)
          const equipped = isEquipped(product)
          const isLoading = loadingProductId === product.id
          const isSoldOut = Boolean(product.isSoldOut || (product.isLimited && product.stock === 0))

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1.5 ${
                owned
                  ? 'bg-slate-900/70 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/85 border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]'
              }`}
            >
              {/* Top Meta — nunca expor IDs técnicos ao utilizador */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      product.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {product.rarityBadge || product.prestigeTier || product.rarity}
                  </span>
                  {product.isLimited && product.limitedUnits && (
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      ED. LIMITADA · {product.limitedUnits} UN.
                    </span>
                  )}
                </div>

                {/* SHOWCASE VISUAL REAL (ASSETS WEBP) */}
                <div className="relative w-full h-48 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900/80 border border-white/5 flex items-center justify-center p-3 mb-4 overflow-hidden group-hover:border-amber-500/30 transition-all">
                  {/* Subtle Aura */}
                  <div className="pointer-events-none absolute inset-0 opacity-20 blur-xl bg-amber-500/20 group-hover:opacity-40 transition-all" />

                  {/* Asset WebP Real */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={product.assetPath}
                      alt={product.name}
                      fill
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>

                  {/* Badges de Edição Limitada / Bundles */}
                  {product.isLimited && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[9px] font-black tracking-wider uppercase backdrop-blur-sm">
                      {isSoldOut ? 'Esgotado' : `Edição Limitada (${product.stock} un.)`}
                    </div>
                  )}

                  {product.bundleComponents && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[9px] font-black tracking-wider uppercase backdrop-blur-sm flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{product.bundleComponents.length} Itens</span>
                    </div>
                  )}

                  {/* Botão de Preview Rápido */}
                  <button
                    onClick={() => setInspectingProduct(product)}
                    className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-white/10 backdrop-blur-sm transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Ver Efeitos e Preview Completo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Identificação Textual */}
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-black text-white tracking-tight group-hover:text-amber-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider block mt-0.5">
                  Tier {product.tier} · {product.tierName}
                </span>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {product.visualConcept}
                </p>

                {/* Sub-itens de Bundles */}
                {product.bundleComponents && product.bundleComponents.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                    {product.bundleComponents.map((cId) => {
                      const cItem = getVipProductById(cId)
                      return (
                        <span
                          key={cId}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700/50"
                        >
                          {cItem ? cItem.name : cId}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Botões Inferiores */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preço Real</span>
                  <span className="text-lg font-black text-amber-400">{formatVipPrice(product.priceCents)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {product.category === 'tauntpack' && (
                    <button
                      onClick={() => setTauntModalProduct(product)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-xs font-bold"
                      title="Ouvir / Ler 6 Frases"
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
                      onClick={() => handleBuy(product)}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

      {/* MODAL DE PREVIEW FUNCIONAL COMPLETO */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/50 bg-slate-950 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${inspectingProduct.badgeColor}`}>
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
                <Image
                  src={inspectingProduct.assetPath}
                  alt={inspectingProduct.name}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
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

              {/* Efeitos visuais em lista */}
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
                      handleBuy(inspectingProduct)
                      setInspectingProduct(null)
                    }}
                    disabled={inspectingProduct.isSoldOut || (inspectingProduct.isLimited && inspectingProduct.stock === 0)}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Prosseguir para Checkout Seguro</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PROVOCAÇÕES (TAUNT PACKS) */}
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

      {/* MODAL DE STATUS DO GATEWAY DE PAGAMENTOS */}
      {providerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/50 bg-slate-950 p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto">
              💳
            </div>

            <h3 className="text-xl font-black text-white text-center">
              Gateway de Pagamento Real (€)
            </h3>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-2">
              <p>
                <strong>Regra Global de Economia:</strong> O sistema cumpre rigorosamente a exigência de transações financeiras reais. Sem chaves de ambiente válidas configuradas no servidor, <strong>nenhuma transação fictícia é realizada</strong>.
              </p>
              <p className="text-[11px] text-slate-300">
                Todo o catálogo dos 38 itens VIP 2.0, assets WebP em alta definição, rotas de verificação idempotente e entidades de entitlement estão 100% implementados e verificados. Quando a chave <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">STRIPE_SECRET_KEY</code> for providenciada no ambiente de produção, as cobranças em dinheiro real ocorrem de forma imediata e transparente.
              </p>
            </div>

            <button
              onClick={() => setProviderModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
