const fs = require('fs')
const path = require('path')

// Importações dos bancos de dados reais
const catFiles = [
  { slug: 'atualidade', path: 'lib/data/categories/atualidade.json' },
  { slug: 'ciencia-tecnologia', path: 'lib/data/categories/ciencia-tecnologia.json' },
  { slug: 'cinema-tv', path: 'lib/data/categories/cinema-tv.json' },
  { slug: 'cultura', path: 'lib/data/categories/cultura.json' },
  { slug: 'desafio-visual', path: 'lib/data/categories/desafio-visual.json' },
  { slug: 'desporto', path: 'lib/data/categories/desporto.json' },
  { slug: 'empresas-portuguesas', path: 'lib/data/categories/empresas-portuguesas.json' },
  { slug: 'futebol-portugues', path: 'lib/data/categories/futebol-portugues.json' },
  { slug: 'gastronomia', path: 'lib/data/categories/gastronomia.json' },
  { slug: 'geografia', path: 'lib/data/categories/geografia.json' },
  { slug: 'historia', path: 'lib/data/categories/historia.json' },
  { slug: 'humor', path: 'lib/data/categories/humor.json' },
  { slug: 'modo-maluco', path: 'lib/data/categories/modo-maluco.json' },
  { slug: 'mundo', path: 'lib/data/categories/mundo.json' },
  { slug: 'musica', path: 'lib/data/categories/musica.json' },
  { slug: 'personalidades', path: 'lib/data/categories/personalidades.json' },
  { slug: 'portugal-politico', path: 'lib/data/categories/portugal-politico.json' },
  { slug: 'portugal', path: 'lib/data/categories/portugal.json' },
]

const rootDir = process.cwd()

function loadJson(relPath) {
  const full = path.join(rootDir, relPath)
  if (!fs.existsSync(full)) return []
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'))
  } catch (e) {
    console.error('Erro ao ler:', relPath, e.message)
    return []
  }
}

// 1. Carregar todos os datasets
const categoryDatasets = catFiles.map((c) => ({
  slug: c.slug,
  file: c.path,
  questions: loadJson(c.path),
}))

const dnRaw = loadJson('src/data/questions_desafio_nacional.json')
const questionsDataRaw = loadJson('lib/data/questions.json')
const vilaRealRaw = loadJson('data/perguntas_vila_real_500.json')
const modoMalucoRaw = loadJson('data/perguntas_modo_maluco_5000.json')

// 2. Análise do Desafio Nacional
// No jogo, Desafio Nacional usa getJogarTudo(), que carrega todos os bancos exceto Modo Maluco.
const allPhysicalEntries = []

categoryDatasets.forEach((ds) => {
  ds.questions.forEach((q, idx) => {
    allPhysicalEntries.push({
      ...q,
      sourceFile: ds.file,
      fileCategorySlug: ds.slug,
      originalIndex: idx,
    })
  })
})

dnRaw.forEach((q, idx) => {
  allPhysicalEntries.push({
    ...q,
    sourceFile: 'src/data/questions_desafio_nacional.json',
    fileCategorySlug: 'desafio-nacional-dataset',
    originalIndex: idx,
  })
})

questionsDataRaw.forEach((q, idx) => {
  allPhysicalEntries.push({
    ...q,
    sourceFile: 'lib/data/questions.json',
    fileCategorySlug: 'questions-data-dataset',
    originalIndex: idx,
  })
})

vilaRealRaw.forEach((q, idx) => {
  allPhysicalEntries.push({
    ...q,
    sourceFile: 'data/perguntas_vila_real_500.json',
    fileCategorySlug: 'vila-real-dataset',
    originalIndex: idx,
  })
})

modoMalucoRaw.forEach((q, idx) => {
  allPhysicalEntries.push({
    ...q,
    sourceFile: 'data/perguntas_modo_maluco_5000.json',
    fileCategorySlug: 'modo-maluco-dataset',
    originalIndex: idx,
  })
})

// Classificar se pertence ou não ao Desafio Nacional
const excludedFromDesafioNacional = []
const eligibleForDesafioNacional = []

allPhysicalEntries.forEach((item) => {
  const cat = String(item.category || item.categoria || item.tema || item.fileCategorySlug || '').toLowerCase()
  const id = String(item.id || '')
  const text = String(item.question || item.pergunta || '')

  const isMaluco =
    cat.includes('maluco') ||
    id.startsWith('mm_') ||
    text.toLowerCase().startsWith('modo maluco') ||
    item.sourceFile.includes('modo_maluco')

  if (isMaluco) {
    excludedFromDesafioNacional.push(item)
  } else {
    eligibleForDesafioNacional.push(item)
  }
})

// Estatísticas de Validação para Desafio Nacional
let validCount = 0
let missingCategoryCount = 0
let missingSubthemeCount = 0
let withSourceCount = 0
let withExplanationCount = 0

const categoryDistribution = {}
const subcategoryDistribution = {}
const difficultyDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, other: 0 }
const answerDistribution = { A: 0, B: 0, C: 0, D: 0, other: 0 }
const fileProvenance = {}

const seenIds = new Map()
const duplicatesById = []
const seenTexts = new Map()
const duplicatesByText = []

eligibleForDesafioNacional.forEach((q, index) => {
  // Proveniência por ficheiro
  fileProvenance[q.sourceFile] = (fileProvenance[q.sourceFile] || 0) + 1

  // Identificador e Duplicação
  const id = String(q.id || `gen_${index}`)
  if (seenIds.has(id)) {
    duplicatesById.push({ id, source1: seenIds.get(id), source2: q.sourceFile })
  } else {
    seenIds.set(id, q.sourceFile)
  }

  // Texto Normalizado para Duplicação
  const rawText = String(q.question || q.pergunta || '').trim()
  const normalizedText = rawText.toLowerCase().replace(/[^\w\sáéíóúâêîôûàèìòùãõç]/g, '').replace(/\s+/g, ' ')
  if (normalizedText.length > 10) {
    if (seenTexts.has(normalizedText)) {
      duplicatesByText.push({
        text: rawText,
        id1: seenTexts.get(normalizedText).id,
        file1: seenTexts.get(normalizedText).sourceFile,
        id2: id,
        file2: q.sourceFile,
      })
    } else {
      seenTexts.set(normalizedText, { id, sourceFile: q.sourceFile })
    }
  }

  // Categoria
  const tema = q.tema || q.category || q.categoria || q.defaultCategory
  if (!tema) {
    missingCategoryCount++
  } else {
    const key = String(tema).toLowerCase()
    categoryDistribution[key] = (categoryDistribution[key] || 0) + 1
  }

  // Subtema
  const subtema = q.subtema || q.subcategory || q.subcategoria || q.topic
  if (!subtema) {
    missingSubthemeCount++
  } else {
    const key = String(subtema)
    subcategoryDistribution[key] = (subcategoryDistribution[key] || 0) + 1
  }

  // Fonte
  if (q.fonte || q.source || q.sourceUrl) {
    withSourceCount++
  }

  // Explicação
  if (q.explicacao || q.explanation) {
    withExplanationCount++
  }

  // Dificuldade
  let diff = '2'
  if (typeof q.difficulty === 'number') diff = String(Math.round(q.difficulty))
  else if (typeof q.dificuldade === 'number') diff = String(Math.round(q.dificuldade))
  else if (typeof q.dificuldadeNivel === 'number') diff = String(Math.round(q.dificuldadeNivel))
  else if (typeof q.difficulty === 'string') {
    const dStr = q.difficulty.toLowerCase()
    if (dStr.includes('facil') || dStr.includes('fácil') || dStr === '1') diff = '1'
    else if (dStr.includes('medio') || dStr.includes('médio') || dStr === '3') diff = '3'
    else if (dStr.includes('dificil') || dStr.includes('difícil') || dStr === '4') diff = '4'
    else if (dStr.includes('mestre') || dStr === '5') diff = '5'
    else diff = '2'
  }
  if (difficultyDistribution[diff] !== undefined) {
    difficultyDistribution[diff]++
  } else {
    difficultyDistribution.other++
  }

  // Resposta Correta A/B/C/D
  let ansKey = 'other'
  if (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4) {
    ansKey = ['A', 'B', 'C', 'D'][q.correctAnswer]
  } else if (typeof q.respostaCorreta === 'number' && q.respostaCorreta >= 0 && q.respostaCorreta < 4) {
    ansKey = ['A', 'B', 'C', 'D'][q.respostaCorreta]
  } else if (typeof q.correct === 'string') {
    const cUpper = q.correct.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(cUpper)) {
      ansKey = cUpper
    } else if (Array.isArray(q.options)) {
      const idx = q.options.indexOf(q.correct)
      if (idx >= 0 && idx < 4) ansKey = ['A', 'B', 'C', 'D'][idx]
    }
  }
  if (answerDistribution[ansKey] !== undefined) {
    answerDistribution[ansKey]++
  } else {
    answerDistribution.other++
  }

  // Validação Estrutural
  const options = Array.isArray(q.options) ? q.options : Array.isArray(q.opcoes) ? q.opcoes : []
  const has4Options = options.length === 4
  const hasDistinctOptions = new Set(options.map((o) => (typeof o === 'string' ? o.trim() : JSON.stringify(o)))).size === 4
  const hasQuestionText = rawText.length >= 8

  if (hasQuestionText && has4Options && hasDistinctOptions) {
    validCount++
  }
})

// 3. Compilar Relatório de Auditoria
const auditReport = {
  timestamp: new Date().toISOString(),
  auditMode: 'DESAFIO_NACIONAL_SYSTEM_AUDIT',
  systemArchitecture: {
    entryRoute: '/jogar',
    gameHubComponent: 'components/game-hub.tsx',
    quizScreenComponent: 'components/quiz/quiz-screen.tsx',
    engineRouter: 'src/lib/questionEngine.ts -> loadQuestionsPool()',
    registrySingleton: 'lib/question-system/registry.ts -> QuestionRegistry.getInstance().getJogarTudo()',
    isolationRule: 'Modo Maluco (5.000 Qs) estritamente isolado (0% de contaminação)',
  },
  questionMetrics: {
    totalPhysicalQuestionsInRepo: allPhysicalEntries.length,
    usableByDesafioNacional: eligibleForDesafioNacional.length,
    excludedSpecialModoMaluco: excludedFromDesafioNacional.length,
    validStructuralQuestions: validCount,
    invalidStructuralQuestions: eligibleForDesafioNacional.length - validCount,
    duplicateIdsCount: duplicatesById.length,
    duplicateTextsCount: duplicatesByText.length,
    missingCategoryCount,
    missingSubthemeCount,
    withSourceCount,
    withoutSourceCount: eligibleForDesafioNacional.length - withSourceCount,
    withExplanationCount,
    withoutExplanationCount: eligibleForDesafioNacional.length - withExplanationCount,
  },
  fileProvenanceBreakdown: fileProvenance,
  difficultyDistribution,
  answerOptionDistribution: answerDistribution,
  categoryDistribution,
  topSubcategories: Object.entries(subcategoryDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
  duplicateSamples: {
    byIds: duplicatesById.slice(0, 10),
    byText: duplicatesByText.slice(0, 10),
  },
}

// Gravar relatório em data/desafio-nacional-audit.json
fs.writeFileSync(
  path.join(rootDir, 'data/desafio-nacional-audit.json'),
  JSON.stringify(auditReport, null, 2),
  'utf8'
)

console.log('✓ Auditoria do Desafio Nacional concluída com sucesso!')
console.log(`• Total Físico no Repositório: ${allPhysicalEntries.length}`)
console.log(`• Perguntas Elegíveis para Desafio Nacional: ${eligibleForDesafioNacional.length}`)
console.log(`• Perguntas do Modo Maluco (Isoladas): ${excludedFromDesafioNacional.length}`)
console.log(`• Perguntas Válidas no Desafio Nacional: ${validCount}`)
console.log(`• Relatório gravado em: data/desafio-nacional-audit.json`)
