/**
 * Tabela Oficial de Configuração Económica do Acorda Portugal
 * Define os valores base para recompensas de partidas, nível, bónus e saldo inicial de registo.
 */

export const ECONOMY_CONFIG = {
  INITIAL_BONUS_COINS: 50, // Saldo inicial de boas-vindas ao criar conta (€ Acorda)

  // Ganhos por Partida Concluída (Central de Jogo / Quiz)
  MATCH_REWARDS: {
    BASE_WIN_COINS: 15, // Recompensa base por partida concluída com sucesso
    PERFECT_SCORE_BONUS: 10, // Bónus se acertar 100% das perguntas
    STREAK_BONUS_MAX: 10, // Bónus máximo por sequência de vitórias
    DIFFICULTY_MULTIPLIERS: {
      NVL_1: 1.0, // Multiplicador Dificuldade 1
      NVL_2: 1.2, // Multiplicador Dificuldade 2
      NVL_3: 1.5, // Multiplicador Dificuldade 3
      NVL_4: 2.0, // Multiplicador Dificuldade 4
      NVL_5: 3.0, // Multiplicador Dificuldade 5
    },
  },

  // Recompensas por Subida de Nível (Level Up)
  LEVEL_UP_REWARDS: {
    COINS_PER_LEVEL: 25,
  },
} as const

/**
 * Retorna o multiplicador de recompensa para o nível de dificuldade selecionado
 */
export function getDifficultyMultiplier(diff?: string | number | null): number {
  const d = Number(diff) || 1
  if (d >= 5) return ECONOMY_CONFIG.MATCH_REWARDS.DIFFICULTY_MULTIPLIERS.NVL_5
  if (d === 4) return ECONOMY_CONFIG.MATCH_REWARDS.DIFFICULTY_MULTIPLIERS.NVL_4
  if (d === 3) return ECONOMY_CONFIG.MATCH_REWARDS.DIFFICULTY_MULTIPLIERS.NVL_3
  if (d === 2) return ECONOMY_CONFIG.MATCH_REWARDS.DIFFICULTY_MULTIPLIERS.NVL_2
  return ECONOMY_CONFIG.MATCH_REWARDS.DIFFICULTY_MULTIPLIERS.NVL_1
}

/**
 * Calcula a recompensa oficial de € Acorda por partida terminada:
 * Formula: Math.round((BASE_WIN_COINS * (correctCount / totalQuestions) + bonusAcertos) * multiplier)
 */
export function calculateMatchCoinReward({
  correctCount,
  totalQuestions,
  bestStreak = 0,
  difficulty = 1,
}: {
  correctCount: number
  totalQuestions: number
  bestStreak?: number
  difficulty?: string | number | null
}): number {
  if (correctCount <= 0 || totalQuestions <= 0) return 0

  const { BASE_WIN_COINS, PERFECT_SCORE_BONUS, STREAK_BONUS_MAX } = ECONOMY_CONFIG.MATCH_REWARDS
  const isPerfect = correctCount === totalQuestions
  const perfectBonus = isPerfect ? PERFECT_SCORE_BONUS : 0
  const streakBonus = Math.min(STREAK_BONUS_MAX, Math.max(0, bestStreak))

  const accuracyRatio = correctCount / totalQuestions
  const baseReward = Math.round(BASE_WIN_COINS * accuracyRatio)
  const bonusAcertos = perfectBonus + streakBonus

  const multiplier = getDifficultyMultiplier(difficulty)
  const earnedCoins = Math.round((baseReward + bonusAcertos) * multiplier)

  return Math.max(0, earnedCoins)
}

/**
 * Calcula as moedas ganhas por subida de nível
 */
export function calculateLevelUpCoinReward(fromLevel: number, toLevel: number): number {
  if (toLevel <= fromLevel) return 0
  return (toLevel - fromLevel) * ECONOMY_CONFIG.LEVEL_UP_REWARDS.COINS_PER_LEVEL
}
