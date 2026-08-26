/**
 * Script de Auditoria de Dificuldade e Distribuição de Sessão
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

const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
const registry = registryModule.QuestionRegistry.getInstance()
const allQuestions = registry.getAllQuestions()

console.log('=== AUDITORIA DE DIFICULDADE (NVL 1 a 5) NO RUNTIME ===\n')

const diffCountsGlobal = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, other: 0 }
for (const q of allQuestions) {
  if (diffCountsGlobal[q.difficulty] !== undefined) {
    diffCountsGlobal[q.difficulty]++
  } else {
    diffCountsGlobal.other++
  }
}

console.log('1. Distribuição Global por Dificuldade:')
console.log(diffCountsGlobal)

const jogarTudoAll = registry.getJogarTudo()
console.log(`\n2. Pool Jogar Tudo (Desafio Nacional): ${jogarTudoAll.length} perguntas`)

for (let lvl = 1; lvl <= 5; lvl++) {
  const poolLvl = registry.getJogarTudo(lvl)
  const exact = poolLvl.filter(q => q.difficulty === lvl)
  console.log(`   - Nvl ${lvl}: ${poolLvl.length} perguntas no pool (${exact.length} exatas de dif ${lvl})`)
}

// Testar 100 simulações de partidas de 10 perguntas para cada nível de dificuldade
const engineModule = requireTs(path.join(__dirname, '..', 'src/lib/questionEngine.ts'))
const { selectBalancedMatchQuestions } = engineModule

console.log('\n3. Teste de 100 Partidas por Nível de Dificuldade (1.000 perguntas cada teste):')

for (let lvl = 1; lvl <= 5; lvl++) {
  const pool = registry.getJogarTudo(lvl)
  const recentSet = new Set()
  const matchQuestions = []
  let totalDupsInsideMatches = 0

  for (let match = 0; match < 100; match++) {
    const selected = selectBalancedMatchQuestions(pool, 10, recentSet, true)
    
    // Verificar duplicações dentro da partida
    const matchIds = new Set()
    for (const q of selected) {
      if (matchIds.has(q.id)) {
        totalDupsInsideMatches++
      }
      matchIds.add(q.id)
      matchQuestions.push(q)
    }

    // Atualizar recentSet (janela deslizante de 100)
    for (const q of selected) {
      recentSet.add(q.id)
      if (recentSet.size > 100) {
        const first = recentSet.values().next().value
        recentSet.delete(first)
      }
    }
  }

  const uniqueIds = new Set(matchQuestions.map(q => q.id))
  console.log(`   - Nível ${lvl}: 100 partidas (1.000 Qs geradas) -> ${uniqueIds.size} IDs únicos utilizados | Duplicados na mesma partida: ${totalDupsInsideMatches}`)
}
