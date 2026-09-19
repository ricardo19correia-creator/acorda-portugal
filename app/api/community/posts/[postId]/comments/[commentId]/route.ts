import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const { postId, commentId } = await params
    if (!postId || !commentId) {
      return NextResponse.json({ success: false, error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json({ success: false, error: 'Sessão inválida.' }, { status: 401 })
    }

    const db = getAdminFirestore()
    const commentRef = db
      .collection('community_posts')
      .doc(postId)
      .collection('comments')
      .doc(commentId)

    const snap = await commentRef.get()
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Comentário não encontrado.' }, { status: 404 })
    }

    const commentData = snap.data()
    const isAuthor = commentData.userId === verified.uid

    let isAdmin = false
    try {
      const adminDoc = await db.collection('adminUsers').doc(verified.uid).get()
      if (adminDoc.exists && adminDoc.data()?.role) isAdmin = true
    } catch {}

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Não tens permissão para editar este comentário.' },
        { status: 403 }
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

    const updates = {
      message,
      updatedAt: new Date().toISOString(),
      isEdited: true,
    }

    await commentRef.update(updates)

    return NextResponse.json({
      success: true,
      updatedComment: {
        ...commentData,
        ...updates,
      },
    })
  } catch (error: any) {
    console.error('[API COMMUNITY COMMENT PATCH ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar o comentário.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const { postId, commentId } = await params
    if (!postId || !commentId) {
      return NextResponse.json({ success: false, error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json({ success: false, error: 'Sessão inválida.' }, { status: 401 })
    }

    const db = getAdminFirestore()
    const postRef = db.collection('community_posts').doc(postId)
    const commentRef = postRef.collection('comments').doc(commentId)

    const snap = await commentRef.get()
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Comentário não encontrado.' }, { status: 404 })
    }

    const commentData = snap.data()
    const isAuthor = commentData.userId === verified.uid

    let isAdmin = false
    try {
      const adminDoc = await db.collection('adminUsers').doc(verified.uid).get()
      if (adminDoc.exists && adminDoc.data()?.role) isAdmin = true
    } catch {}

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Não tens permissão para apagar este comentário.' },
        { status: 403 }
      )
    }

    await db.runTransaction(async (t: any) => {
      t.update(commentRef, {
        status: 'removed',
        updatedAt: new Date().toISOString(),
      })
      const pSnap = await t.get(postRef)
      if (pSnap.exists) {
        const currentCount = Number(pSnap.data()?.commentsCount) || 0
        t.update(postRef, {
          commentsCount: Math.max(0, currentCount - 1),
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Comentário removido com sucesso.',
    })
  } catch (error: any) {
    console.error('[API COMMUNITY COMMENT DELETE ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar o comentário.' },
      { status: 500 }
    )
  }
}
