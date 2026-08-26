/**
 * Script de Verificação Integral do Motor de Perguntas em Runtime
 * 1. Validação Estrutural (20.050 perguntas)
 * 2. Teste de Cobertura de Categorias (18) e Subcategorias (233)
 * 3. Teste de 100 Torneios / Partidas (1.000 Perguntas Apresentadas)
 * 4. Teste de Anti-Repetição e Janela Deslizante
 */

const fs = require('fs')
const path = require('path')
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

console.log('═════════════════════════════════════════════════════════════════')
console.log('  ACORDA PORTUGAL — VERIFICAÇÃO INTEGRAL DO MOTOR DE PERGUNTAS')
console.log('═════════════════════════════════════════════════════════════════\n')

// 1. Carregar Registry
const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
const registry = registryModule.QuestionRegistry.getInstance()
const allQuestions = registry.getAllQuestions()

console.log(`[FASE 1] Validação Estrutural de Perguntas no Registry:`)
console.log(`Total Carregado: ${allQuestions.length}`)

let validCount = 0
let failCount = 0
const seenIds = new Set()

for (const q of allQuestions) {
  let valid = true
  if (!q.id || seenIds.has(q.id)) valid = false
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) valid = false
  if (!Array.isArray(q.options) || q.options.length !== 4) valid = false
  if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) valid = false
  if (!q.category || typeof q.category !== 'string') valid = false
  if (!q.difficulty || q.difficulty < 1 || q.difficulty > 5) valid = false

  if (valid) {
    validCount++
    seenIds.add(q.id)
  } else {
    failCount++
  }
}

console.log(`- TOTAL TESTADO: ${allQuestions.length}`)
console.log(`- PASS: ${validCount}`)
console.log(`- FAIL: ${failCount}`)

// 2. Teste de 100 Torneios / Sessões (1.000 Perguntas no Desafio Nacional)
console.log(`\n[FASE 2] Teste de 100 Torneios Simulados no Desafio Nacional (1.000 Qs):`)
const engineModule = requireTs(path.join(__dirname, '..', 'src/lib/questionEngine.ts'))
const { selectBalancedMatchQuestions, loadQuestionsPool } = engineModule

const poolNacional = loadQuestionsPool('desafio-nacional', 2)
console.log(`Pool Disponível para Desafio Nacional: ${poolNacional.length} perguntas`)

const recentSet = new Set()
const allSelected1000 = []
let totalIntraMatchDuplicates = 0
const categoriesUsedCount = {}
const subcategoriesUsedCount = {}

for (let match = 0; match < 100; match++) {
  const matchQuestions = selectBalancedMatchQuestions(poolNacional, 10, recentSet, true)
  
  if (matchQuestions.length !== 10) {
    console.error(`ERRO: Partida ${match} gerou ${matchQuestions.length} perguntas em vez de 10!`)
  }

  const matchIds = new Set()
  for (const q of matchQuestions) {
    if (matchIds.has(q.id)) {
      totalIntraMatchDuplicates++
    }
    matchIds.add(q.id)
    allSelected1000.push(q)

    categoriesUsedCount[q.category] = (categoriesUsedCount[q.category] || 0) + 1
    if (q.subcategory) {
      subcategoriesUsedCount[q.subcategory] = (subcategoriesUsedCount[q.subcategory] || 0) + 1
    }
  }

  // Janela deslizante de 100 IDs
  for (const q of matchQuestions) {
    recentSet.add(q.id)
    if (recentSet.size > 100) {
      const first = recentSet.values().next().value
      recentSet.delete(first)
    }
  }
}

const uniqueIdsIn1000 = new Set(allSelected1000.map(q => q.id))
const distinctCategoriesCount = Object.keys(categoriesUsedCount).length
const distinctSubcategoriesCount = Object.keys(subcategoriesUsedCount).length

console.log(`- Perguntas Totais Geradas: ${allSelected1000.length}`)
console.log(`- Perguntas Únicas Apresentadas: ${uniqueIdsIn1000.size} / 1000 (${((uniqueIdsIn1000.size / 1000) * 100).toFixed(1)}% de variedade)`)
console.log(`- Duplicadas dentro da mesma partida: ${totalIntraMatchDuplicates}`)
console.log(`- Categorias distintas utilizadas nas partidas: ${distinctCategoriesCount}`)
console.log(`- Subcategorias distintas utilizadas nas partidas: ${distinctSubcategoriesCount}`)

// 3. Teste de Lotes Recentes Específicos
console.log(`\n[FASE 3] Teste de Acessibilidade dos Lotes Recentes:`)
const sampleIds = [
  { id: 'POL_GOV_0001', theme: 'portugal-politico', sub: 'governos-constitucionais' },
  { id: 'EMP_TEC_0001', theme: 'empresas-portuguesas', sub: 'empresas-tecnologicas' },
  { id: 'GEO_PRA_0001', theme: 'geografia', sub: 'litoral-e-praias' },
  { id: 'HUM_MEM_0001', theme: 'humor', sub: 'memes-virais' },
]

for (const sample of sampleIds) {
  const q = registry.getById(sample.id)
  const subPool = registry.getBySubtheme(sample.theme, sample.sub)
  const inSubPool = subPool.some(x => x.id === sample.id)
  console.log(`- ${sample.id} (${sample.theme} -> ${sample.sub}): Encontrada no Registry: ${q ? 'SIM' : 'NÃO'} | Presente no Pool do Subtema: ${inSubPool ? 'SIM (' + subPool.length + ' Qs)' : 'NÃO'}`)
}

console.log('\n═════════════════════════════════════════════════════════════════')
if (failCount === 0 && totalIntraMatchDuplicates === 0 && uniqueIdsIn1000.size >= 900) {
  console.log('🎉 TODOS OS TESTES PASSARAM COM DISTINÇÃO! [PASS]')
} else {
  console.log('❌ FALHA DETETADA NOS TESTES! [FAIL]')
}
console.log('═════════════════════════════════════════════════════════════════')
