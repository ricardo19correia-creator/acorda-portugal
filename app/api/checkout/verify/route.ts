import { NextResponse } from 'next/server'
import { getStripeInstance } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'
import { db } from '@/lib/firebase'
import { doc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore'
import { calculateLevelProgress } from '@/lib/progression'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'ID da sessão ausente.' },
        { status: 400 },
      )
    }

    const stripe = getStripeInstance()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sessão Stripe não encontrada.' },
        { status: 404 },
      )
    }

    const isPaid = session.payment_status === 'paid'
    const userId = session.client_reference_id || session.metadata?.userId
    const productId = session.metadata?.productId
    const transactionId = (session.payment_intent as string) || session.id

    if (!isPaid) {
      return NextResponse.json({
        success: true,
        paid: false,
        status: session.payment_status,
        message: 'O pagamento ainda não foi concluído.',
      })
    }

    if (!userId || !productId) {
      return NextResponse.json({
        success: true,
        paid: true,
        message: 'Pagamento confirmado mas dados do produto incompletos.',
      })
    }

    const product = getRealProductById(productId)
    if (!product) {
      return NextResponse.json({
        success: true,
        paid: true,
        message: 'Produto não encontrado no catálogo.',
      })
    }

    // Garantir entrega idempotente caso o webhook ainda não tenha chegado
    const userRef = doc(db, 'users', userId)
    const userTxRef = doc(db, 'users', userId, 'transactions', transactionId)
    const globalTxRef = doc(db, 'transactions', transactionId)

    await runTransaction(db, async (t) => {
      const txSnap = await t.get(userTxRef)
      if (txSnap.exists() && txSnap.data()?.status === 'paid') {
        // Já entregue
        return
      }

      const userSnap = await t.get(userRef)
      if (!userSnap.exists()) return

      const userData = userSnap.data()
      const currentEuros = typeof userData.euros === 'number' ? userData.euros : 0
      const currentXp = typeof userData.xp === 'number' ? userData.xp : 0
      const currentInventory: Record<string, number> = userData.inventory || {}
      const currentBadges: string[] = userData.badges || []

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

      t.update(userRef, {
        euros: newEuros,
        xp: newXp,
        level: newLevel,
        inventory: updatedInventory,
        badges: updatedBadges,
        ...(reward.vipPass ? { isVip: true, vipPassPurchasedAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      })

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

    return NextResponse.json({
      success: true,
      paid: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        priceFormatted: `€${(product.priceInCents / 100).toFixed(2).replace('.', ',')}`,
        reward: product.reward,
      },
      transactionId,
      customerEmail: session.customer_details?.email || session.customer_email,
    })
  } catch (error: any) {
    console.error('[STRIPE VERIFY ERROR]:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Erro ao verificar pagamento.' },
      { status: 500 },
    )
  }
}
