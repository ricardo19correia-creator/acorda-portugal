/**
 * Investigação Profunda da Causa Raiz da Repetição de Perguntas
 */

const fs = require('fs')
const path = require('path')

console.log('=== INVESTIGAÇÃO PROFUNDA DA CAUSA RAIZ ===\n')

// 1. Inspecionar lib/data/questions.json
const qJsonPath = path.join(__dirname, '..', 'lib/data/questions.json')
const qJson = JSON.parse(fs.readFileSync(qJsonPath, 'utf8'))
console.log(`1. lib/data/questions.json: ${qJson.length} perguntas`)

// Verificar distribuição de temas e subtemas em questions.json
const qJsonCats = {}
const qJsonIds = new Set()
let qJsonDupIds = 0
let qJsonNoId = 0

for (let i = 0; i < qJson.length; i++) {
  const q = qJson[i]
  const cat = q.category || q.categoria || 'Sem Categoria'
  qJsonCats[cat] = (qJsonCats[cat] || 0) + 1
  if (!q.id) {
    qJsonNoId++
  } else {
    if (qJsonIds.has(q.id)) {
      qJsonDupIds++
    }
    qJsonIds.add(q.id)
  }
}
console.log(`   - Categorias em questions.json:`, Object.keys(qJsonCats).length)
console.log(`   - Perguntas sem ID: ${qJsonNoId}`)
console.log(`   - IDs duplicados em questions.json: ${qJsonDupIds}`)
console.log(`   - IDs únicos em questions.json: ${qJsonIds.size}`)

// 2. Inspecionar as 18 categorias oficiais em lib/data/categories/
const catFiles = fs.readdirSync(path.join(__dirname, '..', 'lib/data/categories')).filter(f => f.endsWith('.json'))
console.log(`\n2. Categorias em lib/data/categories/ (${catFiles.length} ficheiros):`)
let totalCatQs = 0
const allCatIds = new Set()
let catDupIds = 0

for (const f of catFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib/data/categories', f), 'utf8'))
  totalCatQs += data.length
  for (const q of data) {
    if (allCatIds.has(q.id)) {
      catDupIds++
    }
    allCatIds.add(q.id)
  }
  console.log(`   - ${f}: ${data.length} perguntas`)
}
console.log(`   - Total perguntas nas categorias: ${totalCatQs}`)
console.log(`   - IDs únicos entre categorias: ${allCatIds.size}`)
console.log(`   - IDs duplicados entre categorias: ${catDupIds}`)

// 3. Inspecionar src/data/questions_desafio_nacional.json
const dnPath = path.join(__dirname, '..', 'src/data/questions_desafio_nacional.json')
const dnData = JSON.parse(fs.readFileSync(dnPath, 'utf8'))
console.log(`\n3. src/data/questions_desafio_nacional.json: ${dnData.length} perguntas`)
const dnIds = new Set()
let dnDups = 0
for (const q of dnData) {
  if (dnIds.has(q.id)) dnDups++
  dnIds.add(q.id)
}
console.log(`   - IDs únicos em desafio nacional: ${dnIds.size}`)

// 4. Cruzamento entre datasets: Há sobreposição de IDs?
let overlapDnCat = 0
for (const id of dnIds) {
  if (allCatIds.has(id)) overlapDnCat++
}
console.log(`\n4. Sobreposição de IDs entre Desafio Nacional e Categorias: ${overlapDnCat}`)

let overlapQJsonCat = 0
for (const id of qJsonIds) {
  if (allCatIds.has(id)) overlapQJsonCat++
}
console.log(`5. Sobreposição de IDs entre questions.json e Categorias: ${overlapQJsonCat}`)
