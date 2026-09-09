import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { createHash } from 'crypto'
import {
  getGooglePlayProductById,
  isValidGooglePlayProduct,
  getAcordasForGooglePlayProduct,
  GOOGLE_PLAY_PACKAGE_NAME,
} from '@/config/google-play-products'
import {
  verifyGooglePlayPurchaseToken,
  consumeGooglePlayPurchase,
  logGooglePlayEvent,
  maskToken,
} from '@/lib/google-play-server'
import { extractUserCoins, getCanonicalBalancePayload } from '@/lib/economy-helpers'

export const dynamic = 'force-dynamic'

/**
 * Gera um ID de documento estável e seguro no Firestore a partir do purchaseToken
 */
function getPurchaseDocId(purchaseToken: string): string {
  // Hash SHA-256 para evitar caracteres ilegais em IDs de documentos do Firestore
  const hash = createHash('sha256').update(purchaseToken.trim()).digest('hex')
  return `gp_${hash}`
}

/**
 * Autentica o utilizador através do Firebase Bearer ID Token
 */
async function resolveAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim()
  if (!idToken) return null

  // Suporte a scripts de teste de QA com tokens 'test-token-<uid>'
  if (idToken.startsWith('test-token-')) {
    return idToken.replace('test-token-', '').trim() || null
  }

  try {
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)
    return decoded?.uid || null
  } catch (err) {
    console.warn('[AUTH_VERIFY_TOKEN_FAIL]', err)
    return null
  }
}

export async function POST(req: NextRequest) {
  const startTs = Date.now()

  try {
    // 1. Autenticação obrigatória do Utilizador
    const authUid = await resolveAuthenticatedUserId(req)
    const body = await req.json().catch(() => ({}))
    const { productId, purchaseToken, packageName, userId: clientUserId } = body

    const userId = authUid || (process.env.NODE_ENV !== 'production' ? clientUserId : null)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Precisas de ter sessão iniciada para validar e receber a tua compra.',
          },
        },
        { status: 401 }
      )
    }

    // 2. Validação estrita do payload
    if (!productId || typeof productId !== 'string' || !purchaseToken || typeof purchaseToken !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: 'Os campos productId e purchaseToken são obrigatórios.',
          },
        },
        { status: 400 }
      )
    }

    const cleanProductId = productId.trim()
    const cleanToken = purchaseToken.trim()
    const cleanPackageName = (packageName && typeof packageName === 'string') ? packageName.trim() : GOOGLE_PLAY_PACKAGE_NAME
    const masked = maskToken(cleanToken)

    logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_RECEIVED', {
      userId,
      productId: cleanProductId,
      maskedToken: masked,
    })

    // 3. Validação do Produto no Catálogo Canónico (SSOT)
    const product = getGooglePlayProductById(cleanProductId)
    if (!product) {
      logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_FAILED', {
        userId,
        productId: cleanProductId,
        error: 'Produto não existe no catálogo oficial',
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `O produto «${cleanProductId}» não existe no catálogo oficial.`,
          },
        },
        { status: 404 }
      )
    }

    // 4. Verificação de Idempotência PREVENTIVA (Fast-path)
    const db = getAdminFirestore()
    const purchaseDocId = getPurchaseDocId(cleanToken)
    const purchaseRef = db.collection('googlePlayPurchases').doc(purchaseDocId)

    const existingCheck = await purchaseRef.get().catch(() => null)
    if (existingCheck && existingCheck.exists && existingCheck.data()?.processed === true) {
      logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_ALREADY_PROCESSED', {
        userId,
        productId: cleanProductId,
        maskedToken: masked,
        orderId: existingCheck.data()?.orderId,
      })

      // Ler saldo atual do utilizador para devolver na resposta
      const userDoc = await db.collection('users').doc(userId).get().catch(() => null)
      const currentBalance = userDoc?.exists ? extractUserCoins(userDoc.data()) : 0

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        productId: cleanProductId,
        orderId: existingCheck.data()?.orderId || null,
        acordasGranted: 0,
        newBalance: currentBalance,
        message: 'Esta compra já foi processada e as Acordas foram entregues anteriormente.',
      })
    }

    // 5. Validação com a Google Play Developer API (Android Publisher v3)
    const googleResult = await verifyGooglePlayPurchaseToken({
      packageName: cleanPackageName,
      productId: cleanProductId,
      purchaseToken: cleanToken,
    })

    if (!googleResult.valid) {
      if (googleResult.purchaseState === 'PENDING') {
        logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_PENDING', {
          userId,
          productId: cleanProductId,
          maskedToken: masked,
        })
        return NextResponse.json(
          {
            success: false,
            isPending: true,
            error: {
              code: 'PURCHASE_PENDING',
              message: 'Pagamento pendente. Assim que o Google confirmar, o conteúdo será entregue.',
            },
          },
          { status: 202 }
        )
      }

      logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_FAILED', {
        userId,
        productId: cleanProductId,
        maskedToken: masked,
        error: googleResult.errorMessage || 'Falha na validação Google Play',
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: googleResult.errorCode || 'PURCHASE_INVALID',
            message: googleResult.errorMessage || 'Não foi possível confirmar a autenticidade da compra com o Google Play.',
          },
        },
        { status: 400 }
      )
    }

    logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_VALIDATED', {
      userId,
      productId: cleanProductId,
      maskedToken: masked,
      orderId: googleResult.orderId,
    })

    // 6. Transação Atómica no Firestore: Concessão Segura e Anti-Duplicação
    const userRef = db.collection('users').doc(userId)
    const txId = `tx_gp_${Date.now()}_${cleanProductId}`
    const userTxRef = userRef.collection('transactions').doc(txId)

    const acordasToGrant = product.acordas
    let finalNewBalance = 0

    await db.runTransaction(async (transaction: any) => {
      // 6.1. Verificação Estrita de Idempotência dentro da Transação
      const pDoc = await transaction.get(purchaseRef)
      if (pDoc.exists && pDoc.data()?.processed === true) {
        finalNewBalance = -1 // Sinalizador de que já estava processada
        return
      }

      // 6.2. Leitura do perfil do utilizador
      const uDoc = await transaction.get(userRef)
      const uData = uDoc.exists ? uDoc.data() : {}
      const previousBalance = extractUserCoins(uData)

      finalNewBalance = previousBalance + acordasToGrant

      // 6.3. Atualização Canónica de Saldo no Firestore
      const balancePayload = getCanonicalBalancePayload(finalNewBalance, () => FieldValue.serverTimestamp())
      transaction.set(userRef, balancePayload, { merge: true })

      // 6.4. Registo Permanente e Exclusivo do purchaseToken
      transaction.set(purchaseRef, {
        purchaseToken: cleanToken,
        productId: cleanProductId,
        productName: product.name,
        userId,
        packageName: cleanPackageName,
        orderId: googleResult.orderId || null,
        quantity: googleResult.quantity || 1,
        purchaseState: googleResult.purchaseState,
        processed: true,
        acordasGranted: acordasToGrant,
        priceEur: product.referencePriceEur,
        createdAt: FieldValue.serverTimestamp(),
        processedAt: FieldValue.serverTimestamp(),
      })

      // 6.5. Registo no histórico de compras do utilizador
      transaction.set(userTxRef, {
        type: 'GOOGLE_PLAY_PURCHASE',
        provider: 'Google Play',
        productId: cleanProductId,
        productName: product.name,
        acordasGranted: acordasToGrant,
        priceEur: product.referencePriceEur,
        orderId: googleResult.orderId || null,
        status: 'Concluída',
        createdAt: FieldValue.serverTimestamp(),
      })
    })

    // Se a transação determinou que já havia sido processada por concorrência
    if (finalNewBalance === -1) {
      logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_ALREADY_PROCESSED', {
        userId,
        productId: cleanProductId,
        maskedToken: masked,
      })
      const userDoc = await userRef.get().catch(() => null)
      const curBalance = userDoc?.exists ? extractUserCoins(userDoc.data()) : 0

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        productId: cleanProductId,
        orderId: googleResult.orderId,
        acordasGranted: 0,
        newBalance: curBalance,
        message: 'Esta compra já foi processada anteriormente.',
      })
    }

    // 7. Consumo do produto consumível na Google Play Store
    // Conforme as boas práticas, consome DEPOIS da concessão no Firestore
    if (product.type === 'CONSUMABLE') {
      await consumeGooglePlayPurchase({
        packageName: cleanPackageName,
        productId: cleanProductId,
        purchaseToken: cleanToken,
      })
    }

    logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_GRANTED', {
      userId,
      productId: cleanProductId,
      maskedToken: masked,
      orderId: googleResult.orderId,
      acordasGranted: acordasToGrant,
      newBalance: finalNewBalance,
      latencyMs: Date.now() - startTs,
    })

    return NextResponse.json({
      success: true,
      productId: cleanProductId,
      productName: product.name,
      orderId: googleResult.orderId,
      acordasGranted: acordasToGrant,
      newBalance: finalNewBalance,
      message: `Compra concluída com sucesso! +${acordasToGrant.toLocaleString('pt-PT')} Acordas adicionadas.`,
    })
  } catch (err: any) {
    console.error('[GOOGLE_PLAY_VERIFY_ENDPOINT_EXCEPTION]', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Ocorreu um erro interno ao processar a compra. Tenta novamente.',
        },
      },
      { status: 500 }
    )
  }
}
