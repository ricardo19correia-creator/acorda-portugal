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
 * Tiers Económicos Canónicos de Preços
 */
export const ECONOMY_TIERS = {
  TIER_1_ACESSIVEL: { name: 'Tier 1 — Acessível', min: 250, max: 1500 },
  TIER_2_NORMAL: { name: 'Tier 2 — Normal', min: 1500, max: 5000 },
  TIER_3_RARO: { name: 'Tier 3 — Raro', min: 5000, max: 12500 },
  TIER_4_EPICO: { name: 'Tier 4 — Épico', min: 12500, max: 30000 },
  TIER_5_LENDARIO: { name: 'Tier 5 — Lendário', min: 30000, max: 75000 },
  TIER_6_MITICO: { name: 'Tier 6 — Mítico / Ultra-Premium', min: 75000, max: 150000 },
} as const

export type ConsumableCategory = 'ajuda_basica' | 'ajuda_media' | 'ajuda_forte' | 'ajuda_especial'

export interface ConsumableRule {
  id: string
  canonicalId: string
  name: string
  description: string
  price: number
  category: ConsumableCategory
  maxOwned: number
  dailyLimit: number
  consumableType: 'help5050' | 'publicVote' | 'freezeTime' | 'hint' | 'streakProtection'
  quantityGranted: number
  aliases: string[]
}

/**
 * Regras Server-Authoritative dos Consumíveis e Ajudas
 * Anti-Pay-to-Win: limites estritos de maxOwned e compras diárias
 */
export const CONSUMABLE_RULES: Record<string, ConsumableRule> = {
  consumable_pista: {
    id: 'consumable_pista',
    canonicalId: 'consumable_pista',
    name: 'Pista Histórica',
    description: 'Dica contextual inteligente para a pergunta atual.',
    price: 750,
    category: 'ajuda_basica',
    maxOwned: 3,
    dailyLimit: 3,
    consumableType: 'hint',
    quantityGranted: 1,
    aliases: ['pista_historica', 'ajuda_pista'],
  },
  consumable_50_50: {
    id: 'consumable_50_50',
    canonicalId: 'consumable_50_50',
    name: 'Ajuda 50/50',
    description: 'Elimina duas opções erradas instantaneamente.',
    price: 1800,
    category: 'ajuda_media',
    maxOwned: 3,
    dailyLimit: 2,
    consumableType: 'help5050',
    quantityGranted: 1,
    aliases: ['ajuda_5050', 'help_5050', 'help5050'],
  },
  consumable_congelar_tempo: {
    id: 'consumable_congelar_tempo',
    canonicalId: 'consumable_congelar_tempo',
    name: 'Congelar Tempo (+15s)',
    description: 'Pausa o cronómetro durante 15 segundos.',
    price: 4500,
    category: 'ajuda_forte',
    maxOwned: 2,
    dailyLimit: 1,
    consumableType: 'freezeTime',
    quantityGranted: 1,
    aliases: ['ajuda_congelar', 'congelar_tempo', 'freezeTime'],
  },
  HELP_005: {
    id: 'HELP_005',
    canonicalId: 'HELP_005',
    name: 'Pergunta ao Público',
    description: 'Votação simulada da plateia com percentagens.',
    price: 5000,
    category: 'ajuda_forte',
    maxOwned: 2,
    dailyLimit: 1,
    consumableType: 'publicVote',
    quantityGranted: 1,
    aliases: ['ajuda_publico', 'consumable_public_vote', 'publicVote'],
  },
  consumable_protecao_streak: {
    id: 'consumable_protecao_streak',
    canonicalId: 'consumable_protecao_streak',
    name: 'Proteção de Sequência',
    description: 'Salva a tua sequência de dias se esqueceres de jogar 24h.',
    price: 12500,
    category: 'ajuda_especial',
    maxOwned: 1,
    dailyLimit: 1,
    consumableType: 'streakProtection',
    quantityGranted: 1,
    aliases: ['protecao_streak', 'streak_protection'],
  },
}

/**
 * Procura a regra do consumível pelo ID ou alias
 */
export function getConsumableRule(itemId: string): ConsumableRule | undefined {
  if (!itemId) return undefined
  if (CONSUMABLE_RULES[itemId]) return CONSUMABLE_RULES[itemId]
  return Object.values(CONSUMABLE_RULES).find(
    (rule) => rule.canonicalId === itemId || rule.aliases.includes(itemId)
  )
}

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

