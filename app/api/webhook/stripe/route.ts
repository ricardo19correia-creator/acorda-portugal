import { NextResponse } from 'next/server'
import { getStripeInstance, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { calculateLevelProgress } from '@/lib/progression'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripe = getStripeInstance()
  const sig = request.headers.get('stripe-signature')

  let event: any

  try {
    const rawBody = await request.text()

    if (STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    } else {
      // Parse direto se o webhook secret não estiver ativo no ambiente local
      event = JSON.parse(rawBody)
    }
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK SIGNATURE ERROR]: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook Signature Error: ${err.message}` },
      { status: 400 },
    )
  }

  // Processar eventos de pagamento
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.client_reference_id || session.metadata?.userId
      const productId = session.metadata?.productId
      const transactionId = (session.payment_intent as string) || session.id

      if (!userId || !productId) {
        console.warn('[STRIPE WEBHOOK] Dados incompletos na sessão:', { userId, productId })
        return NextResponse.json({ received: true, error: 'Metadata incompleta' })
      }

      const product = getRealProductById(productId)
      if (!product) {
        console.error('[STRIPE WEBHOOK] Produto inexistente no catálogo:', productId)
        return NextResponse.json({ received: true, error: 'Produto inválido' })
      }

      try {
        const userRef = doc(db, 'users', userId)
        const userTxRef = doc(db, 'users', userId, 'transactions', transactionId)
        const globalTxRef = doc(db, 'transactions', transactionId)

        // Processamento Atómico & Idempotente no Firestore
        await runTransaction(db, async (t) => {
          // 1. Verificar idempotência: se já foi pago, não entregar duas vezes!
          const txSnap = await t.get(userTxRef)
          if (txSnap.exists() && txSnap.data()?.status === 'paid') {
            console.log('[STRIPE WEBHOOK IDEMPOTENT] Transação já processada:', transactionId)
            return
          }

          const userSnap = await t.get(userRef)
          if (!userSnap.exists()) {
            throw new Error(`Utilizador ${userId} não encontrado na base de dados.`)
          }

          const userData = userSnap.data()
          const currentEuros = typeof userData.euros === 'number' ? userData.euros : 0
          const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
          const currentInventory: Record<string, number> = userData.inventory || {}
          const currentBadges: string[] = userData.badges || []

          // 2. Calcular recompensas
          const reward = product.reward
          const newEuros = currentEuros + (reward.euros || 0)
          const newXp = currentXp + (reward.xp || 0)
          const levelProgress = calculateLevelProgress(newXp)
          const newLevel = levelProgress.currentLevel.level

          const updatedInventory = { ...currentInventory }
          if (reward.items) {
            Object.entries(reward.items).forEach(([itemId, qty]) => {
              updatedInventory[itemId] = (updatedInventory[itemId] || 0) + qty
            })
          }

          const updatedBadges = [...currentBadges]
          if (reward.badge && !updatedBadges.includes(reward.badge)) {
            updatedBadges.push(reward.badge)
          }

          // 3. Atualizar perfil do utilizador
          t.update(userRef, {
            euros: newEuros,
            xp: newXp,
            level: newLevel,
            inventory: updatedInventory,
            badges: updatedBadges,
            ...(reward.vipPass ? { isVip: true, vipPassPurchasedAt: serverTimestamp() } : {}),
            ...(reward.isFounder
              ? {
                  is_founder: true,
                  isFounder: true,
                  founderMultiplier: 1.25,
                  founderPurchasedAt: serverTimestamp(),
                }
              : {}),
            ...(reward.authorLicense
              ? {
                  can_submit_questions: true,
                  hasAuthorLicense: true,
                  authorLicensePurchasedAt: serverTimestamp(),
                }
              : {}),
            updatedAt: serverTimestamp(),
          })

          // 4. Registar no histórico de transações do utilizador
          const txData = {
            id: transactionId,
            userId,
            type: 'stripe_purchase',
            status: 'paid',
            productId: product.id,
            productName: product.name,
            amountInCents: product.priceInCents,
            currency: product.currency,
            stripeSessionId: session.id,
            rewardsDelivered: {
              euros: reward.euros,
              xp: reward.xp,
              items: reward.items || {},
              badge: reward.badge || null,
            },
            reason: `Compra de Pacote: ${product.name}`,
            createdAt: serverTimestamp(),
            processedAt: serverTimestamp(),
          }

          t.set(userTxRef, txData)
          t.set(globalTxRef, txData)
        })

        console.log(`[STRIPE WEBHOOK SUCCESS] Entrega de «${product.name}» concluída para utilizador ${userId}!`)
      } catch (procErr) {
        console.error('[STRIPE WEBHOOK PROCESSING ERROR]:', procErr)
        return NextResponse.json({ error: 'Erro ao processar entrega' }, { status: 500 })
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object
      const paymentIntentId = charge.payment_intent as string
      if (paymentIntentId) {
        try {
          const globalTxRef = doc(db, 'transactions', paymentIntentId)
          await runTransaction(db, async (t) => {
            const snap = await t.get(globalTxRef)
            if (snap.exists()) {
              const data = snap.data()
              t.update(globalTxRef, {
                status: 'refunded',
                refundedAt: serverTimestamp(),
              })
              if (data.userId) {
                const userTxRef = doc(db, 'users', data.userId, 'transactions', paymentIntentId)
                t.update(userTxRef, {
                  status: 'refunded',
                  refundedAt: serverTimestamp(),
                })
              }
            }
          })
          console.log('[STRIPE WEBHOOK REFUND] Reembolso registado para:', paymentIntentId)
        } catch (refErr) {
          console.warn('[STRIPE WEBHOOK REFUND ERROR]:', refErr)
        }
      }
      break
    }

    default:
      console.log(`[STRIPE WEBHOOK] Evento não tratado: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
