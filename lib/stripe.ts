import Stripe from 'stripe'

// Inicialização segura do Stripe para operações exclusivas de backend (Server-side)
// NUNCA expor a chave secreta no frontend.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'Acorda Portugal Official Store',
        version: '1.0.0',
      },
    })
  : null

export function getStripeInstance(): Stripe {
  if (!stripe) {
    throw new Error(
      'STRIPE_SECRET_KEY não configurada no ambiente do servidor. Por favor adiciona a tua chave nas variáveis de ambiente.',
    )
  }
  return stripe
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''
