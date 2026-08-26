/**
 * Acorda Portugal — Motor de Anti-Duplicação e Deduplicação Semântica
 * Deteta perguntas duplicadas exatas, perguntas quase iguais, inversões e reformulações de factos.
 */

import type { OfficialQuestion, Question } from '@/src/types/quiz'

export interface DuplicateMatch {
  incomingId: string
  existingId: string
  type: 'EXACT_HASH' | 'SEMANTIC_FINGERPRINT' | 'SIMILARITY_HIGH'
  score: number // 0 a 1 (1 = 100% duplicado)
  incomingText: string
  existingText: string
  reason: string
}

export interface DeduplicationReport {
  totalChecked: number
  uniqueCount: number
  duplicateCount: number
  duplicates: DuplicateMatch[]
  cleanQuestions: (OfficialQuestion | Question)[]
}

const STOP_WORDS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'de', 'da', 'do', 'das', 'dos', 'd',
  'em', 'no', 'na', 'nos', 'nas',
  'por', 'para', 'pra', 'com', 'sem', 'sob', 'sobre',
  'que', 'se', 'e', 'ou', 'mas', 'porque', 'como',
  'foi', 'era', 'sao', 'são', 'foram', 'ser', 'estar', 'estava', 'tem', 'tinha',
  'qual', 'quais', 'quem', 'onde', 'quando', 'quanto', 'quantos', 'quantas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas', 'aquele', 'aquela',
  'portugal', 'portugues', 'portuguesa', 'portugueses', 'portuguesas',
])

const QUESTION_PREFIX_REGEX = /^(quem\s+foi(\s+o|\s+a)?|qual\s+(foi|e|era|seria)(\s+o|\s+a)?|em\s+que\s+(ano|data|seculo|decada|dia|mes|cidade|distrito|regiao|pais)|quando\s+(nasceu|morreu|aconteceu|foi|ocorreu)|onde\s+(fica|se\s+localiza|nasceu|morreu|situa-se)|diga\s+qual|indique\s+(o|a)?|qual\s+o\s+nome(\s+do|\s+da)?)\s*/gi

/**
 * Remove acentuação e diacríticos
 */
export function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Normaliza o texto cru para comparação
 */
export function normalizeText(text: string): string {
  if (!text) return ''
  return removeDiacritics(text.toLowerCase())
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Gera um Fingerprint Semântico da pergunta (remoção de fórmulas, stop words e ordenação de lemas)
 */
export function getSemanticFingerprint(questionText: string): string {
  if (!questionText) return ''

  let text = removeDiacritics(questionText.toLowerCase().trim())
  // Remove prefixos comuns de quiz ("Quem foi...", "Em que ano...", etc.)
  text = text.replace(QUESTION_PREFIX_REGEX, '')
  // Limpa pontuação
  text = text.replace(/[^\w\s]/g, ' ')

  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))

  // Ordena os tokens semânticos para tornar a ordem das palavras invariante
  tokens.sort()
  return tokens.join('_')
}

/**
 * Gera um Fingerprint Exato de texto + opções ordenadas
 */
export function getExactFingerprint(questionText: string, options: string[]): string {
  const normQ = normalizeText(questionText)
  const normOpts = [...options].map(normalizeText).sort().join('|')
  return `${normQ}:::${normOpts}`
}

/**
 * Calcula a distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0
  const bn = b ? b.length : 0
  if (an === 0) return bn
  if (bn === 0) return an

  const matrix: number[][] = []
  for (let i = 0; i <= bn; ++i) matrix[i] = [i]
  for (let i = 0; i <= an; ++i) matrix[0][i] = i

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1,     // remoção
        )
      }
    }
  }
  return matrix[bn][an]
}

/**
 * Calcula a similaridade entre duas frases (0.0 a 1.0)
 */
export function calculateTextSimilarity(strA: string, strB: string): number {
  const normA = normalizeText(strA)
  const normB = normalizeText(strB)

  if (normA === normB) return 1.0
  if (!normA || !normB) return 0.0

  // 1. Jaccard nos tokens
  const setA = new Set(normA.split(' ').filter(Boolean))
  const setB = new Set(normB.split(' ').filter(Boolean))

  let intersection = 0
  for (const item of setA) {
    if (setB.has(item)) intersection++
  }
  const union = new Set([...setA, ...setB]).size
  const jaccardScore = union > 0 ? intersection / union : 0

  // 2. Levenshtein ratio
  const maxLen = Math.max(normA.length, normB.length)
  const levDist = levenshteinDistance(normA, normB)
  const levScore = maxLen > 0 ? 1 - levDist / maxLen : 0

  return jaccardScore * 0.6 + levScore * 0.4
}

/**
 * Deduplica uma lista de perguntas contra si mesma e contra um banco existente
 */
export function deduplicateQuestions(
  incomingQuestions: (OfficialQuestion | Question | any)[],
  existingPool: (OfficialQuestion | Question | any)[] = [],
  similarityThreshold = 0.82,
): DeduplicationReport {
  const duplicates: DuplicateMatch[] = []
  const cleanQuestions: any[] = []

  // Mapas de indexação para busca rápida O(1)
  const exactMap = new Map<string, string>() // exactHash -> id
  const semanticMap = new Map<string, { id: string; text: string }>() // semanticFingerprint -> { id, text }
  const existingList: { id: string; text: string; semantic: string }[] = []

  // 1. Indexar o banco existente
  for (const q of existingPool) {
    const qId = String(q.id)
    const qText = String(q.pergunta || q.question || '')
    const qOpts = Array.isArray(q.opcoes) ? q.opcoes : Array.isArray(q.options) ? q.options : []
    const optsStrings = qOpts.map((o: any) => typeof o === 'string' ? o : o.text || '')

    const exactHash = getExactFingerprint(qText, optsStrings)
    exactMap.set(exactHash, qId)

    const semantic = getSemanticFingerprint(qText)
    if (semantic && semantic.length > 5) {
      semanticMap.set(semantic, { id: qId, text: qText })
      existingList.push({ id: qId, text: qText, semantic })
    }
  }

  // 2. Avaliar cada pergunta recebida
  for (const q of incomingQuestions) {
    const qId = String(q.id || `temp_${cleanQuestions.length + 1}`)
    const qText = String(q.pergunta || q.question || '')
    const qOpts = Array.isArray(q.opcoes) ? q.opcoes : Array.isArray(q.options) ? q.options : []
    const optsStrings = qOpts.map((o: any) => typeof o === 'string' ? o : o.text || '')

    const exactHash = getExactFingerprint(qText, optsStrings)
    const semantic = getSemanticFingerprint(qText)

    // Teste 1: Duplicação Exata
    if (exactMap.has(exactHash)) {
      const matchId = exactMap.get(exactHash)!
      duplicates.push({
        incomingId: qId,
        existingId: matchId,
        type: 'EXACT_HASH',
        score: 1.0,
        incomingText: qText,
        existingText: qText,
        reason: 'Pergunta e opções idênticas a uma pergunta já existente.',
      })
      continue
    }

    // Teste 2: Fingerprint Semântico Idêntico (Mesmos conceitos-chave semânticos)
    if (semantic && semantic.length > 5 && semanticMap.has(semantic)) {
      const match = semanticMap.get(semantic)!
      duplicates.push({
        incomingId: qId,
        existingId: match.id,
        type: 'SEMANTIC_FINGERPRINT',
        score: 0.95,
        incomingText: qText,
        existingText: match.text,
        reason: `Reformula semântica da pergunta já existente: "${match.text}".`,
      })
      continue
    }

    // Teste 3: Similaridade de Texto Alta (> similarityThreshold)
    let isSimilarDuplicate = false
    for (const ex of existingList) {
      const sim = calculateTextSimilarity(qText, ex.text)
      if (sim >= similarityThreshold) {
        duplicates.push({
          incomingId: qId,
          existingId: ex.id,
          type: 'SIMILARITY_HIGH',
          score: Number(sim.toFixed(3)),
          incomingText: qText,
          existingText: ex.text,
          reason: `Elevada similaridade semântica (${(sim * 100).toFixed(1)}%) com: "${ex.text}".`,
        })
        isSimilarDuplicate = true
        break
      }
    }

    if (isSimilarDuplicate) {
      continue
    }

    // Pergunta Aprovada / Única -> Adiciona aos índices para prevenir duplicações internas no lote
    exactMap.set(exactHash, qId)
    if (semantic && semantic.length > 5) {
      semanticMap.set(semantic, { id: qId, text: qText })
      existingList.push({ id: qId, text: qText, semantic })
    }
    cleanQuestions.push(q)
  }

  return {
    totalChecked: incomingQuestions.length,
    uniqueCount: cleanQuestions.length,
    duplicateCount: duplicates.length,
    duplicates,
    cleanQuestions,
  }
}
