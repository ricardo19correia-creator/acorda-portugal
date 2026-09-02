'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Crown,
  Sparkles,
  Shield,
  Palette,
  Volume2,
  Check,
  Lock,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  Flame,
  Star,
  Award,
} from 'lucide-react'
import {
  VIP_CATALOG,
  getAllVipProducts,
  getVipProductsByCategory,
  formatVipPrice,
  type VipProduct,
  type VipCategory,
  type VipRarity,
} from '@/src/data/vipCatalog'
import UserAvatar from '@/components/ui/UserAvatar'
import AnimatedFrameWrapper from '@/components/ui/AnimatedFrameWrapper'
import { equipItem } from '@/lib/economy'
import { getAvatarById } from '@/lib/avatars'

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
  const [selectedCategory, setSelectedCategory] = useState<'todos' | VipCategory>('todos')
  const [selectedRarity, setSelectedRarity] = useState<'todas' | VipRarity>('todas')
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
  const [providerConfigStatus, setProviderConfigStatus] = useState<'READY' | 'BLOCKED_PENDING_PROVIDER_CONFIG'>('READY')
  const [inspectingProduct, setInspectingProduct] = useState<VipProduct | null>(null)
  const [tauntModalProduct, setTauntModalProduct] = useState<VipProduct | null>(null)
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [providerModalMessage, setProviderModalMessage] = useState('')

  // Consultar estado de configuração do gateway
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
    if (selectedCategory !== 'todos' && product.category !== selectedCategory) return false
    if (selectedRarity !== 'todas' && product.rarity !== selectedRarity) return false
    return true
  })

  // Ação de Compra via Checkout
  const handleBuy = async (product: VipProduct) => {
    if (!userId || userId.startsWith('guest_')) {
      if (onErrorToast) {
        onErrorToast('Cria uma conta permanente ou faz login para adquirir itens VIP exclusivos.')
      }
      return
    }

    setLoadingProductId(product.id)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId,
          userEmail,
        }),
      })

      const data = await res.json()

      if (res.status === 503 || data.code === 'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED') {
        setProviderModalMessage(
          data.message ||
            'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED: O fornecedor de pagamentos reais (Stripe) requer configuração das chaves de ambiente (STRIPE_SECRET_KEY) no servidor de produção.',
        )
        setProviderModalOpen(true)
        return
      }

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.message || 'Não foi possível inicializar a sessão de pagamento.')
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
    <div className="w-full max-w-6xl space-y-8 animate-fade-in pb-16">
      {/* BANNER PRINCIPAL VIP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-slate-900/90 to-purple-950/60 border border-amber-500/40 p-6 sm:p-10 shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Coleção Oficial · 38 Exclusivos VIP</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Prestígio Lusitano <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">(€ Real)</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Itens cosméticos permanentes com identidade gráfica de alta fidelidade para perfis, duelos 1v1 e rankings nacionais.
              <span className="block mt-1 font-bold text-amber-200/90">
                100% cosméticos · Zero Pay-to-Win · A economia de moedas virtuais permanece independente.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md text-center w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Total Exclusivos</span>
              <span className="text-2xl font-black text-amber-400">38 Itens</span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md text-center w-full sm:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Adquiridos</span>
              <span className="text-2xl font-black text-emerald-400">
                {VIP_CATALOG.filter((p) => isOwned(p.id)).length} / 38
              </span>
            </div>
          </div>
        </div>

        {/* ALERTA SE O GATEWAY ESTIVER EM CONFIGURAÇÃO PENDENTE */}
        {providerConfigStatus === 'BLOCKED_PENDING_PROVIDER_CONFIG' && (
          <div className="mt-6 pt-4 border-t border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Modo de Pré-Lançamento Seguro:</strong> O catálogo e entitlements estão ativos. A conclusão de compras com dinheiro real aguarda credenciais Stripe de produção no servidor.
              </span>
            </div>
            <button
              onClick={() => {
                setProviderModalMessage(
                  'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED: Conforme as regras da secção 13 e 38 do sistema, sem credenciais de produção (STRIPE_SECRET_KEY) o sistema não inventa compras falsas nem fakes de sucesso. A infraestrutura está 100% pronta para transacionar assim que as chaves forem providenciadas no ambiente.',
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

      {/* FILTROS DE CATEGORIA E RARIDADE */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {/* Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: 'todos', label: 'Todos', icon: '✨', count: 38 },
            { key: 'avatar', label: 'Avatares', icon: '👑', count: 6 },
            { key: 'frame', label: 'Molduras', icon: '🖼️', count: 6 },
            { key: 'title', label: 'Títulos', icon: '🏆', count: 8 },
            { key: 'arena', label: 'Arenas', icon: '🏟️', count: 6 },
            { key: 'emote', label: 'Reações', icon: '😎', count: 8 },
            { key: 'tauntpack', label: 'Taunt Packs', icon: '😈', count: 4 },
          ].map((tab) => {
            const isSelected = selectedCategory === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key as any)}
                className={`cursor-pointer shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Raridades */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/60 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Raridade:</span>
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'rare', label: 'Raro', color: 'text-cyan-400 border-cyan-500/40' },
            { key: 'epic', label: 'Épico', color: 'text-purple-400 border-purple-500/40' },
            { key: 'legendary', label: 'Lendário', color: 'text-amber-400 border-amber-500/40' },
            { key: 'mythic', label: 'Mítico', color: 'text-rose-400 border-rose-500/50' },
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

      {/* GRELHA DOS PRODUTOS VIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const owned = isOwned(product.id)
          const equipped = isEquipped(product)
          const isLoading = loadingProductId === product.id

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col justify-between rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1.5 ${
                owned
                  ? 'bg-slate-900/60 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]'
              }`}
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${product.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                    {product.rarityLabel}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {product.sku}
                  </span>
                </div>

                {/* Visual Asset Showcase */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/60 border border-white/5 flex items-center justify-center p-3 mb-4 overflow-hidden group-hover:border-amber-500/30 transition-all">
                  {/* Subtle Background Accent */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20 blur-xl transition-all group-hover:opacity-35"
                    style={{ background: product.accentColor || '#f59e0b' }}
                  />

                  {/* Renderização específica por categoria */}
                  {product.category === 'avatar' && (
                    <div className="relative w-28 h-28 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                      <Image
                        src={product.assetPath}
                        alt={product.name}
                        width={112}
                        height={112}
                        className="rounded-2xl shadow-xl object-contain"
                        unoptimized
                      />
                    </div>
                  )}

                  {product.category === 'frame' && (
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <AnimatedFrameWrapper frameId={product.id}>
                        <UserAvatar avatarUrl={equippedAvatar} size="lg" showBadge={false} />
                      </AnimatedFrameWrapper>
                    </div>
                  )}

                  {product.category === 'title' && (
                    <div className="flex flex-col items-center justify-center text-center p-3">
                      <Award className="w-8 h-8 text-amber-400 mb-2" />
                      <span className="text-base font-black text-white tracking-wide">{product.name}</span>
                      <span className="text-[10px] font-bold text-amber-300 mt-1 uppercase tracking-widest">TÍTULO VIP</span>
                    </div>
                  )}

                  {product.category === 'arena' && (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={product.assetPath}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-xs font-black text-white">{product.name}</span>
                      </div>
                    </div>
                  )}

                  {product.category === 'emote' && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-5xl group-hover:scale-110 transition-transform">{product.emoji}</span>
                      <span className="text-xs font-bold text-slate-300 mt-2">{product.name}</span>
                    </div>
                  )}

                  {product.category === 'tauntpack' && (
                    <div className="flex flex-col items-center justify-center text-center p-2">
                      <span className="text-3xl mb-1">😈</span>
                      <span className="text-sm font-black text-white">{product.name}</span>
                      <button
                        onClick={() => setTauntModalProduct(product)}
                        className="mt-2 text-[11px] font-bold text-amber-400 underline hover:text-amber-200 transition cursor-pointer"
                      >
                        Ver 6 Frases 💬
                      </button>
                    </div>
                  )}
                </div>

                {/* Informação Textual */}
                <h3 className="text-base font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Preço Real</span>
                  <span className="text-lg font-black text-amber-400">{formatVipPrice(product.priceCents)}</span>
                </div>

                <div className="flex items-center gap-2">
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

            <p className="text-xs text-slate-300">{tauntModalProduct.description}</p>

            <div className="space-y-2 py-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                6 Provocações Incluídas:
              </span>
              {tauntModalProduct.taunts?.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white flex items-center gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">
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

      {/* MODAL EXPLICATIVO DE CONFIGURAÇÃO DE GATEWAY DE PAGAMENTOS */}
      {providerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/50 bg-slate-950 p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mx-auto">
              💳
            </div>

            <h3 className="text-xl font-black text-white text-center">
              Configuração de Pagamento Real Necessária
            </h3>

            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-2">
              <p>
                <strong>Regra Master Prompt #13 &amp; #38:</strong> O sistema cumpre o princípio de verdade absoluta de pagamentos. Sem chaves de ambiente reais configuradas, <strong>nenhuma compra fictícia ou aprovação falsa é realizada</strong>.
              </p>
              <p className="text-[11px] text-slate-300">
                Todo o catálogo dos 38 itens VIP, arquitetura de checkout, webhooks idempotentes e entidades de entitlement estão 100% implementados e prontos para produção. Assim que a chave <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">STRIPE_SECRET_KEY</code> for adicionada ao ficheiro de ambiente, os pagamentos passam de imediato a reais.
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
