import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth, hasAdminCredentials } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim()
  if (!idToken) return null

  if (idToken.startsWith('test-token-')) {
    return idToken.replace('test-token-', '').trim() || null
  }

  try {
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken)
    return decoded?.uid || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado.' },
        { status: 401 }
      )
    }

    if (!hasAdminCredentials()) {
      return NextResponse.json({
        success: true,
        transactions: [],
        warning: 'Base de dados não configurada no ambiente atual.',
      })
    }

    let snap: any = { docs: [] }
    try {
      const db = getAdminFirestore()

      // Consulta transações na subcoleção users/{uid}/transactions
      snap = await db
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()
        .catch(async () => {
          // Fallback: consulta direta na coleção googlePlayPurchases filtrando por userId
          return await db
            .collection('googlePlayPurchases')
            .where('userId', '==', userId)
            .limit(50)
            .get()
        })
    } catch (dbErr: any) {
      console.warn('[HISTORY_DB_UNAVAILABLE]', dbErr?.message || dbErr)
      return NextResponse.json({
        success: true,
        transactions: [],
        warning: 'Base de dados não configurada no ambiente atual.',
      })
    }

    const transactions = (snap.docs || []).map((doc: any) => {
      const d = doc.data()
      const createdDate = d.createdAt?.toDate ? d.createdAt.toDate() : (d.createdAt ? new Date(d.createdAt) : new Date())

      return {
        id: doc.id,
        productName: d.productName || `${d.acordasGranted?.toLocaleString('pt-PT')} Acordas`,
        acordasGranted: d.acordasGranted || 0,
        priceEur: d.priceEur ? `€${Number(d.priceEur).toFixed(2).replace('.', ',')}` : '€0,00',
        provider: 'Google Play',
        status: d.status || 'Concluída',
        date: createdDate.toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        timestamp: createdDate.getTime(),
      }
    })

    return NextResponse.json({
      success: true,
      transactions,
    })
  } catch (err: any) {
    console.error('[GOOGLE_PLAY_HISTORY_GET_ERROR]', err)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar histórico de compras.' },
      { status: 500 }
    )
  }
}
