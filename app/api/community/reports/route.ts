import { NextResponse } from 'next/server'
import { verifyFirebaseIdToken, getAdminFirestore } from '@/lib/firebase-admin'
import { REPORT_REASONS, type ReportReason } from '@/types/community'

export const dynamic = 'force-dynamic'

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  return text.replace(/<[^>]*>?/gm, '').trim()
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Precisas de iniciar sessão para efetuar uma denúncia.' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const verified = await verifyFirebaseIdToken(token)
    if (!verified || !verified.uid) {
      return NextResponse.json(
        { success: false, error: 'Sessão inválida ou expirada.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { targetType, targetId, postId, reason, targetContent, targetAuthorName } = body

    if (!targetType || (targetType !== 'post' && targetType !== 'comment') || !targetId) {
      return NextResponse.json(
        { success: false, error: 'Dados da denúncia inválidos.' },
        { status: 400 }
      )
    }

    if (!REPORT_REASONS.includes(reason as ReportReason)) {
      return NextResponse.json(
        { success: false, error: 'Por favor, seleciona um motivo válido de denúncia.' },
        { status: 400 }
      )
    }

    const db = getAdminFirestore()

    // Prevenir denúncias repetidas pelo mesmo utilizador sobre o mesmo alvo
    const existingSnap = await db
      .collection('community_reports')
      .where('reporterId', '==', verified.uid)
      .where('targetId', '==', targetId)
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return NextResponse.json({
        success: true,
        message: 'Já denunciaste este conteúdo anteriormente. A equipa de moderação está a avaliar.',
      })
    }

    // Obter nome do denunciante
    let reporterName = 'Utilizador'
    try {
      const uDoc = await db.collection('users').doc(verified.uid).get()
      if (uDoc.exists) {
        reporterName = uDoc.data()?.displayName || uDoc.data()?.username || reporterName
      }
    } catch {}

    const reportRef = db.collection('community_reports').doc()
    const now = new Date().toISOString()

    const reportData = {
      reportId: reportRef.id,
      reporterId: verified.uid,
      reporterName,
      targetType,
      targetId,
      postId: postId || targetId,
      targetContent: sanitizeText(targetContent || ''),
      targetAuthorName: sanitizeText(targetAuthorName || ''),
      reason,
      createdAt: now,
      status: 'pending',
    }

    await reportRef.set(reportData)

    return NextResponse.json({
      success: true,
      message: 'Denúncia enviada com sucesso. Obrigado por manteres a comunidade segura.',
    })
  } catch (error: any) {
    console.error('[API COMMUNITY REPORT ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao registar a denúncia.' },
      { status: 500 }
    )
  }
}
