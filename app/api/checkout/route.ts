import { NextResponse } from 'next/server'
import { getStripeInstance } from '@/lib/stripe'
import { getRealProductById } from '@/lib/real-products'
import { getVipProductById } from '@/src/data/vipCatalog'

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

    // Verificar se o gateway de pagamentos está devidamente configurado no servidor
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          code: 'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED',
          paymentStatus: 'BLOCKED_PENDING_PROVIDER_CONFIG',
          message:
            'PAYMENT_PROVIDER_CONFIGURATION_REQUIRED: O fornecedor de pagamentos (Stripe) requer configuração de STRIPE_SECRET_KEY para criar sessões de pagamento reais.',
        },
        { status: 503 },
      )
    }

    // Validar produto a partir da fonte de verdade no servidor (NUNCA confiar em preços do cliente)
    const vipProduct = getVipProductById(productId)
    const legacyProduct = !vipProduct ? getRealProductById(productId) : null

    if (!vipProduct && !legacyProduct) {
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

    const sessionData = vipProduct
      ? {
          payment_method_types: ['card' as const],
          mode: 'payment' as const,
          client_reference_id: userId,
          customer_email:
            userEmail && typeof userEmail === 'string' && userEmail.includes('@')
              ? userEmail
              : undefined,
          metadata: {
            userId,
            productId: vipProduct.id,
            sku: vipProduct.sku,
            category: vipProduct.category,
            productName: vipProduct.name,
            acquisitionType: 'vip_real_money',
            entitlementType: 'permanent',
            priceCents: String(vipProduct.priceCents),
          },
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: vipProduct.name,
                  description: vipProduct.description,
                  images: [
                    `${cleanOrigin}${vipProduct.assetPath}`
                  ],
                },
                unit_amount: vipProduct.priceCents,
              },
              quantity: 1,
            },
          ],
          success_url: `${cleanOrigin}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}&product_id=${vipProduct.id}`,
          cancel_url: `${cleanOrigin}/loja/cancelado?product_id=${vipProduct.id}`,
        }
      : {
          payment_method_types: ['card' as const],
          mode: 'payment' as const,
          client_reference_id: userId,
          customer_email:
            userEmail && typeof userEmail === 'string' && userEmail.includes('@')
              ? userEmail
              : undefined,
          metadata: {
            userId,
            productId: legacyProduct!.id,
            productName: legacyProduct!.name,
            productType: legacyProduct!.type,
          },
          line_items: [
            {
              price_data: {
                currency: legacyProduct!.currency,
                product_data: {
                  name: legacyProduct!.name,
                  description: legacyProduct!.description,
                },
                unit_amount: legacyProduct!.priceInCents,
              },
              quantity: 1,
            },
          ],
          success_url: `${cleanOrigin}/loja/sucesso?session_id={CHECKOUT_SESSION_ID}&product_id=${legacyProduct!.id}`,
          cancel_url: `${cleanOrigin}/loja/cancelado?product_id=${legacyProduct!.id}`,
        }

    const session = await stripe.checkout.sessions.create(sessionData as any)

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
