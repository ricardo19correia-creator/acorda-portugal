/**
 * Script de Execução Real do QuestionRegistry
 */

const fs = require('fs')
const path = require('path')
const ts = require('typescript')

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8')
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    }
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
          if (fs.existsSync(path.join(resolved, 'index.json'))) return JSON.parse(fs.readFileSync(path.join(resolved, 'index.json'), 'utf8'))
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

console.log('🔄 A inicializar QuestionRegistry real...\n')

try {
  const registryModule = requireTs(path.join(__dirname, '..', 'lib/question-system/registry.ts'))
  const registry = registryModule.QuestionRegistry.getInstance()
  const allQuestions = registry.getAllQuestions()
  console.log(`✓ QuestionRegistry inicializado com ${allQuestions.length} perguntas válidas no pool global!`)

  // Testar getJogarTudo
  const jogarTudoDiff2 = registry.getJogarTudo(2)
  console.log(`✓ getJogarTudo(diff: 2) devolveu ${jogarTudoDiff2.length} perguntas`)

  const jogarTudoNoDiff = registry.getJogarTudo()
  console.log(`✓ getJogarTudo(sem diff) devolveu ${jogarTudoNoDiff.length} perguntas`)

  // Testar questionEngine
  const qEngineModule = requireTs(path.join(__dirname, '..', 'src/lib/questionEngine.ts'))
  const poolDesafioNacional = qEngineModule.loadQuestionsPool('desafio-nacional', 2)
  console.log(`✓ loadQuestionsPool('desafio-nacional', 2) devolveu ${poolDesafioNacional.length} perguntas`)

  // Estatísticas de categorias em getJogarTudo
  const catCount = {}
  for (const q of poolDesafioNacional) {
    catCount[q.category] = (catCount[q.category] || 0) + 1
  }
  console.log('\nDistribuição por categoria em loadQuestionsPool("desafio-nacional", 2):')
  console.log(catCount)

} catch (err) {
  console.error('❌ Erro durante teste do QuestionRegistry:', err)
}
