import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    if (!postId) {
      return NextResponse.json({ success: false, error: 'ID da publicação inválido.' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Precisas de iniciar sessão para gostar desta publicação.' },
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

    const userId = verified.uid
    const db = getAdminFirestore()
    const postRef = db.collection('community_posts').doc(postId)
    const likeRef = postRef.collection('likes').doc(userId)

    let liked = false
    let newLikesCount = 0

    await db.runTransaction(async (transaction: any) => {
      const postSnap = await transaction.get(postRef)
      if (!postSnap.exists) {
        throw new Error('Publicação não encontrada.')
      }

      const postData = postSnap.data()
      if (postData.status !== 'published') {
        throw new Error('Esta publicação não está disponível.')
      }

      const likeSnap = await transaction.get(likeRef)
      const currentCount = Number(postData.likesCount) || 0

      if (likeSnap.exists) {
        // Remover gosto (toggle off)
        transaction.delete(likeRef)
        newLikesCount = Math.max(0, currentCount - 1)
        transaction.update(postRef, { likesCount: newLikesCount })
        liked = false
      } else {
        // Adicionar gosto (toggle on)
        transaction.set(likeRef, {
          userId,
          createdAt: new Date().toISOString(),
        })
        newLikesCount = currentCount + 1
        transaction.update(postRef, { likesCount: newLikesCount })
        liked = true
      }
    })

    return NextResponse.json({
      success: true,
      liked,
      likesCount: newLikesCount,
    })
  } catch (error: any) {
    console.error('[API COMMUNITY LIKE ERROR]', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao processar gosto.' },
      { status: 500 }
    )
  }
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

    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: true, liked: false })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json({ success: true, liked: false })
    }

    const db = getAdminFirestore()
    const likeDoc = await db
      .collection('community_posts')
      .doc(postId)
      .collection('likes')
      .doc(verified.uid)
      .get()

    return NextResponse.json({
      success: true,
      liked: likeDoc.exists,
    })
  } catch (error: any) {
    return NextResponse.json({ success: true, liked: false })
  }
}
