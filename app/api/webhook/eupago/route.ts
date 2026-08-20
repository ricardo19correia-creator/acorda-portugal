import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getRealProductById } from '@/lib/real-products'

export const dynamic = 'force-dynamic'

/**
 * Webhook Oficial euPago 2.0 (MB WAY / Multibanco / Payshop)
 * Endpoint: https://acordaportugal.pt/api/webhook/eupago
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    console.log('[EUPAGO WEBHOOK RECEBIDO]:', body)

    // Campos standard da euPago Webhook 2.0
    // identificador: userId:productId ou custom metadata
    const {
      identificador,
      referencia,
      valor,
      estado,
      transacao,
      mp, // MBW (MB WAY) ou MB (Multibanco)
    } = body

    // Se houver identificador no formato userId:productId
    if (identificador && typeof identificador === 'string') {
      const parts = identificador.split(':')
      const userId = parts[0]
      const productId = parts[1]

      if (userId && productId && (estado === 'pago' || estado === 'success' || estado === 'ok' || !estado)) {
        const product = getRealProductById(productId)

        if (product) {
          const userRef = doc(db, 'users', userId)
          await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef)
            if (!userDoc.exists()) return

            const data = userDoc.data()
            const currentEuros = typeof data.euros === 'number' ? data.euros : 0
            const currentInventory = data.inventory || {}

            const updatedInventory = { ...currentInventory }
            if (product.reward?.items) {
              for (const [itemId, qty] of Object.entries(product.reward.items)) {
                updatedInventory[itemId] = (updatedInventory[itemId] || 0) + (qty as number)
              }
            }

            const updateData: Record<string, any> = {
              euros: currentEuros + (product.reward?.euros || 0),
              inventory: updatedInventory,
              updatedAt: serverTimestamp(),
            }

            if (product.reward?.isFounder) {
              updateData.is_founder = true
              updateData.founderMultiplier = 1.25
            }

            transaction.update(userRef, updateData)
          })
        }
      }
    }

    // Resposta de sucesso esperada pela euPago
    return NextResponse.json({
      sucesso: true,
      mensagem: 'Notificação euPago processada com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[EUPAGO WEBHOOK ERROR]:', err)
    return NextResponse.json({ sucesso: false, erro: err?.message }, { status: 200 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'online',
    endpoint: 'https://acordaportugal.pt/api/webhook/eupago',
    service: 'euPago Webhook 2.0 Acorda Portugal',
  })
}
