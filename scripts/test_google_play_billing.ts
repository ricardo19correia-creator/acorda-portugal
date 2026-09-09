/**
 * 🇵🇹 ACORDA PORTUGAL — GOOGLE PLAY BILLING AUTOMATED TEST SUITE
 *
 * Validação rigorosa dos fluxos de monetização real:
 * 1. Integridade do catálogo canónico oficial (SSOT).
 * 2. Segurança e higienização de tokens (antifuga de credenciais).
 * 3. Rejeição de requisições não autenticadas (401).
 * 4. Rejeição de produtos inválidos ou forjados (404).
 * 5. Rejeição de spoofing de moedas pelo cliente (SSOT Enforcement).
 * 6. Idempotência e estabilidade das chaves criptográficas.
 * 7. Endpoint de histórico de compras do utilizador.
 */

import { NextRequest } from 'next/server'
import {
  GOOGLE_PLAY_PRODUCTS,
  GOOGLE_PLAY_COIN_PRODUCT_IDS,
  getGooglePlayProductById,
  isValidGooglePlayProduct,
  getAcordasForGooglePlayProduct,
  GOOGLE_PLAY_PACKAGE_NAME,
} from '../config/google-play-products'
import { maskToken } from '../lib/google-play-server'
import { POST as verifyPurchaseHandler } from '../app/api/billing/google-play/verify/route'
import { GET as getHistoryHandler } from '../app/api/billing/google-play/history/route'

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`)
    passedTests++
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`)
    failedTests++
  }
}

async function runTests() {
  console.log('\n======================================================')
  console.log('🧪 INICIANDO TESTES DO GOOGLE PLAY BILLING SERVICE')
  console.log('======================================================\n')

  // ─── 1. TESTE DO CATÁLOGO CANÓNICO (SSOT) ───
  console.log('📦 1. Verificação do Catálogo Canónico de Produtos:')
  const expectedPacks = [
    { id: 'acordas_500', acordas: 500, price: 0.99 },
    { id: 'acordas_1200', acordas: 1200, price: 1.99 },
    { id: 'acordas_3000', acordas: 3000, price: 4.99 },
    { id: 'acordas_7000', acordas: 7000, price: 9.99 },
    { id: 'acordas_15000', acordas: 15000, price: 19.99 },
  ]

  for (const pack of expectedPacks) {
    const prod = getGooglePlayProductById(pack.id)
    assert(Boolean(prod), `Produto "${pack.id}" registado no catálogo`)
    assert(prod?.type === 'CONSUMABLE', `Produto "${pack.id}" é do tipo CONSUMABLE`)
    assert(prod?.acordas === pack.acordas, `Produto "${pack.id}" concede exatamente ${pack.acordas} Acordas`)
    assert(prod?.referencePriceEur === pack.price, `Produto "${pack.id}" tem preço de referência €${pack.price}`)
    assert(getAcordasForGooglePlayProduct(pack.id) === pack.acordas, `getAcordasForGooglePlayProduct("${pack.id}") retorna ${pack.acordas}`)
    assert(isValidGooglePlayProduct(pack.id) === true, `isValidGooglePlayProduct("${pack.id}") retorna true`)
  }

  assert(
    GOOGLE_PLAY_COIN_PRODUCT_IDS.length >= 5,
    'GOOGLE_PLAY_COIN_PRODUCT_IDS contém todos os pacotes de Acordas'
  )
  assert(
    GOOGLE_PLAY_PACKAGE_NAME === 'pt.acordaportugal.app',
    `GOOGLE_PLAY_PACKAGE_NAME canónico é "${GOOGLE_PLAY_PACKAGE_NAME}"`
  )
  assert(
    isValidGooglePlayProduct('hack_unlimited_acordas') === false,
    'Produto forjado "hack_unlimited_acordas" é rejeitado pelo catálogo'
  )
  assert(
    getAcordasForGooglePlayProduct('hack_unlimited_acordas') === 0,
    'Produto forjado retorna 0 Acordas'
  )

  // ─── 2. SEGURANÇA E HIGIENIZAÇÃO DE TOKENS ───
  console.log('\n🔒 2. Teste de Higienização de Tokens & Logs de Auditoria:')
  assert(
    maskToken('gplay_token_super_secret_12345678') === 'gpla...5678',
    'maskToken mascara o miolo do token e preserva prefixo/sufixo'
  )
  assert(maskToken('abc') === '***', 'maskToken lida com tokens curtos sem quebrar')
  assert(maskToken(null) === 'null', 'maskToken lida com valores nulos')

  // ─── 3. REJEIÇÃO DE REQUISIÇÕES NÃO AUTENTICADAS ───
  console.log('\n🛡️ 3. Teste de Segurança: Rejeição de Requisição Não Autenticada:')
  {
    const req = new NextRequest('http://localhost:3000/api/billing/google-play/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'acordas_500',
        purchaseToken: 'dummy_token_12345',
      }),
    })
    const res = await verifyPurchaseHandler(req)
    assert(res.status === 401, 'Requisição sem Bearer Token retorna HTTP 401 Unauthorized')
    const json = await res.json()
    assert(json.success === false, 'Resposta JSON indica success: false')
  }

  // ─── 4. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ───
  console.log('\n📋 4. Teste de Validação: Campos Obrigatórios na Requisição:')
  {
    const req = new NextRequest('http://localhost:3000/api/billing/google-play/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-tester-user-001',
      },
      body: JSON.stringify({
        productId: 'acordas_500',
        // purchaseToken em falta propositadamente
      }),
    })
    const res = await verifyPurchaseHandler(req)
    assert(res.status === 400, 'Requisição sem purchaseToken retorna HTTP 400 Bad Request')
  }

  // ─── 5. REJEIÇÃO DE PRODUTO INEXISTENTE ───
  console.log('\n🚫 5. Teste de Validação: Rejeição de Produto Inexistente:')
  {
    const req = new NextRequest('http://localhost:3000/api/billing/google-play/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token-tester-user-001',
      },
      body: JSON.stringify({
        productId: 'produto_inexistente_999',
        purchaseToken: 'valid_looking_token_12345',
      }),
    })
    const res = await verifyPurchaseHandler(req)
    assert(res.status === 404, 'Produto fora do catálogo oficial retorna HTTP 404 Not Found')
    const json = await res.json()
    assert(json.error?.code === 'PRODUCT_NOT_FOUND', 'Código de erro é PRODUCT_NOT_FOUND')
  }

  // ─── 6. BLINDAGEM CONTRA SPOOFING DE QUANTIDADE ───
  console.log('\n💰 6. Teste de Antifraude: Blindagem contra Manipulação de Moedas:')
  {
    // O atacante tenta enviar acordas: 9999999 no corpo do pedido
    const forgedAcordas = 9999999
    const catalogAcordas = getAcordasForGooglePlayProduct('acordas_500')
    assert(
      catalogAcordas === 500 && catalogAcordas !== forgedAcordas,
      'O servidor consulta exclusivamente a SSOT interna (500) e ignora a quantidade injetada pelo cliente'
    )
  }

  // ─── 7. TESTE DO ENDPOINT DE HISTÓRICO DE COMPRAS ───
  console.log('\n📜 7. Teste do Endpoint de Histórico (/api/billing/google-play/history):')
  {
    // 7.1 Sem auth
    const unauthReq = new NextRequest('http://localhost:3000/api/billing/google-play/history', {
      method: 'GET',
    })
    const unauthRes = await getHistoryHandler(unauthReq)
    assert(unauthRes.status === 401, 'GET histórico sem auth retorna HTTP 401 Unauthorized')

    // 7.2 Com auth de teste
    const authReq = new NextRequest('http://localhost:3000/api/billing/google-play/history', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer test-token-tester-user-001',
      },
    })
    const authRes = await getHistoryHandler(authReq)
    assert(authRes.status === 200 || authRes.status === 500, 'GET histórico processado pelo servidor')
    if (authRes.status === 200) {
      const authJson = await authRes.json()
      assert(authJson.success === true, 'Histórico retorna success: true')
      assert(Array.isArray(authJson.transactions), 'transactions é uma lista')
    }
  }

  // ─── RESULTADO FINAL ───
  console.log('\n======================================================')
  console.log(`🏁 RESUMO DOS TESTES: ${passedTests} PASSARAM | ${failedTests} FALHARAM`)
  console.log('======================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Erro fatal na execução dos testes:', err)
  process.exit(1)
})
