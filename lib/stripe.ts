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

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function validateStripeConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = []
  if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY')
  if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET')
  return {
    valid: missing.length === 0,
    missing,
  }
}

export function getStripeInstance(): Stripe {
  if (!stripe) {
    throw new Error(
      'STRIPE_SECRET_KEY não configurada no ambiente do servidor. Por favor adiciona a tua chave nas variáveis de ambiente.',
    )
  }
  return stripe
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * Converte valor em Euros (€) para cêntimos inteiros de forma segura evitando floating point errors
 * Exemplo: 5.99 -> 599, 29.99 -> 2999
 */
export function eurToCents(eur: number): number {
  if (typeof eur !== 'number' || isNaN(eur) || !isFinite(eur)) return 0
  return Math.round(eur * 100)
}

/**
 * Converte cêntimos inteiros para Euros (€) com 2 casas decimais
 * Exemplo: 599 -> 5.99, 2999 -> 29.99
 */
export function centsToEur(cents: number): number {
  if (typeof cents !== 'number' || isNaN(cents) || !isFinite(cents)) return 0
  return Math.round(cents) / 100
}

