import { NextRequest, NextResponse } from 'next/server'
import { verifyFirebaseIdToken } from '@/lib/firebase-admin'
import { deleteUserCompletely } from '@/lib/account-deletion'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    let idToken = ''
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      idToken = authHeader.split('Bearer ')[1].trim()
    }

    const body = await req.json().catch(() => ({}))
    if (!idToken && body.idToken) {
      idToken = body.idToken
    }

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token de autenticação obrigatório para eliminar a conta.' },
        { status: 401 }
      )
    }

    const verified = await verifyFirebaseIdToken(idToken)
    if (!verified || !verified.uid) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada. Por favor autentica-te novamente.' },
        { status: 401 }
      )
    }

    // Se um targetUid for especificado no body, apenas administradores podem eliminar outra conta
    const targetUid = (body.targetUid && typeof body.targetUid === 'string') ? body.targetUid.trim() : verified.uid
    if (targetUid !== verified.uid) {
      // Verificar se o chamador é admin
      const { getAdminFirestore } = await import('@/lib/firebase-admin')
      const adminDb = getAdminFirestore()
      const adminDoc = await adminDb.collection('adminUsers').doc(verified.uid).get()
      if (!adminDoc.exists) {
        return NextResponse.json(
          { error: 'Permissão negada. Apenas administradores podem eliminar contas de terceiros.' },
          { status: 403 }
        )
      }
    }

    // Executar a eliminação total e atómica no backend
    const summary = await deleteUserCompletely(targetUid, verified.email)

    return NextResponse.json({
      ok: true,
      success: true,
      message: 'Conta eliminada permanentemente de toda a infraestrutura.',
      summary,
    })
  } catch (err: any) {
    console.error('[ACCOUNT_DELETE_API_ERROR]', err)
    return NextResponse.json(
      { error: err?.message || 'Ocorreu um erro ao eliminar a conta no servidor.' },
      { status: 500 }
    )
  }
}
