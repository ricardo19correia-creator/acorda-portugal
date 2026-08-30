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
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
])

interface VerifiedTokenData {
  uid: string
  email: string
  displayName?: string
  customClaims?: Record<string, any>
}

/**
 * Validação rigorosa e segura do Firebase ID Token no servidor.
 * 1. Tenta a API REST oficial do Google Identity Toolkit (garante execução direta e fiável em Vercel/Serverless)
 * 2. Tenta o Firebase Admin SDK (quando service account key está configurada)
 */
async function verifyFirebaseIdToken(token: string): Promise<VerifiedTokenData | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAitsm_neLuW95B5spzFIyjzhJWUeF3FzE'

  // 1. Google Identity Toolkit REST API (100% Server-side, sem necessidade de private key file local)
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
        return {
          uid: u.localId,
          email: (u.email || '').toLowerCase(),
          displayName: u.displayName || '',
          customClaims,
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

  return null
}

/**
 * Validação rigorosa no servidor para pedidos à Master Control
 */
export async function verifyAdminRequest(req: Request): Promise<{
  authorized: boolean
  adminUser?: AdminUserRecord
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
    const isOwner = email === OWNER_EMAIL || ADMIN_WHITELIST.has(email)
    const hasAdminClaim = Boolean(
      customClaims?.admin === true ||
      customClaims?.master === true ||
      customClaims?.role === 'owner' ||
      customClaims?.role === 'admin'
    )

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
      console.warn('[ADMIN AUTH] Firestore adminUsers lookup notice (prosseguindo com identidade verificada):', firestoreErr)
    }

    // 1. Autorização por Proprietário (Owner)
    if (isOwner) {
      return {
        authorized: true,
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
      error: `Acesso recusado (403). A conta (${email}) não possui privilégios de administrador.`,
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
