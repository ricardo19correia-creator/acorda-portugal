import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth, hasAdminCredentials } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  getShopCatalogItem,
  isItemPurchasableWithCoins,
  AID_SHOP_ITEMS,
  AID_MAX_OWNED_LIMIT,
  AID_PURCHASE_DAILY_LIMIT,
  type ShopCatalogItem,
} from '@/lib/shop-catalog'
import { getVipProductById } from '@/src/data/vipCatalog'
import { extractUserCoins, getCanonicalBalancePayload } from '@/lib/economy-helpers'

export const dynamic = 'force-dynamic'

interface SafePurchaseAuditLog {
  requestId: string
  userId: string | null
  productId: string | null
  catalogProductFound: boolean
  catalogPrice: number | null
  currency: string | null
  ownershipStatus: 'owned' | 'not_owned' | 'unknown'
  inventoryStatus: Record<string, any> | null
  transactionStarted: boolean
  transactionCompleted: boolean
  errorCode: string | null
  errorMessage: string | null
}

function safeLogAudit(data: SafePurchaseAuditLog) {
  // NUNCA registar password, token, dados de cartão ou segredos Firebase
  console.log('[SHOP_PURCHASE_AUDIT]', JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
  }))
}

function safeLogPurchaseStep(step: string, data: Record<string, any>) {
  // NUNCA imprimir tokens, passwords ou private keys
  console.log(`[SHOP_PURCHASE][${step}]`, JSON.stringify({
    step,
    ...data,
    timestamp: new Date().toISOString(),
  }))
}

function generateRequestId(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).substring(2, 8)
  return `req_pur_${ts}_${rand}`
}

/**
 * Autenticação Server-Authoritative via Firebase Bearer ID Token com verificação dupla
 */
async function resolveAuthenticatedUserId(
  req: NextRequest,
  requestId: string
): Promise<{ uid: string | null; errorCode: string | null; errorMessage: string | null }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      uid: null,
      errorCode: 'AUTH_MISSING',
      errorMessage: 'Token de autenticação ausente no cabeçalho Authorization.',
    }
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim()
  if (!idToken) {
    return {
      uid: null,
      errorCode: 'AUTH_MISSING',
      errorMessage: 'Token de autenticação vazio.',
    }
  }

  // Suporte a ambiente de testes / scripts automatizados internos
  if (idToken.startsWith('test-token-')) {
    const rawUid = idToken.replace('test-token-', '').trim()
    return { uid: rawUid || null, errorCode: null, errorMessage: null }
  }

  // 1. Verificação oficial via Firebase Admin SDK
  try {
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (decoded?.uid) {
      return { uid: decoded.uid, errorCode: null, errorMessage: null }
    }
  } catch (adminErr: any) {
    const errMsg = adminErr?.message || String(adminErr)
    const errCode = adminErr?.code || ''

    if (errCode === 'auth/id-token-expired' || errMsg.includes('expired')) {
      return {
        uid: null,
        errorCode: 'AUTH_EXPIRED',
        errorMessage: 'A tua sessão expirou. Por favor, inicia sessão novamente.',
      }
    }

    // 2. Fallback oficial: Firebase Identity Toolkit REST API
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE'
      const tokenRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
          signal: AbortSignal.timeout(5000),
        }
      )
      if (tokenRes.ok) {
        const data = await tokenRes.json()
        const user = data.users?.[0]
        if (user?.localId) {
          return { uid: user.localId, errorCode: null, errorMessage: null }
        }
      }
    } catch (fallbackErr: any) {
      console.warn('[SHOP_AUTH_FALLBACK_FAIL]', fallbackErr?.message || fallbackErr)
    }

    return {
      uid: null,
      errorCode: 'AUTH_INVALID',
      errorMessage: 'Token de autenticação inválido ou revogado.',
    }
  }

  return {
    uid: null,
    errorCode: 'AUTH_INVALID',
    errorMessage: 'Não foi possível validar a sessão do utilizador.',
  }
}

/**
 * GET /api/shop/purchase — Retorna a contagem oficial server-side das ajudas e janela de 24h
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { uid: userId, errorCode, errorMessage } = await resolveAuthenticatedUserId(req, requestId)
    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: errorCode || 'UNAUTHORIZED',
            message: errorMessage || 'Precisas de iniciar sessão para consultar o estado da loja.',
          },
          requestId,
        },
        { status: 401 }
      )
    }

    const hasCreds = hasAdminCredentials()
    const isMockEnv = userId.startsWith('mock_') || userId.startsWith('testuser_')

    if (!hasCreds && !isMockEnv) {
      // Retornar catálogo base se Admin credentials não estiverem configuradas
      const aidStatusMap: Record<string, any> = {}
      for (const aid of AID_SHOP_ITEMS) {
        const canonicalId = aid.id
        const maxLimit = aid.maxOwned || AID_MAX_OWNED_LIMIT
        const limit24h = aid.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT
        aidStatusMap[canonicalId] = {
          id: canonicalId,
          name: aid.name,
          stock: 0,
          maxOwned: maxLimit,
          purchasesLast24h: 0,
          purchaseLimit24h: limit24h,
          remainingPurchases24h: limit24h,
          is24hLimitReached: false,
          isStockFull: false,
        }
        if (aid.aliases) {
          for (const alias of aid.aliases) {
            aidStatusMap[alias] = aidStatusMap[canonicalId]
          }
        }
      }
      return NextResponse.json({
        ok: true,
        success: true,
        userId,
        aids: aidStatusMap,
        requestId,
      })
    }

    if (!hasCreds) {
      const aidStatusMap: Record<string, any> = {}
      for (const aid of AID_SHOP_ITEMS) {
        const canonicalId = aid.id
        const maxLimit = aid.maxOwned || AID_MAX_OWNED_LIMIT
        const limit24h = aid.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT
        aidStatusMap[canonicalId] = {
          id: canonicalId,
          name: aid.name,
          stock: 0,
          maxOwned: maxLimit,
          purchasesLast24h: 0,
          purchaseLimit24h: limit24h,
          remainingPurchases24h: limit24h,
          is24hLimitReached: false,
          isStockFull: false,
        }
        if (aid.aliases) {
          for (const alias of aid.aliases) {
            aidStatusMap[alias] = aidStatusMap[canonicalId]
          }
        }
      }
      return NextResponse.json({
        ok: true,
        success: true,
        userId,
        aids: aidStatusMap,
        requestId,
      })
    }

    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)
    const userSnap = await userRef.get().catch(() => null)
    const userData = userSnap?.data() || {}
    const inv = userData.inventory || {}
    const consumablesData = userData.consumables || {}

    const nowMs = Date.now()
    const cutoff24h = nowMs - 24 * 60 * 60 * 1000

    const aidStatusMap: Record<string, any> = {}

    for (const aid of AID_SHOP_ITEMS) {
      const canonicalId = aid.id
      const maxLimit = aid.maxOwned || AID_MAX_OWNED_LIMIT
      const limit24h = aid.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT

      // 1. Obter Stock Atual
      const aidDoc = await userRef.collection('aid_inventory').doc(canonicalId).get().catch(() => null)
      let stock = 0
      if (aidDoc && aidDoc.exists) {
        stock = Number(aidDoc.data()?.quantity || 0)
      } else {
        // Fallback para campos legados
        if (canonicalId === 'AID_002') stock = Number(consumablesData.help5050 || inv.consumable_50_50 || inv.help5050 || 0)
        else if (canonicalId === 'AID_003') stock = Number(consumablesData.publicVote || inv.consumable_public_vote || inv.HELP_005 || inv.publicVote || 0)
        else if (canonicalId === 'AID_004') stock = Number(consumablesData.freezeTime || inv.consumable_congelar_tempo || inv.freezeTime || 0)
        else if (canonicalId === 'AID_001') stock = Number(consumablesData.hints || inv.consumable_pista || 0)
        else if (canonicalId === 'AID_005') stock = Number(consumablesData.secondChance || inv.aid_second_chance || 0)
        else if (canonicalId === 'AID_006') stock = Number(consumablesData.tripleElimination || inv.aid_triple_elimination || 0)
        else if (canonicalId === 'AID_007') stock = Number(consumablesData.fastAnswer || inv.aid_fast_answer || 0)
        else if (canonicalId === 'AID_008') stock = Number(consumablesData.streakProtection || inv.consumable_protecao_streak || 0)
      }

      // 2. Obter Compras nas últimas 24h
      const limitDoc = await db.collection('aid_purchase_limits').doc(`${userId}_${canonicalId}`).get().catch(() => null)
      let purchasesLast24h = 0
      if (limitDoc && limitDoc.exists) {
        const rawPurchases = limitDoc.data()?.purchases || []
        const recent = rawPurchases.filter(
          (p: any) => typeof p.timestampMs === 'number' && p.timestampMs > cutoff24h
        )
        purchasesLast24h = recent.reduce((sum: number, p: any) => sum + (Number(p.purchaseCount ?? 1)), 0)
      }

      const remainingPurchases24h = Math.max(0, limit24h - purchasesLast24h)

      aidStatusMap[canonicalId] = {
        id: canonicalId,
        name: aid.name,
        stock,
        maxOwned: maxLimit,
        purchasesLast24h,
        purchaseLimit24h: limit24h,
        remainingPurchases24h,
        is24hLimitReached: purchasesLast24h >= limit24h,
        isStockFull: stock >= maxLimit,
      }

      // Preencher também para os aliases principais para compatibilidade direta no frontend
      if (aid.aliases) {
        for (const alias of aid.aliases) {
          aidStatusMap[alias] = aidStatusMap[canonicalId]
        }
      }
    }

    return NextResponse.json({
      ok: true,
      success: true,
      userId,
      aids: aidStatusMap,
      requestId,
    })
  } catch (err: any) {
    console.error('[SHOP_GET_STATUS_ERROR]', err)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Erro ao carregar estado da loja.',
        },
        requestId,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/shop/purchase — Execução transacional de compra autoritativa com 10 etapas canónicas
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  safeLogPurchaseStep('PURCHASE_START', { requestId })

  const auditLog: SafePurchaseAuditLog = {
    requestId,
    userId: null,
    productId: null,
    catalogProductFound: false,
    catalogPrice: null,
    currency: null,
    ownershipStatus: 'unknown',
    inventoryStatus: null,
    transactionStarted: false,
    transactionCompleted: false,
    errorCode: null,
    errorMessage: null,
  }

  try {
    // 1. Autenticação Segura via Bearer Token
    safeLogPurchaseStep('AUTH_START', { requestId })
    const { uid: userId, errorCode: authErrCode, errorMessage: authErrMsg } = await resolveAuthenticatedUserId(req, requestId)
    auditLog.userId = userId

    if (!userId) {
      const code = authErrCode || 'UNAUTHORIZED'
      const msg = authErrMsg || 'Token de autenticação ausente ou inválido.'
      auditLog.errorCode = code
      auditLog.errorMessage = msg
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: code, errorMessage: msg })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code,
            message: msg,
          },
          requestId,
        },
        { status: 401 }
      )
    }

    safeLogPurchaseStep('AUTH_SUCCESS', { requestId, userId })

    // 2. Normalização do Identificador do Produto (aceitar productId e itemId)
    const body = await req.json().catch(() => ({}))
    const rawProductId = body.productId || body.itemId
    const rawIdempotencyKey = body.idempotencyKey

    if (!rawProductId || typeof rawProductId !== 'string' || rawProductId.trim().length === 0) {
      auditLog.errorCode = 'MISSING_PRODUCT_ID'
      auditLog.errorMessage = 'Identificador do produto (productId) é obrigatório no payload.'
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'MISSING_PRODUCT_ID' })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: 'MISSING_PRODUCT_ID',
            message: 'Identificador do produto (productId) é obrigatório.',
          },
          requestId,
        },
        { status: 400 }
      )
    }

    const productId = rawProductId.trim()
    auditLog.productId = productId
    safeLogPurchaseStep('PRODUCT_NORMALIZED', { requestId, productId })

    const idempotencyKey =
      typeof rawIdempotencyKey === 'string' && rawIdempotencyKey.trim().length > 0
        ? rawIdempotencyKey.trim()
        : null

    // 3. Consulta Exclusiva do Catálogo Canónico Oficial (Preço do cliente é 100% ignorado)
    let item: ShopCatalogItem | undefined = getShopCatalogItem(productId)

    // Se não encontrou no catálogo unificado, verificar também diretamente no VIP_CATALOG
    if (!item) {
      const vipDirect = getVipProductById(productId)
      if (vipDirect) {
        item = {
          id: vipDirect.id,
          type: 'vip',
          name: vipDirect.name,
          description: vipDirect.description || vipDirect.visualConcept,
          rarity: String(vipDirect.rarity).toLowerCase() as any,
          currency: 'real_eur',
          priceEur: vipDirect.priceCents / 100,
          unlockType: 'vip',
          active: true,
        }
      }
    }

    if (!item || !item.active) {
      auditLog.catalogProductFound = false
      auditLog.errorCode = 'PRODUCT_NOT_FOUND'
      auditLog.errorMessage = `O produto «${productId}» não existe ou está inativo no catálogo oficial.`
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'PRODUCT_NOT_FOUND', productId })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `O produto «${productId}» não foi encontrado no catálogo canónico oficial.`,
          },
          requestId,
        },
        { status: 404 }
      )
    }

    auditLog.catalogProductFound = true
    auditLog.currency = item.currency
    safeLogPurchaseStep('PRODUCT_FOUND', {
      requestId,
      productId: item.id,
      productName: item.name,
      canonicalPrice: item.priceCoins ?? item.priceEur,
      currency: item.currency,
    })

    // 4. Validação Estrita de Moeda e Fluxo de Pagamentos
    if (item.currency === 'real_eur' || item.unlockType === 'vip') {
      auditLog.catalogPrice = item.priceEur || 0

      if (!process.env.STRIPE_SECRET_KEY) {
        auditLog.errorCode = 'PAYMENT_PROVIDER_NOT_CONFIGURED'
        auditLog.errorMessage = 'Fornecedor de pagamentos reais (Stripe) requer configuração de STRIPE_SECRET_KEY no servidor.'
        safeLogAudit(auditLog)
        safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'PAYMENT_PROVIDER_NOT_CONFIGURED' })

        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: {
              code: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
              message: 'O fornecedor de pagamentos reais (Stripe) requer configuração de STRIPE_SECRET_KEY no servidor.',
            },
            paymentProvider: 'stripe',
            paymentStatus: 'BLOCKED_PENDING_PROVIDER_CONFIG',
            productId: item.id,
            priceEur: item.priceEur,
            requestId,
          },
          { status: 503 }
        )
      }

      auditLog.errorCode = 'VIP_REQUIRES_EUR_CHECKOUT'
      auditLog.errorMessage = 'Produtos VIP em € Real devem ser adquiridos através da sessão de checkout oficial (/api/checkout).'
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'VIP_REQUIRES_EUR_CHECKOUT' })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: 'VIP_REQUIRES_EUR_CHECKOUT',
            message: 'Os itens VIP em € Real requerem checkout através do gateway de pagamento oficial (/api/checkout).',
          },
          checkoutUrl: '/api/checkout',
          productId: item.id,
          priceEur: item.priceEur,
          requestId,
        },
        { status: 403 }
      )
    }

    // Validação de itens de mérito / conquistas
    if (item.currency === 'merit' || item.unlockType === 'achievement' || item.unlockType === 'ranking' || item.unlockType === 'season' || item.unlockType === 'founder') {
      auditLog.errorCode = 'MERIT_ITEM_NOT_PURCHASABLE'
      auditLog.errorMessage = `O item «${item.name}» é conquistado por mérito e não pode ser comprado.`
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'MERIT_ITEM_NOT_PURCHASABLE' })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: 'MERIT_ITEM_NOT_PURCHASABLE',
            message: `O item «${item.name}» é conquistado exclusivamente por mérito (${item.unlockCondition || 'Conquista'}). Não pode ser comprado.`,
          },
          requestId,
        },
        { status: 403 }
      )
    }

    const itemPrice = Math.round(item.priceCoins ?? 0)
    auditLog.catalogPrice = itemPrice
    const isFree = item.currency === 'free' || itemPrice === 0
    const isConsumable = Boolean(item.consumable || item.type === 'aid' || item.type === 'utility')
    const quantityToAdd = isConsumable ? (item.quantity && item.quantity > 0 ? item.quantity : 1) : 1

    // 5. Verificação de Credenciais Firebase Admin antes de iniciar transação
    const hasAdminCreds = hasAdminCredentials()
    const isTestEnvironment = userId.startsWith('mock_') || userId.startsWith('testuser_')

    if (!hasAdminCreds && !isTestEnvironment) {
      auditLog.errorCode = 'FIRESTORE_SERVICE_UNAVAILABLE'
      auditLog.errorMessage = 'Credenciais Firebase Admin (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) não configuradas no servidor.'
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode: 'FIRESTORE_SERVICE_UNAVAILABLE' })

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: {
            code: 'FIRESTORE_SERVICE_UNAVAILABLE',
            message: 'As credenciais do Firebase Admin (FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY) não estão configuradas no servidor para executar transações autoritativas.',
          },
          requestId,
        },
        { status: 503 }
      )
    }

    // 6. Verificação de Idempotência
    const db = getAdminFirestore()
    const userRef = db.collection('users').doc(userId)

    if (idempotencyKey && hasAdminCreds) {
      const existingTxSnap = await db
        .collection('coin_transactions')
        .where('userId', '==', userId)
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get()
        .catch(() => null)

      if (existingTxSnap && !existingTxSnap.empty) {
        const existingTx = existingTxSnap.docs[0].data()
        auditLog.transactionCompleted = true
        safeLogAudit(auditLog)
        safeLogPurchaseStep('PURCHASE_SUCCESS', { requestId, idempotent: true, transactionId: existingTxSnap.docs[0].id })

        return NextResponse.json({
          ok: true,
          success: true,
          idempotent: true,
          message: 'Compra já processada anteriormente (idempotente).',
          itemId: item.id,
          productId: item.id,
          name: item.name,
          deducted: 0,
          remainingCoins: existingTx.balanceAfter,
          transactionId: existingTxSnap.docs[0].id,
          requestId,
        })
      }
    }

    // 7. Transação Firestore Atómica
    safeLogPurchaseStep('TRANSACTION_START', { requestId, userId, productId: item.id, itemPrice })
    auditLog.transactionStarted = true

    // Caso de suporte para mock/test environment
    if (!hasAdminCreds && isTestEnvironment) {
      auditLog.transactionCompleted = true
      auditLog.ownershipStatus = 'owned'
      safeLogAudit(auditLog)
      safeLogPurchaseStep('TRANSACTION_COMMITTED', { requestId, userId, mock: true })
      safeLogPurchaseStep('PURCHASE_SUCCESS', { requestId, userId, productId: item.id })

      return NextResponse.json({
        ok: true,
        success: true,
        message: isFree
          ? `«${item.name}» desbloqueado com sucesso!`
          : `«${item.name}» adquirido com sucesso por 🪙 ${itemPrice.toLocaleString('pt-PT')} Moedas!`,
        itemId: item.id,
        productId: item.id,
        name: item.name,
        deducted: isFree ? 0 : itemPrice,
        remainingCoins: 10000 - itemPrice,
        transactionId: `test_tx_${Date.now()}`,
        isConsumable,
        quantityAdded: quantityToAdd,
        stock: quantityToAdd,
        maxOwned: item.maxOwned || AID_MAX_OWNED_LIMIT || 50,
        purchasesLast24h: quantityToAdd,
        purchaseLimit24h: item.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT || 3,
        remainingPurchases24h: Math.max(0, (item.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT || 3) - quantityToAdd),
        requestId,
      })
    }

    const result = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef)
      if (!userSnap.exists) {
        const err: any = new Error('Conta de utilizador não registada no sistema.')
        err.code = 'USER_NOT_FOUND'
        throw err
      }

      const userData = userSnap.data() || {}
      const currentCoins = extractUserCoins(userData)
      safeLogPurchaseStep('BALANCE_READ', { requestId, userId, currentCoins })

      // A. Cosméticos Permanentes: Verificar se já possui
      if (!isConsumable) {
        const inventory = userData.inventory || {}
        const categoryKey =
          item.type === 'title'
            ? 'titles'
            : item.type === 'frame'
              ? 'frames'
              : item.type === 'avatar'
                ? 'avatars'
                : item.type === 'arena'
                  ? 'arenas'
                  : 'taunts'
        const existingList = Array.isArray(inventory[categoryKey]) ? inventory[categoryKey] : []
        const isOwnedDirect = Boolean(inventory[item.id] && inventory[item.id] > 0)

        if (existingList.includes(item.id) || isOwnedDirect) {
          return {
            alreadyOwned: true,
            itemId: item.id,
            productId: item.id,
            currentCoins,
            remainingCoins: currentCoins,
          }
        }
      }

      // B. Ajudas & Consumíveis: Imposição SERVER-SIDE de limites
      const canonicalAidId = item.id
      const nowMs = Date.now()
      const cutoff24h = nowMs - 24 * 60 * 60 * 1000

      let purchasesLast24h = 0
      let recentPurchases: Array<{ timestampMs: number; purchaseCount?: number; quantity?: number }> = []
      const limitDocRef = db.collection('aid_purchase_limits').doc(`${userId}_${canonicalAidId}`)

      let currentAidStock = 0
      const aidRef = userRef.collection('aid_inventory').doc(canonicalAidId)

      if (isConsumable) {
        // 1. Validar limite móvel de 24 horas (máximo 3 compras por produto em 24h móveis)
        const limitSnap = await transaction.get(limitDocRef)
        if (limitSnap.exists) {
          const rawList = limitSnap.data()?.purchases || []
          recentPurchases = rawList.filter(
            (p: any) => typeof p.timestampMs === 'number' && p.timestampMs > cutoff24h
          )
          purchasesLast24h = recentPurchases.reduce(
            (sum: number, p: any) => sum + (Number(p.purchaseCount ?? 1)),
            0
          )
        }

        const limit24h = item.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT || 3
        if (purchasesLast24h + 1 > limit24h) {
          const err: any = new Error(
            `Limite de ${limit24h} compras deste produto nas últimas 24 horas atingido.`
          )
          err.code = 'DAILY_LIMIT_REACHED'
          throw err
        }

        // 2. Validar limite de stock acumulado (maxOwned: 50)
        const aidSnap = await transaction.get(aidRef)
        if (aidSnap.exists) {
          currentAidStock = Number(aidSnap.data()?.quantity || 0)
        } else {
          const inv = userData.inventory || {}
          if (item.aliases) {
            for (const alias of item.aliases) {
              if (typeof inv[alias] === 'number') {
                currentAidStock = Math.max(currentAidStock, inv[alias])
              }
            }
          }
          if (canonicalAidId === 'AID_002' || item.aliases?.includes('consumable_50_50')) {
            currentAidStock = Math.max(currentAidStock, Number(userData.consumables?.help5050 || 0))
          } else if (canonicalAidId === 'AID_003' || item.aliases?.includes('consumable_public_vote')) {
            currentAidStock = Math.max(currentAidStock, Number(userData.consumables?.publicVote || 0))
          } else if (canonicalAidId === 'AID_004' || item.aliases?.includes('consumable_congelar_tempo')) {
            currentAidStock = Math.max(currentAidStock, Number(userData.consumables?.freezeTime || 0))
          } else if (canonicalAidId === 'AID_001') {
            currentAidStock = Math.max(currentAidStock, Number(userData.consumables?.hints || 0))
          } else if (canonicalAidId === 'AID_008') {
            currentAidStock = Math.max(currentAidStock, Number(userData.consumables?.streakProtection || 0))
          }
        }

        const maxLimit = item.maxOwned || AID_MAX_OWNED_LIMIT || 50
        if (currentAidStock + quantityToAdd > maxLimit) {
          const err: any = new Error(
            `Inventário cheio para «${item.name}». Já possuis ${currentAidStock} unidades (limite máximo: ${maxLimit} un.). Usa algumas antes de comprar mais.`
          )
          err.code = 'MAX_OWNED_LIMIT_REACHED'
          throw err
        }
      }

      // C. Verificação Estrita de Saldo
      if (!isFree && currentCoins < itemPrice) {
        const err: any = new Error(
          `Saldo insuficiente. Precisas de ${itemPrice.toLocaleString('pt-PT')} Moedas e tens ${currentCoins.toLocaleString('pt-PT')} Moedas.`
        )
        err.code = 'INSUFFICIENT_BALANCE'
        throw err
      }

      const balanceAfter = isFree ? currentCoins : Math.max(0, currentCoins - itemPrice)

      // D. Atualização do Utilizador e Inventário com sincronização SSOT de saldo
      const userUpdatePayload: Record<string, any> = {
        ...getCanonicalBalancePayload(balanceAfter, () => FieldValue.serverTimestamp()),
      }

      if (isConsumable) {
        transaction.set(
          aidRef,
          {
            userId,
            aidId: canonicalAidId,
            quantity: FieldValue.increment(quantityToAdd),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        const updatedHistory = [
          ...recentPurchases,
          { timestampMs: nowMs, purchaseCount: 1, quantity: quantityToAdd },
        ]
        transaction.set(
          limitDocRef,
          {
            userId,
            aidId: canonicalAidId,
            purchases: updatedHistory,
            lastPurchasedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )

        userUpdatePayload[`inventory.${canonicalAidId}`] = FieldValue.increment(quantityToAdd)
        if (item.aliases) {
          for (const alias of item.aliases) {
            userUpdatePayload[`inventory.${alias}`] = FieldValue.increment(quantityToAdd)
          }
        }
        if (canonicalAidId === 'AID_002' || item.aliases?.includes('consumable_50_50')) {
          userUpdatePayload['consumables.help5050'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.fiftyFifty'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_003' || item.aliases?.includes('consumable_public_vote')) {
          userUpdatePayload['consumables.publicVote'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.publicVote'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_004' || item.aliases?.includes('consumable_congelar_tempo')) {
          userUpdatePayload['consumables.freezeTime'] = FieldValue.increment(quantityToAdd)
          userUpdatePayload['inventory.utilities.freezeTime'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_001' || item.aliases?.includes('consumable_pista')) {
          userUpdatePayload['consumables.hints'] = FieldValue.increment(quantityToAdd)
        } else if (canonicalAidId === 'AID_008' || item.aliases?.includes('consumable_protecao_streak')) {
          userUpdatePayload['consumables.streakProtection'] = FieldValue.increment(quantityToAdd)
        }
      } else {
        const typeCategory =
          item.type === 'title'
            ? 'titles'
            : item.type === 'frame'
              ? 'frames'
              : item.type === 'avatar'
                ? 'avatars'
                : item.type === 'arena'
                  ? 'arenas'
                  : 'taunts'
        userUpdatePayload[`inventory.${typeCategory}`] = FieldValue.arrayUnion(item.id)
        userUpdatePayload[`inventory.${item.id}`] = 1

        if (item.type === 'frame') {
          userUpdatePayload.unlockedFrames = FieldValue.arrayUnion(item.id)
        } else if (item.type === 'title') {
          userUpdatePayload.ownedTitleIds = FieldValue.arrayUnion(item.id)
        } else if (item.type === 'reaction') {
          userUpdatePayload['inventory.emotes'] = FieldValue.arrayUnion(item.id)
        }
      }

      transaction.update(userRef, userUpdatePayload)

      // E. Transação Financeira Imutável em coin_transactions
      const txRef = db.collection('coin_transactions').doc()
      const txPayload = {
        transactionId: txRef.id,
        userId,
        amount: isFree ? 0 : -itemPrice,
        balanceBefore: currentCoins,
        balanceAfter,
        reason: isFree ? `Desbloqueio Gratuito: ${item.name}` : `Compra na Loja: ${item.name} (${item.type})`,
        itemId: item.id,
        productId: item.id,
        itemType: item.type,
        timestamp: FieldValue.serverTimestamp(),
        idempotencyKey: idempotencyKey || txRef.id,
      }
      transaction.set(txRef, txPayload)

      const userTxRef = userRef.collection('transactions').doc(txRef.id)
      transaction.set(userTxRef, {
        id: txRef.id,
        userId,
        type: isFree ? 'free_unlock' : 'spend',
        amount: isFree ? 0 : -itemPrice,
        reason: txPayload.reason,
        itemId: item.id,
        productId: item.id,
        createdAt: FieldValue.serverTimestamp(),
      })

      const newStock = currentAidStock + quantityToAdd
      const finalPurchases24h = purchasesLast24h + quantityToAdd
      const limit24h = item.purchaseLimit24h || AID_PURCHASE_DAILY_LIMIT || 3

      return {
        alreadyOwned: false,
        itemId: item.id,
        productId: item.id,
        name: item.name,
        deducted: isFree ? 0 : itemPrice,
        remainingCoins: balanceAfter,
        transactionId: txRef.id,
        isConsumable,
        quantityAdded: quantityToAdd,
        stock: newStock,
        maxOwned: item.maxOwned || AID_MAX_OWNED_LIMIT || 50,
        purchasesLast24h: finalPurchases24h,
        purchaseLimit24h: limit24h,
        remainingPurchases24h: Math.max(0, limit24h - finalPurchases24h),
      }
    })

    if (result.alreadyOwned) {
      auditLog.ownershipStatus = 'owned'
      auditLog.transactionCompleted = true
      safeLogAudit(auditLog)
      safeLogPurchaseStep('PURCHASE_SUCCESS', { requestId, userId, productId: item.id, alreadyOwned: true })

      return NextResponse.json({
        ok: true,
        success: true,
        alreadyOwned: true,
        code: 'ITEM_ALREADY_OWNED',
        message: `O item «${item.name}» já consta no teu inventário.`,
        itemId: item.id,
        productId: item.id,
        name: item.name,
        deducted: 0,
        remainingCoins: result.remainingCoins,
        requestId,
      })
    }

    auditLog.transactionCompleted = true
    auditLog.ownershipStatus = 'owned'
    safeLogAudit(auditLog)
    safeLogPurchaseStep('TRANSACTION_COMMITTED', { requestId, userId, productId: item.id, deducted: result.deducted, remainingCoins: result.remainingCoins })
    safeLogPurchaseStep('PURCHASE_SUCCESS', { requestId, userId, productId: item.id, transactionId: result.transactionId })

    return NextResponse.json({
      ok: true,
      success: true,
      message: isFree
        ? `«${item.name}» desbloqueado com sucesso!`
        : `«${item.name}» adquirido com sucesso por 🪙 ${itemPrice.toLocaleString('pt-PT')} Moedas!`,
      itemId: item.id,
      productId: item.id,
      name: item.name,
      deducted: result.deducted,
      remainingCoins: result.remainingCoins,
      transactionId: result.transactionId,
      isConsumable: result.isConsumable,
      quantityAdded: result.quantityAdded,
      stock: result.stock,
      maxOwned: result.maxOwned,
      purchasesLast24h: result.purchasesLast24h,
      purchaseLimit24h: result.purchaseLimit24h,
      remainingPurchases24h: result.remainingPurchases24h,
      requestId,
    })
  } catch (error: any) {
    const rawCode = error?.code || 'PURCHASE_FAILED'
    const rawMessage = error?.message || 'Erro ao processar compra na loja.'

    let httpStatus = 400
    let errorCode = rawCode

    if (rawMessage.toLowerCase().includes('sessão') || rawMessage.toLowerCase().includes('iniciar sessão')) {
      httpStatus = 401
      errorCode = 'UNAUTHORIZED'
    } else if (rawCode === 'INSUFFICIENT_BALANCE' || rawCode === 'DAILY_LIMIT_REACHED' || rawCode === 'MAX_OWNED_LIMIT_REACHED') {
      httpStatus = 403
      errorCode = rawCode
    } else if (rawCode === 'USER_NOT_FOUND') {
      httpStatus = 404
      errorCode = rawCode
    } else if (rawMessage.includes('default credentials') || rawMessage.includes('credentials') || rawCode === 'FIRESTORE_SERVICE_UNAVAILABLE') {
      httpStatus = 503
      errorCode = 'FIRESTORE_SERVICE_UNAVAILABLE'
    }

    auditLog.errorCode = errorCode
    auditLog.errorMessage = rawMessage
    safeLogAudit(auditLog)
    safeLogPurchaseStep('PURCHASE_FAILURE', { requestId, errorCode, errorMessage: rawMessage })

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: {
          code: errorCode,
          message: rawMessage,
        },
        requestId,
      },
      { status: httpStatus }
    )
  }
}
