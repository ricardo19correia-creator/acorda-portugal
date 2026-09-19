import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { type CommunityComment } from '@/types/community'
import { DEFAULT_AVATAR } from '@/lib/avatars'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    if (!postId) {
      return NextResponse.json({ success: false, error: 'ID do post inválido.' }, { status: 400 })
    }

    const db = getAdminFirestore()
    const commentsSnap = await db
      .collection('community_posts')
      .doc(postId)
      .collection('comments')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'asc')
      .limit(100)
      .get()

    const comments: CommunityComment[] = commentsSnap.docs.map((d: any) => ({
      commentId: d.id,
      postId,
      ...d.data(),
    }))

    return NextResponse.json({
      success: true,
      comments,
      totalCount: comments.length,
    })
  } catch (error: any) {
    console.error('[API COMMUNITY COMMENTS GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar comentários.' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    if (!postId) {
      return NextResponse.json({ success: false, error: 'ID do post inválido.' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Precisas de iniciar sessão para comentar.' },
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

    const body = await req.json().catch(() => ({}))
    const message = sanitizeText(body.message || '')

    if (message.length < 1) {
      return NextResponse.json(
        { success: false, error: 'O comentário não pode estar vazio.' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'O comentário excede o limite de 1000 caracteres.' },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()
    const postRef = db.collection('community_posts').doc(postId)
    const postSnap = await postRef.get()

    if (!postSnap.exists || postSnap.data()?.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Publicação não disponível para comentários.' },
        { status: 404 }
      )
    }

    // Obter nome e avatar mais recentes
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
    } catch {}

    if (!authorName) {
      authorName = verified.email ? verified.email.split('@')[0] : 'Explorador Português'
    }

    const now = new Date().toISOString()
    const commentsCol = postRef.collection('comments')
    const newCommentRef = commentsCol.doc()

    const newComment: CommunityComment = {
      commentId: newCommentRef.id,
      postId,
      userId: verified.uid,
      authorName,
      authorAvatar,
      message,
      createdAt: now,
      updatedAt: now,
      status: 'published',
      isEdited: false,
    }

    // Transação para gravar comentário e incrementar contador
    await db.runTransaction(async (t: any) => {
      t.set(newCommentRef, newComment)
      const pSnap = await t.get(postRef)
      const currentCommentsCount = Number(pSnap.data()?.commentsCount) || 0
      t.update(postRef, {
        commentsCount: currentCommentsCount + 1,
      })
    })

    return NextResponse.json({
      success: true,
      comment: newComment,
    })
  } catch (error: any) {
    console.error('[API COMMUNITY COMMENTS POST ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Não foi possível publicar o comentário. Tenta novamente.' },
      { status: 500 }
    )
  }
}
