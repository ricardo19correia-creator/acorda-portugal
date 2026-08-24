import { NextResponse } from 'next/server'
import { getStripeInstance } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userId, userEmail } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Identificador do produto é obrigatório.' },
        { status: 400 },
      )
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Identificador de utilizador é obrigatório.' },
        { status: 400 },
      )
    }

    // Compras com dinheiro real exigem conta registada permanente
    if (userId.startsWith('guest_')) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          message: 'Para comprar e guardar este conteúdo permanentemente, cria uma conta ou entra com Google/email.',
        },
        { status: 401 },
      )
    }

    // Validar produto a partir da fonte de verdade no servidor (NUNCA confiar em preços do cliente)
    const product = getRealProductById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Produto não encontrado ou inativo no catálogo oficial.' },
        { status: 404 },
      )
    }

    const stripe = getStripeInstance()

    const origin =
      request.headers.get('origin') ||
      request.headers.get('referer') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://acordaportugal.pt'

    const cleanOrigin = origin.replace(/\/$/, '')

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      client_reference_id: userId,
      customer_email: userEmail && typeof userEmail === 'string' && userEmail.includes('@') ? userEmail : undefined,
      metadata: {
        userId,
        productId: product.id,
        productName: product.name,
        productType: product.type,
      },
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${cleanOrigin}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}&product_id=${product.id}`,
      cancel_url: `${cleanOrigin}/loja/cancelado?product_id=${product.id}`,
    })

    if (!session.url) {
      throw new Error('Falha ao gerar URL de pagamento da sessão Stripe.')
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('[STRIPE CHECKOUT ERROR]:', error)
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Ocorreu um erro ao inicializar o checkout de pagamento.',
      },
      { status: 500 },
    )
  }
}
