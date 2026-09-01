import fs from 'fs'
import path from 'path'
import { ARENA_SHOP_CATALOG } from '../src/data/shopArenas'

async function runAcceptanceTests() {
  console.log('================================================================================')
  console.log('🧪 ACORDA PORTUGAL — BATERIA DE TESTES: REMOÇÃO TOTAL DE JOGADORES ONLINE')
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

  // --- TESTES 1 A 12: AUSÊNCIA TOTAL DE FICHEIROS E ENDPOINTS DE PRESENÇA ---
  console.log('--- TESTES 1 A 12: AUDITORIA DE FICHEIROS, ROTAS E MÓDULOS DE PRESENÇA ---')

  const obsoleteFiles = [
    'components/presence-provider.tsx',
    'components/online-users-badge.tsx',
    'components/online-players-modal.tsx',
    'components/live-presence.tsx',
    'hooks/use-online-users.ts',
    'hooks/useOnlineUsers.ts',
    'app/api/presence/route.ts',
    'app/api/presence/ping/route.ts',
    'lib/presence.ts',
    'lib/activity-schedule.ts',
    'lib/npc-system/npc-schedule-engine.ts',
    'PRESENCE.md',
  ]

  obsoleteFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(process.cwd(), file))
    assert(!exists, `Ficheiro eliminado: ${file} não existe no projeto`)
  })

  // --- TESTE 13: AUSÊNCIA DE PRESENCEPROVIDER NO APP LAYOUT ---
  console.log('\n--- TESTES 13 A 18: AUDITORIA DE UI E COMPONENTES ---')
  const layoutCode = fs.readFileSync(path.join(process.cwd(), 'app', 'layout.tsx'), 'utf8')
  assert(!layoutCode.includes('PresenceProvider'), 'app/layout.tsx sem PresenceProvider nem imports de presença')

  // --- TESTE 14: AUSÊNCIA DE BADGES E MODAIS NO SITE HEADER ---
  const headerCode = fs.readFileSync(path.join(process.cwd(), 'components', 'site-header.tsx'), 'utf8')
  assert(!headerCode.includes('OnlineUsersBadge'), 'components/site-header.tsx sem OnlineUsersBadge')
  assert(!headerCode.includes('onlineCount'), 'components/site-header.tsx sem contadores online')

  // --- TESTE 15: AUSÊNCIA DE INDICADORES DE PRESENÇA NO MAPA INTERATIVO ---
  const mapCode = fs.readFileSync(path.join(process.cwd(), 'components', 'portugal-hero-map.tsx'), 'utf8')
  assert(!mapCode.includes('usePresence'), 'components/portugal-hero-map.tsx sem usePresence')
  assert(!mapCode.includes('districtOnlineCounts'), 'components/portugal-hero-map.tsx sem districtOnlineCounts')
  assert(!mapCode.includes('Online Indicator'), 'components/portugal-hero-map.tsx sem badges de jogadores online')

  // --- TESTE 16: AUSÊNCIA DE SETACTIVITY NO QUIZ SCREEN ---
  const quizCode = fs.readFileSync(path.join(process.cwd(), 'components', 'quiz', 'quiz-screen.tsx'), 'utf8')
  assert(!quizCode.includes('usePresence'), 'components/quiz/quiz-screen.tsx sem usePresence')
  assert(!quizCode.includes('setActivity'), 'components/quiz/quiz-screen.tsx sem setActivity')

  // --- TESTE 17: DASHBOARD DE ADMIN SEM MÉTRICAS DE PRESENÇA ---
  const adminApiCode = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'admin', 'dashboard', 'route.ts'), 'utf8')
  assert(!adminApiCode.includes('onlineHumans'), 'app/api/admin/dashboard sem onlineHumans')
  assert(!adminApiCode.includes('getCommunityState'), 'app/api/admin/dashboard sem getCommunityState')

  const adminViewCode = fs.readFileSync(path.join(process.cwd(), 'components', 'admin', 'views', 'DashboardView.tsx'), 'utf8')
  assert(!adminViewCode.includes('onlineHumans'), 'DashboardView.tsx sem onlineHumans')

  // --- TESTE 18: REGRAS DE BASE DE DADOS LIMPAS DE PRESENÇA ---
  console.log('\n--- TESTES 19 A 22: INFRAESTRUTURA, REGRAS E SEGURANÇA ---')
  const dbRules = fs.readFileSync(path.join(process.cwd(), 'database.rules.json'), 'utf8')
  assert(!dbRules.includes('presence'), 'database.rules.json sem regras de presença')

  const firestoreRules = fs.readFileSync(path.join(process.cwd(), 'firestore.rules'), 'utf8')
  assert(!firestoreRules.includes('match /presence/'), 'firestore.rules sem regras de presença')

  // --- TESTE 19: AUTENTICAÇÃO E LOGOUT LIMPOS ---
  const authHelpersCode = fs.readFileSync(path.join(process.cwd(), 'lib', 'auth-helpers.ts'), 'utf8')
  assert(!authHelpersCode.includes('/api/presence'), 'lib/auth-helpers.ts sem beacons de presença no logout')

  // --- TESTE 20: BLOQUEIO DE DISTRITO PRESERVADO ---
  const authProviderCode = fs.readFileSync(path.join(process.cwd(), 'components', 'auth-provider.tsx'), 'utf8')
  assert(authProviderCode.includes('districtLockedVal = Boolean(data.districtLocked && districtVal)'), 'Bloqueio estrito de distrito no AuthProvider preservado')

  // --- TESTE 21: CATÁLOGO DE ARENAS DA LOJA INTACTO ---
  const catalog = ARENA_SHOP_CATALOG
  assert(catalog.length === 43, 'Catálogo de arenas tem exatamente 43 arenas oficiais')
  const seenUrls = new Set<string>()
  let duplicates = 0
  catalog.forEach((a) => {
    if (seenUrls.has(a.image)) duplicates++
    seenUrls.add(a.image)
  })
  assert(duplicates === 0, 'Zero URLs duplicadas no catálogo de arenas')

  // --- TESTE 22: IDENTIFICADOR DA BUILD E ROTA DE VERSÃO ---
  console.log('\n--- TESTES 22 A 24: SEGURANÇA SERVER-SIDE, ATOMICIDADE E BUILD INFO ---')
  const buildInfoCode = fs.readFileSync(path.join(process.cwd(), 'lib', 'build-info.ts'), 'utf8')
  assert(buildInfoCode.includes("version: '1.0.0-rc.5'"), 'lib/build-info.ts com versão canónica 1.0.0-rc.5')
  assert(buildInfoCode.includes("commit: 'forensic-sociallogin-v5'"), 'lib/build-info.ts com commit hash forensic-sociallogin-v5')
  const versionRouteCode = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'version', 'route.ts'), 'utf8')
  assert(versionRouteCode.includes('BUILD_INFO'), 'app/api/version/route.ts exporta dados da build para diagnóstico')

  // --- TESTE 23: TRANSAÇÃO ATÓMICA E PROTEÇÃO DE DUPLA COMPRA NA LOJA ---
  const buyItemCode = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'buy-item', 'route.ts'), 'utf8')
  assert(buyItemCode.includes('db.runTransaction'), 'app/api/buy-item usa runTransaction para deduções atómicas')
  assert(buyItemCode.includes('alreadyOwned'), 'app/api/buy-item tem proteção contra dupla compra')

  // --- TESTE 24: VALIDAÇÃO SERVER-SIDE E IDEMPOTÊNCIA DO QUIZ ---
  const quizCompleteCode = fs.readFileSync(path.join(process.cwd(), 'app', 'api', 'quiz', 'complete', 'route.ts'), 'utf8')
  assert(quizCompleteCode.includes('verifyIdToken'), 'app/api/quiz/complete valida autenticação server-side')
  assert(quizCompleteCode.includes('QuestionRegistry.getInstance()'), 'app/api/quiz/complete valida respostas no registry oficial')
  assert(quizCompleteCode.includes('alreadyProcessed'), 'app/api/quiz/complete tem verificação de idempotência')

  console.log('\n================================================================================')
  if (allPassed) {
    console.log('🌟 TODOS OS 24 CRITÉRIOS DE ACEITAÇÃO, SEGURANÇA E REMOÇÃO PASSARAM COM 100% DE SUCESSO!')
    console.log('================================================================================')
  } else {
    console.error('💥 FALHA EM UM OU MAIS TESTES DE ACEITAÇÃO!')
    console.log('================================================================================')
    process.exit(1)
  }
}

runAcceptanceTests().catch((err) => {
  console.error('Erro ao executar testes:', err)
  process.exit(1)
})
