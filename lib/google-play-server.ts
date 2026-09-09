/**
 * 🇵🇹 ACORDA PORTUGAL — GOOGLE PLAY SERVER VALIDATION & CONSUMPTION SERVICE (SSOT)
 *
 * Responsável por:
 * 1. Autenticar com a Google Play Developer API (Android Publisher v3) via Service Account.
 * 2. Validar purchaseToken, packageName, productId, purchaseState e consumptionState.
 * 3. Consumir a compra na Google Play Store após concessão segura de Acordas.
 * 4. Logs estruturados e higienizados (sem segredos nem PII).
 */

import { JWT } from 'google-auth-library'
import {
  GOOGLE_PLAY_PACKAGE_NAME,
  getGooglePlayProductById,
} from '@/config/google-play-products'
import { getAdminCredentials, formatPrivateKey } from '@/lib/firebase-admin'

export interface GooglePlayValidationResult {
  valid: boolean
  purchaseState: 'PURCHASED' | 'PENDING' | 'CANCELED' | 'UNSPECIFIED'
  orderId: string | null
  consumptionState: number // 0 = Yet to be consumed, 1 = Consumed
  acknowledgementState: number // 0 = Yet to be acknowledged, 1 = Acknowledged
  purchaseTimeMillis: number
  quantity: number
  errorCode?: string
  errorMessage?: string
  rawResponse?: Record<string, any>
}

/**
 * Higieniza tokens para logs de auditoria (ex: "token_12345678" -> "token...5678")
 */
export function maskToken(token: string | null | undefined): string {
  if (!token) return 'null'
  if (token.length <= 8) return '***'
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

/**
 * Emite logs estruturados seguros de monetização
 */
export function logGooglePlayEvent(
  event:
    | 'GOOGLE_PLAY_PURCHASE_RECEIVED'
    | 'GOOGLE_PLAY_PURCHASE_VALIDATED'
    | 'GOOGLE_PLAY_PURCHASE_GRANTED'
    | 'GOOGLE_PLAY_PURCHASE_ALREADY_PROCESSED'
    | 'GOOGLE_PLAY_PURCHASE_FAILED'
    | 'GOOGLE_PLAY_PURCHASE_PENDING',
  details: {
    userId?: string
    productId?: string
    maskedToken?: string
    orderId?: string | null
    amount?: number
    error?: string
    [key: string]: any
  }
) {
  // NUNCA expor tokens completos, credenciais ou chaves privadas em logs
  console.log(`[${event}]`, JSON.stringify({
    event,
    ...details,
    timestamp: new Date().toISOString(),
  }))
}

/**
 * Obtém as credenciais de Service Account para a Google Play Developer API
 */
function getGooglePlayServiceAccount() {
  const customEmail = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL
  const customKey = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY
  const customJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON

  if (customJson) {
    try {
      const parsed = JSON.parse(customJson)
      if (parsed.client_email && parsed.private_key) {
        return {
          email: parsed.client_email,
          key: formatPrivateKey(parsed.private_key),
        }
      }
    } catch {
      // continua para fallbacks
    }
  }

  if (customEmail && customKey) {
    return {
      email: customEmail,
      key: formatPrivateKey(customKey),
    }
  }

  // Fallback: reutilizar Service Account do Firebase se estiver no mesmo projeto GCP
  const { clientEmail, rawKey } = getAdminCredentials()
  if (clientEmail && rawKey) {
    return {
      email: clientEmail,
      key: formatPrivateKey(rawKey),
    }
  }

  return null
}

/**
 * Cria um cliente JWT autenticado com scope da Google Play Developer API
 */
let googlePlayJwtClient: JWT | null = null

function getGooglePlayAuthClient(): JWT | null {
  if (googlePlayJwtClient) return googlePlayJwtClient

  const creds = getGooglePlayServiceAccount()
  if (!creds || !creds.email || !creds.key) {
    return null
  }

  try {
    googlePlayJwtClient = new JWT({
      email: creds.email,
      key: creds.key,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    })
    return googlePlayJwtClient
  } catch (err: any) {
    console.warn('[GOOGLE_PLAY_AUTH_INIT_WARN] Falha ao instanciar JWT Client:', err?.message)
    return null
  }
}

/**
 * Valida um purchaseToken diretamente na Google Play Developer API (Android Publisher v3).
 *
 * Endpoint:
 * GET https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
 */
export async function verifyGooglePlayPurchaseToken(params: {
  packageName: string
  productId: string
  purchaseToken: string
}): Promise<GooglePlayValidationResult> {
  const { packageName, productId, purchaseToken } = params
  const masked = maskToken(purchaseToken)

  // 1. Verificação básica dos parâmetros
  if (!packageName || !productId || !purchaseToken) {
    return {
      valid: false,
      purchaseState: 'UNSPECIFIED',
      orderId: null,
      consumptionState: 0,
      acknowledgementState: 0,
      purchaseTimeMillis: 0,
      quantity: 0,
      errorCode: 'MISSING_PARAMETERS',
      errorMessage: 'Parâmetros packageName, productId ou purchaseToken ausentes.',
    }
  }

  // 2. Suporte a testes automatizados controlados (Ambiente QA / Test Suite)
  if (
    process.env.NODE_ENV !== 'production' &&
    (purchaseToken.startsWith('test-token-') || purchaseToken.startsWith('mock-token-'))
  ) {
    const isPending = purchaseToken.includes('pending')
    const isCanceled = purchaseToken.includes('canceled')

    if (isPending) {
      return {
        valid: false,
        purchaseState: 'PENDING',
        orderId: `GPA.TEST-PENDING-${Date.now()}`,
        consumptionState: 0,
        acknowledgementState: 0,
        purchaseTimeMillis: Date.now(),
        quantity: 1,
        errorCode: 'PURCHASE_PENDING',
        errorMessage: 'Pagamento pendente na Google Play Store.',
      }
    }

    if (isCanceled) {
      return {
        valid: false,
        purchaseState: 'CANCELED',
        orderId: `GPA.TEST-CANCELED-${Date.now()}`,
        consumptionState: 0,
        acknowledgementState: 0,
        purchaseTimeMillis: Date.now(),
        quantity: 1,
        errorCode: 'PURCHASE_CANCELED',
        errorMessage: 'A compra foi cancelada pelo utilizador.',
      }
    }

    return {
      valid: true,
      purchaseState: 'PURCHASED',
      orderId: `GPA.TEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      consumptionState: 0,
      acknowledgementState: 0,
      purchaseTimeMillis: Date.now(),
      quantity: 1,
      rawResponse: { testMode: true, validatedAt: new Date().toISOString() },
    }
  }

  // 3. Validação Real com a Google Play Developer API
  const authClient = getGooglePlayAuthClient()
  if (!authClient) {
    // Se em produção as credenciais da API não estiverem carregadas, rejeitar a compra com erro seguro
    if (process.env.NODE_ENV === 'production') {
      return {
        valid: false,
        purchaseState: 'UNSPECIFIED',
        orderId: null,
        consumptionState: 0,
        acknowledgementState: 0,
        purchaseTimeMillis: 0,
        quantity: 0,
        errorCode: 'API_CREDENTIALS_MISSING',
        errorMessage: 'As credenciais da Google Play Developer API não estão configuradas no servidor.',
      }
    }

    // Em ambiente de desenvolvimento local sem credenciais Google Play reais
    console.warn('[GOOGLE_PLAY_DEV_WARN] Credenciais de Service Account ausentes em ambiente local. Compra simulada em DEV.')
    return {
      valid: true,
      purchaseState: 'PURCHASED',
      orderId: `GPA.DEV-${Date.now()}`,
      consumptionState: 0,
      acknowledgementState: 0,
      purchaseTimeMillis: Date.now(),
      quantity: 1,
    }
  }

  try {
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
      packageName
    )}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`

    const response = await authClient.request<any>({
      url,
      method: 'GET',
    })

    if (!response || response.status !== 200 || !response.data) {
      return {
        valid: false,
        purchaseState: 'UNSPECIFIED',
        orderId: null,
        consumptionState: 0,
        acknowledgementState: 0,
        purchaseTimeMillis: 0,
        quantity: 0,
        errorCode: 'GOOGLE_API_HTTP_ERROR',
        errorMessage: `Google Play API respondeu com status ${response?.status}`,
      }
    }

    const data = response.data
    // purchaseState: 0 = Purchased, 1 = Canceled, 2 = Pending
    const pStateRaw = data.purchaseState

    let mappedState: 'PURCHASED' | 'PENDING' | 'CANCELED' | 'UNSPECIFIED' = 'UNSPECIFIED'
    if (pStateRaw === 0) mappedState = 'PURCHASED'
    else if (pStateRaw === 1) mappedState = 'CANCELED'
    else if (pStateRaw === 2) mappedState = 'PENDING'

    const isValid = mappedState === 'PURCHASED'

    return {
      valid: isValid,
      purchaseState: mappedState,
      orderId: data.orderId || null,
      consumptionState: data.consumptionState ?? 0,
      acknowledgementState: data.acknowledgementState ?? 0,
      purchaseTimeMillis: Number(data.purchaseTimeMillis) || Date.now(),
      quantity: Number(data.quantity) || 1,
      errorCode: isValid ? undefined : `PURCHASE_STATE_${mappedState}`,
      errorMessage: isValid ? undefined : `Estado da compra na Google Play: ${mappedState}`,
      rawResponse: data,
    }
  } catch (err: any) {
    const status = err?.response?.status
    const errorBody = err?.response?.data?.error

    logGooglePlayEvent('GOOGLE_PLAY_PURCHASE_FAILED', {
      productId,
      maskedToken: masked,
      error: errorBody?.message || err?.message || 'Falha na comunicação com Google Play API',
      httpStatus: status,
    })

    return {
      valid: false,
      purchaseState: 'UNSPECIFIED',
      orderId: null,
      consumptionState: 0,
      acknowledgementState: 0,
      purchaseTimeMillis: 0,
      quantity: 0,
      errorCode: status === 404 ? 'PURCHASE_NOT_FOUND' : 'GOOGLE_API_EXCEPTION',
      errorMessage: errorBody?.message || err?.message || 'Erro ao validar token na Google Play Developer API.',
    }
  }
}

/**
 * Consome um produto in-app consumível (Acordas) na Google Play Store.
 * NUNCA chamar antes de conceder as Acordas atomicamente no Firestore.
 *
 * Endpoint:
 * POST https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}:consume
 */
export async function consumeGooglePlayPurchase(params: {
  packageName: string
  productId: string
  purchaseToken: string
}): Promise<{ success: boolean; error?: string }> {
  const { packageName, productId, purchaseToken } = params

  // Em modo de testes locais
  if (purchaseToken.startsWith('test-token-') || purchaseToken.startsWith('mock-token-')) {
    return { success: true }
  }

  const authClient = getGooglePlayAuthClient()
  if (!authClient) {
    return { success: true } // Não bloquear em ambiente dev sem credenciais
  }

  try {
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
      packageName
    )}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:consume`

    const response = await authClient.request<any>({
      url,
      method: 'POST',
    })

    const isOk = response.status >= 200 && response.status < 300
    return {
      success: isOk,
      error: isOk ? undefined : `HTTP ${response.status}`,
    }
  } catch (err: any) {
    console.warn('[GOOGLE_PLAY_CONSUME_WARN]', err?.response?.data || err?.message)
    // Mesmo que o endpoint retorne já consumido, a concessão já foi concluída
    return {
      success: false,
      error: err?.message || 'Falha ao consumir na Google Play Store',
    }
  }
}
