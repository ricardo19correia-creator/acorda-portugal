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

/**
 * Validação rigorosa no servidor para pedidos administrativos
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
      // Tentar procurar token em header alternativo ou cookie
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

    const adminAuth = getAdminAuth()
    let decodedToken: any = null

    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (err: any) {
      return {
        authorized: false,
        error: `Token de autenticação inválido ou expirado: ${err.message}`,
        status: 401,
      }
    }

    const uid = decodedToken.uid
    const email = (decodedToken.email || '').toLowerCase()

    const db = getAdminFirestore()
    const adminDocRef = db.collection('adminUsers').doc(uid)
    const adminDoc = await adminDocRef.get()

    // Se for o email do proprietário e ainda não estiver registado em adminUsers, inicializa automaticamente
    if (email === OWNER_EMAIL && !adminDoc.exists) {
      const ownerRecord: AdminUserRecord = {
        uid,
        email,
        role: 'owner',
        displayName: decodedToken.name || 'Proprietário Acorda Portugal',
        active: true,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
        permissions: ['ALL'],
      }
      await adminDocRef.set(ownerRecord, { merge: true })
      return { authorized: true, adminUser: ownerRecord, status: 200 }
    }

    if (!adminDoc.exists) {
      // Se não existe na coleção de administradores
      return {
        authorized: false,
        error: 'Acesso recusado (403). Utilizador sem privilégios administrativos.',
        status: 403,
      }
    }

    const adminData = adminDoc.data() as AdminUserRecord

    if (!adminData.active) {
      return {
        authorized: false,
        error: 'Acesso recusado (403). Conta administrativa desativada.',
        status: 403,
      }
    }

    // Atualizar último login
    void adminDocRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
    }).catch(() => {})

    return {
      authorized: true,
      adminUser: {
        ...adminData,
        uid,
      },
      status: 200,
    }
  } catch (error: any) {
    console.error('[ADMIN AUTH ERROR]', error)
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
    console.error('[ADMIN AUDIT LOG ERROR] Falha ao gravar log de auditoria:', err)
    return ''
  }
}
