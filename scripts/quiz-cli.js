#!/usr/bin/env node
/**
 * Acorda Portugal — CLI de Gestão, Validação, Deduplicação, Importação e Produção Massiva Controlada
 * 
 * Comandos:
 *   node scripts/quiz-cli.js stats
 *   node scripts/quiz-cli.js stats --production
 *   node scripts/quiz-cli.js validate --file <caminho.json>
 *   node scripts/quiz-cli.js deduplicate --file <caminho.json>
 *   node scripts/quiz-cli.js import --file <caminho.json>
 */

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')

// Catálogo Editorial Oficial dos 18 Temas e 233 Subtemas Oficiais
const CATEGORIES_CATALOG = [
  {
    id: 'portugal',
    name: 'Portugal',
    emoji: '🇵🇹',
    subcategories: [
      'História de Portugal', 'Geografia de Portugal', 'Cultura Portuguesa', 'Tradições',
      'Monumentos', 'Cidades', 'Vilas e Aldeias', 'Praias', 'Regiões',
      'Gastronomia Portuguesa', 'Personalidades Portuguesas', 'Curiosidades de Portugal'
    ]
  },
  {
    id: 'futebol-portugues',
    name: 'Futebol Português',
    emoji: '⚽',
    subcategories: [
      'Clubes', 'Jogadores', 'Jogadoras', 'Estádios', 'Competições', 'Liga Portuguesa',
      'Taça de Portugal', 'Seleção Nacional', 'Futebol Feminino', 'Treinadores',
      'História do Futebol', 'Momentos Marcantes', 'Dérbis & Clássicos', 'Recordes',
      'Transferências', 'Equipamentos', 'Futebol Europeu & Clubes Portugueses'
    ]
  },
  {
    id: 'atualidade',
    name: 'Atualidade — Portugal Agora',
    emoji: '📰',
    subcategories: [
      'Política e Governo', 'Assembleia da República', 'Partidos Políticos', 'Líderes Políticos',
      'Economia', 'Salário Mínimo', 'Inflação', 'PIB', 'Emprego', 'Habitação', 'Euribor',
      'Turismo', 'Empresas Portuguesas', 'Cultura', 'Desporto', 'Acontecimentos Nacionais',
      'Notícias e Factos Verificáveis'
    ]
  },
  {
    id: 'portugal-politico',
    name: 'Portugal Político',
    emoji: '🏛️',
    subcategories: [
      'Partidos', 'Representação Parlamentar', 'Líderes', 'História Política', 'Instituições',
      'Constituição', 'Sistema Político', 'Eleições', 'Propostas Políticas', 'Governos',
      'Presidentes da República', 'Primeiros-Ministros'
    ]
  },
  {
    id: 'empresas-portuguesas',
    name: 'Empresas Portuguesas',
    emoji: '🏢',
    subcategories: [
      'Empresas', 'Marcas', 'Fundadores', 'História Empresarial', 'Setores', 'Produtos',
      'Serviços', 'Empresas Históricas', 'Empresas Atuais', 'Empresas Tecnológicas',
      'Empresas Internacionais Portuguesas'
    ]
  },
  {
    id: 'historia',
    name: 'História',
    emoji: '🏺',
    subcategories: [
      'História de Portugal', 'História Mundial', 'Reis e Rainhas', 'Descobrimentos & Navegações',
      'Batalhas & Conflitos', 'Impérios Históricos', 'Revoluções', 'Implantação da República',
      'Estado Novo', '25 de Abril & Cravos', 'Personalidades Históricas', 'Civilizações Antigas',
      'Idade Média', 'Idade Moderna', 'História Contemporânea'
    ]
  },
  {
    id: 'geografia',
    name: 'Geografia',
    emoji: '🌍',
    subcategories: [
      'Geografia de Portugal', 'Europa', 'Mundo', 'Países', 'Capitais', 'Grandes Cidades',
      'Rios', 'Montanhas & Serras', 'Ilhas & Arquipélagos', 'Oceanos & Mares',
      'Fronteiras & Tratados', 'Regiões', 'Mapas & Cartografia', 'Localização Geográfica'
    ]
  },
  {
    id: 'ciencia-tecnologia',
    name: 'Ciência e Tecnologia',
    emoji: '🔬',
    subcategories: [
      'Ciência Geral', 'Física', 'Química', 'Biologia', 'Astronomia & Espaço', 'Corpo Humano',
      'Animais & Natureza', 'Tecnologia', 'Informática & Internet', 'Inteligência Artificial',
      'Invenções', 'Descobertas Científicas'
    ]
  },
  {
    id: 'cultura',
    name: 'Cultura',
    emoji: '🎭',
    subcategories: [
      'Cultura Portuguesa', 'Cultura Mundial', 'Arte, Pintura e Escultura', 'Literatura',
      'Teatro', 'Fotografia', 'Música Erudita & Tradicional', 'Cinema de Autor',
      'Televisão Cultural', 'Cultura Popular', 'Tradições & Folclore'
    ]
  },
  {
    id: 'gastronomia',
    name: 'Gastronomia',
    emoji: '🍲',
    subcategories: [
      'Gastronomia Portuguesa', 'Pratos Típicos Portugueses', 'Doces & Sobremesas Tradicionais',
      'Bebidas & Vinhos de Portugal', 'Ingredientes & Especiarias', 'Receitas Tradicionais',
      'Regiões Gastronómicas', 'Gastronomia Mundial', 'Comida Internacional',
      'Identificação Visual de Pratos', 'Curiosidades Gastronómicas'
    ]
  },
  {
    id: 'personalidades',
    name: 'Personalidades',
    emoji: '👤',
    subcategories: [
      'Figuras Históricas', 'Políticos & Estadistas', 'Artistas & Pintores', 'Atletas Lendários',
      'Cientistas & Pensadores', 'Empresários & Empreendedores', 'Escritores & Poetas',
      'Músicos & Compositores', 'Atores & Intérpretes', 'Criadores & Inovadores',
      'Personalidades Internacionais', 'Personalidades Portuguesas'
    ]
  },
  {
    id: 'mundo',
    name: 'Mundo',
    emoji: '🌐',
    subcategories: [
      'Países & Continentes', 'Capitais do Mundo', 'História Mundial', 'Geografia Mundial',
      'Culturas & Costumes Globais', 'Ciência & Tecnologia no Mundo', 'Economia Global',
      'Desporto Mundial', 'Música do Mundo', 'Cinema Internacional', 'Personalidades do Mundo',
      'Curiosidades Mundiais', 'Atualidade Internacional'
    ]
  },
  {
    id: 'desporto',
    name: 'Desporto',
    emoji: '🏆',
    subcategories: [
      'Futebol Geral', 'Atletismo & Maratonas', 'Ténis', 'Ciclismo & Volta a Portugal',
      'Basquetebol & NBA', 'Fórmula 1 & Motores', 'Surf & Ondas Gigantes',
      'Natação & Desportos Aquáticos', 'Jogos Olímpicos', 'Artes Marciais & Judo',
      'Motociclismo & MotoGP', 'Desporto Português', 'Desporto Internacional',
      'Recordes Mundiais', 'Grandes Competições'
    ]
  },
  {
    id: 'humor',
    name: 'Humor',
    emoji: '😂',
    subcategories: [
      'Humor Português', 'Expressões Populares Portuguesas', 'Memes & Internet',
      'Comédia na TV & Cinema', 'Situações do Quotidiano', 'Perguntas Engraçadas',
      'Curiosidades Hilariantes', 'Humor Absurdo'
    ]
  },
  {
    id: 'musica',
    name: 'Música',
    emoji: '🎵',
    subcategories: [
      'Música Portuguesa', 'Fado & Guitarra Portuguesa', 'Música Popular & Pimba',
      'Artistas & Cantores Portugueses', 'Bandas Portuguesas', 'Música Internacional',
      'Artistas Internacionais', 'Bandas Internacionais Lendárias', 'Grandes Canções',
      'Álbuns Históricos', 'Instrumentos Musicais', 'História da Música', 'Festivais de Música'
    ]
  },
  {
    id: 'cinema-tv',
    name: 'Cinema e Televisão',
    emoji: '🎬',
    subcategories: [
      'Grandes Filmes', 'Séries Marcantes', 'Atores e Atrizes', 'Personagens Inesquecíveis',
      'Realizadores', 'Cinema Português', 'Televisão Portuguesa',
      'Programas de Televisão Clássicos', 'Streaming & Novas Séries', 'Cultura Pop & Geek',
      'Filmes Clássicos'
    ]
  },
  {
    id: 'desafio-visual',
    name: 'Desafio Visual',
    emoji: '👁️',
    subcategories: [
      'Que lugar é este?', 'Quem é esta pessoa?', 'Bandeiras', 'Brasões', 'Símbolos',
      'Gastronomia', 'Futebol', 'Estádios', 'Monumentos', 'Cidades', 'Praias',
      'Vilas e Aldeias', 'Onde fica?', 'Encontra o detalhe', 'Fotografias Históricas',
      'Imagens de Objetos', 'Imagens de Animais', 'Imagens de Natureza', 'Desafio Visual Maluco'
    ]
  },
  {
    id: 'modo-maluco',
    name: 'Modo Maluco',
    emoji: '🤪',
    subcategories: [
      'Perguntas Absurdas', 'Perguntas Inesperadas', 'Humor & Rir', 'Cultura Popular Insólita',
      'Regras Aleatórias', 'Desafios Rápidos', 'Efeitos Especiais', 'Modificadores de Jogo',
      'Perguntas com Lógica Diferente', 'Modo Caos'
    ]
  }
]

function normalizeSlug(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function loadAllExistingQuestions() {
  const pool = []
  const seenIds = new Set()

  const categoriesDir = path.join(rootDir, 'lib', 'data', 'categories')
  if (fs.existsSync(categoriesDir)) {
    const files = fs.readdirSync(categoriesDir).filter((f) => f.endsWith('.json'))
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(categoriesDir, file), 'utf8')
        const items = JSON.parse(content)
        if (Array.isArray(items)) {
          for (const q of items) {
            const id = String(q.id || '')
            if (id && !seenIds.has(id)) {
              seenIds.add(id)
              pool.push(q)
            }
          }
        }
      } catch (e) {
        console.warn(`Aviso ao ler ${file}:`, e.message)
      }
    }
  }

  const dnPath = path.join(rootDir, 'src', 'data', 'questions_desafio_nacional.json')
  if (fs.existsSync(dnPath)) {
    try {
      const dnItems = JSON.parse(fs.readFileSync(dnPath, 'utf8'))
      if (Array.isArray(dnItems)) {
        for (const q of dnItems) {
          if (!seenIds.has(String(q.id))) {
            seenIds.add(String(q.id))
            pool.push(q)
          }
        }
      }
    } catch {}
  }

  return pool
}

/**
 * Validador estrito de perguntas segundo a Regra de Contagem (Secção 3)
 */
function isValidCountableQuestion(q) {
  if (!q.id) return false
  const p = q.pergunta || q.question
  if (!p || typeof p !== 'string' || p.trim().length < 10) return false

  const opts = q.opcoes || q.options
  if (!Array.isArray(opts) || opts.length !== 4) return false
  const optsStrings = opts.map((o) => (typeof o === 'string' ? o.trim() : String(o?.text || o || '').trim()))
  if (optsStrings.some((o) => !o)) return false

  const uniq = new Set(optsStrings.map((o) => o.toLowerCase()))
  if (uniq.size < 4) return false

  let correctIdx = -1
  if (typeof q.respostaCorreta === 'number') correctIdx = q.respostaCorreta
  else if (typeof q.correctAnswer === 'number') correctIdx = q.correctAnswer
  else if (typeof q.correct === 'number') correctIdx = q.correct
  else if (typeof q.correct === 'string') {
    const k = q.correct.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(k)) correctIdx = ['A', 'B', 'C', 'D'].indexOf(k)
    else correctIdx = optsStrings.findIndex((o) => o.toLowerCase() === q.correct.toLowerCase().trim())
  } else if (typeof q.correctAnswer === 'string') {
    correctIdx = optsStrings.findIndex((o) => o.toLowerCase() === q.correctAnswer.toLowerCase().trim())
  }

  if (correctIdx < 0 || correctIdx > 3) return false

  // Status deve ser approved ou published (ou ativo sem rejeição)
  if (q.status === 'rejected' || q.status === 'expired' || q.status === 'archived') return false
  if (q.active === false || q.ativa === false) return false

  return true
}

// -------------------------------------------------------------
// COMANDO: stats / stats --production
// -------------------------------------------------------------
function handleStats(isProduction = false) {
  const allQuestions = loadAllExistingQuestions()
  const TARGET_PER_SUBTHEME = 2000

  let grandTotalApproved = 0
  let grandTotalTarget = 0
  let totalSubthemes = 0

  const productionStatus = {
    timestamp: new Date().toISOString(),
    totalQuestionsLoaded: allQuestions.length,
    globalTarget: 233 * TARGET_PER_SUBTHEME,
    totalApprovedValid: 0,
    completionPercentage: 0,
    themes: [],
  }

  console.log('\n========================================================================================================')
  console.log('            ACORDA PORTUGAL — AUDITORIA REAL DE PRODUÇÃO (233 SUBTEMAS OFICIAIS)                        ')
  console.log('========================================================================================================\n')

  console.log(`| ${'Tema'.padEnd(24)} | ${'Subtema'.padEnd(36)} | ${'Válidas'.padStart(8)} | ${'Meta'.padStart(6)} | ${'Falta'.padStart(6)} | ${'Estado'.padEnd(14)} |`)
  console.log(`|${'-'.repeat(26)}|${'-'.repeat(38)}|${'-'.repeat(10)}|${'-'.repeat(8)}|${'-'.repeat(8)}|${'-'.repeat(16)}|`)

  for (const cat of CATEGORIES_CATALOG) {
    const catSlug = cat.id
    const catNameSlug = normalizeSlug(cat.name)
    const catQuestions = allQuestions.filter((q) => {
      const qCat = normalizeSlug(q.category || q.tema || '')
      return qCat === catSlug || qCat === catNameSlug || qCat.includes(catSlug) || catSlug.includes(qCat) || qCat.includes(catNameSlug) || catNameSlug.includes(qCat)
    })

    const themeItem = {
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      totalValidApproved: 0,
      totalTarget: cat.subcategories.length * TARGET_PER_SUBTHEME,
      subcategories: [],
    }

    for (const subName of cat.subcategories) {
      totalSubthemes++
      const subSlug = normalizeSlug(subName)

      const subQuestions = catQuestions.filter((q) => {
        const qSub = normalizeSlug(q.subcategory || q.subtema || '')
        return qSub === subSlug || qSub.includes(subSlug) || subSlug.includes(qSub)
      })

      const validApprovedCount = subQuestions.filter(isValidCountableQuestion).length
      const faltaCount = Math.max(0, TARGET_PER_SUBTHEME - validApprovedCount)

      grandTotalApproved += validApprovedCount
      grandTotalTarget += TARGET_PER_SUBTHEME
      themeItem.totalValidApproved += validApprovedCount

      let estado = 'NÃO INICIADO'
      if (validApprovedCount >= TARGET_PER_SUBTHEME) {
        estado = 'CONCLUÍDO'
      } else if (validApprovedCount > 0) {
        estado = 'EM PRODUÇÃO'
      }

      themeItem.subcategories.push({
        name: subName,
        slug: subSlug,
        totalRaw: subQuestions.length,
        validApproved: validApprovedCount,
        target: TARGET_PER_SUBTHEME,
        missing: faltaCount,
        status: estado,
      })

      const themeDisplay = `${cat.emoji} ${cat.name}`.slice(0, 24)
      const subDisplay = subName.slice(0, 36)

      console.log(
        `| ${themeDisplay.padEnd(24)} | ${subDisplay.padEnd(36)} | ${String(validApprovedCount).padStart(8)} | ${String(TARGET_PER_SUBTHEME).padStart(6)} | ${String(faltaCount).padStart(6)} | ${estado.padEnd(14)} |`
      )
    }

    productionStatus.themes.push(themeItem)
  }

  productionStatus.totalApprovedValid = grandTotalApproved
  productionStatus.completionPercentage = Number(((grandTotalApproved / grandTotalTarget) * 100).toFixed(2))

  console.log(`|${'='.repeat(26)}|${'='.repeat(38)}|${'='.repeat(10)}|${'='.repeat(8)}|${'='.repeat(8)}|${'='.repeat(16)}|`)
  console.log(
    `| ${'TOTAL GERAL'.padEnd(24)} | ${`${totalSubthemes} Subtemas Oficiais`.padEnd(36)} | ${String(grandTotalApproved).padStart(8)} | ${String(grandTotalTarget).padStart(6)} | ${String(grandTotalTarget - grandTotalApproved).padStart(6)} | ${(productionStatus.completionPercentage + '%').padEnd(14)} |`
  )
  console.log('========================================================================================================\n')
  console.log(`• Total Bruto de Documentos Carregados: ${allQuestions.length.toLocaleString('pt-PT')}`)
  console.log(`• Total Efetivo de Perguntas Válidas & Aprovadas: ${grandTotalApproved.toLocaleString('pt-PT')}`)
  console.log(`• Meta Global do Jogo: ${grandTotalTarget.toLocaleString('pt-PT')} perguntas (2.000 por subtema)`)
  console.log(`• Progresso Global Real: ${productionStatus.completionPercentage}%\n`)

  // Gravar relatório em question-production-status.json
  const statusFilePath = path.join(rootDir, 'question-production-status.json')
  fs.writeFileSync(statusFilePath, JSON.stringify(productionStatus, null, 2), 'utf8')
  console.log(`✓ Relatório de estado gravado com sucesso em: question-production-status.json\n`)
}

// -------------------------------------------------------------
// COMANDO: validate
// -------------------------------------------------------------
function handleValidate(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Erro: Ficheiro não encontrado: ${filePath}`)
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(rawData)) {
    console.error('Erro: O ficheiro deve conter um array JSON de perguntas.')
    process.exit(1)
  }

  console.log(`\n--- A validar ${rawData.length} perguntas de ${filePath} ---`)

  let validCount = 0
  let errorCount = 0
  const errors = []

  rawData.forEach((q, idx) => {
    const qErrors = []
    if (!q.id) qErrors.push('Campo "id" em falta.')
    if (!q.pergunta && !q.question) qErrors.push('Campo "pergunta" em falta.')
    const opts = q.opcoes || q.options
    if (!Array.isArray(opts) || opts.length !== 4) {
      qErrors.push(`Devem existir exatamente 4 opções (tem ${Array.isArray(opts) ? opts.length : 0}).`)
    }
    const correct = q.respostaCorreta !== undefined ? q.respostaCorreta : q.correctAnswer !== undefined ? q.correctAnswer : q.correct
    if (correct === undefined || correct === null) {
      qErrors.push('Campo de resposta correta em falta.')
    }

    if (qErrors.length === 0) {
      validCount++
    } else {
      errorCount++
      errors.push({ id: q.id || `item_${idx + 1}`, errors: qErrors })
    }
  })

  console.log(`\n• Válidas: ${validCount}`)
  console.log(`• Inválidas: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\nErros encontrados:')
    errors.slice(0, 10).forEach((e) => {
      console.log(`  [${e.id}]: ${e.errors.join('; ')}`)
    })
    if (errors.length > 10) console.log(`  ... e mais ${errors.length - 10} perguntas com erros.`)
  } else {
    console.log('✓ Todas as perguntas passaram a validação estrutural com sucesso!')
  }
}

// -------------------------------------------------------------
// COMANDO: deduplicate
// -------------------------------------------------------------
function handleDeduplicate(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Erro: Ficheiro não encontrado: ${filePath}`)
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const existingQuestions = loadAllExistingQuestions()

  console.log(`\n--- A deduplicar ${rawData.length} perguntas contra ${existingQuestions.length} perguntas existentes ---`)

  const seenExact = new Set()
  const duplicates = []
  const clean = []

  existingQuestions.forEach((q) => {
    const text = normalizeSlug(q.pergunta || q.question || '')
    if (text) seenExact.add(text)
  })

  rawData.forEach((q) => {
    const text = normalizeSlug(q.pergunta || q.question || '')
    if (seenExact.has(text)) {
      duplicates.push({ id: q.id, text: q.pergunta || q.question })
    } else {
      seenExact.add(text)
      clean.push(q)
    }
  })

  console.log(`• Perguntas Únicas: ${clean.length}`)
  console.log(`• Perguntas Duplicadas: ${duplicates.length}`)

  if (duplicates.length > 0) {
    console.log('\nDuplicados detetados:')
    duplicates.slice(0, 10).forEach((d) => console.log(`  - [${d.id}]: "${d.text}"`))
  } else {
    console.log('✓ Nenhuma pergunta duplicada encontrada!')
  }
}

// -------------------------------------------------------------
// COMANDO: import
// -------------------------------------------------------------
function handleImport(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`Erro: Ficheiro não encontrado: ${filePath}`)
    process.exit(1)
  }

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  console.log(`\n--- A importar ${rawData.length} perguntas de ${filePath} ---`)

  // Importar para a categoria adequada
  let importedCount = 0
  const groupedByTheme = {}

  const CATEGORY_FILE_MAP = {
    'cinema-e-televisao': 'cinema-tv',
    'cinema-tv': 'cinema-tv',
    'ciencia-e-tecnologia': 'ciencia-tecnologia',
    'atualidade-portugal-agora': 'atualidade',
    'futebol': 'futebol-portugues',
  }

  for (const q of rawData) {
    let theme = normalizeSlug(q.tema || q.category || 'portugal')
    if (CATEGORY_FILE_MAP[theme]) theme = CATEGORY_FILE_MAP[theme]
    if (!groupedByTheme[theme]) groupedByTheme[theme] = []
    groupedByTheme[theme].push(q)
  }

  for (const [theme, questions] of Object.entries(groupedByTheme)) {
    const targetFile = path.join(rootDir, 'lib', 'data', 'categories', `${theme}.json`)
    let existing = []
    if (fs.existsSync(targetFile)) {
      try {
        existing = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
      } catch {
        existing = []
      }
    }

    const seenIds = new Set(existing.map((q) => String(q.id)))
    let newInFile = 0

    for (const q of questions) {
      if (!seenIds.has(String(q.id))) {
        existing.push(q)
        seenIds.add(String(q.id))
        newInFile++
        importedCount++
      }
    }

    fs.writeFileSync(targetFile, JSON.stringify(existing, null, 2), 'utf8')
    console.log(`  ✓ ${theme}.json: +${newInFile} novas perguntas adicionadas (Total: ${existing.length})`)
  }

  console.log(`\n✓ Importação concluída com sucesso: ${importedCount} novas perguntas registadas.`)
}

// -------------------------------------------------------------
// MAIN ENTRYPOINT
// -------------------------------------------------------------
const args = process.argv.slice(2)
const command = args[0] || 'stats'

if (command === 'stats') {
  const isProduction = args.includes('--production')
  handleStats(isProduction)
} else if (command === 'validate') {
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx >= 0 ? args[fileIdx + 1] : args[1]
  handleValidate(filePath)
} else if (command === 'deduplicate') {
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx >= 0 ? args[fileIdx + 1] : args[1]
  handleDeduplicate(filePath)
} else if (command === 'import') {
  const fileIdx = args.indexOf('--file')
  const filePath = fileIdx >= 0 ? args[fileIdx + 1] : args[1]
  handleImport(filePath)
} else {
  console.log('Comandos disponíveis:')
  console.log('  node scripts/quiz-cli.js stats')
  console.log('  node scripts/quiz-cli.js stats --production')
  console.log('  node scripts/quiz-cli.js validate --file <caminho.json>')
  console.log('  node scripts/quiz-cli.js deduplicate --file <caminho.json>')
  console.log('  node scripts/quiz-cli.js import --file <caminho.json>')
}
