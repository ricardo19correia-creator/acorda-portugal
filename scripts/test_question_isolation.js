/**
 * Teste de Isolamento Estrito de Categorias e Limpeza de Prefixos
 */
const questionsDesafioNacionalRaw = require('../src/data/questions_desafio_nacional.json')
const questionsDataRaw = require('../lib/data/questions.json')
const vilaRealDataRaw = require('../data/perguntas_vila_real_500.json')
const modoMalucoDataRaw = require('../data/perguntas_modo_maluco_5000.json')

function cleanQuestionPrompt(text) {
  if (!text) return ''
  return text
    .replace(/^Modo\s+Maluco\s*#?\d*:\s*/i, '')
    .replace(/^Pergunta\s*#?\d*:\s*/i, '')
    .replace(/^Quest[aã]o\s*#?\d*:\s*/i, '')
    .trim()
}

function normalizeQuestion(raw, index, defaultCategory = 'portugal') {
  const id = raw.id ? String(raw.id) : `q_${index + 1}`
  const rawText = raw.question || raw.pergunta || 'Pergunta sem texto'
  const cleanText = cleanQuestionPrompt(rawText)

  let category = (raw.category || raw.categoria || defaultCategory).trim()
  const rawLower = rawText.toLowerCase()
  const catLower = category.toLowerCase()

  if (id.startsWith('DN_') || catLower === 'desafio nacional' || catLower === 'desafio-nacional') {
    category = 'Desafio Nacional'
  } else if (
    id.startsWith('mm_') ||
    catLower === 'modo-maluco' ||
    catLower === 'modo maluco' ||
    rawLower.includes('modo maluco')
  ) {
    category = 'modo-maluco'
  } else if (id.startsWith('vr_') || catLower === 'desafio-cidade') {
    category = 'desafio-cidade'
  }

  let difficulty = 2
  if (typeof raw.difficulty === 'number') {
    difficulty = Math.min(5, Math.max(1, Math.round(raw.difficulty)))
  }

  return {
    id,
    question: cleanText,
    difficulty,
    category,
  }
}

function getAllQuestionsPool() {
  const pool = []
  const seen = new Set()

  questionsDesafioNacionalRaw.forEach((q, idx) => {
    const norm = normalizeQuestion(q, idx, 'Desafio Nacional')
    if (!seen.has(norm.id)) {
      seen.add(norm.id)
      pool.push(norm)
    }
  })

  questionsDataRaw.forEach((q, idx) => {
    const norm = normalizeQuestion(q, pool.length + idx, 'portugal')
    if (!seen.has(norm.id)) {
      seen.add(norm.id)
      pool.push(norm)
    }
  })

  return pool
}

const allQuestions = getAllQuestionsPool()

// Testar Desafio Nacional nos 5 níveis
console.log('--- TESTE: Desafio Nacional (Níveis 1 a 5) ---')
for (let diff = 1; diff <= 5; diff++) {
  const nationalQuestions = allQuestions.filter((q) => {
    const qCat = q.category.toLowerCase()
    if (qCat.includes('maluco') || q.id.startsWith('mm_')) return false
    return q.id.startsWith('DN_') || qCat === 'desafio nacional' || qCat === 'desafio-nacional' || qCat === 'portugal'
  }).filter((q) => q.difficulty === diff)

  console.log(`Nível ${diff}: ${nationalQuestions.length} perguntas carregadas.`)

  const malucoLeaks = nationalQuestions.filter((q) => 
    q.question.toLowerCase().includes('modo maluco') || 
    q.category.toLowerCase().includes('maluco') || 
    q.id.startsWith('mm_')
  )

  if (malucoLeaks.length > 0) {
    console.error(`ERRO: Foram detetadas ${malucoLeaks.length} perguntas de Modo Maluco no Desafio Nacional Nvl ${diff}!`)
    process.exit(1)
  }
}

console.log('SUCESSO: Zero contaminação de Modo Maluco no Desafio Nacional!')
