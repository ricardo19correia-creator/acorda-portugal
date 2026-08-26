/**
 * Script para inspecionar a validação de cada dataset
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

const { validateQuestion } = requireTs(path.join(__dirname, '..', 'lib/question-system/validator.ts'))

const catFiles = fs.readdirSync(path.join(__dirname, '..', 'lib/data/categories')).filter(f => f.endsWith('.json'))

console.log('=== VALIDAÇÃO DOS FICHEIROS DAS CATEGORIAS ===\n')

let totalValid = 0
let totalInvalid = 0
const invalidReasons = {}

for (const f of catFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib/data/categories', f), 'utf8'))
  let validCount = 0
  let invalidCount = 0

  for (const q of data) {
    const res = validateQuestion({ ...q, defaultCategory: f.replace('.json', '') })
    if (res.valid) {
      validCount++
      totalValid++
    } else {
      invalidCount++
      totalInvalid++
      for (const err of res.errors) {
        invalidReasons[err.code] = (invalidReasons[err.code] || 0) + 1
      }
    }
  }
  console.log(`${f}: ${validCount} válidas / ${invalidCount} inválidas (total ${data.length})`)
}

console.log(`\nTotal Válidas: ${totalValid}, Total Inválidas: ${totalInvalid}`)
console.log('Erros de validação encontrados:', invalidReasons)
