import { getApps, getApp, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null

export interface FirebaseAdminValidationResult {
  valid: boolean
  missing: string[]
}

/**
 * Valida a disponibilidade das variáveis de ambiente necessárias para o Firebase Admin SDK
 * NUNCA imprime nem expõe os valores das variáveis sensíveis.
 */
export function validateFirebaseAdminConfig(): FirebaseAdminValidationResult {
  const missing: string[] = []
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId) missing.push('FIREBASE_PROJECT_ID')
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL')
  if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY')

  return {
    valid: missing.length === 0,
    missing,
  }
}

export function getAdminCredentials() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'desafio-nacional-5fe71'

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL ||
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL

  const rawKey =
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY

  return { projectId, clientEmail, rawKey }
}

export function formatPrivateKey(rawKey: string): string {
  if (!rawKey) return ''
  let key = rawKey.trim()

  // Se a chave estiver envolvida por aspas múltiplas
  while (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim()
  }

  // Se for um JSON de Service Account inteiro
  if (key.startsWith('{') && key.endsWith('}')) {
    try {
      const parsed = JSON.parse(key)
      if (parsed.private_key) {
        key = parsed.private_key
      } else if (parsed.privateKey) {
        key = parsed.privateKey
      }
    } catch {
      // continuar com key normal
    }
  }

  // Se a chave for Base64
  if (!key.includes('-----BEGIN') && (key.startsWith('LS0t') || key.length > 500)) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8')
      if (decoded.includes('BEGIN PRIVATE KEY') || decoded.includes('BEGIN RSA PRIVATE KEY')) {
        key = decoded
      }
    } catch {
      // manter original
    }
  }

  // Substituir sequências de escape \r e \n
  key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n')

  return key.trim()
}

export function hasAdminCredentials(): boolean {
  const { clientEmail, rawKey } = getAdminCredentials()
  return Boolean(clientEmail && rawKey)
}

/**
 * Inicialização Singleton do Firebase Admin SDK
 */
export function getAdminApp(): App {
  if (adminApp) return adminApp
  if (getApps().length > 0) {
    adminApp = getApp()
    return adminApp
  }

  const { projectId, clientEmail, rawKey } = getAdminCredentials()

  if (clientEmail && rawKey) {
    try {
      const privateKey = formatPrivateKey(rawKey)
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      })
      return adminApp
    } catch (e: any) {
      console.warn('[FIREBASE ADMIN] Erro ao inicializar com credenciais de Service Account:', e?.message || e)
    }
  }

  adminApp = initializeApp({
    projectId,
  })
  return adminApp
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp())
}

/**
 * Diagnóstico seguro de conectividade ao Firestore (sem expor credenciais)
 */
export async function testFirestoreAdminConnection(uid?: string): Promise<{
  success: boolean
  projectId: string
  hasCredentials: boolean
  latencyMs: number
  userData?: Record<string, any> | null
  error?: string
}> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'desafio-nacional-5fe71'
  const hasCreds = hasAdminCredentials()
  const start = Date.now()

  try {
    const db = getAdminFirestore()
    if (uid) {
      const docSnap = await db.collection('users').doc(uid).get()
      const latencyMs = Date.now() - start
      return {
        success: true,
        projectId,
        hasCredentials: hasCreds,
        latencyMs,
        userData: docSnap.exists ? docSnap.data() || {} : null,
      }
    } else {
      // Teste de consulta leve
      await db.collection('users').limit(1).get()
      const latencyMs = Date.now() - start
      return {
        success: true,
        projectId,
        hasCredentials: hasCreds,
        latencyMs,
      }
    }
  } catch (err: any) {
    const latencyMs = Date.now() - start
    return {
      success: false,
      projectId,
      hasCredentials: hasCreds,
      latencyMs,
      error: err?.message || String(err),
    }
  }
}

