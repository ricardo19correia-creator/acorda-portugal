import { connectionManager, useOnline, useConnectionStatus } from '../lib/connection-manager'
import { silentAsyncRetry, silentFetchWithRetry } from '../lib/network-resilience'
import { ARENA_SHOP_CATALOG, getArenaById } from '../src/data/shopArenas'

async function runDeepFaultToleranceTests() {
  console.log('================================================================================')
  console.log('🧪 ACORDA PORTUGAL — TESTES DE ENGENHARIA DE TOLERÂNCIA A FALHAS E RESILIÊNCIA')
  console.log('================================================================================\n')

  let allPassed = true

  // 1. TESTE DE CONECTIVIDADE PASSIVA (Sem polling infinito)
  console.log('--- TESTE 1: GESTOR DE CONECTIVIDADE PASSIVA ---')
  const initialDetail = connectionManager.getDetail()
  if (initialDetail.state === 'connected' && initialDetail.isOnline === true) {
    console.log('✅ [PASS] Conexão inicial em estado "connected" sem polling artificial.')
  } else {
    console.error('❌ [FAIL] Estado inicial inesperado:', initialDetail)
    allPassed = false
  }

  // 2. TESTE DE SILENT RETRY COM EXPONENTIAL BACKOFF
  console.log('\n--- TESTE 2: SILENT RETRY EM REDE LENTA / OSCILAÇÃO TRANSITÓRIA ---')
  let attemptCount = 0
  const simulatedFlakyRequest = async () => {
    attemptCount++
    if (attemptCount < 3) {
      throw new Error('Failed to fetch (simulated transient network drop)')
    }
    return { ok: true, data: 'sucesso após retry' }
  }

  const retryStart = Date.now()
  const result = await silentAsyncRetry(simulatedFlakyRequest, {
    maxRetries: 3,
    baseDelayMs: 100,
    maxDelayMs: 500,
  })
  const retryDuration = Date.now() - retryStart

  if (result.ok && attemptCount === 3) {
    console.log(`✅ [PASS] Silent Retry recuperou com sucesso após 3 tentativas (${retryDuration}ms).`)
  } else {
    console.error('❌ [FAIL] Silent Retry falhou ao recuperar:', result)
    allPassed = false
  }

  // 3. TESTE DE AUDITORIA DE TODAS AS 33 ARENAS (Zero imagens duplicadas)
  console.log('\n--- TESTE 3: ARENAS CANÓNICAS E INTEGRIDADE DE CATÁLOGO ---')
  const arenaCount = ARENA_SHOP_CATALOG.length
  const uniqueImages = new Set(ARENA_SHOP_CATALOG.map(a => a.image)).size

  if (arenaCount === 33 && uniqueImages === 33) {
    console.log(`✅ [PASS] 33/33 Arenas únicas e distintas registradas sem duplicados.`)
  } else {
    console.error(`❌ [FAIL] Catálogo de arenas inválido: Total=${arenaCount}, Únicas=${uniqueImages}`)
    allPassed = false
  }

  // 4. TESTE DE PRESERVAÇÃO DE PERFIL E RETROCOMPATIBILIDADE DE IDs
  console.log('\n--- TESTE 4: RETROCOMPATIBILIDADE DE IDs E PRESERVAÇÃO DE JOGADORES ---')
  const legacyAliases = ['arena-1', 'arena-2', 'arena-3', 'arena-10', 'estadio-nacional']
  let legacySuccess = true
  for (const alias of legacyAliases) {
    const arena = getArenaById(alias)
    if (!arena || !arena.id.startsWith('arena_')) {
      legacySuccess = false
      console.error(`❌ [FAIL] Alias '${alias}' não resolveu para ID canónico.`)
    }
  }

  if (legacySuccess) {
    console.log('✅ [PASS] Todos os IDs legados mapeiam de forma transparente para arenas canónicas.')
  } else {
    allPassed = false
  }

  console.log('\n================================================================================')
  if (allPassed) {
    console.log('🌟 TODOS OS TESTES DE ENGENHARIA E TOLERÂNCIA A FALHAS PASSARAM COM SUCESSO!')
  } else {
    console.error('❌ EXISTEM FALHAS NOS TESTES!')
    process.exit(1)
  }
  console.log('================================================================================\n')
}

runDeepFaultToleranceTests().catch(err => {
  console.error(err)
  process.exit(1)
})
