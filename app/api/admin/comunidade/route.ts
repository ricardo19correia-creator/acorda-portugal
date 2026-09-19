import { NextResponse } from 'next/server'
import { verifyAdminRequest, recordAdminAuditLog } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const tab = searchParams.get('tab') || 'posts'
    const statusFilter = searchParams.get('status') || 'all'
    const categoryFilter = searchParams.get('category') || 'all'
    const searchQuery = (searchParams.get('search') || '').toLowerCase().trim()
    const limitCount = Math.min(100, Math.max(10, Number(searchParams.get('limit') || 50)))

    const db = getAdminFirestore()

    if (tab === 'reports') {
      const reportsSnap = await db
        .collection('community_reports')
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get()

      let reports = reportsSnap.docs.map((d: any) => ({
        reportId: d.id,
        ...d.data(),
      }))

      if (statusFilter !== 'all') {
        reports = reports.filter((r: any) => r.status === statusFilter)
      }

      if (searchQuery) {
        reports = reports.filter(
          (r: any) =>
            r.targetContent?.toLowerCase().includes(searchQuery) ||
            r.reason?.toLowerCase().includes(searchQuery) ||
            r.reporterName?.toLowerCase().includes(searchQuery) ||
            r.targetAuthorName?.toLowerCase().includes(searchQuery)
        )
      }

      return NextResponse.json({
        success: true,
        reports,
        totalCount: reports.length,
      })
    }

    if (tab === 'comments') {
      // Obter comentários usando collectionGroup ou a partir dos posts mais recentes
      let comments: any[] = []
      try {
        const commentsSnap = await db
          .collectionGroup('comments')
          .orderBy('createdAt', 'desc')
          .limit(limitCount)
          .get()

        comments = commentsSnap.docs.map((d: any) => {
          const parentPostId = d.ref.parent.parent ? d.ref.parent.parent.id : ''
          return {
            commentId: d.id,
            postId: parentPostId,
            ...d.data(),
          }
        })
      } catch (cgError) {
        // Fallback se collectionGroup index não estiver preparado: obter dos últimos 15 posts
        const postsSnap = await db
          .collection('community_posts')
          .orderBy('createdAt', 'desc')
          .limit(15)
          .get()

        for (const pDoc of postsSnap.docs) {
          const cSnap = await pDoc.ref.collection('comments').limit(20).get()
          for (const cDoc of cSnap.docs) {
            comments.push({
              commentId: cDoc.id,
              postId: pDoc.id,
              ...cDoc.data(),
            })
          }
        }
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      if (statusFilter !== 'all') {
        comments = comments.filter((c: any) => c.status === statusFilter)
      }

      if (searchQuery) {
        comments = comments.filter(
          (c: any) =>
            c.message?.toLowerCase().includes(searchQuery) ||
            c.authorName?.toLowerCase().includes(searchQuery)
        )
      }

      return NextResponse.json({
        success: true,
        comments,
        totalCount: comments.length,
      })
    }

    // Padrão: 'posts'
    const postsSnap = await db
      .collection('community_posts')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()

    let posts = postsSnap.docs.map((d: any) => ({
      postId: d.id,
      ...d.data(),
    }))

    if (statusFilter !== 'all') {
      posts = posts.filter((p: any) => p.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      posts = posts.filter((p: any) => p.category === categoryFilter)
    }

    if (searchQuery) {
      posts = posts.filter(
        (p: any) =>
          p.message?.toLowerCase().includes(searchQuery) ||
          p.authorName?.toLowerCase().includes(searchQuery) ||
          p.category?.toLowerCase().includes(searchQuery)
      )
    }

    return NextResponse.json({
      success: true,
      posts,
      totalCount: posts.length,
    })
  } catch (error: any) {
    console.error('[API ADMIN COMUNIDADE GET ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar dados de moderação da comunidade.' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action, postId, commentId, reportId, status, notes } = body
    const db = getAdminFirestore()
    const now = new Date().toISOString()

    if (action === 'update_post_status' && postId && status) {
      const postRef = db.collection('community_posts').doc(postId)
      const postSnap = await postRef.get()

      if (!postSnap.exists) {
        return NextResponse.json({ success: false, error: 'Publicação não encontrada.' }, { status: 404 })
      }

      const prevStatus = postSnap.data()?.status
      await postRef.update({
        status,
        updatedAt: now,
        moderatedBy: authResult.verifiedEmail || authResult.verifiedUid,
        moderatedAt: now,
        moderatorNotes: notes || null,
      })

      await recordAdminAuditLog({
        adminUid: authResult.verifiedUid || 'unknown',
        adminEmail: authResult.verifiedEmail || 'unknown',
        action: 'UPDATE_COMMUNITY_POST_STATUS',
        entity: 'community_post',
        entityId: postId,
        previousValue: { status: prevStatus },
        newValue: { status, notes },
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Estado da publicação atualizado para ${status}.`,
      })
    }

    if (action === 'update_comment_status' && postId && commentId && status) {
      const commentRef = db
        .collection('community_posts')
        .doc(postId)
        .collection('comments')
        .doc(commentId)

      const commentSnap = await commentRef.get()
      if (!commentSnap.exists) {
        return NextResponse.json({ success: false, error: 'Comentário não encontrado.' }, { status: 404 })
      }

      const prevStatus = commentSnap.data()?.status
      await commentRef.update({
        status,
        updatedAt: now,
        moderatedBy: authResult.verifiedEmail || authResult.verifiedUid,
        moderatedAt: now,
      })

      await recordAdminAuditLog({
        adminUid: authResult.verifiedUid || 'unknown',
        adminEmail: authResult.verifiedEmail || 'unknown',
        action: 'UPDATE_COMMUNITY_COMMENT_STATUS',
        entity: 'community_comment',
        entityId: `${postId}/${commentId}`,
        previousValue: { status: prevStatus },
        newValue: { status },
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Estado do comentário atualizado para ${status}.`,
      })
    }

    if (action === 'resolve_report' && reportId && status) {
      const reportRef = db.collection('community_reports').doc(reportId)
      const reportSnap = await reportRef.get()

      if (!reportSnap.exists) {
        return NextResponse.json({ success: false, error: 'Denúncia não encontrada.' }, { status: 404 })
      }

      await reportRef.update({
        status,
        reviewedAt: now,
        reviewedBy: authResult.verifiedEmail || authResult.verifiedUid,
        resolutionNotes: notes || null,
      })

      await recordAdminAuditLog({
        adminUid: authResult.verifiedUid || 'unknown',
        adminEmail: authResult.verifiedEmail || 'unknown',
        action: 'RESOLVE_COMMUNITY_REPORT',
        entity: 'community_report',
        entityId: reportId,
        newValue: { status, notes },
        status: 'SUCCESS',
      })

      return NextResponse.json({
        success: true,
        message: `Denúncia atualizada para ${status}.`,
      })
    }

    return NextResponse.json({ success: false, error: 'Ação de moderação desconhecida.' }, { status: 400 })
  } catch (error: any) {
    console.error('[API ADMIN COMUNIDADE PATCH ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao executar ação de moderação.' },
      { status: 500 }
    )
  }
}
