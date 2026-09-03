/**
 * Tabela Oficial de Configuração Económica do Acorda Portugal
 * Define os valores base para recompensas de partidas, nível, bónus e saldo inicial de registo.
 */

export const ECONOMY_CONFIG = {
  INITIAL_BONUS_COINS: 50, // Saldo inicial de boas-vindas ao criar conta (🪙 Moedas Acorda)

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
 * Tiers Económicos Canónicos de Preços Rebalanceados
 */
export const ECONOMY_TIERS = {
  TIER_1_COMUM: { name: 'Tier 1 — Comum', min: 100, max: 500 },
  TIER_2_RARO: { name: 'Tier 2 — Raro', min: 500, max: 1500 },
  TIER_3_EPICO: { name: 'Tier 3 — Épico', min: 1500, max: 4000 },
  TIER_4_LENDARIO: { name: 'Tier 4 — Lendário', min: 4000, max: 10000 },
  TIER_5_MITICO: { name: 'Tier 5 — Mítico', min: 10000, max: 25000 },
  TIER_6_EXCLUSIVO: { name: 'Tier 6 — Exclusivo / Prestígio', min: 25000, max: 100000 },
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
  consumableType: 'help5050' | 'publicVote' | 'freezeTime' | 'hint' | 'secondChance' | 'tripleElimination' | 'fastAnswer' | 'streakProtection'
  quantityGranted: number
  aliases: string[]
}

/**
 * Regras Server-Authoritative dos Consumíveis e Ajudas de Gameplay
 * Anti-Pay-to-Win: limites estritos de maxOwned (50 un.) e compras diárias
 */
export const CONSUMABLE_RULES: Record<string, ConsumableRule> = {
  AID_002: {
    id: 'AID_002',
    canonicalId: 'AID_002',
    name: 'Pack x5 Ajudas 50/50',
    description: 'Elimina exatamente duas alternativas erradas, deixando duas respostas possíveis.',
    price: 750,
    category: 'ajuda_media',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'help5050',
    quantityGranted: 5,
    aliases: ['aid_50_50', 'ajuda_5050', 'consumable_50_50', 'help_5050', 'help5050'],
  },
  AID_003: {
    id: 'AID_003',
    canonicalId: 'AID_003',
    name: 'Pack x3 Pergunta ao Público',
    description: 'Simula uma votação do público com percentagens realistas e tendência para a resposta correta.',
    price: 1500,
    category: 'ajuda_forte',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'publicVote',
    quantityGranted: 3,
    aliases: ['aid_public_vote', 'ajuda_publico', 'HELP_005', 'consumable_public_vote', 'publicVote'],
  },
  AID_004: {
    id: 'AID_004',
    canonicalId: 'AID_004',
    name: 'Pack x3 Congelar Tempo',
    description: 'Pausa o cronómetro e adiciona +15 segundos para responder com mais calma.',
    price: 900,
    category: 'ajuda_forte',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'freezeTime',
    quantityGranted: 3,
    aliases: ['aid_freeze_time', 'ajuda_congelar', 'consumable_congelar_tempo', 'freezeTime'],
  },
  // Regras legadas para retrocompatibilidade de inventário existente
  AID_001: {
    id: 'AID_001',
    canonicalId: 'AID_001',
    name: 'Pista Histórica',
    description: 'Dica contextual inteligente para a pergunta atual sem revelar a resposta.',
    price: 750,
    category: 'ajuda_basica',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'hint',
    quantityGranted: 1,
    aliases: ['aid_hint', 'pista_historica', 'ajuda_pista', 'consumable_pista', 'hint'],
  },
  AID_005: {
    id: 'AID_005',
    canonicalId: 'AID_005',
    name: 'Segunda Oportunidade',
    description: 'Permite uma segunda tentativa se errares uma pergunta.',
    price: 1250,
    category: 'ajuda_media',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'secondChance',
    quantityGranted: 1,
    aliases: ['aid_second_chance', 'segunda_chance', 'second_chance', 'consumable_second_chance'],
  },
  AID_006: {
    id: 'AID_006',
    canonicalId: 'AID_006',
    name: 'Eliminação Tripla',
    description: 'Remove três respostas erradas quando a pergunta tem 4 ou mais alternativas.',
    price: 1500,
    category: 'ajuda_forte',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'tripleElimination',
    quantityGranted: 1,
    aliases: ['aid_triple_elimination', 'eliminacao_tripla', 'triple_elimination', 'consumable_triple_elimination'],
  },
  AID_007: {
    id: 'AID_007',
    canonicalId: 'AID_007',
    name: 'Resposta Rápida',
    description: 'Concede uma pequena janela adicional de tempo (+5s) sem quebrar o streak.',
    price: 1000,
    category: 'ajuda_basica',
    maxOwned: 50,
    dailyLimit: 3,
    consumableType: 'fastAnswer',
    quantityGranted: 1,
    aliases: ['aid_fast_answer', 'resposta_rapida', 'fast_answer', 'consumable_fast_answer'],
  },
  AID_008: {
    id: 'AID_008',
    canonicalId: 'AID_008',
    name: 'Proteção de Sequência',
    description: 'Salva a tua sequência de dias se esqueceres de jogar 24h.',
    price: 2500,
    category: 'ajuda_especial',
    maxOwned: 10,
    dailyLimit: 3,
    consumableType: 'streakProtection',
    quantityGranted: 1,
    aliases: ['aid_streak_protection', 'protecao_streak', 'consumable_protecao_streak', 'streak_protection'],
  },
}

// Aliases para retrocompatibilidade completa com IDs legados
CONSUMABLE_RULES['aid_50_50'] = CONSUMABLE_RULES.AID_002
CONSUMABLE_RULES['consumable_50_50'] = CONSUMABLE_RULES.AID_002
CONSUMABLE_RULES['ajuda_5050'] = CONSUMABLE_RULES.AID_002
CONSUMABLE_RULES['help_5050'] = CONSUMABLE_RULES.AID_002
CONSUMABLE_RULES['help5050'] = CONSUMABLE_RULES.AID_002

CONSUMABLE_RULES['aid_public_vote'] = CONSUMABLE_RULES.AID_003
CONSUMABLE_RULES['HELP_005'] = CONSUMABLE_RULES.AID_003
CONSUMABLE_RULES['consumable_public_vote'] = CONSUMABLE_RULES.AID_003
CONSUMABLE_RULES['ajuda_publico'] = CONSUMABLE_RULES.AID_003
CONSUMABLE_RULES['publicVote'] = CONSUMABLE_RULES.AID_003

CONSUMABLE_RULES['aid_freeze_time'] = CONSUMABLE_RULES.AID_004
CONSUMABLE_RULES['consumable_congelar_tempo'] = CONSUMABLE_RULES.AID_004
CONSUMABLE_RULES['ajuda_congelar'] = CONSUMABLE_RULES.AID_004
CONSUMABLE_RULES['freezeTime'] = CONSUMABLE_RULES.AID_004

CONSUMABLE_RULES['aid_hint'] = CONSUMABLE_RULES.AID_001
CONSUMABLE_RULES['consumable_pista'] = CONSUMABLE_RULES.AID_001
CONSUMABLE_RULES['pista_historica'] = CONSUMABLE_RULES.AID_001
CONSUMABLE_RULES['aid_second_chance'] = CONSUMABLE_RULES.AID_005
CONSUMABLE_RULES['aid_triple_elimination'] = CONSUMABLE_RULES.AID_006
CONSUMABLE_RULES['aid_fast_answer'] = CONSUMABLE_RULES.AID_007
CONSUMABLE_RULES['aid_streak_protection'] = CONSUMABLE_RULES.AID_008
CONSUMABLE_RULES['consumable_protecao_streak'] = CONSUMABLE_RULES.AID_008

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
 * Calcula a recompensa oficial de 🪙 Moedas Acorda por partida terminada:
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
