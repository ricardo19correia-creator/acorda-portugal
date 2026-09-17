/**
 * Acorda Portugal — Motor Oficial de Banco de Dados de Perguntas Anti-Repetição Estrita
 * Arquitetura de Seleção Equitativa, Randomização Fisher-Yates e Janela Deslizante de Recentes.
 * Garante isolamento estrito de categorias e zero repetições dentro da partida.
 */

import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Question, QuizDifficulty } from '@/src/types/quiz'
import { QuestionRegistry } from '@/lib/question-system/registry'
import {
  getLocalUserHistory,
  fetchUserQuestionHistory,
  recordQuestionPresentedAndAnswered,
  recordQuestionBatchAnswered,
  reserveQuestionsForMatch,
  releaseUnusedQuestionsFromMatch,
  clearAllMemoryHistories,
} from '@/lib/question-history-service'

let cachedGlobalPool: Question[] | null = null

const RECENT_WINDOW_SIZE = 100
const LOCAL_STORAGE_RECENT_KEY = 'recent_question_ids'
const LOCAL_STORAGE_ANSWERED_KEY = 'answered_question_ids'

// Memória em runtime caso localStorage não esteja disponível (SSR / Node)
let memoryRecentIds: string[] = []

/**
 * Limpa prefixos indesejados no texto da pergunta
 */
export function cleanQuestionPrompt(text: string): string {
  if (!text) return ''
  return text
    .replace(/^Modo\s+Maluco\s*#?\d*:\s*/i, '')
    .replace(/^Pergunta\s*#?\d*:\s*/i, '')
    .replace(/^Quest[aã]o\s*#?\d*:\s*/i, '')
    .trim()
}

/**
 * Normaliza qualquer objeto de pergunta para a interface estrita Question
 */
export function normalizeQuestion(raw: any, index: number, defaultCategory = 'portugal'): Question {
  const id = raw.id ? String(raw.id) : `q_${index + 1}`
  const rawText = raw.question || raw.pergunta || 'Pergunta sem texto'
  const cleanText = cleanQuestionPrompt(rawText)

  // Normalização de opções
  let optionsList: string[] = []
  if (Array.isArray(raw.options)) {
    optionsList = raw.options.map((opt: any) => {
      if (typeof opt === 'string') return opt
      if (opt && typeof opt === 'object') return opt.text || opt.label || ''
      return String(opt || '')
    })
  } else if (Array.isArray(raw.opcoes)) {
    optionsList = raw.opcoes.map((opt: any) => {
      if (typeof opt === 'string') return opt
      if (opt && typeof opt === 'object') return opt.text || opt.label || ''
      return String(opt || '')
    })
  }

  while (optionsList.length < 4) {
    optionsList.push(`Opção ${optionsList.length + 1}`)
  }
  const optionsTuple: [string, string, string, string] = [
    optionsList[0],
    optionsList[1],
    optionsList[2],
    optionsList[3],
  ]

  // Normalização de correctAnswer (0 a 3)
  let correctIndex = 0
  if (typeof raw.correctAnswer === 'number' && raw.correctAnswer >= 0 && raw.correctAnswer <= 3) {
    correctIndex = raw.correctAnswer
  } else if (typeof raw.respostaCorreta === 'number' && raw.respostaCorreta >= 0 && raw.respostaCorreta <= 3) {
    correctIndex = raw.respostaCorreta
  } else if (typeof raw.correct === 'number' && raw.correct >= 0 && raw.correct <= 3) {
    correctIndex = raw.correct
  } else if (typeof raw.correct === 'string') {
    const key = raw.correct.toUpperCase()
    if (['A', 'B', 'C', 'D'].includes(key)) {
      correctIndex = ['A', 'B', 'C', 'D'].indexOf(key)
    } else {
      const idx = optionsList.findIndex((opt) => opt.trim().toLowerCase() === raw.correct.trim().toLowerCase())
      if (idx >= 0) correctIndex = idx
    }
  } else if (typeof raw.correctAnswer === 'string') {
    const idx = optionsList.findIndex((opt) => opt.trim().toLowerCase() === String(raw.correctAnswer).trim().toLowerCase())
    if (idx >= 0) correctIndex = idx
  }

  // Normalização de dificuldade (1 a 5)
  let difficulty: QuizDifficulty = 2
  if (typeof raw.difficulty === 'number') {
    const num = Math.round(raw.difficulty)
    difficulty = Math.min(5, Math.max(1, num)) as QuizDifficulty
  } else if (typeof raw.dificuldadeNivel === 'number') {
    const num = Math.round(raw.dificuldadeNivel)
    difficulty = Math.min(5, Math.max(1, num)) as QuizDifficulty
  } else if (typeof raw.difficulty === 'string' || typeof raw.dificuldade === 'string') {
    const diffStr = String(raw.difficulty || raw.dificuldade).toLowerCase().trim()
    if (diffStr.includes('facil') || diffStr.includes('fácil') || diffStr === '1') {
      difficulty = 1
    } else if (diffStr.includes('normal') || diffStr === '2') {
      difficulty = 2
    } else if (diffStr.includes('medio') || diffStr.includes('médio') || diffStr === '3') {
      difficulty = 3
    } else if (diffStr.includes('dificil') || diffStr.includes('difícil') || diffStr === '4') {
      difficulty = 4
    } else if (diffStr.includes('mestre') || diffStr.includes('especialista') || diffStr.includes('insano') || diffStr === '5') {
      difficulty = 5
    } else {
      difficulty = 2
    }
  }

  // Deteção estrita de categoria
  let category = (raw.category || raw.categoria || raw.tema || defaultCategory).trim()
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

  return {
    id,
    question: cleanText,
    options: optionsTuple,
    correctAnswer: correctIndex,
    difficulty,
    category,
    subcategory: raw.subcategory || raw.subcategoria || raw.subtema || raw.topic || undefined,
    district: raw.district || raw.distrito || undefined,
    city: raw.city || raw.cidade || undefined,
    explanation: raw.explanation || raw.explicacao || undefined,
    image: raw.image || raw.visual?.imageUrl || undefined,
  }
}

/**
 * Inicializa e agrega todas as perguntas do ecossistema numa base unificada com cache
 */
export function getAllQuestionsPool(): Question[] {
  if (cachedGlobalPool) {
    return cachedGlobalPool
  }

  const registry = QuestionRegistry.getInstance()
  cachedGlobalPool = registry.getAllQuestions()
  return cachedGlobalPool
}

/**
 * Carrega e filtra o pool de perguntas com base na categoria, subtema, dificuldade e filtros territoriais.
 * Garante ISOLAMENTO ESTRITO e suporte a "Tema Completo" e "Jogar Tudo":
 * - 'desafio-nacional' / 'portugal' / 'todos' -> EXCLUSIVAMENTE Desafio Nacional / Portugal / Geral (NUNCA Modo Maluco).
 * - 'modo-maluco' -> EXCLUSIVAMENTE Modo Maluco.
 * - Subtema Específico -> Seleciona perguntas filtradas pelo subtema.
 * - Tema Completo -> Mistura os subtemas da respetiva categoria.
 */
export function loadQuestionsPool(
  category?: string,
  difficultyLevel?: number,
  subcategory?: string,
  district?: string,
  city?: string,
): Question[] {
  const registry = QuestionRegistry.getInstance()
  const targetDiff = difficultyLevel ? (Math.min(5, Math.max(1, Number(difficultyLevel))) as QuizDifficulty) : undefined
  const catLower = (category || '').toLowerCase().trim()

  const isNational =
    !catLower ||
    catLower === 'desafio-nacional' ||
    catLower === 'desafio nacional' ||
    catLower === 'nacional' ||
    catLower === 'quick' ||
    catLower === 'todos' ||
    catLower === 'jogar-tudo'

  const isMaluco =
    catLower === 'modo-maluco' ||
    catLower === 'modo maluco' ||
    catLower === 'perguntas-idiotas' ||
    catLower === 'maluco' ||
    catLower.includes('maluco')

  const isRandom =
    catLower === 'modo-aleatorio' ||
    catLower === 'modo aleatorio' ||
    catLower === 'aleatorio' ||
    catLower === 'roleta'

  const isCity =
    catLower === 'desafio-cidade' ||
    catLower === 'desafio-da-cidade' ||
    catLower === 'cidade'

  const isDistrict =
    catLower === 'conquista-do-distrito' ||
    catLower === 'conquista-distrito' ||
    catLower === 'o-meu-distrito' ||
    catLower === 'distrito'

  let filtered: Question[] = []

  if (isNational) {
    // Jogar Tudo / Desafio Nacional (Garante 0% de Modo Maluco)
    filtered = registry.getJogarTudo(targetDiff)
  } else if (isMaluco) {
    // EXCLUSIVAMENTE Modo Maluco
    filtered = registry.getTemaCompleto('modo-maluco', targetDiff)
  } else if (isRandom) {
    // MODO ALEATÓRIO: Roleta com todas as categorias (exceto maluco) e dificuldades diversas
    filtered = shuffleQuestions(registry.getJogarTudo())
  } else if (isCity) {
    // DESAFIO DA CIDADE: Competição local e municipal (ruas, monumentos, freguesias, história e cultura local)
    const all = registry.getAllQuestions()
    const cityTarget = (city || '').toLowerCase().trim()

    filtered = all.filter((q) => {
      if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false
      if (cityTarget) {
        const matchesCityField = Boolean(q.city && (q.city.toLowerCase().includes(cityTarget) || cityTarget.includes(q.city.toLowerCase())))
        const matchesPrompt = q.question.toLowerCase().includes(cityTarget) || (q.explanation && q.explanation.toLowerCase().includes(cityTarget))
        return matchesCityField || matchesPrompt
      }
      return q.category === 'desafio-cidade' || Boolean(q.city)
    })

    // Fallback: se a cidade tiver poucas perguntas específicas, complementar com perguntas de cidades, monumentos e vilas de Portugal
    if (filtered.length < 10) {
      const cityPoolAdditions = all.filter((q) => {
        if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false
        const sub = (q.subcategory || '').toLowerCase()
        return sub.includes('cidade') || sub.includes('monumento') || sub.includes('vilas') || sub.includes('concelho')
      })
      filtered = Array.from(new Set([...filtered, ...cityPoolAdditions]))
    }
  } else if (isDistrict) {
    // CONQUISTA DO DISTRITO: Representação territorial e perguntas exclusivamente do distrito
    const all = registry.getAllQuestions()
    const distTarget = (district || '').toLowerCase().trim()

    const ALL_KNOWN_DISTRICTS = [
      'aveiro', 'beja', 'braga', 'bragança', 'castelo branco', 'coimbra',
      'évora', 'faro', 'guarda', 'leiria', 'lisboa', 'portalegre',
      'porto', 'santarém', 'setúbal', 'viana do castelo', 'vila real',
      'viseu', 'açores', 'madeira'
    ]

    if (distTarget) {
      filtered = all.filter((q) => {
        if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false

        const qDist = (q.district || '').toLowerCase().trim()
        // 1. Se tem distrito atribuído: deve coincidir com o distrito selecionado
        if (qDist) {
          return qDist === distTarget || distTarget.includes(qDist) || qDist.includes(distTarget)
        }

        // 2. Se não tem distrito explícito: verifica contexto e resposta correta
        const prompt = (q.question || '').toLowerCase()
        const exp = (q.explanation || '').toLowerCase()
        const correctOptIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
        const correctOpt = String(q.options?.[correctOptIdx] || '').toLowerCase()
        const fullText = `${prompt} ${correctOpt} ${exp}`

        const matchesTarget =
          fullText.includes(`distrito de ${distTarget}`) ||
          fullText.includes(`distrito do ${distTarget}`) ||
          fullText.includes(`distrito da ${distTarget}`) ||
          fullText.includes(`em ${distTarget}`) ||
          fullText.includes(`no ${distTarget}`) ||
          fullText.includes(`na ${distTarget}`) ||
          fullText.includes(`de ${distTarget}`) ||
          fullText.includes(`do ${distTarget}`) ||
          fullText.includes(`da ${distTarget}`) ||
          new RegExp(`\\b${distTarget}\\b`, 'i').test(correctOpt)

        if (!matchesTarget) return false

        // 3. Bloqueio absoluto: descarta se a resposta correta ou o foco principal for de outro distrito
        const otherDistricts = ALL_KNOWN_DISTRICTS.filter((d) => d !== distTarget)
        const isAboutOtherDistrict = otherDistricts.some((od) => {
          return (
            new RegExp(`\\b${od}\\b`, 'i').test(correctOpt) ||
            prompt.includes(`distrito de ${od}`) ||
            prompt.includes(`distrito do ${od}`) ||
            prompt.includes(`distrito da ${od}`)
          )
        })

        return !isAboutOtherDistrict
      })
    } else {
      filtered = all.filter((q) => q.category === 'o-meu-distrito' || Boolean(q.district))
    }
  } else if (subcategory && subcategory !== 'all' && subcategory !== 'todas' && subcategory !== 'todos') {
    // Subtema Específico dentro do Tema
    filtered = registry.getBySubtheme(catLower, subcategory, targetDiff)
  } else {
    // Tema Completo (mistura todos os subtemas da categoria)
    filtered = registry.getTemaCompleto(catLower, targetDiff)
  }

  // Fallback seguro se não houver perguntas suficientes na categoria
  if (filtered.length === 0) {
    if (isMaluco) {
      filtered = registry.getTemaCompleto('modo-maluco', targetDiff)
    } else if (isDistrict) {
      const all = registry.getAllQuestions()
      filtered = all.filter((q) => {
        if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false
        if (q.district) return false
        const prompt = (q.question || '').toLowerCase()
        return !prompt.includes('distrito')
      })
    } else {
      filtered = registry.getTemaCompleto('portugal', targetDiff)
    }
  }

  return filtered
}

/**
 * Algoritmo Fisher-Yates de Alta Entropia para baralhar arrays
 */
export function shuffleQuestions<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Limite máximo de IDs de perguntas gravados no histórico local por jogador
 */
const MAX_USER_HISTORY = 5000

// Memória em runtime por utilizador caso localStorage não esteja disponível (SSR / Node / Testes)
const memoryUserHistories = new Map<string, string[]>()

/**
 * Retorna a chave de armazenamento isolada por utilizador
 */
export function getUserQuestionStorageKey(userId?: string): string {
  if (userId && !userId.startsWith('guest_')) {
    return `ap_user_seen_qids_${userId.trim()}`
  }
  return 'ap_guest_seen_qids'
}

/**
 * Obtém o histórico completo e ordenado de perguntas vistas pelo jogador (mais recente no índice 0).
 * Sincroniza a cache local individual com o histórico do Firestore (cloudAnsweredIds).
 */
export function getUserAnsweredHistory(
  userId?: string,
  cloudAnsweredIds?: string[]
): { seenSet: Set<string>; recentOrder: string[]; activeReservedIds: string[] } {
  const local = getLocalUserHistory(userId)
  const seenSet = new Set<string>(local.seenSet)

  // Sincronizar com os IDs do Firestore (se fornecidos pelo perfil da conta)
  if (Array.isArray(cloudAnsweredIds) && cloudAnsweredIds.length > 0) {
    for (const id of cloudAnsweredIds) {
      if (id) seenSet.add(String(id))
    }
  }

  return {
    seenSet,
    recentOrder: local.recentOrder,
    activeReservedIds: local.activeReservedIds,
  }
}

/**
 * Regista um lote de IDs de perguntas no histórico individual do jogador.
 */
export function recordUserQuestionBatch(userId: string | undefined, questionIds: string[]): void {
  if (!questionIds || questionIds.length === 0) return
  void recordQuestionBatchAnswered(userId, questionIds)
}

/**
 * Limpa o histórico em memória (útil para testes automáticos)
 */
export function clearMemoryUserHistories(): void {
  clearAllMemoryHistories()
}

/**
 * Obtém a lista de IDs recentemente apresentados (Janela Deslizante Legada)
 */
export function getRecentQuestionIds(): string[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_RECENT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(String)
      }
    } catch {
      // fallback
    }
  }
  return memoryRecentIds
}

/**
 * Guarda IDs na Janela Deslizante de Recentes (Máx 100)
 */
export function saveRecentQuestionIds(newIds: string[]): void {
  if (!newIds || newIds.length === 0) return
  const current = getRecentQuestionIds()
  const cleanNew = newIds.map(String).filter(Boolean)

  const combined = Array.from(new Set([...cleanNew, ...current])).slice(0, RECENT_WINDOW_SIZE)
  memoryRecentIds = combined

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENT_KEY, JSON.stringify(combined))
    } catch {
      // fallback
    }
  }
}

/**
 * SELEÇÃO ANTI-REPETIÇÃO ESTRITA E BALANCEADA DE PERGUNTAS
 * 
 * Regras Obrigatórias:
 * 1. DENTRO DA MESMA PARTIDA: 0 duplicados garantidos (selectedIds.has(q.id)).
 * 2. ENTRE PARTIDAS DO MESMO JOGADOR: Exclusão estrita de perguntas vistas recentemente pelo ID único.
 * 3. PRIORIDADE ABSOLUTA ÀS NÃO VISTAS: Se unseenPool.length >= count, 100% das perguntas vêm das não vistas!
 * 4. ALEATORIEDADE REAL: Fisher-Yates shuffle nas perguntas elegíveis e balanceamento de temas.
 * 5. ISOLAMENTO POR JOGADOR: Baseado no seenSet individual do utilizador.
 * 6. REUTILIZAÇÃO INTELIGENTE APENAS QUANDO A POOL SE ESGOTA:
 *    - Aproveita todas as não vistas restantes;
 *    - Completa com as perguntas vistas HÁ MAIS TEMPO (fim do recentOrder);
 *    - Exclui estritamente as perguntas das partidas imediatamente anteriores (cooldown);
 *    - Nunca repete dentro da mesma partida.
 */
export function selectBalancedMatchQuestions(
  pool: Question[],
  count: number = 10,
  recentIds: Set<string> = new Set(),
  isNational: boolean = true,
  recentOrder: string[] = []
): Question[] {
  if (!pool || pool.length === 0) return []

  // 1. Deduplicação estrita do próprio pool de entrada (garante unicidade absoluta de cada q.id)
  const cleanPool: Question[] = []
  const seenPoolIds = new Set<string>()
  for (const q of pool) {
    if (q && q.id && !seenPoolIds.has(q.id)) {
      seenPoolIds.add(q.id)
      cleanPool.push(q)
    }
  }

  if (cleanPool.length === 0) return []
  const targetCount = Math.min(count, cleanPool.length)

  // 2. Partição estrita: Perguntas NUNCA vistas vs Perguntas já vistas
  const unseenPool = cleanPool.filter((q) => !recentIds.has(q.id))
  const seenPool = cleanPool.filter((q) => recentIds.has(q.id))

  const selected: Question[] = []
  const selectedIds = new Set<string>()

  // Helper para adicionar pergunta com garantia absoluta de unicidade na partida
  const addQuestion = (q: Question): boolean => {
    if (!q || !q.id || selectedIds.has(q.id)) return false
    selected.push(q)
    selectedIds.add(q.id)
    return true
  }

  // =========================================================================
  // CENÁRIO A: Existem perguntas não vistas suficientes (unseenPool.length >= targetCount)
  // PRIORIDADE ABSOLUTA: 100% das perguntas são retiradas das NÃO VISTAS!
  // =========================================================================
  if (unseenPool.length >= targetCount) {
    if (isNational) {
      // Balanceamento por categorias distintas de Portugal
      const byCategory = new Map<string, Question[]>()
      for (const q of unseenPool) {
        const catKey = (q.category || 'portugal').toLowerCase()
        if (!byCategory.has(catKey)) {
          byCategory.set(catKey, [])
        }
        byCategory.get(catKey)!.push(q)
      }

      const categories = shuffleQuestions(Array.from(byCategory.keys()))

      // Ronda 1: Uma pergunta não vista de cada categoria distinta
      for (const cat of categories) {
        if (selected.length >= targetCount) break
        const catQuestions = shuffleQuestions(byCategory.get(cat) || [])
        const candidate = catQuestions.find((q) => !selectedIds.has(q.id))
        if (candidate) {
          addQuestion(candidate)
        }
      }

      // Ronda 2: Se ainda faltarem para o total, completa com as restantes não vistas
      if (selected.length < targetCount) {
        const remainingUnseen = shuffleQuestions(unseenPool.filter((q) => !selectedIds.has(q.id)))
        for (const q of remainingUnseen) {
          if (selected.length >= targetCount) break
          addQuestion(q)
        }
      }

      return shuffleQuestions(selected)
    } else {
      // Modo de tema específico: aleatoriedade Fisher-Yates dentro das não vistas
      const shuffledUnseen = shuffleQuestions(unseenPool)
      for (const q of shuffledUnseen) {
        if (selected.length >= targetCount) break
        addQuestion(q)
      }
      return shuffleQuestions(selected)
    }
  }

  // =========================================================================
  // CENÁRIO B: O jogador já viu a maior parte da pool (unseenPool.length < targetCount)
  // REUTILIZAÇÃO INTELIGENTE:
  // 1. Aproveita TODAS as perguntas não vistas restantes.
  // 2. Completa com as perguntas vistas HÁ MAIS TEMPO (mais antigas).
  // 3. Exclui estritamente as perguntas das partidas imediatamente anteriores.
  // 4. Garante ZERO duplicações dentro da mesma partida.
  // =========================================================================

  // Passo 1: Inclui todas as não vistas disponíveis
  const shuffledUnseen = shuffleQuestions(unseenPool)
  for (const q of shuffledUnseen) {
    addQuestion(q)
  }

  // Passo 2: Calcular a antiguidade de visualização das perguntas vistas
  // recentOrder tem o índice 0 = mais recente, índice N = mais antigo.
  // Quanto maior o índice, há mais tempo foi vista. Se não estiver em recentOrder, rank = 999999 (mais antiga).
  const recencyRank = new Map<string, number>()
  for (let idx = 0; idx < recentOrder.length; idx++) {
    recencyRank.set(recentOrder[idx], idx)
  }

  // Conjunto de perguntas em "cooldown imediato" (as vistas nas partidas mais recentes, até 50)
  const neededFromSeen = targetCount - selected.length
  const maxCooldownSize = Math.max(0, seenPool.length - neededFromSeen)
  const cooldownLimit = Math.min(50, maxCooldownSize)
  const immediateCooldownIds = new Set<string>(recentOrder.slice(0, cooldownLimit))

  // Ordenar as perguntas vistas das mais antigas (maior rank) para as mais recentes (menor rank)
  const sortedSeenCandidates = [...seenPool]
    .filter((q) => !selectedIds.has(q.id))
    .sort((a, b) => {
      const rankA = recencyRank.has(a.id) ? recencyRank.get(a.id)! : 999999
      const rankB = recencyRank.has(b.id) ? recencyRank.get(b.id)! : 999999
      return rankB - rankA // Maiores índices primeiro (mais antigas)
    })

  // Fase 2.1: Selecionar das mais antigas que NÃO estão em cooldown imediato
  const nonCooldownCandidates = sortedSeenCandidates.filter((q) => !immediateCooldownIds.has(q.id))
  for (const q of nonCooldownCandidates) {
    if (selected.length >= targetCount) break
    addQuestion(q)
  }

  // Fase 2.2: Se mesmo assim faltarem (pool extremamente pequena), aceita das restantes sem duplicar
  if (selected.length < targetCount) {
    for (const q of sortedSeenCandidates) {
      if (selected.length >= targetCount) break
      addQuestion(q)
    }
  }

  return shuffleQuestions(selected)
}

/**
 * MOTOR DE SELEÇÃO ANTI-REPETIÇÃO ESTRITA
 * 1. Obtém pool da categoria/modo.
 * 2. Consulta histórico individual do utilizador (local cache + Firestore).
 * 3. Seleciona 10 perguntas únicas com prioridade a não vistas.
 * 4. Regista os IDs no histórico do utilizador.
 */
export async function getUniqueMatchQuestions(
  userId: string,
  category: string,
  difficultyLevel: number = 2,
  count: number = 10,
  subcategory?: string,
  district?: string,
  city?: string,
  cloudAnsweredIds?: string[],
): Promise<Question[]> {
  const catLower = (category || '').toLowerCase().trim()
  const isNational =
    !catLower ||
    catLower === 'desafio-nacional' ||
    catLower === 'desafio nacional' ||
    catLower === 'nacional' ||
    catLower === 'quick' ||
    catLower === 'todos' ||
    catLower === 'jogar-tudo' ||
    catLower === 'modo-aleatorio' ||
    catLower === 'aleatorio'

  // 1. Carregar pool da categoria e dificuldade
  const allCategoryQuestions = loadQuestionsPool(category, difficultyLevel, subcategory, district, city)

  // 2. Obter histórico individual do utilizador
  const { seenSet, recentOrder } = getUserAnsweredHistory(userId, cloudAnsweredIds)

  // 3. Selecionar perguntas com prioridade absoluta a não vistas e zero duplicados
  const selected = selectBalancedMatchQuestions(allCategoryQuestions, count, seenSet, isNational, recentOrder)

  const selectedIds = selected.map((q) => q.id)

  // 4. Gravar IDs selecionados no histórico do utilizador
  recordUserQuestionBatch(userId, selectedIds)

  // 5. Logging estruturado em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[QUIZ ANTI-REPETIÇÃO] User: ${userId || 'guest'} | Pool: ${allCategoryQuestions.length} | Vistas: ${seenSet.size} | Selecionadas: ${selected.length} | IDs: [${selectedIds.slice(0, 4).join(', ')}...]`
    )
  }

  return selected
}

/**
 * Grava os IDs das perguntas respondidas no Firestore e LocalStorage associados à conta
 */
export async function saveAnsweredQuestions(userId: string, questionIds: string[]): Promise<void> {
  if (!questionIds || questionIds.length === 0) return

  const cleanIds = questionIds.map(String).filter(Boolean)

  // 1. Atualizar histórico cronológico individual do utilizador
  recordUserQuestionBatch(userId, cleanIds)

  // 2. Atualizar histórico acumulado local
  if (typeof window !== 'undefined') {
    try {
      const localAnswered: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ANSWERED_KEY) || '[]')
      const merged = Array.from(new Set([...localAnswered, ...cleanIds]))
      localStorage.setItem(LOCAL_STORAGE_ANSWERED_KEY, JSON.stringify(merged))
    } catch {
      // fallback
    }
  }

  // 3. Persistir no Firestore na conta do utilizador em background sem bloquear
  if (userId && !userId.startsWith('guest_')) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        answeredQuestionIds: arrayUnion(...cleanIds),
        updatedAt: serverTimestamp(),
      })
    } catch {
      // Silent catch to prevent UI freeze
    }
  }
}
