/**
 * 🇵🇹 ACORDA PORTUGAL — GOOGLE PLAY BILLING CLIENT SERVICE (SSOT)
 *
 * Serviço dedicado e encapsulado para gestão do ciclo de vida de Google Play Billing:
 * - Deteção de ambiente nativo Capacitor Android.
 * - Verificação de suporte de faturação (`isBillingSupported()`).
 * - Carregamento dinâmico de produtos e preços oficiais da Google Play Store.
 * - Início seguro de compra (`purchaseProduct`) com proteção anti-duplo clique (`purchaseInProgress`).
 * - Extração de `purchaseToken` e envio ao backend seguro (`/api/billing/google-play/verify`).
 * - Verificação de compras não processadas (restauração e recuperação de falhas).
 * - Tratamento estrito de estados: PENDING, PURCHASED, CANCELED, FAILED, PROCESSED.
 */

import {
  GOOGLE_PLAY_PRODUCTS,
  GOOGLE_PLAY_COIN_PRODUCT_IDS,
  GOOGLE_PLAY_PACKAGE_NAME,
  getGooglePlayProductById,
  type GooglePlayProduct,
} from '@/config/google-play-products'

export type BillingPurchaseState = 'IDLE' | 'PENDING' | 'PURCHASING' | 'VERIFYING' | 'SUCCESS' | 'CANCELED' | 'ERROR'

export interface BillingProductDisplay {
  productId: string
  name: string
  subtitle?: string
  description: string
  acordas: number
  priceString: string // Preço obtido dinamicamente da Play Store ou fallback
  currency: string
  popular?: boolean
  bestValue?: boolean
  badgeText?: string
  icon: string
  isNativePrice: boolean
}

export interface PurchaseVerificationResult {
  success: boolean
  productId: string
  orderId?: string | null
  acordasGranted: number
  newBalance?: number
  alreadyProcessed?: boolean
  state: BillingPurchaseState
  message?: string
}

class GooglePlayBillingService {
  private isInitialized = false
  private isSupported = false
  private isPurchasing = false
  private nativePurchasesPlugin: any = null
  private cachedProducts: Map<string, any> = new Map()

  /**
   * Determina se a aplicação está a ser executada nativamente em Android via Capacitor
   */
  public isNativeAndroid(): boolean {
    if (typeof window === 'undefined') return false
    const cap = (window as any).Capacitor
    return Boolean(
      cap &&
      (typeof cap.isNativePlatform === 'function' ? cap.isNativePlatform() : false) &&
      cap.getPlatform() === 'android'
    )
  }

  /**
   * Inicializa o plugin de faturação nativa da Google Play Store
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return this.isSupported

    if (!this.isNativeAndroid()) {
      this.isInitialized = true
      this.isSupported = false
      return false
    }

    try {
      const { NativePurchases } = await import('@capgo/native-purchases')
      this.nativePurchasesPlugin = NativePurchases

      const { isBillingSupported } = await NativePurchases.isBillingSupported()
      this.isSupported = Boolean(isBillingSupported)
      this.isInitialized = true

      console.log('[GOOGLE_PLAY_BILLING_INIT]', { supported: this.isSupported })
      return this.isSupported
    } catch (err: any) {
      console.warn('[GOOGLE_PLAY_BILLING_INIT_FAIL]', err?.message || err)
      this.isInitialized = true
      this.isSupported = false
      return false
    }
  }

  /**
   * Consulta os produtos oficiais e formata para exibição na UI com preços da loja
   */
  public async getProductCatalog(): Promise<BillingProductDisplay[]> {
    await this.initialize()

    // Mapeamento inicial com valores padrão canónicos
    const displays: BillingProductDisplay[] = GOOGLE_PLAY_PRODUCTS
      .filter((p) => p.type === 'CONSUMABLE')
      .map((p) => ({
        productId: p.productId,
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        acordas: p.acordas,
        priceString: p.referencePriceString,
        currency: 'EUR',
        popular: p.popular,
        bestValue: p.bestValue,
        badgeText: p.badgeText,
        icon: p.icon,
        isNativePrice: false,
      }))

    // Se estiver em Android nativo e com billing suportado, consulta os preços reais na Google Play
    if (this.isSupported && this.nativePurchasesPlugin) {
      try {
        const { PURCHASE_TYPE } = await import('@capgo/native-purchases')
        const { products } = await this.nativePurchasesPlugin.getProducts({
          productIdentifiers: GOOGLE_PLAY_COIN_PRODUCT_IDS,
          productType: PURCHASE_TYPE.INAPP,
        })

        if (Array.isArray(products)) {
          for (const item of products) {
            const id = item.identifier || item.productId
            this.cachedProducts.set(id, item)

            const target = displays.find((d) => d.productId === id)
            if (target && item.priceString) {
              target.priceString = item.priceString
              target.currency = item.currency || target.currency
              target.isNativePrice = true
              if (item.title) {
                target.name = item.title.replace(/\s*\(.*?\)\s*$/, '') // Remove sufixo da app
              }
            }
          }
        }
      } catch (err) {
        console.warn('[GOOGLE_PLAY_QUERY_PRODUCTS_WARN] Usando preços de referência:', err)
      }
    }

    return displays
  }

  /**
   * Executa a compra de um produto in-app da Google Play de forma idempotente e segura.
   *
   * PREVENÇÃO DE DUPLO CLIQUE: Se outra compra já estiver em curso, bloqueia imediatamente.
   */
  public async purchaseProduct(
    productId: string,
    userId: string,
    onStateChange?: (state: BillingPurchaseState, msg?: string) => void
  ): Promise<PurchaseVerificationResult> {
    // 1. Proteção estrita contra múltiplos cliques rápidos
    if (this.isPurchasing) {
      const msg = 'Existe uma transação em curso. Aguarda a conclusão.'
      if (onStateChange) onStateChange('PURCHASING', msg)
      return {
        success: false,
        productId,
        acordasGranted: 0,
        state: 'PURCHASING',
        message: msg,
      }
    }

    this.isPurchasing = true
    if (onStateChange) onStateChange('PURCHASING', 'A comunicar com o Google Play...')

    try {
      await this.initialize()

      if (!this.isSupported || !this.nativePurchasesPlugin) {
        throw new Error('Google Play Billing não está disponível neste dispositivo.')
      }

      const { PURCHASE_TYPE } = await import('@capgo/native-purchases')

      // Obfuscated Account Token para segurança e antifraude (UID do jogador)
      const appAccountToken = userId ? userId.substring(0, 64) : undefined

      // 2. Inicia o diálogo nativo da Google Play
      const purchaseResult = await this.nativePurchasesPlugin.purchaseProduct({
        productIdentifier: productId,
        productType: PURCHASE_TYPE.INAPP,
        quantity: 1,
        appAccountToken,
      })

      const purchaseToken = purchaseResult?.purchaseToken || purchaseResult?.transactionId
      if (!purchaseToken) {
        throw new Error('Não foi recebido um purchaseToken válido da Google Play.')
      }

      if (onStateChange) onStateChange('VERIFYING', 'A confirmar pagamento com o servidor...')

      // 3. Envia o purchaseToken ao backend para validação oficial e concessão atómica
      const verifyResult = await this.verifyPurchaseWithBackend(productId, purchaseToken, userId)

      if (verifyResult.success) {
        if (onStateChange) onStateChange('SUCCESS', `+${verifyResult.acordasGranted.toLocaleString('pt-PT')} Acordas adicionadas!`)
      } else {
        if (onStateChange) onStateChange('ERROR', verifyResult.message || 'Não foi possível validar a compra.')
      }

      return verifyResult
    } catch (err: any) {
      const errMsg = err?.message || String(err)
      console.error('[GOOGLE_PLAY_PURCHASE_FAIL]', errMsg)

      if (errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('user')) {
        if (onStateChange) onStateChange('CANCELED', 'Compra cancelada.')
        return {
          success: false,
          productId,
          acordasGranted: 0,
          state: 'CANCELED',
          message: 'Compra cancelada.',
        }
      }

      if (onStateChange) onStateChange('ERROR', errMsg)
      return {
        success: false,
        productId,
        acordasGranted: 0,
        state: 'ERROR',
        message: errMsg,
      }
    } finally {
      this.isPurchasing = false
    }
  }

  /**
   * Envia o purchaseToken ao endpoint seguro `/api/billing/google-play/verify`
   */
  public async verifyPurchaseWithBackend(
    productId: string,
    purchaseToken: string,
    userId: string
  ): Promise<PurchaseVerificationResult> {
    try {
      // Obter Firebase ID Token do utilizador atual
      const authModule = await import('@/lib/firebase')
      const currentUser = authModule.auth.currentUser
      const idToken = currentUser ? await currentUser.getIdToken(true).catch(() => null) : null

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`
      }

      const res = await fetch('/api/billing/google-play/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId,
          purchaseToken,
          packageName: GOOGLE_PLAY_PACKAGE_NAME,
          userId: userId || currentUser?.uid,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.success) {
        return {
          success: true,
          productId,
          orderId: data.orderId,
          acordasGranted: data.acordasGranted || 0,
          newBalance: data.newBalance,
          alreadyProcessed: Boolean(data.alreadyProcessed),
          state: 'SUCCESS',
          message: data.message || 'Compra concluída com sucesso!',
        }
      }

      return {
        success: false,
        productId,
        acordasGranted: 0,
        state: 'ERROR',
        message: data.error?.message || data.message || 'Falha na validação do servidor.',
      }
    } catch (netErr: any) {
      console.error('[VERIFY_BACKEND_NET_ERROR]', netErr)
      return {
        success: false,
        productId,
        acordasGranted: 0,
        state: 'ERROR',
        message: 'Falha de comunicação com o servidor. A compra será restaurada automaticamente assim que tiveres ligação.',
      }
    }
  }

  /**
   * Restaura compras pendentes ou não consumidas (Recuperação de falhas e pós-reinstalação)
   */
  public async restorePurchases(userId: string): Promise<{
    restoredCount: number
    acordasGrantedTotal: number
    errors: string[]
  }> {
    await this.initialize()

    if (!this.isSupported || !this.nativePurchasesPlugin) {
      return { restoredCount: 0, acordasGrantedTotal: 0, errors: ['Billing não suportado'] }
    }

    let restoredCount = 0
    let acordasGrantedTotal = 0
    const errors: string[] = []

    try {
      // 1. Invoca restorePurchases nativo
      await this.nativePurchasesPlugin.restorePurchases().catch(() => null)

      // 2. Consulta compras pendentes via getPurchases / queryPurchases
      let activePurchases: any[] = []
      if (typeof this.nativePurchasesPlugin.getPurchases === 'function') {
        const res = await this.nativePurchasesPlugin.getPurchases({}).catch(() => null)
        if (res && Array.isArray(res.purchases)) {
          activePurchases = res.purchases
        }
      }

      // 3. Processa cada compra não consumida encontrada
      for (const purchase of activePurchases) {
        const pId = purchase.productIdentifier || purchase.productId
        const token = purchase.purchaseToken || purchase.transactionId

        if (pId && token) {
          const res = await this.verifyPurchaseWithBackend(pId, token, userId)
          if (res.success) {
            restoredCount++
            acordasGrantedTotal += res.acordasGranted
          } else if (res.message) {
            errors.push(res.message)
          }
        }
      }
    } catch (err: any) {
      console.warn('[RESTORE_PURCHASES_WARN]', err?.message || err)
      errors.push(err?.message || 'Erro ao restaurar compras')
    }

    return { restoredCount, acordasGrantedTotal, errors }
  }
}

// Singleton global
export const googlePlayBillingService = new GooglePlayBillingService()
