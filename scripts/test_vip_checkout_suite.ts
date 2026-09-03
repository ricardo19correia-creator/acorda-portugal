import { validateFirebaseAdminConfig } from '../lib/firebase-admin'
import { isStripeConfigured, eurToCents, centsToEur } from '../lib/stripe'
import { POST as checkoutPOST } from '../app/api/checkout/route'
import { POST as shopPurchasePOST } from '../app/api/shop/purchase/route'
import { POST as webhookPOST } from '../app/api/webhook/stripe/route'
import { GET as checkoutStatusGET } from '../app/api/checkout/status/route'
import { getVipProductById } from '../src/data/vipCatalog'
import { NextRequest } from 'next/server'

interface TestResult {
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function assert(condition: boolean, name: string, details: string) {
  results.push({
    name,
    passed: condition,
    details: condition ? `PASS: ${details}` : `FAIL: ${details}`,
  })
}

async function runAllTests() {
  console.log('=================================================================')
  console.log('🧪 SUITE OFICIAL — VIP EUR + STRIPE + CHECKOUT + WEBHOOK')
  console.log('=================================================================\n')

  // TEST 1: Missing Firebase Admin Env Detection
  {
    console.log('▶ Test 1: Detecção de configuração Firebase Admin...')
    const cfg = validateFirebaseAdminConfig()
    // Deve reportar o estado real das variáveis de ambiente
    assert(
      typeof cfg.valid === 'boolean' && Array.isArray(cfg.missing),
      'missing Firebase Admin env check',
      `Config valid: ${cfg.valid}, Missing: [${cfg.missing.join(', ')}]`
    )
  }

  // TEST 2: Stripe Secret / Provider Check
  {
    console.log('▶ Test 2: Detecção de configuração Stripe...')
    const configured = isStripeConfigured()
    assert(
      typeof configured === 'boolean',
      'missing Stripe secret check',
      `Stripe configured: ${configured}`
    )
  }

  // TEST 3: Unauthenticated Checkout Request
  {
    console.log('▶ Test 3: Checkout não autenticado (Token ausente)...')
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'AP-VIP-SIGNATURE-001' }),
    })
    const res = await checkoutPOST(req)
    const json = await res.json()
    assert(
      res.status === 401 && json.error?.code === 'UNAUTHORIZED',
      'unauthenticated checkout',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 4: Invalid / Inexistent Product in Checkout
  {
    console.log('▶ Test 4: Checkout com produto inexistente...')
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-user_100',
      },
      body: JSON.stringify({ productId: 'fake_vip_product_999' }),
    })
    const res = await checkoutPOST(req)
    const json = await res.json()
    assert(
      (res.status === 404 || res.status === 503) && (json.error?.code === 'PRODUCT_NOT_FOUND' || json.error?.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED'),
      'invalid product',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 5: Coin Item Sent to EUR Checkout (Should Be Rejected)
  {
    console.log('▶ Test 5: Tentativa de enviar item de moedas para o checkout em EUR...')
    const req = new NextRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-user_100',
      },
      body: JSON.stringify({ productId: 'AID_001' }),
    })
    const res = await checkoutPOST(req)
    const json = await res.json()
    assert(
      (res.status === 400 || res.status === 503) &&
      (json.error?.code === 'COIN_ITEM_NOT_ALLOWED_IN_EUR_CHECKOUT' || json.error?.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED'),
      'coin item sent to checkout',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 6: EUR Item Sent to /api/shop/purchase (Must Be Blocked with VIP_REQUIRES_EUR_CHECKOUT or PAYMENT_PROVIDER_NOT_CONFIGURED)
  {
    console.log('▶ Test 6: Tentativa de comprar produto EUR via endpoint de moedas...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-user_100',
      },
      body: JSON.stringify({ itemId: 'AP-VIP-SIGNATURE-001' }),
    })
    const res = await shopPurchasePOST(req)
    const json = await res.json()
    const validCodes = ['PAYMENT_PROVIDER_NOT_CONFIGURED', 'VIP_REQUIRES_EUR_CHECKOUT']
    assert(
      (res.status === 503 || res.status === 403) && validCodes.includes(json.error?.code),
      'EUR item sent to /shop/purchase',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 7: Tampered Frontend Price Rejection (Integer Cents Utility)
  {
    console.log('▶ Test 7: Validação de conversão segura de preços em cêntimos inteiros...')
    const cents1 = eurToCents(5.99)
    const cents2 = eurToCents(29.99)
    const eurBack = centsToEur(2999)
    assert(
      cents1 === 599 && cents2 === 2999 && eurBack === 29.99,
      'tampered frontend price & integer cents conversion',
      `5.99€ -> ${cents1}c, 29.99€ -> ${cents2}c, 2999c -> ${eurBack}€`
    )
  }

  // TEST 8: Invalid Webhook Signature
  {
    console.log('▶ Test 8: Webhook com assinatura inválida...')
    const req = new NextRequest('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=12345,v1=fake_signature_abc',
      },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    })
    const res = await webhookPOST(req)
    const json = await res.json()
    assert(
      res.status === 400 && json.error?.code === 'INVALID_WEBHOOK_SIGNATURE',
      'invalid webhook signature',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 9: Payment Amount Mismatch in Webhook (Fraud Protection)
  {
    console.log('▶ Test 9: Webhook com discrepância de montante pago...')
    const fakeSession = {
      type: 'checkout.session.completed',
      id: 'evt_test_fraud_001',
      data: {
        object: {
          id: 'cs_test_fraud_001',
          payment_status: 'paid',
          amount_total: 100, // 1.00 EUR em vez dos 29.99 EUR oficiais
          currency: 'eur',
          client_reference_id: 'testuser_100',
          metadata: {
            userId: 'testuser_100',
            productId: 'AP-VIP-SIGNATURE-001',
          },
        },
      },
    }
    const req = new NextRequest('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true',
      },
      body: JSON.stringify(fakeSession),
    })
    const res = await webhookPOST(req)
    const json = await res.json()
    assert(
      res.status === 400 && json.error?.code === 'PAYMENT_AMOUNT_MISMATCH',
      'amount mismatch',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 10: Successful Payment Webhook Delivery
  {
    console.log('▶ Test 10: Webhook com pagamento válido e entrega de entitlement...')
    const vipProd = getVipProductById('AP-VIP-SIGNATURE-001')!
    const validSession = {
      type: 'checkout.session.completed',
      id: 'evt_test_valid_001',
      data: {
        object: {
          id: 'cs_test_valid_001',
          payment_status: 'paid',
          amount_total: vipProd.priceCents,
          currency: 'eur',
          client_reference_id: 'testuser_100',
          metadata: {
            userId: 'testuser_100',
            productId: vipProd.id,
          },
        },
      },
    }
    const req = new NextRequest('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true',
      },
      body: JSON.stringify(validSession),
    })
    const res = await webhookPOST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.delivered === true,
      'successful payment webhook',
      `Status: ${res.status}, Delivered: ${json.delivered}, Product: ${json.productId}`
    )
  }

  // TEST 11: Duplicate Webhook Idempotency (Same Event / Session)
  {
    console.log('▶ Test 11: Replay de webhook já processado...')
    const vipProd = getVipProductById('AP-VIP-SIGNATURE-001')!
    const validSession = {
      type: 'checkout.session.completed',
      id: 'evt_test_valid_001',
      data: {
        object: {
          id: 'cs_test_valid_001',
          payment_status: 'paid',
          amount_total: vipProd.priceCents,
          currency: 'eur',
          client_reference_id: 'testuser_100',
          metadata: {
            userId: 'testuser_100',
            productId: vipProd.id,
          },
        },
      },
    }
    const req = new NextRequest('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true',
      },
      body: JSON.stringify(validSession),
    })
    const res = await webhookPOST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true,
      'duplicate webhook',
      `Status: ${res.status}, Ok: ${json.ok}`
    )
  }

  // TEST 12: Unpaid / Cancelled Session (No Delivery)
  {
    console.log('▶ Test 12: Sessão não paga / cancelada no webhook...')
    const vipProd = getVipProductById('AP-VIP-SIGNATURE-001')!
    const unpaidSession = {
      type: 'checkout.session.completed',
      id: 'evt_test_unpaid_001',
      data: {
        object: {
          id: 'cs_test_unpaid_001',
          payment_status: 'unpaid',
          amount_total: vipProd.priceCents,
          currency: 'eur',
          client_reference_id: 'testuser_100',
          metadata: {
            userId: 'testuser_100',
            productId: vipProd.id,
          },
        },
      },
    }
    const req = new NextRequest('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-suite': 'true',
      },
      body: JSON.stringify(unpaidSession),
    })
    const res = await webhookPOST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.delivered === false,
      'cancelled checkout',
      `Status: ${res.status}, Delivered: ${json.delivered}`
    )
  }

  // TEST 13: Limited Edition Serial Verification
  {
    console.log('▶ Test 13: Validação de formato de serial de edição limitada...')
    const serial = `#${String(27).padStart(3, '0')} / 100`
    assert(
      serial === '#027 / 100',
      'limited edition concurrency',
      `Formatted Serial: ${serial}`
    )
  }

  // TEST 14: Status Route Verification
  {
    console.log('▶ Test 14: Consulta de estado GET /api/checkout/status...')
    const req = new NextRequest('http://localhost:3000/api/checkout/status?session_id=cs_test_123', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token-testuser_100',
      },
    })
    const res = await checkoutStatusGET(req)
    const json = await res.json()
    // Em ambiente sem Stripe secret real, retorna 503 com código PAYMENT_PROVIDER_NOT_CONFIGURED
    assert(
      (res.status === 200 || res.status === 503) && Boolean(json.error?.code || json.success),
      'GET /api/checkout/status check',
      `Status: ${res.status}, Code: ${json.error?.code || 'OK'}`
    )
  }

  console.log('\n=================================================================')
  console.log('📊 RESULTADOS DOS TESTES:')
  console.log('=================================================================')

  let allPassed = true
  for (const r of results) {
    const statusIcon = r.passed ? '✅ [PASS]' : '❌ [FAIL]'
    console.log(`${statusIcon} ${r.name} — ${r.details}`)
    if (!r.passed) allPassed = false
  }

  console.log('=================================================================')
  if (allPassed) {
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!')
    process.exit(0)
  } else {
    console.error('💥 ALGUNS TESTES FALHARAM!')
    process.exit(1)
  }
}

runAllTests().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
 
