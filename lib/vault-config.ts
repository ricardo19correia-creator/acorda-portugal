/**
 * 🇵🇹 ACORDA PORTUGAL — CONFIGURAÇÃO CENTRALIZADA DO COFRE DIÁRIO (SSOT)
 * 
 * Regras Canónicas:
 * 1. 24 horas rolling estritas entre aberturas (86.400.000 ms).
 * 2. Janela de graça de 48 horas (172.800.000 ms) para continuidade de streak.
 * 3. Apenas recompensas oficiais suportadas pelo jogo:
 *    - Moedas/Acordas: 50, 100, 250, 500
 *    - Ajudas: 50/50 (AID_002), Congelar 15s (AID_004), Ajuda do Público (AID_003)
 * 4. 7.º Dia com recompensa especial de prestígio.
 */

export const VAULT_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 horas = 86.400.000 ms
export const VAULT_STREAK_GRACE_PERIOD_MS = 48 * 60 * 60 * 1000 // 48 horas = 172.800.000 ms

export type VaultRewardKey =
  | '50_ACORDAS'
  | '100_ACORDAS'
  | '250_ACORDAS'
  | '500_ACORDAS'
  | 'HELP_5050'
  | 'HELP_FREEZE_15'
  | 'HELP_AUDIENCE'

export interface VaultRewardConfig {
  id: VaultRewardKey
  type: 'acordas' | 'aid'
  label: string
  shortLabel: string
  amount: number
  aidId?: 'AID_002' | 'AID_003' | 'AID_004'
  weight: number
  day7Weight: number
  icon: string
  description: string
}

export const OFFICIAL_VAULT_REWARDS: VaultRewardConfig[] = [
  {
    id: '100_ACORDAS',
    type: 'acordas',
    label: '+100 Acordas',
    shortLabel: '100 Acordas',
    amount: 100,
    weight: 30, // 30%
    day7Weight: 0,
    icon: '🪙',
    description: '100 Acordas adicionadas à tua carteira.',
  },
  {
    id: '50_ACORDAS',
    type: 'acordas',
    label: '+50 Acordas',
    shortLabel: '50 Acordas',
    amount: 50,
    weight: 25, // 25%
    day7Weight: 0,
    icon: '🪙',
    description: '50 Acordas adicionadas à tua carteira.',
  },
  {
    id: '250_ACORDAS',
    type: 'acordas',
    label: '+250 Acordas',
    shortLabel: '250 Acordas',
    amount: 250,
    weight: 15, // 15%
    day7Weight: 35, // 35% no dia 7
    icon: '💰',
    description: '250 Acordas de bónus adicionadas à tua carteira.',
  },
  {
    id: 'HELP_5050',
    type: 'aid',
    label: '50/50 × 1',
    shortLabel: '50/50',
    amount: 1,
    aidId: 'AID_002',
    weight: 10, // 10%
    day7Weight: 15,
    icon: '🎯',
    description: 'Elimina 2 respostas erradas numa pergunta difícil.',
  },
  {
    id: 'HELP_FREEZE_15',
    type: 'aid',
    label: 'Congelar o Tempo (15s) × 1',
    shortLabel: 'Congelar 15s',
    amount: 1,
    aidId: 'AID_004',
    weight: 10, // 10%
    day7Weight: 15,
    icon: '❄️',
    description: 'Pausa o cronómetro por 15 segundos para responderes com calma.',
  },
  {
    id: 'HELP_AUDIENCE',
    type: 'aid',
    label: 'Ajuda do Público × 1',
    shortLabel: 'Ajuda do Público',
    amount: 1,
    aidId: 'AID_003',
    weight: 5, // 5%
    day7Weight: 15,
    icon: '👥',
    description: 'Consulta a percentagem de votos do público português.',
  },
  {
    id: '500_ACORDAS',
    type: 'acordas',
    label: '+500 Acordas',
    shortLabel: '500 Acordas',
    amount: 500,
    weight: 5, // 5%
    day7Weight: 20, // 20% no dia 7
    icon: '👑',
    description: 'Grande prémio de 500 Acordas adicionadas à tua carteira.',
  },
]

/**
 * Seleciona autoritativamente uma recompensa no servidor com base nos pesos configurados.
 * No 7.º dia (e múltiplos de 7), são aplicados os pesos especiais de prestígio.
 */
export function selectVaultReward(
  streak: number,
  customRewards: VaultRewardConfig[] = OFFICIAL_VAULT_REWARDS
): VaultRewardConfig {
  const isDay7 = streak > 0 && streak % 7 === 0
  const pool = customRewards.filter((r) => (isDay7 ? r.day7Weight > 0 : r.weight > 0))
  const totalWeight = pool.reduce((acc, r) => acc + (isDay7 ? r.day7Weight : r.weight), 0)

  if (totalWeight <= 0) {
    return OFFICIAL_VAULT_REWARDS[0]
  }

  let randomVal = Math.random() * totalWeight
  for (const reward of pool) {
    const weight = isDay7 ? reward.day7Weight : reward.weight
    if (randomVal < weight) {
      return reward
    }
    randomVal -= weight
  }

  return pool[pool.length - 1]
}

export interface VaultStreakCalculation {
  canClaim: boolean
  cooldownRemainingMs: number
  nextAvailableAt: number
  newStreak: number
  newBestStreak: number
  streakBroken: boolean
  isDay7Special: boolean
}

/**
 * Calcula o streak e disponibilidade com base no timestamp estrito do servidor.
 */
export function calculateVaultStreak(
  lastOpenedAt: number | null | undefined,
  nowMs: number,
  currentStreak = 0,
  bestStreak = 0
): VaultStreakCalculation {
  if (!lastOpenedAt || typeof lastOpenedAt !== 'number' || isNaN(lastOpenedAt)) {
    return {
      canClaim: true,
      cooldownRemainingMs: 0,
      nextAvailableAt: nowMs,
      newStreak: 1,
      newBestStreak: Math.max(1, bestStreak),
      streakBroken: false,
      isDay7Special: false,
    }
  }

  const elapsedMs = nowMs - lastOpenedAt
  const remainingMs = Math.max(0, VAULT_COOLDOWN_MS - elapsedMs)

  if (remainingMs > 0) {
    return {
      canClaim: false,
      cooldownRemainingMs: remainingMs,
      nextAvailableAt: lastOpenedAt + VAULT_COOLDOWN_MS,
      newStreak: currentStreak,
      newBestStreak: bestStreak,
      streakBroken: false,
      isDay7Special: false,
    }
  }

  // O cooldown de 24h já passou. Verificar continuidade:
  // Se o jogador voltou antes de 48h desde a última abertura: streak continua
  // Se passaram mais de 48h (mais de 24h após o cofre ficar disponível): streak quebrou e reinicia a 1
  let nextStreak = 1
  let streakBroken = false

  if (elapsedMs <= VAULT_STREAK_GRACE_PERIOD_MS) {
    nextStreak = (currentStreak || 0) + 1
  } else {
    nextStreak = 1
    streakBroken = true
  }

  const updatedBest = Math.max(bestStreak || 0, nextStreak)
  const isDay7Special = nextStreak > 0 && nextStreak % 7 === 0

  return {
    canClaim: true,
    cooldownRemainingMs: 0,
    nextAvailableAt: nowMs,
    newStreak: nextStreak,
    newBestStreak: updatedBest,
    streakBroken,
    isDay7Special,
  }
}
