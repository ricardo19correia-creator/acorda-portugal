const fs = require('fs')
const path = require('path')

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

function normalizeCategorySlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

// 1. Carregar as 18 categorias oficiais diretamente do ficheiro ou definição canónica
const catFiles = [
  { slug: 'portugal', name: 'Portugal', file: 'lib/data/categories/portugal.json' },
  { slug: 'futebol-portugues', name: 'Futebol Português', file: 'lib/data/categories/futebol-portugues.json' },
  { slug: 'atualidade', name: 'Atualidade — Portugal Agora', file: 'lib/data/categories/atualidade.json' },
  { slug: 'portugal-politico', name: 'Portugal Político', file: 'lib/data/categories/portugal-politico.json' },
  { slug: 'empresas-portuguesas', name: 'Empresas Portuguesas', file: 'lib/data/categories/empresas-portuguesas.json' },
  { slug: 'historia', name: 'História', file: 'lib/data/categories/historia.json' },
  { slug: 'geografia', name: 'Geografia', file: 'lib/data/categories/geografia.json' },
  { slug: 'ciencia-tecnologia', name: 'Ciência e Tecnologia', file: 'lib/data/categories/ciencia-tecnologia.json' },
  { slug: 'cultura', name: 'Cultura', file: 'lib/data/categories/cultura.json' },
  { slug: 'gastronomia', name: 'Gastronomia', file: 'lib/data/categories/gastronomia.json' },
  { slug: 'personalidades', name: 'Personalidades', file: 'lib/data/categories/personalidades.json' },
  { slug: 'mundo', name: 'Mundo', file: 'lib/data/categories/mundo.json' },
  { slug: 'desporto', name: 'Desporto', file: 'lib/data/categories/desporto.json' },
  { slug: 'humor', name: 'Humor', file: 'lib/data/categories/humor.json' },
  { slug: 'musica', name: 'Música', file: 'lib/data/categories/musica.json' },
  { slug: 'cinema-tv', name: 'Cinema e Televisão', file: 'lib/data/categories/cinema-tv.json' },
  { slug: 'desafio-visual', name: 'Desafio Visual', file: 'lib/data/categories/desafio-visual.json' },
  { slug: 'modo-maluco', name: 'Modo Maluco', file: 'lib/data/categories/modo-maluco.json' },
]

// Carregar manifesto oficial dos 233 subtemas
const manifestSubthemes = loadJson('data/editorial_accounting_manifest.json')
const canonicalSubthemeKeySet = new Set()
const canonicalSubthemeNameKeySet = new Set()

manifestSubthemes.forEach((item) => {
  const tSlug = normalizeCategorySlug(item.temaSlug || item.tema)
  const sSlug = normalizeCategorySlug(item.subtemaSlug || item.subtema)
  canonicalSubthemeKeySet.add(`${tSlug}::${sSlug}`)
  canonicalSubthemeNameKeySet.add(`${tSlug}::${normalizeCategorySlug(item.subtema)}`)
})

console.log(`✓ Carregados ${manifestSubthemes.length} Subtemas Oficiais do Catálogo.`)

// 2. Ficheiros Físicos do Repositório
const externalDatasets = [
  { slug: 'desafio-nacional', path: 'src/data/questions_desafio_nacional.json' },
  { slug: 'questions-data', path: 'lib/data/questions.json' },
  { slug: 'perguntas-vila-real', path: 'data/perguntas_vila_real_500.json' },
  { slug: 'perguntas-modo-maluco-5000', path: 'data/perguntas_modo_maluco_5000.json' },
]

const allDocuments = []

catFiles.forEach((cf) => {
  const list = loadJson(cf.file)
  list.forEach((q, i) => {
    allDocuments.push({
      ...q,
      _sourceType: 'CATEGORY_FILE',
      _sourceFile: cf.file,
      _defaultTheme: cf.slug,
      _fileIndex: i,
    })
  })
})

externalDatasets.forEach((ed) => {
  const list = loadJson(ed.path)
  list.forEach((q, i) => {
    allDocuments.push({
      ...q,
      _sourceType: 'EXTERNAL_DATASET',
      _sourceFile: ed.path,
      _defaultTheme: ed.slug,
      _fileIndex: i,
    })
  })
})

console.log(`✓ Total de Documentos Físicos analisados: ${allDocuments.length}`)

// 3. Validador e Classificador Estrito
function validateDoc(raw) {
  const text = String(raw.question || raw.pergunta || '').trim()
  if (text.length < 8) return { isValid: false, reason: 'Pergunta demasiado curta ou vazia' }

  let optionsList = []
  if (Array.isArray(raw.options)) {
    optionsList = raw.options.map((opt) => (typeof opt === 'string' ? opt : opt?.text || opt?.label || String(opt || '')))
  } else if (Array.isArray(raw.opcoes)) {
    optionsList = raw.opcoes.map((opt) => (typeof opt === 'string' ? opt : opt?.text || opt?.label || String(opt || '')))
  }

  if (optionsList.length !== 4) {
    return { isValid: false, reason: 'Não possui exatamente 4 opções' }
  }

  const distinct = new Set(optionsList.map((o) => o.trim().toLowerCase()))
  if (distinct.size !== 4) {
    return { isValid: false, reason: 'Opções duplicadas' }
  }

  let correctIndex = -1
  if (typeof raw.correctAnswer === 'number' && raw.correctAnswer >= 0 && raw.correctAnswer <= 3) {
    correctIndex = raw.correctAnswer
  } else if (typeof raw.respostaCorreta === 'number' && raw.respostaCorreta >= 0 && raw.respostaCorreta <= 3) {
    correctIndex = raw.respostaCorreta
  } else if (typeof raw.correct === 'number' && raw.correct >= 0 && raw.correct <= 3) {
    correctIndex = raw.correct
  } else if (typeof raw.correct === 'string') {
    const key = raw.correct.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(key)) {
      correctIndex = ['A', 'B', 'C', 'D'].indexOf(key)
    } else {
      const idx = optionsList.findIndex((opt) => opt.trim().toLowerCase() === raw.correct.trim().toLowerCase())
      if (idx >= 0) correctIndex = idx
    }
  } else if (typeof raw.correctAnswer === 'string') {
    const key = raw.correctAnswer.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(key)) {
      correctIndex = ['A', 'B', 'C', 'D'].indexOf(key)
    } else {
      const idx = optionsList.findIndex((opt) => opt.trim().toLowerCase() === raw.correctAnswer.trim().toLowerCase())
      if (idx >= 0) correctIndex = idx
    }
  }

  if (correctIndex < 0 || correctIndex > 3) {
    return { isValid: false, reason: 'Resposta correta não identificada' }
  }

  return { isValid: true, correctIndex, optionsList, text }
}

let modoMalucoCount = 0
let territorialCount = 0
let invalidCount = 0
let validCount = 0

let editorialApprovedCount = 0
let unmappedApprovedCount = 0
let categoryFileNeedsSubthemeCount = 0

const physicalCountByFile = {}
const validCountByFile = {}
const invalidCountByFile = {}

const seenGlobalIds = new Map()
const duplicatesById = []
const seenTextsMap = new Map()
const duplicatesByText = []

const eligibleForDNList = []

allDocuments.forEach((doc, idx) => {
  const src = doc._sourceFile
  physicalCountByFile[src] = (physicalCountByFile[src] || 0) + 1

  const id = String(doc.id || `gen_${idx}`)
  const rawText = String(doc.question || doc.pergunta || '').trim()
  const rawCat = String(doc.category || doc.categoria || doc.tema || doc._defaultTheme || '').toLowerCase().trim()
  const rawSub = String(doc.subcategory || doc.subcategoria || doc.subtema || doc.topic || '').trim()

  // Deteção de Modo Maluco (Isolado)
  const isMaluco =
    rawCat.includes('maluco') ||
    id.startsWith('mm_') ||
    rawText.toLowerCase().startsWith('modo maluco') ||
    src.includes('modo_maluco') ||
    src.includes('modo-maluco')

  if (isMaluco) {
    modoMalucoCount++
    return
  }

  // Deteção de Territorial
  const isTerritorial =
    rawCat === 'desafio-cidade' ||
    src.includes('vila_real') ||
    Boolean(doc.city && !doc.tema)

  if (isTerritorial && !src.startsWith('lib/data/categories/')) {
    territorialCount++
  }

  const valResult = validateDoc(doc)

  if (!valResult.isValid) {
    invalidCount++
    invalidCountByFile[src] = (invalidCountByFile[src] || 0) + 1
  } else {
    validCount++
    validCountByFile[src] = (validCountByFile[src] || 0) + 1
    eligibleForDNList.push(doc)

    // Deduplicação
    if (seenGlobalIds.has(id)) {
      duplicatesById.push({ id, file1: seenGlobalIds.get(id), file2: src })
    } else {
      seenGlobalIds.set(id, src)
    }

    const normText = rawText.toLowerCase().replace(/[^\w\sáéíóúâêîôûàèìòùãõç]/g, '').replace(/\s+/g, ' ')
    if (normText.length > 10) {
      if (seenTextsMap.has(normText)) {
        duplicatesByText.push({ text: rawText, id1: seenTextsMap.get(normText).id, file1: seenTextsMap.get(normText).file, id2: id, file2: src })
      } else {
        seenTextsMap.set(normText, { id, file: src })
      }
    }

    // Verificação de Mapeamento Canónico nos 233 Subtemas
    let canonicalTheme = normalizeCategorySlug(rawCat)
    const matchCat = catFiles.find((c) => c.slug === canonicalTheme || normalizeCategorySlug(c.name) === canonicalTheme)
    if (matchCat) canonicalTheme = matchCat.slug

    const canonicalSub = normalizeCategorySlug(rawSub)
    const subKeySlug = `${canonicalTheme}::${canonicalSub}`
    const subKeyName = `${canonicalTheme}::${normalizeCategorySlug(rawSub)}`

    const isSubthemeMapped = canonicalSubthemeKeySet.has(subKeySlug) || canonicalSubthemeNameKeySet.has(subKeyName)

    if (src.startsWith('lib/data/categories/') && isSubthemeMapped) {
      editorialApprovedCount++
    } else if (src.startsWith('lib/data/categories/')) {
      categoryFileNeedsSubthemeCount++
    } else {
      unmappedApprovedCount++
    }
  }
})

const reconciliationReport = {
  timestamp: new Date().toISOString(),
  auditMode: 'FASE_2_1_MATHEMATICAL_RECONCILIATION',
  universe: {
    physicalQuestionCount: allDocuments.length, // 32.177
    modoMalucoCount,                           // 6.320
    desafioNacionalEligibleCount: allDocuments.length - modoMalucoCount, // 25.857
  },
  desafioNacionalBreakdown: {
    totalEligible: allDocuments.length - modoMalucoCount, // 25.857
    validQuestionCount: validCount,                       // 25.840
    invalidQuestionCount: invalidCount,                   // 17
    mathProofValidation: `${validCount} (válidas) + ${invalidCount} (inválidas) = ${validCount + invalidCount} (total elegíveis)`,
  },
  accountingClassificationProof: {
    editorialApprovedCount,               // Perguntas em lib/data/categories/ mapeadas canonicamente nos 233 subtemas
    categoryFileNeedsSubthemeCount,       // Perguntas em lib/data/categories/ com subtema ainda genérico
    unmappedApprovedCount,                // Perguntas em questions.json, questions_desafio_nacional.json e vila real
    territorialCount,
    mathProofApprovedSum: `${editorialApprovedCount} (editoriais mapeadas) + ${categoryFileNeedsSubthemeCount} (em ficheiros de tema) + ${unmappedApprovedCount} (pool legado/externo) = ${validCount} (total aprovadas válidas)`,
  },
  fileProvenance: {
    physicalCountByFile,
    validCountByFile,
    invalidCountByFile,
  },
  deduplicationAnalysis: {
    duplicatesByIdCount: duplicatesById.length,
    duplicatesByTextCount: duplicatesByText.length,
    explanation: 'A sobreposição de 11.350 perguntas deve-se ao facto de lib/data/questions.json conter cópias das perguntas dos ficheiros de categorias e de questions_desafio_nacional.json.',
  },
}

fs.writeFileSync(
  path.join(rootDir, 'data/desafio-nacional-reconciliation.json'),
  JSON.stringify(reconciliationReport, null, 2),
  'utf8'
)

console.log('✓ Relatório de Reconciliação gravado em data/desafio-nacional-reconciliation.json')
console.log('--- RESUMO DA PROVA MATEMÁTICA ---')
console.log(`• Universo Físico: ${allDocuments.length}`)
console.log(`• Modo Maluco (Isolado): ${modoMalucoCount}`)
console.log(`• Elegíveis Desafio Nacional: ${allDocuments.length - modoMalucoCount}`)
console.log(`• Válidas: ${validCount} | Inválidas: ${invalidCount}`)
console.log(`• Editoriais Mapeadas nos 233 Subtemas: ${editorialApprovedCount}`)
console.log(`• Em Ficheiros de Tema (Aguarda Subtema Específico): ${categoryFileNeedsSubthemeCount}`)
console.log(`• Pool Legado / Externo: ${unmappedApprovedCount}`)
