/**
 * Script de Auditoria Completa das Perguntas do Acorda Portugal
 */

const fs = require('fs')
const path = require('path')

console.log('=== AUDITORIA COMPLETA DE PERGUNTAS ===\n')

// 1. Procurar todos os ficheiros JSON de perguntas no projeto
const searchDirs = [
  'lib/data',
  'lib/data/categories',
  'data',
  'src/data',
]

const filesFound = []

function scanDir(dir) {
  const fullDir = path.join(__dirname, '..', dir)
  if (!fs.existsSync(fullDir)) return
  const files = fs.readdirSync(fullDir)
  for (const f of files) {
    const fullPath = path.join(fullDir, f)
    const stat = fs.statSync(fullPath)
    if (stat.isFile() && f.endsWith('.json')) {
      filesFound.push({
        relPath: path.relative(path.join(__dirname, '..'), fullPath),
        fullPath,
        size: stat.size,
      })
    }
  }
}

for (const d of searchDirs) {
  scanDir(d)
}

console.log(`Ficheiros JSON encontrados (${filesFound.length}):\n`)

let totalPhysicalQuestions = 0
const datasetSummary = []

for (const file of filesFound) {
  try {
    const content = JSON.parse(fs.readFileSync(file.fullPath, 'utf8'))
    if (Array.isArray(content)) {
      const count = content.length
      totalPhysicalQuestions += count
      datasetSummary.push({
        file: file.relPath,
        count,
        sample: content[0] ? {
          id: content[0].id,
          cat: content[0].category || content[0].categoria || content[0].tema,
          sub: content[0].subcategory || content[0].subcategoria,
          q: (content[0].question || content[0].pergunta || '').substring(0, 40) + '...',
        } : null,
      })
      console.log(`📄 ${file.relPath}: ${count} perguntas (Tamanho: ${(file.size / 1024).toFixed(1)} KB)`)
    } else if (content && typeof content === 'object') {
      const keys = Object.keys(content)
      console.log(`ℹ️ ${file.relPath}: Objeto JSON com chaves [${keys.slice(0, 5).join(', ')}]`)
    }
  } catch (err) {
    console.error(`❌ Erro ao ler ${file.relPath}: ${err.message}`)
  }
}

console.log(`\nTOTAL DE PERGUNTAS FÍSICAS EM ARRAYS JSON: ${totalPhysicalQuestions}\n`)
