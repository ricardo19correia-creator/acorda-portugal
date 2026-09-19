import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { COMMUNITY_CATEGORIES, type CommunityCategory } from '@/types/community'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function PATCH(
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
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json({ success: false, error: 'Sessão inválida.' }, { status: 401 })
    }

    const db = getAdminFirestore()
    const postRef = db.collection('community_posts').doc(postId)
    const snap = await postRef.get()

    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Publicação não encontrada.' }, { status: 404 })
    }

    const postData = snap.data()
    const isAuthor = postData.userId === verified.uid

    // Verificar se é admin
    let isAdmin = false
    try {
      const adminDoc = await db.collection('adminUsers').doc(verified.uid).get()
      if (adminDoc.exists && adminDoc.data()?.role) isAdmin = true
    } catch {}

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Não tens permissão para editar esta publicação.' },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      isEdited: true,
    }

    if (body.message !== undefined) {
      const message = sanitizeText(body.message)
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
      updates.message = message
    }

    if (body.category !== undefined && COMMUNITY_CATEGORIES[body.category as CommunityCategory]) {
      updates.category = body.category
    }

    await postRef.update(updates)

    return NextResponse.json({
      success: true,
      updatedPost: {
        ...postData,
        ...updates,
      },
    })
  } catch (error: any) {
    console.error('[API COMMUNITY POST PATCH ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar a publicação.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
      return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json({ success: false, error: 'Sessão inválida.' }, { status: 401 })
    }

    const db = getAdminFirestore()
    const postRef = db.collection('community_posts').doc(postId)
    const snap = await postRef.get()

    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Publicação não encontrada.' }, { status: 404 })
    }

    const postData = snap.data()
    const isAuthor = postData.userId === verified.uid

    let isAdmin = false
    try {
      const adminDoc = await db.collection('adminUsers').doc(verified.uid).get()
      if (adminDoc.exists && adminDoc.data()?.role) isAdmin = true
    } catch {}

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Não tens permissão para apagar esta publicação.' },
        { status: 403 }
      )
    }

    // Remover fisicamente ou marcar como 'removed'
    await postRef.update({
      status: 'removed',
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Publicação apagada com sucesso.',
    })
  } catch (error: any) {
    console.error('[API COMMUNITY POST DELETE ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar a publicação.' },
      { status: 500 }
    )
  }
}
