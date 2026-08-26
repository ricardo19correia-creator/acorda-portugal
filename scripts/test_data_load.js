/**
 * Script de Simulação e Descoberta da Causa Raiz
 */

const fs = require('fs')
const path = require('path')

// Carregar ficheiros de dados
const catFiles = [
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

console.log('=== TESTE DE INICIALIZAÇÃO DA BASE DE DADOS ===\n')

let totalCatQuestions = 0
for (const f of catFiles) {
  const p = path.join(__dirname, '..', 'lib/data/categories', f)
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'))
    totalCatQuestions += data.length
    console.log(`✓ ${f}: ${data.length} perguntas`)
  } else {
    console.error(`❌ Ficheiro não encontrado: ${f}`)
  }
}

console.log(`\nTotal em lib/data/categories/: ${totalCatQuestions}`)

const desafioNacionalPath = path.join(__dirname, '..', 'src/data/questions_desafio_nacional.json')
let dnCount = 0
if (fs.existsSync(desafioNacionalPath)) {
  const dn = JSON.parse(fs.readFileSync(desafioNacionalPath, 'utf8'))
  dnCount = dn.length
  console.log(`✓ questions_desafio_nacional.json: ${dnCount} perguntas`)
}

const questionsJsonPath = path.join(__dirname, '..', 'lib/data/questions.json')
let qJsonCount = 0
if (fs.existsSync(questionsJsonPath)) {
  const qj = JSON.parse(fs.readFileSync(questionsJsonPath, 'utf8'))
  qJsonCount = qj.length
  console.log(`✓ lib/data/questions.json: ${qJsonCount} perguntas`)
}

console.log(`\nSoma de todas as fontes: ${totalCatQuestions + dnCount + qJsonCount}`)
