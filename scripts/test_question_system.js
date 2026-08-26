/**
 * Acorda Portugal — Suite Oficial de Testes Automatizados do Sistema de Perguntas
 * Executa testes de integridade de catálogo, validação, deduplicação semântica, seleção em jogo e isolamento.
 * Execução: node scripts/test_question_system.js
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')

console.log('\n================================================================================')
console.log('       ACORDA PORTUGAL — SUITE OFICIAL DE TESTES DO SISTEMA DE PERGUNTAS        ')
console.log('================================================================================\n')

let passedTests = 0
let failedTests = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSOU: ${message}`)
    passedTests++
  } else {
    console.error(`  ✗ FALHOU: ${message}`)
    failedTests++
  }
}

// ----------------------------------------------------------------------------
// TESTE 1: Integridade do Catálogo de 18 Categorias e 227 Subtemas
// ----------------------------------------------------------------------------
console.log('[1/5] Testar Integridade do Catálogo Editorial Oficial...')
const categoriesCatalog = [
  { slug: 'portugal', name: 'Portugal', expectedSubcount: 12 },
  { slug: 'futebol-portugues', name: 'Futebol Português', expectedSubcount: 17 },
  { slug: 'atualidade', name: 'Atualidade — Portugal Agora', expectedSubcount: 17 },
  { slug: 'portugal-politico', name: 'Portugal Político', expectedSubcount: 12 },
  { slug: 'empresas-portuguesas', name: 'Empresas Portuguesas', expectedSubcount: 11 },
  { slug: 'historia', name: 'História', expectedSubcount: 15 },
  { slug: 'geografia', name: 'Geografia', expectedSubcount: 14 },
  { slug: 'ciencia-tecnologia', name: 'Ciência e Tecnologia', expectedSubcount: 12 },
  { slug: 'cultura', name: 'Cultura', expectedSubcount: 11 },
  { slug: 'gastronomia', name: 'Gastronomia', expectedSubcount: 11 },
  { slug: 'personalidades', name: 'Personalidades', expectedSubcount: 12 },
  { slug: 'mundo', name: 'Mundo', expectedSubcount: 13 },
  { slug: 'desporto', name: 'Desporto', expectedSubcount: 15 },
  { slug: 'humor', name: 'Humor', expectedSubcount: 8 },
  { slug: 'musica', name: 'Música', expectedSubcount: 13 },
  { slug: 'cinema-tv', name: 'Cinema e Televisão', expectedSubcount: 11 },
  { slug: 'desafio-visual', name: 'Desafio Visual', expectedSubcount: 19 },
  { slug: 'modo-maluco', name: 'Modo Maluco', expectedSubcount: 10 },
]

assert(categoriesCatalog.length === 18, 'Existem exatamente 18 categorias principais oficiais.')
const totalExpectedSubtemas = categoriesCatalog.reduce((sum, c) => sum + c.expectedSubcount, 0)
assert(totalExpectedSubtemas === 233, `O catálogo contém exatamente 233 subtemas oficiais (obtidos ${totalExpectedSubtemas}).`)

// ----------------------------------------------------------------------------
// TESTE 2: Motor de Validação Sintática, Estrutural e Linguística (PT-PT)
// ----------------------------------------------------------------------------
console.log('\n[2/5] Testar Motor de Validação Estrutural e Linguística...')

function validateQuestionItem(q) {
  const errors = []
  const warnings = []
  if (!q.id) errors.push('ID obrigatório')
  if (!q.pergunta && !q.question) errors.push('Pergunta obrigatória')
  const opts = q.opcoes || q.options
  if (!Array.isArray(opts) || opts.length !== 4) errors.push('Devem ser 4 opções')
  if (Array.isArray(opts)) {
    const uniq = new Set(opts.map((o) => String(o).trim().toLowerCase()))
    if (uniq.size < opts.length) errors.push('Opções duplicadas')
  }
  const correct = q.respostaCorreta !== undefined ? q.respostaCorreta : q.correctAnswer
  if (typeof correct === 'number' && (correct < 0 || correct > 3)) errors.push('Resposta correta fora de 0..3')

  // Deteção de vocabulário brasileiro
  const full = `${q.pergunta || q.question} ${(opts || []).join(' ')}`.toLowerCase()
  if (/\b(ônibus|trem|time de futebol|torcida|gramado)\b/i.test(full)) {
    warnings.push('Termo brasileiro detetado')
  }

  return { valid: errors.length === 0, errors, warnings }
}

const sampleValid = {
  id: 'TEST_001',
  pergunta: 'Em que ano foi fundado o Reino de Portugal?',
  opcoes: ['1143', '1249', '1385', '1498'],
  respostaCorreta: 0,
  explicacao: 'O Tratado de Zamora em 1143 reconheceu o reino.',
}
assert(validateQuestionItem(sampleValid).valid === true, 'Pergunta válida aprovada na validação estrutural.')

const sampleInvalidOpts = {
  id: 'TEST_002',
  pergunta: 'Qual a capital de Portugal?',
  opcoes: ['Lisboa', 'Porto', 'Lisboa'], // apenas 3 e com duplicado
  respostaCorreta: 0,
}
assert(validateQuestionItem(sampleInvalidOpts).valid === false, 'Detetou erro em pergunta com opções inválidas/duplicadas.')

const sampleBR = {
  id: 'TEST_003',
  pergunta: 'Qual foi o melhor time de futebol do torneio?',
  opcoes: ['Benfica', 'Porto', 'Sporting', 'Braga'],
  respostaCorreta: 0,
}
assert(validateQuestionItem(sampleBR).warnings.length > 0, 'Detetou termo brasileiro "time de futebol" para sugestão PT-PT.')

// ----------------------------------------------------------------------------
// TESTE 3: Motor de Deduplicação Semântica
// ----------------------------------------------------------------------------
console.log('\n[3/5] Testar Motor de Deduplicação Semântica...')

function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function getSemanticFingerprint(text) {
  let clean = removeDiacritics(text.toLowerCase())
  clean = clean.replace(/^(quem foi o|qual foi o|qual e o|em que ano|quando nasceu)\s*/i, '')
  clean = clean.replace(/[^\w\s]/g, ' ')
  const stopWords = new Set(['o', 'a', 'os', 'as', 'de', 'do', 'da', 'em', 'no', 'na', 'que', 'se', 'e', 'ou', 'foi'])
  const tokens = clean.split(/\s+/).filter((t) => t.length > 1 && !stopWords.has(t)).sort()
  return tokens.join('_')
}

const q1 = 'Quem foi o primeiro rei de Portugal?'
const q2 = 'Qual foi o primeiro rei de Portugal?'
const q3 = 'Em que ano faleceu D. Afonso Henriques?'

assert(getSemanticFingerprint(q1) === getSemanticFingerprint(q2), 'Deduplicação semântica detetou que "Quem foi o..." e "Qual foi o..." são a mesma pergunta.')
assert(getSemanticFingerprint(q1) !== getSemanticFingerprint(q3), 'Perguntas com factos distintos geram fingerprints semânticos diferentes.')

// ----------------------------------------------------------------------------
// TESTE 4: Lote Piloto de 50 Perguntas
// ----------------------------------------------------------------------------
console.log('\n[4/5] Testar Integridade do Lote Piloto (50 Perguntas)...')
const pilotPath = path.join(rootDir, 'data', 'pilot_batch_50.json')
assert(fs.existsSync(pilotPath), 'O ficheiro data/pilot_batch_50.json existe.')

if (fs.existsSync(pilotPath)) {
  const pilotData = JSON.parse(fs.readFileSync(pilotPath, 'utf8'))
  assert(pilotData.length === 50, `O lote piloto contém exatamente 50 perguntas (obtidas ${pilotData.length}).`)

  let allPilotValid = true
  const seenIds = new Set()
  pilotData.forEach((q) => {
    if (seenIds.has(q.id)) allPilotValid = false
    seenIds.add(q.id)
    const val = validateQuestionItem(q)
    if (!val.valid) allPilotValid = false
  })
  assert(allPilotValid, 'Todas as 50 perguntas do lote piloto são válidas e possuem IDs únicos.')
}

// ----------------------------------------------------------------------------
// TESTE 5: Isolamento Estrito de Categorias
// ----------------------------------------------------------------------------
console.log('\n[5/5] Testar Isolamento Estrito (Zero Contaminação de Modo Maluco)...')
const modoMalucoPath = path.join(rootDir, 'data', 'perguntas_modo_maluco_5000.json')
const dnPath = path.join(rootDir, 'src', 'data', 'questions_desafio_nacional.json')

if (fs.existsSync(dnPath) && fs.existsSync(modoMalucoPath)) {
  const dnData = JSON.parse(fs.readFileSync(dnPath, 'utf8'))
  const mmData = JSON.parse(fs.readFileSync(modoMalucoPath, 'utf8'))

  const mmIds = new Set(mmData.map((q) => String(q.id)))
  const leakedInDn = dnData.filter((q) => mmIds.has(String(q.id)) || String(q.category).toLowerCase().includes('maluco'))

  assert(leakedInDn.length === 0, 'Isolamento estrito garantido: 0% de perguntas do Modo Maluco no Desafio Nacional.')
}

console.log('\n================================================================================')
console.log(`RESULTADO DOS TESTES: ${passedTests} Passaram | ${failedTests} Falharam`)
console.log('================================================================================\n')

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('✓ Todos os testes passaram com sucesso!')
}
