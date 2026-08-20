'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Shield,
  Palette,
  Lightbulb,
  Timer,
  Flame,
  Award,
  Crown,
  Sun,
  Package,
  PackageCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Wallet,
  Zap,
  CreditCard,
  History,
  AlertCircle,
  ExternalLink,
  Loader2,
  Calendar,
  X,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BackgroundFx } from '@/components/background-fx'
import { useAuth } from '@/components/auth-provider'
import {
  SHOP_CATALOG,
  buyShopItem,
  formatRarityLabel,
  type ItemCategory,
  type ItemRarity,
  type ShopItem,
  type WalletTransaction,
} from '@/lib/economy'
import {
  REAL_PRODUCTS_CATALOG,
  type RealProduct,
} from '@/lib/real-products'
import { WalletModal } from '@/components/wallet-modal'
import { collection, onSnapshot, orderBy, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type ShopMainTab = 'virtual_items' | 'real_packs' | 'history'

const CATEGORY_TABS: { id: ItemCategory | 'all'; label: string; icon: typeof Sparkles }[] = [
  { id: 'all', label: 'Todos os Itens', icon: ShoppingBag },
  { id: 'personalizacao', label: '🎨 Personalização', icon: Palette },
  { id: 'utilidade', label: '⚡ Utilidade', icon: Zap },
  { id: 'prestigio', label: '🏆 Prestígio', icon: Crown },
  { id: 'packs', label: '🎁 Packs', icon: Package },
]

const RARITY_COLORS: Record<ItemRarity, { text: string; bg: string; border: string; glow: string }> = {
  comum: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    glow: 'group-hover:border-emerald-500/50',
  },
  raro: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'group-hover:border-cyan-500/50',
  },
  epico: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    glow: 'group-hover:border-purple-500/50',
  },
  lendario: {
    text: 'text-gold',
    bg: 'bg-gold/15',
    border: 'border-gold/40',
    glow: 'group-hover:border-gold/60',
  },
}

const ICON_MAP: Record<string, typeof Sparkles> = {
  Shield,
  Sparkles,
  Award,
  Crown,
  Palette,
  Lightbulb,
  Timer,
  Flame,
  Sun,
  Package,
  PackageCheck,
  Coins,
}

export default function ShopPage() {
  const { user, profile } = useAuth()

  const [activeTab, setActiveTab] = useState<ShopMainTab>('virtual_items')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all')
  const [walletOpen, setWalletOpen] = useState(false)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Transaction History State
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilter, setHistoryFilter] = useState<'all' | 'stripe' | 'earn' | 'spend'>('all')

  const effectiveUid = user?.uid || profile?.uid || ''
  const isPermanentUser = !!user?.uid
  const balance = profile?.euros ?? 0
  const inventory: Record<string, number> = (profile as any)?.inventory || {}

  // Carregar histórico de transações quando a aba de histórico é aberta
  useEffect(() => {
    if (activeTab !== 'history' || !user?.uid) {
      setTransactions([])
      setHistoryLoading(false)
      return
    }

    setHistoryLoading(true)
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = []
        snapshot.forEach((docSnap) => {
          const d = docSnap.data()
          list.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type || (d.amount >= 0 ? 'earn' : 'spend'),
            status: d.status || 'completed',
            amount: d.amount || (d.amountInCents ? d.amountInCents / 100 : 0),
            amountInCents: d.amountInCents,
            reason: d.reason || (d.productName ? `Compra: ${d.productName}` : 'Transação'),
            itemId: d.itemId,
            productId: d.productId,
            matchId: d.matchId,
            stripeSessionId: d.stripeSessionId,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
          })
        })
        setTransactions(list)
        setHistoryLoading(false)
      },
      (err) => {
        console.warn('Erro ao carregar transações:', err)
        setHistoryLoading(false)
      },
    )

    return () => unsubscribe()
  }, [activeTab, user?.uid])

  const filteredItems = SHOP_CATALOG.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false
    return true
  })

  // Compra com Moeda Virtual (€ Acorda)
  const handleVirtualPurchase = async (item: ShopItem) => {
    if (!effectiveUid || !user?.uid) {
      setAuthPromptOpen(true)
      return
    }

    if (balance < item.price) {
      setFeedback({
        type: 'error',
        message: `Não tens € Acorda suficientes. Necessitas de €${item.price.toLocaleString('pt-PT')}.`,
      })
      return
    }

    try {
      setPurchasingId(item.id)
      setFeedback(null)
      const res = await buyShopItem(effectiveUid, item.id)

      if (res.success) {
        setFeedback({ type: 'success', message: res.message })
      } else {
        setFeedback({ type: 'error', message: res.message })
      }
    } catch (e: any) {
      setFeedback({ type: 'error', message: e?.message || 'Erro inesperado na transação.' })
    } finally {
      setPurchasingId(null)
    }
  }

  // Compra com Dinheiro Real (Stripe Checkout)
  const handleRealPurchase = async (product: RealProduct) => {
    // Exigir login/registo para associar a compra à conta
    if (!isPermanentUser) {
      setAuthPromptOpen(true)
      return
    }

    try {
      setCheckoutLoadingId(product.id)
      setFeedback(null)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user.uid,
          userEmail: user.email || profile?.email || '',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        if (data.requiresAuth) {
          setAuthPromptOpen(true)
        } else {
          setFeedback({
            type: 'error',
            message: data.message || 'Erro ao inicializar sessão de pagamento.',
          })
        }
        return
      }

      if (data.url) {
        // Redirecionamento seguro para a página de checkout oficial do Stripe
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout não retornado pelo servidor.')
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erro ao comunicar com o servidor de pagamentos.',
      })
    } finally {
      setCheckoutLoadingId(null)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between">
      <BackgroundFx variant="shop" />
      <div className="relative z-20 flex-1 flex flex-col justify-between">
        <SiteHeader />
        <main className="flex-1 pb-20 pt-8 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Shop Hero Header */}
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-card/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
                  Economia Oficial & Mercado
                </p>
                <h1 className="mt-2 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-3d-chrome">
                  Loja Acorda Portugal
                </h1>
                <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
                  Adquire molduras, títulos de prestígio, consumíveis e pacotes de moedas para enriqueceres a tua jornada patriótica.
                </p>
              </div>

              {/* Player Wallet Display Card */}
              <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/20 via-card/90 to-primary/15 p-5 text-center sm:text-right backdrop-blur shadow-xl shrink-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-gold">
                  O Teu Saldo Virtual
                </p>
                <div className="mt-1 flex items-center justify-center sm:justify-end gap-2">
                  <Coins className="h-6 w-6 text-gold animate-pulse" />
                  <span className="font-display text-3xl sm:text-4xl font-black text-foreground">
                    €{balance.toLocaleString('pt-PT')}
                  </span>
                </div>
                <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                  € Acorda (Moeda ganha a jogar)
                </p>
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-white/10 transition cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                  <span>Ver Carteira</span>
                </button>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => setActiveTab('virtual_items')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
                  activeTab === 'virtual_items'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                    : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Itens & Cosméticos (€ Acorda)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('real_packs')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
                  activeTab === 'real_packs'
                    ? 'bg-gradient-to-r from-gold to-amber-500 text-black font-black shadow-lg shadow-gold/25 scale-105'
                    : 'border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20',
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pacotes de Moedas & VIP (Stripe)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider transition cursor-pointer',
                  activeTab === 'history'
                    ? 'bg-white/20 text-foreground border border-white/30 shadow-lg scale-105'
                    : 'border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground',
                )}
              >
                <History className="h-4 w-4" />
                <span>Histórico de Compras</span>
              </button>
            </div>
          </div>

          {/* Feedback Message Alert */}
          {feedback && (
            <div
              className={cn(
                'mt-6 rounded-2xl p-4 text-sm font-bold flex items-center justify-between border transition-all animate-rise',
                feedback.type === 'success'
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-flag-red/15 border-flag-red/40 text-flag-red',
              )}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs uppercase tracking-wider opacity-80 hover:opacity-100 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: ITENS & COSMÉTICOS (€ ACORDA) */}
          {/* ========================================================================= */}
          {activeTab === 'virtual_items' && (
            <div className="mt-8 animate-fade">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {CATEGORY_TABS.map((tab) => {
                  const active = selectedCategory === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer outline-none',
                        active
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                          : 'border border-white/10 bg-card/60 text-muted-foreground hover:bg-white/10 hover:text-foreground',
                      )}
                    >
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Rarity Filter Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground font-semibold">Raridade:</span>
                {(['all', 'comum', 'raro', 'epico', 'lendario'] as const).map((r) => {
                  const active = selectedRarity === r
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRarity(r)}
                      className={cn(
                        'rounded-xl px-3 py-1 font-bold uppercase tracking-wider transition cursor-pointer',
                        active
                          ? 'bg-white/15 text-foreground ring-1 ring-white/30'
                          : 'bg-white/5 text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {r === 'all' ? 'Todas' : r}
                    </button>
                  )
                })}
              </div>

              {/* Products Catalog Grid */}
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => {
                  const rarityStyle = RARITY_COLORS[item.rarity]
                  const Icon = ICON_MAP[item.icon] || Sparkles
                  const ownedCount = inventory[item.id] || 0
                  const isPermanentOwned = item.type === 'permanent' && ownedCount > 0
                  const isBuying = purchasingId === item.id
                  const canAfford = balance >= item.price

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg',
                        rarityStyle.border,
                        rarityStyle.glow,
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-wider',
                              rarityStyle.bg,
                              rarityStyle.text,
                            )}
                          >
                            {formatRarityLabel(item.rarity)}
                          </span>
                          {item.type === 'consumable' && ownedCount > 0 && (
                            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.62rem] font-bold text-muted-foreground">
                              No inventário: {ownedCount}×
                            </span>
                          )}
                          {isPermanentOwned && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[0.62rem] font-black uppercase text-primary flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Adquirido
                            </span>
                          )}
                        </div>

                        <div className="mt-4 mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] transition-transform duration-300 group-hover:scale-110 shadow-inner">
                          <Icon className={cn('h-10 w-10', rarityStyle.text)} />
                        </div>

                        <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                            Preço
                          </span>
                          <span className="font-display text-lg font-black text-foreground flex items-center gap-1">
                            <Coins className="h-4 w-4 text-gold" />
                            €{item.price.toLocaleString('pt-PT')}
                          </span>
                        </div>

                        {isPermanentOwned ? (
                          <button
                            type="button"
                            disabled
                            className="w-full rounded-2xl bg-white/5 py-2.5 text-xs font-bold text-muted-foreground cursor-not-allowed border border-white/5"
                          >
                            Item já adquirido
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBuying || !canAfford}
                            onClick={() => handleVirtualPurchase(item)}
                            className={cn(
                              'w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg',
                              canAfford
                                ? 'bg-primary text-primary-foreground shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                                : 'bg-white/5 text-muted-foreground/60 cursor-not-allowed border border-white/5',
                            )}
                          >
                            {isBuying ? (
                              <span>A processar...</span>
                            ) : canAfford ? (
                              <>
                                <ShoppingBag className="h-4 w-4" />
                                <span>Comprar Item</span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                <span>Saldo Insuficiente</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PACOTES DE MOEDAS & VIP (STRIPE CHECKOUT REAL) */}
          {/* ========================================================================= */}
          {activeTab === 'real_packs' && (
            <div className="mt-8 animate-fade">
              <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/15 via-card/80 to-purple-500/15 p-6 mb-8 backdrop-blur">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-gold border border-gold/40">
                      <Shield className="h-3.5 w-3.5" />
                      Pagamento Seguro com Stripe
                    </span>
                    <h2 className="mt-2 font-display text-xl sm:text-2xl font-black text-foreground">
                      Pacotes Oficiais & Vantagens Exclusivas
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                      Pagamentos reais processados e encriptados com Cartão bancário, Apple Pay e Google Pay.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-2xl p-3 shrink-0">
                    <p className="font-bold text-foreground">🛡️ Garantia de Entrega</p>
                    <p className="text-[0.7rem]">Itens creditados instantaneamente após confirmação.</p>
                  </div>
                </div>
              </div>

              {/* Real Money Packages Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {REAL_PRODUCTS_CATALOG.map((product) => {
                  const isProcessing = checkoutLoadingId === product.id
                  const Icon = ICON_MAP[product.icon] || Sparkles

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        'relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-card/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-xl',
                        product.bestValue
                          ? 'border-gold/60 ring-2 ring-gold/40 shadow-gold/15'
                          : product.popular
                            ? 'border-primary/50 ring-1 ring-primary/30'
                            : 'border-white/10',
                      )}
                    >
                      {/* Top Badge */}
                      <div className="flex items-center justify-between">
                        {product.badgeText ? (
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider',
                              product.bestValue
                                ? 'bg-gold/20 text-gold border border-gold/40'
                                : product.popular
                                  ? 'bg-primary/20 text-primary border border-primary/40'
                                  : 'bg-white/10 text-muted-foreground',
                            )}
                          >
                            {product.badgeText}
                          </span>
                        ) : <span />}

                        <span className="font-display text-2xl font-black text-foreground">
                          €{(product.priceInCents / 100).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Visual Icon */}
                      <div className="my-6 mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.03] shadow-inner">
                        <Icon className={cn('h-10 w-10', product.bestValue ? 'text-gold' : 'text-primary')} />
                      </div>

                      {/* Product Content Details */}
                      <div>
                        <h3 className="font-display text-xl font-black text-foreground">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {product.description}
                        </p>

                        {/* Rewards Included Box */}
                        <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 space-y-1.5 text-xs">
                          <p className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                            Inclui no pacote:
                          </p>
                          {product.reward.euros > 0 && (
                            <div className="flex items-center gap-2 font-bold text-gold">
                              <Coins className="h-4 w-4" />
                              <span>+€{product.reward.euros.toLocaleString('pt-PT')} € Acorda</span>
                            </div>
                          )}
                          {product.reward.xp && (
                            <div className="flex items-center gap-2 font-bold text-primary">
                              <Sparkles className="h-4 w-4" />
                              <span>+{product.reward.xp} XP</span>
                            </div>
                          )}
                          {product.reward.vipPass && (
                            <div className="flex items-center gap-2 font-bold text-purple-400">
                              <Shield className="h-4 w-4" />
                              <span>Passe Patriota VIP</span>
                            </div>
                          )}
                          {product.reward.items && (
                            <div className="text-[0.72rem] text-muted-foreground pt-1 border-t border-white/5">
                              {Object.entries(product.reward.items).map(([id, q]) => (
                                <span key={id} className="block text-foreground font-semibold">
                                  • {q}x {id.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Checkout CTA Button */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleRealPurchase(product)}
                        className={cn(
                          'mt-6 w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xl',
                          product.bestValue
                            ? 'bg-gradient-to-r from-gold to-amber-500 text-black hover:brightness-110 shadow-gold/25'
                            : 'bg-primary text-primary-foreground hover:brightness-110 shadow-primary/25',
                        )}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>A Iniciar Checkout...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            <span>Comprar por €{(product.priceInCents / 100).toFixed(2).replace('.', ',')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HISTÓRICO DE TRANSAÇÕES */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="mt-8 animate-fade">
              <div className="overflow-hidden rounded-4xl border border-white/10 bg-card/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="font-display text-xl font-black text-foreground flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      Histórico Oficial de Compras & Transações
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Registo completo e auditado de pagamentos Stripe e movimentações de saldo no jogo.
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('all')}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer',
                        historyFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('stripe')}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer',
                        historyFilter === 'stripe' ? 'bg-gold text-black' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Pagamentos Reais
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('spend')}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer',
                        historyFilter === 'spend' ? 'bg-white/20 text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Gastos
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('earn')}
                      className={cn(
                        'px-3 py-1.5 rounded-xl font-bold transition cursor-pointer',
                        historyFilter === 'earn' ? 'bg-emerald-500 text-white' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Ganhos
                    </button>
                  </div>
                </div>

                {/* List Container */}
                <div className="mt-6 space-y-3">
                  {historyLoading && (
                    <div className="p-12 text-center text-sm text-muted-foreground">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
                      A carregar histórico...
                    </div>
                  )}

                  {!historyLoading && !isPermanentUser && (
                    <div className="p-8 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                      <Lock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="font-bold text-foreground">Histórico Protegido</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Inicia sessão com a tua conta para consultares o histórico de transações e comprovativos de pagamento.
                      </p>
                      <Link
                        href="/entrar"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
                      >
                        Entrar na Conta
                      </Link>
                    </div>
                  )}

                  {!historyLoading && isPermanentUser && transactions.length === 0 && (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                      <Coins className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="font-bold text-foreground">Sem transações registadas</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        As tuas compras na loja ou recompensas de quizzes aparecerão aqui.
                      </p>
                    </div>
                  )}

                  {!historyLoading &&
                    isPermanentUser &&
                    transactions
                      .filter((t: any) => {
                        if (historyFilter === 'stripe') return t.type === 'stripe_purchase'
                        if (historyFilter === 'earn') return t.amount > 0 && t.type !== 'stripe_purchase'
                        if (historyFilter === 'spend') return t.amount < 0 || t.type === 'spend'
                        return true
                      })
                      .map((t: any) => {
                        const isStripe = t.type === 'stripe_purchase'
                        const isEarn = t.amount > 0 && !isStripe

                        return (
                          <div
                            key={t.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition"
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={cn(
                                  'grid h-10 w-10 place-items-center rounded-xl font-bold shrink-0',
                                  isStripe
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : isEarn
                                      ? 'bg-primary/20 text-primary border border-primary/30'
                                      : 'bg-flag-red/20 text-flag-red border border-flag-red/30',
                                )}
                              >
                                {isStripe ? <CreditCard className="h-5 w-5" /> : <Coins className="h-5 w-5" />}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-display text-sm font-bold text-foreground">
                                    {t.reason}
                                  </p>
                                  {isStripe && (
                                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-gold border border-gold/40">
                                      {t.status === 'paid' ? 'Pago' : t.status}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  {t.createdAt?.toLocaleDateString
                                    ? t.createdAt.toLocaleDateString('pt-PT', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Recente'}
                                  {t.id && (
                                    <span className="font-mono text-[0.62rem] opacity-60 ml-2">
                                      ID: {t.id.slice(0, 16)}...
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="font-display text-base font-black shrink-0">
                              {isStripe ? (
                                <span className="text-gold">
                                  €{((t.amountInCents || 0) / 100).toFixed(2).replace('.', ',')}
                                </span>
                              ) : isEarn ? (
                                <span className="text-primary">+€{t.amount?.toLocaleString('pt-PT')}</span>
                              ) : (
                                <span className="text-flag-red">-€{Math.abs(t.amount || 0).toLocaleString('pt-PT')}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                </div>
              </div>
            </div>
          )}

          {/* Legal / Disclaimer Notice */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-card/40 p-6 text-center backdrop-blur">
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto flex items-center justify-center gap-2">
              <Info className="h-4 w-4 text-gold shrink-0" />
              <span>
                <strong>Aviso de Transparência:</strong> Os <strong>€ Acorda</strong> são uma moeda virtual de jogo destinada à personalização e progressão dentro da plataforma Acorda Portugal. Todos os pagamentos com dinheiro real são processados com encriptação bancária através do Stripe.
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Guest Account Required Modal for Real Purchases */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
          <div className="relative w-full max-w-md rounded-4xl border border-gold/40 bg-card/95 p-8 text-center backdrop-blur-2xl shadow-2xl animate-scale-in">
            <button
              type="button"
              onClick={() => setAuthPromptOpen(false)}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gold/20 text-gold border border-gold/40">
              <Lock className="h-8 w-8" />
            </div>

            <h3 className="mt-4 font-display text-xl font-black text-foreground">
              Conta Necessária para Compras
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Para adquirir pacotes com dinheiro real e garantir que os teus itens, saldo e distintivos ficam guardados permanentemente, entra ou cria a tua conta.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/entrar"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/25 hover:brightness-110 transition"
              >
                <span>Entrar ou Criar Conta</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => setAuthPromptOpen(false)}
                className="w-full rounded-2xl bg-white/5 py-3 text-xs font-bold text-muted-foreground hover:bg-white/10 transition cursor-pointer"
              >
                Voltar à Loja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal Drawer */}
      <WalletModal open={walletOpen} onOpenChange={setWalletOpen} />

      <SiteFooter />
      </div>
    </div>
  )
}

