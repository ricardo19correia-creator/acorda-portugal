export type BotPersonality = 'CASUAL' | 'NORMAL' | 'COMPETITIVO' | 'ESPECIALISTA' | 'ELITE'
export type BotDifficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'MESTRE'
export type BotStatus = 'INACTIVE' | 'ACTIVE' | 'IN_MATCH' | 'SUSPENDED' | 'RETIRED'

export interface BotCategoryAffinity {
  categorySlug: string
  proficiencyPercentage: number // 30 a 98
}

/**
 * Dados PÚBLICOS do Bot (armazenados em botPlayers/{botId})
 * Acessíveis pelo jogo, duelos, matchmaking e rankings
 */
export interface BotPlayerRecord {
  id: string
  isBot: true
  displayName: string
  username: string
  avatar: string
  district: string
  status: BotStatus
  level: number
  xp: number
  coins: number
  rating: number // ELO Rating
  wins: number
  losses: number
  draws: number
  streak: number
  accuracyPercentage: number
  avgResponseTimeMs: number
  strengths: string[] // slugs das categorias fortes
  weaknesses: string[] // slugs das categorias fracas
  categoryAffinities?: Record<string, number>
  createdAt: any
  activatedAt?: any
  lastActiveAt?: any
}

/**
 * Configuração PRIVADA do Bot (armazenada em botPlayersPrivate/{botId})
 * Acessível EXCLUSIVAMENTE por Administradores / Backend
 */
export interface BotPlayerPrivateRecord {
  id: string
  isBot: true
  intelligencePercent: number // 1 a 99 (influencia probabilidade e inteligência geral)
  personality: BotPersonality
  difficulty: BotDifficulty
  accuracyModel: {
    baseAccuracy: number
    categoryWeights: Record<string, number>
    streakSensitivity: number
  }
  responseModel: {
    minResponseTimeMs: number
    maxResponseTimeMs: number
    baseJitterMs: number
    difficultyScale: number
  }
  activationSchedule: {
    order: number
    scheduledHour: number
  }
  recentMatchesHistory: Array<{
    matchId: string
    opponentUid: string
    opponentName?: string
    userScore: number
    botScore: number
    won: boolean
    date: number
  }>
  internalSeed: string
  adminMetadata?: {
    notes?: string
    lastEditedBy?: string
    updatedAt?: number
  }
}

export interface BotPopulationConfig {
  totalBotsInPool: number // 125
  activationScheduleHours: number // 24
  activationStartTime: number
  hourlyActiveTargets: number[] // Curva de 24h: [5, 8, 12, 18, 25, 32, 40, 50, 62, 75, 85, 95, 105, 120, 125...]
  minimumBotsActive: number // 5
  maximumBotsActive: number // 125
  isNetworkPaused: boolean
  lastEvaluatedAt?: number
}

export interface BotPopulationStatus {
  totalBotsInPool: number
  activeBots: number
  inMatchBots: number
  inactiveBots: number
  suspendedBots: number
  retiredBots: number
  targetActiveByCurve: number
  hoursElapsedSinceStart: number
  activationDurationHours: number
  completionPercentage: number
  isPaused: boolean
  avgRating: number
  avgAccuracy: number
  avgIntelligence: number
  humanPlayersOnline: number
  activeMatchesCount: number
}

export interface BotAnswerDecision {
  selectedOption: 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean
  timeSpentSeconds: number
  confidenceScore: number
  reasoning: string
}

export interface BotMatchSimulationResult {
  matchId: string
  botA: { id: string; name: string; score: number; correctCount: number; intelligence: number }
  botB: { id: string; name: string; score: number; correctCount: number; intelligence: number }
  winnerId: string | null
  winnerReason: 'score' | 'time' | 'draw'
  durationSeconds: number
  questionsSummary: Array<{
    questionId: string | number
    category: string
    botACorrect: boolean
    botBCorrect: boolean
    botATime: number
    botBTime: number
  }>
}
