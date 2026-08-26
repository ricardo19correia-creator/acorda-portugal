/**
 * Simulação de 100 partidas consecutivas com o motor atual
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

const qEngine = requireTs(path.join(__dirname, '..', 'src/lib/questionEngine.ts'))

// Mock de localStorage
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null },
  setItem(key, val) { this.store[key] = String(val) },
  clear() { this.store = {} }
}
global.window = {}

async function simulateMatches(numMatches = 100) {
  console.log(`=== SIMULAÇÃO DE ${numMatches} PARTIDAS CONSECUTIVAS ===\n`)
  
  const allShownQuestionIds = []
  const matchHistories = []
  let intraMatchDuplicates = 0
  
  for (let match = 1; match <= numMatches; match++) {
    const questions = await qEngine.getUniqueMatchQuestions('test_user_1', 'desafio-nacional', 2, 10)
    const matchIds = questions.map(q => q.id)
    
    // Verificar duplicados dentro da mesma partida
    const matchIdSet = new Set(matchIds)
    if (matchIdSet.size < matchIds.length) {
      intraMatchDuplicates += (matchIds.length - matchIdSet.size)
    }
    
    allShownQuestionIds.push(...matchIds)
    matchHistories.push(matchIds)
    
    // Simular que o utilizador respondeu às perguntas (grava no localStorage)
    await qEngine.saveAnsweredQuestions('test_user_1', matchIds)
    
    if (match <= 5) {
      console.log(`PARTIDA ${match}: [${matchIds.slice(0, 5).join(', ')}, ...] (Total: ${matchIds.length})`)
    }
  }
  
  const uniqueIds = new Set(allShownQuestionIds)
  console.log(`\nResultados:`)
  console.log(`Total de perguntas apresentadas em ${numMatches} partidas: ${allShownQuestionIds.length}`)
  console.log(`Perguntas únicas apresentadas: ${uniqueIds.size}`)
  console.log(`Duplicadas dentro da mesma partida: ${intraMatchDuplicates}`)
  console.log(`Perguntas no localStorage após ${numMatches} partidas:`, JSON.parse(global.localStorage.getItem('answered_question_ids')).length)
}

simulateMatches(100)
