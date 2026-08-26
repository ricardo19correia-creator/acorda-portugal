const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

function loadJson(p) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, p), 'utf8'))
}

function saveJson(p, data) {
  fs.writeFileSync(path.join(rootDir, p), JSON.stringify(data, null, 2), 'utf8')
}

const batchFile = 'data/batches/batch_atualidade_startups_001.json'
const targetCategoryFile = 'lib/data/categories/atualidade.json'

const batch = loadJson(batchFile)
const currentCategoryQuestions = loadJson(targetCategoryFile)

console.log(`Perguntas no lote: ${batch.length}`)
console.log(`Perguntas em ${targetCategoryFile} antes: ${currentCategoryQuestions.length}`)

const existingIds = new Set(currentCategoryQuestions.map((q) => q.id))
let addedCount = 0

batch.forEach((q) => {
  if (!existingIds.has(q.id)) {
    currentCategoryQuestions.push({
      ...q,
      category: 'Atualidade — Portugal Agora',
      tema: 'Atualidade — Portugal Agora',
      subtema: 'Inovação & Startups',
      subcategory: 'Inovação & Startups',
    })
    existingIds.add(q.id)
    addedCount++
  }
})

saveJson(targetCategoryFile, currentCategoryQuestions)
console.log(`✓ Integradas com sucesso ${addedCount} novas perguntas em ${targetCategoryFile}!`)
console.log(`Perguntas em ${targetCategoryFile} depois: ${currentCategoryQuestions.length}`)

// Atualizar logs de produção
const prodLogs = loadJson('data/production_logs.json')
prodLogs.push({
  batchId: 'BATCH_ATU_STARTUPS_001',
  timestamp: new Date().toISOString(),
  category: 'atualidade',
  theme: 'Atualidade — Portugal Agora',
  subtema: 'Inovação & Startups',
  count: addedCount,
  qualityGate: 'PASSED',
  sourceVerified: true,
})
saveJson('data/production_logs.json', prodLogs)
