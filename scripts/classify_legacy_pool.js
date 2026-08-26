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

function normalizeSlug(str) {
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

// 1. Carregar 233 Subtemas
const manifestSubthemes = loadJson('data/editorial_accounting_manifest.json')
console.log(`✓ 233 Subtemas carregados do manifesto.`)

// Mapeamento de Palavras-Chave e Padrões Semânticos por Tema e Subtema
const subthemeKeywords = [
  // PORTUGAL
  { theme: 'portugal', subtheme: 'Monumentos Nacionais', keywords: ['mosteiro', 'convento', 'palacio', 'torre de belem', 'jeronimos', 'batalha', 'alcobaca', 'pena', 'castelo de guimaraes', 'castelo de sao jorge', 'monumento'] },
  { theme: 'portugal', subtheme: 'Praias', keywords: ['praia', 'costa', 'areal', 'algarve', 'nazare', 'ondas', 'litoral', 'mar', 'surf', 'arriba'] },
  { theme: 'portugal', subtheme: 'Vilas e Aldeias', keywords: ['aldeia', 'vila', 'monsaraz', 'marvao', 'piodao', 'sortelha', 'aldeias do xisto', 'aldeias historicas'] },
  { theme: 'portugal', subtheme: 'Símbolos Nacionais', keywords: ['bandeira', 'hino', 'a portuguesa', 'escudo', 'esfera armilar', 'galo de barcelos', 'armas'] },
  { theme: 'portugal', subtheme: 'Festas e Romarias', keywords: ['festa', 'romaria', 'sao joao', 'santo antonio', 'senhora da agonia', 'tabuleiros', 'caretos', 'folclore', 'arraial'] },
  { theme: 'portugal', subtheme: 'Artesanato', keywords: ['artesanato', 'azulejo', 'filigrana', 'renda de bilros', 'bordado', 'olaria', 'barcelos', 'cortica'] },
  { theme: 'portugal', subtheme: 'Ilhas: Açores e Madeira', keywords: ['acores', 'madeira', 'funchal', 'ponta delgada', 'sao miguel', 'pico', 'laurisilva', 'vulcao', 'levada'] },
  { theme: 'portugal', subtheme: 'Rios e Serras', keywords: ['rio tejo', 'rio douro', 'rio guadiana', 'rio mondego', 'serra da estrela', 'serra do geres', 'geres', 'marapicos', 'rio'] },

  // HISTÓRIA
  { theme: 'historia', subtheme: 'Fundação de Portugal', keywords: ['d. afonso henriques', 'afonso henriques', 'tratado de zamora', 'batalha de sao mamede', 'guimaraes', 'd. teresa', 'conde d. henrique', 'fundacao', '1143', '1128'] },
  { theme: 'historia', subtheme: 'Descobrimentos', keywords: ['descobrimentos', 'caravela', 'vasco da gama', 'pedro alvares cabral', 'infante d. henrique', 'bartolomeu dias', 'cabo da boa esperanca', 'brasil', 'india', 'tratado de tordesilhas', 'nau'] },
  { theme: 'historia', subtheme: 'Restauração da Independência', keywords: ['1640', 'restauracao', 'd. joao iv', 'duque de braganca', 'filipes', 'dominio filipino', '1 de dezembro'] },
  { theme: 'historia', subtheme: 'Monarquia Portuguesa', keywords: ['rei', 'rainha', 'd. dinis', 'd. joao ii', 'd. manuel i', 'd. maria i', 'd. carlos', 'dinastia', 'afonsina', 'avis', 'braganca'] },
  { theme: 'historia', subtheme: 'Implantação da República', keywords: ['5 de outubro de 1910', 'republica', 'manuel de arriaga', 'teofilo braga', 'regicidio', '1910', 'republicanos'] },
  { theme: 'historia', subtheme: 'Estado Novo e 25 de Abril', keywords: ['25 de abril', 'salazar', 'marcelo caetano', 'estado novo', 'revolucao dos cravos', 'mfa', 'pide', 'cravo', 'grandola vila morena', '1974'] },
  { theme: 'historia', subtheme: 'Batalhas Históricas', keywords: ['batalha de aljubarrota', 'aljubarrota', 'ourique', 'salado', 'montes claros', 'batalha do vimeiro', 'linhas de torres'] },

  // GASTRONOMIA
  { theme: 'gastronomia', subtheme: 'Pratos Tradicionais', keywords: ['bacalhau', 'cozido a portuguesa', 'francesinha', 'feijoada', 'tripas a moda do porto', 'caldo verde', 'sardinha', 'amêijoas', 'carne de porco a alentejana', 'leitao'] },
  { theme: 'gastronomia', subtheme: 'Doçaria Conventual', keywords: ['pastel de nata', 'ovos moles', 'toucinho do ceu', 'pao de lo', 'travesseiro de sintra', 'queijada', 'convento', 'doce', 'fios de ovos'] },
  { theme: 'gastronomia', subtheme: 'Vinhos de Portugal', keywords: ['vinho do porto', 'vinho verde', 'alentejo', 'douro', 'dao', 'bairrada', 'casta', 'touriga nacional', 'vinho', 'adega', 'vindima'] },
  { theme: 'gastronomia', subtheme: 'Queijos e Enchidos', keywords: ['queijo da serra', 'queijo de azeitao', 'queijo de sao jorge', 'alheira', 'chourico', 'morcela', 'farinheira', 'presunto'] },
  { theme: 'gastronomia', subtheme: 'Petiscos e Marisco', keywords: ['petisco', 'marisco', 'caracois', 'percebes', 'chocos', 'sapateira', 'polvo a lagareiro', 'pataniscas', 'pica-pau'] },

  // FUTEBOL PORTUGUÊS
  { theme: 'futebol-portugues', subtheme: 'Seleção Nacional', keywords: ['selecao', 'selecao nacional', 'euro 2016', 'campeonato do mundo', 'quinas', 'cristiano ronaldo', 'ronaldo', 'figo', 'eusebio', 'pepe', 'fernando santos'] },
  { theme: 'futebol-portugues', subtheme: 'Grandes Clubes', keywords: ['benfica', 'porto', 'sporting', 'braga', 'vitoria de guimaraes', 'campeao nacional', 'taca de portugal', 'estadio da luz', 'estadio do dragao', 'estadio jose alvalade'] },
  { theme: 'futebol-portugues', subtheme: 'Futebol Feminino', keywords: ['futebol feminino', 'selecao feminina', 'liga bpi', 'kika nazareth', 'jessica silva', 'carole costa', 'telma encarnacao', 'mundial feminino'] },
  { theme: 'futebol-portugues', subtheme: 'Treinadores Lendários', keywords: ['jose mourinho', 'mourinho', 'jorge jesus', 'ruben amorim', 'arthur jorge', 'otto gloria', 'treinador', 'mister'] },
  { theme: 'futebol-portugues', subtheme: 'Lendas do Futebol', keywords: ['eusebio', 'figo', 'paulo futre', 'chalana', 'damas', 'manuel bento', 'vitor baia', 'coluna', 'matateu'] },

  // CULTURA
  { theme: 'cultura', subtheme: 'Literatura Portuguesa', keywords: ['camoes', 'lusiadas', 'fernando pessoa', 'eça de queiros', 'saramago', 'memorial do convento', 'sophia de mello breyner', 'cesario verde', 'livro', 'romance', 'poema', 'poeta'] },
  { theme: 'cultura', subtheme: 'Fado e Música Popular', keywords: ['fado', 'amalia rodrigues', 'mariza', 'ana moura', 'guitarra portuguesa', 'carlos do carmo', 'fado de coimbra', 'fadista', 'cancioneiro'] },
  { theme: 'cultura', subtheme: 'Teatro e Cinema', keywords: ['gil vicente', 'auto da barca do inferno', 'manoel de oliveira', 'teatro', 'filme', 'cinema portugues', 'ator', 'atriz', 'comedia a portuguesa'] },
  { theme: 'cultura', subtheme: 'Pintura e Escultura', keywords: ['amadeo de souza-cardoso', 'paula rego', 'júlio pomar', 'nuno goncalves', 'paineis de sao vicente', 'soares dos reis', 'pintor', 'quadro', 'escultura'] },

  // GEOGRAFIA
  { theme: 'geografia', subtheme: 'Distritos e Regiões', keywords: ['distrito', 'regiao', 'alentejo', 'algarve', 'minho', 'tras-os-montes', 'beira alta', 'beira baixa', 'estremadura', 'ribatejo'] },
  { theme: 'geografia', subtheme: 'Cidades de Portugal', keywords: ['lisboa', 'porto', 'coimbra', 'braga', 'evora', 'aveiro', 'faro', 'viseu', 'leiria', 'setubal', 'guimaraes', 'cidade'] },
  { theme: 'geografia', subtheme: 'Fronteiras e Pontos Extremos', keywords: ['cabo da roca', 'raia', 'espanha', 'ponto mais ocidental', 'rio minho', 'fronteira', 'cabo de sao vicente'] },

  // CIÊNCIA E TECNOLOGIA
  { theme: 'ciencia-tecnologia', subtheme: 'Cientistas Portugueses', keywords: ['egás moniz', 'nobel', 'garcia de orta', 'pedro nunes', 'bartolomeu de gusmao', 'passarola', 'cientista', 'investigador'] },
  { theme: 'ciencia-tecnologia', subtheme: 'Invenções e Descobertas', keywords: ['astrolabio', 'balestilha', 'nau', 'via verde', 'multibanco', 'invencao', 'tecnologia'] },

  // PORTUGAL POLÍTICO
  { theme: 'portugal-politico', subtheme: 'Constituição da República', keywords: ['constituicao', 'crp', '1976', 'direitos fundamentais', 'tribunal constitucional', 'assembleia da republica', 'deputado'] },
  { theme: 'portugal-politico', subtheme: 'Presidentes de Portugal', keywords: ['presidente da republica', 'marcelo rebelo de sousa', 'anibal cavaco silva', 'jorge sampaio', 'mario soares', 'ramalho eanes', 'belem'] },
  { theme: 'portugal-politico', subtheme: 'Governo e Parlamento', keywords: ['primeiro-ministro', 'governo', 'parlamento', 'assembleia da republica', 'palacio de sao bento', 'sao bento', 'eleicoes legislativas', 'voto'] },
]

// 2. Carregar todas as perguntas dos ficheiros de categorias
const categoryDatasets = [
  { slug: 'portugal', file: 'lib/data/categories/portugal.json' },
  { slug: 'futebol-portugues', file: 'lib/data/categories/futebol-portugues.json' },
  { slug: 'atualidade', file: 'lib/data/categories/atualidade.json' },
  { slug: 'portugal-politico', file: 'lib/data/categories/portugal-politico.json' },
  { slug: 'empresas-portuguesas', file: 'lib/data/categories/empresas-portuguesas.json' },
  { slug: 'historia', file: 'lib/data/categories/historia.json' },
  { slug: 'geografia', file: 'lib/data/categories/geografia.json' },
  { slug: 'ciencia-tecnologia', file: 'lib/data/categories/ciencia-tecnologia.json' },
  { slug: 'cultura', file: 'lib/data/categories/cultura.json' },
  { slug: 'gastronomia', file: 'lib/data/categories/gastronomia.json' },
  { slug: 'personalidades', file: 'lib/data/categories/personalidades.json' },
  { slug: 'mundo', file: 'lib/data/categories/mundo.json' },
  { slug: 'desporto', file: 'lib/data/categories/desporto.json' },
  { slug: 'humor', file: 'lib/data/categories/humor.json' },
  { slug: 'musica', file: 'lib/data/categories/musica.json' },
  { slug: 'cinema-tv', file: 'lib/data/categories/cinema-tv.json' },
  { slug: 'desafio-visual', file: 'lib/data/categories/desafio-visual.json' },
]

// 3. Algoritmo de Classificação Semântica com Score de Confiança
function classifyQuestion(doc, defaultTheme) {
  const text = (String(doc.question || doc.pergunta || '') + ' ' + String(doc.explanation || doc.explicacao || '') + ' ' + (Array.isArray(doc.options) ? doc.options.join(' ') : '')).toLowerCase()
  const currentSub = String(doc.subcategory || doc.subcategoria || doc.subtema || '').trim()

  // Se já tem subtema canónico exato nos 233 subtemas
  const directMatch = manifestSubthemes.find((m) => {
    return (
      (m.temaSlug === defaultTheme || normalizeSlug(m.tema) === defaultTheme) &&
      (normalizeSlug(m.subtema) === normalizeSlug(currentSub) || normalizeSlug(m.subtemaSlug) === normalizeSlug(currentSub))
    )
  })

  if (directMatch) {
    return {
      classified: true,
      theme: directMatch.temaSlug,
      subtheme: directMatch.subtema,
      subthemeSlug: directMatch.subtemaSlug,
      confidence: 1.0,
      tier: 'HIGH_CONFIDENCE',
      reason: 'Mapeamento Canónico Exato Pré-Existente',
    }
  }

  // Pesquisar por correspondência semântica de palavras-chave
  const themeRules = subthemeKeywords.filter((r) => r.theme === defaultTheme || defaultTheme === 'portugal')
  let bestCandidate = null
  let maxScore = 0

  for (const rule of themeRules) {
    let hits = 0
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        hits++
      }
    }
    if (hits > 0) {
      const score = Math.min(0.98, 0.70 + (hits * 0.10))
      if (score > maxScore) {
        maxScore = score
        bestCandidate = { rule, score }
      }
    }
  }

  if (bestCandidate && bestCandidate.score >= 0.85) {
    const manifestEntry = manifestSubthemes.find((m) => {
      return (
        (m.temaSlug === bestCandidate.rule.theme || normalizeSlug(m.tema) === bestCandidate.rule.theme) &&
        (normalizeSlug(m.subtema) === normalizeSlug(bestCandidate.rule.subtheme) || normalizeSlug(m.subtemaSlug) === normalizeSlug(bestCandidate.rule.subtheme))
      )
    })

    if (manifestEntry) {
      return {
        classified: true,
        theme: manifestEntry.temaSlug,
        subtheme: manifestEntry.subtema,
        subthemeSlug: manifestEntry.subtemaSlug,
        confidence: bestCandidate.score,
        tier: 'HIGH_CONFIDENCE',
        reason: `Correspondência Semântica com Palavras-Chave (${bestCandidate.score.toFixed(2)})`,
      }
    }
  }

  if (bestCandidate && bestCandidate.score >= 0.70) {
    return {
      classified: false,
      theme: defaultTheme,
      subtheme: bestCandidate.rule.subtheme,
      confidence: bestCandidate.score,
      tier: 'NEEDS_REVIEW',
      reason: `Confiança média (${bestCandidate.score.toFixed(2)}) requer revisão editorial`,
    }
  }

  return {
    classified: false,
    theme: defaultTheme,
    subtheme: currentSub || 'Genérico',
    confidence: 0.50,
    tier: 'UNCLASSIFIED',
    reason: 'Sem correspondência semântica de alta confiança',
  }
}

// 4. Executar Classificação em todos os ficheiros canónicos de categoria
let totalClassifiedHigh = 0
let totalNeedsReview = 0
let totalUnclassified = 0

const subthemeApprovedMap = new Map() // `${themeSlug}::${subthemeSlug}` -> count
manifestSubthemes.forEach((m) => {
  subthemeApprovedMap.set(`${m.temaSlug}::${m.subtemaSlug}`, 0)
})

categoryDatasets.forEach((ds) => {
  const questions = loadJson(ds.file)
  let updatedCount = 0

  const reclassifiedQuestions = questions.map((q) => {
    const res = classifyQuestion(q, ds.slug)

    if (res.tier === 'HIGH_CONFIDENCE') {
      totalClassifiedHigh++
      const key = `${res.theme}::${res.subthemeSlug}`
      subthemeApprovedMap.set(key, (subthemeApprovedMap.get(key) || 0) + 1)

      return {
        ...q,
        tema: q.tema || q.category || ds.slug,
        subtema: res.subtheme,
        subcategory: res.subtheme,
        confidenceScore: res.confidence,
      }
    } else if (res.tier === 'NEEDS_REVIEW') {
      totalNeedsReview++
      return q
    } else {
      totalUnclassified++
      return q
    }
  })

  // Gravar ficheiro canónico atualizado com os subtemas reclassificados
  fs.writeFileSync(path.join(rootDir, ds.file), JSON.stringify(reclassifiedQuestions, null, 2), 'utf8')
  console.log(`✓ Atualizado ${ds.file} (${reclassifiedQuestions.length} perguntas)`)
})

// 5. Atualizar Prioridade dos 233 Subtemas
const TARGET_PER_SUBTHEME = 2000
const updatedSubthemesList = manifestSubthemes.map((m) => {
  const key = `${m.temaSlug}::${m.subtemaSlug}`
  const approvedCount = subthemeApprovedMap.get(key) || 0
  const remaining = Math.max(0, TARGET_PER_SUBTHEME - approvedCount)
  const coveragePercent = Number(((approvedCount / TARGET_PER_SUBTHEME) * 100).toFixed(2))
  const status = approvedCount >= TARGET_PER_SUBTHEME ? 'COMPLETE' : approvedCount > 0 ? 'IN_PRODUCTION' : 'NOT_STARTED'

  return {
    tema: m.tema,
    temaSlug: m.temaSlug,
    subtema: m.subtema,
    subtemaSlug: m.subtemaSlug,
    target: TARGET_PER_SUBTHEME,
    approvedCount,
    remaining,
    coveragePercent,
    status,
  }
})

// Ordenar por prioridade:
// 1. Menor cobertura (NOT_STARTED primeiro)
// 2. Subtemas prioritários da identidade nacional
updatedSubthemesList.sort((a, b) => {
  if (a.status === 'NOT_STARTED' && b.status !== 'NOT_STARTED') return -1
  if (a.status !== 'NOT_STARTED' && b.status === 'NOT_STARTED') return 1
  return a.approvedCount - b.approvedCount
})

fs.writeFileSync(
  path.join(rootDir, 'data/desafio-nacional-subtheme-priority.json'),
  JSON.stringify(updatedSubthemesList, null, 2),
  'utf8'
)

// Atualizar também o manifesto oficial
fs.writeFileSync(
  path.join(rootDir, 'data/editorial_accounting_manifest.json'),
  JSON.stringify(updatedSubthemesList, null, 2),
  'utf8'
)

// Relatório de Classificação
const classificationReport = {
  timestamp: new Date().toISOString(),
  phase: 'FASE_2_2_CLASSIFICATION',
  totalClassifiedHighConfidence: totalClassifiedHigh,
  totalNeedsReview,
  totalUnclassified,
  totalSubthemesInProduction: updatedSubthemesList.filter((s) => s.status === 'IN_PRODUCTION').length,
  totalSubthemesNotStarted: updatedSubthemesList.filter((s) => s.status === 'NOT_STARTED').length,
  totalSubthemesComplete: updatedSubthemesList.filter((s) => s.status === 'COMPLETE').length,
  topPrioritySubthemes: updatedSubthemesList.slice(0, 15).map((s) => ({
    tema: s.tema,
    subtema: s.subtema,
    approvedCount: s.approvedCount,
    remaining: s.remaining,
    status: s.status,
  })),
}

fs.writeFileSync(
  path.join(rootDir, 'data/desafio-nacional-classification-report.json'),
  JSON.stringify(classificationReport, null, 2),
  'utf8'
)

console.log('✓ Classificação Concluída com Sucesso!')
console.log(`• Perguntas Classificadas com Alta Confiança (>= 0.85): ${totalClassifiedHigh}`)
console.log(`• Perguntas em Needs Review (0.70 - 0.8499): ${totalNeedsReview}`)
console.log(`• Perguntas Unclassified (< 0.70): ${totalUnclassified}`)
console.log(`• Subtemas em Produção: ${classificationReport.totalSubthemesInProduction} / 233`)
console.log(`• Subtemas Não Iniciados: ${classificationReport.totalSubthemesNotStarted} / 233`)
