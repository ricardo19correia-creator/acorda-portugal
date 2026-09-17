/**
 * Teste Automatizado do Sistema Real de Anti-Repetição de Perguntas
 * Acorda Portugal — Desafio Nacional
 */

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const ts = require('typescript')

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  })
  const m = { exports: {} }
  const customRequire = (id) => {
    if (id.startsWith('@/')) {
      const resolved = path.join(__dirname, '..', id.replace('@/', ''))
      if (fs.existsSync(resolved + '.ts')) return requireTs(resolved + '.ts')
      if (fs.existsSync(resolved + '.tsx')) return requireTs(resolved + '.tsx')
      if (fs.existsSync(resolved + '.json')) return JSON.parse(fs.readFileSync(resolved + '.json', 'utf8'))
      if (fs.existsSync(resolved)) {
        if (fs.statSync(resolved).isDirectory()) {
          if (fs.existsSync(path.join(resolved, 'index.ts'))) return requireTs(path.join(resolved, 'index.ts'))
        }
        return JSON.parse(fs.readFileSync(resolved, 'utf8'))
      }
    }
    if (id.endsWith('.json')) {
      const resolved = path.resolve(path.dirname(filePath), id)
      return JSON.parse(fs.readFileSync(resolved, 'utf8'))
    }
    if (id === 'firebase/firestore') {
      return {
        getFirestore: () => ({}),
        doc: () => ({}),
        getDoc: async () => ({ exists: () => false, data: () => ({}) }),
        updateDoc: async () => {},
        arrayUnion: (...items) => items,
        serverTimestamp: () => Date.now(),
      }
    }
    return require(id)
  }
  const fn = new Function('require', 'exports', 'module', '__filename', '__dirname', result.outputText)
  fn(customRequire, m.exports, m, filePath, path.dirname(filePath))
  return m.exports
}

const questionEngine = requireTs(path.join(__dirname, '../src/lib/questionEngine.ts'))
const registryModule = requireTs(path.join(__dirname, '../lib/question-system/registry.ts'))

const {
  selectBalancedMatchQuestions,
  getUserAnsweredHistory,
  recordUserQuestionBatch,
  clearMemoryUserHistories,
} = questionEngine

const { QuestionRegistry } = registryModule

async function runTests() {
  console.log('=================================================================')
  console.log('  TESTES DO SISTEMA REAL DE ANTI-REPETIÇÃO DE PERGUNTAS')
  console.log('=================================================================\n')

  let passedCount = 0
  let totalTests = 0

  function test(name, fn) {
    totalTests++
    try {
      fn()
      console.log(`  ✅ [PASS] ${name}`)
      passedCount++
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message)
    }
  }

  // Obter pool do Desafio Nacional / Jogar Tudo
  const registry = QuestionRegistry.getInstance()
  const pool = registry.getJogarTudo()
  console.log(`ℹ️  Pool total 'Jogar Tudo / Desafio Nacional' carregada: ${pool.length} perguntas.\n`)
  assert(pool.length >= 1000, `Pool deveria ter pelo menos 1000 perguntas, tem ${pool.length}`)

  // -------------------------------------------------------------------------
  // TESTE 1: Nenhuma duplicação dentro da mesma partida (10 perguntas distintas)
  // -------------------------------------------------------------------------
  test('1. Nenhuma duplicação dentro da mesma partida (100 partidas simuladas)', () => {
    for (let i = 0; i < 100; i++) {
      const match = selectBalancedMatchQuestions(pool, 10, new Set(), true, [])
      assert.strictEqual(match.length, 10, `Partida ${i} deveria ter 10 perguntas`)
      const ids = new Set(match.map((q) => q.id))
      assert.strictEqual(ids.size, 10, `Partida ${i} possui perguntas duplicadas!`)
    }
  })

  // -------------------------------------------------------------------------
  // TESTE 2: Entre partidas do mesmo jogador (Prioridade Absoluta a Não Vistas)
  // -------------------------------------------------------------------------
  test('2. 20 partidas consecutivas do mesmo jogador geram 200 perguntas 100% únicas', () => {
    clearMemoryUserHistories()
    const testUserId = 'test_player_alpha'
    const seenSoFar = new Set()

    for (let round = 1; round <= 20; round++) {
      const { seenSet, recentOrder } = getUserAnsweredHistory(testUserId)
      const match = selectBalancedMatchQuestions(pool, 10, seenSet, true, recentOrder)

      assert.strictEqual(match.length, 10, `Ronda ${round} deveria ter 10 perguntas`)

      for (const q of match) {
        assert(!seenSoFar.has(q.id), `Pergunta ${q.id} foi repetida na ronda ${round}!`)
        seenSoFar.add(q.id)
      }

      // Registar IDs na conta do jogador
      recordUserQuestionBatch(testUserId, match.map((q) => q.id))
    }

    assert.strictEqual(seenSoFar.size, 200, `Deveriam ter sido vistas 200 perguntas únicas, foram ${seenSoFar.size}`)
  })

  // -------------------------------------------------------------------------
  // TESTE 3: Histórico individual por utilizador (Isolamento completo)
  // -------------------------------------------------------------------------
  test('3. Dois utilizadores independentes têm pools separadas (User A não afeta User B)', () => {
    clearMemoryUserHistories()
    const userA = 'user_lisboa_01'
    const userB = 'user_porto_02'

    // User A joga 5 partidas (50 perguntas)
    for (let r = 0; r < 5; r++) {
      const { seenSet, recentOrder } = getUserAnsweredHistory(userA)
      const match = selectBalancedMatchQuestions(pool, 10, seenSet, true, recentOrder)
      recordUserQuestionBatch(userA, match.map((q) => q.id))
    }

    const historyA = getUserAnsweredHistory(userA)
    const historyB = getUserAnsweredHistory(userB)

    assert.strictEqual(historyA.seenSet.size, 50, 'User A deve ter 50 perguntas no histórico')
    assert.strictEqual(historyB.seenSet.size, 0, 'User B deve ter 0 perguntas no histórico')

    // User B joga a sua 1ª partida: pode receber qualquer pergunta da pool
    const matchB = selectBalancedMatchQuestions(pool, 10, historyB.seenSet, true, historyB.recentOrder)
    assert.strictEqual(matchB.length, 10)
    // O histórico de A continua isolado
    assert.strictEqual(getUserAnsweredHistory(userA).seenSet.size, 50)
  })

  // -------------------------------------------------------------------------
  // TESTE 4: Reutilização inteligente apenas quando a pool se esgota
  // -------------------------------------------------------------------------
  test('4. Reutilização inteligente sob escassez (pool de 25 perguntas)', () => {
    clearMemoryUserHistories()
    const smallPoolUser = 'user_small_pool'

    // Mock de pool pequena: exatamente 25 perguntas (Q1 a Q25)
    const mockPool = Array.from({ length: 25 }, (_, i) => ({
      id: `mock_q_${i + 1}`,
      question: `Pergunta de teste ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      difficulty: 2,
      category: 'teste',
    }))

    // Partida 1: consome 10 perguntas
    const h1 = getUserAnsweredHistory(smallPoolUser)
    const m1 = selectBalancedMatchQuestions(mockPool, 10, h1.seenSet, false, h1.recentOrder)
    assert.strictEqual(m1.length, 10)
    recordUserQuestionBatch(smallPoolUser, m1.map((q) => q.id))

    // Partida 2: consome mais 10 perguntas novas (total 20 vistas, restam 5 não vistas)
    const h2 = getUserAnsweredHistory(smallPoolUser)
    const m2 = selectBalancedMatchQuestions(mockPool, 10, h2.seenSet, false, h2.recentOrder)
    assert.strictEqual(m2.length, 10)
    // Nenhuma da Partida 1 na Partida 2
    for (const q of m2) {
      assert(!m1.some((q1) => q1.id === q.id), `Partida 2 repetiu pergunta da Partida 1 antes de esgotar pool!`)
    }
    recordUserQuestionBatch(smallPoolUser, m2.map((q) => q.id))

    // Partida 3: Faltam perguntas não vistas! (Restavam apenas 5).
    // O sistema deve:
    // - Pegar nas 5 não vistas restantes
    // - Preencher as outras 5 com as mais antigas da Partida 1 (NUNCA da Partida 2)
    // - Garantir 0 duplicados dentro da Partida 3!
    const h3 = getUserAnsweredHistory(smallPoolUser)
    const m3 = selectBalancedMatchQuestions(mockPool, 10, h3.seenSet, false, h3.recentOrder)
    assert.strictEqual(m3.length, 10, 'Partida 3 deveria ter 10 perguntas')

    const m3Ids = new Set(m3.map((q) => q.id))
    assert.strictEqual(m3Ids.size, 10, 'Partida 3 não pode ter duplicações internas!')

    // Verificar que as 5 perguntas que nunca tinham sido vistas (de mock_q_21 a mock_q_25) foram incluídas!
    const allSeenBeforeP3 = new Set([...m1.map((q) => q.id), ...m2.map((q) => q.id)])
    const unseenBeforeP3 = mockPool.filter((q) => !allSeenBeforeP3.has(q.id))
    assert.strictEqual(unseenBeforeP3.length, 5)

    for (const q of unseenBeforeP3) {
      assert(m3Ids.has(q.id), `Pergunta não vista ${q.id} deveria ter prioridade absoluta e estar na Partida 3!`)
    }

    // As restantes 5 perguntas recicladas devem vir da Partida 1 (as mais antigas), e NÃO da Partida 2 (mais recentes)!
    const m2Ids = new Set(m2.map((q) => q.id))
    const m1Ids = new Set(m1.map((q) => q.id))
    const recycledInM3 = m3.filter((q) => !unseenBeforeP3.some((u) => u.id === q.id))
    assert.strictEqual(recycledInM3.length, 5, 'Deveriam haver 5 perguntas recicladas')

    // Todas as recicladas devem vir da Partida 1
    for (const q of recycledInM3) {
      assert(m1Ids.has(q.id), `Pergunta reciclada ${q.id} deveria ter vindo da Partida 1 (mais antiga)!`)
      assert(!m2Ids.has(q.id), `Pergunta reciclada ${q.id} não deveria ter vindo da Partida 2 imediata!`)
    }
  })

  // -------------------------------------------------------------------------
  // TESTE 5: Aleatoriedade e Imprevisibilidade Real
  // -------------------------------------------------------------------------
  test('5. Aleatoriedade e imprevisibilidade real entre partidas limpas', () => {
    clearMemoryUserHistories()
    const m1 = selectBalancedMatchQuestions(pool, 10, new Set(), true, [])
    const m2 = selectBalancedMatchQuestions(pool, 10, new Set(), true, [])

    const m1Order = m1.map((q) => q.id).join(',')
    const m2Order = m2.map((q) => q.id).join(',')

    assert.notStrictEqual(m1Order, m2Order, 'Duas partidas aleatórias limpas não devem gerar exatamente a mesma sequência de perguntas!')
  })

  console.log('\n=================================================================')
  console.log(`  RESULTADOS: ${passedCount} / ${totalTests} TESTES PASSARAM COM SUCESSO.`)
  console.log('=================================================================\n')

  if (passedCount !== totalTests) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err)
  process.exit(1)
})
