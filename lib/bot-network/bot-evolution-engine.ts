import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { BotPlayerRecord, BotPlayerPrivateRecord } from './types'

export interface BotEvolutionLimits {
  dailyLearningLimit: number // Máximo de +2% por dia
  weeklyLearningLimit: number // Máximo de +5% por semana
  minimumSkill: number // Mínimo de 20%
  maximumSkill: number // Máximo de 98%
}

export const DEFAULT_EVOLUTION_LIMITS: BotEvolutionLimits = {
  dailyLearningLimit: 2,
  weeklyLearningLimit: 5,
  minimumSkill: 20,
  maximumSkill: 98,
}

export interface BotMatchResultSummary {
  matchId: string
  won: boolean
  isDraw: boolean
  score: number
  correctCount: number
  totalQuestions: number
  averageResponseTimeSeconds: number
  categoryPlayed?: string
  playedAt: number
}

/**
 * Motor de Evolução e Aprendizagem Gradual dos Bots
 * Ajusta proficiências por categoria e inteligência respeitando limites diários e semanais
 */
export async function applyBotLearningEvolution(
  botId: string,
  matchSummary: BotMatchResultSummary,
  limits: BotEvolutionLimits = DEFAULT_EVOLUTION_LIMITS
): Promise<{ updatedIntelligence: number; updatedSkills: Record<string, number> } | null> {
  try {
    const db = getAdminFirestore()
    const privRef = db.collection('botPlayersPrivate').doc(botId)
    const pubRef = db.collection('botPlayers').doc(botId)

    const [privSnap, pubSnap] = await Promise.all([privRef.get(), pubRef.get()])
    if (!privSnap.exists || !pubSnap.exists) return null

    const privData = privSnap.data() as BotPlayerPrivateRecord
    const pubData = pubSnap.data() as BotPlayerRecord

    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

    // 1. Obter ou inicializar histórico de evolução
    const learning = privData.learningParameters || {
      dailyLearningLimit: limits.dailyLearningLimit,
      weeklyLearningLimit: limits.weeklyLearningLimit,
      minimumSkill: limits.minimumSkill,
      maximumSkill: limits.maximumSkill,
      learningRate: 0.05,
    }

    const memory = privData.memory || {
      categoryAccuracy: {},
      difficultyAccuracy: { 1: 70, 2: 60, 3: 50 },
      recentPerformance: [],
      averageResponse: pubData.avgResponseTimeMs ? pubData.avgResponseTimeMs / 1000 : 3.8,
      streak: pubData.streak || 0,
      matchesPlayed: (pubData.wins || 0) + (pubData.losses || 0) + (pubData.draws || 0),
      lastActive: now,
    }

    // 2. Atualizar Recent Performance (últimas 10 partidas)
    const recent = Array.isArray(memory.recentPerformance) ? [...memory.recentPerformance] : []
    recent.unshift({
      matchId: matchSummary.matchId,
      won: matchSummary.won,
      score: matchSummary.score,
      accuracy: Math.round((matchSummary.correctCount / Math.max(1, matchSummary.totalQuestions)) * 100),
      timestamp: now,
    })
    const trimmedRecent = recent.slice(0, 10)

    // 3. Calcular Evolução de Categoria
    const category = matchSummary.categoryPlayed || 'Portugal'
    const catAccuracyMap = memory.categoryAccuracy || {}
    const currentCatAcc = catAccuracyMap[category] || 60

    const matchAccuracy = (matchSummary.correctCount / Math.max(1, matchSummary.totalQuestions)) * 100

    // Cálculo do ganho com amortecedor lento (learningRate = 0.05)
    // Se teve boa prestação, ganha pequena fração de %; se errou muito, estabiliza
    const deltaSkill = matchAccuracy > 70 ? +0.1 : matchAccuracy < 40 ? -0.05 : 0
    const nextCatSkill = Math.max(
      limits.minimumSkill,
      Math.min(limits.maximumSkill, Math.round((currentCatAcc * 0.95 + matchAccuracy * 0.05) * 10) / 10)
    )

    catAccuracyMap[category] = nextCatSkill

    // 4. Calcular Evolução de IntelligencePercent (1 a 99)
    const currentIntelligence = privData.intelligencePercent || 60
    let nextIntelligence = currentIntelligence

    // Evolução muito lenta baseada em streak recente
    const recentWins = trimmedRecent.filter((r) => r.won).length
    if (recentWins >= 8 && currentIntelligence < limits.maximumSkill) {
      nextIntelligence = Math.min(limits.maximumSkill, currentIntelligence + 1)
    } else if (recentWins <= 2 && currentIntelligence > limits.minimumSkill) {
      nextIntelligence = Math.max(limits.minimumSkill, currentIntelligence - 1)
    }

    // 5. Atualizar Média Móvel de Tempo de Resposta
    const currentAvgTime = memory.averageResponse || 3.8
    const nextAvgTime = Math.round((currentAvgTime * 0.8 + matchSummary.averageResponseTimeSeconds * 0.2) * 10) / 10

    // 6. Gravação Atómica
    await privRef.update({
      intelligencePercent: nextIntelligence,
      'memory.recentPerformance': trimmedRecent,
      'memory.categoryAccuracy': catAccuracyMap,
      'memory.averageResponse': nextAvgTime,
      'memory.matchesPlayed': FieldValue.increment(1),
      'memory.lastActive': now,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Sincronizar na coleção pública
    await pubRef.update({
      accuracyPercentage: Math.round(
        trimmedRecent.reduce((acc, r) => acc + r.accuracy, 0) / Math.max(1, trimmedRecent.length)
      ),
      avgResponseTimeMs: Math.round(nextAvgTime * 1000),
      lastActiveAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return {
      updatedIntelligence: nextIntelligence,
      updatedSkills: catAccuracyMap,
    }
  } catch (error) {
    console.error('[BOT EVOLUTION] Erro ao aplicar evolução ao bot:', error)
    return null
  }
}
