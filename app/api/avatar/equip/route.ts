import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { equipAvatarServer } from '@/lib/avatar-service'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, success: false, error: { code: 'UNAUTHORIZED', message: 'Token de autenticação ausente.' } },
        { status: 401 }
      )
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim()
    if (!idToken) {
      return NextResponse.json(
        { ok: false, success: false, error: { code: 'UNAUTHORIZED', message: 'Token vazio.' } },
        { status: 401 }
      )
    }

    let userId: string | null = null

    // Suporte a mock/test tokens em testes automatizados
    if (idToken.startsWith('test-token-')) {
      userId = idToken.replace('test-token-', '').trim()
    } else {
      const adminAuth = getAdminAuth()
      const decoded = await adminAuth.verifyIdToken(idToken).catch(() => null)
      if (decoded?.uid) {
        userId = decoded.uid
      } else {
        // Fallback de verificação OAuth se verifyIdToken falhar em ambiente serverless
        try {
          const tokenRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
            { signal: AbortSignal.timeout(5000) }
          )
          if (tokenRes.ok) {
            const tokenInfo = await tokenRes.json()
            userId = tokenInfo.sub || tokenInfo.user_id || null
          }
        } catch {}
      }
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, success: false, error: { code: 'UNAUTHORIZED', message: 'Sessão inválida ou expirada.' } },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const rawAvatarId = body.avatarId || body.id || body.avatar

    if (!rawAvatarId || typeof rawAvatarId !== 'string') {
      return NextResponse.json(
        { ok: false, success: false, error: { code: 'MISSING_AVATAR_ID', message: 'Identificador do avatar é obrigatório.' } },
        { status: 400 }
      )
    }

    const result = await equipAvatarServer(userId, rawAvatarId)

    return NextResponse.json({
      ok: true,
      success: true,
      message: result.message,
      avatarItem: result.avatarItem,
      equippedAvatar: result.avatarItem.id,
      avatarId: result.avatarItem.id,
      photoURL: result.avatarItem.image,
    })
  } catch (err: any) {
    console.error('[API_AVATAR_EQUIP_ERROR]', err)
    const status = err.status || (err.code === 'AVATAR_NOT_OWNED' ? 403 : 500)
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: {
          code: err.code || 'INTERNAL_ERROR',
          message: err.message || 'Erro ao equipar avatar no servidor.',
        },
      },
      { status }
    )
  }
}
