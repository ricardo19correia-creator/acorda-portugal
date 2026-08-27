export type BotPersonality = 'CASUAL' | 'NORMAL' | 'COMPETITIVO' | 'ESPECIALISTA' | 'ELITE'
export type BotDifficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'MESTRE'
export type BotStatus = 'INACTIVE' | 'ACTIVE' | 'IN_MATCH' | 'SUSPENDED' | 'RETIRED'

export interface BotCategoryAffinity {
  categorySlug: string
  proficiencyPercentage: number // 30 a 98
}

export interface BotPlayerRecord {
  id: string
  isBot: true
  displayName: string
  username: string
  avatar: string
  district: string
  status: BotStatus
  personality: BotPersonality
  difficulty: BotDifficulty
  accuracyPercentage: number
  minResponseTimeMs: number
  maxResponseTimeMs: number
  avgResponseTimeMs: number
  rating: number
  level: number
  xp: number
  coins: number
  wins: number
  losses: number
  draws: number
  streak: number
  createdAt: any
  activatedAt?: any
  lastActiveAt?: any
  strengths: string[] // slugs das categorias fortes
  weaknesses: string[] // slugs das categorias fracas
  categoryAffinities?: Record<string, number>
}

export interface BotPopulationConfig {
  totalBots: number
  activationDurationHours: number
  activationStartTime: number
  curve: 'linear' | 'sigmoid' | 'dynamic'
  minimumBotsActive: number
  maximumBotsActive: number
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
  completionPercentage: number
  isPaused: boolean
  avgRating: number
  avgAccuracy: number
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
  botA: { id: string; name: string; score: number; correctCount: number }
  botB: { id: string; name: string; score: number; correctCount: number }
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
