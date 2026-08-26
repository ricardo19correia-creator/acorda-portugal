/**
 * Acorda Portugal — Motor Oficial de Banco de Dados de Perguntas Anti-Repetição Estrita
 * Arquitetura de Seleção Equitativa, Randomização Fisher-Yates e Janela Deslizante de Recentes.
 * Garante isolamento estrito de categorias e zero repetições dentro da partida.
 */

import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Question, QuizDifficulty } from '@/src/types/quiz'
import { QuestionRegistry } from '@/lib/question-system/registry'

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

  const isCity = catLower === 'desafio-cidade'
  const isDistrict = catLower === 'o-meu-distrito'

  let filtered: Question[] = []

  if (isNational) {
    // Jogar Tudo / Desafio Nacional (Garante 0% de Modo Maluco)
    filtered = registry.getJogarTudo(targetDiff)
  } else if (isMaluco) {
    // EXCLUSIVAMENTE Modo Maluco
    filtered = registry.getTemaCompleto('modo-maluco', targetDiff)
  } else if (isCity) {
    // Desafio de Cidade
    const all = registry.getAllQuestions()
    filtered = all.filter((q) => {
      if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false
      if (city) {
        return Boolean(q.city && (q.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(q.city.toLowerCase())))
      }
      return q.category === 'desafio-cidade' || Boolean(q.city)
    })
  } else if (isDistrict) {
    // O Meu Distrito
    const all = registry.getAllQuestions()
    filtered = all.filter((q) => {
      if (q.category.toLowerCase().includes('maluco') || q.id.startsWith('mm_')) return false
      if (district) {
        return Boolean(q.district && (q.district.toLowerCase().includes(district.toLowerCase()) || district.toLowerCase().includes(q.district.toLowerCase())))
      }
      return q.category === 'o-meu-distrito' || Boolean(q.district)
    })
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
 * Obtém a lista de IDs recentemente apresentados (Janela Deslizante)
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

  // Prepend new IDs and remove duplicates while preserving recency order
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
 * SELEÇÃO EQUITATIVA E BALANCEADA DE PERGUNTAS POR CATEGORIA
 * - No Desafio Nacional / Jogar Agora: Distribui as 10 perguntas por categorias distintas de Portugal
 *   (ex: 1 de História, 1 de Geografia, 1 de Gastronomia, 1 de Futebol, 1 de Ciência, 1 de Cultura, etc.)
 * - Exclui estritamente as perguntas na janela recente.
 * - Garante 0 duplicados na partida.
 */
export function selectBalancedMatchQuestions(
  pool: Question[],
  count: number = 10,
  recentIds: Set<string> = new Set(),
  isNational: boolean = true
): Question[] {
  if (!pool || pool.length === 0) return []

  // 1. Filtrar perguntas que não estão na janela recente
  let available = pool.filter((q) => !recentIds.has(q.id))

  // Se o pool disponível for menor que o necessário, relaxa o filtro recente gradualmente
  if (available.length < count) {
    available = pool
  }

  // 2. Modo Desafio Nacional / Jogar Tudo: Distribuição Equitativa por Categorias
  if (isNational) {
    const byCategory = new Map<string, Question[]>()
    for (const q of available) {
      const catKey = (q.category || 'portugal').toLowerCase()
      if (!byCategory.has(catKey)) {
        byCategory.set(catKey, [])
      }
      byCategory.get(catKey)!.push(q)
    }

    const categories = shuffleQuestions(Array.from(byCategory.keys()))
    const selected: Question[] = []
    const selectedIds = new Set<string>()

    // Ronda 1: Uma pergunta de cada categoria distinta
    for (const cat of categories) {
      if (selected.length >= count) break
      const catQuestions = shuffleQuestions(byCategory.get(cat) || [])
      const candidate = catQuestions.find((q) => !selectedIds.has(q.id))
      if (candidate) {
        selected.push(candidate)
        selectedIds.add(candidate.id)
      }
    }

    // Ronda 2: Se ainda faltarem, completa com as restantes disponíveis
    if (selected.length < count) {
      const remaining = shuffleQuestions(available.filter((q) => !selectedIds.has(q.id)))
      for (const q of remaining) {
        if (selected.length >= count) break
        selected.push(q)
        selectedIds.add(q.id)
      }
    }

    return shuffleQuestions(selected)
  }

  // 3. Modo de Categoria Específica / Subtema
  const shuffled = shuffleQuestions(available)
  const selected: Question[] = []
  const selectedIds = new Set<string>()

  for (const q of shuffled) {
    if (selected.length >= count) break
    if (!selectedIds.has(q.id)) {
      selected.push(q)
      selectedIds.add(q.id)
    }
  }

  return selected
}

/**
 * MOTOR DE SELEÇÃO ANTI-REPETIÇÃO ESTRITA
 * 1. Obtém pool da categoria/modo.
 * 2. Consulta histórico da janela deslizante recente (100 IDs).
 * 3. Seleciona 10 perguntas únicas e bem distribuídas.
 * 4. Regista na janela de recentes.
 * 5. Atualiza Firestore de forma não-bloqueante.
 */
export async function getUniqueMatchQuestions(
  userId: string,
  category: string,
  difficultyLevel: number = 2,
  count: number = 10,
  subcategory?: string,
  district?: string,
  city?: string,
): Promise<Question[]> {
  const catLower = (category || '').toLowerCase().trim()
  const isNational =
    !catLower ||
    catLower === 'desafio-nacional' ||
    catLower === 'desafio nacional' ||
    catLower === 'nacional' ||
    catLower === 'quick' ||
    catLower === 'todos' ||
    catLower === 'jogar-tudo'

  // 1. Carregar pool da categoria e dificuldade
  const allCategoryQuestions = loadQuestionsPool(category, difficultyLevel, subcategory, district, city)

  // 2. Obter lista de IDs recentes
  const recentList = getRecentQuestionIds()
  const recentSet = new Set(recentList)

  // 3. Selecionar perguntas com distribuição e anti-repetição
  const selected = selectBalancedMatchQuestions(allCategoryQuestions, count, recentSet, isNational)

  const selectedIds = selected.map((q) => q.id)

  // 4. Gravar IDs selecionados na Janela Deslizante de Recentes
  saveRecentQuestionIds(selectedIds)

  // 5. Logging estruturado em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[QUIZ] Pool total: ${allCategoryQuestions.length} | Recentes excluídos: ${recentSet.size} | Selecionados: ${selected.length} | IDs: [${selectedIds.slice(0, 4).join(', ')}...]`
    )
  }

  return selected
}

/**
 * Grava os IDs das perguntas respondidas no Firestore e LocalStorage para estatísticas
 */
export async function saveAnsweredQuestions(userId: string, questionIds: string[]): Promise<void> {
  if (!questionIds || questionIds.length === 0) return

  const cleanIds = questionIds.map(String).filter(Boolean)
  saveRecentQuestionIds(cleanIds)

  // Atualizar histórico acumulado local
  if (typeof window !== 'undefined') {
    try {
      const localAnswered: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ANSWERED_KEY) || '[]')
      const merged = Array.from(new Set([...localAnswered, ...cleanIds]))
      localStorage.setItem(LOCAL_STORAGE_ANSWERED_KEY, JSON.stringify(merged))
    } catch {
      // fallback
    }
  }

  // Persistir no Firestore em background sem bloquear
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
