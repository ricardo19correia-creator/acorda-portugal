/**
 * Teste do Novo Motor Anti-Repetição com Janela Deslizante de 100 Partidas
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

// Algoritmo Fisher-Yates
function fisherYatesShuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Selecionador Balanceado com Janela Deslizante
function selectBalancedMatchQuestions(pool, count = 10, recentIds = new Set(), isNational = true) {
  // 1. Filtrar perguntas não recentes
  let available = pool.filter(q => !recentIds.has(q.id))
  
  // Se o pool disponível for menor que o necessário, relaxa o filtro recente gradualmente
  if (available.length < count) {
    available = pool
  }
  
  // 2. Se for Desafio Nacional, distribui pelas categorias
  if (isNational) {
    const byCat = new Map()
    for (const q of available) {
      const c = q.category || 'portugal'
      if (!byCat.has(c)) byCat.set(c, [])
      byCat.get(c).push(q)
    }
    
    // Baralha as categorias e as perguntas dentro de cada uma
    const categories = fisherYatesShuffle(Array.from(byCat.keys()))
    const selected = []
    const selectedIds = new Set()
    
    // Ronda 1: Uma pergunta por categoria
    for (const cat of categories) {
      if (selected.length >= count) break
      const catQuestions = fisherYatesShuffle(byCat.get(cat))
      const candidate = catQuestions.find(q => !selectedIds.has(q.id))
      if (candidate) {
        selected.push(candidate)
        selectedIds.add(candidate.id)
      }
    }
    
    // Se ainda faltarem, completa com as restantes baralhadas
    if (selected.length < count) {
      const remaining = fisherYatesShuffle(available.filter(q => !selectedIds.has(q.id)))
      for (const q of remaining) {
        if (selected.length >= count) break
        selected.push(q)
        selectedIds.add(q.id)
      }
    }
    
    return fisherYatesShuffle(selected)
  }
  
  // Para modo de categoria específica
  const shuffled = fisherYatesShuffle(available)
  return shuffled.slice(0, count)
}

console.log('=== TESTE DO NOVO MOTOR ANTI-REPETIÇÃO COM 100 PARTIDAS ===\n')

const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
const registry = registryModule.QuestionRegistry.getInstance()

const pool = registry.getJogarTudo(2)
console.log(`Pool total para Desafio Nacional (diff 2): ${pool.length} perguntas`)

const RECENT_BUFFER_SIZE = 100
let recentQueue = []
const allShown = []
let duplicateCountInsideMatches = 0

const previewMatches = []

for (let m = 1; m <= 100; m++) {
  const recentSet = new Set(recentQueue)
  const matchQuestions = selectBalancedMatchQuestions(pool, 10, recentSet, true)
  const matchIds = matchQuestions.map(q => q.id)
  
  // Verificar duplicados dentro da partida
  const idSet = new Set(matchIds)
  if (idSet.size < 10) {
    duplicateCountInsideMatches += (10 - idSet.size)
  }
  
  allShown.push(...matchIds)
  
  // Atualizar fila deslizante de recentes (máx 100)
  recentQueue.push(...matchIds)
  if (recentQueue.length > RECENT_BUFFER_SIZE) {
    recentQueue = recentQueue.slice(recentQueue.length - RECENT_BUFFER_SIZE)
  }
  
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

const uniqueTotal = new Set(allShown).size
console.log(`\n========================================`)
console.log(`TOTAL DE PERGUNTAS APRESENTADAS: ${allShown.length}`)
console.log(`PERGUNTAS ÚNICAS: ${uniqueTotal} (de ${allShown.length})`)
console.log(`DUPLICADAS DENTRO DAS PARTIDAS: ${duplicateCountInsideMatches}`)
console.log(`TAMANHO DA JANELA DESLIZANTE FINAL: ${recentQueue.length}`)
console.log(`========================================`)
