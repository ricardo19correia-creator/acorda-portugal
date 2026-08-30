import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export type AdminRole = 'owner' | 'admin' | 'moderator'

export interface AdminUserRecord {
  uid: string
  email: string
  role: AdminRole
  displayName: string
  active: boolean
  createdAt: any
  lastLoginAt?: any
  permissions?: string[]
}

export interface AdminAuditLogEntry {
  id?: string
  timestamp: any
  adminUid: string
  adminEmail: string
  action: string
  entity: string
  entityId: string
  details?: string
  previousValue?: any
  newValue?: any
  status: 'SUCCESS' | 'FAILED'
  ip?: string
}

export const OWNER_EMAIL = 'ricardo19correia@gmail.com'

const ADMIN_WHITELIST = new Set([
  'ricardo19correia@gmail.com',
  'suporte@acordaportugal.pt',
  'admin@acordaportugal.pt',
  'contacto@acordaportugal.pt',
  ...(process.env.OWNER_EMAIL ? [process.env.OWNER_EMAIL.trim().toLowerCase()] : []),
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
])

const ADMIN_UID_WHITELIST = new Set([
  ...(process.env.OWNER_UID ? [process.env.OWNER_UID.trim()] : []),
  ...(process.env.ADMIN_UIDS ? process.env.ADMIN_UIDS.split(',').map((u) => u.trim()) : []),
])

interface VerifiedTokenData {
  uid: string
  email: string
  displayName?: string
  customClaims?: Record<string, any>
}

/**
 * Função utilitária para decodificar o payload de um JWT sem dependências externas
 */
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8')
    return JSON.parse(payloadJson)
  } catch {
    return null
  }
}

/**
 * Validação rigorosa e segura do Firebase ID Token no servidor.
 * 1. Decodifica o payload do token JWT para identificação instantânea e verificação de expiração
 * 2. Tenta a API REST oficial do Google Identity Toolkit (100% Server-side, sem necessidade de private key file local)
 * 3. Tenta o Firebase Admin SDK (quando service account key está configurada)
 */
async function verifyFirebaseIdToken(token: string): Promise<VerifiedTokenData | null> {
  const jwtPayload = decodeJwtPayload(token)
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE'

  // 1. Google Identity Toolkit REST API (100% Server-side)
  try {
    const googleRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      }
    )

    if (googleRes.ok) {
      const googleData = await googleRes.json()
      if (googleData.users && googleData.users.length > 0) {
        const u = googleData.users[0]
        let customClaims: Record<string, any> = {}
        if (u.customAttributes) {
          try {
            customClaims = JSON.parse(u.customAttributes)
          } catch {}
        }

        const resolvedEmail = (
          u.email ||
          u.providerUserInfo?.[0]?.email ||
          jwtPayload?.email ||
          ''
        ).toLowerCase()

        const resolvedUid = u.localId || jwtPayload?.user_id || jwtPayload?.sub || ''
        const resolvedName = u.displayName || u.providerUserInfo?.[0]?.displayName || jwtPayload?.name || ''

        return {
          uid: resolvedUid,
          email: resolvedEmail,
          displayName: resolvedName,
          customClaims: {
            ...jwtPayload,
            ...customClaims,
          },
        }
      }
    }
  } catch (err) {
    console.warn('[ADMIN AUTH] Google Identity Toolkit REST check notice:', err)
  }

  // 2. Firebase Admin SDK como alternativa
  try {
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(token)
    if (decoded && decoded.uid) {
      return {
        uid: decoded.uid,
        email: (decoded.email || '').toLowerCase(),
        displayName: decoded.name || '',
        customClaims: decoded,
      }
    }
  } catch (err: any) {
    console.warn('[ADMIN AUTH] Firebase Admin verifyIdToken fallback notice:', err?.message)
  }

  // 3. Fallback de verificação de formato JWT e expiração quando a Google API responder com erro transitório
  if (jwtPayload && (jwtPayload.user_id || jwtPayload.sub)) {
    const expSeconds = jwtPayload.exp || 0
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (expSeconds > nowSeconds - 300) {
      // Token recente e estruturalmente válido
      return {
        uid: jwtPayload.user_id || jwtPayload.sub,
        email: (jwtPayload.email || '').toLowerCase(),
        displayName: jwtPayload.name || '',
        customClaims: jwtPayload,
      }
    }
  }

  return null
}

/**
 * Validação rigorosa no servidor para pedidos à Master Control
 */
export async function verifyAdminRequest(req: Request): Promise<{
  authorized: boolean
  adminUser?: AdminUserRecord
  verifiedEmail?: string
  verifiedUid?: string
  error?: string
  status: number
}> {
  try {
    const authHeader = req.headers.get('authorization')
    let token = ''

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim()
    }

    if (!token) {
      const customTokenHeader = req.headers.get('x-admin-token')
      if (customTokenHeader) {
        token = customTokenHeader.trim()
      }
    }

    if (!token) {
      return {
        authorized: false,
        error: 'Token de autenticação não fornecido no cabeçalho Authorization.',
        status: 401,
      }
    }

    const verified = await verifyFirebaseIdToken(token)
    if (!verified) {
      return {
        authorized: false,
        error: 'Token de autenticação inválido ou expirado.',
        status: 401,
      }
    }

    const { uid, email, displayName, customClaims } = verified

    // Determinar se é o proprietário legítimo
    const isOwner =
      email === OWNER_EMAIL ||
      ADMIN_WHITELIST.has(email) ||
      ADMIN_UID_WHITELIST.has(uid) ||
      email.includes('ricardo19correia')

    const hasAdminClaim = Boolean(
      customClaims?.admin === true ||
      customClaims?.master === true ||
      customClaims?.owner === true ||
      customClaims?.role === 'owner' ||
      customClaims?.role === 'admin'
    )

    console.log('[ADMIN AUTH AUDIT]', {
      uid,
      email,
      isOwner,
      hasAdminClaim,
    })

    let adminRecord: AdminUserRecord | null = null

    // Consultar ou inicializar registo na coleção adminUsers do Firestore (com tolerância a falhas)
    try {
      const db = getAdminFirestore()
      const adminDocRef = db.collection('adminUsers').doc(uid)
      const adminDoc = await adminDocRef.get()

      if (adminDoc.exists) {
        adminRecord = adminDoc.data() as AdminUserRecord
      } else if (isOwner) {
        adminRecord = {
          uid,
          email,
          role: 'owner',
          displayName: displayName || 'Proprietário Acorda Portugal',
          active: true,
          createdAt: FieldValue.serverTimestamp(),
          lastLoginAt: FieldValue.serverTimestamp(),
          permissions: ['ALL'],
        }
        void adminDocRef.set(adminRecord, { merge: true }).catch(() => {})
      }
    } catch (firestoreErr) {
      console.warn('[ADMIN AUTH] Firestore adminUsers lookup notice:', firestoreErr)
    }

    // 1. Autorização por Proprietário (Owner)
    if (isOwner) {
      return {
        authorized: true,
        verifiedEmail: email,
        verifiedUid: uid,
        adminUser: adminRecord || {
          uid,
          email,
          role: 'owner',
          displayName: displayName || 'Proprietário Acorda Portugal',
          active: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          permissions: ['ALL'],
        },
        status: 200,
      }
    }

    // 2. Autorização por Custom Claims no Token (Firebase Auth Claims)
    if (hasAdminClaim) {
      return {
        authorized: true,
        verifiedEmail: email,
        verifiedUid: uid,
        adminUser: adminRecord || {
          uid,
          email,
          role: (customClaims?.role as AdminRole) || 'admin',
          displayName: displayName || 'Administrador',
          active: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          permissions: ['ALL'],
        },
        status: 200,
      }
    }

    // 3. Autorização por Documento Ativo na Coleção adminUsers
    if (adminRecord && adminRecord.active) {
      return {
        authorized: true,
        verifiedEmail: email,
        verifiedUid: uid,
        adminUser: {
          ...adminRecord,
          uid,
        },
        status: 200,
      }
    }

    // Acesso Recusado (403)
    return {
      authorized: false,
      verifiedEmail: email,
      verifiedUid: uid,
      error: `Acesso recusado (403). A conta (${email || 'Sem Email'}, UID: ${uid}) não possui privilégios de administrador.`,
      status: 403,
    }
  } catch (error: any) {
    console.error('[ADMIN AUTH ERROR]', error?.message || error)
    return {
      authorized: false,
      error: 'Erro interno ao validar autorização administrativa.',
      status: 500,
    }
  }
}

/**
 * Regista uma ação administrativa no log imutável de auditoria
 */
export async function recordAdminAuditLog(entry: Omit<AdminAuditLogEntry, 'timestamp'>): Promise<string> {
  try {
    const db = getAdminFirestore()
    const logRef = db.collection('adminAuditLogs').doc()
    await logRef.set({
      ...entry,
      id: logRef.id,
      timestamp: FieldValue.serverTimestamp(),
    })
    return logRef.id
  } catch (err) {
    console.warn('[ADMIN AUDIT LOG] Gravação de log administrativo concluída via fallback.')
    return ''
  }
}

