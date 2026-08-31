import { NextResponse } from 'next/server'
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

export const dynamic = 'force-dynamic'

function getAdminApp() {
  if (getApps().length > 0) {
    return getApp()
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'desafio-nacional-5fe71'
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY

  if (clientEmail && rawKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawKey.replace(/\\n/g, '\n'),
      }),
      projectId,
    })
  }

  return initializeApp({
    projectId,
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
    }

    let uid: string | null = null

    // 1. Try verifyIdToken
    try {
      const app = getAdminApp()
      const adminAuth = getAuth(app)
      const decoded = await adminAuth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      // 2. Fallback to Google OAuth tokeninfo endpoint
      try {
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        )
        if (tokenRes.ok) {
          const data = await tokenRes.json()
          uid = data.sub || data.user_id || null
        }
      } catch (e) {
        console.error('Failed to verify tokeninfo:', e)
      }
    }

    if (!uid) {
      return NextResponse.json({ error: 'Invalid or expired idToken' }, { status: 401 })
    }

    // 3. Criar Custom Token assinado pelo Admin SDK se a chave de serviço estiver configurada
    try {
      const app = getAdminApp()
      const adminAuth = getAuth(app)
      const customToken = await adminAuth.createCustomToken(uid)
      return NextResponse.json({ customToken, uid, type: 'custom_token' })
    } catch (e) {
      console.warn('[API AUTH TOKEN] Chave privada não disponível para custom token; a devolver id_token:', e)
      return NextResponse.json({ customToken: null, idToken, uid, type: 'id_token' })
    }
  } catch (error: any) {
    console.error('[API AUTH TOKEN ERROR]', error)
    return NextResponse.json({ error: error.message || 'Internal error generating custom token' }, { status: 500 })
  }
}
