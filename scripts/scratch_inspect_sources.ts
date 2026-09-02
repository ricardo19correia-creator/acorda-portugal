import fs from 'fs'
import path from 'path'

const rootDir = process.cwd()

function loadJson(relPath: string) {
  const p = path.join(rootDir, relPath)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (e: any) {
    console.error(`Error loading ${relPath}:`, e.message)
    return null
  }
}

const categoryFiles = [
  'lib/data/categories/atualidade.json',
  'lib/data/categories/ciencia-tecnologia.json',
  'lib/data/categories/cinema-tv.json',
  'lib/data/categories/cultura.json',
  'lib/data/categories/desafio-visual.json',
  'lib/data/categories/desporto.json',
  'lib/data/categories/empresas-portuguesas.json',
  'lib/data/categories/futebol-portugues.json',
  'lib/data/categories/gastronomia.json',
  'lib/data/categories/geografia.json',
  'lib/data/categories/historia.json',
  'lib/data/categories/humor.json',
  'lib/data/categories/modo-maluco.json',
  'lib/data/categories/mundo.json',
  'lib/data/categories/musica.json',
  'lib/data/categories/personalidades.json',
  'lib/data/categories/portugal-politico.json',
  'lib/data/categories/portugal.json',
]

const otherFiles = [
  'src/data/questions_desafio_nacional.json',
  'data/questions_desafio_nacional.json',
  'data/perguntas_vila_real_500.json',
  'lib/data/perguntas_vila_real_500.json',
  'src/data/perguntas_vila_real_500.json',
  'data/perguntas_modo_maluco_5000.json',
  'lib/data/perguntas_modo_maluco_5000.json',
  'src/data/perguntas_modo_maluco_5000.json',
  'lib/data/questions.json',
  'lib/data/questions-backup.json',
  'lib/data/Portugal.json',
  'data/pilot_batch_50.json',
]

console.log('=== FILE INVENTORY AND SIZES ===')
let catSum = 0
for (const f of categoryFiles) {
  const data = loadJson(f)
  const len = Array.isArray(data) ? data.length : 0
  catSum += len
  console.log(`CAT FILE: ${f} -> ${len} items`)
}
console.log(`TOTAL 18 CATEGORY FILES: ${catSum}`)

console.log('\n=== OTHER QUESTION FILES ===')
for (const f of otherFiles) {
  const data = loadJson(f)
  console.log(`OTHER FILE: ${f} -> ${Array.isArray(data) ? data.length : 'not array'} items`)
}

// Check batch files in data/batches/
const batchDir = path.join(rootDir, 'data/batches')
if (fs.existsSync(batchDir)) {
  const batches = fs.readdirSync(batchDir).filter(f => f.endsWith('.json'))
  let batchTotal = 0
  for (const b of batches) {
    const data = loadJson(`data/batches/${b}`)
    if (Array.isArray(data)) batchTotal += data.length
  }
  console.log(`\nBATCH FILES in data/batches/ (${batches.length} files) -> ${batchTotal} total items`)
}
