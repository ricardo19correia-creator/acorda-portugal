import fs from 'fs'
import path from 'path'
import { getCommunityState, type PresenceData } from '../lib/presence'
import { ARENA_SHOP_CATALOG } from '../src/data/shopArenas'

async function runAcceptanceTests() {
  console.log('================================================================================')
  console.log('🧪 ACORDA PORTUGAL — BATERIA DE TESTES DE ACEITAÇÃO FINAL')
  console.log('================================================================================\n')

  let allPassed = true

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      allPassed = false
    }
  }

  // --- TESTES 6, 7, 8, 9, 10: SISTEMA DE PRESENÇA REAL & CONTADOR ONLINE ---
  console.log('--- TESTES 6, 7, 8, 9, 10: PRESENÇA REAL & CONTADOR ONLINE ---')

  const now = new Date()

  // Teste 6.1: Sem contas reais ligadas -> humanOnline = 0
  const state0 = getCommunityState([], now)
  assert(state0.humanOnline === 0, 'Sem contas reais ligadas -> humanOnline === 0')

  // Teste 6.2: Uma conta real ligada -> humanOnline = 1
  const doc1: PresenceData = {
    userId: 'user_porto_123',
    username: 'Rui Porto',
    online: true,
    lastSeen: now.getTime() - 2000,
    district: 'Porto',
    xp: 500,
    level: 2,
    activity: 'playing',
    playerType: 'human',
  }
  const state1 = getCommunityState([doc1], now)
  assert(state1.humanOnline === 1, 'Uma conta real ligada -> humanOnline === 1')

  // Teste 6.3: Duas contas reais ligadas -> humanOnline = 2
  const doc2: PresenceData = {
    userId: 'user_lisboa_456',
    username: 'Ana Lisboa',
    online: true,
    lastSeen: now.getTime() - 5000,
    district: 'Lisboa',
    xp: 1200,
    level: 4,
    activity: 'duel',
    playerType: 'human',
  }
  const state2 = getCommunityState([doc1, doc2], now)
  assert(state2.humanOnline === 2, 'Duas contas reais ligadas -> humanOnline === 2')

  // Teste 6.4: Uma sai (online: false) -> humanOnline = 1
  const doc1_offline: PresenceData = { ...doc1, online: false }
  const state_leave = getCommunityState([doc1_offline, doc2], now)
  assert(state_leave.humanOnline === 1, 'Uma conta sai (online: false) -> humanOnline === 1')

  // Teste 8: Timeout de heartbeat (>45s) -> humanOnline = 0
  const doc_expired: PresenceData = { ...doc1, lastSeen: now.getTime() - 50000 }
  const state_expired = getCommunityState([doc_expired], now)
  assert(state_expired.humanOnline === 0, 'Sessão expirada (>45s sem heartbeat) -> humanOnline === 0')

  // Teste 9: Multi-tab na mesma conta (2 docs com mesmo userId) -> humanOnline = 1
  const doc1_tab2: PresenceData = { ...doc1, lastSeen: now.getTime() - 1000 }
  const state_multitab = getCommunityState([doc1, doc1_tab2], now)
  assert(state_multitab.humanOnline === 1, 'Multi-tab da mesma conta -> humanOnline === 1 (sem duplicação)')

  // --- TESTE 11: TERRITÓRIO PERMANENTE ---
  console.log('\n--- TESTE 11: DISTRITO & CIDADE PERMANENTES ---')
  const authProviderCode = fs.readFileSync(path.join(process.cwd(), 'components', 'auth-provider.tsx'), 'utf8')
  assert(authProviderCode.includes('districtLockedVal = Boolean(data.districtLocked && districtVal)'), 'Bloqueio estrito de distrito no AuthProvider')
  assert(!authProviderCode.includes('setDistrictLocked(false)'), 'Impossibilidade de desbloquear distrito')

  // --- TESTE 12: ARENAS DA LOJA (33 ARENAS ÚNICAS) ---
  console.log('\n--- TESTE 12: ARENAS DA LOJA (33 ITENS ÚNICOS) ---')
  const catalog = ARENA_SHOP_CATALOG

  assert(catalog.length === 33, 'Catálogo tem exatamente 33 arenas')

  const seenUrls = new Set<string>()
  let duplicates = 0
  catalog.forEach((a) => {
    if (seenUrls.has(a.shopImage)) duplicates++
    seenUrls.add(a.shopImage)
  })
  assert(duplicates === 0, 'Zero URLs duplicadas no catálogo da loja')
  assert(seenUrls.size === 33, '33 URLs promocionais únicas em catálogo')

  // --- RESUMO FINAL ---
  console.log('\n================================================================================')
  if (allPassed) {
    console.log('🌟 TODOS OS CRITÉRIOS DE ACEITAÇÃO PASSARAM COM 100% DE CONFORMIDADE!')
  } else {
    console.error('⚠️ ALGUNS TESTES FALHARAM!')
  }
  console.log('================================================================================')
}

runAcceptanceTests().catch(console.error)
