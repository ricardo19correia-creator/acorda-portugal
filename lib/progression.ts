// Sistema oficial de progressão e níveis de longa duração do Acorda Portugal
// Mestre de Portugal (3.000.000 XP) é o topo absoluto

export type LevelTier = {
  level: number
  title: string
  cleanTitle: string
  xpRequired: number
  rewardPreview?: string
  isFinal?: boolean
  tierCategory: 'Iniciação' | 'Intermédio' | 'Avançado' | 'Elite' | 'Lendário'
}

export const PROGRESSION_LEVELS: LevelTier[] = [
  { level: 1, title: 'Curioso', cleanTitle: 'Curioso', xpRequired: 0, rewardPreview: 'Acesso às partidas básicas', tierCategory: 'Iniciação' },
  { level: 2, title: 'Aprendiz', cleanTitle: 'Aprendiz', xpRequired: 2500, rewardPreview: '+€100 Moeda Virtual', tierCategory: 'Iniciação' },
  { level: 3, title: 'Explorador', cleanTitle: 'Explorador', xpRequired: 7500, rewardPreview: 'Distintivo de Explorador', tierCategory: 'Iniciação' },
  { level: 4, title: 'Conhecedor', cleanTitle: 'Conhecedor', xpRequired: 15000, rewardPreview: '+€250 Moeda Virtual', tierCategory: 'Iniciação' },
  { level: 5, title: 'Iniciado', cleanTitle: 'Iniciado', xpRequired: 25000, rewardPreview: 'Moldura de Avatar', tierCategory: 'Iniciação' },
  { level: 6, title: 'Estudioso', cleanTitle: 'Estudioso', xpRequired: 40000, rewardPreview: '+€500 Moeda Virtual', tierCategory: 'Intermédio' },
  { level: 7, title: 'Adepto', cleanTitle: 'Adepto', xpRequired: 60000, rewardPreview: 'Título de Adepto no Perfil', tierCategory: 'Intermédio' },
  { level: 8, title: 'Competente', cleanTitle: 'Competente', xpRequired: 85000, rewardPreview: '+€750 Moeda Virtual', tierCategory: 'Intermédio' },
  { level: 9, title: 'Experiente', cleanTitle: 'Experiente', xpRequired: 115000, rewardPreview: 'Distintivo de Experiente', tierCategory: 'Intermédio' },
  { level: 10, title: 'Especialista', cleanTitle: 'Especialista', xpRequired: 150000, rewardPreview: 'Moldura Prateada de Jogador', tierCategory: 'Intermédio' },
  { level: 11, title: 'Veterano', cleanTitle: 'Veterano', xpRequired: 200000, rewardPreview: '+€1.000 Moeda Virtual', tierCategory: 'Avançado' },
  { level: 12, title: 'Mestre', cleanTitle: 'Mestre', xpRequired: 275000, rewardPreview: 'Título de Mestre Distrital', tierCategory: 'Avançado' },
  { level: 13, title: 'Grande Mestre', cleanTitle: 'Grande Mestre', xpRequired: 375000, rewardPreview: '+€1.500 Moeda Virtual', tierCategory: 'Avançado' },
  { level: 14, title: 'Lenda', cleanTitle: 'Lenda', xpRequired: 500000, rewardPreview: 'Moldura Dourada Brilhante', tierCategory: 'Avançado' },
  { level: 15, title: 'Sábio de Portugal', cleanTitle: 'Sábio de Portugal', xpRequired: 650000, rewardPreview: 'Distintivo de Sábio Nacional', tierCategory: 'Avançado' },
  { level: 16, title: 'Guardião do Conhecimento', cleanTitle: 'Guardião do Conhecimento', xpRequired: 825000, rewardPreview: '+€2.500 Moeda Virtual', tierCategory: 'Elite' },
  { level: 17, title: 'Elite Nacional', cleanTitle: 'Elite Nacional', xpRequired: 1050000, rewardPreview: 'Título de Elite Nacional', tierCategory: 'Elite' },
  { level: 18, title: 'Campeão de Portugal', cleanTitle: 'Campeão de Portugal', xpRequired: 1350000, rewardPreview: 'Moldura Rubina de Campeão', tierCategory: 'Elite' },
  { level: 19, title: 'Lenda Nacional', cleanTitle: 'Lenda Nacional', xpRequired: 1750000, rewardPreview: '+€5.000 Moeda Virtual', tierCategory: 'Elite' },
  { level: 20, title: 'Imortal', cleanTitle: 'Imortal', xpRequired: 2250000, rewardPreview: 'Distintivo de Imortal', tierCategory: 'Lendário' },
  { level: 21, title: '👑 Mestre de Portugal', cleanTitle: 'Mestre de Portugal', xpRequired: 3000000, isFinal: true, rewardPreview: 'Coroa Suprema de Portugal', tierCategory: 'Lendário' },
]

export type LevelProgressInfo = {
  currentLevel: LevelTier
  nextLevel: LevelTier | null
  currentXp: number
  currentLevelXp: number
  nextLevelXp: number | null
  xpIntoLevel: number
  xpNeededForLevel: number
  xpRemaining: number
  progressPercentage: number
  isMaxLevel: boolean
}

/**
 * Calcula o nível e o progresso exato baseado no XP acumulativo total
 */
export function calculateLevelProgress(xp: number): LevelProgressInfo {
  const safeXp = Math.max(0, typeof xp === 'number' && !isNaN(xp) ? xp : 0)

  // Determinar o nível mais alto alcançado
  let currentTierIndex = 0
  for (let i = PROGRESSION_LEVELS.length - 1; i >= 0; i--) {
    if (safeXp >= PROGRESSION_LEVELS[i].xpRequired) {
      currentTierIndex = i
      break
    }
  }

  const currentLevel = PROGRESSION_LEVELS[currentTierIndex]
  const nextLevel = currentTierIndex < PROGRESSION_LEVELS.length - 1 ? PROGRESSION_LEVELS[currentTierIndex + 1] : null
  const isMaxLevel = !nextLevel

  if (isMaxLevel) {
    return {
      currentLevel,
      nextLevel: null,
      currentXp: safeXp,
      currentLevelXp: currentLevel.xpRequired,
      nextLevelXp: null,
      xpIntoLevel: safeXp - currentLevel.xpRequired,
      xpNeededForLevel: 0,
      xpRemaining: 0,
      progressPercentage: 100,
      isMaxLevel: true,
    }
  }

  const currentLevelXp = currentLevel.xpRequired
  const nextLevelXp = nextLevel.xpRequired
  const xpNeededForLevel = nextLevelXp - currentLevelXp
  const xpIntoLevel = safeXp - currentLevelXp
  const xpRemaining = Math.max(0, nextLevelXp - safeXp)
  const progressPercentage = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForLevel) * 100))

  return {
    currentLevel,
    nextLevel,
    currentXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForLevel,
    xpRemaining,
    progressPercentage,
    isMaxLevel: false,
  }
}
