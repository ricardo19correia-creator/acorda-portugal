/**
 * Script de Auditoria Canónica de Conteúdo e Deduplicação
 */

const fs = require('fs')
const path = require('path')

console.log('=== AUDITORIA DE CONTEÚDO CANÓNICO ===\n')

const categoryFiles = [
  'atualidade.json',
  'ciencia-tecnologia.json',
  'cinema-tv.json',
  'cultura.json',
  'desafio-visual.json',
  'desporto.json',
  'empresas-portuguesas.json',
  'futebol-portugues.json',
  'gastronomia.json',
  'geografia.json',
  'historia.json',
  'humor.json',
  'modo-maluco.json',
  'mundo.json',
  'musica.json',
  'personalidades.json',
  'portugal-politico.json',
  'portugal.json',
]

// Carregar perguntas das 18 categorias
let rawCategoryQuestions = 0
const seenQuestionTexts = new Map() // textHash -> question
const seenIds = new Map() // id -> question

function normalizeText(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/^modo\s+maluco\s*#?\d*:\s*/i, '')
    .replace(/^pergunta\s*#?\d*:\s*/i, '')
    .replace(/^quest[aã]o\s*#?\d*:\s*/i, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim()
}

const canonicalPool = []

for (const f of categoryFiles) {
  const p = path.join(__dirname, '..', 'lib/data/categories', f)
  const list = JSON.parse(fs.readFileSync(p, 'utf8'))
  rawCategoryQuestions += list.length
  
  for (const q of list) {
    const textKey = normalizeText(q.question || q.pergunta)
    if (!seenQuestionTexts.has(textKey)) {
      seenQuestionTexts.set(textKey, q)
      canonicalPool.push({ ...q, defaultCategory: f.replace('.json', '') })
    }
  }
}

console.log(`1. Perguntas nas 18 categorias: ${rawCategoryQuestions}`)
console.log(`   - Perguntas únicas por texto: ${seenQuestionTexts.size}`)

// Adicionar Desafio Nacional (2.000 Qs)
const dnPath = path.join(__dirname, '..', 'src/data/questions_desafio_nacional.json')
const dnList = JSON.parse(fs.readFileSync(dnPath, 'utf8'))
let dnAdded = 0
for (const q of dnList) {
  const textKey = normalizeText(q.question || q.pergunta)
  if (!seenQuestionTexts.has(textKey)) {
    seenQuestionTexts.set(textKey, q)
    canonicalPool.push({ ...q, defaultCategory: 'portugal' })
    dnAdded++
  }
}
console.log(`2. Desafio Nacional (2.000 Qs): ${dnAdded} únicas adicionadas ao pool`)

// Adicionar Modo Maluco 5.000
const mmPath = path.join(__dirname, '..', 'data/perguntas_modo_maluco_5000.json')
const mmList = JSON.parse(fs.readFileSync(mmPath, 'utf8'))
let mmAdded = 0
for (const q of mmList) {
  const textKey = normalizeText(q.question || q.pergunta)
  if (!seenQuestionTexts.has(textKey)) {
    seenQuestionTexts.set(textKey, q)
    canonicalPool.push({ ...q, defaultCategory: 'modo-maluco' })
    mmAdded++
  }
}
console.log(`3. Modo Maluco 5.000: ${mmAdded} únicas adicionadas ao pool`)

// Adicionar Vila Real 500
const vrPath = path.join(__dirname, '..', 'data/perguntas_vila_real_500.json')
const vrList = JSON.parse(fs.readFileSync(vrPath, 'utf8'))
let vrAdded = 0
for (const q of vrList) {
  const textKey = normalizeText(q.question || q.pergunta)
  if (!seenQuestionTexts.has(textKey)) {
    seenQuestionTexts.set(textKey, q)
    canonicalPool.push({ ...q, defaultCategory: 'desafio-cidade', city: 'Vila Real', district: 'Vila Real' })
    vrAdded++
  }
}
console.log(`4. Vila Real 500: ${vrAdded} únicas adicionadas ao pool`)

console.log(`\nTOTAL DE PERGUNTAS CANÓNICAS ÚNICAS: ${canonicalPool.length}`)
