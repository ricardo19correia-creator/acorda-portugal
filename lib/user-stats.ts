/**
 * Acorda Portugal — Camada Central de Estatísticas do Utilizador (Fonte Única da Verdade)
 * 
 * Centraliza e unifica todos os cálculos matemáticos do perfil, rankings e duelos:
 * 1. Partidas: partidas reais concluídas sem contagens duplicadas.
 * 2. 1v1: vitórias e derrotas isoladas de duelos (sem poluição de partidas a solo).
 * 3. Taxa de Vitória: vitórias / (vitórias + derrotas) * 100 (0% se sem duelos).
 * 4. Precisão: respostas corretas / respostas válidas respondidas * 100.
 * 5. Tempo Médio: calculado a partir dos tempos reais filtrados (0.3s a 60s); "—" se sem histórico.
 * 6. Domínio por Categoria: métricas canónicas reais e títulos de mestria meritocráticos.
 */

import { doc, getDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/lib/game-data'
import {
  CANONICAL_PROFILE_CATEGORIES,
  getCanonicalCategoryData,
  CanonicalCategoryKey,
  cleanSlug,
} from '@/lib/category-registry'

export interface UserDuelStats {
  wins: number
  losses: number
  draws: number
  totalDuels: number
  winRate: number
}

export interface UserMatchStats {
  gamesPlayed: number
  xp: number
  level: number
  coins: number
  streak: number
  bestStreak: number
}

export interface UserAnswerStats {
  totalAnswered: number
  totalCorrect: number
  totalIncorrect: number
  accuracy: number
  avgResponseTime: string
  avgResponseTimeSeconds: number | null
}

export interface UserEventStats {
  completedEvents: number
  totalEventPoints: number
  activeEvents: number
  eventBadges: string[]
}

export interface UserCategoryStatItem {
  id: CanonicalCategoryKey
  name: string
  icon: string
  answered: number
  correct: number
  accuracy: number
  levelName: string
  gradient: string
  borderColor: string
  barColor: string
}

export interface UserGameStats {
  // Compatibilidade Direta (Plana)
  gamesPlayed: number          // Número REAL de partidas concluídas
  wins1v1: number              // Duelos 1v1 ganhos
  losses1v1: number            // Duelos 1v1 perdidos
  draws1v1: number             // Duelos 1v1 empatados
  totalDuels1v1: number        // Total duelos 1v1
  winRate: number              // vitórias 1v1 / (vitórias 1v1 + derrotas 1v1) * 100
  totalAnswered: number        // Total de perguntas respondidas em partidas
  totalCorrect: number         // Total de respostas corretas
  totalIncorrect: number       // Total de respostas incorretas
  accuracy: number             // totalCorrect / totalAnswered * 100 (0 se 0 respondidas)
  avgResponseTime: string      // Média real calculada ex: "2.1s" ou "—" se sem histórico
  avgResponseTimeSeconds: number | null

  // Slices Modulares Canónicos
  duels: UserDuelStats
  matches: UserMatchStats
  answers: UserAnswerStats
  events?: UserEventStats
}

/**
 * Atribui o título meritocrático oficial de domínio de categoria baseado no desempenho real
 * Um utilizador com 0 respostas recebe "Sem classificação" (nunca "Mestre da Lusitânia")
 */
export function getCategoryMasteryTitle(
  categoryId: string,
  answered: number,
  correct: number,
  accuracy: number,
): string {
  if (!answered || answered <= 0) {
    return 'Sem classificação'
  }

  const cleanCat = cleanSlug(categoryId)

  // Nível 1: Aprendiz (1 a 14 respostas)
  if (answered < 15) {
    return 'Aprendiz'
  }

  // Nível 2: Praticante / Estudioso (15 a 39 respostas)
  if (answered < 40) {
    return accuracy >= 70 ? 'Estudioso' : 'Praticante'
  }

  // Nível 3: Explorador / Especialista (40 a 79 respostas)
  if (answered < 80) {
    return accuracy >= 75 ? 'Especialista' : 'Explorador'
  }

  // Nível 4+: 80+ respostas
  if (accuracy >= 80) {
    // Títulos Apex Oficiais por Categoria
    switch (cleanCat) {
      case 'historia':
      case 'historia-de-portugal':
        return 'Mestre da Lusitânia'
      case 'geografia':
      case 'geografia-territorio':
        return 'Navegador Cartógrafo'
      case 'desporto':
      case 'desporto-nacional':
        return 'Campeão Ibérico'
      case 'cultura':
      case 'cultura-tradicoes':
        return 'Erudito das Beiras'
      case 'simbolos':
      case 'simbolos-gastronomia':
      case 'gastronomia':
        return 'Paladar Lusitano'
      case 'maluco':
      case 'modo-maluco':
        return 'Maluco Veterano'
      default:
        return 'Mestre do Saber'
    }
  }

  if (accuracy >= 60) {
    return 'Veterano'
  }

  return 'Aventureiro'
}

/**
 * Calcula exclusivamente as estatísticas de Duelos 1v1
 * Garante que partidas solo NUNCA são computadas como derrotas de duelos.
 */
export function getUserDuelStats(profile: Partial<UserProfile> | null | undefined): UserDuelStats {
  if (!profile) {
    return {
      wins: 0,
      losses: 0,
      draws: 0,
      totalDuels: 0,
      winRate: 0,
    }
  }

  // 1. Vitórias 1v1 reais (origem estrita em duelos 1v1)
  const wins =
    typeof (profile as any)?.stats?.duelsWon === 'number'
      ? Math.max(0, (profile as any).stats.duelsWon)
      : typeof (profile as any)?.wins1v1 === 'number'
        ? Math.max(0, (profile as any).wins1v1)
        : typeof (profile as any)?.duelWins === 'number'
          ? Math.max(0, (profile as any).duelWins)
          : 0

  // 2. Derrotas 1v1 reais (origem estrita em duelos, NUNCA calculadas por subtração de solo games)
  let losses =
    typeof (profile as any)?.stats?.duelsLost === 'number'
      ? Math.max(0, (profile as any).stats.duelsLost)
      : typeof (profile as any)?.losses1v1 === 'number'
        ? Math.max(0, (profile as any).losses1v1)
        : typeof (profile as any)?.duelLosses === 'number'
          ? Math.max(0, (profile as any).duelLosses)
          : 0

  // Sanitização anti-poluição: se losses coincidir com (gamesPlayed - wins) por bug legado de solo games
  const totalGames = typeof profile.gamesPlayed === 'number' ? profile.gamesPlayed : (profile as any)?.stats?.totalGames || 0
  const recordedDuels = typeof (profile as any)?.stats?.totalDuels === 'number' ? (profile as any).stats.totalDuels : null
  if (recordedDuels !== null && recordedDuels >= 0) {
    if (losses > recordedDuels) {
      losses = Math.max(0, recordedDuels - wins)
    }
  } else if (totalGames > 20 && losses > 0 && losses === (totalGames - wins)) {
    // Claramente contaminado pela antiga fórmula losses = gamesPlayed - wins
    losses = typeof (profile as any)?.stats?.duelsLost === 'number' ? (profile as any).stats.duelsLost : 0
  }

  // 3. Empates 1v1
  const draws =
    typeof (profile as any)?.stats?.duelsDrawn === 'number'
      ? Math.max(0, (profile as any).stats.duelsDrawn)
      : typeof (profile as any)?.draws1v1 === 'number'
        ? Math.max(0, (profile as any).draws1v1)
        : typeof (profile as any)?.duelDraws === 'number'
          ? Math.max(0, (profile as any).duelDraws)
          : 0

  // 4. Total de duelos
  const totalDuels =
    typeof recordedDuels === 'number' && recordedDuels >= (wins + losses + draws)
      ? recordedDuels
      : wins + losses + draws

  // 5. Taxa de vitória 1v1 = vitórias / (vitórias + derrotas) * 100
  const decisiveDuels = wins + losses
  const winRate = decisiveDuels > 0 ? Math.round((wins / decisiveDuels) * 100) : 0

  return {
    wins,
    losses,
    draws,
    totalDuels,
    winRate,
  }
}

/**
 * Calcula as métricas de partidas globais, progressão e pontuações
 */
export function getUserMatchStats(profile: Partial<UserProfile> | null | undefined): UserMatchStats {
  if (!profile) {
    return {
      gamesPlayed: 0,
      xp: 0,
      level: 1,
      coins: 0,
      streak: 0,
      bestStreak: 0,
    }
  }

  const gamesPlayed =
    typeof profile.gamesPlayed === 'number'
      ? Math.max(0, profile.gamesPlayed)
      : typeof (profile as any)?.stats?.totalGames === 'number'
        ? Math.max(0, (profile as any).stats.totalGames)
        : 0

  const xp = typeof profile.xp === 'number' && !isNaN(profile.xp) ? Math.max(0, profile.xp) : 0
  const level = typeof profile.level === 'number' && profile.level >= 1 ? profile.level : 1
  const coins = typeof profile.coins === 'number' ? profile.coins : typeof profile.euros === 'number' ? profile.euros : 0
  const streak = typeof profile.streak === 'number' ? Math.max(0, profile.streak) : 0
  const bestStreak = typeof (profile as any)?.bestStreak === 'number' ? Math.max(streak, (profile as any).bestStreak) : streak

  return {
    gamesPlayed,
    xp,
    level,
    coins,
    streak,
    bestStreak,
  }
}

/**
 * Calcula as métricas de respostas e precisão
 */
export function getUserAnswerStats(profile: Partial<UserProfile> | null | undefined): UserAnswerStats {
  if (!profile) {
    return {
      totalAnswered: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      accuracy: 0,
      avgResponseTime: '—',
      avgResponseTimeSeconds: null,
    }
  }

  let totalAnswered =
    typeof profile.questionsAnswered === 'number'
      ? Math.max(0, profile.questionsAnswered)
      : typeof profile.totalQuestions === 'number'
        ? Math.max(0, profile.totalQuestions)
        : typeof (profile as any)?.stats?.totalQuestions === 'number'
          ? Math.max(0, (profile as any).stats.totalQuestions)
          : 0

  let totalCorrect =
    typeof profile.correctAnswers === 'number'
      ? Math.max(0, profile.correctAnswers)
      : typeof (profile as any)?.stats?.correctAnswers === 'number'
        ? Math.max(0, (profile as any).stats.correctAnswers)
        : 0

  // Reconciliação se totalAnswered for 0 mas houver categorias preenchidas
  if (totalAnswered === 0 && profile.categoryStats && typeof profile.categoryStats === 'object') {
    let catAns = 0
    let catCor = 0
    for (const val of Object.values(profile.categoryStats)) {
      if (val && typeof val === 'object') {
        const qTot = typeof (val as any).totalQuestions === 'number' ? (val as any).totalQuestions : (val as any).total || 0
        const qCor = typeof (val as any).correctAnswers === 'number' ? (val as any).correctAnswers : (val as any).correct || 0
        catAns += qTot
        catCor += qCor
      }
    }
    if (catAns > 0) {
      totalAnswered = catAns
      totalCorrect = Math.min(catCor, catAns)
    }
  }

  totalCorrect = Math.min(totalCorrect, totalAnswered)
  const totalIncorrect = Math.max(0, totalAnswered - totalCorrect)
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // Tempo Médio Real
  const statsObj = (profile as any)?.stats
  const totalResponseTime = typeof statsObj?.totalResponseTime === 'number' ? statsObj.totalResponseTime : 0
  const validResponseCount = typeof statsObj?.validResponseTimeCount === 'number' ? statsObj.validResponseTimeCount : 0

  let avgSeconds: number | null = null
  let avgResponseTime = '—'

  if (validResponseCount > 0 && totalResponseTime > 0) {
    avgSeconds = Number((totalResponseTime / validResponseCount).toFixed(1))
    avgResponseTime = `${avgSeconds}s`
  } else if (typeof statsObj?.avgResponseTime === 'number' && statsObj.avgResponseTime >= 0.3 && statsObj.avgResponseTime <= 60 && statsObj.avgResponseTime !== 2.4) {
    avgSeconds = Number(statsObj.avgResponseTime.toFixed(1))
    avgResponseTime = `${avgSeconds}s`
  } else if (typeof statsObj?.avgResponseTime === 'string') {
    const rawVal = statsObj.avgResponseTime.trim()
    if (rawVal !== '2.4s' && rawVal !== '2.4' && rawVal !== '0s' && rawVal !== '0' && rawVal !== '') {
      const num = parseFloat(rawVal)
      if (!isNaN(num) && num >= 0.3 && num <= 60) {
        avgSeconds = Number(num.toFixed(1))
        avgResponseTime = `${avgSeconds}s`
      }
    }
  }

  return {
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    accuracy,
    avgResponseTime,
    avgResponseTimeSeconds: avgSeconds,
  }
}

/**
 * Calcula estatísticas de eventos temporários
 */
export function getUserEventStats(userEvents: any): UserEventStats {
  if (!userEvents || typeof userEvents !== 'object') {
    return {
      completedEvents: 0,
      totalEventPoints: 0,
      activeEvents: 0,
      eventBadges: [],
    }
  }

  let completedEvents = 0
  let totalEventPoints = 0
  let activeEvents = 0
  const eventBadges: string[] = []

  for (const [evtId, val] of Object.entries(userEvents)) {
    if (val && typeof val === 'object') {
      if ((val as any).completed) completedEvents++
      if ((val as any).active) activeEvents++
      if (typeof (val as any).points === 'number') totalEventPoints += (val as any).points
      if ((val as any).badge) eventBadges.push(String((val as any).badge))
    }
  }

  return {
    completedEvents,
    totalEventPoints,
    activeEvents,
    eventBadges,
  }
}

/**
 * Calcula todas as estatísticas globais do utilizador a partir do documento Firestore
 * Zero valores mock/hardcoded; integridade matemática estrita garantida.
 */
export function getUserGameStats(profile: Partial<UserProfile> | null | undefined): UserGameStats {
  const duels = getUserDuelStats(profile)
  const matches = getUserMatchStats(profile)
  const answers = getUserAnswerStats(profile)
  const events = getUserEventStats((profile as any)?.events)

  return {
    // Propriedades planas de compatibilidade total
    gamesPlayed: matches.gamesPlayed,
    wins1v1: duels.wins,
    losses1v1: duels.losses,
    draws1v1: duels.draws,
    totalDuels1v1: duels.totalDuels,
    winRate: duels.winRate,
    totalAnswered: answers.totalAnswered,
    totalCorrect: answers.totalCorrect,
    totalIncorrect: answers.totalIncorrect,
    accuracy: answers.accuracy,
    avgResponseTime: answers.avgResponseTime,
    avgResponseTimeSeconds: answers.avgResponseTimeSeconds,

    // Slices Modulares
    duels,
    matches,
    answers,
    events,
  }
}

/**
 * Calcula o domínio por categoria de conhecimento canónica para o utilizador
 */
export function getUserCategoryStats(profile: Partial<UserProfile> | null | undefined): UserCategoryStatItem[] {
  const userCatStats = (profile as any)?.categoryStats || {}

  return CANONICAL_PROFILE_CATEGORIES.map((catConfig) => {
    const catData = getCanonicalCategoryData(userCatStats, catConfig.id, catConfig.aliases)
    const accuracy = catData.totalQuestions > 0 ? Math.round((catData.correctAnswers / catData.totalQuestions) * 100) : 0
    const levelName = getCategoryMasteryTitle(
      catConfig.id,
      catData.totalQuestions,
      catData.correctAnswers,
      accuracy,
    )

    return {
      id: catConfig.id,
      name: catConfig.name,
      icon: catConfig.icon,
      answered: catData.totalQuestions,
      correct: catData.correctAnswers,
      accuracy,
      levelName,
      gradient: catConfig.gradient,
      borderColor: catConfig.borderColor,
      barColor: catConfig.barColor,
    }
  })
}

/**
 * Consulta direta do Firestore para estatísticas globais
 */
export async function fetchUserGameStats(uid: string): Promise<UserGameStats> {
  if (!uid) return getUserGameStats(null)
  try {
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (!userSnap.exists()) return getUserGameStats(null)
    return getUserGameStats(userSnap.data() as Partial<UserProfile>)
  } catch (error) {
    console.error('[USER_STATS] Erro ao carregar estatísticas do Firestore:', error)
    return getUserGameStats(null)
  }
}

/**
 * Consulta direta do Firestore para estatísticas de categorias
 */
export async function fetchUserCategoryStats(uid: string): Promise<UserCategoryStatItem[]> {
  if (!uid) return getUserCategoryStats(null)
  try {
    const userSnap = await getDoc(doc(db, 'users', uid))
    if (!userSnap.exists()) return getUserCategoryStats(null)
    return getUserCategoryStats(userSnap.data() as Partial<UserProfile>)
  } catch (error) {
    console.error('[USER_STATS] Erro ao carregar estatísticas de categorias do Firestore:', error)
    return getUserCategoryStats(null)
  }
}

/**
 * Subscrição em tempo real às estatísticas globais de um utilizador
 */
export function subscribeUserGameStats(uid: string, callback: (stats: UserGameStats) => void): Unsubscribe {
  if (!uid) {
    callback(getUserGameStats(null))
    return () => {}
  }

  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        callback(getUserGameStats(snap.data() as Partial<UserProfile>))
      } else {
        callback(getUserGameStats(null))
      }
    },
    (err) => {
      console.warn('[USER_STATS] Aviso no listener de estatísticas:', err)
      callback(getUserGameStats(null))
    }
  )
}
