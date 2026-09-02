/**
 * Acorda Portugal — Registo Canónico de Categorias & Motor de Estatísticas
 * 
 * Fonte Única de Verdade (SSOT) para:
 * 1. Identificadores canónicos estáveis de categorias.
 * 2. Mapeamento determinístico de perguntas, subtemas e modos de jogo.
 * 3. Cálculo de precisão matemática real (% de acerto, respondidas, corretas).
 * 4. Reconciliação e auto-cura de dados históricos sem perda de progresso.
 */

export type CanonicalCategoryKey =
  | 'historia'
  | 'geografia'
  | 'desporto'
  | 'cultura'
  | 'simbolos'
  | 'maluco'
  | 'atualidade'
  | 'portugal-politico'
  | 'ciencia-tecnologia'
  | 'cinema-tv'
  | 'musica'
  | 'humor'
  | 'personalidades'
  | 'mundo'
  | 'desafio-visual'
  | 'empresas-portuguesas'

export interface CategoryStatItem {
  totalQuestions: number
  correctAnswers: number
  total: number // alias de compatibilidade
  correct: number // alias de compatibilidade
  gamesPlayed: number
  score: number
  accuracy: number
  lastPlayedAt?: any
}

export interface ProfileCategoryConfig {
  id: CanonicalCategoryKey
  name: string
  icon: string
  levelName: string
  gradient: string
  borderColor: string
  barColor: string
  aliases: string[]
}

/**
 * As 6 Categorias Principais com Cartões Oficiais no Perfil do Jogador
 */
export const CANONICAL_PROFILE_CATEGORIES: ProfileCategoryConfig[] = [
  {
    id: 'historia',
    name: 'História de Portugal',
    icon: '🏛️',
    levelName: 'Mestre da Lusitânia',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-500/40',
    barColor: 'bg-amber-500',
    aliases: [
      'historia',
      'história',
      'historia-portugal',
      'historia_de_portugal',
      'história de portugal',
      'historia-de-portugal',
      'fundacao-reino',
      'idade-media',
      'descobrimentos',
      'imperio-ultramarino',
      'monarquia-constitucional',
      'primeira-republica',
      'estado-novo-25-abril',
      'terceiro-milenio',
      'batalhas-historicas',
      'tratados-aliancas',
      'monumentos-historicos',
    ],
  },
  {
    id: 'geografia',
    name: 'Geografia & Território',
    icon: '🌍',
    levelName: 'Navegador Cartógrafo',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-500/40',
    barColor: 'bg-emerald-500',
    aliases: [
      'geografia',
      'geografia-territorio',
      'geografia de portugal',
      'geografia-portugal',
      'territorio',
      'distrito',
      'o-meu-distrito',
      'desafio-cidade',
      'cidade',
      'cidades',
      'vilas-aldeias',
      'praias',
      'regioes',
      'relevo-serras',
      'rios-bacias',
      'litoral-costa',
      'clima-natureza',
      'acores',
      'madeira',
      'distritos-concelhos',
      'fronteiras-limites',
      'reservas-parques',
      'geografia-humana',
    ],
  },
  {
    id: 'desporto',
    name: 'Desporto Nacional',
    icon: '⚽',
    levelName: 'Campeão Ibérico',
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-blue-500/40',
    barColor: 'bg-blue-500',
    aliases: [
      'desporto',
      'desporto-nacional',
      'desporto português',
      'desporto-portugues',
      'futebol',
      'futebol-portugues',
      'futebol português',
      'futebol_portugues',
      'modalidades',
      'selecao-nacional',
      'estadios',
      'jogos-olimpicos',
      'atletismo',
      'hoquei-patins',
      'ciclismo',
    ],
  },
  {
    id: 'cultura',
    name: 'Cultura & Tradições',
    icon: '🎭',
    levelName: 'Erudito das Beiras',
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-purple-500/40',
    barColor: 'bg-purple-500',
    aliases: [
      'cultura',
      'cultura-tradicoes',
      'cultura & tradições',
      'cultura e tradições',
      'cultura portuguesa',
      'cultura-portuguesa',
      'tradicoes',
      'monumentos',
      'literatura',
      'fado',
      'artes-plasticas',
      'teatro-cinema',
      'patrimonio',
      'folclore',
      'festas-romarias',
      'musica',
      'musica-portuguesa',
      'música',
      'cinema-tv',
      'cinema e televisão',
      'cinema & televisão',
    ],
  },
  {
    id: 'simbolos',
    name: 'Símbolos & Gastronomia',
    icon: '🇵🇹',
    levelName: 'Paladar Lusitano',
    gradient: 'from-red-500/20 via-amber-500/10 to-transparent',
    borderColor: 'border-red-500/40',
    barColor: 'bg-red-500',
    aliases: [
      'simbolos',
      'gastronomia',
      'simbolos-gastronomia',
      'símbolos & gastronomia',
      'símbolos e gastronomia',
      'gastronomia-portuguesa',
      'gastronomia portuguesa',
      'pratos-tipicos',
      'docaria-conventual',
      'vinhos-portugueses',
      'azeites-queijos',
      'simbolos-nacionais',
      'símbolos nacionais',
      'bandeira-hino',
      'heráldica',
      'galo-barcelos',
    ],
  },
  {
    id: 'maluco',
    name: 'Modo Maluco',
    icon: '🤪',
    levelName: 'Maluco Veterano',
    gradient: 'from-yellow-500/20 via-lime-500/10 to-transparent',
    borderColor: 'border-yellow-500/40',
    barColor: 'bg-yellow-500',
    aliases: [
      'maluco',
      'modo-maluco',
      'modo_maluco',
      'modo maluco',
      'perguntas-idiotas',
      'humor',
      'caos',
      'insano',
    ],
  },
]

/**
 * Normaliza qualquer texto de categoria/subtema para slug limpo
 */
export function cleanSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Resolve a categoria canónica determinística de qualquer pergunta
 */
export function getCanonicalCategory(
  rawCategory?: string,
  rawSubcategory?: string,
  questionId?: string,
  prompt?: string,
): CanonicalCategoryKey {
  const catSlug = cleanSlug(rawCategory || '')
  const subSlug = cleanSlug(rawSubcategory || '')
  const qId = String(questionId || '').toLowerCase()
  const promptLower = String(prompt || '').toLowerCase()

  // 0. Correspondência exata com aliases canónicos de perfil (seja em categoria ou subcategoria)
  for (const profileCat of CANONICAL_PROFILE_CATEGORIES) {
    if (
      profileCat.aliases.some(
        (a) => {
          const c = cleanSlug(a)
          return c === catSlug || (subSlug && c === subSlug)
        }
      )
    ) {
      return profileCat.id
    }
  }

  // 1. Deteção estrita de Modo Maluco por ID ou categoria
  if (
    qId.startsWith('mm_') ||
    catSlug === 'modo-maluco' ||
    catSlug === 'maluco' ||
    catSlug === 'perguntas-idiotas' ||
    catSlug === 'humor' ||
    subSlug.includes('maluco') ||
    promptLower.startsWith('modo maluco')
  ) {
    return 'maluco'
  }

  // 2. Deteção de Desafio de Cidade / Território
  if (qId.startsWith('vr_') || catSlug === 'desafio-cidade' || catSlug === 'o-meu-distrito' || catSlug === 'distrito') {
    return 'geografia'
  }

  // 3. Verificação de subtema direto
  if (subSlug) {
    if (
      subSlug.includes('historia') ||
      subSlug.includes('fundacao') ||
      subSlug.includes('descobrimentos') ||
      subSlug.includes('monarquia') ||
      subSlug.includes('republica') ||
      subSlug.includes('batalha') ||
      subSlug.includes('tratado') ||
      subSlug.includes('dinastia')
    ) {
      return 'historia'
    }

    if (
      subSlug.includes('geografia') ||
      subSlug.includes('territorio') ||
      subSlug.includes('distrito') ||
      subSlug.includes('cidade') ||
      subSlug.includes('vila') ||
      subSlug.includes('praia') ||
      subSlug.includes('regiao') ||
      subSlug.includes('serra') ||
      subSlug.includes('rio') ||
      subSlug.includes('litoral') ||
      subSlug.includes('acores') ||
      subSlug.includes('madeira')
    ) {
      return 'geografia'
    }

    if (
      subSlug.includes('desporto') ||
      subSlug.includes('futebol') ||
      subSlug.includes('modalidade') ||
      subSlug.includes('estadio') ||
      subSlug.includes('atletismo') ||
      subSlug.includes('ciclismo') ||
      subSlug.includes('hoquei')
    ) {
      return 'desporto'
    }

    if (
      subSlug.includes('gastronomia') ||
      subSlug.includes('simbolo') ||
      subSlug.includes('prato') ||
      subSlug.includes('doce') ||
      subSlug.includes('vinho') ||
      subSlug.includes('azeite') ||
      subSlug.includes('queijo') ||
      subSlug.includes('bandeira') ||
      subSlug.includes('hino') ||
      subSlug.includes('galo')
    ) {
      return 'simbolos'
    }

    if (
      subSlug.includes('cultura') ||
      subSlug.includes('tradicao') ||
      subSlug.includes('monumento') ||
      subSlug.includes('literatura') ||
      subSlug.includes('fado') ||
      subSlug.includes('musica') ||
      subSlug.includes('cinema') ||
      subSlug.includes('teatro') ||
      subSlug.includes('folclore') ||
      subSlug.includes('festa')
    ) {
      return 'cultura'
    }
  }

  // 4. Verificação de categoria direta
  if (catSlug.includes('historia')) return 'historia'
  if (catSlug.includes('geografia') || catSlug.includes('territorio') || catSlug.includes('distrito')) return 'geografia'
  if (catSlug.includes('desporto') || catSlug.includes('futebol') || catSlug.includes('modalidade')) return 'desporto'
  if (
    catSlug.includes('gastronomia') ||
    catSlug.includes('simbolo') ||
    catSlug.includes('prato') ||
    catSlug.includes('doce') ||
    catSlug.includes('vinho') ||
    catSlug.includes('azeite') ||
    catSlug.includes('queijo')
  ) return 'simbolos'
  if (
    catSlug.includes('cultura') ||
    catSlug.includes('musica') ||
    catSlug.includes('cinema') ||
    catSlug.includes('fado') ||
    catSlug.includes('tradicao') ||
    catSlug.includes('literatura') ||
    catSlug.includes('monumento')
  ) return 'cultura'
  if (catSlug.includes('politico') || catSlug.includes('politica')) return 'portugal-politico'
  if (catSlug.includes('atualidade')) return 'atualidade'
  if (catSlug.includes('ciencia') || catSlug.includes('tecnologia')) return 'ciencia-tecnologia'
  if (catSlug.includes('empresa')) return 'empresas-portuguesas'
  if (catSlug.includes('personalidade')) return 'personalidades'
  if (catSlug.includes('mundo')) return 'mundo'
  if (catSlug.includes('visual')) return 'desafio-visual'

  // 5. Análise semântica por palavras-chave do prompt se categoria genérica ("Portugal" / "Desafio Nacional")
  if (catSlug === 'portugal' || catSlug === 'desafio-nacional' || catSlug === 'nacional' || catSlug === 'geral') {
    if (
      /\b(rei|rainha|batalha|seculo|século|ano de|tratado|descobrimentos|revolucao|revolução|castelo|d\.\s+[a-z]+|monarquia|republica|república|salazar|25 de abril)\b/i.test(
        promptLower,
      )
    ) {
      return 'historia'
    }

    if (
      /\b(capital|distrito|rio|serra|concelho|fronteira|montanha|ilha|praia|cidade|vila|aldeia|acores|açores|madeira|estrada|norte|sul|alentejo|algarve|minho|douro)\b/i.test(
        promptLower,
      )
    ) {
      return 'geografia'
    }

    if (
      /\b(futebol|golo|campeao|campeão|clube|taca|taça|estadio|estádio|benfica|porto|sporting|selecao|seleção|olimpico|olímpico|atleta|jogador)\b/i.test(
        promptLower,
      )
    ) {
      return 'desporto'
    }

    if (
      /\b(prato|doce|pastel|bacalhau|queijo|vinho|azeite|gastronomia|culinaria|culinária|receita|francesinha|bandeira|hino|brasao|brasão|esfera armilar)\b/i.test(
        promptLower,
      )
    ) {
      return 'simbolos'
    }

    if (
      /\b(poeta|livro|escritor|cantor|fado|musica|música|teatro|pintura|museu|tradicao|tradição|festa|monumento|patrimonio|património|lenda|saramago|pesso[a-z]*|camoes|camões)\b/i.test(
        promptLower,
      )
    ) {
      return 'cultura'
    }
  }

  // 6. Categoria de fallback padrão
  return 'historia'
}

/**
 * Extrai e consolida estatísticas canónicas de uma categoria a partir do objeto `categoryStats` do perfil
 */
export function getCanonicalCategoryData(
  userCatStats: Record<string, any> | undefined | null,
  catId: string,
  aliases: string[] = [],
): CategoryStatItem {
  const stats = userCatStats || {}
  const allKeys = Array.from(new Set([catId, ...aliases, cleanSlug(catId)]))

  let totalQuestions = 0
  let correctAnswers = 0
  let gamesPlayed = 0
  let score = 0
  let lastPlayedAt: any = null

  for (const key of allKeys) {
    const raw = stats[key]
    if (raw && typeof raw === 'object') {
      const qTotal =
        typeof raw.totalQuestions === 'number'
          ? raw.totalQuestions
          : typeof raw.total === 'number'
            ? raw.total
            : typeof raw.answered === 'number'
              ? raw.answered
              : 0

      const qCorrect =
        typeof raw.correctAnswers === 'number'
          ? raw.correctAnswers
          : typeof raw.correct === 'number'
            ? raw.correct
            : 0

      const qGames =
        typeof raw.gamesPlayed === 'number'
          ? raw.gamesPlayed
          : typeof raw.games === 'number'
            ? raw.games
            : 0

      const qScore = typeof raw.score === 'number' ? raw.score : 0

      totalQuestions += qTotal
      correctAnswers += qCorrect
      gamesPlayed += qGames
      score += qScore

      if (raw.lastPlayedAt && !lastPlayedAt) {
        lastPlayedAt = raw.lastPlayedAt
      }
    }
  }

  // Prevenção estrita de inconsistência matemática
  correctAnswers = Math.min(correctAnswers, totalQuestions)
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return {
    totalQuestions,
    correctAnswers,
    total: totalQuestions,
    correct: correctAnswers,
    gamesPlayed,
    score,
    accuracy,
    lastPlayedAt,
  }
}

export interface MatchAnswerPayload {
  questionId: string
  categoryId?: string
  category?: string
  subcategory?: string
  prompt?: string
  selectedOption?: string
  isCorrect: boolean
  answeredAt?: number
}

export interface CategoryIncrement {
  totalQuestions: number
  correctAnswers: number
  score: number
  gamesPlayed: number
}

/**
 * Agrupa respostas de uma partida por categoria canónica para atualização atómica
 */
export function computeCategoryBreakdownFromAnswers(
  answers: MatchAnswerPayload[],
  fallbackCategorySlug = 'portugal',
): Record<string, CategoryIncrement> {
  const breakdown: Record<string, CategoryIncrement> = {}

  if (!Array.isArray(answers) || answers.length === 0) {
    const canonical = getCanonicalCategory(fallbackCategorySlug)
    breakdown[canonical] = {
      totalQuestions: 0,
      correctAnswers: 0,
      score: 0,
      gamesPlayed: 1,
    }
    return breakdown
  }

  for (const ans of answers) {
    const rawCat = ans.categoryId || ans.category || fallbackCategorySlug
    const canonicalKey = getCanonicalCategory(rawCat, ans.subcategory, ans.questionId, ans.prompt)

    if (!breakdown[canonicalKey]) {
      breakdown[canonicalKey] = {
        totalQuestions: 0,
        correctAnswers: 0,
        score: 0,
        gamesPlayed: 0,
      }
    }

    breakdown[canonicalKey].totalQuestions += 1
    if (ans.isCorrect) {
      breakdown[canonicalKey].correctAnswers += 1
      breakdown[canonicalKey].score += 100
    }
  }

  // Atribui 1 jogo jogado a cada categoria participante
  for (const key of Object.keys(breakdown)) {
    breakdown[key].gamesPlayed = 1
  }

  return breakdown
}

/**
 * Reconcilia e auto-cura estatísticas de utilizadores com dados legados sem perda de progresso
 */
export function reconcileUserCategoryStats(
  userData: Record<string, any>,
  questionLookup?: (id: string) => { category?: string; subcategory?: string; prompt?: string } | undefined,
): Record<string, CategoryStatItem> {
  const existingStats = (userData.categoryStats as Record<string, any>) || {}
  const reconstructed: Record<string, CategoryStatItem> = {}

  // 1. Normaliza as 6 categorias canónicas principais
  for (const cat of CANONICAL_PROFILE_CATEGORIES) {
    reconstructed[cat.id] = getCanonicalCategoryData(existingStats, cat.id, cat.aliases)
  }

  // 2. Se existirem perguntas respondidas (answeredQuestionIds) e as categorias estiverem a zero
  const totalReconstructedQuestions = Object.values(reconstructed).reduce((acc, c) => acc + c.totalQuestions, 0)
  const answeredIds = Array.isArray(userData.answeredQuestionIds) ? userData.answeredQuestionIds : []

  if (totalReconstructedQuestions === 0 && answeredIds.length > 0 && questionLookup) {
    for (const qId of answeredIds) {
      const q = questionLookup(String(qId))
      const catKey = getCanonicalCategory(q?.category, q?.subcategory, qId, q?.prompt)
      if (reconstructed[catKey]) {
        reconstructed[catKey].totalQuestions += 1
        // Estimativa proporcional de acertos históricos baseada na taxa global do perfil
        const globalAccuracy =
          userData.totalQuestions && userData.totalQuestions > 0
            ? (userData.correctAnswers || 0) / userData.totalQuestions
            : 0.75
        const isEstimatedCorrect = Math.random() < globalAccuracy
        if (isEstimatedCorrect) {
          reconstructed[catKey].correctAnswers += 1
        }
      }
    }

    for (const key of Object.keys(reconstructed)) {
      const item = reconstructed[key]
      item.total = item.totalQuestions
      item.correct = item.correctAnswers
      item.accuracy = item.totalQuestions > 0 ? Math.round((item.correctAnswers / item.totalQuestions) * 100) : 0
    }
  }

  return reconstructed
}
