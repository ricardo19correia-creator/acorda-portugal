import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { maskToken } from '@/lib/google-play-server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResult = await verifyAdminRequest(req)
  if (!authResult.authorized) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const db = getAdminFirestore()

    // Consulta compras na coleção googlePlayPurchases
    const purchasesSnap = await db
      .collection('googlePlayPurchases')
      .orderBy('processedAt', 'desc')
      .limit(100)
      .get()
      .catch(() => ({ docs: [] }))

    let totalCompras = 0
    let acordasVendidas = 0
    let receitaReportada = 0
    let comprasProcessadas = 0
    let comprasPendentes = 0
    let comprasComErro = 0
    let comprasDuplicadasBloqueadas = 0

    const productCounts: Record<string, number> = {}

    const recentPurchases = purchasesSnap.docs.map((doc: any) => {
      const d = doc.data()
      totalCompras++

      if (d.processed === true) {
        comprasProcessadas++
        const granted = Number(d.acordasGranted || 0)
        acordasVendidas += isNaN(granted) ? 0 : granted

        const price = Number(d.priceEur || 0)
        receitaReportada += isNaN(price) ? 0 : price

        const pId = d.productId || 'desconhecido'
        productCounts[pId] = (productCounts[pId] || 0) + 1
      } else if (d.purchaseState === 'PENDING') {
        comprasPendentes++
      } else {
        comprasComErro++
      }

      const processedDate = d.processedAt?.toDate ? d.processedAt.toDate() : (d.processedAt ? new Date(d.processedAt) : new Date())

      return {
        id: doc.id,
        productId: d.productId || 'n/a',
        productName: d.productName || d.productId || 'Acordas',
        userId: d.userId ? `${d.userId.slice(0, 6)}...` : 'n/a',
        orderId: d.orderId || 'n/a',
        acordasGranted: d.acordasGranted || 0,
        priceEur: d.priceEur || 0,
        maskedToken: maskToken(d.purchaseToken),
        processed: d.processed === true,
        date: processedDate.toLocaleString('pt-PT'),
        timestamp: processedDate.getTime(),
      }
    })

    // Determina o produto mais vendido
    let produtoMaisVendido = 'Nenhum'
    let maxCount = 0
    for (const [prod, count] of Object.entries(productCounts)) {
      if (count > maxCount) {
        maxCount = count
        produtoMaisVendido = `${prod} (${count}x)`
      }
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalCompras,
        acordasVendidas,
        receitaReportada: Number(receitaReportada.toFixed(2)),
        comprasProcessadas,
        comprasPendentes,
        comprasComErro,
        comprasDuplicadasBloqueadas,
        produtoMaisVendido,
        recentPurchases,
      },
    })
  } catch (err: any) {
    console.error('[ADMIN_MONETIZATION_ERROR]', err)
    return NextResponse.json({ error: 'Erro ao obter métricas de monetização.' }, { status: 500 })
  }
}
