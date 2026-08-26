const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()

function loadJson(p) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, p), 'utf8'))
}

function saveJson(p, data) {
  fs.writeFileSync(path.join(rootDir, p), JSON.stringify(data, null, 2), 'utf8')
}

// 1. Corrigir batch
const batchPath = 'data/batches/batch_cinema_tv_novelas_001.json'
const batch = loadJson(batchPath)
batch.forEach((q) => {
  q.subtema = 'Televisão Portuguesa'
  q.subcategory = 'Televisão Portuguesa'
})
saveJson(batchPath, batch)

// 2. Corrigir cinema-tv.json
const catPath = 'lib/data/categories/cinema-tv.json'
const cat = loadJson(catPath)
let count = 0
cat.forEach((q) => {
  if (q.id && q.id.startsWith('TV_NOV_')) {
    q.subtema = 'Televisão Portuguesa'
    q.subcategory = 'Televisão Portuguesa'
    count++
  }
})
saveJson(catPath, cat)
console.log(`✓ Atualizadas ${count} perguntas para subtema 'Televisão Portuguesa' em cinema-tv.json`)
