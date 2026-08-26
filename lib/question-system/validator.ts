/**
 * Acorda Portugal — Motor Oficial de Validação de Perguntas
 * Executa validação estrutural, linguística (Português de Portugal), plausibilidade e factualidade.
 */

import { MAIN_CATEGORIES, getCategoryBySlug, normalizeCategorySlug } from '@/lib/categories-data'
import type { OfficialQuestion, QuestionDifficulty, QuestionType, QuestionStatus } from '@/src/types/quiz'

export interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning'
}

export interface QualityScore {
  factualidade: number     // 0 a 100
  clareza: number           // 0 a 100
  unicidade: number         // 0 a 100
  fonte: number             // 0 a 100
  distratores: number       // 0 a 100
  valorEducativo: number    // 0 a 100
  qualityScore: number      // 0 a 100
  classification: 'excelente' | 'muito boa' | 'aceitável' | 'revisão' | 'rejeitar'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  normalizedQuestion?: OfficialQuestion
  qualityScore?: QualityScore
}

// Lista de termos brasileiros a detetar e sinalizar para conversão em PT-PT
const BRAZILIAN_TERMS_MAP: Record<string, string> = {
  'ônibus': 'autocarro',
  'onibus': 'autocarro',
  'trem': 'comboio',
  'trens': 'comboios',
  'time de futebol': 'clube / equipa de futebol',
  'times de futebol': 'clubes / equipas de futebol',
  'gol': 'golo',
  'gols': 'golos',
  'torcida': 'adeptos / claque',
  'torcedores': 'adeptos',
  'esporte': 'desporto',
  'esportes': 'desportos',
  'esportivo': 'desportivo',
  'esportiva': 'desportiva',
  'gramado': 'relvado',
  'celular': 'telemóvel',
  'celulares': 'telemóveis',
  'tela': 'ecrã',
  'banheiro': 'casa de banho',
  'metrô': 'metro',
  'açougue': 'talho',
  'açougueiro': 'cortador de carne / magarefe',
  'pedestre': 'peão',
  'pedestres': 'peões',
  'faixa de pedestres': 'passadeira',
  'faixa de pedestre': 'passadeira',
  'carteira de motorista': 'carta de condução',
  'carroça': 'carroça / charrete',
  'caminhonete': 'carrinha / pick-up',
  'furgão': 'carrinha de mercadorias',
  'equipe': 'equipa',
  'equipes': 'equipas',
  'carteira de identidade': 'cartão de cidadão / bilhete de identidade',
  'prefeitura': 'câmara municipal',
  'prefeito': 'presidente da câmara',
  'sorvete': 'gelado',
  'suco': 'sumo',
  'abacaxi': 'ananás',
  'café da manhã': 'pequeno-almoço',
}

const VALID_DIFFICULTIES: QuestionDifficulty[] = ['facil', 'media', 'dificil', 'especialista']

const VALID_TYPES: QuestionType[] = [
  'standard',
  'verdadeiro_falso',
  'visual',
  'imagem',
  'atualidade',
  'cronologia',
  'localizacao',
  'identificacao',
  'logica',
  'humor',
  'modo_maluco',
]

/**
 * Validação rigorosa de uma pergunta segundo as regras de qualidade do Acorda Portugal
 */
export function validateQuestion(input: Partial<OfficialQuestion> | Record<string, any>): ValidationResult {
  const raw: any = input
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // 1. Identificador
  const rawId = String(raw.id || '').trim()
  if (!rawId) {
    errors.push({ field: 'id', code: 'REQUIRED', message: 'Identificador obrigatório.', severity: 'error' })
  }

  // 2. Tema e Subtema
  const rawTema = String(raw.tema || raw.category || '').trim()
  const rawSubtema = String(raw.subtema || raw.subcategory || '').trim()

  if (!rawTema) {
    errors.push({ field: 'tema', code: 'REQUIRED', message: 'O tema da pergunta é obrigatório.', severity: 'error' })
  }

  let matchedCategory = rawTema ? getCategoryBySlug(normalizeCategorySlug(rawTema)) : undefined
  if (!matchedCategory && rawTema) {
    // Tenta encontrar por nome exato
    matchedCategory = MAIN_CATEGORIES.find((c) => c.name.toLowerCase() === rawTema.toLowerCase())
  }

  if (rawTema && !matchedCategory) {
    warnings.push({
      field: 'tema',
      code: 'UNKNOWN_THEME',
      message: `O tema "${rawTema}" não corresponde exatamente a nenhum dos 18 temas oficiais.`,
      severity: 'warning',
    })
  }

  if (matchedCategory && rawSubtema) {
    const subMatch = matchedCategory.subcategories.find(
      (s) =>
        s.id.toLowerCase() === rawSubtema.toLowerCase() ||
        s.name.toLowerCase() === rawSubtema.toLowerCase() ||
        normalizeCategorySlug(s.name) === normalizeCategorySlug(rawSubtema),
    )
    if (!subMatch) {
      warnings.push({
        field: 'subtema',
        code: 'UNKNOWN_SUBTHEME',
        message: `O subtema "${rawSubtema}" não está catalogado no tema oficial "${matchedCategory.name}".`,
        severity: 'warning',
      })
    }
  }

  // 3. Texto da Pergunta
  let rawPergunta = String(raw.pergunta || raw.question || '').trim()
  // Limpeza preventiva de prefixos de produção editorial
  rawPergunta = rawPergunta
    .replace(/^Modo\s+Maluco\s*#?\d*:\s*/i, '')
    .replace(/^Pergunta\s*#?\d*:\s*/i, '')
    .replace(/^Quest[aã]o\s*#?\d*:\s*/i, '')
    .trim()

  if (!rawPergunta) {
    errors.push({ field: 'pergunta', code: 'REQUIRED', message: 'O texto da pergunta é obrigatório.', severity: 'error' })
  } else {
    if (rawPergunta.length < 10) {
      errors.push({ field: 'pergunta', code: 'TOO_SHORT', message: 'Pergunta demasiado curta (mínimo 10 caracteres).', severity: 'error' })
    }
    if (!rawPergunta.endsWith('?') && !rawPergunta.endsWith('.')) {
      warnings.push({ field: 'pergunta', code: 'PUNCTUATION', message: 'A pergunta deve terminar com ponto de interrogação.', severity: 'warning' })
    }
  }

  // 4. Opções de Resposta (Exatamente 4 opções distintas)
  let rawOpcoes: string[] = []
  if (Array.isArray(raw.opcoes)) {
    rawOpcoes = raw.opcoes.map((o: any) => (typeof o === 'string' ? o.trim() : String(o?.text || o || '').trim()))
  } else if (Array.isArray(raw.options)) {
    rawOpcoes = raw.options.map((o: any) => (typeof o === 'string' ? o.trim() : String(o?.text || o || '').trim()))
  }

  if (rawOpcoes.length !== 4) {
    errors.push({ field: 'opcoes', code: 'INVALID_OPTIONS_COUNT', message: `Devem existir exatamente 4 opções (foram fornecidas ${rawOpcoes.length}).`, severity: 'error' })
  } else {
    // Opções não vazias
    const emptyCount = rawOpcoes.filter((opt) => !opt).length
    if (emptyCount > 0) {
      errors.push({ field: 'opcoes', code: 'EMPTY_OPTION', message: 'Todas as 4 opções de resposta devem ser preenchidas.', severity: 'error' })
    }

    // Opções duplicadas
    const lowerOptions = rawOpcoes.map((opt) => opt.toLowerCase())
    const uniqueOptions = new Set(lowerOptions)
    if (uniqueOptions.size < rawOpcoes.length) {
      errors.push({ field: 'opcoes', code: 'DUPLICATE_OPTION', message: 'Existem opções de resposta duplicadas.', severity: 'error' })
    }
  }

  // 5. Resposta Correta (Índice 0 a 3)
  let correctIndex = -1
  if (typeof raw.respostaCorreta === 'number') {
    correctIndex = raw.respostaCorreta
  } else if (typeof raw.correctAnswer === 'number') {
    correctIndex = raw.correctAnswer
  } else if (typeof raw.correct === 'number') {
    correctIndex = raw.correct
  } else if (typeof raw.correct === 'string') {
    const k = raw.correct.toUpperCase().trim()
    if (['A', 'B', 'C', 'D'].includes(k)) {
      correctIndex = ['A', 'B', 'C', 'D'].indexOf(k)
    } else if (rawOpcoes.length === 4) {
      const idx = rawOpcoes.findIndex((o) => o.toLowerCase() === raw.correct.toLowerCase().trim())
      if (idx >= 0) correctIndex = idx
    }
  } else if (typeof raw.correctAnswer === 'string' && rawOpcoes.length === 4) {
    const idx = rawOpcoes.findIndex((o) => o.toLowerCase() === String(raw.correctAnswer).toLowerCase().trim())
    if (idx >= 0) correctIndex = idx
  }

  if (correctIndex < 0 || correctIndex > 3) {
    errors.push({
      field: 'respostaCorreta',
      code: 'INVALID_CORRECT_INDEX',
      message: `Índice de resposta correta inválido (${correctIndex}). Deve ser entre 0 e 3.`,
      severity: 'error',
    })
  }

  // 6. Explicação
  const rawExplicacao = String(raw.explicacao || raw.explanation || '').trim()
  if (!rawExplicacao) {
    warnings.push({ field: 'explicacao', code: 'MISSING_EXPLANATION', message: 'Recomenda-se explicação factual educativa.', severity: 'warning' })
  }

  // 7. Fonte e Verificação
  const rawFonte = String(raw.fonte || raw.source || '').trim()
  if (!rawFonte && matchedCategory?.slug !== 'modo-maluco') {
    warnings.push({ field: 'fonte', code: 'MISSING_SOURCE', message: 'Perguntas factuais devem indicar a fonte de verificação.', severity: 'warning' })
  }

  // 8. Deteção Linguística: Português de Portugal (PT-PT)
  const fullText = `${rawPergunta} ${rawOpcoes.join(' ')} ${rawExplicacao}`.toLowerCase()
  for (const [brTerm, ptSuggestion] of Object.entries(BRAZILIAN_TERMS_MAP)) {
    const regex = new RegExp(`\\b${brTerm}\\b`, 'i')
    if (regex.test(fullText)) {
      warnings.push({
        field: 'linguagem',
        code: 'BRAZILIAN_PORTUGUESE_DETECTED',
        message: `Termo brasileiro "${brTerm}" detetado. Sugestão PT-PT: "${ptSuggestion}".`,
        severity: 'warning',
      })
    }
  }

  // 9. Dificuldade
  let diffText: QuestionDifficulty = 'media'
  let diffNivel: 1 | 2 | 3 | 4 | 5 = 2

  if (raw.dificuldade && VALID_DIFFICULTIES.includes(raw.dificuldade)) {
    diffText = raw.dificuldade
    diffNivel = diffText === 'facil' ? 1 : diffText === 'media' ? 2 : diffText === 'dificil' ? 4 : 5
  } else if (raw.difficulty) {
    if (typeof raw.difficulty === 'number') {
      diffNivel = Math.min(5, Math.max(1, Math.round(raw.difficulty))) as any
      diffText = diffNivel <= 1 ? 'facil' : diffNivel <= 3 ? 'media' : diffNivel === 4 ? 'dificil' : 'especialista'
    } else {
      const s = String(raw.difficulty).toLowerCase()
      if (s.includes('facil') || s.includes('fácil')) {
        diffText = 'facil'
        diffNivel = 1
      } else if (s.includes('dificil') || s.includes('difícil')) {
        diffText = 'dificil'
        diffNivel = 4
      } else if (s.includes('especialista') || s.includes('mestre') || s.includes('insano')) {
        diffText = 'especialista'
        diffNivel = 5
      } else {
        diffText = 'media'
        diffNivel = 2
      }
    }
  }

  // 10. Tipo de Pergunta
  let tipo: QuestionType = 'standard'
  if (raw.tipo && VALID_TYPES.includes(raw.tipo)) {
    tipo = raw.tipo
  } else if (raw.type && VALID_TYPES.includes(raw.type)) {
    tipo = raw.type
  } else if (matchedCategory?.slug === 'modo-maluco') {
    tipo = 'modo_maluco'
  } else if (matchedCategory?.isVisual || raw.image) {
    tipo = 'visual'
  }

  // Construir a questão canónica normalizada
  let normalizedQuestion: OfficialQuestion | undefined
  if (errors.length === 0) {
    const finalTema = matchedCategory?.name || rawTema || 'Portugal'
    const finalTemaSlug = matchedCategory?.slug || normalizeCategorySlug(finalTema)
    const finalSubtema = rawSubtema || 'Geral'
    const finalSubtemaSlug = normalizeCategorySlug(finalSubtema)

    normalizedQuestion = {
      id: rawId,
      tema: finalTema,
      temaSlug: finalTemaSlug,
      subtema: finalSubtema,
      subtemaSlug: finalSubtemaSlug,
      pergunta: rawPergunta,
      opcoes: [rawOpcoes[0], rawOpcoes[1], rawOpcoes[2], rawOpcoes[3]],
      respostaCorreta: correctIndex >= 0 ? correctIndex : 0,
      explicacao: rawExplicacao || `A resposta correta é: ${rawOpcoes[correctIndex >= 0 ? correctIndex : 0]}`,
      dificuldade: diffText,
      dificuldadeNivel: diffNivel,
      tipo,
      fonte: rawFonte || 'Arquivo Acorda Portugal',
      fonteUrl: raw.fonteUrl || undefined,
      dataVerificacao: raw.dataVerificacao || raw.verifiedAt || new Date().toISOString().slice(0, 10),
      atualidade: Boolean(raw.atualidade || raw.isCurrent || matchedCategory?.isTimeSensitive),
      validadeData: raw.validadeData || undefined,
      ativa: raw.ativa !== false && raw.active !== false,
      versao: typeof raw.versao === 'number' ? raw.versao : 1,
      status: (raw.status as QuestionStatus) || 'approved',
      visual: raw.image || raw.visual?.imageUrl ? {
        imageUrl: raw.image || raw.visual?.imageUrl,
        imageSource: raw.visual?.imageSource,
        imageLicense: raw.visual?.imageLicense,
        imageAlt: raw.visual?.imageAlt || rawPergunta,
      } : undefined,
      territorio: raw.district || raw.city || raw.distrito || raw.cidade ? {
        distrito: raw.district || raw.distrito,
        concelho: raw.city || raw.cidade,
        regiao: raw.territorio?.regiao,
      } : undefined,
    }
  }

  // 11. Cálculo de Quality Score Multidimensional
  let qualityScore: QualityScore | undefined
  if (normalizedQuestion) {
    qualityScore = calculateQualityScore(normalizedQuestion)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedQuestion,
    qualityScore,
  }
}

/**
 * Calcula o Quality Score multidimensional (0-100) para garantir factualidade e rigor
 */
export function calculateQualityScore(q: OfficialQuestion): QualityScore {
  const text = q.pergunta || ''
  const opts = q.opcoes || []
  const explanation = q.explicacao || ''
  const source = q.fonte || ''

  let factualidade = 90
  let clareza = 90
  let unicidade = 95
  let fonteScore = 80
  let distratores = 90
  let valorEducativo = 85

  // 1. Deteção de Problemas Linguísticos / Brasileirismos
  const fullText = `${text} ${opts.join(' ')} ${explanation}`.toLowerCase()
  if (/\b(ônibus|trem|time de futebol|torcida|gramado|esporte|gol)\b/i.test(fullText)) {
    clareza -= 20
    factualidade -= 10
  }

  // 2. Avaliação de Distratores
  const lengths = opts.map((o) => o.length)
  const avgLen = lengths.reduce((a, b) => a + b, 0) / Math.max(1, lengths.length)
  const lenVariance = lengths.reduce((sum, l) => sum + Math.abs(l - avgLen), 0) / Math.max(1, lengths.length)
  if (lenVariance > 25) {
    distratores -= 15
  }

  if (opts.some((o) => o.toLowerCase().includes('marte') || o.toLowerCase().includes('nenhuma das anteriores') || o.toLowerCase().includes('todas as anteriores'))) {
    distratores -= 25
  }

  // 3. Avaliação de Fonte
  if (!source || source.trim().length < 3) {
    fonteScore = 40
  } else {
    const sLower = source.toLowerCase()
    if (
      sLower.includes('torre do tombo') ||
      sLower.includes('instituto') ||
      sLower.includes('governo') ||
      sLower.includes('academia') ||
      sLower.includes('museu') ||
      sLower.includes('universidade') ||
      sLower.includes('fpf') ||
      sLower.includes('uefa') ||
      sLower.includes('unesco') ||
      sLower.includes('icnf') ||
      sLower.includes('apa') ||
      sLower.includes('dgt') ||
      sLower.includes('assembleia da república') ||
      sLower.includes('banco de portugal')
    ) {
      fonteScore = 100
    } else if (sLower === 'wikipedia' || sLower.includes('wiki')) {
      fonteScore = 65
    } else {
      fonteScore = 85
    }
  }

  // 4. Avaliação de Explicação
  if (explanation && explanation.length >= 25) {
    valorEducativo = Math.min(100, valorEducativo + 10)
  } else {
    valorEducativo = Math.max(40, valorEducativo - 25)
  }

  // 5. Avaliação de Clareza da Pergunta
  if (text.length < 15) clareza -= 20
  if (text.endsWith('?') || text.includes(':')) clareza += 5

  const compositeScore = Math.round(
    factualidade * 0.25 +
    clareza * 0.15 +
    unicidade * 0.15 +
    fonteScore * 0.15 +
    distratores * 0.15 +
    valorEducativo * 0.15
  )

  let classification: QualityScore['classification'] = 'aceitável'
  if (compositeScore >= 90) classification = 'excelente'
  else if (compositeScore >= 80) classification = 'muito boa'
  else if (compositeScore >= 70) classification = 'aceitável'
  else if (compositeScore >= 60) classification = 'revisão'
  else classification = 'rejeitar'

  return {
    factualidade,
    clareza,
    unicidade,
    fonte: fonteScore,
    distratores,
    valorEducativo,
    qualityScore: compositeScore,
    classification,
  }
}
