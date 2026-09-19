import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { COMMUNITY_CATEGORIES, type CommunityCategory, type CommunityPost } from '@/types/community'
import { DEFAULT_AVATAR } from '@/lib/avatars'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

// Rate limit simples em memória por UID/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(identifier: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= limit) {
    return true
  }

  entry.count += 1
  return false
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'all'
    const limitCount = Math.min(50, Math.max(5, Number(searchParams.get('limit') || 30)))

    const db = getAdminFirestore()
    let queryRef = db.collection('community_posts')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)

    const snap = await queryRef.get()
    let posts: CommunityPost[] = snap.docs.map((d: any) => {
      const data = d.data()
      return {
        postId: d.id,
        ...data,
      }
    })

    if (category !== 'all') {
      posts = posts.filter((p) => p.category === category)
    }

    return NextResponse.json({
      success: true,
      posts,
      totalCount: posts.length,
    })
  } catch (error: any) {
    console.error('[API COMMUNITY POSTS GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar publicações da comunidade.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Precisas de iniciar sessão para publicar.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json(
        { success: false, error: 'Sessão inválida ou expirada. Inicia sessão novamente.' },
        { status: 401 }
      )
    }

    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      verified.uid

    if (isRateLimited(`post_${verified.uid}_${clientIp}`, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Por favor, aguarda um momento antes de publicar novamente.' },
        { status: 429 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const rawMessage = body.message || ''
    const rawCategory = body.category || 'sugestao'

    const message = sanitizeText(rawMessage)
    if (message.length < 2) {
      return NextResponse.json(
        { success: false, error: 'A mensagem tem de conter pelo menos 2 caracteres.' },
        { status: 400 }
      )
    }

    if (message.length > 2500) {
      return NextResponse.json(
        { success: false, error: 'A mensagem excede o tamanho máximo de 2500 caracteres.' },
        { status: 400 }
      )
    }

    const category: CommunityCategory = COMMUNITY_CATEGORIES[rawCategory as CommunityCategory]
      ? (rawCategory as CommunityCategory)
      : 'sugestao'

    const db = getAdminFirestore()

    // Obter dados de perfil mais recentes do utilizador
    let authorName = sanitizeText(body.authorName || '')
    let authorAvatar = body.authorAvatar || DEFAULT_AVATAR

    try {
      const userDoc = await db.collection('users').doc(verified.uid).get()
      if (userDoc.exists) {
        const udata = userDoc.data()
        if (udata) {
          authorName = udata.displayName || udata.username || udata.name || authorName
          authorAvatar = udata.photoURL || udata.avatar || udata.equipped?.avatar || authorAvatar
        }
      }
    } catch {
      // Usar os fallbacks do body se falhar a leitura
    }

    if (!authorName) {
      authorName = verified.email ? verified.email.split('@')[0] : 'Explorador Português'
    }

    const now = new Date().toISOString()
    const docRef = db.collection('community_posts').doc()

    const newPost: CommunityPost = {
      postId: docRef.id,
      userId: verified.uid,
      authorName,
      authorAvatar,
      message,
      category,
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      commentsCount: 0,
      status: 'published',
      isEdited: false,
    }

    await docRef.set(newPost)

    return NextResponse.json({
      success: true,
      post: newPost,
    })
  } catch (error: any) {
    console.error('[API COMMUNITY POSTS POST ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Não foi possível publicar. Tenta novamente.' },
      { status: 500 }
    )
  }
}
