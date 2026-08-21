import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getRealProductById } from '@/lib/real-products'

export const dynamic = 'force-dynamic'

interface EuPagoWebhookPayload {
  identificador?: string
  referencia?: string
  valor?: number | string
  estado?: string
  transacao?: string | number
  mp?: string
  chave?: string
}

/**
 * Webhook Oficial euPago 2.0 (MB WAY / Multibanco / Payshop)
 * Processamento transacional e idempotente com desbloqueio instantâneo de benefícios.
 */
export async function processEuPagoWebhook(body: EuPagoWebhookPayload) {
  const {
    identificador,
    referencia,
    valor,
    estado,
    transacao,
    mp,
  } = body

  console.log('[EUPAGO WEBHOOK RECEBIDO]:', {
    identificador,
    referencia,
    valor,
    estado,
    transacao,
    mp,
  })

  // Se houver identificador no formato userId:productId
  if (identificador && typeof identificador === 'string') {
    const parts = identificador.split(':')
    const userId = parts[0]
    const productId = parts[1]

    const isPaid =
      estado === 'pago' ||
      estado === 'paga' ||
      estado === 'success' ||
      estado === 'ok' ||
      !estado // Quando a euPago notifica no endpoint padrão após confirmação

    if (userId && userId !== 'guest' && productId && isPaid) {
      const product = getRealProductById(productId)

      if (product) {
        const userRef = doc(db, 'users', userId)
        const txDocId = transacao ? `eupago_${transacao}` : `eupago_${referencia || Date.now()}`
        const transactionRef = doc(db, 'transactions', txDocId)

        await runTransaction(db, async (transaction) => {
          // 1. Verificação de Idempotência
          const existingTx = await transaction.get(transactionRef)
          if (existingTx.exists()) {
            console.log(`[EUPAGO WEBHOOK]: Transação ${txDocId} já processada previamente. Ignorando duplicação.`)
            return
          }

          // 2. Leitura do perfil do utilizador
          const userDoc = await transaction.get(userRef)
          if (!userDoc.exists()) {
            console.warn(`[EUPAGO WEBHOOK]: Utilizador ${userId} não encontrado no Firestore.`)
            return
          }

          const data = userDoc.data()
          const currentEuros = typeof data.euros === 'number' ? data.euros : 0
          const currentXp = typeof data.xp === 'number' ? data.xp : 0
          const currentInventory = data.inventory || {}
          const currentBadges = Array.isArray(data.badges) ? data.badges : []

          const updatedInventory = { ...currentInventory }
          if (product.reward?.items) {
            for (const [itemId, qty] of Object.entries(product.reward.items)) {
              updatedInventory[itemId] = (updatedInventory[itemId] || 0) + (qty as number)
            }
          }

          const updatedBadges = [...currentBadges]
          if (product.reward?.badge && !updatedBadges.includes(product.reward.badge)) {
            updatedBadges.push(product.reward.badge)
          }

          const updateData: Record<string, any> = {
            euros: currentEuros + (product.reward?.euros || 0),
            xp: currentXp + (product.reward?.xp || 0),
            inventory: updatedInventory,
            badges: updatedBadges,
            updatedAt: serverTimestamp(),
          }

          if (product.reward?.isFounder) {
            updateData.is_founder = true
            updateData.founderMultiplier = 1.25
          }

          if (product.reward?.authorLicense) {
            updateData.hasAuthorLicense = true
          }

          if (product.reward?.vipPass) {
            updateData.hasVipPass = true
          }

          // Registar transação processada
          transaction.set(transactionRef, {
            userId,
            productId,
            amount: Number(valor) || (product.priceInCents / 100),
            method: mp || 'MBWAY',
            transacaoId: transacao || null,
            referencia: referencia || null,
            processedAt: serverTimestamp(),
            productName: product.name,
          })

          // Atualizar perfil do jogador
          transaction.update(userRef, updateData)
        })
      }
    }
  }

  return {
    sucesso: true,
    mensagem: 'Notificação euPago processada com sucesso',
    timestamp: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EuPagoWebhookPayload = await request.json().catch(() => ({}))
    const result = await processEuPagoWebhook(body)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro no webhook'
    console.error('[EUPAGO WEBHOOK ERROR]:', errorMsg)
    return NextResponse.json({ sucesso: false, erro: errorMsg }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'https://acordaportugal.pt/api/webhook/eupago',
    service: 'euPago Webhook 2.0 Acorda Portugal',
  })
}
