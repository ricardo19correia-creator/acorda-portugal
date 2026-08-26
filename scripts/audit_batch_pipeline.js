/**
 * Script de Auditoria da Pipeline de Lotes (data/batches) vs Categorias vs Runtime
 */

const fs = require('fs')
const path = require('path')

console.log('=== AUDITORIA DE LOTES (data/batches) VS CATEGORIAS VS RUNTIME ===\n')

const batchesDir = path.join(__dirname, '..', 'data/batches')
const batchFiles = fs.readdirSync(batchesDir).filter(f => f.endsWith('.json'))

console.log(`1. Ficheiros de lotes em data/batches/: ${batchFiles.length}`)

let totalBatchQuestions = 0
const batchQuestionsMap = new Map() // id -> question

for (const f of batchFiles) {
  const fullPath = path.join(batchesDir, f)
  const list = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  if (Array.isArray(list)) {
    totalBatchQuestions += list.length
    for (const q of list) {
      if (q && q.id) {
        batchQuestionsMap.set(q.id, { ...q, batchFile: f })
      }
    }
  }
}

console.log(`   - Total de perguntas nos lotes: ${totalBatchQuestions}`)
console.log(`   - Total de IDs únicos nos lotes: ${batchQuestionsMap.size}`)

// Inspecionar as 18 categorias oficiais em lib/data/categories/
const catDir = path.join(__dirname, '..', 'lib/data/categories')
const catFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.json'))
let totalCatQuestions = 0
const catQuestionsMap = new Map() // id -> question

for (const f of catFiles) {
  const fullPath = path.join(catDir, f)
  const list = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  if (Array.isArray(list)) {
    totalCatQuestions += list.length
    for (const q of list) {
      if (q && q.id) {
        catQuestionsMap.set(q.id, { ...q, catFile: f })
      }
    }
  }
}

console.log(`\n2. Ficheiros de categorias em lib/data/categories/: ${catFiles.length}`)
console.log(`   - Total de perguntas em lib/data/categories/: ${totalCatQuestions}`)
console.log(`   - Total de IDs únicos em lib/data/categories/: ${catQuestionsMap.size}`)

// Verificar quantos IDs de lotes estão nas categorias
let batchesInCategories = 0
let batchesMissingFromCategories = []

for (const [id, q] of batchQuestionsMap.entries()) {
  if (catQuestionsMap.has(id)) {
    batchesInCategories++
  } else {
    batchesMissingFromCategories.push({ id, batchFile: q.batchFile, tema: q.tema || q.category, subtema: q.subtema || q.subcategory })
  }
}

console.log(`\n3. Cruzamento Lotes vs Categorias:`)
console.log(`   - Perguntas de lotes presentes em lib/data/categories/: ${batchesInCategories}`)
console.log(`   - Perguntas de lotes AUSENTES de lib/data/categories/: ${batchesMissingFromCategories.length}`)

if (batchesMissingFromCategories.length > 0) {
  console.log(`\nExemplo de perguntas de lotes ausentes:`)
  console.log(batchesMissingFromCategories.slice(0, 10))
}

// Testar especificamente os 4 exemplos citados pelo utilizador:
const sampleIds = ['POL_GOV_0001', 'EMP_TEC_0001', 'GEO_PRA_0001', 'HUM_MEM_0001']
console.log('\n4. Verificação dos 4 IDs citados pelo utilizador:')
for (const id of sampleIds) {
  const inBatch = batchQuestionsMap.has(id)
  const inCat = catQuestionsMap.has(id)
  console.log(`   - ${id}: no batch? ${inBatch ? 'SIM (' + batchQuestionsMap.get(id).batchFile + ')' : 'NÃO'} | no category JSON? ${inCat ? 'SIM (' + catQuestionsMap.get(id).catFile + ')' : 'NÃO'}`)
}
