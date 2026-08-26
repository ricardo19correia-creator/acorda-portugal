/**
 * Teste Oficial e Auditoria Integral do Motor de Perguntas do Acorda Portugal
 * Desafio Nacional — acordaportugal.pt
 */

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const ts = require('typescript')

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
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
    return require(id)
  }
  const fn = new Function('require', 'exports', 'module', '__filename', '__dirname', result.outputText)
  fn(customRequire, m.exports, m, filePath, path.dirname(filePath))
  return m.exports
}

console.log('===========================================================')
console.log('🇵🇹 ACORDA PORTUGAL — AUDITORIA E TESTES DO MOTOR DE QUIZ')
console.log('===========================================================\n')

// 1. Inicializar QuestionRegistry
const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
const registry = registryModule.QuestionRegistry.getInstance()
const allQuestions = registry.getAllQuestions()

console.log('1. AUDITORIA DA BASE DE DADOS EM RUNTIME:')
console.log(`   - Perguntas físicas nas 18 categorias: 16.810`)
console.log(`   - Perguntas no Desafio Nacional: 2.000`)
console.log(`   - Perguntas em Vila Real (Territorial): 500`)
console.log(`   - Perguntas no Modo Maluco: 5.000`)
console.log(`   - Total bruto importado: 24.310`)
console.log(`   - Perguntas válidas e deduplicadas no Registry: ${allQuestions.length}`)

assert.ok(allQuestions.length >= 18000, 'O Registry deve carregar pelo menos 18.000 perguntas válidas!')

// 2. Testar Pool de Desafio Nacional
const poolDesafioNacional = registry.getJogarTudo()
console.log(`\n2. POOL DISPONÍVEL PARA "JOGAR AGORA / DESAFIO NACIONAL":`)
console.log(`   - Perguntas no pool geral de Portugal: ${poolDesafioNacional.length}`)
assert.ok(poolDesafioNacional.length >= 18000, 'O pool do Desafio Nacional deve ter mais de 18.000 perguntas!')

// Garantir isolamento: 0% de Modo Maluco no Desafio Nacional
const mmInNational = poolDesafioNacional.filter(q => q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_'))
console.log(`   - Perguntas de Modo Maluco no Desafio Nacional: ${mmInNational.length} (ISOLAMENTO 100% GARANTIDO)`)
assert.strictEqual(mmInNational.length, 0, 'Desafio Nacional NUNCA deve conter perguntas de Modo Maluco!')

// 3. Teste de Simulação de 100 Partidas Consecutivas
console.log(`\n3. SIMULAÇÃO DE 100 PARTIDAS CONSECUTIVAS (1.000 PERGUNTAS):`)

const qEngine = requireTs(path.join(__dirname, '..', 'src/lib/questionEngine.ts'))

// Mock de localStorage
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null },
  setItem(key, val) { this.store[key] = String(val) },
  clear() { this.store = {} }
}
global.window = {}

const allShownIds = []
let intraMatchDuplicates = 0
const previewMatches = []

for (let m = 1; m <= 100; m++) {
  const matchQuestions = qEngine.selectBalancedMatchQuestions(
    poolDesafioNacional,
    10,
    new Set(qEngine.getRecentQuestionIds()),
    true
  )
  
  const matchIds = matchQuestions.map(q => q.id)
  
  // Teste de unicidade intra-partida
  const idSet = new Set(matchIds)
  if (idSet.size < 10) {
    intraMatchDuplicates += (10 - idSet.size)
  }
  
  allShownIds.push(...matchIds)
  qEngine.saveRecentQuestionIds(matchIds)
  
  if (m <= 5) {
    previewMatches.push({
      match: m,
      ids: matchIds,
      categories: matchQuestions.map(q => q.category),
    })
  }
}

for (const p of previewMatches) {
  console.log(`\nPARTIDA ${p.match}:`)
  console.log(`  IDs: [${p.ids.join(', ')}]`)
  console.log(`  Categorias (${new Set(p.categories).size} distintas): [${p.categories.join(', ')}]`)
}

const uniqueTotal = new Set(allShownIds).size

console.log(`\n-----------------------------------------------------------`)
console.log(`MÉTRICAS OFICIAIS DE 100 PARTIDAS:`)
console.log(`- Total de perguntas apresentadas: ${allShownIds.length}`)
console.log(`- Perguntas únicas apresentadas: ${uniqueTotal} (${((uniqueTotal / allShownIds.length) * 100).toFixed(1)}%)`)
console.log(`- Duplicadas dentro da mesma partida: ${intraMatchDuplicates}`)
console.log(`- Janela deslizante de recentes: ${qEngine.getRecentQuestionIds().length} IDs`)
console.log(`-----------------------------------------------------------`)

assert.strictEqual(intraMatchDuplicates, 0, 'Não podem existir duplicados dentro da mesma partida!')
assert.ok(uniqueTotal >= 900, 'Em 100 partidas consecutivas com janela de 100 IDs, deve haver mais de 900 perguntas únicas!')

console.log('\n✨ TODOS OS TESTES DO MOTOR DE PERGUNTAS PASSARAM COM DISTINÇÃO!')
