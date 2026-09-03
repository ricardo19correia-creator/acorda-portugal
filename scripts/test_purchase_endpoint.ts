import { POST, GET } from '../app/api/shop/purchase/route'
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

async function runTestSuite() {
  console.log('=================================================================')
  console.log('🧪 SUITE OFICIAL DE TESTES FORENSES — ENDPOINT /api/shop/purchase')
  console.log('=================================================================\n')

  // TEST 1: Unauthenticated request (Missing Token)
  {
    console.log('▶ Test 1: Utilizador não autenticado (Token ausente)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'AID_002' }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 401 && (json.error?.code === 'UNAUTHORIZED' || json.error?.code === 'AUTH_MISSING') && Boolean(json.requestId),
      'authentication (missing token)',
      `Status: ${res.status}, Code: ${json.error?.code}, ReqId: ${json.requestId}`
    )
  }

  // TEST 2: Missing Product ID
  {
    console.log('▶ Test 2: Payload sem identificador de produto...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 400 && json.error?.code === 'MISSING_PRODUCT_ID' && Boolean(json.requestId),
      'invalid payload (missing product id)',
      `Status: ${res.status}, Code: ${json.error?.code}, ReqId: ${json.requestId}`
    )
  }

  // TEST 3: Inexistent / Invalid Product
  {
    console.log('▶ Test 3: Produto inexistente no catálogo canónico...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({ productId: 'fake_product_xyz_999' }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 404 && json.error?.code === 'PRODUCT_NOT_FOUND' && Boolean(json.requestId),
      'invalid product rejection (404 PRODUCT_NOT_FOUND)',
      `Status: ${res.status}, Code: ${json.error?.code}, ReqId: ${json.requestId}`
    )
  }

  // TEST 4: Tampered Price Rejection (Client sends 0.01 EUR or 1 coin for a 750 coin aid AID_002)
  {
    console.log('▶ Test 4: Preço adulterado pelo cliente (AID_002 canónico: 750 Moedas)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'AID_002',
        priceCoins: 1, // Preço falso
        priceEur: 0.01, // Preço falso
        price: 0.01,
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.deducted === 750,
      'tampered price rejection & server-side price authority',
      `Status: ${res.status}, Deducted: ${json.deducted} (Preço canónico 750 Moedas respeitado)`
    )
  }

  // TEST 5: VIP Real Money Product via Coin Endpoint
  {
    console.log('▶ Test 5: Tentativa de compra de Exclusivo VIP em € Real via endpoint de moedas...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({ productId: 'AP-VIP-SIGNATURE-001' }),
    })
    const res = await POST(req)
    const json = await res.json()
    const validCodes = ['PAYMENT_PROVIDER_NOT_CONFIGURED', 'VIP_REQUIRES_EUR_CHECKOUT']
    assert(
      (res.status === 503 || res.status === 403) && validCodes.includes(json.error?.code),
      'payment flow / currency validation for VIP EUR',
      `Status: ${res.status}, Code: ${json.error?.code}, Message: ${json.error?.message}`
    )
  }

  // TEST 6: Merit Item Purchase Rejection
  {
    console.log('▶ Test 6: Tentativa de compra de Item de Mérito (Conquistas / Rankings)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({ productId: 'tit_excl_rank1' }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 403 && json.error?.code === 'MERIT_ITEM_NOT_PURCHASABLE',
      'merit item purchase protection',
      `Status: ${res.status}, Code: ${json.error?.code}`
    )
  }

  // TEST 7: Valid Consumable Purchases (Matrix: AID_002, AID_003, AID_004)
  {
    console.log('▶ Test 7: Compra válida de ajuda consumível AID_002 (Pack x5 50/50 - 750 Moedas)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'AID_002',
        itemId: 'AID_002',
        idempotencyKey: 'idem_key_test_001',
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.productId === 'AID_002' && json.deducted === 750 && Boolean(json.requestId),
      'AID_002 purchase & stock delivery',
      `Status: ${res.status}, Item: ${json.productId}, Deducted: ${json.deducted}, Stock: ${json.stock}, ReqId: ${json.requestId}`
    )
  }

  {
    console.log('▶ Test 7b: Compra válida de ajuda consumível AID_003 (Pack x3 Público - 1500 Moedas)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'AID_003',
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.productId === 'AID_003' && json.deducted === 1500,
      'AID_003 purchase & price check',
      `Status: ${res.status}, Item: ${json.productId}, Deducted: ${json.deducted}`
    )
  }

  {
    console.log('▶ Test 7c: Compra válida de ajuda consumível AID_004 (Pack x3 Congelar - 900 Moedas)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'AID_004',
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.productId === 'AID_004' && json.deducted === 900,
      'AID_004 purchase & price check',
      `Status: ${res.status}, Item: ${json.productId}, Deducted: ${json.deducted}`
    )
  }

  // TEST 8: Cosmetic Purchase: Animated Frame (frame_fogo_eterno)
  {
    console.log('▶ Test 8: Compra de Moldura Viva (frame_fogo_eterno - 4500 Moedas)...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'frame_fogo_eterno',
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && json.productId === 'frame_fogo_eterno' && json.deducted === 4500,
      'Cosmetic frame purchase (frame_fogo_eterno)',
      `Status: ${res.status}, Item: ${json.productId}, Deducted: ${json.deducted}`
    )
  }

  // TEST 9: Idempotency Protection
  {
    console.log('▶ Test 9: Replay com mesma idempotencyKey...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-testuser_100',
      },
      body: JSON.stringify({
        productId: 'AID_002',
        idempotencyKey: 'idem_key_test_001',
      }),
    })
    const res = await POST(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true,
      'idempotency & duplicate protection',
      `Status: ${res.status}, Item: ${json.productId || json.itemId}, Deducted: ${json.deducted}`
    )
  }

  // TEST 10: GET Store Status
  {
    console.log('▶ Test 10: Consulta GET /api/shop/purchase...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token-testuser_100',
      },
    })
    const res = await GET(req)
    const json = await res.json()
    assert(
      res.status === 200 && json.ok === true && Boolean(json.aids?.AID_002),
      'GET /api/shop/purchase status check',
      `Status: ${res.status}, Aids Count: ${Object.keys(json.aids || {}).length}`
    )
  }

  // TEST 11: Standardized Error Contract
  {
    console.log('▶ Test 11: Verificação de formato canónico de erro ({ ok, error: { code, message }, requestId })...')
    const req = new NextRequest('http://localhost:3000/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'fake_123' }),
    })
    const res = await POST(req)
    const json = await res.json()
    const hasCanonicalShape =
      json.ok === false &&
      json.success === false &&
      typeof json.error?.code === 'string' &&
      typeof json.error?.message === 'string' &&
      typeof json.requestId === 'string'
    assert(
      hasCanonicalShape,
      'standardized error contract schema',
      `Contract valid: ${hasCanonicalShape}, Code: ${json.error?.code}`
    )
  }

  // TEST 12: Balance extraction from acordas field (SSOT Verification)
  {
    console.log('▶ Test 12: Validação de extração de saldo a partir do campo canónico `acordas`...')
    const { extractUserCoins, getCanonicalBalancePayload } = await import('../lib/economy-helpers')
    const balanceFromAcordas = extractUserCoins({ acordas: 10000 })
    const balanceFromCoins = extractUserCoins({ coins: 10000 })
    const balanceFromAcordasVirtuais = extractUserCoins({ acordasVirtuais: 10000 })
    const balanceFromMoedas = extractUserCoins({ moedas: 10000 })
    const balanceFromUpdatedAcordas = extractUserCoins({ acordas: 15000, coins: 10000 })

    const payload = getCanonicalBalancePayload(14000)

    assert(
      balanceFromAcordas === 10000 &&
      balanceFromCoins === 10000 &&
      balanceFromAcordasVirtuais === 10000 &&
      balanceFromMoedas === 10000 &&
      balanceFromUpdatedAcordas === 15000 &&
      payload.coins === 14000 &&
      payload.acordas === 14000 &&
      payload.euros === 14000 &&
      payload.moedas === 14000 &&
      payload.balance === 14000,
      'Acordas & Coins SSOT normalization',
      `Acordas(10000): ${balanceFromAcordas}, UpdatedAcordas(15000): ${balanceFromUpdatedAcordas}, CanonicalPayload: ${JSON.stringify(payload)}`
    )
  }

  console.log('\n=================================================================')
  console.log('📊 RESULTADOS DOS TESTES FORENSES:')
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

runTestSuite().catch((err) => {
  console.error('Erro fatal ao executar suite:', err)
  process.exit(1)
})
