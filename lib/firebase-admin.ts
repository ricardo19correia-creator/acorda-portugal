import { getApps, getApp, initializeApp, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let adminApp: App | null = null

export function getAdminApp(): App {
  if (adminApp) return adminApp
  if (getApps().length > 0) {
    adminApp = getApp()
    return adminApp
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'desafio-nacional-5fe71'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY

  if (clientEmail && rawKey) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: rawKey.replace(/\\n/g, '\n'),
        }),
        projectId,
      })
      return adminApp
    } catch (e) {
      console.warn('[FIREBASE ADMIN] Falha ao inicializar com cert, recorrendo ao default:', e)
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
